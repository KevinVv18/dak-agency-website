/**
 * Las cuatro pestañas de DAK LEADS MASTER (+ el inbound de admin.dakagency.net)
 * → mock.json
 *
 * Un solo sitio donde vive el mapeo entre las columnas reales de la hoja y el
 * contrato de CONTRATO.md. Los componentes no conocen ni una cabecera: si la
 * hoja renombra una columna, se toca este archivo y nada mas.
 *
 * Las cuatro pestañas son las cuatro etapas de un embudo, y se unen por nombre
 * de empresa:
 *
 *   CAMARA REACTIVATION LOG  →  Leads  →  DAK OUTREACH QUEUE  →  DAK DAILY OUTREACH
 *        109 minadas            12          8 con mensaje          3 aprobados
 *
 * Tres cosas que este script NO hace, a proposito:
 *
 * 1. No inventa datos. UNVERIFIED / NOT FOUND salen como `null`, para que la UI
 *    pueda decir «sin dato». Un string con la palabra UNVERIFIED dentro acaba
 *    pintado como si fuera un telefono.
 *
 * 2. No publica datos de terceros. Los muestra-*.csv estan en .gitignore;
 *    mock.json se versiona con los telefonos redactados a 9XXXXX819. La FORMA se
 *    conserva —la UI tiene que saber que ahi cabe un movil peruano— pero el
 *    numero no viaja al repo.
 *
 * 3. No decide el emparejamiento a ojo. Une por nombre normalizado y AVISA de lo
 *    que no casa, en vez de descartarlo en silencio.
 *
 * Uso:  node normalizar.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

// Parche de idioma: los agentes escriben la señal de compra en ingles y el panel
// es en español. Ver el _nota de traducciones.json — esto no escala, el arreglo
// de verdad es que el agente escriba en español.
const TRADUCCIONES = JSON.parse(readFileSync(path.join(AQUI, "traducciones.json"), "utf8"))
const enEspanol = (campo, empresa, original) => TRADUCCIONES[campo]?.[empresa] ?? original

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

/** Abre una pestaña y devuelve un lector con acceso por nombre de columna. */
function hoja (archivo) {
  const ruta = path.join(AQUI, archivo)
  if (!existsSync(ruta)) throw new Error(`Falta ${archivo}. Exporta las cuatro pestañas de DAK LEADS MASTER.`)
  const filas = parsearCSV(readFileSync(ruta, 'utf8'))
  const cab = filas[0]
  const datos = filas.slice(1).filter(f => f.length > 1 && f.some(c => c && c.trim()))
  const g = (fila, columna) => {
    const i = cab.indexOf(columna)
    if (i === -1) throw new Error(`${archivo} ya no tiene la columna "${columna}". Revisa el mapeo.`)
    return limpio(fila[i])
  }
  return { cab, datos, g }
}

const limpio = v => {
  const s = (v ?? '').trim()
  if (!s || s === 'NOT FOUND' || s === 'UNVERIFIED' || s === 'N/A') return null
  return s
}
const numero = v => { const n = Number(v); return Number.isFinite(n) && v ? n : null }

/** Redacta moviles peruanos conservando la forma: 986495932 → 9XXXXX932 */
const redactar = t => t == null ? null
  : t.replace(/\b(9)(\d{5})(\d{3})\b/g, (_, a, __, c) => `${a}XXXXX${c}`)
     .replace(/\b(9)(\d{2})\s(\d{3})\s(\d{3})\b/g, (_, a, __, ___, d) => `${a}XX XXX ${d}`)
     .replace(/(wa\.me\/51)9\d{8}/g, '$19XXXXXXXX')

