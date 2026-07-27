#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
   generar.js — construye el sitio estático en dist/.

   Por qué existe: para llegar a la estructura que queremos (una URL por
   cultivo, por problema y por producto) hacen falta decenas de páginas casi
   iguales. Escribirlas a mano garantiza que se desincronicen entre sí. Y como
   el sitio es HTML estático de verdad, cada URL nace rastreable con su propio
   título, su meta y su schema — que es justo lo que la SPA de dakagency.net no
   puede dar y por lo que allá tuvieron que montar WordPress como hub de SEO.

   Corre en CI antes del rsync, así que no hay un "¿lo generaste antes de
   desplegar?" posible.

   Uso:  node _agro-demo/generar.js
   ───────────────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import D from './datos/index.js';
import * as home from './plantillas/home.js';
import * as problemasIndice from './plantillas/problemas-indice.js';
import * as problema from './plantillas/problema.js';
import * as cultivosIndice from './plantillas/cultivos-indice.js';
import * as cultivo from './plantillas/cultivo.js';
import * as productosIndice from './plantillas/productos-indice.js';
import * as producto from './plantillas/producto.js';

/* `import.meta.dirname` existe desde Node 20.11; se deriva de la URL para no
   depender de la versión exacta que traiga el runner de CI. */
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(RAIZ, 'dist');

/* Archivos que se copian tal cual a dist/. */
const ESTATICOS = ['core.css', 'core.js', '.htaccess', 'robots.txt', 'CREDITS.md'];
const CARPETAS = ['assets'];

/* Páginas a generar. Cada entrada declara su ruta y quién la renderiza; `dato`
   es el registro que recibe la plantilla en las páginas de detalle. Añadir un
   tipo de página nuevo es añadir entradas aquí — el resto del build no cambia. */
const PAGINAS = [
  { ruta: '/', plantilla: home },
  { ruta: '/problemas/', plantilla: problemasIndice },
  ...D.problemas.map(p => ({
    ruta: '/problemas/' + p.slug + '/',
    plantilla: problema,
    dato: p
  })),
  { ruta: '/cultivos/', plantilla: cultivosIndice },
  ...D.cultivos.map(c => ({
    ruta: '/cultivos/' + c.slug + '/',
    plantilla: cultivo,
    dato: c
  })),
  { ruta: '/productos/', plantilla: productosIndice },
  ...D.productos.map(p => ({
    ruta: '/productos/' + p.slug + '/',
    plantilla: producto,
    dato: p
  }))
];

/* ── utilidades ──────────────────────────────────────────────────────────── */

function limpiar(dir) {
  if (fs.existsSync(dir)) { fs.rmSync(dir, { recursive: true, force: true }) }
  fs.mkdirSync(dir, { recursive: true });
}

function copiar(origen, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(origen, destino);
}

function copiarCarpeta(origen, destino) {
  if (!fs.existsSync(origen)) { return 0 }
  let n = 0;
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, e.name), d = path.join(destino, e.name);
    if (e.isDirectory()) { n += copiarCarpeta(o, d) }
    else { copiar(o, d); n++ }
  }
  return n;
}

/** Convierte una ruta de URL en la ruta de archivo de su index.html. */
function archivoDe(ruta) {
  const limpia = ruta.replace(/^\/+|\/+$/g, '');
  return path.join(DIST, limpia, 'index.html');
}

/* ── Firma de assets contra la caché ───────────────────────────────────────
   El .htaccess cachea CSS y JS un mes. Sin invalidación eso es una trampa: el
   HTML se revalida cada visita pero el CSS no, así que quien ya entró antes ve
   el maquetado viejo sobre el contenido nuevo — media página sin estilo, y
   encima solo le pasa a él, que es lo que hace el fallo difícil de creer.

   Se resuelve firmando la URL con el hash del contenido: si el archivo cambia,
   cambia la URL y el navegador está obligado a pedirlo. Y la caché larga pasa a
   ser correcta en vez de dañina, porque cada URL sirve contenido inmutable.
   ───────────────────────────────────────────────────────────────────────── */
function firma(contenido) {
  return crypto.createHash('sha256').update(contenido).digest('hex').slice(0, 10);
}

