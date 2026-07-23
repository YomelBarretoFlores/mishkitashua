import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { buildIndicatorReport } from "@/app/lib/kpi";

// Reporte de ventas de un mes concreto (param month=YYYY-MM, por defecto el actual).
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // "2026-06"

    const now = new Date();
    const [year, month] = monthParam
      ? monthParam.split("-").map(Number)
      : [now.getFullYear(), now.getMonth() + 1];

    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0); // primer día del mes siguiente

    const where = { createdAt: { gte: start, lt: end } };

    const [orders, revenue, discountSum, monthItems, reviews, newCustomers] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({ where, _sum: { total: true } }),
        prisma.order.aggregate({ where, _sum: { discount: true } }),
        prisma.orderItem.findMany({
          where: { order: { is: where } },
          select: { productName: true, quantity: true, price: true },
        }),
        prisma.review.aggregate({
          where,
          _avg: { rating: true },
          _count: true,
        }),
        prisma.customer.count({ where }),
      ]);

    const totalRevenue = revenue._sum.total || 0;
    const avgTicket = orders > 0 ? totalRevenue / orders : 0;

    // Top productos del mes (cantidad + ingreso real = precio × cantidad).
    const byProduct = new Map<string, { quantity: number; revenue: number }>();
    for (const item of monthItems) {
      const cur = byProduct.get(item.productName) ?? { quantity: 0, revenue: 0 };
      cur.quantity += item.quantity;
      cur.revenue += item.price * item.quantity;
      byProduct.set(item.productName, cur);
    }
    const topProducts = Array.from(byProduct.entries())
      .map(([productName, v]) => ({ productName, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Meses con actividad (para el selector): una fila por mes vía date_trunc.
    const monthRows = await prisma.$queryRaw<{ month: string }[]>`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month
      FROM "Order"
      GROUP BY 1
      ORDER BY 1 DESC
    `;
    const months = monthRows.map((r) => r.month);

    // Indicadores logísticos y de servicio del mismo periodo, cada uno con su
    // fórmula, su fuente y su meta.
    const periodLabel = start.toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric",
      timeZone: "America/Lima",
    });
    const indicators = await buildIndicatorReport(start, end, periodLabel);

    return NextResponse.json({
      month: `${year}-${String(month).padStart(2, "0")}`,
      months,
      totalOrders: orders,
      totalRevenue,
      totalDiscount: discountSum._sum.discount || 0,
      avgTicket,
      newCustomers,
      reviewAvg: reviews._avg.rating || 0,
      reviewCount: reviews._count,
      topProducts,
      indicators,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}
