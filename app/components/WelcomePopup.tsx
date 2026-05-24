"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

const HIDDEN_ROUTES = ["/admin", "/checkout", "/confirmacion"];
const STORAGE_KEY = "mishkitashua-welcome-shown";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-cocoa-deep hover:bg-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="relative h-48 overflow-hidden">
          <Image
            src="/images/banner-hero-3.png"
            alt="Bienvenido a Mishkitashua"
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>

        <div className="p-6 text-center">
          <h2
            className="text-2xl font-medium text-cocoa-deep mb-2"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Bienvenido a Mishkitashua
          </h2>
          <p className="text-on-surface-variant text-sm mb-1">
            Sabores que nacen de nuestra tierra
          </p>
          <p className="text-caramel font-semibold text-sm mb-6">
            Envío gratis en tu primera compra
          </p>
          <Link
            href="/productos"
            onClick={handleClose}
            className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
          >
            Explorar Productos
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
