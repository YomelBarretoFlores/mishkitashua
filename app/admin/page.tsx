import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ShoppingCart,
  Star,
  Eye,
  MousePointer,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

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
  };
}

const statusLabels: Record<string, string> = {
  confirmado: "Confirmado",
  preparando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
};

const statusColors: Record<string, string> = {
  confirmado: "bg-blue-100 text-blue-800",
  preparando: "bg-yellow-100 text-yellow-800",
  enviado: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Ventas totales</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            S/ {stats.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Pedidos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Ticket promedio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            S/ {stats.avgTicket.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Carritos abandonados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.abandonedCarts}
          </p>
        </div>
      </div>

      {/* Analytics + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              Visitas
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pageViews}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              Tasa de conversión
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.conversionRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              Satisfacción
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.reviewAvg.toFixed(1)}
            </p>
            <span className="text-sm text-gray-500">
              / 5 ({stats.reviewCount} reseñas)
            </span>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
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
              <span className="text-gray-400">{step.icon}</span>
              <span className="text-sm text-gray-600 w-44">{step.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
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
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Productos más vendidos
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no hay ventas</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.productName} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300 w-6">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {p.productName}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {p._sum.quantity} uds.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Pedidos recientes
          </h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no hay pedidos</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      S/ {order.total.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100"}`}
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
