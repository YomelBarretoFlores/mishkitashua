import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { soloReales, dePedidoReal } from "@/app/lib/demo-data";

// Cifras de negocio: solo datos reales. Los pedidos de demostración existen
// para que los indicadores logísticos tengan histórico, no para inflar las
// ventas del panel (llegaron a mostrar S/ 4241.50 cuando lo real era S/ 604.50).
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const [
      orders,
      totalRevenue,
      ordersByStatus,
      topProducts,
      reviews,
      pageViews,
      addToCarts,
      checkoutStarts,
      purchases,
      recentOrders,
      customerCount,
    ] = await Promise.all([
      prisma.order.count({ where: soloReales }),
      prisma.order.aggregate({ where: soloReales, _sum: { total: true } }),
      prisma.order.groupBy({
        by: ["status"],
        where: soloReales,
        _count: true,
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: dePedidoReal,
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.review.aggregate({
        where: dePedidoReal,
        _avg: { rating: true },
        _count: true,
      }),
      prisma.analyticsEvent.count({ where: { type: "page_view" } }),
      prisma.analyticsEvent.count({ where: { type: "add_to_cart" } }),
      prisma.analyticsEvent.count({ where: { type: "checkout_start" } }),
      prisma.analyticsEvent.count({ where: { type: "purchase" } }),
      prisma.order.findMany({
        where: soloReales,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      }),
      prisma.customer.count({ where: soloReales }),
    ]);

    const avgTicket = orders > 0 ? (totalRevenue._sum.total || 0) / orders : 0;
    const conversionRate =
      pageViews > 0 ? ((purchases / pageViews) * 100).toFixed(2) : "0";
    const abandonedCarts = checkoutStarts - purchases;

    return NextResponse.json({
      totalOrders: orders,
      totalRevenue: totalRevenue._sum.total || 0,
      avgTicket,
      conversionRate,
      abandonedCarts,
      ordersByStatus,
      topProducts,
      reviewAvg: reviews._avg.rating || 0,
      reviewCount: reviews._count,
      pageViews,
      addToCarts,
      checkoutStarts,
      purchases,
      recentOrders,
      customerCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
