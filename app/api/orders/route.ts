import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, paymentMethod, subtotal, shippingCost, total } =
      body;

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
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        items: {
          create: items.map(
            (item: {
              slug: string;
              name: string;
              quantity: number;
              price: number;
              image: string;
            }) => ({
              productSlug: item.slug,
              productName: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })
          ),
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
          itemCount: items.length,
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
