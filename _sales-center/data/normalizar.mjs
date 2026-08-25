/**
 * Los CSV exportados de DAK LEADS MASTER → mock.json
 *
 * Este script ya NO normaliza: solo lee los CSV y llama a `construir()`, que
 * vive en src/lib/construir.js y lo comparte con la lectura en vivo. Si cada uno
 * tuviera su propia normalizacion, el panel enseñaria una cosa con datos de
 * ejemplo y otra con datos reales, y averiguar cual miente seria una tarde.
 *
 * Para que sirve el mock, ahora que el panel lee la hoja en vivo:
 *   · es la RED DE SEGURIDAD — si el puente falla, el panel enseña esto en vez
 *     de una pantalla vacia, diciendo que son datos de ejemplo
 *   · es lo que se ve en desarrollo sin tener que tocar la hoja de verdad
 *
 * Por eso aqui SI se redactan los telefonos: mock.json se versiona.
 *
 * Uso:  node normalizar.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { construir } from '../src/lib/construir.js'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

const TRADUCCIONES = JSON.parse(readFileSync(path.join(AQUI, 'traducciones.json'), 'utf8'))
const GLOSARIO = JSON.parse(readFileSync(path.join(AQUI, 'glosario.json'), 'utf8')).terminos

/* ── CSV con comillas y saltos de linea embebidos ───────────────────────────
   Los cuerpos de email de la QUEUE son parrafos multilinea dentro de una celda,
   asi que un split por comas no vale. Parser de 12 lineas; no merece dependencia. */
function parsearCSV (t) {
  const filas = []; let fila = [], celda = '', comillas = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (comillas) {
      if (ch === '"') { if (t[i + 1] === '"') { celda += '"'; i++ } else comillas = false }
      else celda += ch
    } else if (ch === '"') comillas = true
    else if (ch === ',') { fila.push(celda); celda = '' }
    else if (ch === '\n') { fila.push(celda); celda = ''; filas.push(fila); fila = [] }
    else if (ch !== '\r') celda += ch
  }
  if (celda || fila.length) { fila.push(celda); filas.push(fila) }
  return filas
}

function hoja (archivo) {
  const ruta = path.join(AQUI, archivo)
  if (!existsSync(ruta)) throw new Error(`Falta ${archivo}. Exporta las cuatro pestañas de DAK LEADS MASTER.`)
  const filas = parsearCSV(readFileSync(ruta, 'utf8'))
  return { cab: filas[0], datos: filas.slice(1).filter(f => f.length > 1 && f.some(c => c && c.trim())) }
}

/* ── inbound: los leads vivos de admin.dakagency.net ──────────────────────────
   Transcritos del MySQL el 19-ago-2026 (ver INVENTARIO-INBOUND.md). Son tres, y
   no es una muestra recortada: es toda la mitad inbound viva que existe. Por eso
   el panel tiene que verse bien con tres filas. */
