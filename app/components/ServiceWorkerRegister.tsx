"use client";

import { useEffect } from "react";

// Registra el service worker solo en producción. En desarrollo se omite para
// no interferir con el HMR de Next ni servir respuestas cacheadas viejas.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Registrar tras la carga para no competir con recursos críticos.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
