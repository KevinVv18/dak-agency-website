// Generador del showroom. Lee datos/*.js, valida que el inventario no se
// contradiga y escribe dist/: una página por ruta (portada, edificio,
// catálogo, cada piso y cada unidad) para que cualquier enlace o QR abra
// directo, sin reescrituras en el servidor.
//
// Todas las páginas comparten el mismo motor (core.js) y los mismos datos
// (datos.js → window.SHOWROOM): Node y navegador leen una sola fuente.
//
// Un motor, varios proyectos: cada proyecto es una carpeta con datos/ y
// assets/. Sin argumento se genera la vitrina pública (esta carpeta); un
// cliente real vive en privado/<cliente>/ y nunca entra al repo.
//
//   node _showroom-demo/generar.js                    -> dist/
//   node _showroom-demo/generar.js privado/varu       -> privado/varu/dist/

import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const SITIO = resolve(RAIZ, process.argv[2] || '.');
const DIST = join(SITIO, 'dist');
const ESTADOS = ['disponible', 'reservado', 'vendido'];

const cargar = async (archivo) => import(pathToFileURL(join(SITIO, 'datos', archivo)).href);
const { default: proyecto } = await cargar('proyecto.js');
const { vistas, transiciones = {}, plantillas, pisos, amenidades = [] } = await cargar('edificio.js');
const { default: tipologias } = await cargar('tipologias.js');
const { default: unidades } = await cargar('unidades.js');

const datos = { proyecto, vistas, transiciones, plantillas, pisos, amenidades, tipologias, unidades };

// ── Validación ──────────────────────────────────────────────────────────────
// El objetivo es que ficha, planta y catálogo nunca puedan discrepar: si los
// datos se contradicen, el build falla en vez de publicar la contradicción.

function validar(d) {
  const errores = [];
  const duplicados = (lista, campo) => {
    const vistos = new Set();
    for (const x of lista) {
      if (vistos.has(x.id)) errores.push(`${campo}: id duplicado «${x.id}»`);
      vistos.add(x.id);
    }
  };
  duplicados(d.pisos, 'pisos');
  duplicados(d.tipologias, 'tipologías');
  duplicados(d.unidades, 'unidades');
  duplicados(d.vistas, 'vistas');

  const enRango = (p) => p.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1);
  for (const [id, pl] of Object.entries(d.plantillas)) {
    for (const [pos, def] of Object.entries(pl.posiciones)) {
      if (!def.poligono || def.poligono.length < 3) errores.push(`plantilla ${id}/${pos}: polígono incompleto`);
      else if (!enRango(def.poligono)) errores.push(`plantilla ${id}/${pos}: coordenadas fuera de 0–1`);
    }
  }

  const pisoPorId = new Map(d.pisos.map((p) => [p.id, p]));
  const tipos = new Set(d.tipologias.map((t) => t.id));
  for (const u of d.unidades) {
    const piso = pisoPorId.get(u.piso);
    if (!piso) { errores.push(`unidad ${u.id}: piso «${u.piso}» no existe`); continue; }
    if (!piso.plantilla) errores.push(`unidad ${u.id}: el piso ${u.piso} no tiene departamentos`);
    else if (!d.plantillas[piso.plantilla]?.posiciones[u.posicion]) {
      errores.push(`unidad ${u.id}: la posición ${u.posicion} no existe en la plantilla «${piso.plantilla}»`);
    }
    if (!tipos.has(u.tipologia)) errores.push(`unidad ${u.id}: tipología «${u.tipologia}» no existe`);
    if (!ESTADOS.includes(u.estado)) errores.push(`unidad ${u.id}: estado «${u.estado}» no válido`);
    if (u.precio !== null && !(u.precio > 0)) errores.push(`unidad ${u.id}: precio ${u.precio} (sin precio = null, nunca 0)`);
    if (u.estado !== 'disponible' && u.precio !== null) errores.push(`unidad ${u.id}: ${u.estado} no debe publicar precio`);
  }

  // Cada posición de cada piso con planta tiene exactamente una unidad: ni
  // polígonos huérfanos ni dos departamentos en el mismo sitio.
  for (const piso of d.pisos.filter((p) => p.plantilla)) {
    for (const pos of Object.keys(d.plantillas[piso.plantilla].posiciones)) {
      const n = d.unidades.filter((u) => u.piso === piso.id && u.posicion === pos).length;
      if (n !== 1) errores.push(`piso ${piso.id}, posición ${pos}: ${n} unidades (debe haber 1)`);
    }
  }
  return errores;
}

