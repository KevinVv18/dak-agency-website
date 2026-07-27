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
  return '<aside class="asesoria">'
    + '<span class="asesoria-ico">' + icono(o.icono || 'zona') + '</span>'
    + '<div><h3>' + esc(o.titulo) + '</h3><p>' + esc(o.texto) + '</p></div>'
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
