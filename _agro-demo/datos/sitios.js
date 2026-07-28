/* ─────────────────────────────────────────────────────────────────────────────
   sitios.js — qué sitios construye el generador.

   El mismo motor produce N sitios: cambian la marca, los productos y la carpeta
   de salida; las plantillas, el CSS y el JS son exactamente los mismos. Eso es
   lo que hace que skin-ear la propuesta para un cliente cueste un archivo de
   datos y no una rama del proyecto.

   Funciona porque TODOS los enlaces del sitio son relativos: un sitio generado
   dentro de una subcarpeta se comporta igual que en la raíz de un dominio.

   `privado: true` marca los que no deben aparecer en el sitemap público, ni
   llevar enlaces entrantes, ni pasar el guardián anti-filtración del deploy.
   ───────────────────────────────────────────────────────────────────────── */

import marcaArenal from './marca.js';
import productosArenal from './productos.js';
import marcaExcelag from './marca-excelag.js';
import productosExcelag from './productos-excelag.js';
import cultivosExcelag from './cultivos-excelag.js';

export const SITIOS = [
  {
    id: 'arenal',
    salida: '',                 // raíz de dist/
    marca: marcaArenal,
    productos: productosArenal,
    privado: false
  },
  {
    id: 'excelag',
    /* Slug con fecha y sin patrón adivinable. No se enlaza desde ningún sitio
       público: se comparte por WhatsApp con el cliente y punto. */
    salida: 'p-2026-10-excelag',
    marca: marcaExcelag,
    productos: productosExcelag,
    cultivos: cultivosExcelag,
    privado: true,
    /* El blog y el diagnóstico no entran en la maqueta del cliente: son
       secciones que se redactan CON su equipo agronómico, y presentarlas con
       contenido de la marca ficticia confundiría lo propuesto con lo hecho. */
    excluir: ['blog', 'problemas']
  }
];