// ── Páginas ─────────────────────────────────────────────────────────────────

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const firma = (txt) => createHash('sha1').update(txt).digest('hex').slice(0, 10);

function paginas(d) {
  const p = d.proyecto;
  const tipo = Object.fromEntries(d.tipologias.map((t) => [t.id, t]));
  const lista = [
    { ruta: '', titulo: `${p.nombre} · ${p.marca}`, desc: p.descripcion },
    { ruta: 'edificio/', titulo: `Edificio · ${p.nombre}`, desc: `Recorre el exterior de ${p.nombre} y elige un piso.` },
    { ruta: 'departamentos/', titulo: `Departamentos · ${p.nombre}`, desc: `Todos los departamentos de ${p.nombre}, con filtros.` },
    { ruta: 'modelos/', titulo: `Modelos · ${p.nombre}`, desc: `Las distribuciones de ${p.nombre}, con su planta amoblada.` },
  ];
  for (const piso of d.pisos) {
    lista.push({ ruta: `piso/${piso.id}/`, titulo: `${piso.etiqueta} · ${p.nombre}`, desc: piso.uso || `Planta del ${piso.etiqueta.toLowerCase()}.` });
  }
  for (const u of d.unidades) {
    const t = tipo[u.tipologia];
    lista.push({
      ruta: `departamento/${u.id}/`,
      titulo: `Dpto. ${u.id} · ${t.nombre} · ${p.nombre}`,
      desc: `${t.resumen}${t.areaTechada == null ? '' : `, ${t.areaTechada} m² techados`}, piso ${u.piso}.`,
    });
  }
  return lista;
}

function shell(pag, v) {
  const prof = pag.ruta.split('/').filter(Boolean).length;
  const base = '../'.repeat(prof) || './';
  return `<!doctype html>
<html lang="es" data-base="${base}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pag.titulo)}</title>
<meta name="description" content="${esc(pag.desc)}">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${base}vendor/flor.svg" type="image/svg+xml">
<link rel="preload" href="${base}vendor/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}core.css?v=${v.css}">
<style>:root{${v.marca}}</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<!--
THESIS: El edificio a pantalla completa es la interfaz, y lo que flota encima son tablillas de algarrobo, no las píldoras blancas y rojas del showroom de plantilla.
OWN-WORLD: Bosque seco de Lambayeque: algarrobo oscuro, ceniza y arena; tablillas de esquina superior derecha cortada; el color del proyecto (flor de faique) solo en la acción y lo elegido; Archivo expandida en mayúsculas para nombres y cifras; estados como rombo + palabra.
STORY: El comprador entra al edificio, elige piso en el tablero de tablillas, toca el marcador de un departamento, ve número, precio y casillas de datos, abre planta o recorrido y consulta sin perder la unidad.
FIRST VIEWPORT: Timelapse día-noche a sangre con el cielo que corre; nombre en grotesca expandida abajo a la izquierda; Ingresar como tablilla amarilla y Ver departamentos como tablilla oscura; aviso de demo arriba.
FORM: Bosque seco, candidato 3 de 7 de la lista propia; seed 8b3884cc.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->
<div id="app" aria-live="polite"><noscript><p class="sin-js">Este showroom necesita JavaScript para mostrar el edificio y los departamentos.</p></noscript></div>
<script src="${base}datos.js?v=${v.datos}"></script>
<script src="${base}core.js?v=${v.js}"></script>
</body>
</html>
`;
}

