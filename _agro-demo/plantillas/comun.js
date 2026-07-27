/* ─────────────────────────────────────────────────────────────────────────────
   comun.js — piezas que comparten varias plantillas.

   Vive aparte de base.js porque base.js es el cascarón (head, nav, pie) y esto
   son componentes de contenido. Mezclarlos haría que cualquier plantilla que
   necesite una lámina arrastre el cascarón entero.
   ───────────────────────────────────────────────────────────────────────── */

import { esc } from './base.js';
import { icono } from '../datos/iconos.js';

/** Lámina: fotografía acotada, numerada y con pie. `b` es el prefijo de rutas. */
export function lamina(l, forma, b, clase) {
  if (!l || !l.src) { return '' }
  return '<figure class="lamina lamina--' + (forma || 'ancha') + (clase ? ' ' + clase : '') + '">'
    + '<div class="lamina-img">'
    + (l.n ? '<span class="lamina-n">' + esc(l.n) + '</span>' : '')
    + '<img src="' + (b || '') + 'assets/img/' + esc(l.src) + '" alt="' + esc(l.alt || '') + '" loading="lazy" decoding="async" />'
    + '</div>'
    + (l.pie ? '<figcaption>' + l.pie + '</figcaption>' : '')
    + '</figure>';
}

/** Migas de pan. `items` = [{t, href}], el último sin href (página actual). */
export function migas(items) {
  const partes = items.map((it, i) => {
    const ultimo = i === items.length - 1;
    return ultimo
      ? '<li aria-current="page">' + esc(it.t) + '</li>'
      : '<li><a href="' + esc(it.href) + '">' + esc(it.t) + '</a></li>';
  });
  return '<nav class="migas" aria-label="Ubicación"><ol>' + partes.join('') + '</ol></nav>';
}

/** Sello de admisibilidad orgánica / convencional. */
export function selloOrg(p) {
  return p.org
    ? '<span class="sello"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Insumo orgánico</span>'
    : '<span class="sello sello--conv">Convencional</span>';
}

/** Enlace de WhatsApp con el mensaje ya redactado. */
export function wa(M, msg) {
  return 'https://wa.me/' + M.wa + '?text=' + encodeURIComponent(msg);
}

/**
 * Bloque de asesoría. Se repite a distintas profundidades de la página, con un
 * encuadre distinto en cada una: quien lo lee arriba todavía está entendiendo el
 * problema, y quien llega abajo ya sabe qué necesita. El mismo texto en los tres
 * sitios se leería como relleno.
 */
export function bloqueAsesoria(M, o) {
  /* El nivel del título es configurable porque el bloque aparece en páginas con
     jerarquías distintas: donde ya hubo un h2 va como h3, y donde es el primer
     subtítulo después del h1 tiene que ser h2 o el documento salta un nivel. */
  const h = o.nivel || 3;
  return '<aside class="asesoria">'
    + '<span class="asesoria-ico">' + icono(o.icono || 'zona') + '</span>'
    + '<div><h' + h + '>' + esc(o.titulo) + '</h' + h + '><p>' + esc(o.texto) + '</p></div>'
    + '<a class="btn btn-solid" target="_blank" rel="noopener" href="' + esc(wa(M, o.msg)) + '">'
    + esc(o.cta) + '</a>'
    + '</aside>';
}

/** Etiqueta legible de un tipo de problema. */
export function tipoLbl(D, t, plural) {
  const x = D.tiposProblema[t];
  return x ? (plural ? x.plural : x.n) : t;
}

/** Nombre de un cultivo por id. */
export function cultivoN(D, id) {
  const c = D.cultivos.find(x => x.id === id);
  return c ? c.n : id;
}

/** Registro de cultivo por id (para sacar su slug y saber si tiene programa). */
export function cultivo(D, id) {
  return D.cultivos.find(x => x.id === id) || null;
}

/** Registro de producto por id. */
export function producto(D, id) {
  return D.productos.find(x => x.id === id) || null;
}

/* ── Cruces inversos ────────────────────────────────────────────────────────
   Los datos se escriben en una sola dirección (el programa dice qué productos
   usa, el problema dice a qué cultivos afecta) y aquí se recorren al revés. Es
   lo que teje la red de enlaces internos sin que nadie tenga que mantener las
   dos puntas a mano — que es exactamente donde esas listas se desincronizan.
   ───────────────────────────────────────────────────────────────────────── */

/** Problemas que afectan a un cultivo. */
export function problemasDeCultivo(D, cultivoId) {
  return D.problemas.filter(p => p.cultivos.includes(cultivoId));
}

/** Productos que aparecen en el programa de un cultivo, sin repetir. */
export function productosDeCultivo(D, c) {
  const vistos = new Set();
  const out = [];
  for (const e of (c.etapas || [])) {
    for (const a of e.apps) {
      if (vistos.has(a.p)) { continue }
      vistos.add(a.p);
      const p = producto(D, a.p);
      if (p) { out.push(p) }
    }
  }
  return out;
}

/** Dónde se usa un producto: cultivo, etapa, dosis y frecuencia. */
export function usosDeProducto(D, prodId) {
  const out = [];
  for (const c of D.cultivos) {
    for (const e of (c.etapas || [])) {
      for (const a of e.apps) {
        if (a.p === prodId) { out.push({ cultivo: c, etapa: e, d: a.d, f: a.f }) }
      }
    }
  }
  return out;
}

/** Problemas para los que se recomienda un producto. */
export function problemasDeProducto(D, prodId) {
  return D.problemas.filter(p => p.prods.some(r => r.p === prodId));
}

/** Otros productos de la misma línea. */
export function hermanosDeProducto(D, p) {
  return D.productos.filter(x => x.cat === p.cat && x.id !== p.id);
}
