#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
   generar.js — construye los sitios estáticos en dist/.

   Por qué existe: para llegar a la estructura que queremos (una URL por
   cultivo, por problema, por producto y por nota) hacen falta decenas de
   páginas casi iguales. Escribirlas a mano garantiza que se desincronicen. Y
   como el resultado es HTML estático de verdad, cada URL nace rastreable con su
   título, su meta y su schema — que es justo lo que la SPA de dakagency.net no
   puede dar y por lo que allá tuvieron que montar WordPress como hub de SEO.

   Construye VARIOS sitios con el mismo motor (ver datos/sitios.js): cambian la
   marca, los productos y la carpeta de salida; plantillas, CSS y JS son los
   mismos. Funciona porque todos los enlaces son relativos, así que un sitio
   generado dentro de una subcarpeta se comporta igual que en la raíz.

   Corre en CI antes del rsync, así que no existe un "¿lo generaste antes de
   desplegar?".

   Uso:  node _agro-demo/generar.js
   ───────────────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import D from './datos/index.js';
import { SITIOS } from './datos/sitios.js';
import * as home from './plantillas/home.js';
import * as problemasIndice from './plantillas/problemas-indice.js';
import * as problema from './plantillas/problema.js';
import * as cultivosIndice from './plantillas/cultivos-indice.js';
import * as cultivo from './plantillas/cultivo.js';
import * as productosIndice from './plantillas/productos-indice.js';
import * as producto from './plantillas/producto.js';
import * as blogIndice from './plantillas/blog-indice.js';
import * as post from './plantillas/post.js';

/* `import.meta.dirname` existe desde Node 20.11; se deriva de la URL para no
   depender de la versión exacta que traiga el runner de CI. */
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(RAIZ, 'dist');

const ESTATICOS = ['core.css', 'core.js', '.htaccess', 'robots.txt', 'CREDITS.md'];
const CARPETAS = ['assets'];

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

/* ── Firma de assets contra la caché ───────────────────────────────────────
   El .htaccess cachea CSS y JS un mes. Sin invalidación eso es una trampa: el
   HTML se revalida cada visita pero el CSS no, así que quien ya entró antes ve
   el maquetado viejo sobre el contenido nuevo — media página sin estilo, y solo
   a él, que es lo que hace el fallo difícil de creer.

   Firmando la URL con el hash del contenido, un cambio obliga al refetch y la
   caché larga pasa a ser correcta en vez de dañina.
   ───────────────────────────────────────────────────────────────────────── */
function firma(contenido) {
  return crypto.createHash('sha256').update(contenido).digest('hex').slice(0, 10);
}

/* ── Verificación de enlaces internos ──────────────────────────────────────
   Un enlace roto en un sitio generado no se nota hasta que alguien lo pulsa
   delante del cliente. Se comprueba en el build y se falla ahí. */
