"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reutiliza el mismo id de sesión que la analítica.
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("msk-session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("msk-session", id);
  }
  return id;
}

// Emite un latido de presencia cada ~45s y cuando cambia la página o la pestaña
// vuelve a estar visible. Alimenta el panel de "conectados" del admin.
export default function PresenceHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    const beat = () => {
      const sessionId = getSessionId();
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
