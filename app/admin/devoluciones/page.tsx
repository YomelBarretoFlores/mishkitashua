"use client";

import { useEffect, useState, useCallback } from "react";
import { returnBadgeClasses, returnStatusLabel, RETURN_STATUSES } from "@/app/lib/return-status";
import ConfirmDialog from "@/app/admin/_components/confirm-dialog";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";

type ReturnRow = {
  id: string;
  reason: string;
  status: string;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: string;
  order: {
    orderNumber: string;
    total: number;
    paymentMethod: string;
    chargeId: string | null;
    customer: { name: string; email: string };
  };
};

export default function AdminDevolucionesPage() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<ToastMessage>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/returns${params}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (r: ReturnRow, status: string, adminNote?: string) => {
    const res = await fetch(`/api/admin/returns/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: adminNote ?? null }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      load();
      setToast({ text: `Devolución ${status}.`, kind: "ok" });
    } else {
      setToast({ text: data.error || "No se pudo actualizar", kind: "error" });
    }
  };

  const confirmRefund = (r: ReturnRow) => {
    setConfirmState({
      title: "Marcar como reembolsada",
      message: `Confirma que ya devolviste S/ ${r.order.total.toFixed(2)} en el panel de la pasarela (chargeId: ${r.order.chargeId || "—"}). El pedido quedará como "reembolsado" y se avisará al cliente.`,
      confirmLabel: "Marcar reembolsada",
      action: () => resolve(r, "reembolsada"),
    });
  };

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Devoluciones
      </h1>
      <p className="text-sm text-on-surface-variant mb-4">
        El reembolso del dinero se hace en el panel de la pasarela (Mercado
        Pago). Aquí registras el estado y se avisa al cliente por correo.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filter === "" ? "bg-cocoa-deep text-white border-cocoa-deep" : "bg-white text-on-surface-variant border-cream-darker/60 hover:bg-cream"}`}
        >
          Todas
        </button>
        {RETURN_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filter === s ? "bg-cocoa-deep text-white border-cocoa-deep" : "bg-white text-on-surface-variant border-cream-darker/60 hover:bg-cream"}`}
          >
            {returnStatusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-taupe py-12 text-center">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-taupe text-center py-12">No hay devoluciones</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-cream-darker/60 p-5">
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <p className="font-semibold text-cocoa-deep">
                    Pedido {r.order.orderNumber} · {r.order.customer.name}
                  </p>
                  <p className="text-xs text-taupe">
                    {r.order.customer.email} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("es-PE")} · Total S/{" "}
                    {r.order.total.toFixed(2)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${returnBadgeClasses(r.status)}`}>
                  {returnStatusLabel(r.status)}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-3">
                <span className="text-cocoa-deep font-medium">Motivo:</span> {r.reason}
              </p>
              {r.order.chargeId && (
                <p className="text-xs text-taupe mb-3">
                  chargeId (para reembolsar en la pasarela): {r.order.chargeId}
                </p>
              )}

              {(r.status === "solicitada" || r.status === "aprobada") && (
                <div className="flex gap-2 flex-wrap">
                  {r.status === "solicitada" && (
                    <>
                      <button
                        onClick={() => resolve(r, "aprobada")}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:opacity-90 transition-opacity"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => resolve(r, "rechazada")}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:opacity-90 transition-opacity"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => confirmRefund(r)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-700 text-white hover:opacity-90 transition-opacity"
                  >
                    Marcar reembolsada
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger}
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
