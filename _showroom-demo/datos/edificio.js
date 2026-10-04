// Edificio: vistas exteriores, plantillas de planta y pisos.
//
// Geometría en coordenadas normalizadas (0–1) sobre la imagen de la planta, así
// el polígono sigue alineado con cualquier tamaño de pantalla o zoom. Cuando
// llegue la planta amoblada renderizada se rellena `imagen` y el esquema deja
// de dibujarse; las coordenadas se recalibran contra esa imagen.

// Paradas de cámara del exterior. `imagen` y `transicion` quedan en null hasta
// tener renders: el motor dibuja un marcador en su lugar.
export const vistas = [
  { id: 'frente', nombre: 'Frente', imagen: { dia: null, noche: null } },
  { id: 'esquina', nombre: 'Esquina', imagen: { dia: null, noche: null } },
  { id: 'lateral', nombre: 'Lateral', imagen: { dia: null, noche: null } },
  { id: 'posterior', nombre: 'Posterior', imagen: { dia: null, noche: null } },
];

// Clip de transición entre paradas consecutivas, clave "origen>destino".
export const transiciones = {};

export const plantillas = {
  tipica: {
    nombre: 'Planta típica',
    aspecto: 1000 / 640,
    imagen: null,
    esquema: {
      contorno: [[0.05, 0.08], [0.95, 0.08], [0.95, 0.92], [0.05, 0.92]],
      nucleo: [[0.50, 0.30], [0.58, 0.30], [0.58, 0.70], [0.50, 0.70]],
      pasillo: [[0.05, 0.44], [0.95, 0.44], [0.95, 0.56], [0.05, 0.56]],
    },
    posiciones: {
      '01': {
        orientacion: 'Frente a la calle',
        poligono: [[0.05, 0.08], [0.54, 0.08], [0.54, 0.30], [0.50, 0.30], [0.50, 0.44], [0.05, 0.44]],
      },
      '02': {
        orientacion: 'Frente a la calle',
        poligono: [[0.54, 0.08], [0.95, 0.08], [0.95, 0.44], [0.58, 0.44], [0.58, 0.30], [0.54, 0.30]],
      },
      '03': {
        orientacion: 'Hacia el patio posterior',
        poligono: [[0.58, 0.56], [0.95, 0.56], [0.95, 0.92], [0.54, 0.92], [0.54, 0.70], [0.58, 0.70]],
      },
      '04': {
        orientacion: 'Hacia el patio posterior',
        poligono: [[0.05, 0.56], [0.50, 0.56], [0.50, 0.70], [0.54, 0.70], [0.54, 0.92], [0.05, 0.92]],
      },
    },
  },
  penthouse: {
    nombre: 'Planta de penthouses',
    aspecto: 1000 / 640,
    imagen: null,
    esquema: {
      contorno: [[0.05, 0.08], [0.95, 0.08], [0.95, 0.92], [0.05, 0.92]],
      nucleo: [[0.46, 0.36], [0.54, 0.36], [0.54, 0.64], [0.46, 0.64]],
      pasillo: [[0.40, 0.44], [0.60, 0.44], [0.60, 0.56], [0.40, 0.56]],
    },
    posiciones: {
      '01': {
        orientacion: 'Frente y patio, terraza al frente',
        poligono: [[0.05, 0.08], [0.46, 0.08], [0.46, 0.44], [0.40, 0.44], [0.40, 0.56], [0.46, 0.56], [0.46, 0.92], [0.05, 0.92]],
      },
      '02': {
        orientacion: 'Frente y patio, terraza lateral',
        poligono: [[0.54, 0.08], [0.95, 0.08], [0.95, 0.92], [0.54, 0.92], [0.54, 0.56], [0.60, 0.56], [0.60, 0.44], [0.54, 0.44]],
      },
    },
  },
};

const pisosTipicos = Array.from({ length: 8 }, (_, i) => {
  const n = String(i + 2);
  return { id: n, etiqueta: `Piso ${n}`, plantilla: 'tipica' };
});

// Orden de abajo hacia arriba. `uso` describe los pisos sin departamentos.
export const pisos = [
  { id: '1', etiqueta: 'Piso 1', plantilla: null, uso: 'Lobby, recepción y estacionamientos' },
  ...pisosTipicos,
  { id: '10', etiqueta: 'Piso 10', plantilla: 'penthouse' },
  { id: 'azotea', etiqueta: 'Azotea', plantilla: null, uso: 'Terraza común, zona de parrillas y gimnasio' },
];

export const amenidades = [
  { id: 'terraza', nombre: 'Terraza con zona de parrillas', piso: 'azotea' },
  { id: 'gimnasio', nombre: 'Gimnasio', piso: 'azotea' },
  { id: 'lobby', nombre: 'Lobby con recepción', piso: '1' },
];