function verificarEnlaces(base, paginas, htmlPorRuta) {
  const rutas = new Set(paginas.map(p => p.ruta));
  const rotos = [];

  for (const [ruta, html] of Object.entries(htmlPorRuta)) {
    const refs = new Set([...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]));
    for (const h of refs) {
      if (/^(https?:|mailto:|tel:|data:|#)/.test(h)) { continue }

      /* Se resuelve contra la ruta de la página, igual que hace el navegador.
         Así valen './', '../../assets/x.webp' y '/productos/' sin tratar cada
         forma por separado. */
      const abs = path.posix.resolve(ruta, h.split(/[?#]/)[0]);

      if (/\.[a-z0-9]{2,5}$/i.test(abs)) {
        if (!fs.existsSync(path.join(base, abs))) { rotos.push(ruta + ' → ' + h) }
        continue;
      }
      const conBarra = abs.endsWith('/') ? abs : abs + '/';
      if (!rutas.has(conBarra)) { rotos.push(ruta + ' → ' + h + '  (resuelve a ' + conBarra + ')') }
    }
  }
  return rotos;
}

function sitemap(dominio, paginas) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + paginas.map(p => '  <url><loc>' + dominio + p.ruta + '</loc></url>').join('\n')
    + '\n</urlset>\n';
}

/** Rutas de un sitio, respetando las secciones excluidas. */
function paginasDe(datos, excluir = []) {
  const hay = s => !excluir.includes(s);
  const P = [{ ruta: '/', plantilla: home }];

  if (hay('problemas')) {
    P.push({ ruta: '/problemas/', plantilla: problemasIndice });
    P.push(...datos.problemas.map(p => ({ ruta: '/problemas/' + p.slug + '/', plantilla: problema, dato: p })));
  }
  if (hay('cultivos')) {
    P.push({ ruta: '/cultivos/', plantilla: cultivosIndice });
    P.push(...datos.cultivos.map(c => ({ ruta: '/cultivos/' + c.slug + '/', plantilla: cultivo, dato: c })));
  }
  if (hay('productos')) {
    P.push({ ruta: '/productos/', plantilla: productosIndice });
    P.push(...datos.productos.map(p => ({ ruta: '/productos/' + p.slug + '/', plantilla: producto, dato: p })));
  }
  if (hay('blog')) {
    P.push({ ruta: '/blog/', plantilla: blogIndice });
    P.push(...datos.blog.map(b => ({ ruta: '/blog/' + b.slug + '/', plantilla: post, dato: b })));
  }
  return P;
}

/** Datos del sitio: la base con la marca y el catálogo sustituidos, y las
 *  cifras recalculadas — si no, un skin con 5 productos anunciaría 14. */
function datosDe(sitio) {
  const productos = sitio.productos || D.productos;
  const excluir = sitio.excluir || [];
  const problemas = excluir.includes('problemas') ? [] : D.problemas;
  const blog = excluir.includes('blog') ? [] : D.blog;

  /* Los programas referencian productos por id. Un sitio puede traer su propio
     juego de programas (`sitio.cultivos`); si no, hereda los de la base. En
     cualquier caso se filtran las aplicaciones a los productos que ese sitio
     realmente tiene, para no dejar filas vacías ni enlaces a fichas que no se
     generaron. */
  const ids = new Set(productos.map(p => p.id));
  const cultivos = (sitio.cultivos || D.cultivos).map(c => ({
    ...c,
    etapas: (c.etapas || [])
      .map(e => ({ ...e, apps: e.apps.filter(a => ids.has(a.p)) }))
      .filter(e => e.apps.length)
  })).map(c => ({ ...c, listo: c.listo && c.etapas.length > 0 }));

  return {
    ...D,
    marca: sitio.marca,
    productos, cultivos, problemas, blog,
    /* Qué secciones existen en ESTE sitio. El menú se filtra con esto: un skin
       sin blog no puede ofrecer un enlace al blog. */
    secciones: ['cultivos', 'problemas', 'productos', 'blog'].filter(s => !excluir.includes(s)),
    /* La marca puede traer su propio vocabulario de líneas. */
    categorias: sitio.marca.categorias || D.categorias,
    stats: {
      nProductos: productos.length,
      nCultivos: cultivos.filter(c => c.listo).length,
      nCultivosTotal: cultivos.length,
      nProblemas: problemas.length,
      nOrganicos: productos.filter(p => p.org).length,
      nPosts: blog.length
    }
  };
}

/* ── build ───────────────────────────────────────────────────────────────── */
function construirSitio(sitio) {
  const base = sitio.salida ? path.join(DIST, sitio.salida) : DIST;
  fs.mkdirSync(base, { recursive: true });

  let nEstaticos = 0;
  for (const f of ESTATICOS) {
    const o = path.join(RAIZ, f);
    if (fs.existsSync(o)) { copiar(o, path.join(base, f)); nEstaticos++ }
  }
  for (const c of CARPETAS) { nEstaticos += copiarCarpeta(path.join(RAIZ, c), path.join(base, c)) }

  const datos = datosDe(sitio);

  const datosJs = '/* Generado por generar.js — no editar a mano. */\n'
    + 'window.AGRO = ' + JSON.stringify(datos) + ';\n';
  fs.writeFileSync(path.join(base, 'datos.js'), datosJs);

  const V = {
    css: firma(fs.readFileSync(path.join(base, 'core.css'))),
    js: firma(fs.readFileSync(path.join(base, 'core.js'))),
    datos: firma(datosJs)
  };

  const paginas = paginasDe(datos, sitio.excluir);
  const htmlPorRuta = {};
  for (const p of paginas) {
    const html = p.plantilla.render(datos, p.dato, V);
    const destino = path.join(base, p.ruta.replace(/^\/+|\/+$/g, ''), 'index.html');
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
    htmlPorRuta[p.ruta] = html;
  }

  /* Sitemap solo para el sitio público: un privado no se anuncia. En su lugar
     lleva un .htaccess que refuerza el noindex a nivel de cabecera, por si
     alguna vez el robots.txt del host cambia. */
  if (sitio.privado) {
    fs.writeFileSync(path.join(base, '.htaccess'),
      '# Maqueta de propuesta — no indexable bajo ninguna circunstancia.\n'
      + 'DirectoryIndex index.html\n\n'
      + '<IfModule mod_headers.c>\n'
      + '  Header set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet"\n'
      + '  Header set X-Content-Type-Options "nosniff"\n'
      + '  Header set Referrer-Policy "no-referrer"\n'
      + '</IfModule>\n');
    fs.writeFileSync(path.join(base, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  } else {
    fs.writeFileSync(path.join(base, 'sitemap.xml'), sitemap(datos.marca.dominio, paginas));
  }

  const rotos = verificarEnlaces(base, paginas, htmlPorRuta);
  const bytes = Object.values(htmlPorRuta).reduce((a, h) => a + Buffer.byteLength(h), 0);
  return { sitio, paginas, nEstaticos, bytes, rotos, datos };
}

function construir() {
  const t0 = Date.now();
  limpiar(DIST);

  const resultados = SITIOS.map(construirSitio);
  const rotos = resultados.flatMap(r => r.rotos.map(x => '[' + r.sitio.id + '] ' + x));
  if (rotos.length) {
    console.error('\n✗ Enlaces internos rotos:');
    rotos.forEach(r => console.error('    ' + r));
    process.exit(1);
  }

  const kb = n => Math.round(n / 1024) + ' KB';
  console.log('✓ Sitios generados en ' + (Date.now() - t0) + ' ms');
  for (const r of resultados) {
    const s = r.datos.stats;
    console.log('  · ' + r.sitio.id.padEnd(9)
      + (r.sitio.privado ? '[privado] ' : '[público] ')
      + '/' + (r.sitio.salida || '') + '  '
      + r.paginas.length + ' páginas (' + kb(r.bytes) + ')');
    console.log('              ' + s.nProductos + ' productos · ' + s.nProblemas + ' problemas · '
      + s.nCultivos + '/' + s.nCultivosTotal + ' cultivos · ' + s.nPosts + ' notas');
  }
}

construir();
