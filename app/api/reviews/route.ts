import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId, rating, comment } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: "Este pedido ya tiene una reseña" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId: order.customerId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
