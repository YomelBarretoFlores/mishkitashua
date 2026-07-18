"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";

export default function ConfiguracionPage() {
  const [shippingCost, setShippingCost] = useState("");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage>(null);

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then((d) => {
        setShippingCost(String(d.shippingCost ?? 12));
        setThreshold(d.freeShippingThreshold != null ? String(d.freeShippingThreshold) : "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/configuracion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingCost: Number(shippingCost),
        freeShippingThreshold: threshold === "" ? null : Number(threshold),
      }),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    setToast(
      res.ok
        ? { text: "Configuración guardada.", kind: "ok" }
        : { text: data.error || "No se pudo guardar", kind: "error" }
    );
  };

  const inputClass =
    "w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa";

  return (
    <div className="max-w-lg">
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Configuración
      </h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Ajustes del sitio. El costo de envío se aplica a todos los pedidos que no
        califiquen para envío gratis.
      </p>

      {loading ? (
        <p className="text-taupe py-8">Cargando...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6 space-y-5">
          <label className="block text-sm">
            <span className="block text-cocoa-deep font-medium mb-1">
              Costo de envío (S/)
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="block text-cocoa-deep font-medium mb-1">
              Envío gratis desde (S/) — opcional
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Déjalo vacío para no ofrecer envío gratis por monto"
            />
            <span className="block text-xs text-taupe mt-1">
              Si el subtotal (tras descuentos) llega a este monto, el envío es
              gratis. Vacío = desactivado.
            </span>
          </label>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cocoa-deep text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
