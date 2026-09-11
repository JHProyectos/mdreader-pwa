# mdreader-pwa

[![Live demo](https://img.shields.io/badge/demo-live-34399B.svg)](https://mdreader.jhproyectos.com.ar)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://mdreader.jhproyectos.com.ar)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/JHProyectos/mdreader-pwa)


**English** · [Español](#español)

A standalone, offline-first Markdown reader, installable as a PWA. Single HTML file with no build dependencies, math formula support (KaTeX), and integration with the OS so you can open `.md` files straight from other apps.

## Features

- **Single HTML file.** No build step, no `node_modules`, no framework. Open it directly in a browser or serve it as-is.
- **Works offline.** All Markdown processing happens client-side. Nothing you open ever leaves your machine.
- **Math formulas.** When online, it loads [KaTeX](https://katex.org/) from a CDN for real math typesetting (`$inline$` and `$$block$$`). Offline, it falls back to a readable Unicode approximation.
- **Open entire folders.** Browse multiple `.md` files from a project in a side panel, without uploading anything to a server.
- **Open files from other apps.** On **Android**, the installed app appears in the system **Share** sheet — send a `.md` from WhatsApp, Drive, Telegram, or a file manager straight into the reader. On **desktop** (Windows, macOS, Linux, ChromeOS), it registers as a file handler and appears in the **"Open with"** menu.
- **Keeps your workspace.** Loaded documents, the selected file, and the reading position are stored locally and restored after closing, restarting, or updating the app. A document stays loaded until you remove it explicitly.
- **Updates itself.** New deploys reach installed copies automatically — no cache clearing, no reinstalling. See [Updates](#updates).
- **Dedicated print styles.** A separate `@media print` stylesheet so what you read on screen prints cleanly.

## Why this exists

Online Markdown readers usually require uploading the file to some service, or are browser extensions tied to a single device. This project came out of a simple need: **open a `.md` file from a phone without uploading it anywhere**, even without internet access. The installable PWA version also works around the fact that Android has no app associated with the `.md` extension by default.

## Quick use (no installation needed)

Try it right now at **[mdreader.jhproyectos.com.ar](https://mdreader.jhproyectos.com.ar)**, or open `index.html` locally in any modern browser — double-click it, or "Open with Chrome" from the file explorer. From there:

- **Open folder** — select an entire folder; it lists every `.md`/`.markdown`/`.txt` file it contains.
- **Open individual files** — select one or several specific files.
- **Drag and drop** — drop files anywhere on the reading pane.

On narrow screens the side panel collapses; the **☰** button in the top bar opens it, and the same two pickers are also available on the empty state.

This mode requires no hosting and no internet connection, and is the simplest option if you only need to read files you pick yourself from within the app.

## Installable PWA usage (opening `.md` from other apps)

To integrate with the operating system, the app must be served from an HTTPS origin and installed as a PWA. This is a platform restriction: an HTML file opened via `file://` cannot register a service worker or a manifest, and without those the OS has no way to associate it with a file type.

The integration differs by platform, because the underlying browser APIs do:

| Platform | API | Where the app appears |
|---|---|---|
| Android | Web Share Target | The system **Share** sheet |
| Windows / macOS / Linux / ChromeOS | File Handling | The **"Open with"** menu |
| iOS | — | Not supported (see limitations) |

### Deploy

1. Clone this repo (or use the "Deploy with Vercel" button above).
2. Deploy it to any static hosting provider — [Vercel](https://vercel.com), [GitHub Pages](https://pages.github.com/), [Netlify](https://netlify.com), etc. No build command is required: it's a fully static site.
3. Open the deployed URL in Chrome for Android.

If you deploy somewhere other than Vercel, port the two rules in `vercel.json`: the `Service-Worker-Allowed: /` header on `sw.js`, and a rewrite that sends `/share-target` to `index.html`.

### Install on your phone

1. With the URL open in Chrome, tap the **⋮ menu → "Install app"** (or the banner Chrome offers automatically).
2. Once installed, find a `.md` file in WhatsApp, Drive, or a file manager and tap **Share**.
3. Choose **Lector MD** from the share sheet. The file opens straight in the reader.

On Android the entry point is **Share**, not "Open with" — Chrome for Android does not implement the File Handling API, so an installed PWA cannot register itself as a handler for a file extension there.

### Known limitations

- **iOS/Safari supports neither File Handling nor Share Target for files.** On iPhone the app can be installed as a PWA (home screen icon, works offline), but the system won't offer it as a way to open `.md` files from outside the app. There, the only way in is the **Open folder / Open individual files** pickers inside the app itself.
- **Android: Share sheet only, not "Open with".** The File Handling API is desktop-only. Getting into the "Open with" menu on Android would require packaging the PWA as a TWA/APK, which this repo does not do.
- **Desktop "Open with" requires Chromium ≥102.** Firefox and Safari do not implement the File Handling API.
- **`.md` MIME types are inconsistent.** Android apps report Markdown files under several types, so `share_target` accepts a broad list including `application/octet-stream`. The trade-off is that the reader may also appear when sharing unrelated binary files.

## Updates

Installed copies update on their own without interrupting an open document. The mechanism has four parts:

- **`sw.js` serves the HTML network-first.** With a connection, the server's version always wins; the cache is only an offline fallback. This is what prevents a stale version from being frozen on a device forever. Icons and the manifest use stale-while-revalidate — instant from cache, refreshed in the background.
- **The page checks for a new service worker** on load and every time the app becomes visible again, which is the normal usage pattern for an installed PWA.
- **A new worker waits while the current app is open.** It is downloaded in the background but does not take control or reload the page automatically.
- **The workspace lives in IndexedDB, outside the service-worker cache.** If you choose **Update now**, the app first stores every loaded document, the selected file, and its scroll position. It reloads only after that write succeeds and restores the same workspace immediately. If you do nothing, the update is applied the next time the app starts.

### Releasing a new version

Bump `VERSION` at the top of `sw.js` and deploy. The new version is installed in the background and remains waiting while the app is in use. Once activated, its `activate` handler deletes older `lector-md-*` shell caches automatically:

```js
const VERSION = "v0.5.0";
```

The share-target cache and the IndexedDB workspace are excluded from that cleanup. Therefore, deleting an old application cache never removes a loaded document. The workspace is cleared only with **Clear all**, by removing documents individually, or by clearing the site's browser data.

## Project structure

```
├── index.html                # The full app: HTML + CSS + JS in a single file
├── manifest.json             # PWA metadata, file_handlers and share_target
├── sw.js                     # Service worker: caching, updates, share-target handling
├── icon-192.png              # App icon (192×192)
├── icon-512.png              # App icon (512×512)
├── icon-maskable-512.png     # "Maskable" variant (Android may crop it into different shapes)
└── vercel.json               # Headers and the /share-target rewrite for Vercel
```

`index.html` is fully self-contained: you can copy just that one file — onto a USB stick, into an email — and it works on any machine with a browser. The other files are only needed for the installable, OS-integrated mode.

## Technical notes

- **Shared files travel through a cache.** Android delivers a shared file as a `POST` to `/share-target`, but static hosting can't accept a POST. The service worker intercepts it, writes the file into a short-lived cache, and redirects to the app, which picks it up and empties the cache.
- **The open workspace is stored locally in IndexedDB.** Markdown contents are never sent to the server. The browser may remove them only if the user clears site data or the device removes site storage; the app requests persistent storage when the browser supports it.
- **The maskable icon** has its content scaled to 80% and centered, inside the "safe zone" Android respects when cropping icons into different shapes (circle, squircle, etc. depending on the manufacturer).
- **`"launch_type": "single-client"`** in `file_handlers` means each opened file reuses the same app window instead of spawning one instance per file.
- **KaTeX is optional by design.** It loads from a CDN and the app degrades to a Unicode approximation if the request fails, so the reader never depends on a network call to render a document.

## License

MIT — use it, modify it, and adapt it to whatever you need.

---

<a name="español"></a>

# mdreader-pwa (Español)

[English](#mdreader-pwa) · **Español**

Lector de archivos Markdown standalone, offline-first e instalable como PWA. Un solo archivo HTML sin dependencias de build, con soporte de fórmulas matemáticas (KaTeX) e integración con el sistema operativo para abrir `.md` desde otras apps.

## Características

- **Un solo archivo HTML.** Sin paso de build, sin `node_modules`, sin framework. Se puede abrir directo en el navegador o servir como está.
- **Funciona sin conexión.** Todo el procesamiento de Markdown ocurre en el cliente. Nada de lo que abrís sale de tu máquina.
- **Fórmulas matemáticas.** Si hay conexión, carga [KaTeX](https://katex.org/) desde CDN para tipografía matemática real (`$inline$` y `$$bloque$$`). Sin conexión, cae a una aproximación en Unicode legible.
- **Abrir carpetas completas.** Navegá varios `.md` de un proyecto desde un panel lateral, sin subir nada a un servidor.
- **Abrir archivos desde otras apps.** En **Android**, la app instalada aparece en el menú **Compartir** del sistema: mandá un `.md` desde WhatsApp, Drive, Telegram o el explorador directo al lector. En **escritorio** (Windows, macOS, Linux, ChromeOS) se registra como file handler y aparece en **"Abrir con"**.
- **Conserva el área de trabajo.** Los documentos cargados, el archivo seleccionado y la posición de lectura se guardan localmente y se restauran después de cerrar, reiniciar o actualizar la app. Un documento permanece cargado hasta que lo quitás explícitamente.
- **Se actualiza sola.** Los deploys nuevos llegan solos a las copias instaladas, sin limpiar caché ni reinstalar. Ver [Actualizaciones](#actualizaciones).
- **Impresión con estilos dedicados.** Hoja de estilos `@media print` propia para que lo que se lee en pantalla se imprima limpio.

## Por qué existe

Los lectores de Markdown online suelen requerir subir el archivo a algún servicio, o son extensiones de navegador atadas a un solo dispositivo. Este proyecto nació de una necesidad simple: **abrir un `.md` desde el celular sin subirlo a ningún lado**, aunque no haya internet. La versión instalable además resuelve que Android no tenga, por defecto, ninguna app asociada a la extensión `.md`.

## Uso rápido (sin instalar nada)

Probalo ahora mismo en **[mdreader.jhproyectos.com.ar](https://mdreader.jhproyectos.com.ar)**, o abrí `index.html` localmente en cualquier navegador moderno — doble clic, o "Ver con Chrome" desde el explorador de archivos. Desde ahí:

- **Abrir carpeta** — selecciona una carpeta completa; lista todos los `.md`/`.markdown`/`.txt` que contenga.
- **Abrir archivos sueltos** — selecciona uno o varios archivos puntuales.
- **Arrastrar y soltar** — soltá los archivos sobre el panel de lectura.

En pantallas angostas el panel lateral se pliega; el botón **☰** de la barra superior lo abre, y los mismos dos selectores están también en la pantalla de inicio.

Esta forma de uso no requiere hosting, no requiere conexión, y es la más simple si solo necesitás leer archivos que ya elegís vos mismo desde la app.

## Uso como PWA instalable (abrir `.md` desde otras apps)

Para integrarse con el sistema operativo, la app tiene que estar servida desde un origen HTTPS e instalada como PWA. Esto es una restricción de la plataforma: un archivo HTML abierto en `file://` no puede registrar un *service worker* ni un manifest, y sin eso el sistema no tiene forma de asociarlo a un tipo de archivo.

La integración cambia según la plataforma, porque las APIs del navegador son distintas:

| Plataforma | API | Dónde aparece la app |
|---|---|---|
| Android | Web Share Target | El menú **Compartir** del sistema |
| Windows / macOS / Linux / ChromeOS | File Handling | El menú **"Abrir con"** |
| iOS | — | No soportado (ver limitaciones) |

### Desplegar

1. Cloná este repo (o usá el botón "Deploy with Vercel" de arriba).
2. Desplegalo en cualquier hosting estático — [Vercel](https://vercel.com), [GitHub Pages](https://pages.github.com/), [Netlify](https://netlify.com), etc. No requiere build command: es un sitio 100% estático.
3. Abrí la URL desplegada en Chrome para Android.

Si lo desplegás fuera de Vercel, replicá las dos reglas de `vercel.json`: el header `Service-Worker-Allowed: /` sobre `sw.js`, y un rewrite que mande `/share-target` a `index.html`.

### Instalar en el celular

1. Con la URL abierta en Chrome, tocá el menú **⋮ → "Instalar app"** (o el banner que ofrece Chrome automáticamente).
2. Una vez instalada, buscá un `.md` en WhatsApp, Drive o el explorador de archivos y tocá **Compartir**.
3. Elegí **Lector MD** en el menú de compartir. El archivo se abre directo en el lector.

En Android el punto de entrada es **Compartir**, no "Abrir con": Chrome para Android no implementa la File Handling API, así que una PWA instalada no puede registrarse como handler de una extensión de archivo.

### Limitaciones conocidas

- **iOS/Safari no soporta ni File Handling ni Share Target para archivos.** En iPhone la app se puede instalar como PWA (ícono en el home, funciona offline), pero el sistema no la va a ofrecer para abrir `.md` desde fuera de la app. Ahí la única entrada son los selectores **Abrir carpeta / Abrir archivos sueltos** dentro de la propia app.
- **Android: sólo menú Compartir, no "Abrir con".** La File Handling API es exclusiva de escritorio. Entrar al menú "Abrir con" en Android requeriría empaquetar la PWA como TWA/APK, cosa que este repo no hace.
- **El "Abrir con" de escritorio requiere Chromium ≥102.** Firefox y Safari no implementan la File Handling API.
- **Los MIME types de `.md` son inconsistentes.** Las apps de Android reportan los Markdown con varios tipos distintos, así que `share_target` acepta una lista amplia que incluye `application/octet-stream`. El costo es que el lector puede aparecer también al compartir otros archivos binarios.

## Actualizaciones

Las copias instaladas se actualizan solas sin interrumpir un documento abierto. El mecanismo tiene cuatro partes:

- **`sw.js` sirve el HTML network-first.** Con conexión siempre gana la versión del servidor; el caché es solo respaldo offline. Esto es lo que evita que una versión vieja quede congelada para siempre en un dispositivo. Los íconos y el manifest usan stale-while-revalidate: instantáneos desde el caché, refrescados en segundo plano.
- **La página busca un service worker nuevo** al cargar y cada vez que la app vuelve a estar visible, que es el patrón de uso normal de una PWA instalada.
- **Un worker nuevo espera mientras la app actual está abierta.** Se descarga en segundo plano, pero no toma control ni recarga la página automáticamente.
- **El área de trabajo vive en IndexedDB, fuera del caché del service worker.** Si elegís **Actualizar ahora**, la app guarda primero todos los documentos cargados, el archivo seleccionado y su posición. Sólo recarga si ese guardado termina correctamente y restaura inmediatamente la misma sesión. Si no hacés nada, la actualización se aplica la próxima vez que abras la app.

### Publicar una versión nueva

Subí `VERSION` arriba de todo en `sw.js` y desplegá. La versión nueva se instala en segundo plano y queda en espera mientras la app esté en uso. Una vez activada, su handler de `activate` elimina automáticamente los cachés de shell `lector-md-*` anteriores:

```js
const VERSION = "v0.5.0";
```

El caché del share target y el área de trabajo guardada en IndexedDB quedan fuera de esa limpieza. Por eso borrar un caché viejo de la aplicación nunca elimina un documento cargado. El área de trabajo sólo se vacía con **Limpiar todo**, quitando cada documento o borrando los datos del sitio desde el navegador.

## Estructura del proyecto

```
├── index.html                # La app completa: HTML + CSS + JS en un solo archivo
├── manifest.json             # Metadata de PWA, file_handlers y share_target
├── sw.js                     # Service worker: caché, actualizaciones y share target
├── icon-192.png              # Ícono de la app (192×192)
├── icon-512.png              # Ícono de la app (512×512)
├── icon-maskable-512.png     # Variante "maskable" (Android puede recortarla en distintas formas)
└── vercel.json               # Headers y el rewrite de /share-target para Vercel
```

`index.html` es completamente autocontenido: podés copiar únicamente ese archivo —a un pendrive, a un mail— y funciona en cualquier máquina con navegador. Los demás archivos solo hacen falta para el modo instalable e integrado al sistema.

## Notas técnicas

- **Los archivos compartidos viajan por un caché.** Android entrega el archivo compartido como un `POST` a `/share-target`, pero un hosting estático no puede recibir POST. El service worker lo intercepta, escribe el archivo en un caché de vida corta y redirige a la app, que lo levanta y vacía el caché.
- **El área de trabajo abierta se guarda localmente en IndexedDB.** El contenido Markdown nunca se envía al servidor. Sólo puede desaparecer si el usuario borra los datos del sitio o si el dispositivo elimina ese almacenamiento; la app solicita almacenamiento persistente cuando el navegador lo permite.
- **El ícono maskable** tiene el contenido escalado al 80% y centrado, dentro de la "zona segura" que Android respeta al recortar los íconos en distintas formas (círculo, squircle, etc. según el fabricante).
- **`"launch_type": "single-client"`** en `file_handlers` hace que cada archivo abierto reutilice la misma ventana de la app en vez de abrir una instancia nueva por archivo.
- **KaTeX es opcional por diseño.** Se carga desde CDN y la app degrada a una aproximación en Unicode si el pedido falla, así el lector nunca depende de una llamada de red para mostrar un documento.

## Licencia

MIT — usalo, modificalo, y adaptalo a lo que necesites.

