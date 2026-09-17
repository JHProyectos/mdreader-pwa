// Service worker del Lector MD.
//
// Estrategia de actualización (importante):
//   - El documento HTML usa NETWORK-FIRST. Cada vez que hay conexión se busca
//     la versión más nueva del servidor; el caché sólo se usa como respaldo
//     offline. Esto evita que una versión vieja quede congelada para siempre
//     en los dispositivos que ya visitaron el sitio.
//   - Los íconos y el manifest usan STALE-WHILE-REVALIDATE: se sirve el caché
//     al instante (rápido) y en paralelo se baja la versión nueva para la
//     próxima carga.
//
// Una versión nueva se instala en segundo plano y queda esperando mientras
// exista una ventana abierta. Sólo toma control al cerrar la app o cuando la
// página envía SKIP_WAITING después de guardar el área de trabajo.

const VERSION = "v0.15.1";
const CACHE_NAME = "lector-md-" + VERSION;

// Caché aparte, de vida corta: sólo transporta los archivos que llegan
// por el menú "Compartir" de Android hasta que la página los levanta.
const SHARE_CACHE = "lector-md-share";

// La imagen de la ayuda entra acá y no en la revalidación perezosa: si no,
// la primera vez que abrís la ayuda sin conexión saldría sin ilustración.
const SHELL = ["/", "/index.html", "/manifest.json", "/ejemplo-portada.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k.startsWith("lector-md-") &&
                k !== CACHE_NAME &&
                k !== SHARE_CACHE
            )
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Permite que la página pida activar de inmediato una versión en espera.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isDocument(request) {
  if (request.mode === "navigate") return true;
  if (request.destination === "document") return true;

  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Web Share Target (Android): la PWA aparece en el menú "Compartir".
  // El archivo llega como POST multipart; el hosting es estático, así que
  // lo resolvemos acá: guardamos el archivo y redirigimos a la app.
  if (request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(
      (async () => {
        try {
          const formData = await request.formData();
          const files = formData
            .getAll("file")
            .filter((f) => f && f.name);

          const cache = await caches.open(SHARE_CACHE);

          // Limpiar restos de una compartida anterior.
          for (const k of await cache.keys()) {
            await cache.delete(k);
          }

          let i = 0;

          for (const f of files) {
            await cache.put(
              new Request(
                "/__shared__/" + i++ + "/" + encodeURIComponent(f.name)
              ),
              new Response(f)
            );
          }
        } catch (e) {
          // Si algo falla, igual abrimos la app sin archivo.
        }

        return Response.redirect("/?compartido=1", 303);
      })()
    );

    return;
  }

  if (request.method !== "GET") return;

  // Pedidos de extensiones del navegador (chrome-extension://, moz-extension://,
  // etc.): la Cache API sólo acepta http/https, así que ni se interceptan.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  const sameOrigin = url.origin === self.location.origin;

  // 1. Documento HTML -> network-first.
  // Si hay red, siempre gana la versión del servidor. cache:"no-store" es lo
  // que hace ese "siempre" cierto: sin eso, este fetch podía resolverse
  // contra el caché HTTP del propio navegador y servir un index.html viejo
  // aunque hubiera conexión.
  // El caché del service worker se usa sólo como respaldo offline.
  if (sameOrigin && isDocument(request)) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, copy));

          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then(
              (cached) =>
                cached || caches.match("/index.html")
            )
        )
    );

    return;
  }

  // 2. Recursos propios: stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request, { cache: "no-store" })
          .then((response) => {
            const copy = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy));

            return response;
          })
          .catch(() => cached);

        return cached || network;
      })
    );

    return;
  }

  // 3a. API de GitHub: nunca se cachea. Cada pedido lleva su propia marca de
  // tiempo (import/actualizar desde GitHub) para no servir contenido viejo;
  // guardarlo en el caché del service worker solo acumularía entradas que
  // nunca se reutilizan.
  if (url.hostname === "api.github.com" || url.hostname === "raw.githubusercontent.com") {
    event.respondWith(fetch(request));
    return;
  }

  // 3b. Librerías externas (KaTeX, Mermaid, Prism): network-first con respaldo
  // en caché. Gracias a esto, una vez bajadas las fórmulas, los diagramas y
  // el resaltado de código siguen funcionando sin conexión.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, copy));

        return response;
      })
      .catch(() => caches.match(request))
  );
});
