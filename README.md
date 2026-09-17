# mdreader-pwa

[![Live demo](https://img.shields.io/badge/demo-live-34399B.svg)](https://mdreader.jhproyectos.com.ar)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://mdreader.jhproyectos.com.ar)
[![Markdown](https://img.shields.io/badge/Markdown-.md%20%20%20-000000?logo=markdown&logoColor=white)](#features)
[![Math: KaTeX](https://img.shields.io/badge/math-KaTeX-008080?logo=latex&logoColor=white)](https://katex.org/)
[![Diagrams: Mermaid](https://img.shields.io/badge/diagrams-Mermaid-FF3670?logo=mermaid&logoColor=white)](https://mermaid.js.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/JHProyectos/mdreader-pwa)


**English** · [Español](#español)

A standalone, offline-first Markdown reader, installable as a PWA. Single HTML file with no build dependencies, math formula support (KaTeX), diagrams (Mermaid), and integration with the OS so you can open `.md` files straight from other apps.

## Features

- **Single HTML file.** No build step, no `node_modules`, no framework. Open it directly in a browser or serve it as-is.
- **Works offline.** All Markdown processing happens client-side. Nothing you open ever leaves your machine.
- **Math formulas.** When online, it loads [KaTeX](https://katex.org/) from a CDN for real math typesetting (`$inline$` and `$$block$$`). Offline, it falls back to a readable Unicode approximation.
- **Diagrams.** ` ```mermaid ` blocks are drawn with [Mermaid](https://mermaid.js.org/) — flowcharts, sequence, class, state, Gantt. They follow the reader's theme and are redrawn in light colors before printing. If the library can't be loaded, the block stays visible as source code.
- **Syntax highlighting.** Code blocks tagged with JavaScript, TypeScript, Python, HTML, CSS, Java, C or C# are highlighted with [Prism](https://prismjs.com/), loaded on demand. Colors come from the reader's own theme. Without a connection, or for any other language, the block is shown in a single color.
- **Bar, line, area, scatter and pie charts.** A ` ```grafico ` (or ` ```chart `) block turns a small comma-, semicolon- or tab-separated table into a chart, drawn by the reader itself as SVG — no library, so it works offline too. It follows the theme, prints in light colors, shows every value on hover, and has a **Ver datos** table view. The scatter uses a numeric horizontal axis when the categories are numbers, and the pie labels each slice with its share.
- **In-document table of contents.** A `[TOC]` line is replaced by a linked list of the document's headings. Unlike the side panel, it prints.
- **Open entire folders.** Browse multiple `.md` files from a project in a side panel, without uploading anything to a server.
- **Import from a GitHub repo.** Point it at `owner/repo` (or paste the repo URL) and it pulls every `.md`/`.markdown`/`.txt` file from the latest commit of a branch — no git clone, no history. Private repos work too, with a personal access token you paste once and can choose to remember in the browser. A **↻ Actualizar** button re-fetches the latest commit on demand.
- **Open files from other apps.** On **Android**, the installed app appears in the system **Share** sheet — send a `.md` from WhatsApp, Drive, Telegram, or a file manager straight into the reader. On **desktop** (Windows, macOS, Linux, ChromeOS), it registers as a file handler and appears in the **"Open with"** menu.
- **Keeps your workspace.** Loaded documents, the selected file, and the reading position are stored locally and restored after closing, restarting, or updating the app. A document stays loaded until you remove it explicitly.
- **Updates itself.** New deploys reach installed copies automatically — no cache clearing, no reinstalling. See [Updates](#updates).
- **Dedicated print styles.** A separate `@media print` stylesheet so what you read on screen prints cleanly.
- **Built-in help.** A **? Help** button opens a sample document that explains what the reader does and which Markdown it understands. Every feature is shown twice: first the source exactly as it goes in the file, then the rendered result. It travels inside `index.html`, so it is there on a first run and on a USB copy with no connection.
- **English and Spanish.** The interface and the help follow the browser's language, and an **EN** / **ES** button in the side panel switches between them. The choice is remembered. Documents themselves are never translated or altered.

## Why this exists

Online Markdown readers usually require uploading the file to some service, or are browser extensions tied to a single device. This project came out of a simple need: **open a `.md` file from a phone without uploading it anywhere**, even without internet access. The installable PWA version also works around the fact that Android has no app associated with the `.md` extension by default.

## Quick use (no installation needed)

Try it right now at **[mdreader.jhproyectos.com.ar](https://mdreader.jhproyectos.com.ar)**, or open `index.html` locally in any modern browser — double-click it, or "Open with Chrome" from the file explorer. From there:

- **Open folder** — select an entire folder; it lists every `.md`/`.markdown`/`.txt` file it contains.
- **Open individual files** — select one or several specific files.
- **Drag and drop** — drop files anywhere on the reading pane.

On narrow screens the side panel collapses; the **☰** button in the top bar opens it, and the same pickers are also available on the empty state, next to **See an example**, which opens the built-in help.

This mode requires no hosting and no internet connection, and is the simplest option if you only need to read files you pick yourself from within the app.

### Import from a GitHub repo

Click **Importar de GitHub**, paste `owner/repo` or the repo's URL, and (optionally) a branch — it defaults to the repo's default branch. This does not clone the repository: it reads the file tree of the latest commit through GitHub's API and downloads only the `.md`, `.markdown` and `.txt` files it finds.

- **Public repos** need nothing else.
- **Private repos** need a personal access token with read-only access to the repo's contents — the dialog links straight to creating one, scoped to just that repo. The token stays in this browser only, and only if you tick "remember".
- Once imported, a **↻ Actualizar** button appears next to the file list: it re-fetches the latest commit, updating changed files, adding new ones, and removing files that no longer exist upstream.

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

### Install on an iPhone or iPad

1. Open the URL and tap the browser's **Share** button → **Add to Home Screen**.
2. Launch it from the home screen: standalone window, its own icon, offline support.
3. To read a file, tap **Open files** and pick your `.md` from the **Files** app. A file someone sent you over WhatsApp or Telegram has to be saved with **Save to Files** first.

The app detects iOS and adapts on its own: it hides **Open folder** (`webkitdirectory` is declared in WebKit but the picker ignores it), drops the `accept` filter on the file input (the Files picker turns extension lists into system types and ends up greying everything out), promotes **Open files** to the primary action, and swaps the Android share instructions for the ones above. The detection is user-agent based on purpose — feature detection reports these APIs as present on iOS.

Installing matters more here than on other platforms: WebKit wipes a plain website's IndexedDB and caches after seven days without a visit, and home screen web apps are exempt.

### Known limitations

- **iOS/Safari supports neither File Handling nor Share Target for files.** On iPhone the app can be installed as a PWA (home screen icon, works offline), but the system won't offer it as a way to open `.md` files from outside the app. There, the only way in is the **Open files** picker inside the app itself. Full integration would require a native wrapper (WKWebView plus a declared document type), which this repo does not do.
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
const VERSION = "v0.10.0";
```

The share-target cache and the IndexedDB workspace are excluded from that cleanup. Therefore, deleting an old application cache never removes a loaded document. The workspace is cleared only with **Clear all**, by removing documents individually, or by clearing the site's browser data.

## Project structure

```
├── index.html                # The full app: HTML + CSS + JS in a single file
├── ejemplo.md                # Sample document in Spanish: manual and live demo of the supported syntax
├── example.md                # The same sample document in English
├── ejemplo-portada.png       # Illustration shown at the top of that document
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
- **Mermaid is loaded on demand.** The library weighs about 3 MB, so it is only requested when the open document actually contains a diagram; after that the service worker caches it and diagrams keep working offline. The parser emits the source inside a `<pre>` and the SVG replaces it once drawn, which makes "no library" and "invalid diagram" the same, already-readable fallback.
- **Prism is loaded on demand, in manual mode.** The core bundle plus the five extra grammars weigh about 33 KB, requested only when the open document has a code block in a supported language. Prism only tags tokens with classes; the colors are the reader's own CSS variables, so highlighting follows the theme without a third-party stylesheet and prints in light colors. Once highlighted, a search can't match across two differently colored tokens, the same way it can't across bold and plain text.
- **Charts are drawn by the reader, not by a library.** Bars, lines, areas, points and slices are simple enough that a charting library would cost more than it gives, and an in-house renderer keeps the offline, single-file case working. The SVG takes its colors from CSS variables instead of baking them in, so switching theme or printing needs no redraw; it is redrawn only when the column width changes, because it is built at real pixel size to keep axis text legible on a phone. The series palette is a categorical order checked for color-vision deficiency and contrast against both surfaces; since three light-mode hues fall below 3:1, every chart ships a table view.
- **Diagram text is excluded from the in-document search.** A rendered diagram is SVG, and an HTML `<mark>` inside it would not paint — it would make the matched text disappear. Hidden nodes (the diagram source behind a drawn SVG) are skipped for the same reason: a hit that can't be shown shouldn't be counted.
- **The help document is embedded, not fetched.** There is one `<script type="text/markdown">` block per language, where the Markdown stays raw and readable without escaping the backticks of its own code fences. Fetching `ejemplo.md` instead would break the portable case: opened over `file://`, the browser refuses to read the file next to it, which is exactly the situation where built-in help matters most. The help is a separate view — it never enters the file list or IndexedDB, since that list means *your* files. `ejemplo.md` and `example.md` at the repo root are copies of those two blocks, kept for reading on GitHub. The embedded blocks are the source: edit them and copy the text over.
- **Every visible string lives in one table.** `TEXTOS` holds a Spanish and an English entry per key. Static elements carry `data-t`, `data-t-title`, `data-t-placeholder` or `data-t-aria`, and a small script placed before the help blocks fills them in before the first paint. The language is the first entry of `navigator.languages` that is Spanish or English (English if none is) unless the user picked one. Only user-facing text is translated; code comments and identifiers stay in Spanish. A web app manifest can't vary by language, so the installed app keeps the name *Lector MD* and its Spanish description.
- **Diagrams are redrawn in light colors for printing.** Mermaid bakes colors into the SVG, so a diagram rendered in dark theme would print as pale strokes on white paper. The ⎙ PDF button redraws them light, prints, and restores the screen theme. Pressing Ctrl+P directly bypasses this and prints with the current theme.
- **GitHub import reads the API, not a clone.** It resolves the default branch when none is given, asks for the recursive tree of that one commit, filters it down to `.md`/`.markdown`/`.txt`, and downloads each file's content by blob SHA (Git's own content-addressed hash, listed in the tree response) rather than by branch name and path. `raw.githubusercontent.com` is a CDN that can lag a few minutes behind a fresh push for a given branch/path, no matter what the client does — a SHA-addressed request has no such window, since the hash only ever means one exact content. Every request also carries a timestamp and `cache: "no-store"`, and the service worker leaves `api.github.com` uncached, so **Actualizar** always sees the real latest commit.
- **Images inside an imported `.md` are cached by content, not by URL.** An `<img>` pointing at `raw.githubusercontent.com` is a fixed URL that never tells you whether the file behind it changed, so a naive cache would either serve stale images forever or re-fetch every one of them on every open. The reader avoids both: the recursive tree call it already makes for `.md` files also returns the blob SHA of every image in the repo, at no extra request cost, and the page hands that SHA map to the service worker through IndexedDB — the one store the origin's worker can read directly, without `postMessage`. On each image request the worker compares the known SHA against the one stored alongside its cached response; a match is served straight from that cache, and only a mismatch (or a first-time image) touches the network. This is the same content-addressing principle already used for `.md` blobs, just applied one layer further down, and it keeps `raw.githubusercontent.com` traffic proportional to what actually changed in the repo, not to how many times a document gets reopened:

    ```mermaid
    sequenceDiagram
      participant P as Page
      participant API as api.github.com
      participant SW as Service Worker
      participant IDB as IndexedDB

      P->>API: GET /git/trees/branch?recursive=1
      API-->>P: full tree (SHAs for .md files and images)
      P->>API: GET /git/blobs/{sha} for each .md
      Note over P,API: this always happens, whether content changed or not
      P->>IDB: store image SHAs
      Note over SW,IDB: images have NOT been requested yet
      Note over P: the browser repaints the <img>
      P->>SW: fetch image (same SHA it already had cached)
      SW->>IDB: look up known SHA for that URL -> same SHA
      SW-->>P: serve from IMG_CACHE, no network request
    ```

## License

MIT — use it, modify it, and adapt it to whatever you need.

---

<a name="español"></a>

# mdreader-pwa (Español)

[English](#mdreader-pwa) · **Español**

Lector de archivos Markdown standalone, offline-first e instalable como PWA. Un solo archivo HTML sin dependencias de build, con soporte de fórmulas matemáticas (KaTeX), diagramas (Mermaid) e integración con el sistema operativo para abrir `.md` desde otras apps.

## Características

- **Un solo archivo HTML.** Sin paso de build, sin `node_modules`, sin framework. Se puede abrir directo en el navegador o servir como está.
- **Funciona sin conexión.** Todo el procesamiento de Markdown ocurre en el cliente. Nada de lo que abrís sale de tu máquina.
- **Fórmulas matemáticas.** Si hay conexión, carga [KaTeX](https://katex.org/) desde CDN para tipografía matemática real (`$inline$` y `$$bloque$$`). Sin conexión, cae a una aproximación en Unicode legible.
- **Diagramas.** Los bloques ` ```mermaid ` se dibujan con [Mermaid](https://mermaid.js.org/): flujos, secuencias, clases, estados, Gantt. Siguen el tema del lector y se redibujan en claro antes de imprimir. Si la librería no se puede cargar, el bloque queda a la vista como código fuente.
- **Resaltado de código.** Los bloques con lenguaje JavaScript, TypeScript, Python, HTML, CSS, Java, C o C# se resaltan con [Prism](https://prismjs.com/), que se carga a demanda. Los colores son los del tema del lector. Sin conexión, o con otro lenguaje, el bloque se ve en un solo color.
- **Gráficos de barras, líneas, área, dispersión y torta.** Un bloque ` ```grafico ` (o ` ```chart `) convierte una tabla chica, separada por comas, punto y coma o tabulaciones, en un gráfico que dibuja el propio lector en SVG: sin librerías, así que funciona también sin conexión. Sigue el tema, se imprime en claro, muestra los valores al pasar el mouse y tiene una vista de tabla en **Ver datos**. La dispersión usa eje horizontal numérico cuando las categorías son números, y la torta muestra el porcentaje de cada porción.
- **Índice dentro del documento.** Una línea `[TOC]` se reemplaza por la lista de encabezados con enlaces a cada sección. A diferencia del panel lateral, sale impresa.
- **Abrir carpetas completas.** Navegá varios `.md` de un proyecto desde un panel lateral, sin subir nada a un servidor.
- **Importar un repo de GitHub.** Apuntalo a `usuario/repo` (o pegá la URL) y trae todos los `.md`/`.markdown`/`.txt` del último commit de una rama — sin clonar, sin historial. También funciona con repos privados, con un personal access token que se pega una vez y se puede recordar en el navegador. Un botón **↻ Actualizar** vuelve a traer el último commit cuando quieras.
- **Abrir archivos desde otras apps.** En **Android**, la app instalada aparece en el menú **Compartir** del sistema: mandá un `.md` desde WhatsApp, Drive, Telegram o el explorador directo al lector. En **escritorio** (Windows, macOS, Linux, ChromeOS) se registra como file handler y aparece en **"Abrir con"**.
- **Conserva el área de trabajo.** Los documentos cargados, el archivo seleccionado y la posición de lectura se guardan localmente y se restauran después de cerrar, reiniciar o actualizar la app. Un documento permanece cargado hasta que lo quitás explícitamente.
- **Se actualiza sola.** Los deploys nuevos llegan solos a las copias instaladas, sin limpiar caché ni reinstalar. Ver [Actualizaciones](#actualizaciones).
- **Impresión con estilos dedicados.** Hoja de estilos `@media print` propia para que lo que se lee en pantalla se imprima limpio.
- **Ayuda incorporada.** El botón **? Ayuda** abre un documento de ejemplo que cuenta qué hace el lector y qué Markdown entiende. Cada función aparece dos veces: primero el texto tal como va en el archivo y después el resultado. Viaja adentro de `index.html`, así que está desde el primer arranque y también en una copia en pendrive sin conexión.
- **Español e inglés.** La interfaz y la ayuda siguen el idioma del navegador, y un botón **EN** / **ES** en el panel lateral cambia entre los dos. La elección queda guardada. Los documentos nunca se traducen ni se modifican.

## Por qué existe

Los lectores de Markdown online suelen requerir subir el archivo a algún servicio, o son extensiones de navegador atadas a un solo dispositivo. Este proyecto nació de una necesidad simple: **abrir un `.md` desde el celular sin subirlo a ningún lado**, aunque no haya internet. La versión instalable además resuelve que Android no tenga, por defecto, ninguna app asociada a la extensión `.md`.

## Uso rápido (sin instalar nada)

Probalo ahora mismo en **[mdreader.jhproyectos.com.ar](https://mdreader.jhproyectos.com.ar)**, o abrí `index.html` localmente en cualquier navegador moderno — doble clic, o "Ver con Chrome" desde el explorador de archivos. Desde ahí:

- **Abrir carpeta** — selecciona una carpeta completa; lista todos los `.md`/`.markdown`/`.txt` que contenga.
- **Abrir archivos sueltos** — selecciona uno o varios archivos puntuales.
- **Arrastrar y soltar** — soltá los archivos sobre el panel de lectura.

En pantallas angostas el panel lateral se pliega; el botón **☰** de la barra superior lo abre, y los mismos selectores están también en la pantalla de inicio, junto a **Ver un ejemplo**, que abre la ayuda incorporada.

Esta forma de uso no requiere hosting, no requiere conexión, y es la más simple si solo necesitás leer archivos que ya elegís vos mismo desde la app.

### Importar un repo de GitHub

Tocá **Importar de GitHub**, pegá `usuario/repo` o la URL del repo, y opcionalmente una rama (si no ponés nada, usa la rama por defecto). Esto no clona el repositorio: lee el árbol de archivos del último commit a través de la API de GitHub y descarga sólo los `.md`, `.markdown` y `.txt` que encuentra.

- **Repos públicos** no necesitan nada más.
- **Repos privados** necesitan un personal access token con acceso de solo lectura al contenido del repo — el diálogo trae un enlace directo para crear uno, limitado a ese repositorio. El token queda solo en este navegador, y solo si tildás "recordar".
- Una vez importado, aparece un botón **↻ Actualizar** junto a la lista de archivos: vuelve a traer el último commit, actualiza lo que cambió, agrega lo nuevo y saca lo que ya no está en el repo.

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

### Instalar en iPhone o iPad

1. Abrí la URL y tocá el botón **Compartir** del navegador → **Agregar a inicio**.
2. Abrila desde la pantalla de inicio: ventana propia, ícono propio, funciona sin internet.
3. Para leer un archivo, tocá **Abrir archivos** y elegí el `.md` desde la app **Archivos**. Si te lo mandaron por WhatsApp o Telegram, primero hay que guardarlo con **Guardar en Archivos**.

La app detecta iOS y se acomoda sola: esconde **Abrir carpeta** (`webkitdirectory` existe en WebKit pero el selector lo ignora), le saca el filtro `accept` al input de archivos (el selector de Archivos traduce las extensiones a tipos del sistema y termina mostrando todo en gris), deja **Abrir archivos** como acción principal y cambia las instrucciones de Android por las de arriba. La detección va por user agent a propósito: por capacidades, iOS declara esas APIs como presentes.

Acá instalarla pesa más que en otras plataformas: WebKit borra el IndexedDB y los cachés de un sitio común a los siete días sin visitas, y las apps agregadas a la pantalla de inicio quedan exentas.

### Limitaciones conocidas

- **iOS/Safari no soporta ni File Handling ni Share Target para archivos.** En iPhone la app se puede instalar como PWA (ícono en el home, funciona offline), pero el sistema no la va a ofrecer para abrir `.md` desde fuera de la app. Ahí la única entrada es el selector **Abrir archivos** dentro de la propia app. Para integrarla de verdad haría falta una envoltura nativa (WKWebView más un document type declarado), cosa que este repo no hace.
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
const VERSION = "v0.10.0";
```

El caché del share target y el área de trabajo guardada en IndexedDB quedan fuera de esa limpieza. Por eso borrar un caché viejo de la aplicación nunca elimina un documento cargado. El área de trabajo sólo se vacía con **Limpiar todo**, quitando cada documento o borrando los datos del sitio desde el navegador.

## Estructura del proyecto

```
├── index.html                # La app completa: HTML + CSS + JS en un solo archivo
├── ejemplo.md                # Documento de muestra en español: manual y demo viva de la sintaxis soportada
├── example.md                # El mismo documento de muestra, en inglés
├── ejemplo-portada.png       # Ilustración que encabeza ese documento
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
- **Mermaid se carga a demanda.** La librería pesa unos 3 MB, así que se pide recién cuando el documento abierto tiene algún diagrama; después el service worker la cachea y los diagramas siguen funcionando sin conexión. El parser deja el código fuente en un `<pre>` y el SVG lo reemplaza una vez dibujado, de modo que "sin librería" y "diagrama inválido" caen en el mismo respaldo, que ya es legible.
- **Prism se carga a demanda y en modo manual.** El paquete base más las cinco gramáticas extra pesan unos 33 KB, y se piden sólo si el documento abierto tiene un bloque de código en un lenguaje soportado. Prism sólo marca los fragmentos con clases; los colores son variables CSS del propio lector, así el resaltado sigue el tema sin una hoja de estilos de terceros y se imprime en claro. Una vez resaltado, la búsqueda no encuentra un texto que cruce dos fragmentos de distinto color, igual que no lo encuentra entre negrita y texto normal.
- **Los gráficos los dibuja el lector, no una librería.** Barras, líneas, áreas, puntos y porciones son lo bastante simples como para que una librería de gráficos cueste más de lo que aporta, y un dibujo propio mantiene funcionando el caso de un solo archivo sin conexión. El SVG toma los colores de variables CSS en vez de hornearlos, así que cambiar de tema o imprimir no obliga a redibujar; sólo se redibuja si cambia el ancho de la columna, porque se arma a tamaño real para que el texto de los ejes se lea en el celular. La paleta de series es un orden categórico verificado para daltonismo y contraste contra los dos fondos; como tres tonos del tema claro quedan por debajo de 3:1, cada gráfico trae una vista de tabla.
- **El texto de los diagramas queda fuera de la búsqueda.** Un diagrama dibujado es SVG, y un `<mark>` de HTML adentro no se pinta: haría desaparecer el texto encontrado. Lo oculto (el código fuente detrás de un SVG ya dibujado) se saltea por lo mismo: no tiene sentido contar un resultado que no se puede mostrar.
- **El documento de ayuda va embebido, no se baja.** Hay un bloque `<script type="text/markdown">` por idioma, donde el Markdown queda crudo y legible sin tener que escapar los acentos graves de sus propios bloques de código. Bajar `ejemplo.md` rompería el caso portátil: abierto con `file://` el navegador no deja leer el archivo de al lado, que es justo la situación donde una ayuda incorporada más sirve. La ayuda es una vista aparte: nunca entra en la lista de archivos ni en IndexedDB, porque esa lista es de *tus* archivos. `ejemplo.md` y `example.md`, en la raíz, son copias de esos dos bloques para poder leerlos en GitHub. El original son los bloques embebidos: se editan ahí y se copia el texto.
- **Todos los textos visibles están en una tabla.** `TEXTOS` tiene una entrada en español y otra en inglés por clave. Los elementos fijos llevan `data-t`, `data-t-title`, `data-t-placeholder` o `data-t-aria`, y un script chico ubicado antes de los bloques de ayuda los completa antes del primer cuadro. El idioma es el primero de `navigator.languages` que sea español o inglés (inglés si no hay ninguno), salvo que el usuario haya elegido otro. Sólo se traduce lo que ve el usuario; los comentarios y los nombres del código siguen en español. El manifest de una PWA no puede variar según el idioma, así que la app instalada conserva el nombre *Lector MD* y su descripción en español.
- **Los diagramas se redibujan en claro para imprimir.** Mermaid hornea los colores dentro del SVG, así que un diagrama renderizado en tema oscuro saldría con trazos pálidos sobre papel blanco. El botón ⎙ PDF los redibuja en claro, imprime y restaura el tema de pantalla. Con Ctrl+P directo eso no se puede interceptar y sale con el tema actual.
- **La importación de GitHub lee la API, no clona nada.** Resuelve la rama por defecto si no se indica ninguna, pide el árbol recursivo de ese commit puntual, lo filtra a `.md`/`.markdown`/`.txt`, y descarga el contenido de cada archivo por su SHA de blob (el hash de contenido propio de Git, que ya viene en la respuesta del árbol), no por rama+ruta. `raw.githubusercontent.com` es un CDN que puede tardar unos minutos en reflejar un push reciente para una rama/ruta dada, sin importar lo que haga el cliente; un pedido direccionado por SHA no tiene esa ventana, porque el hash sólo puede significar un contenido exacto. Cada pedido además lleva marca de tiempo y `cache: "no-store"`, y el service worker deja `api.github.com` sin cachear, así que **Actualizar** siempre ve el último commit real.
- **Las imágenes de un `.md` importado se cachean por contenido, no por URL.** Un `<img>` que apunta a `raw.githubusercontent.com` es una URL fija que nunca dice si el archivo detrás cambió, así que un caché ingenuo terminaría sirviendo imágenes viejas para siempre, o volviendo a pedir todas en cada apertura. El lector evita las dos cosas: el mismo pedido de árbol recursivo que ya hace para los `.md` también devuelve el SHA de blob de cada imagen del repo, sin ningún pedido extra, y la página le pasa ese mapa de SHAs al service worker a través de IndexedDB —el único almacén que el worker del origen puede leer directo, sin `postMessage`—. En cada pedido de imagen, el worker compara el SHA conocido contra el que quedó guardado junto a la respuesta cacheada: si coincide, la sirve directo de ese caché, y sólo un SHA distinto (o una imagen nunca vista) toca la red. Es el mismo principio de direccionamiento por contenido que ya se usa para los blobs de los `.md`, aplicado una capa más abajo, y mantiene el tráfico contra `raw.githubusercontent.com` proporcional a lo que realmente cambió en el repo, no a cuántas veces se reabre un documento:

    ```mermaid
    sequenceDiagram
      participant P as Página
      participant API as api.github.com
      participant SW as Service Worker
      participant IDB as IndexedDB

      P->>API: GET /git/trees/rama?recursive=1
      API-->>P: árbol completo (SHAs de .md e imágenes)
      P->>API: GET /git/blobs/{sha} por cada .md
      Note over P,API: esto SIEMPRE pasa, cambie o no el contenido
      P->>IDB: guardarShaImagenesGithub (nuevos SHAs de imagen)
      Note over SW,IDB: las imágenes NO se pidieron todavía
      Note over P: el navegador vuelve a pintar el <img>
      P->>SW: fetch imagen (mismo SHA que ya tenía cacheado)
      SW->>IDB: shaConocidoDe(url) -> mismo SHA
      SW-->>P: responde desde IMG_CACHE, sin ir a la red
    ```

## Licencia

MIT — usalo, modificalo, y adaptalo a lo que necesites.
