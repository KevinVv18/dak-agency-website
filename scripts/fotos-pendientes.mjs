/**
 * Imprime qué fotos faltan por subir a Cloudinary y con qué nombre exacto.
 *
 *   npm run fotos:pendientes
 *
 * Lee src/data/fotografia.js directamente como texto para no arrastrar los
 * imports de assets de Vite, que fuera del bundle no resuelven.
 */
import { readFileSync } from 'node:fs'

const fuente = readFileSync('src/data/fotografia.js', 'utf8')
const cuerpo = fuente.slice(
  fuente.indexOf('export const sesiones'),
  fuente.indexOf('/** Solo lo que existe'),
)

// Cada entrada es un objeto entre llaves de primer nivel dentro del array.
const entradas = [...cuerpo.matchAll(/\{([^{}]*)\}/g)].map((m) => {
  const campo = (n) => (m[1].match(new RegExp(`${n}: '([^']*)'`)) || [])[1]
  return {
    id: campo('id'),
    cliente: campo('cliente'),
    sector: campo('sector'),
    linea: campo('linea'),
    alt: campo('alt'),
    publicado: /publicado: true/.test(m[1]),
  }
}).filter((e) => e.id)

const pendientes = entradas.filter((e) => !e.publicado)
const listas = entradas.filter((e) => e.publicado)

console.log(`\nCARPETA DE DESTINO EN CLOUDINARY:  dak/estudio`)
console.log(`El nombre del archivo debe ser EXACTAMENTE el de la columna "archivo".`)
console.log(`La extensión da igual (.jpg, .png, .webp): f_auto sirve el formato que toque.\n`)

console.log(`FALTAN ${pendientes.length} — agrupadas por cliente:\n`)
let clienteActual = null
for (const p of pendientes) {
  if (p.cliente !== clienteActual) {
    clienteActual = p.cliente
    console.log(`  ${p.cliente}  ·  ${p.sector}`)
  }
  console.log(`      ${p.id.padEnd(22)} ${p.alt}`)
}

console.log(`\nYA ESTÁN (${listas.length}):`)
for (const l of listas) {
  const origen = /^(familia|hermanos|pareja|maternidad|newborn|pediatra-corrales)$/.test(l.id)
    ? 'repo'
    : 'cloudinary'
  console.log(`      ${l.id.padEnd(22)} ${l.linea.padEnd(10)} ${origen}`)
}

console.log(`
RECOMENDACIONES DE ORIGEN
  · Sube el archivo tal cual sale de la edición. No hace falta comprimir ni
    redimensionar: Cloudinary genera cada variante y el navegador pide la que
    necesita (900px en móvil, 1600px en escritorio).
  · Lado largo de al menos 1600px, para que la variante grande no se quede corta.
  · Horizontal o cuadrada mejor que vertical: la sección las muestra apaisadas.

CUANDO SUBAS UNA
  Cambia 'publicado: false' por 'true' en src/data/fotografia.js para esa
  entrada. Hasta entonces no se pinta, para no dejar un hueco roto en producción.
`)
