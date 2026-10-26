// Voz mejorada del Lector MD: Supertonic 2 (int8) corriendo en este worker.
//
// La página le manda fragmentos de texto ya preparados para decir (los mismos
// que usa la voz del sistema) y recibe el audio. Corre acá y no en la página
// porque generar cada frase tarda: en la página trabaría la pantalla.
//
// Mensajes que recibe:
//   {tipo:"cargar"}                         baja lo que falte y prepara el modelo
//   {tipo:"generar", id, texto, idioma, voz, pasos}
// Mensajes que manda:
//   {tipo:"progreso", hecho, total}         bytes bajados, mientras descarga
//   {tipo:"listo"}
//   {tipo:"audio", id, audio, sr, ms}       audio: Float32Array (transferido)
//   {tipo:"error", id?, mensaje}
//
// Todo se guarda en un caché propio, "lector-md-voz", sin número de versión:
// el service worker no lo toca, así sobrevive a las actualizaciones del
// lector. Las URLs apuntan a revisiones fijas, así que nunca cambian.
//
// Modelo: Supertonic 2 de Supertone (OpenRAIL-M), cuantizado a int8 por
// sherpa-onnx. El código de inferencia sigue el ejemplo web oficial
// (github.com/supertone-inc/supertonic, MIT).

const CACHE = "lector-md-voz";
const MARCA = new URL("/__voz-completa__", self.location.origin).href;

const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";
const MODELO = "https://huggingface.co/csukuangfj2/sherpa-onnx-supertonic-tts-int8-2026-03-06/resolve/5dec5897b86e2b293790eedb5e1f561a3295651f/";
const CONFIG = "https://huggingface.co/Supertone/supertonic-2/resolve/75e6727618a02f323c720cba9478152d4bc16ca4/";

const VOCES = ["F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5"];
const PARTES = ["duration_predictor", "text_encoder", "vector_estimator", "vocoder"];

// Los tamaños sólo sirven para la barra de progreso.
const ARCHIVOS = [
  {url: ORT + "ort.wasm.bundle.min.mjs", bytes: 72799},
  {url: ORT + "ort-wasm-simd-threaded.wasm", bytes: 13479978},
  {url: CONFIG + "onnx/tts.json", bytes: 8699},
  {url: CONFIG + "onnx/unicode_indexer.json", bytes: 262196},
  ...VOCES.map(v => ({url: CONFIG + "voice_styles/" + v + ".json", bytes: 420000})),
  {url: MODELO + "duration_predictor.int8.onnx", bytes: 1521526},
  {url: MODELO + "text_encoder.int8.onnx", bytes: 27431318},
  {url: MODELO + "vector_estimator.int8.onnx", bytes: 40686657},
  {url: MODELO + "vocoder.int8.onnx", bytes: 25977132}
];

let motor = null;      // {ort, cfg, indexer, dp, enc, est, voc}
let cargando = null;   // promesa de la carga en curso
const estilos = {};
let cola = Promise.resolve();   // las generaciones van de a una

async function bajarTodo(){
  const cache = await caches.open(CACHE);
  const total = ARCHIVOS.reduce((s, a) => s + a.bytes, 0);
  let hecho = 0;
  const avisar = () => postMessage({tipo: "progreso", hecho: Math.min(hecho, total), total});

  const faltan = [];
  for(const a of ARCHIVOS){
    if(await cache.match(a.url)) hecho += a.bytes;
    else faltan.push(a);
  }
  if(!faltan.length){
    if(!(await cache.match(MARCA))) await cache.put(MARCA, new Response("1"));
    return;
  }
  avisar();

  for(const a of faltan){
    // no-store: el archivo ya queda en este caché, no hace falta otra copia
    // en el caché HTTP del navegador.
    const r = await fetch(a.url, {cache: "no-store"});
    if(!r.ok) throw new Error("HTTP " + r.status + " · " + a.url.split("/").pop());
    const lector = r.body.getReader();
    const trozos = [];
    let n = 0, ultimo = 0;
    for(;;){
      const {done, value} = await lector.read();
      if(done) break;
      trozos.push(value);
      n += value.length;
      // Sin pasarse del tamaño esperado, por si el archivo cambió un poco.
      if(n - ultimo > 512 * 1024){
        hecho += Math.min(n, a.bytes) - Math.min(ultimo, a.bytes);
        ultimo = n;
        avisar();
      }
    }
    hecho += a.bytes - Math.min(ultimo, a.bytes);
    const tipo = r.headers.get("content-type") || "application/octet-stream";
    await cache.put(a.url, new Response(new Blob(trozos, {type: tipo}), {headers: {"content-type": tipo}}));
    avisar();
  }
  await cache.put(MARCA, new Response("1"));
}

async function leer(cache, url, como){
  const r = await cache.match(url);
  if(!r) throw new Error("Falta " + url.split("/").pop());
  return r[como]();
}

async function cargar(){
  if(motor) return;
  await bajarTodo();
  const cache = await caches.open(CACHE);

  // El motor de ejecución se importa desde el caché, así funciona sin conexión.
  const codigo = await leer(cache, ORT + "ort.wasm.bundle.min.mjs", "text");
  const url = URL.createObjectURL(new Blob([codigo], {type: "text/javascript"}));
  let ort;
  try{ ort = await import(url); }
  finally{ URL.revokeObjectURL(url); }
  ort.env.wasm.wasmBinary = await leer(cache, ORT + "ort-wasm-simd-threaded.wasm", "arrayBuffer");
  // Varios hilos exigen cabeceras COOP/COEP en todo el sitio: se usa uno solo.
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;

  const [cfg, indexer] = await Promise.all([
    leer(cache, CONFIG + "onnx/tts.json", "json"),
    leer(cache, CONFIG + "onnx/unicode_indexer.json", "json")
  ]);
  const opciones = {executionProviders: ["wasm"], graphOptimizationLevel: "all"};
  const ses = [];
  for(const p of PARTES){
    const bytes = await leer(cache, MODELO + p + ".int8.onnx", "arrayBuffer");
    ses.push(await ort.InferenceSession.create(new Uint8Array(bytes), opciones));
  }
  motor = {ort, cfg, indexer, dp: ses[0], enc: ses[1], est: ses[2], voc: ses[3]};
}

