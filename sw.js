// Service worker del Lector MD.
// Objetivo único: (1) habilitar que Chrome considere la PWA "instalable"
// —requisito ineludible para que file_handlers funcione en Android—
// y (2) que el lector siga abriendo sin conexión una vez visitado.

const CACHE_NAME = "lector-md-v2";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo interceptamos GET; todo lo demás pasa directo a la red.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Recursos propios (shell): cache-first, así abre instantáneo y offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // KaTeX (CDN externo): network-first, con fallback a cache si no hay conexión.
  // Así si cdnjs actualiza la versión la tomamos, pero si estás sin internet
  // seguís teniendo las fórmulas ya vistas anteriormente.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
