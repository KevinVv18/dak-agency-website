// Tipologías: el contenido compartido por todas las unidades del mismo tipo
// (planta, recorrido, galería). Las áreas son de ejemplo hasta tener planos,
// pero calibradas con la plaza (oct-2026) y con la planta real del edificio
// procedural (14,4 x 22 m, 4 dptos por piso alrededor de un núcleo central):
// en Chiclayo domina el depa Mivivienda de 3 dormitorios y 2 baños de ~65 m².

export default [
  {
    id: 'A',
    nombre: 'Tipo A',
    dormitorios: 3,
    banos: 2,
    areaTechada: 65.9,
    areaLibre: 0,
    resumen: '3 dormitorios, frente a la avenida',
    ambientes: [
      'Sala-comedor con ventanal a la avenida',
      'Cocina con lavandería',
      'Dormitorio principal con baño',
      'Dos dormitorios',
      'Baño completo',
    ],
    planta: { amoblada: null, plano: null },
    escenas: [
      { id: 'sala', nombre: 'Sala y comedor' },
      { id: 'cocina', nombre: 'Cocina' },
      { id: 'principal', nombre: 'Dormitorio principal' },
    ],
  },
  {
    id: 'B',
    nombre: 'Tipo B',
    dormitorios: 2,
    banos: 2,
    areaTechada: 61.8,
    areaLibre: 0,
    resumen: '2 dormitorios + estudio, hacia el patio',
    ambientes: [
      'Sala-comedor',
      'Cocina abierta con lavandería',
      'Dormitorio principal con baño',
      'Dormitorio secundario',
      'Estudio o ambiente flex',
      'Baño completo',
    ],
    planta: { amoblada: null, plano: null },
    escenas: [
      { id: 'sala', nombre: 'Sala y cocina' },
      { id: 'principal', nombre: 'Dormitorio principal' },
    ],
  },
];
