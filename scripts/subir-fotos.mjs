/**
 * Sube las fotos del Estudio a Cloudinary y marca el manifiesto.
 *
 *   npm run fotos:subir -- <carpeta-con-las-fotos>
 *
 * Qué hace
 *   1. Lee los ids pendientes de src/data/fotografia.js.
 *   2. Busca en la carpeta un archivo cuyo nombre (sin extensión) coincida.
 *   3. Lo sube a Cloudinary como dak/estudio/<id>.
 *   4. Pone `publicado: true` en esa entrada del manifiesto.
 *
 * Credenciales
 *   Las lee de variables de entorno o de un archivo .env. NUNCA se imprimen.
 *
 *     CLOUDINARY_CLOUD_NAME   por defecto dm4ijuzmi
 *     CLOUDINARY_API_KEY      número de ~15 dígitos
 *     CLOUDINARY_API_SECRET   ~27 caracteres
 *
 *   Se sacan de la consola de Cloudinary, en Settings → API Keys. Ojo: NO son
 *   el CLIENT_ID/CLIENT_SECRET con formato UUID que usan las integraciones
 *   OAuth; esos dan 401 contra la API de subida.
 *
 *   Ruta del archivo de credenciales con --env <ruta>. Por defecto busca .env
 *   en la raíz del repo.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const MANIFIESTO = 'src/data/fotografia.js'
const CARPETA_DESTINO = 'dak/estudio'
const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']

// ── Argumentos ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const idxEnv = args.indexOf('--env')
const rutaEnv = idxEnv !== -1 ? args[idxEnv + 1] : '.env'
const soloProbar = args.includes('--dry-run')
const carpeta = args.find((a) => !a.startsWith('--') && a !== rutaEnv)

if (!carpeta) {
  console.error(`
Falta la carpeta con las fotos.

  npm run fotos:subir -- "C:/ruta/a/las/fotos"
  npm run fotos:subir -- "C:/ruta" --env "C:/ruta/cloudy.env.txt"
  npm run fotos:subir -- "C:/ruta" --dry-run     (no sube nada, solo informa)
`)
  process.exit(1)
}

// ── Credenciales ────────────────────────────────────────────────────────────
function cargarEnv(ruta) {
  if (!existsSync(ruta)) return {}
  const fuera = {}
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m) fuera[m[1].toUpperCase()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return fuera
}

const env = { ...cargarEnv(rutaEnv), ...process.env }
const CLOUD = env.CLOUDINARY_CLOUD_NAME || 'dm4ijuzmi'
const KEY = env.CLOUDINARY_API_KEY
const SECRET = env.CLOUDINARY_API_SECRET

if (!KEY || !SECRET) {
  console.error(`
No encuentro CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.

Busqué en variables de entorno y en: ${path.resolve(rutaEnv)}

Se sacan de la consola de Cloudinary → Settings → API Keys. Son distintas del
CLIENT_ID/CLIENT_SECRET con formato UUID de las integraciones OAuth.

Déjalas en un archivo así y pásalo con --env:

  CLOUDINARY_CLOUD_NAME=${CLOUD}
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
`)
  process.exit(1)
}

// ── Manifiesto ──────────────────────────────────────────────────────────────
let manifiesto = readFileSync(MANIFIESTO, 'utf8')
const cuerpo = manifiesto.slice(
  manifiesto.indexOf('export const sesiones'),
  manifiesto.indexOf('/** Solo lo que existe'),
)
const pendientes = [...cuerpo.matchAll(/\{([^{}]*)\}/g)]
  .map((m) => ({
    id: (m[1].match(/id: '([^']*)'/) || [])[1],
    publicado: /publicado: true/.test(m[1]),
  }))
  .filter((e) => e.id && !e.publicado)
  .map((e) => e.id)

if (!pendientes.length) {
  console.log('No queda ninguna foto pendiente en el manifiesto.')
  process.exit(0)
}

// ── Emparejar archivos ──────────────────────────────────────────────────────
const archivos = readdirSync(carpeta).filter((f) =>
  EXTENSIONES.includes(path.extname(f).toLowerCase()),
)
const porId = new Map()
for (const f of archivos) {
  const base = path.basename(f, path.extname(f))
  if (pendientes.includes(base)) porId.set(base, path.join(carpeta, f))
}

const sinArchivo = pendientes.filter((id) => !porId.has(id))
const sobran = archivos.filter((f) => !pendientes.includes(path.basename(f, path.extname(f))))

console.log(`\nCarpeta:   ${path.resolve(carpeta)}`)
console.log(`Cloud:     ${CLOUD}  →  ${CARPETA_DESTINO}/`)
console.log(`Listas para subir: ${porId.size} de ${pendientes.length} pendientes\n`)

if (sinArchivo.length) {
  console.log(`Sin archivo todavía (${sinArchivo.length}):`)
  sinArchivo.forEach((id) => console.log(`   ${id}`))
  console.log('')
}
if (sobran.length) {
  console.log(`En la carpeta pero sin entrada en el manifiesto (${sobran.length}):`)
  sobran.slice(0, 10).forEach((f) => console.log(`   ${f}`))
  console.log('   → renómbralos con el id exacto, o no se subirán.\n')
}
if (!porId.size) process.exit(0)
if (soloProbar) { console.log('--dry-run: no se sube nada.'); process.exit(0) }

// ── Subida ──────────────────────────────────────────────────────────────────
/**
 * Cloudinary firma con SHA-1 sobre los parámetros ordenados alfabéticamente,
 * concatenados como k=v&k=v, con el api_secret pegado al final. El api_key y la
 * firma viajan como campos del formulario; el secreto NUNCA se envía.
 */
const firmar = (params) => {
  const base = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(base + SECRET).digest('hex')
}

let ok = 0
const fallos = []

for (const [id, ruta] of porId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = `${CARPETA_DESTINO}/${id}`
  const firma = firmar({ public_id: publicId, timestamp })

  const form = new FormData()
  form.append('file', new Blob([readFileSync(ruta)]), path.basename(ruta))
  form.append('public_id', publicId)
  form.append('timestamp', String(timestamp))
  form.append('api_key', KEY)
  form.append('signature', firma)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body: form,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`)

    const kb = Math.round(json.bytes / 1024)
    console.log(`  ✓ ${id.padEnd(22)} ${String(json.width)}x${json.height}  ${kb} KB`)

    // Marcar como publicada en el manifiesto
    manifiesto = manifiesto.replace(
      new RegExp(`(id: '${id}'[^}]*?)publicado: false`),
      '$1publicado: true',
    )
    ok++
  } catch (e) {
    console.error(`  ✗ ${id.padEnd(22)} ${e.message}`)
    fallos.push(id)
  }
}

if (ok) {
  writeFileSync(MANIFIESTO, manifiesto)
  console.log(`\n${ok} subidas. ${MANIFIESTO} actualizado (publicado: true).`)
  console.log('Revisa el diff, compila y despliega.')
}
if (fallos.length) {
  console.error(`\n${fallos.length} fallaron: ${fallos.join(', ')}`)
  process.exit(2)
}
