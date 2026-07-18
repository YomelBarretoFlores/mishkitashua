import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <WifiOff size={44} className="text-taupe mx-auto mb-5" aria-hidden />
      <h1
        className="text-2xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Sin conexión
      </h1>
      <p className="text-on-surface-variant mb-6">
        Parece que no tienes internet. Revisa tu conexión y vuelve a intentarlo.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
      >
        Reintentar
      </Link>
    </div>
  );
}
