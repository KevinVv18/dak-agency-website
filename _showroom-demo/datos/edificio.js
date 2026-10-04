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
  { id: 'diagonal', nombre: 'Diagonal', imagen: { dia: null, noche: null } },
  { id: 'balcones', nombre: 'Balcones', imagen: { dia: null, noche: null } },
  { id: 'cenital', nombre: 'Cocheras', imagen: { dia: null, noche: null } },
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
};

const pisosTipicos = Array.from({ length: 5 }, (_, i) => {
  const n = String(i + 2);
  return { id: n, etiqueta: `Piso ${n}`, plantilla: 'tipica' };
});

// Orden de abajo hacia arriba. `uso` describe los pisos sin departamentos.
export const pisos = [
  { id: '1', etiqueta: 'Piso 1', plantilla: null, uso: 'Recepción, ascensor y cocheras' },
  ...pisosTipicos,
  { id: 'azotea', etiqueta: 'Azotea', plantilla: null, uso: 'Terraza común con parrillas y terrazas privadas de los dptos. 601 y 602' },
];

export const amenidades = [
  { id: 'terraza', nombre: 'Terraza común con parrillas', piso: 'azotea' },
  { id: 'recepcion', nombre: 'Recepción con ascensor', piso: '1' },
];
