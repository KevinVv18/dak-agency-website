/**
 * Capturas de verificación, con el viewport de verdad.
 *
 *   node scripts/capturar.mjs <carpeta-destino> [base-url]
 *
 * Por qué puppeteer y no `chrome --headless --screenshot --window-size`:
 *
 * Esa vía MIENTE. Pedido `--window-size=375,812`, Chrome renderizó con
 * `innerWidth = 500` y luego recortó el PNG a 375, así que la captura mostraba
 * la interfaz cortada por la derecha —titulares partidos, el botón primario a
 * la mitad— cuando en el navegador real a 375 no desbordaba nada.
 *
 * Una revisión de diseño juzga sobre capturas. Una captura que no reproduce el
 * viewport pedido convierte la revisión en ruido y hace perder una ronda
 * entera persiguiendo un defecto que no existe.
 *
 * Además mide el desbordamiento correctamente: `body{overflow:hidden}` RECORTA,
 * así que `documentElement.scrollWidth` no delata a un hijo que se sale. Hay
 * que mirar el borde derecho real de cada elemento.
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DESTINO = process.argv[2]
const BASE = process.argv[3] || 'http://localhost:4174'
if (!DESTINO) {
  console.error('uso: node scripts/capturar.mjs <carpeta-destino> [base-url]')
  process.exit(2)
}
mkdirSync(DESTINO, { recursive: true })

const PANTALLAS = [
  { nombre: 'movil-entrada', w: 375, h: 812, url: '/?modo=jornada&rol=audiovisual' },
  { nombre: 'movil-chico', w: 375, h: 667, url: '/?modo=jornada&rol=audiovisual' },
  { nombre: 'movil-secuencia', w: 375, h: 812, url: '/?modo=reconciliar&rol=audiovisual' },
  // El estado marcado: el sello estampado sobre el fotograma a tamaño de
  // fotograma. Sin esta captura, «el estado es una marca y no un relleno» es
  // una afirmación que nadie puede comprobar mirando.
  {
    nombre: 'movil-secuencia-marcada',
    w: 375,
    h: 812,
    url: '/?modo=reconciliar&rol=audiovisual',
    marcar: 'Terminé mi parte',
  },
  {
    nombre: 'movil-secuencia-continuo',
    w: 375,
    h: 812,
    url: '/?modo=reconciliar&rol=audiovisual',
    marcar: 'Continúo',
  },
  { nombre: 'escritorio-admin', w: 1440, h: 900, url: '/?rol=admin' },
  { nombre: 'escritorio-admin-chico', w: 1024, h: 720, url: '/?rol=admin' },
]

const navegador = await puppeteer.launch({
  headless: 'new',
  args: ['--disable-gpu', '--no-sandbox'],
})

const informe = []

for (const p of PANTALLAS) {
  const pagina = await navegador.newPage()
  await pagina.setViewport({ width: p.w, height: p.h, deviceScaleFactor: 2 })
  await pagina.goto(BASE + p.url, { waitUntil: 'networkidle0' })
  // Que las animaciones de entrada terminen antes de juzgar la composición.
  await new Promise((r) => setTimeout(r, 1600))

  if (p.marcar) {
    await pagina.evaluate((texto) => {
      const b = [...document.querySelectorAll('.marca')].find((x) =>
        x.textContent.includes(texto)
      )
      if (b) b.click()
    }, p.marcar)
    // «Terminé» avanza solo a los 420 ms; se captura antes, con el sello puesto.
    await new Promise((r) => setTimeout(r, 300))
  }

  const medida = await pagina.evaluate(() => {
    const W = innerWidth
    const fuera = []
    document.querySelectorAll('body *').forEach((e) => {
      const r = e.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      if (r.right > W + 0.5 || r.left < -0.5) {
        fuera.push({
          clase: String(e.className).slice(0, 30) || e.tagName,
          der: +r.right.toFixed(1),
        })
      }
    })
    return { innerWidth: W, innerHeight: innerHeight, desbordan: fuera.length, culpables: fuera.slice(0, 6) }
  })

  // `encoding: 'base64'` y `path` a la vez no conviven: puppeteer devuelve la
  // cadena y no escribe el archivo. Se pide una sola vez y se escribe aquí.
  const png = await pagina.screenshot({ encoding: 'base64' })
  writeFileSync(join(DESTINO, `${p.nombre}.png`), Buffer.from(png, 'base64'))

  /*
   * Cobertura del naranja, contada en píxeles sobre la captura.
   *
   * La dirección exige que el naranja sea CAMPO —cerca de un tercio de la
   * pantalla— y no un filete. La primera construcción declaraba eso en un
   * comentario del CSS mientras entregaba un 11 %. Una regla que no se mide no
   * se cumple: aquí se cuenta.
   */
  const cobertura = await pagina.evaluate(async (b64) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const cx = c.getContext('2d', { willReadFrequently: true })
    cx.drawImage(img, 0, 0)
    const d = cx.getImageData(0, 0, c.width, c.height).data
    let naranja = 0
    for (let i = 0; i < d.length; i += 4) {
      // El grano mueve el tono, así que se cuenta un entorno del naranja de
      // marca, no el valor exacto: rojo dominante, verde medio-bajo, azul bajo.
      if (d[i] > 150 && d[i + 1] > 30 && d[i + 1] < 130 && d[i + 2] < 90) naranja++
    }
    return +((naranja / (c.width * c.height)) * 100).toFixed(1)
  }, png)

  informe.push({ pantalla: p.nombre, pedido: `${p.w}x${p.h}`, ...medida, naranjaPct: cobertura })
  await pagina.close()
}

await navegador.close()

console.log(JSON.stringify(informe, null, 1))
const rotos = informe.filter((i) => i.desbordan > 0 || i.innerWidth !== +i.pedido.split('x')[0])
if (rotos.length) {
  console.error(`\n${rotos.length} pantalla(s) con desbordamiento o viewport incorrecto.`)
  process.exit(1)
}
console.log('\nSin desbordamiento; viewport correcto en todas.')
