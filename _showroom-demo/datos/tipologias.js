// Tipologías: el contenido compartido por todas las unidades del mismo tipo
// (planta, recorrido, galería). Las áreas son de ejemplo hasta tener planos,
// pero calibradas con la plaza (oct-2026): en Chiclayo domina el depa de
// 3 dormitorios y 2 baños de 65–90 m², y el de 2 dormitorios + ambiente flex.

export default [
  {
    id: 'A',
    nombre: 'Tipo A',
    dormitorios: 3,
    banos: 2,
    areaTechada: 84.6,
    areaLibre: 4.2,
    resumen: '3 dormitorios con balcón',
    ambientes: [
      'Sala-comedor con balcón',
      'Cocina cerrada con lavandería',
      'Dormitorio principal con baño y walk-in',
      'Dos dormitorios secundarios',
      'Baño de visitas',
    ],
    planta: { amoblada: null, plano: null },
    escenas: [
      { id: 'sala', nombre: 'Sala y comedor' },
      { id: 'cocina', nombre: 'Cocina' },
      { id: 'principal', nombre: 'Dormitorio principal' },
      { id: 'balcon', nombre: 'Balcón' },
    ],
  },
  {
    id: 'B',
    nombre: 'Tipo B',
    dormitorios: 2,
    banos: 2,
    areaTechada: 63.8,
    areaLibre: 0,
    resumen: '2 dormitorios + estudio',
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
