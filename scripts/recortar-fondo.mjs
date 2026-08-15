/**
 * Quita el fondo blanco de un logo, conservando el blanco interior.
 *
 * ─── POR QUE RELLENO DESDE EL BORDE Y NO RECORTE POR LUMINOSIDAD ──────────
 *
 * Lo rapido seria "todo lo que sea casi blanco, a transparente". Eso agujerea
 * el logo: las contras de una O, la banda blanca de un escudo, el texto en
 * negativo. Todo eso es blanco que SI forma parte de la marca.
 *
 * El fondo se distingue del blanco interior por una sola cosa: el fondo esta
 * conectado con el borde de la imagen. Asi que se inunda desde los cuatro
 * lados y solo se borra lo que el agua alcanza.
 *
 * ─── EL BORDE SUAVE ───────────────────────────────────────────────────────
 *
 * Un logo guardado sobre blanco tiene sus contornos mezclados con ese blanco.
 * Si solo se borra lo que es blanco puro, queda una orla clara de un pixel
 * alrededor de cada forma, que sobre fondo oscuro canta muchisimo. Por eso los
 * pixeles del limite reciben alfa parcial y se les DESHACE la mezcla con el
 * blanco, que es lo que devuelve el color original del trazo.
 *
 * ─── USO ──────────────────────────────────────────────────────────────────
 *
 *   node scripts/recortar-fondo.mjs <entrada> [salida]
 *
 * Sin salida, sobrescribe la entrada. Los originales estan en git.
 */
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'fs'
import { basename, extname } from 'path'

const entrada = process.argv[2]
const salida = process.argv[3] || entrada
if (!entrada) {
  console.error('uso: node scripts/recortar-fondo.mjs <entrada> [salida]')
  process.exit(1)
}

/* Por encima de esto un pixel se considera fondo y el agua lo atraviesa. */
const PISO_FONDO = 236
/* Entre este valor y el anterior, el pixel es contorno mezclado: alfa parcial. */
const PISO_BORDE = 176

const recortar = (b64, tipo, pisoFondo, pisoBorde) => {
  const img = new Image()
  img.src = `data:image/${tipo};base64,${b64}`
  return img.decode().then(() => {
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const g = c.getContext('2d', { willReadFrequently: true })
    g.drawImage(img, 0, 0)
    const imagen = g.getImageData(0, 0, c.width, c.height)
    const d = imagen.data
    const W = c.width
    const H = c.height
    const luz = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]

    // ── Inundacion desde los cuatro bordes ──
    const fondo = new Uint8Array(W * H)
    const cola = new Int32Array(W * H)
    let cabeza = 0
    let final = 0
    const empujar = (x, y) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return
      const p = y * W + x
      if (fondo[p]) return
      const i = p * 4
      if (d[i + 3] < 8) { fondo[p] = 1; return }   // ya transparente
      if (luz(i) < pisoFondo) return                // aqui empieza el logo
      fondo[p] = 1
      cola[final++] = p
    }
    for (let x = 0; x < W; x++) { empujar(x, 0); empujar(x, H - 1) }
    for (let y = 0; y < H; y++) { empujar(0, y); empujar(W - 1, y) }
    while (cabeza < final) {
      const p = cola[cabeza++]
      const x = p % W
      const y = (p / W) | 0
      empujar(x + 1, y); empujar(x - 1, y); empujar(x, y + 1); empujar(x, y - 1)
    }

    // ── Alfa parcial en el limite, deshaciendo la mezcla con el blanco ──
    const alfa = new Float32Array(W * H).fill(1)
    for (let p = 0; p < W * H; p++) if (fondo[p]) alfa[p] = 0

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = y * W + x
        if (fondo[p]) continue
        // Solo interesan los que tocan el fondo: son el contorno mezclado.
        const tocaFondo =
          (x > 0 && fondo[p - 1]) || (x < W - 1 && fondo[p + 1]) ||
          (y > 0 && fondo[p - W]) || (y < H - 1 && fondo[p + W])
        if (!tocaFondo) continue
        const i = p * 4
        const l = luz(i)
        if (l <= pisoBorde) continue
        alfa[p] = Math.min(1, Math.max(0, (pisoFondo - l) / (pisoFondo - pisoBorde)))
      }
    }

    let borrados = 0
    let suavizados = 0
    for (let p = 0; p < W * H; p++) {
      const i = p * 4
      const a = alfa[p]
      if (a >= 0.999) continue
      if (a <= 0.001) { d[i + 3] = 0; borrados++; continue }
      // observado = a*color + (1-a)*255  →  color = (observado - 255*(1-a)) / a
      for (let k = 0; k < 3; k++) {
        d[i + k] = Math.min(255, Math.max(0, (d[i + k] - 255 * (1 - a)) / a))
      }
      d[i + 3] = Math.round(a * 255)
      suavizados++
    }

    g.putImageData(imagen, 0, 0)
    return {
      datos: c.toDataURL('image/webp', 0.94),
      W, H, borrados, suavizados,
      pct: Math.round((borrados / (W * H)) * 100),
    }
  })
}

const tipo = extname(entrada).slice(1).toLowerCase().replace('jpg', 'jpeg')
const b64 = readFileSync(entrada).toString('base64')

const navegador = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const pagina = await navegador.newPage()
await pagina.goto('about:blank')
const r = await pagina.evaluate(recortar, b64, tipo, PISO_FONDO, PISO_BORDE)
await navegador.close()

const bin = Buffer.from(r.datos.split(',')[1], 'base64')
writeFileSync(salida, bin)

console.log(`${basename(entrada)}  ${r.W}x${r.H}`)
console.log(`  fondo borrado:  ${r.borrados} px (${r.pct}%)`)
console.log(`  borde suavizado: ${r.suavizados} px`)
console.log(`  → ${salida}  (${(bin.length / 1024).toFixed(1)} KB)`)
