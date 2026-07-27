/* ─────────────────────────────────────────────────────────────────────────────
   index.js — arma el objeto de datos completo.

   Lo consumen dos mundos:
     · el generador (Node, con require)
     · el navegador, porque el generador serializa este mismo objeto a
       dist/datos.js como `window.AGRO`

   Una sola fuente de verdad para los dos. Las cifras del sitio (cuántos
   productos, cuántos cultivos con programa) se CALCULAN aquí en vez de
   escribirse a mano: así no pueden quedar desfasadas de la realidad, que es de
   donde salen las cifras infladas.
   ───────────────────────────────────────────────────────────────────────── */

import marca from './marca.js';
import productos from './productos.js';
import cultivos from './cultivos.js';
import problemas from './problemas.js';

/* Etiquetas legibles por categoría de producto. */
const categorias = {
  nutricion: 'Nutrición',
  bioestimulante: 'Bioestimulante',
  defensa: 'Inducción de defensas',
  biologico: 'Control biológico',
  control: 'Control de plagas',
  suelo: 'Suelo y agua',
  coadyuvante: 'Coadyuvante'
};

/* Tipos de problema. El plural es para los encabezados de los índices. */
const tiposProblema = {
  plaga: { n: 'Plaga', plural: 'Plagas' },
  enfermedad: { n: 'Enfermedad', plural: 'Enfermedades' },
  carencia: { n: 'Carencia nutricional', plural: 'Carencias nutricionales' },
  abiotico: { n: 'Desorden abiótico', plural: 'Desórdenes abióticos' }
};

/* Cifras derivadas de los datos reales, nunca escritas a mano. */
const stats = {
  nProductos: productos.length,
  nCultivos: cultivos.filter(c => c.listo).length,
  nCultivosTotal: cultivos.length,
  nProblemas: problemas.length,
  nOrganicos: productos.filter(p => p.org).length
};

export default {
  marca,
  productos,
  cultivos,
  problemas,
  categorias,
  tiposProblema,
  stats,

  /* Número de registro único y OBVIAMENTE falso. Publicar uno con forma
     plausible para un producto inexistente sería una afirmación regulatoria
     falsa en un mercado regulado, no una licencia creativa. */
  registro: 'DEMO-0000-SENASA',
  esDemo: true
};
