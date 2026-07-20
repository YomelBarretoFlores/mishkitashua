import { randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getProductBySlug, type Product } from "@/app/lib/products";
import {
  applyPromotions,
  type Promotion,
  type AppliedPromotions,
} from "@/app/lib/promotions";
import { checkCoupon, redeemCoupon } from "@/app/lib/coupons";
import { linkClerkUserToCustomer } from "@/app/lib/customers";
import { getSiteSettings } from "@/app/lib/settings";
import { sendEmail } from "@/app/lib/resend";
import { orderConfirmationEmail } from "@/app/lib/emails/templates";

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
  coupon: { code: string; label: string; amount: number } | null;
};

type Fail = { ok: false; status: number; error: string };

// Valida los items y recalcula el precio en el SERVIDOR (fuente de verdad).
export async function priceCheckout(
  items: CheckoutItem[],
  opts?: { freeShipping?: boolean; couponCode?: string | null; customerId?: string | null }
): Promise<({ ok: true } & Priced) | Fail> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: "El carrito está vacío" };
  }

  const resolved: Priced["resolved"] = [];
  for (const item of items) {
    // getProductBySlug ya excluye archivados: un producto retirado no se puede
    // comprar, pero los OrderItem de pedidos pasados (snapshots) no se tocan.
    const product = await getProductBySlug(item.slug);
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

  // El cupón se valida contra la base, nunca se confía en lo que llega del
  // navegador. Si no es válido el pedido se rechaza, en vez de cobrar de más
  // en silencio a quien creía tener descuento.
  let coupon: Priced["coupon"] = null;
  let couponFreeShipping = false;
  let couponDiscount = 0;
  if (opts?.couponCode) {
    const check = await checkCoupon(opts.couponCode, opts.customerId ?? null);
    if (!check.ok) return { ok: false, status: 400, error: check.error };
    if (check.type === "free_shipping") {
      couponFreeShipping = true;
    } else {
      // Se calcula sobre lo que queda tras las promociones, no sobre el
      // subtotal: si no, dos descuentos podrían superar el precio real.
      const base = pricing.subtotal - pricing.discount;
      couponDiscount = Math.round(((base * check.value) / 100) * 100) / 100;
    }
    coupon = { code: check.code, label: check.label, amount: couponDiscount };
  }

  // Costo de envío y umbral de envío gratis vienen de la configuración editable
  // del sitio (con defaults si no está seteada).
  const settings = await getSiteSettings();
  const discount = Math.min(pricing.discount + couponDiscount, pricing.subtotal);
  const netSubtotal = pricing.subtotal - discount;

  // Envío gratis si: promoción, cupón, primera compra, o se alcanza el umbral.
  const freeShipping =
    pricing.freeShipping ||
    couponFreeShipping ||
    !!opts?.freeShipping ||
    (settings.freeShippingThreshold != null &&
      netSubtotal >= settings.freeShippingThreshold);
  const shippingCost = freeShipping ? 0 : settings.shippingCost;
  const total = Math.round((netSubtotal + shippingCost) * 100) / 100;

  return {
    ok: true,
    resolved,
    pricing: { ...pricing, discount, freeShipping },
    shippingCost,
    total,
    coupon,
  };
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
//
// `actor` existe para el webhook de Mercado Pago, que corre sin sesión: le
// permite decir de parte de QUIÉN crea el pedido y si tocaba envío gratis de
// bienvenida. Sin esto, el pedido salía distinto según lo creara la web (con
// sesión) o el webhook (sin ella), cobrando un total y guardando otro.
export async function createOrderFromCheckout(input: {
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  paymentMethod: string;
  sessionId?: string;
  payment?: PaymentMeta;
  couponCode?: string | null;
  actor?: { clerkUserId: string | null; firstPurchase: boolean };
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

  // Aleatorio, no derivado del reloj: el número viaja por correo y por la URL
  // de seguimiento (que es pública), así que si fuera un timestamp se podrían
  // adivinar los pedidos de los demás probando milisegundos. De paso evita que
  // dos compras en el mismo instante choquen contra el @unique.
  const orderNumber = `MSK-${randomBytes(4).toString("hex").toUpperCase()}`;

  // Resolver el cliente ANTES de precios, para saber si es su primera compra.
  // El actor explícito manda sobre la sesión: es el caso del webhook.
  const userId = input.actor
    ? input.actor.clerkUserId
    : (await auth()).userId;
  let customerId: string;
  if (userId) {
    const linked = await linkClerkUserToCustomer({
      clerkUserId: userId,
      email: customer.email,
      name: customer.name,
      extra: {
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
  // Si el actor ya lo decidió al cobrar, se respeta esa decisión — recalcularlo
  // aquí daría "false" en el webhook y añadiría un envío no cobrado.
  const firstPurchase = input.actor
    ? input.actor.firstPurchase
    : !!userId &&
      (await prisma.order.count({ where: { customerId } })) === 0;

  const priced = await priceCheckout(input.items, {
    freeShipping: firstPurchase,
    couponCode: input.couponCode,
    customerId,
  });
  if (!priced.ok) return priced;
  const { resolved, pricing, shippingCost, total, coupon } = priced;

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
      couponCode: coupon?.code ?? null,
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

  // El cupón se marca usado al crear el pedido, no antes: si algo fallara en
  // la creación, el cliente se quedaría sin cupón y sin compra.
  if (coupon) {
    const redeemed = await redeemCoupon(coupon.code, customerId, order.id);
    if (!redeemed) {
      // Alguien lo canjeó entre la validación y ahora (doble pestaña).
      console.error(`[orders] cupón ${coupon.code} ya estaba usado en ${order.id}`);
    }
  }

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
  const paymentLabel =
    input.paymentMethod === "card"
      ? "Tarjeta"
      : input.paymentMethod === "transfer"
        ? "Transferencia"
        : "Mercado Pago";
  const confirmationEmail = orderConfirmationEmail({
    orderNumber: order.orderNumber,
    items: resolved.map((r) => ({
      productName: r.product.name,
      quantity: r.quantity,
      price: r.product.price,
    })),
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    couponDiscount: coupon?.amount ?? 0,
    shippingCost,
    total,
    paymentMethod: paymentLabel,
    couponCode: coupon?.code ?? null,
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
