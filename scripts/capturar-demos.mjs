/**
 * CAPTURAS DE LOS DEMOS EN VIVO
 *
 *   npm run demos:capturas
 *
 * La sección Demos enseña cuatro productos reales que el visitante puede abrir
 * y usar: una tienda, un blog, un asistente y una web inmobiliaria. Durante
 * mucho tiempo lo que se veía de cada uno era un recorte —un bolso, un
 * periódico, un robot 3D, un colgador de puerta— flotando sobre el fondo.
 * Ninguno era el producto: la metáfora ocupaba el sitio de la prueba, y la
 * prueba está a un clic.
 *
 * Esto genera la prueba. Y es un script, y no cuatro archivos subidos a mano,
 * por la única pega real de enseñar capturas: envejecen. Cuando un sitio cambie
 * se vuelve a lanzar esto y ya está.
 *
 * ─── SIN DEPENDENCIAS NUEVAS ──────────────────────────────────────────────
 *
 * No hace falta `sharp` para escribir WebP: Chrome sabe codificarlo desde un
 * <canvas> con toDataURL('image/webp', calidad), y Puppeteer ya está instalado
 * para las auditorías. Así que el mismo navegador que hace la captura la
 * recorta, la escala y la codifica.
 *
 * ─── CADA SITIO SABE DÓNDE MIRAR ──────────────────────────────────────────
 *
 * Una captura de la portada no siempre es la mejor captura. La de American
 * Vault es casi toda negra —bonita en pantalla, muda como miniatura— y lo que
 * dice algo es la rejilla del catálogo, más abajo en la misma página. El
 * simulador arranca con el panel vacío. De ahí `preparar`: cada demo lleva su
 * receta de dónde colocarse antes de disparar.
 */

import puppeteer from 'puppeteer'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'src', 'assets', 'demos')

/* La ventana desde la que se mira. 1440×900 es un portátil normal: encuadra
   como lo vería un cliente, no como una pantalla de escaparate. */
const VENTANA = { width: 1440, height: 900 }

/* Proporción del recorte y anchos de salida. Los dos anchos alimentan el
   `srcSet` de Projects.jsx, que ya sabe consumir un gemelo pequeño. */
const PROPORCION = 16 / 10
const ANCHOS = [1000, 500]
const CALIDAD = 0.82

/* Techo por archivo. Si una captura se pasa, el script lo dice en vez de
   colar medio mega en la portada sin que nadie se entere. */
const TOPE_KB = 120

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

const DEMOS = [
  {
    id: 'tienda',
    url: 'https://american-vault.com/',
    /* La portada es negra casi entera. Lo que se reconoce como tienda es la
       rejilla del catálogo, que vive más abajo en la misma página. */
    async preparar(p) {
      await p.evaluate(() => {
        const rejilla = document.querySelector('#catalogGrid')
        if (rejilla) rejilla.scrollIntoView({ block: 'start' })
      })
      await esperar(2500)
    },
  },
  {
    id: 'blog',
    url: 'https://dakagency.net/blog/',
    // La portada del blog ya es lo que hay que enseñar: sale bien tal cual.
  },
  {
    id: 'asistente',
    url: 'https://admin.dakagency.net/simulator/',
    /* El estado inicial es un panel vacío que dice «configura el número y
       presiona Iniciar»: eso no demuestra nada. Se arranca una conversación de
       verdad. Y si el bot no contesta —está vivo, puede estar caído— se captura
       lo que haya en vez de reventar el script: una captura del panel es peor
       que una con conversación, pero mucho mejor que ninguna. */
    async preparar(p) {
      try {
        await p.evaluate(() => {
          const botones = [...document.querySelectorAll('button')]
          const iniciar = botones.find((b) => /iniciar/i.test(b.textContent))
          if (iniciar) iniciar.click()
        })
        await esperar(2000)
        /* El campo del chat, por su marcador de posición y no por ser el primer
           input de la página: el primero es el TELÉFONO de la barra lateral, y
           escribir ahí dejaba la pregunta metida en el formulario de
           configuración, a la vista en la captura. */
        const campo = await p.evaluateHandle(() => {
          const entradas = [...document.querySelectorAll('input, textarea')]
          return entradas.find((e) => /mensaje/i.test(e.placeholder || '')) || null
        })
        const elemento = campo.asElement()
        if (elemento) {
          await elemento.type('¿Cuánto cuesta una página web?', { delay: 25 })
          await p.keyboard.press('Enter')
        }
        // Margen para que responda; si no lo hace, se sigue igualmente.
        await esperar(9000)
      } catch {
        console.log('    (el asistente no respondió; se captura el panel)')
      }
    },
  },
  {
    id: 'inmobiliaria',
    url: 'https://inmobiliaria.dakagency.net/',
    /* El selector de las dos direcciones. No es una página interior, pero es
       exactamente lo que hay ahí y es una imagen fuerte. */
  },
]

