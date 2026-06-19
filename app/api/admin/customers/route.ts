import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Sin cargar las filas de pedidos: agregamos conteo y suma por cliente en la BD.
    const [customers, grouped] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, city: true, createdAt: true },
      }),
      prisma.order.groupBy({
        by: ["customerId"],
        _count: true,
        _sum: { total: true },
      }),
    ]);

    const stats = new Map(
      grouped.map((g) => [
        g.customerId,
        { totalOrders: g._count, totalSpent: g._sum.total ?? 0 },
      ])
    );

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      city: c.city,
      totalOrders: stats.get(c.id)?.totalOrders ?? 0,
      totalSpent: stats.get(c.id)?.totalSpent ?? 0,
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
