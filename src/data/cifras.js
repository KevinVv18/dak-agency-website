/**
 * Las cifras que el sitio afirma sobre DAK.
 *
 * ─── POR QUÉ ESTÁN AQUÍ Y NO EN CADA COMPONENTE ──────────────────────────
 *
 * Estaban escritas a mano en dos sitios y se habían contradicho:
 *
 *   Portada   →  50+ proyectos ·  98% satisfechos ·  5+ años
 *   /gallery  → 150+ proyectos ·  30+ clientes    ·  5  años
 *
 * El mismo sitio afirmaba 50 y 150 proyectos según la página. Un visitante
 * que baje por las dos —que es exactamente lo que hace un prospecto que se
 * está decidiendo— ve que las cuentas no cuadran, y a partir de ahí duda
 * también de los precios. Con una sola fuente eso no puede repetirse.
 *
 * ─── CÓMO ELEGIRLAS ──────────────────────────────────────────────────────
 *
 * La regla es: por encima de lo que el sitio enseña, por debajo de lo que
 * suena a inflado. Hoy la web publica 15 clientes con nombre y logo y 54
 * piezas entre sesiones, gráficas, banners y demos. Esas son el suelo: un
 * visitante puede contarlas. El techo lo pone la credibilidad.
 *
 * Se retiró "98% satisfechos" y no se sustituyó por otro porcentaje. Un dato
 * que nadie puede comprobar no suma confianza: la resta, porque el lector
 * sabe que nadie ha encuestado a nadie.
 *
 * Si estos números cambian, se cambian AQUÍ y salen bien en toda la web.
 */
export const CIFRAS = {
  clientes: {
    valor: '+25',
    etiqueta: 'Clientes',
    // El sitio enseña 15 con nombre y logo; el resto no se publica.
  },
  proyectos: {
    valor: '+80',
    etiqueta: 'Proyectos',
    // Entre sesiones, campañas, piezas gráficas y webs. La web muestra 54.
  },
  anios: {
    valor: '5',
    etiqueta: 'Años',
    // Sin el "+": o son 5 o son 6. El "+" en una cifra de años solo sirve
    // para no mojarse.
  },
}

/** El trío que se pinta en portada y en /gallery, en el mismo orden. */
export const CIFRAS_DESTACADAS = [CIFRAS.proyectos, CIFRAS.clientes, CIFRAS.anios]
