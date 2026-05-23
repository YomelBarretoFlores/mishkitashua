"use client";

import { useEffect, useState } from "react";

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
  confirmado: "bg-blue-100 text-blue-800",
  preparando: "bg-yellow-100 text-yellow-800",
  enviado: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.recentOrders || []);
        setLoading(false);
      });
  }, []);

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

  if (loading)
    return <p className="text-gray-500 py-12 text-center">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestión de Pedidos
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Aún no hay pedidos</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Pedido
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Productos
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Pago
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("es-PE")}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p>{order.customer.name}</p>
                    <p className="text-xs text-gray-400">
                      {order.customer.email}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {order.items
                      .map((i) => `${i.productName} ×${i.quantity}`)
                      .join(", ")}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    S/ {order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 capitalize">
                    {order.paymentMethod === "card"
                      ? "Tarjeta"
                      : "Transferencia"}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
