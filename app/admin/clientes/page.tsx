"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
};

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-taupe py-12 text-center">Cargando...</p>;

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-6"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Clientes
      </h1>

      <p className="text-sm text-on-surface-variant mb-3">
        {customers.length} cliente{customers.length !== 1 ? "s" : ""} registrado{customers.length !== 1 ? "s" : ""}
      </p>

      {customers.length === 0 ? (
        <p className="text-taupe text-center py-12">Aún no hay clientes registrados</p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-cream border-b border-cream-darker/60">
              <tr>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Nombre</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Ciudad</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Pedidos</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Total gastado</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-cream-darker/40 hover:bg-cream transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-cocoa-deep">{c.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{c.email}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{c.city}</td>
                  <td className="py-3 px-4 text-cocoa-deep font-semibold">{c.totalOrders}</td>
                  <td className="py-3 px-4 text-cocoa-deep font-semibold">S/ {c.totalSpent.toFixed(2)}</td>
                  <td className="py-3 px-4 text-taupe text-xs">
                    {new Date(c.createdAt).toLocaleDateString("es-PE")}
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
