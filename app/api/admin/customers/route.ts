import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true } },
      },
    });

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      city: c.city,
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
      createdAt: c.createdAt,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}
