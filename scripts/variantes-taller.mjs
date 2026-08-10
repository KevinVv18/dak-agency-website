/**
 * Genera la variante pequeña de cada pieza del Taller.
 *
 *   npm run taller:variantes
 *
 * POR QUÉ
 * Los archivos son de 1080px y el Taller los pinta a 220px en la maquetación
 * de tira, 256px en la desordenada y 420px en la mínima. Medido en la portada
 * en vivo: hasta 4.9x más grandes de lo que hace falta, y son ~1 MB de los
 * 4.3 MB de la página. La única que se pinta a tamaño real es la del bloque
 * hero (Berse Line), que por eso se queda como está.
 *
 * QUÉ HACE
 * Escribe un `<nombre>-sm.webp` de 700px de ancho junto al original. 700
 * cubre el peor caso: la galería en /gallery los muestra a ~370px, que en una
 * pantalla de densidad 2 pide 740 — y por debajo de eso el navegador ya elige
 * el original vía srcset, así que nunca se ve borroso.
 *
 * No borra ni sustituye nada: el original sigue ahí y el `srcset` deja que el
 * navegador escoja. Volver atrás es borrar los `-sm`.
 *
 * Usa Puppeteer y no sharp porque sharp no está instalado en este repo y no
 * merece una dependencia nueva para una tarea que se corre de uvas a peras.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import puppeteer from 'puppeteer'

const ANCHO = 700
const CALIDAD = 0.82

// El bloque hero pinta a 1120px: sus piezas no ganan nada encogiéndose.
const SIN_VARIANTE = 'berseline'

const BASE = 'src/assets/clients'
const carpetas = readdirSync(BASE).filter((c) => c !== SIN_VARIANTE)

const navegador = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const pagina = await navegador.newPage()

let hechas = 0, saltadas = 0, antesTotal = 0, despuesTotal = 0

for (const carpeta of carpetas) {
  const dir = `${BASE}/${carpeta}`
  for (const archivo of readdirSync(dir)) {
    if (!/\.webp$/i.test(archivo) || /-sm\.webp$/i.test(archivo)) continue

    const origen = `${dir}/${archivo}`
    const destino = origen.replace(/\.webp$/i, '-sm.webp')
    const antes = statSync(origen).size

    const b64 = readFileSync(origen).toString('base64')
    const salida = await pagina.evaluate(async (b64, ancho, calidad) => {
      const img = new Image()
      img.src = 'data:image/webp;base64,' + b64
      await img.decode()
      if (img.width <= ancho) return { omitir: true, w: img.width }
      const escala = ancho / img.width
      const lienzo = document.createElement('canvas')
      lienzo.width = ancho
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height)
      return { datos: lienzo.toDataURL('image/webp', calidad).split(',')[1], w: lienzo.width, h: lienzo.height, ow: img.width }
    }, b64, ANCHO, CALIDAD)

    if (salida.omitir) {
      console.log(`  ·  ${archivo} ya mide ${salida.w}px, se deja`)
      saltadas++
      continue
    }

    writeFileSync(destino, Buffer.from(salida.datos, 'base64'))
    const despues = statSync(destino).size
    antesTotal += antes
    despuesTotal += despues
    hechas++
    console.log(`  ✓  ${carpeta}/${archivo}`)
    console.log(`       ${salida.ow}px → ${salida.w}px    ${(antes / 1024).toFixed(0)} KB → ${(despues / 1024).toFixed(0)} KB`)
  }
}

await navegador.close()
console.log(`\n${hechas} variantes generadas, ${saltadas} omitidas`)
if (hechas) {
  console.log(`Si el navegador elige la pequeña en todos los casos: ${(antesTotal / 1024).toFixed(0)} KB → ${(despuesTotal / 1024).toFixed(0)} KB (${(100 - despuesTotal / antesTotal * 100).toFixed(0)}% menos)`)
}
