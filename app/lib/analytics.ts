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
  type: "page_view" | "add_to_cart" | "checkout_start" | "purchase",
  data?: { page?: string; productSlug?: string; metadata?: string }
) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sessionId, ...data }),
  }).catch(() => {});
}
