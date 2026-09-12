/**
 * EL MAPA DE LA SEDE, HORNEADO
 *
 * Trae de OpenStreetMap las calles reales alrededor de la oficina y las deja
 * escritas como trazos SVG en src/data/mapa-sede.js.
 *
 * ─── POR QUÉ ASÍ ──────────────────────────────────────────────────────────
 *
 * El pie enseñaba la posición como texto pelado: «6.7744° S · 79.8747° O».
 * Antes de eso hubo un iframe de Google Maps, y se retiró a propósito: 31
 * peticiones, ~520KB y la interfaz de Google dentro de la página de DAK. No hay
 * que volver ahí.
 *
 * La tercera vía es esta: el mapa es de verdad —geometría real, comprobable en
 * osm.org— pero lo dibujamos NOSOTROS, con los filetes del sitio, y viaja como
 * un puñado de trazos dentro del bundle. Cero peticiones en tiempo de
 * ejecución, cero cromo ajeno, y sigue siendo un mapa y no una decoración con
 * forma de mapa.
 *
 * Un mapa esquemático inventado habría sido más fácil y habría estado mal: sería
 * afirmar una geografía que no existe, en la página de una agencia que presume
 * de no inventar datos.
 *
 * ─── LICENCIA ─────────────────────────────────────────────────────────────
 *
 * Los datos son de OpenStreetMap, bajo ODbL. La atribución es obligatoria y va
 * en el pie, junto al mapa. No es opcional ni es cortesía.
 *
 * Uso: node scripts/mapa-sede.mjs
 */
import { writeFile } from 'node:fs/promises'

/* La sede. DEBE coincidir con SEDE en src/components/Footer.jsx y con el geo
   del JSON-LD de index.html. */
const SEDE = { lat: -6.7744, lon: -79.8747 }

/* Cuántos metros de contexto. 450 entra la Panamericana Norte y la Av. Juan
   Tomis Stack, que son las dos referencias que alguien de Chiclayo reconoce;
   con 250 el recorte se queda en calles sin nombre y no sitúa nada. */
const RADIO = 450

/* Qué se dibuja y con qué peso. Las aceras y los caminos de servicio se
   descartan: son 47 de 141 trazos y a 130px de lado solo aportan ruido. */
const VIAS = new Set(['trunk', 'primary', 'secondary', 'trunk_link', 'primary_link'])
const CALLES = new Set(['tertiary', 'residential', 'unclassified', 'living_street'])

const ESPEJOS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const consulta = `[out:json][timeout:25];way(around:${RADIO},${SEDE.lat},${SEDE.lon})["highway"];out geom;`

const traer = async () => {
  let ultimo
  for (const espejo of ESPEJOS) {
    try {
      const r = await fetch(espejo, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(consulta),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Overpass devuelve 406 sin esto.
          'User-Agent': 'dakagency.net mapa-sede (una vez, en build; marketing@dakagency.net)',
        },
      })
      if (!r.ok) { ultimo = `HTTP ${r.status}`; continue }
      return await r.json()
    } catch (e) { ultimo = e.message }
  }
  throw new Error(`ningún espejo respondió (${ultimo})`)
}

/* Proyección local. A esta escala —menos de un kilómetro— la Tierra es plana
   sin que se note, así que basta con escalar los grados a metros y corregir la
   longitud por el coseno de la latitud. Nada de Mercator. */
const METRO_LAT = 110540
const metroLon = (lat) => 111320 * Math.cos((lat * Math.PI) / 180)

const main = async () => {
  process.stdout.write(`  consultando OpenStreetMap (${RADIO} m)… `)
  const datos = await traer()
  console.log(`${datos.elements.length} vías`)

  const mLon = metroLon(SEDE.lat)
  /* El lienzo va de 0 a 100 y el centro, la oficina, cae en 50,50. Un lado
     completo son 2·RADIO metros. */
  const aLienzo = ({ lat, lon }) => [
    50 + ((lon - SEDE.lon) * mLon * 50) / RADIO,
    50 - ((lat - SEDE.lat) * METRO_LAT * 50) / RADIO,
  ]

  const grupos = { vias: [], calles: [] }
  let puntos = 0

  for (const via of datos.elements) {
    const clase = via.tags?.highway
    const destino = VIAS.has(clase) ? 'vias' : CALLES.has(clase) ? 'calles' : null
    if (!destino || !via.geometry) continue

    const d = via.geometry
      .map(aLienzo)
      /* Un decimal es 0,1 de 100, o sea 9 metros sobre el terreno y menos de
         un cuarto de píxel en pantalla. Guardar más solo engorda el bundle. */
      .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join('')
    if (d.length < 12) continue
    grupos[destino].push(d)
    puntos += via.geometry.length
  }

  /* Los nombres de las dos o tres vías grandes, para poder decir en el propio
     dibujo qué se está mirando. Se quedan solo las que de verdad cruzan el
     recorte. */
  const nombres = [...new Set(
    datos.elements
      .filter((v) => VIAS.has(v.tags?.highway) && v.tags?.name)
      .map((v) => v.tags.name),
  )]

  const salida = `/* GENERADO POR scripts/mapa-sede.mjs — no editar a mano.
 *
 * Calles reales alrededor de la sede, traídas de OpenStreetMap y proyectadas a
 * un lienzo de 100×100 con la oficina en el centro (50,50). Un lado son
 * ${2 * RADIO} metros.
 *
 * Datos © colaboradores de OpenStreetMap, bajo ODbL. La atribución va en el pie
 * y no se quita.
 *
 * Para regenerarlo si la sede se muda: actualiza SEDE en el script y ejecútalo.
 */
export const RADIO_METROS = ${RADIO}

/* Las vías grandes: más brillo, porque son las que sitúan. */
export const VIAS = ${JSON.stringify(grupos.vias, null, 2)}

/* El resto de la trama urbana: el mismo filete, más apagado. */
export const CALLES = ${JSON.stringify(grupos.calles, null, 2)}

/* Lo que cruza el recorte, por si hace falta nombrarlo. */
export const NOMBRES = ${JSON.stringify(nombres, null, 2)}
`

  const destino = 'src/data/mapa-sede.js'
  await writeFile(destino, salida, 'utf8')
  const kb = (Buffer.byteLength(salida) / 1024).toFixed(1)
  console.log(`  ${grupos.vias.length} vías grandes · ${grupos.calles.length} calles · ${puntos} puntos`)
  console.log(`  ${destino} — ${kb} KB`)
  console.log(`  nombres: ${nombres.join(' · ')}`)
}

main().catch((e) => { console.error('  FALLO:', e.message); process.exit(1) })
