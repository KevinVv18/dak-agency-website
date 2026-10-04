// Generador del showroom. Lee datos/*.js, valida que el inventario no se
// contradiga y escribe dist/: una página por ruta (portada, edificio,
// catálogo, cada piso y cada unidad) para que cualquier enlace o QR abra
// directo, sin reescrituras en el servidor.
//
// Todas las páginas comparten el mismo motor (core.js) y los mismos datos
// (datos.js → window.SHOWROOM): Node y navegador leen una sola fuente.
//
//   node _showroom-demo/generar.js

import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import proyecto from './datos/proyecto.js';
import { vistas, transiciones, plantillas, pisos, amenidades } from './datos/edificio.js';
import tipologias from './datos/tipologias.js';
import unidades from './datos/unidades.js';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const DIST = join(RAIZ, 'dist');
const ESTADOS = ['disponible', 'reservado', 'vendido'];

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
  ];
  for (const piso of d.pisos) {
    lista.push({ ruta: `piso/${piso.id}/`, titulo: `${piso.etiqueta} · ${p.nombre}`, desc: piso.uso || `Planta del ${piso.etiqueta.toLowerCase()}.` });
  }
  for (const u of d.unidades) {
    const t = tipo[u.tipologia];
    lista.push({
      ruta: `departamento/${u.id}/`,
      titulo: `Dpto. ${u.id} · ${t.nombre} · ${p.nombre}`,
      desc: `${t.resumen}, ${t.areaTechada} m² techados, piso ${u.piso}.`,
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
<link rel="stylesheet" href="${base}core.css?v=${v.css}">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<div id="app" aria-live="polite"><noscript><p class="sin-js">Este showroom necesita JavaScript para mostrar el edificio y los departamentos.</p></noscript></div>
<script src="${base}datos.js?v=${v.datos}"></script>
<script src="${base}core.js?v=${v.js}"></script>
</body>
</html>
`;
}

async function generar() {
  const errores = validar(datos);
  if (errores.length) {
    console.error(`✗ ${errores.length} error(es) en los datos:\n  - ${errores.join('\n  - ')}`);
    process.exit(1);
  }

  const css = await readFile(join(RAIZ, 'src/core.css'), 'utf8');
  const js = await readFile(join(RAIZ, 'src/core.js'), 'utf8');
  const datosJs = `window.SHOWROOM = ${JSON.stringify(datos)};\n`;
  const v = { css: firma(css), js: firma(js), datos: firma(datosJs) };

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await writeFile(join(DIST, 'core.css'), css);
  await writeFile(join(DIST, 'core.js'), js);
  await writeFile(join(DIST, 'datos.js'), datosJs);
  // Renders optimizados para web (los produce produccion/). Reemplazar una
  // imagen exige renombrarla: el .htaccess cachea imágenes por meses.
  if (await stat(join(RAIZ, 'assets')).catch(() => null)) await cp(join(RAIZ, 'assets'), join(DIST, 'assets'), { recursive: true });

  const lista = paginas(datos);
  for (const pag of lista) {
    const dir = join(DIST, pag.ruta);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), shell(pag, v));
  }
  console.log(`✓ ${lista.length} páginas · ${datos.unidades.length} unidades · ${datos.pisos.length} pisos → dist/`);
}

generar();
