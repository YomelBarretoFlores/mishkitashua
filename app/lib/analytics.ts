"use client";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("msk-session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("msk-session", id);
  }
  return id;
}

export function trackEvent(
  type: "page_view" | "add_to_cart" | "checkout_start" | "purchase" | "chatbot_open",
  data?: { page?: string; productSlug?: string; metadata?: string }
) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  const payload = JSON.stringify({ type, sessionId, ...data });

  // sendBeacon no bloquea el render y sobrevive a la navegación entre páginas.
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) return;
  }

  // Fallback: fetch con keepalive para que no se cancele al cambiar de página.
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
