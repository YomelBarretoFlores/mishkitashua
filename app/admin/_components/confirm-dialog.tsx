"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Diálogo de confirmación del panel. Sustituye a confirm(), que además de
// verse ajeno a la marca bloquea el hilo del navegador.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-deep/40 backdrop-blur-[2px]"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-cream-darker/60 shadow-xl p-5 md:p-6"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <AlertTriangle
              className="w-5 h-5 text-red-600 mt-0.5 shrink-0"
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h2
              id="confirm-title"
              className="text-lg font-medium text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              {title}
            </h2>
            <p
              id="confirm-message"
              className="text-sm text-on-surface-variant mt-1 whitespace-pre-line"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant border border-cream-darker/60 hover:bg-cream transition-colors"
          >
            Cancelar
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 ${
              danger ? "bg-red-600" : "bg-cocoa-deep"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
