// Edificio: vistas exteriores, plantillas de planta y pisos.
//
// Geometría en coordenadas normalizadas (0–1) sobre la imagen de la planta, así
// el polígono sigue alineado con cualquier tamaño de pantalla o zoom. Cuando
// llegue la planta amoblada renderizada se rellena `imagen` y el esquema deja
// de dibujarse; las coordenadas se recalibran contra esa imagen.

// Paradas de cámara del exterior. `camara` es la vista homónima de
// produccion/edificio.py: así cada imagen se puede regenerar sabiendo de dónde
// sale. Con `imagen` en null el motor dibuja un marcador en su lugar.
// Franjas de piso sobre cada render: las calcula produccion/mascaras.py
// proyectando la geometría de cada piso con la misma cámara del render.
import { readFileSync } from 'node:fs';
const mascaras = JSON.parse(readFileSync(new URL('./mascaras.json', import.meta.url), 'utf8'));
const franjas = (camara) => ({ pisos: mascaras[`web_${camara}`], pisosMovil: mascaras[`movil_${camara}`] });

const giro = JSON.parse(readFileSync(new URL('./giro.json', import.meta.url), 'utf8'));
const cuadros = (modo) => `assets/giro/${modo}-v3/f{n}.webp`;
const ext = (vista, modo, extra = '') => `assets/exterior/${vista}-${modo}${extra}-v2.webp`;
// Imágenes de una vista de calle: día/noche, versión vertical para celular y,
// en las diagonales, la variante con los vecinos como maqueta translúcida.
const imagenes = (vista, fantasma = false) => ({
  dia: ext(vista, 'dia'), diaMovil: ext(vista, 'dia', '-movil'),
  noche: ext(vista, 'noche'), nocheMovil: ext(vista, 'noche', '-movil'),
  ...(fantasma ? {
    diaFantasma: ext(vista, 'dia', '-fantasma'), diaMovilFantasma: ext(vista, 'dia', '-movil-fantasma'),
    nocheFantasma: ext(vista, 'noche', '-fantasma'), nocheMovilFantasma: ext(vista, 'noche', '-movil-fantasma'),
  } : {}),
});

export const vistas = [
  // Giro 360 de dron (edificio.py --orbita 72): un cuadro cada 5 grados, bajo al
  // frente y más alto atrás. Las franjas de cada cuadro salen de la misma cámara.
  {
    id: 'giro', nombre: 'Giro 360°',
    giro: {
      cuadros: 72,
      dia: cuadros('dia'), diaMovil: cuadros('dia-movil'), noche: cuadros('noche'), nocheMovil: cuadros('noche-movil'),
      // al elegir un piso, los vecinos se vuelven maqueta (mismo cuadro, otra toma)
      diaFantasma: cuadros('dia-fantasma'), nocheFantasma: cuadros('noche-fantasma'),
      franjas: giro.franjas, franjasMovil: giro.franjasMovil,
    },
    imagen: { dia: 'assets/giro/dia-v3/f000.webp', diaMovil: 'assets/giro/dia-movil-v3/f000.webp', noche: 'assets/giro/noche-v3/f000.webp', nocheMovil: 'assets/giro/noche-movil-v3/f000.webp' },
  },
  { id: 'frente', nombre: 'Frente', camara: 'web_frente', ...franjas('frente'), imagen: imagenes('frente') },
  { id: 'diagonal-izq', nombre: 'Desde la avenida', camara: 'web_diag_izq', ...franjas('diag_izq'), imagen: imagenes('diagonal-izq', true) },
  { id: 'diagonal-der', nombre: 'Esquina opuesta', camara: 'web_diag_der', ...franjas('diag_der'), imagen: imagenes('diagonal-der', true) },
];

// Clip de transición entre paradas consecutivas, clave "origen>destino".
export const transiciones = {};

// Planta típica en coordenadas normalizadas sobre el rectángulo del edificio
// (14,4 m de frente x 22 m de fondo), con la avenida ABAJO: u = x / 14,4,
// v = 1 - y / 22. Son las mismas medidas de PARAM en produccion/edificio.py.
const F = 14.4;
const P = 22;
const pt = (x, y) => [+(x / F).toFixed(4), +(1 - y / P).toFixed(4)];
const rect = (x0, y0, x1, y1) => [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)];