/* ── Verificación de enlaces internos ──────────────────────────────────────
   Un enlace roto en un sitio generado no se nota hasta que alguien lo pulsa
   delante del cliente. Se comprueba en el build y se falla ahí. */
function verificarEnlaces(paginas, htmlPorRuta) {
  const rutas = new Set(paginas.map(p => p.ruta));
  const rotos = [];

  for (const [ruta, html] of Object.entries(htmlPorRuta)) {
    const hrefs = new Set(
      [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1])
    );
    for (const h of hrefs) {
      if (/^(https?:|mailto:|tel:|data:|#)/.test(h)) { continue }

      /* Se resuelve contra la ruta de la página, que es como lo hace el
         navegador. Así valen igual './', '../../assets/x.webp' y '/productos/'
         sin tener que tratar cada forma por separado. */
      const abs = path.posix.resolve(ruta, h.split(/[?#]/)[0]);

      if (/\.[a-z0-9]{2,5}$/i.test(abs)) {
        if (!fs.existsSync(path.join(DIST, abs))) { rotos.push(ruta + ' → ' + h) }
        continue;
      }
      const conBarra = abs.endsWith('/') ? abs : abs + '/';
      if (!rutas.has(conBarra)) { rotos.push(ruta + ' → ' + h + '  (resuelve a ' + conBarra + ')') }
    }
  }
  return rotos;
}

/* ── sitemap ─────────────────────────────────────────────────────────────── */
function sitemap(paginas) {
  const urls = paginas.map(p =>
    '  <url><loc>' + D.marca.dominio + p.ruta + '</loc></url>'
  ).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls + '\n</urlset>\n';
}

/* ── build ───────────────────────────────────────────────────────────────── */
function construir() {
  const t0 = Date.now();
  limpiar(DIST);

  // 1. estáticos
  let nEstaticos = 0;
  for (const f of ESTATICOS) {
    const o = path.join(RAIZ, f);
    if (fs.existsSync(o)) { copiar(o, path.join(DIST, f)); nEstaticos++ }
  }
  for (const c of CARPETAS) {
    nEstaticos += copiarCarpeta(path.join(RAIZ, c), path.join(DIST, c));
  }

  // 2. datos serializados para el navegador — misma fuente que usa el generador
  const datosJs =
    '/* Generado por generar.js — no editar a mano.\n'
    + '   Fuente: _agro-demo/datos/. */\n'
    + 'window.AGRO = ' + JSON.stringify(D) + ';\n';
  fs.writeFileSync(path.join(DIST, 'datos.js'), datosJs);

  // 3. versiones de los assets que cambian en cada iteración
  const V = {
    css: firma(fs.readFileSync(path.join(DIST, 'core.css'))),
    js: firma(fs.readFileSync(path.join(DIST, 'core.js'))),
    datos: firma(datosJs)
  };

  // 4. páginas
  const htmlPorRuta = {};
  for (const p of PAGINAS) {
    const html = p.plantilla.render(D, p.dato, V);
    const destino = archivoDe(p.ruta);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
    htmlPorRuta[p.ruta] = html;
  }

  // 5. sitemap
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap(PAGINAS));

  // 6. verificación
  const rotos = verificarEnlaces(PAGINAS, htmlPorRuta);
  if (rotos.length) {
    console.error('\n✗ Enlaces internos rotos:');
    rotos.forEach(r => console.error('    ' + r));
    process.exit(1);
  }

  const kb = n => Math.round(n / 1024) + ' KB';
  const total = Object.values(htmlPorRuta).reduce((a, h) => a + Buffer.byteLength(h), 0);
  console.log('✓ Sitio generado en ' + (Date.now() - t0) + ' ms');
  console.log('    páginas   : ' + PAGINAS.length + '  (' + kb(total) + ' de HTML)');
  console.log('    datos.js  : ' + kb(Buffer.byteLength(datosJs)));
  console.log('    estáticos : ' + nEstaticos + ' archivos');
  console.log('    contenido : ' + D.stats.nProductos + ' productos · '
    + D.stats.nProblemas + ' problemas · ' + D.stats.nCultivos + '/'
    + D.stats.nCultivosTotal + ' cultivos con programa');
}

construir();