// Toda ruta 'assets/...' citada en los datos tiene que existir: una imagen que
// falta es un hueco en la demo justo cuando se está mostrando.
async function recursosFaltantes(d) {
  const rutas = new Set();
  const recorrer = (v) => {
    if (typeof v === 'string' && v.startsWith('assets/')) { if (!v.includes('{n}')) rutas.add(v); }
    else if (Array.isArray(v)) v.forEach(recorrer);
    else if (v && typeof v === 'object') {
      // giro 360: un patrón con {n} que debe existir para cada cuadro
      if (v.cuadros) {
        for (const p of Object.values(v)) {
          if (typeof p === 'string' && p.includes('{n}')) for (let k = 0; k < v.cuadros; k++) rutas.add(p.replace('{n}', String(k).padStart(3, '0')));
        }
      }
      Object.values(v).forEach(recorrer);
    }
  };
  recorrer(d);
  const faltan = [];
  for (const r of rutas) if (!(await stat(join(SITIO, r)).catch(() => null))) faltan.push(`recurso inexistente: ${r}`);
  return faltan;
}

async function generar() {
  const errores = [...validar(datos), ...(await recursosFaltantes(datos))];
  if (errores.length) {
    console.error(`✗ ${errores.length} error(es) en los datos:\n  - ${errores.join('\n  - ')}`);
    process.exit(1);
  }

  const css = await readFile(join(RAIZ, 'src/core.css'), 'utf8');
  const js = await readFile(join(RAIZ, 'src/core.js'), 'utf8');
  const datosJs = `window.SHOWROOM = ${JSON.stringify(datos)};\n`;
  // La marca de cada proyecto entra como variables CSS: misma hoja, otro acento.
  const e = datos.proyecto.estilo || {};
  // Cuando el acento se usa como texto, trazo o foco necesita 3:1 con lo que
  // tiene detrás: sobre algarrobo cae a arena y sobre ceniza a algarrobo si no
  // llega (el azul de VARU sobre madera oscura, el amarillo sobre ceniza).
  const lum = (hex) => {
    const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const sobreOscuro = e.acento && (contraste(e.acento, '#23170f') >= 3 ? e.acento : '#efe7d6');
  const sobreClaro = e.acento && (contraste(e.acento, '#dedad0') >= 3 ? e.acento : '#23170f');
  const marca = [e.acento && `--acento:${e.acento}`, e.acentoTinta && `--acento-tinta:${e.acentoTinta}`,
    sobreOscuro && `--acento-oscuro:${sobreOscuro}`, sobreClaro && `--acento-claro:${sobreClaro}`].filter(Boolean).join(';');
  const v = { css: firma(css), js: firma(js), datos: firma(datosJs), marca };

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await writeFile(join(DIST, 'core.css'), css);
  await writeFile(join(DIST, 'core.js'), js);
  await writeFile(join(DIST, 'datos.js'), datosJs);
  // Renders optimizados para web (los produce produccion/). Reemplazar una
  // imagen exige renombrarla: el .htaccess cachea imágenes por meses.
  if (await stat(join(SITIO, 'assets')).catch(() => null)) await cp(join(SITIO, 'assets'), join(DIST, 'assets'), { recursive: true });
  // Librerías de terceros del motor (Pannellum, MIT), comunes a todos los proyectos.
  await cp(join(RAIZ, 'vendor'), join(DIST, 'vendor'), { recursive: true });
  // Caché y cabeceras del subdominio (Apache de Hostinger).
  await cp(join(RAIZ, 'src/htaccess'), join(DIST, '.htaccess'));

  const lista = paginas(datos);
  for (const pag of lista) {
    const dir = join(DIST, pag.ruta);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), shell(pag, v));
  }
  console.log(`✓ ${lista.length} páginas · ${datos.unidades.length} unidades · ${datos.pisos.length} pisos → ${DIST}`);
}

generar();