/**
 * Recorta, escala y codifica a WebP DENTRO del navegador.
 *
 * Se recorta desde arriba y no por el centro a propósito: la parte alta de una
 * página es la que la identifica —cabecera, marca, primeras piezas—, y un
 * recorte centrado se come justo eso.
 */
const aWebp = async (pagina, base64, ancho) =>
  pagina.evaluate(
    async (b64, ancho, proporcion, calidad) => {
      const img = new Image()
      await new Promise((r) => {
        img.onload = r
        img.src = 'data:image/png;base64,' + b64
      })
      const recorteAlto = Math.min(img.height, Math.round(img.width / proporcion))
      const lienzo = document.createElement('canvas')
      lienzo.width = ancho
      lienzo.height = Math.round(ancho / proporcion)
      const g = lienzo.getContext('2d')
      g.imageSmoothingQuality = 'high'
      g.drawImage(img, 0, 0, img.width, recorteAlto, 0, 0, lienzo.width, lienzo.height)
      return lienzo.toDataURL('image/webp', calidad).split(',')[1]
    },
    base64,
    ancho,
    PROPORCION,
    CALIDAD,
  )

const main = async () => {
  await mkdir(DESTINO, { recursive: true })
  const navegador = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  // Página auxiliar, en blanco, donde vive el canvas que codifica.
  const cocina = await navegador.newPage()
  await cocina.goto('about:blank')

  let total = 0
  let problemas = 0

  for (const demo of DEMOS) {
    const p = await navegador.newPage()
    await p.setViewport({ ...VENTANA, deviceScaleFactor: 2 })
    process.stdout.write(`  ${demo.id.padEnd(14)} `)
    try {
      const r = await p.goto(demo.url, { waitUntil: 'networkidle2', timeout: 60000 })
      if (!r || r.status() >= 400) throw new Error(`HTTP ${r ? r.status() : '?'}`)
      await esperar(3500)
      if (demo.preparar) await demo.preparar(p)

      const png = await p.screenshot({ encoding: 'base64' })
      const pesos = []
      for (const ancho of ANCHOS) {
        const webp = await aWebp(cocina, png, ancho)
        /* Prefijo `vivo-` en las cuatro. No es cosmético: los recortes viejos
           viven en esta misma carpeta y uno de ellos se llama
           inmobiliaria.webp — sin prefijo, la primera pasada del script lo
           machacó. Con el prefijo la colisión es imposible por construcción y
           además se lee de un vistazo cuáles son capturas en vivo. */
        const nombre = `vivo-${demo.id}${ancho === ANCHOS[0] ? '' : '-sm'}.webp`
        const archivo = join(DESTINO, nombre)
        await writeFile(archivo, Buffer.from(webp, 'base64'))
        const kb = Math.round((await stat(archivo)).size / 1024)
        pesos.push(`${ancho}w ${kb}KB`)
        total += kb
        if (ancho === ANCHOS[0] && kb > TOPE_KB) {
          problemas++
          pesos.push(`⚠ pasa de ${TOPE_KB}KB`)
        }
      }
      console.log(`OK  ${pesos.join('  ·  ')}`)
    } catch (e) {
      problemas++
      console.log(`FALLO: ${e.message.slice(0, 70)}`)
    }
    await p.close()
  }

  await navegador.close()
  console.log(`\n  total ${total} KB en ${DEMOS.length * ANCHOS.length} archivos`)
  if (problemas) {
    console.log(`  ${problemas} con problemas — revisa antes de desplegar`)
    process.exitCode = 1
  }
}

main()
