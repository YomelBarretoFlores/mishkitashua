"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-24 md:py-32 text-center">
      <div className="w-20 h-20 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-8">
        <AlertTriangle size={36} className="text-caramel" />
      </div>
      <h1
        className="text-4xl md:text-5xl font-medium text-cocoa-deep mb-4"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Algo salió mal
      </h1>
      <p className="text-on-surface-variant text-lg mb-10 max-w-md mx-auto">
        Ocurrió un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa-deep transition-colors"
      >
        Reintentar
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
