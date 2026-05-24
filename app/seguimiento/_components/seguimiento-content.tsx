"use client";

import { useState } from "react";
import { Search, Package, ChefHat, Truck, CheckCircle } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customer: { name: string; address: string; city: string };
  items: { productName: string; quantity: number; price: number }[];
};

const steps = [
  { key: "confirmado", label: "Confirmado", icon: Package },
  { key: "preparando", label: "En preparación", icon: ChefHat },
  { key: "enviado", label: "Enviado", icon: Truck },
  { key: "entregado", label: "Entregado", icon: CheckCircle },
];

export default function SeguimientoContent() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      setError("Pedido no encontrado. Verifica tu número de orden.");
      setLoading(false);
      return;
    }
    setOrder(await res.json());
    setLoading(false);
  };

  const currentStepIndex = order
    ? steps.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-16 py-12 md:py-20">
      <div className="text-center mb-10">
        <h1
          className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-3"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Seguimiento de pedido
        </h1>
        <p className="text-on-surface-variant">
          Ingresa tu número de orden para ver el estado de tu pedido.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="MSK-XXXXXXX"
          className="flex-1 px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      {loading && (
        <p className="text-center text-on-surface-variant">Buscando...</p>
      )}

      {error && (
        <p className="text-center text-red-600 bg-red-50 rounded-lg p-4">
          {error}
        </p>
      )}

      {order && (
        <div className="space-y-8">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-cocoa-deep">
                {order.orderNumber}
              </h2>
              <span className="text-xs sm:text-sm text-on-surface-variant">
                {new Date(order.createdAt).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
              {steps.map((step, i) => {
                const isActive = i <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-cocoa text-white"
                          : "bg-cream-dark text-taupe"
                      }`}
                    >
                      <Icon size={18} className="sm:hidden" />
                      <Icon size={20} className="hidden sm:block" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium text-center ${
                        isActive ? "text-cocoa-deep" : "text-taupe"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center mt-2 px-4 sm:px-6">
              {steps.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full mx-1 ${
                    i < currentStepIndex ? "bg-cocoa" : "bg-cream-darker"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
            <h3 className="text-sm font-semibold text-cocoa-deep uppercase tracking-wide mb-4">
              Detalle del pedido
            </h3>
            <div className="space-y-3 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">
                    {item.productName} x {item.quantity}
                  </span>
                  <span className="font-medium text-cocoa-deep">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-darker pt-3 flex justify-between">
              <span className="font-semibold text-cocoa-deep">Total</span>
              <span className="font-semibold text-caramel">
                S/ {order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
            <h3 className="text-sm font-semibold text-cocoa-deep uppercase tracking-wide mb-3">
              Dirección de envío
            </h3>
            <p className="text-sm text-on-surface-variant">
              {order.customer.name}
            </p>
            <p className="text-sm text-on-surface-variant">
              {order.customer.address}
            </p>
            <p className="text-sm text-on-surface-variant">
              {order.customer.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