const base = {
  origen: 'inbound', empresa: null, rubro: null, ciudad: null,
  score: null, scoreDetalle: null, readiness: null, readinessBand: null,
  temperatura: null, potencialNegocio: null,
  oportunidad: null, senalCompra: null, servicioSugerido: null, anguloVenta: null,
  evidencia: null, web: null, mapsUrl: null,
  responsable: null, proximaAccion: null, fechaSeguimiento: null,
  enviadoEn: null, estadoEnvio: null, estadoRespuesta: null, resumenRespuesta: null,
  tipoOportunidad: null, potencialLiderazgo: null,
  riesgoAgenciaExistente: null, anguloEntrada: null, clasificacionDerivada: false,
  enlaceFuente: 'https://admin.dakagency.net/admin', dedupKey: null,
}
const inbound = [
  { ...base, id: 'in-028', etapa: 'investigado', persona: 'Contacto de WhatsApp',
    fuente: 'WhatsApp', scoreBot: 0,
    contacto: { handle: '+51 9XX XXX XXX', motivoCanal: 'Escribió él por WhatsApp', canal: 'WHATSAPP', mejorMomento: null, verificado: true, redes: {} },
    porQueAhora: 'Escribió hace días y se fue a mitad de la conversación, en ASK_INDUSTRY. Nadie le ha respondido: los follow-ups están apagados desde julio.',
    notas: 'step=ASK_INDUSTRY · followups apagados', fechaDeteccion: '2026-08-17' },
  { ...base, id: 'in-023', etapa: 'investigado', persona: 'Visitante del demo inmobiliario',
    fuente: 'Chat', scoreBot: 0, rubro: 'Inmobiliaria',
    contacto: { handle: null, motivoCanal: null, canal: null, mejorMomento: null, verificado: false, redes: {} },
    porQueAhora: 'Entró por el demo inmobiliario y no pasó del saludo.',
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', fechaDeteccion: '2026-07-09' },
  { ...base, id: 'in-022', etapa: 'investigado', persona: 'Visitante del demo inmobiliario',
    fuente: 'Chat', scoreBot: 0, rubro: 'Inmobiliaria',
    contacto: { handle: null, motivoCanal: null, canal: null, mejorMomento: null, verificado: false, redes: {} },
    porQueAhora: 'Entró por el demo inmobiliario y no pasó del saludo.',
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', fechaDeteccion: '2026-07-08' },
]

/* ── salida ─────────────────────────────────────────────────────────────── */

const datos = construir({
  leads: hoja('muestra-leads.csv'),
  queue: hoja('muestra-dak-outreach-queue.csv'),
  daily: hoja('muestra-dak-daily-outreach.csv'),
  camara: hoja('muestra-camara-reactivation-log.csv'),
  inbound,
  traducciones: TRADUCCIONES,
  glosario: GLOSARIO,
  redactar: true,
  fuentes: {
    outbound: 'DAK LEADS MASTER, 4 pestañas, exportación del 2026-08-19',
    inbound: 'MySQL u567580447_dakagency_db, lectura del 2026-08-19',
  },
})

const salida = JSON.stringify({ ...datos, huerfanas: undefined }, null, 2) + '\n'

// Red de seguridad. Redactar campo por campo depende de acordarse de todos los
// campos, y ya se escapo uno por Evidence/Sources. mock.json SI se versiona, asi
// que un olvido aqui publica el telefono de un tercero en el repo.
// Esto no redacta: aborta. Un fallo ruidoso es preferible a un escape silencioso.
const escapados = [...new Set(salida.match(/\b9\d{8}\b|\b9\d{2}\s\d{3}\s\d{3}\b/g) ?? [])]
if (escapados.length) {
  console.error(`\nABORTADO: ${escapados.length} telefono(s) sin redactar llegaron a la salida.`)
  console.error(`Termina(n) en: ${escapados.map(t => '…' + t.slice(-3)).join(', ')}`)
  process.exit(1)
}

writeFileSync(path.join(AQUI, 'mock.json'), salida, 'utf8')

const { embudo, totales } = datos.meta
console.log('mock.json escrito')
console.log(`  prospectos: ${totales.prospectos} (${totales.outbound} outbound, ${totales.inbound} inbound)`)
console.log(`  embudo:     ${embudo.investigados} investigados → ${embudo.porAprobar} por aprobar → ${embudo.porEnviar} por enviar → ${embudo.enviados} enviados`)
console.log(`  mensajes:   ${totales.mensajes} redactados`)
if (datos.fuentes[0]) {
  const f = datos.fuentes[0]
  console.log(`  fuentes:    Cámara ${f.aceptadas}/${f.procesadas} (${(f.rendimiento * 100).toFixed(1)} %), ${f.contactosValidados} contactos validados`)
}
if (datos.huerfanas.length) {
  console.log(`\n  AVISO: ${datos.huerfanas.length} fila(s) no casaron con ningún prospecto de Leads:`)
  for (const [h, n] of datos.huerfanas) console.log(`    ${h}: "${n}"`)
}
