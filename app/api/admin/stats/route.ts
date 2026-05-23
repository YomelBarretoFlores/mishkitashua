import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
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
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.analyticsEvent.count({ where: { type: "page_view" } }),
    prisma.analyticsEvent.count({ where: { type: "add_to_cart" } }),
    prisma.analyticsEvent.count({ where: { type: "checkout_start" } }),
    prisma.analyticsEvent.count({ where: { type: "purchase" } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
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
  });
}
