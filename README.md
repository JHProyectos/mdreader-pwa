# mdreader-pwa

Lector de archivos Markdown standalone, offline-first e instalable como PWA. Un solo archivo HTML sin dependencias de build, con soporte de fórmulas matemáticas (KaTeX) y apertura de `.md` directamente desde el explorador de archivos en Android.

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

Basta con abrir `lector-md.html` en cualquier navegador moderno — doble clic, o `Ver con Chrome` desde el explorador de archivos. Desde ahí:

- **Abrir carpeta** — selecciona una carpeta completa; lista todos los `.md`/`.markdown`/`.txt` que contenga.
- **Abrir archivos sueltos** — selecciona uno o varios archivos puntuales.

Esta forma de uso no requiere hosting, no requiere conexión, y es la más simple si solo necesitás leer archivos que ya elegís vos mismo desde la app.

## Uso como PWA instalable (abrir `.md` desde el explorador)

Para que Android ofrezca esta app en el selector **"Abrir con"** al tocar un `.md` desde fuera de la app, es necesario que esté servida desde un origen HTTPS e instalada como PWA. Esto es una restricción de la plataforma: un archivo HTML abierto en `file://` no puede registrar un *service worker* ni un manifest, y sin eso Android no tiene forma de asociarlo a un tipo de archivo.

### Desplegar

1. Cloná este repo.
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
