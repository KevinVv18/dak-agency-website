/* ─────────────────────────────────────────────────────────────────────────────
   iconos.js — set de iconos propio, en lenguaje de dibujo técnico.

   Reglas del set, para que se lean como una familia y no como una colección:
     · Lienzo 24×24, siempre.
     · Solo trazo, nunca relleno. `currentColor`, para que hereden el color del
       contexto sin variantes de archivo.
     · Grosor 1.6 uniforme. Los detalles secundarios no adelgazan el trazo: se
       diferencian con opacidad o con línea discontinua.
     · Remates y uniones EN ÁNGULO (square / miter). Nada redondeado — un plano
       técnico no redondea, y es lo que separa este set de los iconos amables
       que trae cualquier librería.
     · Geometría sobre ilustración: preferimos la línea recta y el ángulo medido
       a la silueta simpática.

   Cada entrada es solo el interior del <svg>; el envoltorio lo pone icono().
   ───────────────────────────────────────────────────────────────────────── */

const paths = {
  /* ── Líneas de producto ─────────────────────────────────────────────── */

  // Nutrición: hoja como espécimen medido, con nervadura y marcas de escala.
  nutricion:
    '<path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16Z"/>' +
    '<path d="M4 20 20 4" stroke-dasharray="2.4 2"/>' +
    '<path d="M9 15h3M13 11h3" opacity=".55"/>',

  // Bioestimulante: sistema radicular con impulso hacia arriba.
  bioestimulante:
    '<path d="M12 21V10"/>' +
    '<path d="M12 14 6 20M12 14l6 6" opacity=".6"/>' +
    '<path d="M8 4h8M12 4v6M9 7l3-3 3 3"/>',

  // Inducción de defensas: escudo angular, sin una sola curva.
  defensas:
    '<path d="M12 3 20 7v6l-8 8-8-8V7Z"/>' +
    '<path d="M12 8v6" opacity=".6"/>' +
    '<path d="M9 11h6" opacity=".6"/>',

  // Control biológico: placa de cultivo con colonias.
  biologico:
    '<path d="M12 3.5A8.5 8.5 0 1 0 12 20.5 8.5 8.5 0 1 0 12 3.5Z"/>' +
    '<path d="M9 9.5A1.6 1.6 0 1 0 9 12.7 1.6 1.6 0 1 0 9 9.5Z" opacity=".7"/>' +
    '<path d="M14.5 13A1.2 1.2 0 1 0 14.5 15.4 1.2 1.2 0 1 0 14.5 13Z" opacity=".7"/>' +
    '<path d="M14 8.4A1 1 0 1 0 14 10.4 1 1 0 1 0 14 8.4Z" opacity=".7"/>',

  // Control de plagas: retícula de puntería sobre el objetivo.
  control:
    '<path d="M12 5.5A6.5 6.5 0 1 0 12 18.5 6.5 6.5 0 1 0 12 5.5Z"/>' +
    '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
    '<path d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" opacity=".7"/>',

  // Suelo y agua: perfil de suelo por horizontes, con infiltración.
  suelo:
    '<path d="M3 9h18"/>' +
    '<path d="M3 14h18" stroke-dasharray="3 2.2" opacity=".7"/>' +
    '<path d="M3 19h18" stroke-dasharray="1.6 2.4" opacity=".5"/>' +
    '<path d="M12 2v5M9.6 4.6 12 2l2.4 2.6"/>',

  // Coadyuvante: gota sobre superficie, con el ángulo de mojado marcado.
  coadyuvante:
    '<path d="M12 3 7 10.5a5.6 5.6 0 1 0 10 0Z"/>' +
    '<path d="M3 21h18"/>' +
    '<path d="M6 18h4" opacity=".55"/>',

  /* ── Métricas ───────────────────────────────────────────────────────── */

  // Producto: bidón con asa.
  producto:
    '<path d="M6 9h10v12H6Z"/>' +
    '<path d="M16 12h2v5h-2" opacity=".7"/>' +
    '<path d="M9 4h4v5H9Z"/>' +
    '<path d="M7 13h8" stroke-dasharray="2 2" opacity=".6"/>',

  // Cultivo: hileras en fuga.
  cultivo:
    '<path d="M2 21 8.5 6M9 21l1.8-15M15 21l-1.8-15M22 21 15.5 6"/>' +
    '<path d="M4 16h16" stroke-dasharray="2.5 2.5" opacity=".5"/>',

  // Zona: marca sobre cuadrícula.
  zona:
    '<path d="M12 21s6-6.4 6-10.5A6 6 0 0 0 6 10.5C6 14.6 12 21 12 21Z"/>' +
    '<path d="M12 8.4a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z" opacity=".7"/>' +
    '<path d="M2 21h20" opacity=".55"/>',

  // Campaña: ciclo con marcas de etapa.
  ciclo:
    '<path d="M20 12a8 8 0 1 1-2.7-6"/>' +
    '<path d="M20 3v5h-5"/>' +
    '<path d="M12 7v5l3.2 2" opacity=".7"/>',

  /* ── Interfaz ───────────────────────────────────────────────────────── */

  flecha: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  descarga: '<path d="M12 3v12M7 11l5 5 5-5"/><path d="M4 21h16"/>',
  ficha:
    '<path d="M5 3h14v18H5Z"/>' +
    '<path d="M8 8h8M8 12h8M8 16h5" opacity=".65"/>',
  alerta:
    '<path d="M12 3 22 20H2Z"/>' +
    '<path d="M12 10v4" /><path d="M12 16.5v.5"/>'
};

/** Devuelve el <svg> completo de un icono. `extra` entra como clase adicional. */
function icono(nombre, extra) {
  const d = paths[nombre];
  if (!d) { return '' }
  return '<svg class="ico' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" '
    + 'fill="none" stroke="currentColor" stroke-width="1.6" '
    + 'stroke-linecap="square" stroke-linejoin="miter" '
    + 'aria-hidden="true" focusable="false">' + d + '</svg>';
}

export const nombres = Object.keys(paths);
export { paths, icono };
