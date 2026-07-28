/* ─────────────────────────────────────────────────────────────────────────────
   base.js — el cascarón de toda página: <head>, cinta, nav, pie y scripts.

   Las plantillas son funciones de JavaScript, no archivos HTML con marcadores
   {{}}. La razón es práctica: estas páginas tienen bucles y condicionales
   (galerías, listas de producto, secciones que solo aparecen si hay dato), y
   resolverlos con un mini-motor de plantillas propio sería escribir un
   intérprete para no usar el que ya trae el lenguaje.

   `base` es el prefijo de rutas relativas según la profundidad de la página:
   '' en la raíz, '../' en /problemas/, '../../' en /problemas/algo/.
   ───────────────────────────────────────────────────────────────────────── */

import { icono } from '../datos/iconos.js';

/** Escapa texto para insertarlo en HTML. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Enlaces del menú. Todos son RELATIVOS y se resuelven contra el prefijo de la
   página, no absolutos: así el sitio entero funciona igual servido en la raíz de
   un dominio o dentro de una subcarpeta, que es lo que hace falta para las
   versiones skin-eadas por cliente. */
const MENU = [
  { rel: 'cultivos/', t: 'Cultivos' },
  { rel: 'problemas/', t: 'Problemas' },
  { rel: 'productos/', t: 'Catálogo' },
  { rel: 'blog/', t: 'Notas de campo' },
  { rel: '#calculadora', t: 'Calculadora' }
];

/**
 * @param {object} o
 *   o.D          datos completos
 *   o.titulo     <title> de la página
 *   o.desc       meta description
 *   o.ruta       ruta canónica, p.ej. '/' o '/problemas/oidio/'
 *   o.base       prefijo relativo ('' | '../' | '../../')
 *   o.contenido  HTML del <main>
 *   o.jsonld     array de objetos JSON-LD
 *   o.preloadImg imagen a precargar (ruta relativa a assets/img/)
 */
function pagina(o) {
  const M = o.D.marca;
  const b = o.base || '';

  /* Firma de caché. El .htaccess cachea CSS y JS un mes, y sin esto el HTML se
     revalida en cada visita pero el CSS no: quien ya entró antes vería el
     maquetado viejo sobre el contenido nuevo. Con el hash del contenido en la
     URL, un cambio obliga a refetch y la caché larga pasa a ser correcta.
     `V` puede faltar si una plantilla se renderiza fuera del build. */
  const V = o.V || {};
  const v = k => (V[k] ? '?v=' + V[k] : '');
  const tokens = Object.entries(M.tokens)
    .map(([k, v]) => '    ' + k + ': ' + v + ';').join('\n');

  const ld = (o.jsonld || []).map(
    j => '<script type="application/ld+json">' + JSON.stringify(j) + '</script>'
  ).join('\n');

  return `<!doctype html>
<html lang="es" class="no-js">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(o.titulo)}</title>
<meta name="description" content="${esc(o.desc)}" />
<meta name="robots" content="noindex, nofollow" />
<link rel="canonical" href="${esc(M.dominio + o.ruta)}" />
<meta property="og:title" content="${esc(o.titulo)}" />
<meta property="og:description" content="${esc(o.desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${esc(M.dominio + o.ruta)}" />
<!-- Fuentes self-hosteadas: cero peticiones a terceros, que es una cosa menos
     que pueda fallar en el wifi de una sala de reuniones. -->
<link rel="preload" href="${b}assets/fonts/archivo-var-latin.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="${b}assets/fonts/jetbrainsmono-var-latin.woff2" as="font" type="font/woff2" crossorigin />${
  o.preloadImg ? `\n<link rel="preload" as="image" href="${b}assets/img/${esc(o.preloadImg)}" />` : ''}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M2 22h28' stroke='%2317603A' stroke-width='2.6' stroke-linecap='square'/%3E%3Cpath d='M6 17h9M11 12h10M17 27h11' stroke='%2317603A' stroke-width='2.2' stroke-linecap='square' opacity='.55'/%3E%3C/svg%3E" />
${ld}
<!-- Tokens de marca. Es lo ÚNICO del CSS que cambia al skin-ear: core.css no
     contiene ni un color. -->
<style>
  :root {
${tokens}
  }
</style>
<link rel="stylesheet" href="${b}core.css${v('css')}" />
<!-- El estado oculto de las secciones cuelga de esta clase, así que si el JS no
     corre la página se ve completa en vez de quedar en blanco. -->
<script>document.documentElement.className = document.documentElement.className.replace('no-js','') + ' js';</script>
</head>
<body>

<div class="cinta-demo">
  <span><b>Demo</b> — marca ficticia creada por DAK Agency para mostrar el producto</span>
  <a href="https://dakagency.net" target="_blank" rel="noopener">dakagency.net</a>
</div>

<header class="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="${b || './'}" aria-label="Inicio">
      <span class="mark" aria-hidden="true">${M.marcaSvg}</span>
      <span class="brand-txt"><b>${esc(M.nombre)}</b><small>${esc(M.bajada)}</small></span>
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Secciones">
      ${MENU.map(m => {
        /* `aria-current="page"` solo en la página exacta, que es lo que dice la
           especificación. Estar dentro de la sección se marca con una clase
           visual: útil para orientarse, pero no es "la página actual". */
        const exacta = o.ruta === '/' + m.rel;
        const enSeccion = !m.rel.startsWith('#') && !exacta && o.ruta.startsWith('/' + m.rel);
        return `<a href="${b + m.rel}"${exacta ? ' aria-current="page"' : ''}${enSeccion ? ' class="actual"' : ''}>${esc(m.t)}</a>`;
      }).join('\n      ')}
    </nav>
    <a class="btn btn-solid btn-sm nav-cta" data-wa="Hola DAK, vi el demo de web para agroinsumos y quiero una así para mi empresa." target="_blank" rel="noopener" href="#">Hablar con un asesor</a>
    <button class="nav-burger" id="navBurger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="navLinks">${icono('flecha')}</button>
  </div>
</header>

<main id="top">
${o.contenido}
</main>

<footer class="pie">
  <div class="wrap">
    <div class="pie-grid">
      <div class="brand">
        <span class="mark" style="color:var(--acento)" aria-hidden="true">${M.marcaSvg}</span>
        <span class="brand-txt"><b>${esc(M.nombre)}</b><small>${esc(M.bajada)}</small></span>
      </div>
      <a class="btn btn-solid" data-wa="Hola DAK, vi el demo de web para agroinsumos y quiero una así para mi empresa." target="_blank" rel="noopener" href="#">Quiero una web así</a>
    </div>
    <p class="pie-legal"><strong>Esto es una demostración.</strong> ${esc(M.avisoDemo)}</p>
  </div>
</footer>

<div class="ov" id="fichaOv" role="dialog" aria-modal="true" aria-labelledby="fichaTitulo" aria-hidden="true">
  <div class="ficha" id="fichaCaja"></div>
</div>

<script>window.AGRO_BASE = '${b}';</script>
<script src="${b}datos.js${v('datos')}"></script>
<script src="${b}core.js${v('js')}"></script>
</body>
</html>
`;
}

export { pagina, esc, MENU };
