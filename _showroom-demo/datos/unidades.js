// Inventario de ejemplo. Numeración peruana: el Dpto. 501 es el piso 5,
// posición 01.
//
// Escala de edificio boutique de Chiclayo (referencia: el tipo de proyecto del
// cliente que se quiere atraer): 5 pisos de departamentos sobre un piso 1 de
// recepción y cocheras, 4 departamentos por piso.
//
// `precio` en soles. null = no se publica («Precio a consultar»), nunca 0.
// Vendidos y reservados no muestran precio. Hay huecos a propósito (603 sin
// precio estando disponible) para que la interfaz se pruebe contra datos
// imperfectos.
//
// Excepciones por unidad: `areaLibre` y `extras` reemplazan o amplían lo que
// trae la tipología. Los del piso 6 al frente tienen terraza propia en azotea.

const u = (id, piso, posicion, tipologia, estado, precio = null, excepciones = {}) => ({
  id, piso, posicion, tipologia, estado, precio, ...excepciones,
});

const azotea = (m2) => ({ areaLibre: m2, extras: [`Terraza privada en azotea de ${m2} m²`] });

export default [
  u('201', '2', '01', 'A', 'vendido'),
  u('202', '2', '02', 'B', 'vendido'),
  u('203', '2', '03', 'B', 'disponible', 183000),
  u('204', '2', '04', 'A', 'vendido'),

  u('301', '3', '01', 'A', 'vendido'),
  u('302', '3', '02', 'B', 'disponible', 187500),
  u('303', '3', '03', 'B', 'reservado'),
  u('304', '3', '04', 'A', 'disponible', 245000),

  u('401', '4', '01', 'A', 'disponible', 251000),
  u('402', '4', '02', 'B', 'vendido'),
  u('403', '4', '03', 'B', 'disponible', 188000),
  u('404', '4', '04', 'A', 'disponible', 248000),

  u('501', '5', '01', 'A', 'reservado'),
  u('502', '5', '02', 'B', 'disponible', 192500),
  u('503', '5', '03', 'B', 'disponible', 190500),
  u('504', '5', '04', 'A', 'disponible', 251000),

  u('601', '6', '01', 'A', 'disponible', 282000, azotea(42)),
  u('602', '6', '02', 'B', 'disponible', 219000, azotea(34)),
  u('603', '6', '03', 'B', 'disponible'),
  u('604', '6', '04', 'A', 'vendido'),
];
