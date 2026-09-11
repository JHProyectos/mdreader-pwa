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
// Además, cada despliegue nuevo toma control inmediato (skipWaiting +
// clients.claim) y borra los cachés de versiones anteriores.

const VERSION = "v0.4.0";
const CACHE_NAME = "lector-md-" + VERSION;
// caché aparte, de vida corta: sólo transporta los archivos que llegan
// por el menú "Compartir" de Android hasta que la página los levanta.
const SHARE_CACHE = "lector-md-share";

const SHELL = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== SHARE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Permite que la página pida activar de inmediato una versión en espera.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
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
          const files = formData.getAll("file").filter((f) => f && f.name);
          const cache = await caches.open(SHARE_CACHE);
          // limpiar restos de una compartida anterior
          for (const k of await cache.keys()) await cache.delete(k);
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
          // si algo falla igual abrimos la app, sin archivo
        }
        return Response.redirect("/?compartido=1", 303);
      })()
    );
    return;
  }

  if (request.method !== "GET") return;

  const sameOrigin = url.origin === self.location.origin;

  // 1. Documento HTML -> network-first.
  //    Si hay red, siempre gana la versión del servidor: así un deploy nuevo
  //    llega solo, sin que nadie tenga que limpiar el caché a mano.
  if (sameOrigin && isDocument(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // 2. Resto de recursos propios (íconos, manifest) -> stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3. KaTeX (CDN externo) -> network-first con respaldo en caché.
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
