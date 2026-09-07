/**
 * Genera las variantes pequeñas de cada pieza gráfica del repo.
 *
 *   npm run taller:variantes
 *
 * POR QUÉ
 * Los archivos son de 1080px y en ningún sitio se pintan a ese tamaño. En la
 * portada el Taller los muestra a 220-420px; en /gallery, la hoja de contactos
 * los muestra a 85-140px. Medido: hasta 12x más grandes de lo que hace falta.
 *
 * QUÉ HACE
 * Escribe dos variantes junto al original, sin tocarlo:
 *
 *   <nombre>-xs.webp   360px — la celda de la hoja de contactos de /gallery.
 *                      85px en móvil o 140px en escritorio piden 170-280 en
 *                      una pantalla de densidad 2, así que 360 sobra y no se
 *                      ve borroso ni con zoom del navegador.
 *   <nombre>-sm.webp   700px — el Taller de la portada y la vista de lupa.
 *
 * Por encima de eso el `srcset` deja que el navegador coja el original, que
 * es lo que quiere el visor a pantalla completa.
 *
 * QUÉ RECORRE
 * `src/assets/clients/**`, `src/assets/dak` y `src/assets/banners`. Antes solo
 * miraba `clients` y además excluía `berseline`, así que cuatro piezas —las
 * tres de Berse Line y la portada de veterinaria— bajaban el original de
 * 1080px para pintarse a 134px en un teléfono. La exclusión existía porque el
 * bloque hero de la portada pinta Berse Line a 1120px; eso lo resuelve el
 * propio `srcset`, que a ese ancho elige el original igual que hoy. Generar
 * los archivos no obliga a nadie a usarlos.
 *
 * No borra ni sustituye nada. Volver atrás es borrar los `-xs` y los `-sm`.
 *
 * Usa Puppeteer y no sharp porque sharp no está instalado en este repo y no
 * merece una dependencia nueva para una tarea que se corre de uvas a peras.
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, lstatSync } from 'node:fs'
import puppeteer from 'puppeteer'

const CALIDAD = 0.82
const VARIANTES = [
  { sufijo: '-xs', ancho: 360 },
  { sufijo: '-sm', ancho: 700 },
]
const SUFIJOS = VARIANTES.map((v) => v.sufijo)

/* Las carpetas con piezas gráficas, más las seis fotos del Estudio que viven en
   el repo en vez de en Cloudinary. Esas seis pesaban 980 KB para pintarse entre
   171 y 342px: eran, con diferencia, lo más caro de /gallery y de la portada.
   El resto del Estudio no está aquí — lo sirve `fotoFuentes` desde Cloudinary
   con sus propios anchos. */
const RAICES = ['src/assets/clients', 'src/assets/dak', 'src/assets/banners', 'src/assets/gallery']

/** Devuelve todos los .webp originales (sin variantes) bajo una raíz. */
function originales(raiz) {
  if (!existsSync(raiz)) return []
  const salida = []
  for (const entrada of readdirSync(raiz)) {
    const ruta = `${raiz}/${entrada}`
    if (lstatSync(ruta).isDirectory()) {
      salida.push(...originales(ruta))
      continue
    }
    if (!/\.webp$/i.test(entrada)) continue
    if (SUFIJOS.some((s) => entrada.toLowerCase().endsWith(`${s}.webp`))) continue
    salida.push(ruta)
  }
  return salida
}

const archivos = RAICES.flatMap(originales)

const navegador = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const pagina = await navegador.newPage()

let hechas = 0, saltadas = 0, antesTotal = 0, despuesTotal = 0

for (const origen of archivos) {
  const antes = statSync(origen).size
  const b64 = readFileSync(origen).toString('base64')
  let menor = null

  for (const { sufijo, ancho } of VARIANTES) {
    const destino = origen.replace(/\.webp$/i, `${sufijo}.webp`)

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
    }, b64, ancho, CALIDAD)

    if (salida.omitir) {
      console.log(`  ·  ${origen} ya mide ${salida.w}px, se deja sin ${sufijo}`)
      saltadas++
      continue
    }

    writeFileSync(destino, Buffer.from(salida.datos, 'base64'))
    const despues = statSync(destino).size
    if (menor === null) menor = despues
    hechas++
    console.log(`  ✓  ${destino}`)
    console.log(`       ${salida.ow}px → ${salida.w}px    ${(antes / 1024).toFixed(0)} KB → ${(despues / 1024).toFixed(0)} KB`)
  }

  if (menor !== null) {
    antesTotal += antes
    despuesTotal += menor
  }
}

await navegador.close()
console.log(`\n${hechas} variantes generadas, ${saltadas} omitidas, sobre ${archivos.length} originales`)
if (hechas) {
  console.log(`Si el navegador elige la más pequeña en todos los casos: ${(antesTotal / 1024).toFixed(0)} KB → ${(despuesTotal / 1024).toFixed(0)} KB (${(100 - despuesTotal / antesTotal * 100).toFixed(0)}% menos)`)
}
