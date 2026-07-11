"use client";

import { useEffect } from "react";

// Al volver "atrás", el navegador puede restaurar la página desde el bfcache
// (caché de retroceso/avance) con el DOM congelado: para entonces el widget de
// Clerk ya se desmontó y el formulario aparece vacío. Forzamos un montaje
// fresco recargando solo cuando la página se restaura desde ese caché.
export default function AuthReloadGuard() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
