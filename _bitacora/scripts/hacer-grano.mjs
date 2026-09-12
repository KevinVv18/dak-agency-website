/**
 * Genera el grano de película: un mosaico PNG en escala de grises.
 *
 *   node scripts/hacer-grano.mjs
 *
 * Por qué un asset y no un filtro SVG en CSS:
 *
 * El grano estuvo como una capa `feTurbulence` fija por encima de TODO, texto
 * incluido. A la intensidad que se notaba lavaba la tipografía —los ratios
 * medidos sobre la hoja de estilos no tenían nada que ver con lo que llegaba a
 * la pantalla— y a la intensidad que respetaba el texto no se veía. Un velo
 * sobre el contenido sólo se puede bajar hasta que desaparece.
 *
 * Como mosaico, el grano entra por `background-image` de cada superficie y se
 * mezcla con su color mediante `background-blend-mode`. Así vive DENTRO del
 * material —la banda naranja, la hoja de tinta— y el texto va encima, intacto.
 *
 * También se probó `ffmpeg -vf geq=random(1)`, que produce bandas verticales
 * visibles al repetir el mosaico. Esto usa ruido de verdad.
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const LADO = 160

/**
 * Generador con semilla: el asset tiene que salir idéntico en cada ejecución.
 * Un grano que cambia en cada build ensucia el diff y hace irreproducible
 * cualquier comparación de capturas.
 */
let semilla = 0x1d90a862 // la del contrato de dirección
const aleatorio = () => {
  semilla ^= semilla << 13
  semilla ^= semilla >>> 17
  semilla ^= semilla << 5
  return ((semilla >>> 0) % 100000) / 100000
}

/**
 * Distribución centrada en el gris medio: al mezclar en `soft-light` u
 * `overlay`, 128 es el punto neutro, así que un ruido centrado ahí aclara y
 * oscurece por igual y no desplaza el color de la superficie.
 *
 * Se suman tres tiradas (aproximación a una normal) para que el grano tenga
 * pocos extremos y mucha variación media: es lo que distingue el grano de
 * película del ruido de sal y pimienta.
 */
function valor() {
  const n = (aleatorio() + aleatorio() + aleatorio()) / 3
  return Math.max(0, Math.min(255, Math.round(128 + (n - 0.5) * 250)))
}

// PNG en escala de grises, 8 bits: cada fila lleva delante su byte de filtro.
const crudo = Buffer.alloc((LADO + 1) * LADO)
for (let y = 0; y < LADO; y++) {
  crudo[y * (LADO + 1)] = 0 // filtro None
  for (let x = 0; x < LADO; x++) {
    crudo[y * (LADO + 1) + 1 + x] = valor()
  }
}

const crc32 = (() => {
  const tabla = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c
  }
  return (b) => {
    let c = -1
    for (let i = 0; i < b.length; i++) c = tabla[(c ^ b[i]) & 0xff] ^ (c >>> 8)
    return (c ^ -1) >>> 0
  }
})()

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(LADO, 0)
ihdr.writeUInt32BE(LADO, 4)
ihdr[8] = 8 // profundidad
ihdr[9] = 0 // escala de grises
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  trozo('IHDR', ihdr),
  trozo('IDAT', deflateSync(crudo, { level: 9 })),
  trozo('IEND', Buffer.alloc(0)),
])

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'grano.png')
writeFileSync(destino, png)
console.log(`grano ${LADO}×${LADO} → ${destino} (${(png.length / 1024).toFixed(1)} kB)`)
