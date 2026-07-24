"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import DateRangeFilter from "@/app/admin/_components/date-range-filter";
import ConfirmDialog from "@/app/admin/_components/confirm-dialog";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  customer: { name: string; email: string; city: string };
  items: { productName: string; quantity: number }[];
};

// "cancelado" tiene que estar en la lista aunque no sea un paso del recorrido:
// sin él, un pedido cancelado no coincidía con ninguna opción del desplegable y
// el navegador mostraba la primera, así que en el panel se leía "Confirmado".
// Cancelar es además lo que devuelve el stock de un pedido que nunca se pagó.
const statuses = [
  "confirmado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];
const statusLabels: Record<string, string> = {
  confirmado: "Confirmado",
  preparando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
const statusColors: Record<string, string> = {
  confirmado: "bg-blue-50 text-blue-700",
  preparando: "bg-amber-50 text-amber-700",
  enviado: "bg-purple-50 text-purple-700",
  entregado: "bg-green-50 text-green-700",
  cancelado: "bg-red-50 text-red-700",
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
  const [pagando, setPagando] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    action: () => void | Promise<void>;
  } | null>(null);

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
    // Carga inicial de datos: el estado se actualiza tras el await del fetch,
    // no de forma síncrona, pero la regla no puede verlo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const hasFilters =
    search !== "" || filterStatus !== "" || dateFrom !== "" || dateTo !== "";

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

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

  // Yape y transferencia no se pueden validar solas: el dinero llega al
  // teléfono o al banco, fuera de la web. Esto deja constancia de que llegó.
  const confirmarPago = async (order: Order) => {
    setPagando(order.id);
    const res = await fetch(`/api/admin/orders/${order.id}/pago`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: "pagado" }),
    });
    const data = await res.json().catch(() => ({}));
    setPagando(null);
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, paymentStatus: "pagado" } : o
        )
      );
      setToast({
        text: `Pago de ${order.orderNumber} confirmado. Se le avisó al cliente.`,
        kind: "ok",
      });
    } else {
      setToast({ text: data.error || "No se pudo confirmar", kind: "error" });
    }
  };

  const pedirConfirmacion = (order: Order) =>
    setConfirmState({
      title: "Confirmar que el pago llegó",
      message: `Comprueba en Yape o en la cuenta del BCP que entraron S/ ${order.total.toFixed(
        2
      )} del pedido ${order.orderNumber}. Al confirmar, el pedido deja de estar pendiente y se le manda un correo al cliente avisándole.`,
      confirmLabel: "Sí, el pago llegó",
      action: () => confirmarPago(order),
    });

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
          <label className="block lg:col-span-2">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Buscar
            </span>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por orden o cliente..."
                className="w-full pl-9 pr-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Estado
            </span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            >
              <option value="">Todos los estados</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </label>
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onFromChange={(v) => { setDateFrom(v); setPage(1); }}
            onToChange={(v) => { setDateTo(v); setPage(1); }}
          />
        </form>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cocoa hover:text-caramel transition-colors"
          >
            <X size={13} />
            Limpiar filtros
          </button>
        )}
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
                      {order.paymentStatus === "reembolsado" && (
                        <span className="block text-xs text-red-600 font-medium">
                          Reembolsado
                        </span>
                      )}
                      {order.paymentStatus === "pagado" && (
                        <span className="block text-xs text-green-700">
                          Pago confirmado
                        </span>
                      )}
                      {order.paymentStatus === "pendiente" && (
                        <>
                          <span className="block text-xs text-amber-600">
                            Pago pendiente
                          </span>
                          {order.paymentMethod === "transfer" && (
                            <button
                              onClick={() => pedirConfirmacion(order)}
                              disabled={pagando === order.id}
                              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cocoa hover:text-caramel disabled:opacity-40 transition-colors"
                            >
                              <Check size={12} />
                              {pagando === order.id
                                ? "Confirmando…"
                                : "Confirmar pago"}
                            </button>
                          )}
                        </>
                      )}
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

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const pending = confirmState;
          setConfirmState(null);
          void pending?.action();
        }}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
