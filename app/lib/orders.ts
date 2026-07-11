import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getProductBySlug, type Product } from "@/app/lib/products";
import {
  applyPromotions,
  type Promotion,
  type AppliedPromotions,
} from "@/app/lib/promotions";
import { sendEmail } from "@/app/lib/resend";
import { orderConfirmationEmail } from "@/app/lib/emails/templates";

export const SHIPPING_COST = 12.0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutItem = {
  slug: string;
  quantity: number;
  customization?: Record<string, number> | null;
};

export type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
};

export type PaymentMeta = {
  chargeId?: string;
  cardBrand?: string;
  cardLast4?: string;
  paymentStatus?: string;
};

type Priced = {
  resolved: { product: Product; quantity: number; customization?: Record<string, number> | null }[];
  pricing: AppliedPromotions;
  shippingCost: number;
  total: number;
};

type Fail = { ok: false; status: number; error: string };

// Valida los items y recalcula el precio en el SERVIDOR (fuente de verdad).
export async function priceCheckout(
  items: CheckoutItem[],
  opts?: { freeShipping?: boolean }
): Promise<({ ok: true } & Priced) | Fail> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: "El carrito está vacío" };
  }

  const resolved: Priced["resolved"] = [];
  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) {
      return { ok: false, status: 400, error: `Producto no válido: ${item.slug}` };
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return {
        ok: false,
        status: 400,
        error: `Cantidad no válida para ${product.name}`,
      };
    }
    resolved.push({ product, quantity, customization: item.customization });
  }

  const now = new Date();
  const promotions = (await prisma.promotion.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
  })) as unknown as Promotion[];

  const pricing = applyPromotions(
    resolved.map((r) => ({
      slug: r.product.slug,
      price: r.product.price,
      quantity: r.quantity,
    })),
    promotions,
    now
  );

  // Envío gratis si: lo da una promoción, o es primera compra (opts.freeShipping).
  const freeShipping = pricing.freeShipping || !!opts?.freeShipping;
  const shippingCost = freeShipping ? 0 : SHIPPING_COST;
  const total =
    Math.round((pricing.subtotal - pricing.discount + shippingCost) * 100) / 100;

  return { ok: true, resolved, pricing: { ...pricing, freeShipping }, shippingCost, total };
}

// ¿El usuario autenticado no tiene pedidos aún? (para el envío gratis de bienvenida).
// Los invitados (sin userId) no califican: no se puede verificar su historial.
export async function isFirstPurchaseForUser(
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false;
  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!customer) return true; // sin registro → sin pedidos → primera compra
  const count = await prisma.order.count({ where: { customerId: customer.id } });
  return count === 0;
}

// Crea el pedido (cliente ligado a la sesión si existe; si no, invitado).
export async function createOrderFromCheckout(input: {
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  paymentMethod: string;
  sessionId?: string;
  payment?: PaymentMeta;
}): Promise<
  { ok: true; id: string; orderNumber: string; total: number } | Fail
> {
  const { customer } = input;

  if (
    !customer ||
    !customer.name?.trim() ||
    !customer.email?.trim() ||
    !customer.phone?.trim() ||
    !customer.address?.trim() ||
    !customer.city?.trim()
  ) {
    return { ok: false, status: 400, error: "Faltan datos del cliente" };
  }
  if (!EMAIL_RE.test(customer.email)) {
    return { ok: false, status: 400, error: "Correo electrónico inválido" };
  }

  const orderNumber = `MSK-${Date.now().toString(36).toUpperCase()}`;

  // Resolver el cliente ANTES de precios, para saber si es su primera compra.
  const { userId } = await auth();
  let customerId: string;
  if (userId) {
    const linked = await prisma.customer.upsert({
      where: { clerkUserId: userId },
      update: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      },
      create: {
        clerkUserId: userId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      },
    });
    customerId = linked.id;
  } else {
    const existing = await prisma.customer.findFirst({
      where: { email: customer.email },
    });
    customerId =
      existing?.id ??
      (
        await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
          },
        })
      ).id;
  }

  // Envío gratis de bienvenida: solo usuarios logueados sin pedidos previos.
  const priorOrders = await prisma.order.count({ where: { customerId } });
  const firstPurchase = !!userId && priorOrders === 0;

  const priced = await priceCheckout(input.items, { freeShipping: firstPurchase });
  if (!priced.ok) return priced;
  const { resolved, pricing, shippingCost, total } = priced;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      giftDescription: pricing.gift,
      shippingCost,
      total,
      paymentMethod: input.paymentMethod,
      chargeId: input.payment?.chargeId ?? null,
      cardBrand: input.payment?.cardBrand ?? null,
      cardLast4: input.payment?.cardLast4 ?? null,
      paymentStatus: input.payment?.paymentStatus ?? "pagado",
      items: {
        create: resolved.map((r) => ({
          productSlug: r.product.slug,
          productName: r.product.name,
          quantity: r.quantity,
          price: r.product.price,
          image: r.product.image,
          customization: r.customization
            ? JSON.stringify(r.customization)
            : null,
        })),
      },
    },
  });

  // Analítica de compra: en segundo plano (no bloquea el redirect a la confirmación).
  const analyticsPayload = {
    orderId: order.id,
    total,
    discount: pricing.discount,
    itemCount: resolved.length,
  };
  const analyticsSession = input.sessionId || "server";
  after(async () => {
    try {
      await prisma.analyticsEvent.create({
        data: {
          type: "purchase",
          sessionId: analyticsSession,
          metadata: JSON.stringify(analyticsPayload),
        },
      });
    } catch (err) {
      console.error("[orders] analytics purchase failed:", err);
    }
  });

  // Correo de confirmación: se envía DESPUÉS de responder (no bloquea el
  // checkout). Así el redirect a la confirmación es inmediato.
  const confirmationEmail = orderConfirmationEmail({
    orderNumber: order.orderNumber,
    total,
    items: resolved.map((r) => ({
      productName: r.product.name,
      quantity: r.quantity,
    })),
  });
  const recipient = customer.email;
  after(async () => {
    try {
      await sendEmail({ to: recipient, ...confirmationEmail });
    } catch (err) {
      console.error("[orders] confirmation email failed:", err);
    }
  });

  return { ok: true, id: order.id, orderNumber: order.orderNumber, total };
}
