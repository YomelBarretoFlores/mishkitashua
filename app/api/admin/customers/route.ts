import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    // Sin cargar las filas de pedidos: agregamos conteo y suma por cliente en la BD.
    const [customers, grouped] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          createdAt: true,
          // Distingue a quien creó una cuenta de quien compró como invitado.
          clerkUserId: true,
          birthdate: true,
        },
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
      // El id de Clerk no se expone: solo si tiene cuenta o compró como invitado.
      hasAccount: c.clerkUserId !== null,
      birthdate: c.birthdate,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}