export const plantillas = {
  tipica: {
    nombre: 'Planta típica',
    orientacionPlano: 'La avenida queda en la parte inferior de la planta.',
    aspecto: F / P,
    // Render cenital de produccion/interior.py --salida piso, encuadrado exacto
    // al rectángulo del edificio (100 px/m): los polígonos calzan sin ajuste.
    imagen: 'assets/plantas/piso-tipico-v3.webp',
    // Cenital del barrio sin el edificio (edificio.py --vista planta_contexto):
    // la planta queda a pantalla completa rodeada de su manzana real. `marco`
    // es lo que cubre esa imagen en coordenadas normalizadas de la planta.
    contexto: { imagen: 'assets/plantas/contexto-piso-v2.webp', marco: [-2.0833, -1.0, 3.0833, 2.1818] },
    esquema: {
      contorno: rect(0, 0, F, P),
      pasillo: rect(6.0, 0, 8.4, P),
      nucleo: rect(6.0, 8.5, 8.4, 13.5),
    },
    posiciones: {
      '01': { orientacion: 'Frente a la avenida', poligono: rect(0, 0, 6.0, 11) },
      '02': { orientacion: 'Frente a la avenida', poligono: rect(8.4, 0, F, 11) },
      '03': { orientacion: 'Hacia el patio posterior', poligono: rect(8.4, 11, F, P) },
      '04': { orientacion: 'Hacia el patio posterior', poligono: rect(0, 11, 6.0, P) },
    },
  },
};

// Piso 1 y azotea: sin departamentos, con sus espacios rotulados sobre la
// planta. Mismo encuadre y contexto que el piso típico. La azotea es un cenital
// de la misma escena del giro 360 (edificio.py --vista planta_azotea); el
// piso 1 sale de produccion/comunes.py.
const contexto = { imagen: 'assets/plantas/contexto-piso-v2.webp', marco: [-2.0833, -1.0, 3.0833, 2.1818] };
plantillas.primer = {
  nombre: 'Piso 1',
  orientacionPlano: 'La avenida queda en la parte inferior de la planta.',
  aspecto: F / P,
  imagen: 'assets/plantas/piso1-v2.webp',
  contexto,
  posiciones: {},
  espacios: [
    { id: 'recepcion', nombre: 'Recepción', detalle: 'Counter, sala de espera y casilleros', poligono: rect(0, 0, 6.0, 8.4) },
    { id: 'servicio', nombre: 'Depósitos y cuarto de bombas', poligono: rect(0, 8.4, 6.0, 14.0) },
    { id: 'cocheras', nombre: '6 estacionamientos', detalle: 'E-01 a E-06 · se venden aparte', poligono: rect(8.4, 0, F, P) },
  ],
};
plantillas.azotea = {
  nombre: 'Azotea',
  orientacionPlano: 'La avenida queda en la parte inferior de la planta.',
  aspecto: F / P,
  imagen: 'assets/plantas/azotea-v2.webp',
  contexto,
  posiciones: {},
  espacios: [
    { id: 't601', nombre: 'Terraza privada', unidad: '601', poligono: rect(0.2, 0.2, 5.9, 8.3) },
    { id: 't602', nombre: 'Terraza privada', unidad: '602', poligono: rect(8.5, 0.2, 14.2, 8.3) },
    { id: 'comun', nombre: 'Terraza común', detalle: 'Pérgola, comedor y parrilla', poligono: rect(0.2, 14.2, 14.2, 21.8) },
    { id: 'tecnica', nombre: 'Tanques y área técnica', poligono: rect(0.2, 8.3, 6.0, 14.0) },
  ],
};

const pisosTipicos = Array.from({ length: 5 }, (_, i) => {
  const n = String(i + 2);
  return { id: n, etiqueta: `Piso ${n}`, plantilla: 'tipica' };
});

// Orden de abajo hacia arriba. `uso` describe los pisos sin departamentos.
export const pisos = [
  { id: '1', etiqueta: 'Piso 1', plantilla: 'primer', uso: 'Recepción, ascensor y cocheras' },
  ...pisosTipicos,
  { id: 'azotea', etiqueta: 'Azotea', plantilla: 'azotea', uso: 'Terraza común con parrillas y terrazas privadas de los dptos. 601 y 602' },
];

export const amenidades = [
  { id: 'terraza', nombre: 'Terraza común con parrillas', piso: 'azotea' },
  { id: 'recepcion', nombre: 'Recepción con ascensor', piso: '1' },
];