/** Clave de union entre pestañas: el nombre, sin ruido. */
const clave = n => (n ?? '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^A-Z0-9]/g, '')

/* ── La clasificacion comercial nueva ────────────────────────────────────────
   DAK ya no busca «buenos leads» sin mas: distingue entre empresas donde puede
   ser LA agencia y empresas donde solo puede entrar por una pieza concreta. Son
   dos conversaciones distintas y dos mensajes distintos.

   ⚠️ La hoja TODAVIA NO tiene estas columnas, asi que esto se DERIVA — y por eso
   viaja marcado como derivado y la interfaz lo dice. Pero la regla no sale de la
   nada: se apoya en una señal que los agentes YA escriben. Cuando el Outreach
   Strategist redacta la objecion «Ya tenemos agencia o equipo que nos maneja las
   redes», esta diciendo que detecto una estructura de marketing existente. Ese
   es justo el riesgo que hay que medir, y lo escribio el sistema, no el panel.

   En cuanto la hoja traiga Opportunity Type, Agency Ownership Potential,
   Existing Agency Risk y Recommended Entry Angle, esta derivacion se borra y se
   leen tal cual. */

const clasificar = (prospecto, mensaje) => {
  const texto = [
    ...(mensaje?.objeciones ?? []).map((o) => o.objecion),
    prospecto.anguloVenta ?? '',
  ].join(' ').toLowerCase()

  const mencionaEstructura = /agencia|equipo que|nos maneja|quien nos maneja/.test(texto)
  const mencionaCorporativo = /corporativ/.test(texto)

  // «Sin confirmar» y no «Bajo» cuando no hay señal: que no aparezca una
  // objecion sobre su agencia no demuestra que no la tengan. Ausencia de prueba
  // no es prueba de ausencia, y poner «Bajo» seria inventarse una certeza.
  const riesgo = mencionaCorporativo ? 'Alto'
    : mencionaEstructura ? 'Medio'
    : 'Sin confirmar'

  const peso = { HIGH: 3, MEDIUM: 2, SMALL: 1 }[prospecto.potencialNegocio] ?? 1

  // 1 a 5: cuanto puede DAK liderar el crecimiento de esta empresa.
  const liderazgo = riesgo === 'Alto' ? Math.min(2, peso)
    : riesgo === 'Medio' ? (peso >= 3 ? 3 : 2)
    : Math.min(5, 2 + peso)

  const tipo = liderazgo >= 4 ? 'Agencia completa' : 'Soporte especializado'

  const anguloEntrada = tipo === 'Agencia completa'
    ? 'Sistema completo de captación: contenido, Meta Ads, landing y derivación a WhatsApp.'
    : mencionaCorporativo
      ? 'Ejecución local que complementa al equipo corporativo: contenido de sede, campañas y derivación de consultas.'
      : 'Pieza concreta que no reemplaza a su equipo: landing, ruta a WhatsApp y seguimiento de campaña.'

  return {
    tipoOportunidad: tipo,
    potencialLiderazgo: liderazgo,
    riesgoAgenciaExistente: riesgo,
    anguloEntrada,
    // Para que la interfaz pueda decir la verdad: esto lo dedujo el panel.
    clasificacionDerivada: true,
  }
}

/* ── 1. Leads: la investigacion ─────────────────────────────────────────── */

const LEADS = hoja('muestra-leads.csv')
const porClave = new Map()

const outbound = LEADS.datos.map((f, i) => {
  const g = c => LEADS.g(f, c)
  const notas = g('Notes')
  const ciudad = g('City')
  const p = {
    id: `out-${String(i + 1).padStart(3, '0')}`,
    origen: 'outbound',
    etapa: 'investigado',
    empresa: g('Business Name'),
    persona: null,
    rubro: g('Industry'),
    // La hoja escribe la ciudad a veces en mayusculas (CHICLAYO) y a veces no.
    // Se normaliza aqui o la UI acaba con dos filtros para la misma ciudad.
    ciudad: ciudad ? ciudad[0] + ciudad.slice(1).toLowerCase() : null,
    fuente: /C.mara/i.test(notas ?? '') ? 'Camara' : 'Senal publica',

    score: numero(g('DAK Opportunity Score')),
    scoreDetalle: {
      potencial:       numero(g('Business Potential Score')),
      senal:           numero(g('Buying Signal Score')),
      oportunidad:     numero(g('Marketing Opportunity Score')),
      encaje:          numero(g('DAK Fit Score')),
      contactabilidad: numero(g('Contactability Score'))
    },
    readiness: null, readinessBand: null, scoreBot: null,
    // Lead Temperature y Status son la misma columna duplicada (identicas en 12/12).
    temperatura: g('Lead Temperature'),
    potencialNegocio: null,

    contacto: { handle: null, motivoCanal: null, canal: null, mejorMomento: null, verificado: false },

    oportunidad: g('Primary Opportunity'),
    senalCompra: enEspanol('senalCompra', g('Business Name'), g('Buying Signal')),
    porQueAhora: enEspanol('porQueAhora', g('Business Name'), g('Why Now')),
    servicioSugerido: g('Recommended First Service'),
    anguloVenta: g('Sales Angle'),
    evidencia: redactar(g('Evidence / Sources')),
    web: g('Website'),
    mapsUrl: g('Google Maps URL'),

    responsable: null, proximaAccion: null, fechaSeguimiento: null,
    enviadoEn: null, estadoEnvio: null, estadoRespuesta: null, resumenRespuesta: null,

    enlaceFuente: null,
    tipoOportunidad: null,
    potencialLiderazgo: null,
    riesgoAgenciaExistente: null,
    anguloEntrada: null,
    clasificacionDerivada: false,

    fechaDeteccion: g('Date Found'),
    dedupKey: null,
    notas: redactar(notas)
  }
  porClave.set(clave(p.empresa), p)
  return p
})

/* ── 2. OUTREACH QUEUE: contacto verificado + mensaje escrito ───────────── */

const QUEUE = hoja('muestra-dak-outreach-queue.csv')
const huerfanas = []
const mensajes = []

for (const f of QUEUE.datos) {
  const g = c => QUEUE.g(f, c)
  const nombre = g('Business Name')
  const p = porClave.get(clave(nombre))
  if (!p) { huerfanas.push(['QUEUE', nombre]); continue }

  p.readiness = numero(g('Outreach Readiness Score'))
  p.readinessBand = g('Readiness Band')
  p.potencialNegocio = g('Deal Potential')
  p.contacto = {
    handle: redactar(g('Contact Handle')),
    motivoCanal: g('Channel Reason'),
    canal: g('Recommended Channel'),
    mejorMomento: g('Best Timing'),
    verificado: true
  }
  const revision = g('Human Review')
  p.etapa = revision === 'APPROVED' ? 'por-enviar' : 'por-aprobar'

  const seguimientos = []
  for (const [orden, msg, ang, plazo] of [
    [1, 'Follow-up 1 Message (2-4 business days)', 'Follow-up 1 Angle (internal)', '2-4 dias habiles'],
    [2, 'Follow-up 2 Message (5-8 business days)', 'Follow-up 2 Angle (internal)', '5-8 dias habiles']
  ]) {
    const m = g(msg); if (m) seguimientos.push({ orden, mensaje: redactar(m), angulo: g(ang), plazo })
  }

  const objeciones = []
  for (const [o, r] of [['Objection 1', 'Response 1'], ['Objection 2', 'Response 2']]) {
    const ob = g(o); if (ob) objeciones.push({ objecion: ob, respuesta: g(r) })
  }

  mensajes.push({
    prospectoId: p.id,
    estadoRevision: revision,
    etapa: 'OPENER',
    canal: g('Recommended Channel'),
    enlaceWhatsApp: null,                     // lo trae DAILY, ya armado
    texto: redactar(g('Spanish WhatsApp/DM Opener')),
    asuntoEmail: g('Email Subject'),
    cuerpoEmail: redactar(g('Spanish Email Body')),
    ganchoValor: g('Value Hook'),
    primeraOferta: g('Suggested First Offer'),
    formaRelacion: g('Engagement Shape'),
    ideaVenta: g('Sales Idea'),
    objeciones,
    seguimientos
  })
}

/* ── 3. DAILY OUTREACH: la capa operativa ───────────────────────────────── */

const DAILY = hoja('muestra-dak-daily-outreach.csv')

for (const f of DAILY.datos) {
  const g = c => DAILY.g(f, c)
  const nombre = g('Business Name')
  const p = porClave.get(clave(nombre))
  if (!p) { huerfanas.push(['DAILY', nombre]); continue }

  p.responsable = g('Owner')
  p.proximaAccion = g('Next Action')
  p.fechaSeguimiento = g('Next Follow-Up Due')
  p.enviadoEn = g('Sent At')
  p.estadoEnvio = g('Send Status')
  p.estadoRespuesta = g('Reply Status')
  p.resumenRespuesta = g('Reply Summary')
  p.dedupKey = redactar(g('Dedup Key'))
  if (p.estadoEnvio === 'SENT') p.etapa = p.estadoRespuesta === 'REPLIED' ? 'respondido' : 'enviado'

  const m = mensajes.find(x => x.prospectoId === p.id)
  if (m) m.enlaceWhatsApp = redactar(g('WhatsApp Link'))
}

/* ── 3.5 Clasificacion comercial ──────────────────────────────────────────
   Se hace AQUI y no antes porque necesita el mensaje: la señal que distingue
   «podemos ser su agencia» de «solo podemos entrar por una pieza» esta en las
   objeciones que redacto el Outreach Strategist, y esas llegan con la QUEUE. */

for (const p of outbound) {
  Object.assign(p, clasificar(p, mensajes.find((m) => m.prospectoId === p.id)))
}

/* ── 4. CAMARA REACTIVATION LOG: salud de la fuente, no una lista ────────── */

const CAMARA = hoja('muestra-camara-reactivation-log.csv')
const disp = {}
let validados = 0
for (const f of CAMARA.datos) {
  const d = CAMARA.g(f, 'Disposition') ?? '(sin disposicion)'
  disp[d] = (disp[d] || 0) + 1
  if (CAMARA.g(f, 'Validated Phone') || CAMARA.g(f, 'Validated WhatsApp')) validados++
}
const aceptadas = disp['APPENDED TO LEADS'] ?? 0

const fuentes = [{
  fuente: 'Camara de Comercio de Lambayeque',
  procesadas: CAMARA.datos.length,
  aceptadas,
  rendimiento: Number((aceptadas / CAMARA.datos.length).toFixed(4)),
  contactosValidados: validados,
  desglose: disp,
  notas: 'La reactivacion no valido ni un solo telefono. Los contactos verificados que hoy existen ' +
         'salieron de la investigacion web de la QUEUE, no del padron.'
}]

/* ── 5. inbound: los leads vivos de admin.dakagency.net ──────────────────────
   Transcritos del MySQL el 19-ago-2026 (ver INVENTARIO-INBOUND.md). Son tres, y
   no es una muestra recortada: es toda la mitad inbound viva que existe. Por eso
   el panel tiene que verse bien con tres filas.
   Sin nombres ni telefonos: aqui solo van campos no personales. */
const base = {
  origen: 'inbound', empresa: null, rubro: null, ciudad: null,
  score: null, scoreDetalle: null, readiness: null, readinessBand: null,
  temperatura: null, potencialNegocio: null,
  oportunidad: null, senalCompra: null, servicioSugerido: null, anguloVenta: null,
  evidencia: null, web: null, mapsUrl: null,
  responsable: null, proximaAccion: null, fechaSeguimiento: null,
  enviadoEn: null, estadoEnvio: null, estadoRespuesta: null, resumenRespuesta: null,
  enlaceFuente: 'admin.dakagency.net/admin', dedupKey: null
}
const inbound = [
  { ...base, id: 'in-028', etapa: 'investigado', persona: 'Contacto de WhatsApp',
    fuente: 'WhatsApp', scoreBot: 0,
    contacto: { handle: '+51 9XX XXX XXX', motivoCanal: 'Escribio el por WhatsApp',
                canal: 'WHATSAPP', mejorMomento: null, verificado: true },
    porQueAhora: 'Escribio hace dos dias y se fue a mitad de la conversacion, en ASK_INDUSTRY. Nadie le ha respondido: los follow-ups estan apagados desde julio.',
    notas: 'step=ASK_INDUSTRY · followups apagados', fechaDeteccion: '2026-08-17' },
  { ...base, id: 'in-023', etapa: 'investigado', persona: 'Visitante del demo inmobiliario',
    fuente: 'Chat', scoreBot: 0, rubro: 'Inmobiliaria',
    contacto: { handle: null, motivoCanal: null, canal: null, mejorMomento: null, verificado: false },
    porQueAhora: 'Entro por el demo inmobiliario y no paso del saludo.',
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', fechaDeteccion: '2026-07-09' },
  { ...base, id: 'in-022', etapa: 'investigado', persona: 'Visitante del demo inmobiliario',
    fuente: 'Chat', scoreBot: 0, rubro: 'Inmobiliaria',
    contacto: { handle: null, motivoCanal: null, canal: null, mejorMomento: null, verificado: false },
    porQueAhora: 'Entro por el demo inmobiliario y no paso del saludo.',
    notas: 'source=demo-inmobiliaria-chat · step=WELCOME', fechaDeteccion: '2026-07-08' }
]

/* ── salida ─────────────────────────────────────────────────────────────── */

const prospectos = [...outbound, ...inbound]
const cuenta = e => prospectos.filter(p => p.etapa === e).length

const meta = {
  generado: 'node normalizar.mjs',
  fuentes: {
    outbound: 'DAK LEADS MASTER, 4 pestañas, exportacion del 2026-08-19',
    inbound: 'MySQL u567580447_dakagency_db, lectura del 2026-08-19'
  },
  esMock: true,
  telefonosRedactados: true,
  embudo: {
    investigados: cuenta('investigado'),
    porAprobar: cuenta('por-aprobar'),
    porEnviar: cuenta('por-enviar'),
    enviados: cuenta('enviado'),
    respondidos: cuenta('respondido')
  },
  totales: { prospectos: prospectos.length, outbound: outbound.length, inbound: inbound.length,
             mensajes: mensajes.length }
}

const salida = JSON.stringify({ meta, prospectos, mensajes, fuentes }, null, 2) + '\n'

// Red de seguridad. Redactar campo por campo depende de acordarse de todos los
// campos, y ya se escapo uno: los telefonos de la Camara tambien venian dentro
// de Evidence/Sources, en prosa. mock.json SI se versiona, asi que un olvido
// aqui publica el telefono de un tercero en el repo.
// Esto no redacta: aborta. Un fallo ruidoso es preferible a un escape silencioso.
const escapados = [...new Set(salida.match(/\b9\d{8}\b|\b9\d{2}\s\d{3}\s\d{3}\b/g) ?? [])]
if (escapados.length) {
  console.error(`\nABORTADO: ${escapados.length} telefono(s) sin redactar llegaron a la salida.`)
  console.error(`Termina(n) en: ${escapados.map(t => '…' + t.slice(-3)).join(', ')}`)
  console.error('Añade el campo que los trae a la lista de redactar() en este archivo.')
  process.exit(1)
}

writeFileSync(path.join(AQUI, 'mock.json'), salida, 'utf8')

console.log(`mock.json escrito`)
console.log(`  prospectos: ${prospectos.length} (${outbound.length} outbound, ${inbound.length} inbound)`)
console.log(`  embudo:     ${meta.embudo.investigados} investigados → ${meta.embudo.porAprobar} por aprobar → ${meta.embudo.porEnviar} por enviar → ${meta.embudo.enviados} enviados`)
console.log(`  mensajes:   ${mensajes.length} redactados`)
console.log(`  fuentes:    Camara ${fuentes[0].aceptadas}/${fuentes[0].procesadas} (${(fuentes[0].rendimiento * 100).toFixed(1)} %), ${fuentes[0].contactosValidados} contactos validados`)
if (huerfanas.length) {
  console.log(`\n  AVISO: ${huerfanas.length} fila(s) no casaron con ningun prospecto de Leads:`)
  for (const [h, n] of huerfanas) console.log(`    ${h}: "${n}"`)
}
