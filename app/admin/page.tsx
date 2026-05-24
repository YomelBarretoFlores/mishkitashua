import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ShoppingCart,
  Star,
  Eye,
  MousePointer,
  CreditCard,
  Users,
} from "lucide-react";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

type TopProduct = { productName: string; _sum: { quantity: number | null } };
type RecentOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  customer: { name: string; email: string };
  items: { productName: string; quantity: number }[];
};

async function getStats() {
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
    prisma.customer.count(),
  ]);

  return {
    totalOrders: orders,
    totalRevenue: totalRevenue._sum.total || 0,
    avgTicket: orders > 0 ? (totalRevenue._sum.total || 0) / orders : 0,
    conversionRate: pageViews > 0 ? (purchases / pageViews) * 100 : 0,
    abandonedCarts: checkoutStarts - purchases,
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
  };
}

const statusLabels: Record<string, string> = {
  confirmado: "Confirmado",
  preparando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
};

const statusColors: Record<string, string> = {
  confirmado: "bg-blue-50 text-blue-700",
  preparando: "bg-amber-50 text-amber-700",
  enviado: "bg-purple-50 text-purple-700",
  entregado: "bg-green-50 text-green-700",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-6"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-caramel" />
            </div>
            <span className="text-sm text-on-surface-variant">Ventas totales</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-cocoa-deep">
            S/ {stats.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-caramel" />
            </div>
            <span className="text-sm text-on-surface-variant">Pedidos</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-cocoa-deep">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-caramel" />
            </div>
            <span className="text-sm text-on-surface-variant">Ticket promedio</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-cocoa-deep">
            S/ {stats.avgTicket.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-caramel" />
            </div>
            <span className="text-sm text-on-surface-variant">Carritos abandonados</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-cocoa-deep">
            {stats.abandonedCarts}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <Users size={20} className="text-caramel" />
            </div>
            <span className="text-sm text-on-surface-variant">Clientes</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-cocoa-deep">
            {stats.customerCount}
          </p>
        </div>
      </div>

      {/* Analytics + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-taupe" />
            <span className="text-sm font-semibold text-cocoa-light">
              Visitas
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-cocoa-deep">{stats.pageViews}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer size={18} className="text-taupe" />
            <span className="text-sm font-semibold text-cocoa-light">
              Tasa de conversión
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-cocoa-deep">
            {stats.conversionRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-taupe" />
            <span className="text-sm font-semibold text-cocoa-light">
              Satisfacción
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-semibold text-cocoa-deep">
              {stats.reviewAvg.toFixed(1)}
            </p>
            <span className="text-sm text-on-surface-variant">
              / 5 ({stats.reviewCount} reseñas)
            </span>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-2xl p-5 border border-cream-darker/60 mb-8">
        <h2
          className="text-sm font-semibold text-cocoa-light mb-4"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Embudo de conversión
        </h2>
        <div className="space-y-3">
          {[
            {
              label: "Visitas",
              value: stats.pageViews,
              icon: <Eye size={16} />,
            },
            {
              label: "Agregar al carrito",
              value: stats.addToCarts,
              icon: <ShoppingCart size={16} />,
            },
            {
              label: "Inicio de checkout",
              value: stats.checkoutStarts,
              icon: <CreditCard size={16} />,
            },
            {
              label: "Compras completadas",
              value: stats.purchases,
              icon: <ShoppingBag size={16} />,
            },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-taupe">{step.icon}</span>
              <span className="text-sm text-on-surface-variant w-36 sm:w-44">{step.label}</span>
              <div className="flex-1 bg-cream-dark rounded-full h-6 overflow-hidden">
                <div
                  className="bg-cocoa h-full rounded-full flex items-center justify-end px-2"
                  style={{
                    width: `${stats.pageViews > 0 ? Math.max((step.value / stats.pageViews) * 100, 5) : 5}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {step.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <h2
            className="text-sm font-semibold text-cocoa-light mb-4"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Productos más vendidos
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-taupe">Aún no hay ventas</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p: TopProduct, i: number) => (
                <div key={p.productName} className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-cream-darker w-6">
                    {i + 1}
                  </span>
                  <span className="text-sm text-on-surface-variant flex-1">
                    {p.productName}
                  </span>
                  <span className="text-sm font-semibold text-cocoa-deep">
                    {p._sum.quantity} uds.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 border border-cream-darker/60">
          <h2
            className="text-sm font-semibold text-cocoa-light mb-4"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Pedidos recientes
          </h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-taupe">Aún no hay pedidos</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: RecentOrder) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-cocoa-deep">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {order.customer.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-cocoa-deep">
                      S/ {order.total.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || "bg-cream-dark"}`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
