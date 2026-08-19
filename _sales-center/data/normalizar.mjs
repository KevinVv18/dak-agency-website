/**
 * muestra.csv (+ el inbound de admin.dakagency.net) → mock.json
 *
 * Un solo sitio donde vive el mapeo entre las columnas reales de DAK LEADS MASTER
 * y el contrato SalesProspect. Los componentes no conocen ni una sola de esas
 * columnas: si la hoja cambia una cabecera, se toca este archivo y nada mas.
 *
 * Dos cosas que este script NO hace, a proposito:
 *
 * 1. No inventa datos. Si una celda dice UNVERIFIED o NOT FOUND, sale `null`.
 *    Un `null` honesto es lo que permite a la UI decir «sin dato»; un string
 *    con la palabra UNVERIFIED dentro acaba pintado como si fuera un telefono.
 *
 * 2. No publica telefonos. muestra.csv esta en .gitignore porque lleva numeros
 *    historicos de terceros; mock.json se versiona con esos numeros redactados
 *    a `9XXXXX819`. La FORMA se conserva —la UI tiene que saber que ahi cabe un
 *    telefono de 9 digitos sin verificar— pero el numero no viaja al repo.
 *
 * Uso:  node normalizar.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/* ── CSV con comillas y saltos de linea embebidos ───────────────────────────
   Las celdas de Evidence/Sources traen parrafos multilinea, asi que un split
   por comas no vale. Es un parser de 12 lineas; no merece una dependencia. */
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

/** Celda vacia, ausente o con los centinelas de la hoja → null. */
const limpio = v => {
  const s = (v ?? '').trim()
  if (!s || s === 'NOT FOUND' || s === 'UNVERIFIED' || s === 'N/A') return null
  return s
}
const numero = v => { const n = Number(limpio(v)); return Number.isFinite(n) ? n : null }

/** Redacta un numero peruano de 9 digitos conservando su forma: 986495932 → 9XXXXX932 */
const redactar = tel => tel ? tel.replace(/\b(\d)(\d{5})(\d{3})\b/g, (_, a, __, c) => `${a}XXXXX${c}`) : null

/* ── outbound: DAK LEADS MASTER ─────────────────────────────────────────── */

const bruto = parsearCSV(readFileSync(path.join(AQUI, 'muestra.csv'), 'utf8'))
const cab = bruto[0]
const col = nombre => {
  const i = cab.indexOf(nombre)
  if (i === -1) throw new Error(`La hoja ya no tiene la columna "${nombre}". Revisa el mapeo.`)
  return i
}

