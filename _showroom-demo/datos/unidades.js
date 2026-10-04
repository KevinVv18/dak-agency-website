// Inventario de ejemplo. Numeración peruana: el Dpto. 701 es el piso 7,
// posición 01.
//
// `precio` en soles. null = no se publica («Precio a consultar»), nunca 0.
// Vendidos y reservados no muestran precio. Hay huecos a propósito (902 sin
// precio estando disponible) para que la interfaz se pruebe contra datos
// imperfectos.

const u = (id, piso, posicion, tipologia, estado, precio = null) => ({
  id, piso, posicion, tipologia, estado, precio,
});

export default [
  u('201', '2', '01', 'A', 'vendido'),
  u('202', '2', '02', 'B', 'vendido'),
  u('203', '2', '03', 'B', 'disponible', 183000),
  u('204', '2', '04', 'A', 'vendido'),

  u('301', '3', '01', 'A', 'vendido'),
  u('302', '3', '02', 'B', 'disponible', 187000),
  u('303', '3', '03', 'B', 'reservado'),
  u('304', '3', '04', 'A', 'disponible', 244500),

  u('401', '4', '01', 'A', 'disponible', 250000),
  u('402', '4', '02', 'B', 'vendido'),
  u('403', '4', '03', 'B', 'disponible', 187000),
  u('404', '4', '04', 'A', 'vendido'),

  u('501', '5', '01', 'A', 'reservado'),
  u('502', '5', '02', 'B', 'disponible', 191000),
  u('503', '5', '03', 'B', 'disponible', 189000),
  u('504', '5', '04', 'A', 'disponible', 249500),

  u('601', '6', '01', 'A', 'disponible', 255000),
  u('602', '6', '02', 'B', 'vendido'),
  u('603', '6', '03', 'B', 'disponible', 191000),
  u('604', '6', '04', 'A', 'disponible', 252000),

  u('701', '7', '01', 'A', 'disponible', 257500),
  u('702', '7', '02', 'B', 'disponible', 195000),
  u('703', '7', '03', 'B', 'reservado'),
  u('704', '7', '04', 'A', 'disponible', 254500),

  u('801', '8', '01', 'A', 'vendido'),
  u('802', '8', '02', 'B', 'disponible', 197000),
  u('803', '8', '03', 'B', 'disponible', 195000),
  u('804', '8', '04', 'A', 'disponible', 257000),

  u('901', '9', '01', 'A', 'disponible', 262500),
  u('902', '9', '02', 'B', 'disponible'),
  u('903', '9', '03', 'B', 'disponible', 197000),
  u('904', '9', '04', 'A', 'vendido'),

  u('1001', '10', '01', 'PH', 'disponible'),
  u('1002', '10', '02', 'PH', 'reservado'),
];
