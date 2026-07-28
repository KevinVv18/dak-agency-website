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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import marca from './marca.js';
import productos from './productos.js';
import cultivos from './cultivos.js';
import problemas from './problemas.js';

/* ── Blog ───────────────────────────────────────────────────────────────────
   Los posts son archivos JSON sueltos, con los MISMOS campos que usa el
   pipeline de `_blog-content/` (title, slug, excerpt, category, tags, content,
   rank_math, faq_jsonld). Se respeta ese esquema aunque hoy el blog sea
   estático: si el cliente decide pasar a WordPress, el contenido se publica con
   el `publish.sh` que ya existe y lo único que hay que mapear es la categoría,
   que allá es un id numérico y aquí un slug legible.

   Se leen del directorio en vez de importarse uno por uno para que agregar un
   post sea dejar el archivo, sin tocar código.
   ───────────────────────────────────────────────────────────────────────── */
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_BLOG = path.join(AQUI, 'blog');

const blog = fs.existsSync(DIR_BLOG)
  ? fs.readdirSync(DIR_BLOG)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(DIR_BLOG, f), 'utf8')))
      // Más reciente primero. El orden lo da la fecha, no el nombre del archivo:
      // el prefijo numérico es para que la carpeta se lea ordenada, nada más.
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
  : [];

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

/* Categorías del blog. */
const categoriasBlog = {
  manejo: 'Manejo',
  diagnostico: 'Diagnóstico',
  aplicacion: 'Aplicación',
  poscosecha: 'Poscosecha'
};

/* Cifras derivadas de los datos reales, nunca escritas a mano. */
const stats = {
  nProductos: productos.length,
  nCultivos: cultivos.filter(c => c.listo).length,
  nCultivosTotal: cultivos.length,
  nProblemas: problemas.length,
  nOrganicos: productos.filter(p => p.org).length,
  nPosts: blog.length
};

export default {
  marca,
  productos,
  cultivos,
  problemas,
  blog,
  categorias,
  categoriasBlog,
  tiposProblema,
  stats,

  /* Número de registro único y OBVIAMENTE falso. Publicar uno con forma
     plausible para un producto inexistente sería una afirmación regulatoria
     falsa en un mercado regulado, no una licencia creativa. */
  registro: 'DEMO-0000-SENASA',
  esDemo: true
};