const outbound = bruto.slice(1).filter(f => f.length > 1 && f[1]).map((f, i) => {
  const g = n => limpio(f[col(n)])
  const notas = g('Notes')

  // Los unicos telefonos del archivo viven en prosa dentro de Notes, puestos ahi
  // por el agente que investigo: «Telefono(s) historico(s) de la Camara (SIN
  // VERIFICAR): 900814819 / 922897332». La columna Phone dice UNVERIFIED.
  // Se extraen y se marcan; esconderlos en un parrafo es peor que enseñarlos con
  // su etiqueta de dudosos.
  const enNotas = notas ? [...notas.matchAll(/\b9\d{8}\b/g)].map(m => m[0]) : []
  const telefonoDirecto = g('Phone')
  const telefono = telefonoDirecto ?? enNotas[0] ?? null
  const verificado = Boolean(telefonoDirecto)

  const decisorCrudo = g('Decision Maker')
  const decisorEsHistorico = /UNVERIFIED|LEGACY/i.test(decisorCrudo ?? '')
  const decisor = decisorCrudo ? decisorCrudo.replace(/\s*\(UNVERIFIED LEGACY CONTACT\)/i, '') : null

  const redes = {}
  for (const [clave, columna] of [['instagram', 'Instagram'], ['facebook', 'Facebook'],
                                  ['tiktok', 'TikTok'], ['linkedin', 'LinkedIn']]) {
    const v = g(columna); if (v) redes[clave] = v
  }

  const faltantes = []
  if (!telefono) faltantes.push('telefono')
  if (!g('Email')) faltantes.push('email')
  if (!decisor) faltantes.push('decisor')
  if (!Object.keys(redes).length) faltantes.push('redes')

  const detalle = {
    potencial:       numero(f[col('Business Potential Score')]),
    senal:           numero(f[col('Buying Signal Score')]),
    oportunidad:     numero(f[col('Marketing Opportunity Score')]),
    encaje:          numero(f[col('DAK Fit Score')]),
    contactabilidad: numero(f[col('Contactability Score')])
  }

  return {
    id: `out-${String(i + 1).padStart(3, '0')}`,
    origen: 'outbound',
    empresa: g('Business Name'),
    persona: null,
    rubro: g('Industry'),
    // La hoja escribe la ciudad a veces en mayusculas (CHICLAYO) y a veces no.
    // Se normaliza aqui o la UI acaba con dos filtros para la misma ciudad.
    ciudad: g('City') ? g('City').charAt(0) + g('City').slice(1).toLowerCase() : null,
    fuente: /C.mara/i.test(notas ?? '') ? 'Camara' : 'Senal publica',

    score: numero(f[col('DAK Opportunity Score')]),
    scoreDetalle: detalle,
    scoreBot: null,
    // Lead Temperature y Status son la misma columna duplicada (identicas en 12/12).
    // Se lee una sola.
    temperatura: g('Lead Temperature'),

    contacto: {
      telefono: redactar(telefono),
      whatsapp: redactar(g('WhatsApp')),
      email: g('Email'),
      decisor,
      cargo: g('Decision Maker Position'),
      redes,
      verificado: verificado && !decisorEsHistorico,
      faltantes
    },

    oportunidad: g('Primary Opportunity'),
    senalCompra: g('Buying Signal'),
    porQueAhora: g('Why Now'),
    servicioSugerido: g('Recommended First Service'),
    anguloVenta: g('Sales Angle'),
    evidencia: redactar(g('Evidence / Sources')),
    notas: redactar(notas),

    web: g('Website'),
    mapsUrl: g('Google Maps URL'),

    // La hoja no tiene ninguna de estas columnas todavia. Ver seccion 4 de CONTRATO.md.
    estado: null,
    responsable: null,
    proximaAccion: null,
    fechaAccion: null,
    ultimaActividad: null,

    enlaceFuente: null,
    fechaDeteccion: g('Date Found')
  }
})

/* ── inbound: los leads vivos de admin.dakagency.net ─────────────────────────
   Transcritos del MySQL el 19-ago-2026 (ver INVENTARIO-INBOUND.md). Son tres.
   No es una muestra recortada: es toda la mitad inbound viva que existe, y por
   eso el panel tiene que verse bien con tres filas.
   Sin nombres ni telefonos: aqui solo van los campos no personales. */
