"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customer: { name: string; email: string; city: string };
  items: { productName: string; quantity: number }[];
};

const statuses = ["confirmado", "preparando", "enviado", "entregado"];
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

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, filterStatus, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-6"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Gestión de Pedidos
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por orden o cliente..."
              className="w-full pl-9 pr-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          >
            <option value="">Todos los estados</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          />
        </form>
      </div>

      {/* Results info */}
      <p className="text-sm text-on-surface-variant mb-3">
        {total} pedido{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <p className="text-taupe py-12 text-center">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-taupe text-center py-12">No se encontraron pedidos</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-x-auto mb-4">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-cream border-b border-cream-darker/60">
                <tr>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Pedido</th>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Productos</th>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Pago</th>
                  <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-cream-darker/40 hover:bg-cream transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-cocoa-deep">{order.orderNumber}</p>
                      <p className="text-xs text-taupe">
                        {new Date(order.createdAt).toLocaleDateString("es-PE")}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-cocoa-deep">{order.customer.name}</p>
                      <p className="text-xs text-taupe">{order.customer.email}</p>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-cocoa-deep">
                      S/ {order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant capitalize">
                      {order.paymentMethod === "card" ? "Tarjeta" : "Transferencia"}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-on-surface-variant">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-cream-darker/60 rounded-lg text-sm text-cocoa-deep hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-cream-darker/60 rounded-lg text-sm text-cocoa-deep hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
