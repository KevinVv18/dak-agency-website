// Inventario de ejemplo. Numeración peruana: el Dpto. 501 es el piso 5,
// posición 01.
//
// Escala de edificio boutique de Chiclayo (referencia: el tipo de proyecto del
// cliente que se quiere atraer): 5 pisos de departamentos sobre un piso 1 de
// recepción y cocheras, 4 departamentos por piso. 01 y 02 dan a la avenida
// (Tipo A), 03 y 04 al patio posterior (Tipo B).
//
// `precio` en soles. null = no se publica («Precio a consultar»), nunca 0.
// Vendidos y reservados no muestran precio. Hay huecos a propósito (603 sin
// precio estando disponible) para que la interfaz se pruebe contra datos
// imperfectos.
//
// Excepciones por unidad: `areaLibre` y `extras` amplían lo que trae la
// tipología. Los balcones salen de la fachada de produccion/edificio.py, que
// los alterna: el 01 tiene balcón en los pisos 2, 4 y 6; el 02 en los pisos
// 3 y 5. El 601 y el 602 suman terraza propia en la azotea.

// Vista desde la unidad: render del barrio a la altura de su piso, hacia la
// avenida (01, 02) o hacia el patio (03, 04). Declarada «proyectada».
const vista = (piso, posicion) => ({
  imagen: `assets/vistas/${['01', '02'].includes(posicion) ? 'frente' : 'fondo'}-p${piso}-v1.webp`,
  fidelidad: 'proyectada',
});

const u = (id, piso, posicion, tipologia, estado, precio = null, excepciones = {}) => ({
  id, piso, posicion, tipologia, estado, precio, vista: vista(piso, posicion), ...excepciones,
});

const BALCON = 3.4;
const balcon = { areaLibre: BALCON, extras: [`Balcón de ${BALCON} m²`] };
const azotea = (m2, conBalcon) => ({
  areaLibre: m2 + (conBalcon ? BALCON : 0),
  extras: [...(conBalcon ? [`Balcón de ${BALCON} m²`] : []), `Terraza privada en azotea de ${m2} m²`],
});

export default [
  u('201', '2', '01', 'A', 'vendido', null, balcon),
  u('202', '2', '02', 'A', 'vendido'),
  u('203', '2', '03', 'B', 'disponible', 179000),
  u('204', '2', '04', 'B', 'vendido'),

  u('301', '3', '01', 'A', 'vendido'),
  u('302', '3', '02', 'A', 'disponible', 197500, balcon),
  u('303', '3', '03', 'B', 'reservado'),
  u('304', '3', '04', 'B', 'disponible', 181000),

  u('401', '4', '01', 'A', 'disponible', 200000, balcon),
  u('402', '4', '02', 'A', 'vendido'),
  u('403', '4', '03', 'B', 'disponible', 183000),
  u('404', '4', '04', 'B', 'disponible', 183000),

  u('501', '5', '01', 'A', 'reservado'),
  u('502', '5', '02', 'A', 'disponible', 202500, balcon),
  u('503', '5', '03', 'B', 'disponible', 185000),
  u('504', '5', '04', 'B', 'disponible', 185000),

  u('601', '6', '01', 'A', 'disponible', 251000, azotea(42, true)),
  u('602', '6', '02', 'A', 'disponible', 243000, azotea(34, false)),
  u('603', '6', '03', 'B', 'disponible'),
  u('604', '6', '04', 'B', 'vendido'),
];
