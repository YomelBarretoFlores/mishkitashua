"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastMessage = { text: string; kind: "ok" | "error" } | null;

// Aviso del panel. Sustituye a alert(), que bloquea el navegador y se ve ajeno
// a la marca. Se cierra solo, salvo los errores: esos esperan al usuario.
export default function Toast({
  message,
  onClose,
}: {
  message: ToastMessage;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message || message.kind === "error") return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  const ok = message.kind === "ok";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto"
    >
      <div className="flex items-start gap-3 bg-white rounded-xl border border-cream-darker/60 shadow-lg p-4">
        {ok ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden />
        )}
        <p className="text-sm text-cocoa-deep flex-1">{message.text}</p>
        <button
          onClick={onClose}
          aria-label="Cerrar aviso"
          className="text-taupe hover:text-cocoa-deep transition-colors shrink-0"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
