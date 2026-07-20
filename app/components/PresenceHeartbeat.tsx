"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Id propio en localStorage, NO el de analítica (que vive en sessionStorage y
// por tanto es distinto en cada pestaña). Aquí queremos identificar al
// navegador: con un id por pestaña, alguien con tres pestañas abiertas se
// contaba como tres personas conectadas y dejaba tres filas en la tabla.
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("msk-presence");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("msk-presence", id);
  }
  return id;
}

// Emite un latido de presencia cada ~45s y cuando cambia la página o la pestaña
// vuelve a estar visible. Alimenta el panel de "conectados" del admin.
export default function PresenceHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    const beat = () => {
      const sessionId = getDeviceId();
      if (!sessionId) return;
      if (typeof document !== "undefined" && document.hidden) return;
      const payload = JSON.stringify({ sessionId, page: pathname });
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    beat(); // inmediato al montar / cambiar de ruta
    const interval = setInterval(beat, 45_000);
    const onVisible = () => {
      if (!document.hidden) beat();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