async function estilo(voz){
  if(estilos[voz]) return estilos[voz];
  if(!VOCES.includes(voz)) throw new Error("Voz desconocida: " + voz);
  const cache = await caches.open(CACHE);
  const j = await leer(cache, CONFIG + "voice_styles/" + voz + ".json", "json");
  const {ort} = motor;
  const t = x => new ort.Tensor("float32", Float32Array.from(x.data.flat(Infinity)), x.dims);
  return (estilos[voz] = {ttl: t(j.style_ttl), dp: t(j.style_dp)});
}

// El modelo lee caracteres, no fonemas: se sacan los que no conoce y se
// asegura un signo al final, sin el cual la última palabra sale cortada.
function preparar(texto, idioma){
  texto = texto.normalize("NFKD")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+/gu, "")
    .replace(/[–‑—]/g, "-").replace(/_/g, " ")
    .replace(/[“”]/g, '"').replace(/[‘’´`]/g, "'")
    .replace(/[\[\]|\/#→←]/g, " ").replace(/[♥☆♡©\\]/g, "")
    .replace(/ ([,.!?;:'])/g, "$1")
    .replace(/\s+/g, " ").trim();
  if(!/[.!?;:,'"')\]}…»]$/.test(texto)) texto += ".";
  return "<" + idioma + ">" + texto + "</" + idioma + ">";
}

async function generar(texto, idioma, voz, pasos){
  const {ort, cfg, indexer, dp, enc, est, voc} = motor;
  const st = await estilo(voz);
  const t = preparar(texto, idioma === "en" ? "en" : "es");
  const L = t.length;
  const ids = new BigInt64Array(L);
  for(let j = 0; j < L; j++){
    const cp = t.codePointAt(j);
    ids[j] = BigInt(cp < indexer.length ? indexer[cp] : -1);
  }
  const textIds = new ort.Tensor("int64", ids, [1, L]);
  const textMask = new ort.Tensor("float32", new Float32Array(L).fill(1), [1, 1, L]);

  const {duration} = await dp.run({text_ids: textIds, style_dp: st.dp, text_mask: textMask});
  // 1,05 es la velocidad que usa el ejemplo oficial. La velocidad que elige
  // el usuario se aplica al reproducir, sin regenerar.
  const dur = duration.data[0] / 1.05;
  const {text_emb} = await enc.run({text_ids: textIds, style_ttl: st.ttl, text_mask: textMask});

  const sr = cfg.ae.sample_rate;
  const chunk = cfg.ae.base_chunk_size * cfg.ttl.chunk_compress_factor;
  const dim = cfg.ttl.latent_dim * cfg.ttl.chunk_compress_factor;
  const len = Math.max(1, Math.ceil(Math.floor(dur * sr) / chunk));
  let xt = new Float32Array(dim * len);
  for(let i = 0; i < xt.length; i++){
    const u1 = Math.max(1e-4, Math.random()), u2 = Math.random();
    xt[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  const latentMask = new ort.Tensor("float32", new Float32Array(len).fill(1), [1, 1, len]);
  const total = new ort.Tensor("float32", new Float32Array([pasos]), [1]);
  for(let k = 0; k < pasos; k++){
    const out = await est.run({
      noisy_latent: new ort.Tensor("float32", xt, [1, dim, len]),
      text_emb, style_ttl: st.ttl, latent_mask: latentMask, text_mask: textMask,
      current_step: new ort.Tensor("float32", new Float32Array([k]), [1]), total_step: total
    });
    xt = out.denoised_latent.data;
  }
  const {wav_tts} = await voc.run({latent: new ort.Tensor("float32", xt, [1, dim, len])});
  // El vocoder redondea el largo al bloque: se recorta a la duración predicha.
  const audio = wav_tts.data.slice(0, Math.min(wav_tts.data.length, Math.floor(dur * sr)));
  return {audio, sr};
}

function mensajeDe(e){
  return String(e && e.message || e || "error");
}

self.onmessage = e => {
  const m = e.data || {};
  if(m.tipo === "cargar"){
    if(!cargando) cargando = cargar().catch(err => { cargando = null; throw err; });
    cargando.then(
      () => postMessage({tipo: "listo"}),
      err => postMessage({tipo: "error", mensaje: mensajeDe(err)}));
    return;
  }
  if(m.tipo === "generar"){
    cola = cola.then(async () => {
      try{
        if(!motor) throw new Error("El modelo no está cargado.");
        const t0 = performance.now();
        const pasos = Math.max(1, Math.min(10, Math.round(Number(m.pasos) || 5)));
        const {audio, sr} = await generar(String(m.texto || ""), m.idioma, m.voz, pasos);
        postMessage({tipo: "audio", id: m.id, audio, sr, ms: performance.now() - t0}, [audio.buffer]);
      }catch(err){
        postMessage({tipo: "error", id: m.id, mensaje: mensajeDe(err)});
      }
    });
  }
};
