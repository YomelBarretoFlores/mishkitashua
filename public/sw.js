// Service worker mínimo de Mishkitashua.
// Su función principal es hacer la app "instalable" (Chrome/Android exigen un
// SW con handler de fetch para disparar beforeinstallprompt). Cachea el shell
// básico para una pantalla offline; el resto de peticiones pasan a la red.
const CACHE = "mishkitashua-v1";
const SHELL = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Solo GET del mismo origen; nunca interceptar API, auth ni pagos.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navegaciones: red primero, con la caché como respaldo offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          caches.match(request).then((r) => r || caches.match("/offline")) ||
          caches.match("/")
      )
    );
  }
});
