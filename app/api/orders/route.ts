import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getProductBySlug } from "@/app/lib/products";
import { applyPromotions, type Promotion } from "@/app/lib/promotions";

const SHIPPING_COST = 12.0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type IncomingItem = {
  slug: string;
  quantity: number;
  customization?: Record<string, number> | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, paymentMethod } = body as {
      customer: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
      };
      items: IncomingItem[];
      paymentMethod?: string;
    };

    // --- Validación de datos del cliente ---
    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim() ||
      !customer.city?.trim()
    ) {
      return NextResponse.json(
        { error: "Faltan datos del cliente" },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(customer.email)) {
      return NextResponse.json(
        { error: "Correo electrónico inválido" },
        { status: 400 }
      );
    }
    if (paymentMethod !== "card" && paymentMethod !== "transfer") {
      return NextResponse.json(
        { error: "Método de pago inválido" },
        { status: 400 }
      );
    }

    // --- Validación de items + recálculo de precios en el servidor ---
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const resolved = [];
    for (const item of items) {
      const product = getProductBySlug(item.slug);
      if (!product) {
        return NextResponse.json(
          { error: `Producto no válido: ${item.slug}` },
          { status: 400 }
        );
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json(
          { error: `Cantidad no válida para ${product.name}` },
          { status: 400 }
        );
      }
      resolved.push({ product, quantity, customization: item.customization });
    }

    // --- Promociones activas (servidor) ---
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

    const shippingCost = pricing.freeShipping ? 0 : SHIPPING_COST;
    const total =
      Math.round((pricing.subtotal - pricing.discount + shippingCost) * 100) /
      100;

    const orderNumber = `MSK-${Date.now().toString(36).toUpperCase()}`;

    const existingCustomer = await prisma.customer.findFirst({
      where: { email: customer.email },
    });

    const customerId = existingCustomer
      ? existingCustomer.id
      : (
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        giftDescription: pricing.gift,
        shippingCost,
        total,
        paymentMethod,
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
      include: { items: true },
    });

    await prisma.analyticsEvent.create({
      data: {
        type: "purchase",
        sessionId: body.sessionId || "server",
        metadata: JSON.stringify({
          orderId: order.id,
          total,
          discount: pricing.discount,
          itemCount: resolved.length,
        }),
      },
    });

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Error al crear el pedido" },
      { status: 500 }
    );
  }
}
