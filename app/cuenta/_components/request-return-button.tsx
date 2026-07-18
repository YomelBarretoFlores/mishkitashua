"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X } from "lucide-react";

// Botón + modal para solicitar la devolución de un pedido entregado.
export default function RequestReturnButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    if (reason.trim().length < 5) {
      setError("Escribe un motivo (mínimo 5 caracteres).");
      return;
    }
    setSending(true);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    setSending(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        router.push("/cuenta/devoluciones");
      }, 1200);
    } else {
      setError(data.error || "No se pudo enviar la solicitud.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa hover:text-cocoa-deep transition-colors"
      >
        <RotateCcw size={15} />
        Solicitar devolución
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-deep/40 backdrop-blur-[2px]"
          onClick={() => !sending && setOpen(false)}
          role="presentation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-title"
            className="w-full max-w-md bg-white rounded-2xl border border-cream-darker/60 shadow-xl p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2
                id="return-title"
                className="text-lg font-medium text-cocoa-deep"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Devolver pedido {orderNumber}
              </h2>
              <button
                onClick={() => !sending && setOpen(false)}
                aria-label="Cerrar"
                className="text-taupe hover:text-cocoa-deep transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {done ? (
              <p className="text-sm text-green-700 py-4">
                ¡Solicitud enviada! Te avisaremos por correo. Redirigiendo…
              </p>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant mb-3">
                  Cuéntanos por qué quieres devolver este pedido. Revisaremos tu
                  solicitud y te responderemos por correo.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Ej: El producto llegó dañado…"
                  className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
                />
                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={sending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant border border-cream-darker/60 hover:bg-cream transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={submit}
                    disabled={sending}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-cocoa-deep text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {sending ? "Enviando…" : "Enviar solicitud"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
