# mdreader-pwa

[![Live demo](https://img.shields.io/badge/demo-live-34399B.svg)](https://mdreader-pwa.vercel.app/lector-md.html)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JHProyectos/mdreader-pwa)
 
**English** · [Español](#español)
 
A standalone, offline-first Markdown reader, installable as a PWA. Single HTML file with no build dependencies, math formula support (KaTeX), and the ability to open `.md` files directly from the Android file explorer.
 
> Replace `YOUR_USERNAME` in the badge above with your actual GitHub username once the repo is public, so the "Deploy" button points to your fork.
 
## Features
 
- **Single HTML file.** No build step, no `node_modules`, no framework. Open it directly in a browser or serve it as-is.
- **Works offline.** All Markdown processing happens client-side. Nothing you open ever leaves your machine.
- **Math formulas.** When online, it loads [KaTeX](https://katex.org/) from a CDN for real math typesetting (`$inline$` and `$$block$$`). Offline, it falls back to a readable Unicode approximation.
- **Open entire folders.** Browse multiple `.md` files from a project in a side panel, without uploading anything to a server.
- **Installable as a PWA with file handling.** Once installed on Android from an HTTPS origin, the system offers to open `.md`, `.markdown`, and `.txt` files directly with this app from the file explorer, Drive, or when sharing from another app.
- **Dedicated print styles.** A separate `@media print` stylesheet so what you read on screen prints cleanly.
## Why this exists
 
Online Markdown readers usually require uploading the file to some service, or are browser extensions tied to a single device. This project came out of a simple need: **open a `.md` file from a phone without uploading it anywhere**, even without internet access. The installable PWA version also solves the fact that Android has no app associated with the `.md` extension by default.
 
## Quick use (no installation needed)
 
Just open `lector-md.html` in any modern browser — double-click it, or "Open with Chrome" from the file explorer. From there:
 
- **Open folder** — select an entire folder; it lists every `.md`/`.markdown`/`.txt` file it contains.
- **Open individual files** — select one or several specific files.
This mode requires no hosting and no internet connection, and is the simplest option if you only need to read files you pick yourself from within the app.
 
## Installable PWA usage (opening `.md` from the file explorer)
 
For Android to offer this app in the **"Open with"** picker when tapping a `.md` file from outside the app, it needs to be served from an HTTPS origin and installed as a PWA. This is a platform restriction: an HTML file opened via `file://` cannot register a service worker or a manifest, and without those Android has no way to associate it with a file type.
 
### Deploy
 
1. Clone this repo (or use the "Deploy with Vercel" button above).
2. Deploy it to any static hosting provider — [Vercel](https://vercel.com), [GitHub Pages](https://pages.github.com/), [Netlify](https://netlify.com), etc. No build command is required: it's a fully static site.
3. Open the deployed URL in Chrome for Android.
### Install on your phone
 
1. With the URL open in Chrome, tap the **⋮ menu → "Install app"** (or the banner Chrome offers automatically).
2. Once installed, find any `.md` file in the file explorer, Drive, or shared from another app.
3. Choose **mdreader-pwa** from the "Open with" picker.
### Known limitations
 
- **iOS/Safari does not support the File Handling API.** On iPhone the app can be installed as a PWA (home screen icon, works offline), but the system won't offer it as an option to open `.md` files from outside the app. There, the only way to open a file is using the **Open folder / Open individual files** pickers inside the app itself.
- **Requires Chrome/Edge on Android (Chromium ≥102).** Other Android browsers may not support `file_handlers`.
## Project structure
 
```
├── lector-md.html          # The full app: HTML + CSS + JS in a single file
├── manifest.json            # PWA metadata + file_handlers declaration
├── sw.js                    # Service worker: caches the shell for offline use
├── icon-192.png              # App icon (192×192)
├── icon-512.png              # App icon (512×512)
├── icon-maskable-512.png     # "Maskable" variant (Android may crop it into different shapes)
├── index.html                # Simple redirect to lector-md.html
└── vercel.json                # Required headers for manifest.json and sw.js on Vercel
```
 
`lector-md.html` is fully self-contained: you can copy just that one file and use it without anything else from this repo. The other files are only needed for the installable file-handling mode.
 
## Technical notes
 
- The service worker uses a **cache-first** strategy for the app's own resources (the shell) and **network-first with cache fallback** for KaTeX, which is loaded from `cdnjs.cloudflare.com`. This keeps previously-viewed formulas available offline, while picking up the latest version whenever there's an internet connection.
- The **maskable** icon has its content scaled to 80% and centered, inside the "safe zone" that Android respects when cropping the icon into different shapes (circle, squircle, etc. depending on the manufacturer).
- The manifest declares `"launch_type": "single-client"` in `file_handlers`: each opened file reuses the same app window instead of opening a new instance per file.
## License
 
MIT — use it, modify it, and adapt it to whatever you need.
 
---
 
<a name="español"></a>
 
# mdreader-pwa (Español)
 
[English](#mdreader-pwa) · **Español**
 
Lector de archivos Markdown standalone, offline-first e instalable como PWA. Un solo archivo HTML sin dependencias de build, con soporte de fórmulas matemáticas (KaTeX) y apertura de `.md` directamente desde el explorador de archivos en Android.
 
> Reemplazá `YOUR_USERNAME` en el badge de arriba por tu usuario real de GitHub una vez que publiques el repo, para que el botón "Deploy" apunte a tu copia.
 
## Características
 
- **Un solo archivo HTML.** Sin paso de build, sin `node_modules`, sin framework. Se puede abrir directo en el navegador o servir como está.
- **Funciona sin conexión.** Todo el procesamiento de Markdown ocurre en el cliente. Nada de lo que abrís sale de tu máquina.
- **Fórmulas matemáticas.** Si hay conexión, carga [KaTeX](https://katex.org/) desde CDN para tipografía matemática real (`$inline$` y `$$bloque$$`). Sin conexión, cae a una aproximación en Unicode legible.
- **Abrir carpetas completas.** Navegá varios `.md` de un proyecto desde un panel lateral, sin subir nada a un servidor.
- **Instalable como PWA con *file handling*.** Instalado en Android desde un origen HTTPS, el sistema ofrece abrir archivos `.md`, `.markdown` y `.txt` directamente con esta app desde el explorador de archivos, Drive, o al compartir desde otra app.
- **Impresión con estilos dedicados.** Hoja de estilos `@media print` propia para que lo que se lee en pantalla se imprima limpio.
## Por qué existe
 
Los lectores de Markdown online suelen requerir subir el archivo a algún servicio, o son extensiones de navegador atadas a un solo dispositivo. Este proyecto nació de una necesidad simple: **abrir un `.md` desde el celular sin subirlo a ningún lado**, aunque no haya internet. La versión PWA con file handling resuelve además el problema de que Android no tiene, por defecto, ninguna app asociada a la extensión `.md`.
 
## Uso rápido (sin instalar nada)
 
Basta con abrir `lector-md.html` en cualquier navegador moderno — doble clic, o "Ver con Chrome" desde el explorador de archivos. Desde ahí:
 
- **Abrir carpeta** — selecciona una carpeta completa; lista todos los `.md`/`.markdown`/`.txt` que contenga.
- **Abrir archivos sueltos** — selecciona uno o varios archivos puntuales.
Esta forma de uso no requiere hosting, no requiere conexión, y es la más simple si solo necesitás leer archivos que ya elegís vos mismo desde la app.
 
## Uso como PWA instalable (abrir `.md` desde el explorador)
 
Para que Android ofrezca esta app en el selector **"Abrir con"** al tocar un `.md` desde fuera de la app, es necesario que esté servida desde un origen HTTPS e instalada como PWA. Esto es una restricción de la plataforma: un archivo HTML abierto en `file://` no puede registrar un *service worker* ni un manifest, y sin eso Android no tiene forma de asociarlo a un tipo de archivo.
 
### Desplegar
 
1. Cloná este repo (o usá el botón "Deploy with Vercel" de arriba).
2. Desplegalo en cualquier hosting estático — [Vercel](https://vercel.com), [GitHub Pages](https://pages.github.com/), [Netlify](https://netlify.com), etc. No requiere build command: es un sitio 100% estático.
3. Abrí la URL desplegada en Chrome para Android.
### Instalar en el celular
 
1. Con la URL abierta en Chrome, tocá el menú **⋮ → "Instalar app"** (o el banner que ofrece Chrome automáticamente).
2. Una vez instalada, buscá cualquier `.md` en el explorador de archivos, Drive, o compartido desde otra app.
3. Elegí **mdreader-pwa** en el selector "Abrir con".
### Limitaciones conocidas
 
- **iOS/Safari no soporta la File Handling API.** En iPhone la app se puede instalar como PWA (ícono en el home, funciona offline), pero el sistema no va a ofrecerla como opción para abrir `.md` desde fuera de la app. Ahí la única forma de abrir un archivo es usando los selectores **Abrir carpeta / Abrir archivos sueltos** dentro de la propia app.
- **Requiere Chrome/Edge en Android (Chromium ≥102).** Otros navegadores para Android pueden no soportar `file_handlers`.
## Estructura del proyecto
 
```
├── lector-md.html          # La app completa: HTML + CSS + JS en un solo archivo
├── manifest.json            # Metadata de PWA + declaración de file_handlers
├── sw.js                    # Service worker: cachea el shell para uso offline
├── icon-192.png              # Ícono de la app (192×192)
├── icon-512.png              # Ícono de la app (512×512)
├── icon-maskable-512.png     # Variante "maskable" (Android puede recortarla en distintas formas)
├── index.html                # Redirección simple a lector-md.html
└── vercel.json                # Headers necesarios para manifest.json y sw.js en Vercel
```
 
`lector-md.html` es completamente autocontenido: podés copiar únicamente ese archivo y usarlo sin ningún otro del repo. Los demás archivos solo son necesarios para el modo instalable con file handling.
 
## Notas técnicas
 
- El *service worker* usa estrategia **cache-first** para los recursos propios (shell de la app) y **network-first con fallback a cache** para KaTeX, que se carga desde `cdnjs.cloudflare.com`. Esto permite que las fórmulas ya vistas sigan disponibles sin conexión, mientras se toma la versión más reciente cuando hay internet.
- El ícono **maskable** tiene el contenido escalado al 80% y centrado, dentro de la "zona segura" que Android respeta al recortar el ícono en distintas formas (círculo, squircle, etc. según el fabricante).
- El manifest declara `"launch_type": "single-client"` en `file_handlers`: cada archivo abierto reutiliza la misma ventana de la app en vez de abrir una instancia nueva por archivo.
## Licencia
 
MIT — usalo, modificalo, y adaptalo a lo que necesites.
