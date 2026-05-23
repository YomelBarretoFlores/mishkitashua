import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-24 md:py-32 text-center">
      <div className="w-20 h-20 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-8">
        <Search size={36} className="text-taupe" />
      </div>
      <h1
        className="text-4xl md:text-5xl font-medium text-cocoa-deep mb-4"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Página no encontrada
      </h1>
      <p className="text-on-surface-variant text-lg mb-10 max-w-md mx-auto">
        Lo sentimos, la página que buscas no existe o ha sido movida. Pero
        nuestros dulces sí están aquí.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa-deep transition-colors"
        >
          Volver al inicio
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 border-2 border-cocoa text-cocoa-deep font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa hover:text-white transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
