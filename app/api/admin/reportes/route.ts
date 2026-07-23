import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { buildIndicatorReport } from "@/app/lib/kpi";

// Reporte de ventas. Por defecto el mes en curso (month=YYYY-MM), o un rango
// libre si llegan from/to (YYYY-MM-DD), para poder mirar una semana concreta o
// una campaña sin depender del corte mensual.
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // "2026-06"
    const fromParam = searchParams.get("from"); // "2026-06-01"
    const toParam = searchParams.get("to");

    const now = new Date();
    let start: Date;
    let end: Date;
    let periodLabel: string;
    let usingRange = false;

    if (fromParam || toParam) {
      usingRange = true;
      // Un extremo vacío deja el rango abierto por ese lado.
      start = fromParam ? new Date(`${fromParam}T00:00:00`) : new Date(2000, 0, 1);
      // "to" es inclusivo para quien lo lee, así que se avanza un día.
      end = toParam
        ? new Date(new Date(`${toParam}T00:00:00`).getTime() + 86_400_000)
        : new Date(now.getTime() + 86_400_000);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
      }
      if (start >= end) {
        return NextResponse.json(
          { error: "La fecha inicial debe ser anterior a la final" },
          { status: 400 }
        );
      }
      const fmt = (d: Date) =>
        d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
      periodLabel = `${fromParam ? fmt(start) : "el inicio"} — ${
        toParam ? fmt(new Date(end.getTime() - 86_400_000)) : "hoy"
      }`;
    } else {
      const [year, month] = monthParam
        ? monthParam.split("-").map(Number)
        : [now.getFullYear(), now.getMonth() + 1];
      start = new Date(year, month - 1, 1, 0, 0, 0);
      end = new Date(year, month, 1, 0, 0, 0); // primer día del mes siguiente
      periodLabel = start.toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric",
      });
    }

    const where = { createdAt: { gte: start, lt: end } };

    const [
      orders,
      revenue,
      discountSum,
      monthItems,
      reviews,
      newCustomers,
      returns,
      refunded,
    ] = await Promise.all([
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
        // Devoluciones solicitadas en el periodo, con su estado.
        prisma.return.findMany({
          where: { createdAt: { gte: start, lt: end } },
          select: { status: true, refundAmount: true },
        }),
        // Dinero efectivamente devuelto en el periodo.
        prisma.return.aggregate({
          where: { createdAt: { gte: start, lt: end }, status: "reembolsada" },
          _sum: { refundAmount: true },
        }),
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
    const indicators = await buildIndicatorReport(start, end, periodLabel);

    return NextResponse.json({
      // Mes al que pertenece el inicio del periodo: mantiene sincronizado el
      // selector de meses aunque se esté mirando un rango libre.
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
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
      period: {
        label: periodLabel,
        from: start.toISOString(),
        to: end.toISOString(),
        usingRange,
      },
      returns: {
        total: returns.length,
        pendientes: returns.filter((r) => r.status === "solicitada").length,
        aprobadas: returns.filter((r) => r.status === "aprobada").length,
        rechazadas: returns.filter((r) => r.status === "rechazada").length,
        reembolsadas: returns.filter((r) => r.status === "reembolsada").length,
        montoReembolsado: refunded._sum.refundAmount || 0,
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}