const inbound = [
  {
    id: 'in-028', origen: 'inbound', empresa: null, persona: 'Contacto de WhatsApp',
    rubro: null, ciudad: null, fuente: 'WhatsApp',
    score: null, scoreDetalle: null, scoreBot: 0, temperatura: null,
    contacto: { telefono: null, whatsapp: '9XXXXX___', email: null, decisor: null,
                cargo: null, redes: {}, verificado: true, faltantes: ['email', 'decisor', 'redes'] },
    oportunidad: null, senalCompra: null,
    porQueAhora: 'Escribio hace dos dias y se fue a mitad de la conversacion, en ASK_INDUSTRY. Nadie le ha respondido: los follow-ups estan apagados desde julio.',
    servicioSugerido: null, anguloVenta: null, evidencia: null,
    notas: 'step=ASK_INDUSTRY · followups apagados', web: null, mapsUrl: null,
    estado: 'Nuevo', responsable: null, proximaAccion: null, fechaAccion: null,
    ultimaActividad: '2026-08-17', enlaceFuente: 'admin.dakagency.net/admin',
    fechaDeteccion: '2026-08-17'
  },
  {
    id: 'in-023', origen: 'inbound', empresa: null, persona: 'Visitante del demo inmobiliario',
    rubro: 'Inmobiliaria', ciudad: null, fuente: 'Chat',
    score: null, scoreDetalle: null, scoreBot: 0, temperatura: null,
    contacto: { telefono: null, whatsapp: null, email: null, decisor: null, cargo: null,
                redes: {}, verificado: false, faltantes: ['telefono', 'email', 'decisor', 'redes'] },
    oportunidad: null, senalCompra: null,
    porQueAhora: 'Entro por el demo inmobiliario y no paso del saludo.',
    servicioSugerido: null, anguloVenta: null, evidencia: null,
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', web: null, mapsUrl: null,
    estado: 'Nuevo', responsable: null, proximaAccion: null, fechaAccion: null,
    ultimaActividad: '2026-07-09', enlaceFuente: 'admin.dakagency.net/admin',
    fechaDeteccion: '2026-07-09'
  },
  {
    id: 'in-022', origen: 'inbound', empresa: null, persona: 'Visitante del demo inmobiliario',
    rubro: 'Inmobiliaria', ciudad: null, fuente: 'Chat',
    score: null, scoreDetalle: null, scoreBot: 0, temperatura: null,
    contacto: { telefono: null, whatsapp: null, email: null, decisor: null, cargo: null,
                redes: {}, verificado: false, faltantes: ['telefono', 'email', 'decisor', 'redes'] },
    oportunidad: null, senalCompra: null,
    porQueAhora: 'Entro por el demo inmobiliario y no paso del saludo.',
    servicioSugerido: null, anguloVenta: null, evidencia: null,
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', web: null, mapsUrl: null,
    estado: 'Nuevo', responsable: null, proximaAccion: null, fechaAccion: null,
    ultimaActividad: '2026-07-08', enlaceFuente: 'admin.dakagency.net/admin',
    fechaDeteccion: '2026-07-08'
  }
]

/* ── salida ─────────────────────────────────────────────────────────────── */

const prospectos = [...outbound, ...inbound]

const contactables = prospectos.filter(p => p.contacto.telefono || p.contacto.email).length
const meta = {
  generado: 'node normalizar.mjs',
  fuenteOutbound: 'DAK LEADS MASTER, exportacion del 2026-08-15',
  fuenteInbound: 'MySQL u567580447_dakagency_db, lectura del 2026-08-19',
  esMock: true,
  telefonosRedactados: true,
  totales: {
    prospectos: prospectos.length,
    outbound: outbound.length,
    inbound: inbound.length,
    conAlgunContacto: contactables,
    sinNingunContacto: prospectos.length - contactables,
    conResponsable: prospectos.filter(p => p.responsable).length,
    conProximaAccion: prospectos.filter(p => p.proximaAccion).length
  }
}

const salida = JSON.stringify({ meta, prospectos }, null, 2) + '\n'

// Red de seguridad. Redactar campo por campo depende de acordarse de todos los
// campos, y ya se me escapo uno: los telefonos de la Camara tambien vienen
// dentro de Evidence/Sources, en prosa. mock.json SI se versiona, asi que un
// olvido aqui publica el telefono de un tercero en el repo.
// Esto no redacta: aborta. Un fallo ruidoso es preferible a un escape silencioso.
const escapados = [...new Set(salida.match(/\b9\d{8}\b/g) ?? [])]
if (escapados.length) {
  console.error(`\nABORTADO: ${escapados.length} telefono(s) sin redactar llegaron a la salida.`)
  console.error(`Termina(n) en: ${escapados.map(t => '…' + t.slice(-3)).join(', ')}`)
  console.error('Añade el campo que los trae a la lista de redactar() en este archivo.')
  process.exit(1)
}

writeFileSync(path.join(AQUI, 'mock.json'), salida, 'utf8')

console.log(`mock.json escrito: ${prospectos.length} prospectos (${outbound.length} outbound, ${inbound.length} inbound)`)
console.log(`  con algun contacto usable: ${contactables}`)
console.log(`  con responsable:           ${meta.totales.conResponsable}`)
console.log(`  con proxima accion:        ${meta.totales.conProximaAccion}`)
