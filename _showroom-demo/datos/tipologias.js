// Tipologías: el contenido compartido por todas las unidades del mismo tipo
// (planta, recorrido, galería). Las áreas son de ejemplo hasta tener planos,
// pero calibradas con la plaza (oct-2026) y con la planta real del edificio
// procedural (14,4 x 22 m, 4 dptos por piso alrededor de un núcleo central):
// en Chiclayo domina el depa Mivivienda de 3 dormitorios y 2 baños de ~65 m².

// Planta amoblada, plano técnico y panoramas salen del mismo layout de
// produccion/interior.py; los enlaces del recorrido (yaw) se calculan de las
// posiciones reales de cámara. `yaw` es hacia dónde abre la escena: la sala
// abre mirando el sofá y la TV, no la puerta del pasillo.

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
    planta: { amoblada: 'assets/plantas/tipo-a-amoblada-v2.webp', plano: 'assets/plantas/tipo-a-plano-v1.svg' },
    escenas: [
      {
        id: 'sala',
        nombre: 'Sala y comedor',
        panorama: 'assets/360/tipo-a-sala-v3.jpg',
        yaw: 118,
        enlaces: [{ a: 'cocina', yaw: -41.4, pitch: -29.8, texto: 'Cocina' }, { a: 'principal', yaw: 5.3, pitch: -11.3, texto: 'Dormitorio principal' }],
      },
      {
        id: 'cocina',
        nombre: 'Cocina',
        panorama: 'assets/360/tipo-a-cocina-v3.jpg',
        yaw: -50,
        enlaces: [{ a: 'sala', yaw: 138.6, pitch: -29.8, texto: 'Sala y comedor' }, { a: 'principal', yaw: 23.6, pitch: -13.9, texto: 'Dormitorio principal' }],
      },
      {
        id: 'principal',
        nombre: 'Dormitorio principal',
        panorama: 'assets/360/tipo-a-principal-v3.jpg',
        yaw: -72,
        enlaces: [{ a: 'sala', yaw: -174.7, pitch: -11.3, texto: 'Sala y comedor' }, { a: 'cocina', yaw: -156.4, pitch: -13.9, texto: 'Cocina' }],
      },
    ],
  },
  {
    id: 'B',
    nombre: 'Tipo B',
    dormitorios: 2,
    banos: 2,
    areaTechada: 65.9,
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
    planta: { amoblada: 'assets/plantas/tipo-b-amoblada-v2.webp', plano: 'assets/plantas/tipo-b-plano-v1.svg' },
    escenas: [
      {
        id: 'sala',
        nombre: 'Sala y cocina',
        panorama: 'assets/360/tipo-b-sala-v3.jpg',
        yaw: 118,
        enlaces: [{ a: 'principal', yaw: 5.3, pitch: -11.3, texto: 'Dormitorio principal' }],
      },
      {
        id: 'principal',
        nombre: 'Dormitorio principal',
        panorama: 'assets/360/tipo-b-principal-v3.jpg',
        yaw: -72,
        enlaces: [{ a: 'sala', yaw: -174.7, pitch: -11.3, texto: 'Sala y cocina' }],
      },
    ],
  },
];
