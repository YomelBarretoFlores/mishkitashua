"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// Aviso para que quien acaba de registrarse complete su ficha.
//
// Sin teléfono y dirección no se le puede enviar un pedido, y sin fecha de
// nacimiento nunca recibirá el cupón de cumpleaños: el sistema lo tiene todo
// montado pero se queda esperando un dato que nadie le pidió.
//
// No aparece en el panel de administración ni en las propias páginas de cuenta
// o compra, donde sería ruido.
const HIDDEN = ["/admin", "/cuenta", "/checkout", "/ingresar", "/registro"];
const DISMISS_KEY = "mishkitashua-perfil-aviso";

export default function CompleteProfileBanner() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [missing, setMissing] = useState<string[] | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // sessionStorage no existe en el servidor, así que no se puede derivar
    // durante el render: se lee al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    fetch("/api/account/profile-status")
      .then((r) => r.json())
      .then((d: { complete: boolean; missing: string[] }) => {
        if (!cancelled && !d.complete) setMissing(d.missing);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (
    !isSignedIn ||
    dismissed ||
    !missing ||
    missing.length === 0 ||
    HIDDEN.some((r) => pathname.startsWith(r))
  ) {
    return null;
  }

  const faltan =
    missing.length === 1
      ? `tu ${missing[0]}`
      : `${missing.slice(0, -1).join(", ")} y ${missing[missing.length - 1]}`;

  return (
    <div className="bg-caramel-light/40 border-b border-caramel-light">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center gap-3">
        <Gift size={18} className="text-caramel shrink-0" />
        <p className="text-sm text-cocoa-deep flex-1 leading-snug">
          Te falta {faltan}.{" "}
          <Link
            href="/cuenta"
            className="font-semibold underline hover:text-cocoa"
          >
            Completa tus datos
          </Link>{" "}
          para agilizar tus compras y recibir promociones y tu regalo de
          cumpleaños.
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          aria-label="Cerrar aviso"
          className="p-1 text-cocoa-deep/60 hover:text-cocoa-deep transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
