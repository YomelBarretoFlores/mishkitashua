import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      items: true,
      customer: true,
      review: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}
