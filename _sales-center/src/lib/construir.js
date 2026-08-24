/**
 * De las pestañas de DAK LEADS MASTER al contrato del panel.
 *
 * Este archivo lo usan DOS sitios y esa es toda su razon de ser:
 *
 *   · data/normalizar.mjs  — lee los CSV exportados y escribe mock.json
 *   · src/lib/sales.js     — lee la hoja EN VIVO por el puente de Apps Script
 *
 * Si cada uno tuviera su propia normalizacion, en dos semanas el panel enseñaria
 * una cosa con datos de ejemplo y otra distinta con datos reales, y encontrar
 * cual de las dos miente seria una tarde perdida. Una sola funcion, dos entradas.
 *
 * Recibe las pestañas ya parseadas como { cab, datos }: filas de texto plano,
 * sin saber si vinieron de un CSV o de una llamada de red.
 */

/* ── Utilidades de lectura ───────────────────────────────────────────────── */

/** Celda vacia o con los centinelas de la hoja → null, para que la UI diga «sin dato». */
export const limpio = (v) => {
  const s = (v ?? '').toString().trim()
  if (!s || s === 'NOT FOUND' || s === 'UNVERIFIED' || s === 'N/A') return null
  return s
}

const numero = (v) => { const n = Number(v); return Number.isFinite(n) && v ? n : null }

/**
 * Redacta moviles peruanos conservando la forma: 986495932 → 9XXXXX932.
 *
 * SOLO se usa para el mock, porque mock.json se versiona y no puede llevar
 * telefonos de terceros. Con datos en vivo NO se redacta: el panel existe
 * justamente para poder llamar a esa gente.
 */
export const redactarTelefono = (t) => t == null ? null
  : t.replace(/\b(9)(\d{5})(\d{3})\b/g, (_, a, __, c) => `${a}XXXXX${c}`)
     .replace(/\b(9)(\d{2})\s(\d{3})\s(\d{3})\b/g, (_, a, __, ___, d) => `${a}XX XXX ${d}`)
     .replace(/(wa\.me\/51)9\d{8}/g, '$19XXXXXXXX')

/** Clave de union entre pestañas: el nombre de la empresa, sin ruido. */
const clave = (n) => (n ?? '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^A-Z0-9]/g, '')

const lector = (pestana, nombrePestana) => (fila, columna) => {
  const i = pestana.cab.indexOf(columna)
  // Una columna que desaparece de la hoja no debe tumbar el panel entero: se
  // devuelve null y la UI dira «sin dato». Con CSV si conviene que reviente
  // (ver normalizar.mjs), pero en vivo un rename no puede dejar a nadie sin panel.
  if (i === -1) return null
  return limpio(fila[i])
}

/* ── La clasificacion comercial ──────────────────────────────────────────────
   DAK distingue entre empresas donde puede ser LA agencia y empresas donde solo
   entra por una pieza concreta.

   Si la hoja ya trae las columnas (Opportunity Type, Agency Ownership
   Potential...), se leen tal cual. Si no, se DEDUCEN y viajan marcadas como
   deducidas: la interfaz lo dice en pantalla.

   La deduccion se apoya en una señal que los agentes YA escriben: cuando el
   Outreach Strategist redacta la objecion «Ya tenemos agencia o equipo que nos
   maneja las redes», esta diciendo que detecto una estructura de marketing. */

const TIPOS = {
  'FULL AGENCY PROSPECT': 'Agencia completa',
  'SPECIALIZED SUPPORT PROSPECT': 'Soporte especializado',
}
const RIESGOS = { LOW: 'Bajo', MEDIUM: 'Medio', HIGH: 'Alto', UNKNOWN: 'Sin confirmar' }

export const clasificar = (prospecto, mensaje, deLaHoja = {}) => {
  // Camino corto: la hoja ya lo dice. Se lee y no se deduce nada.
  if (deLaHoja.tipo) {
    return {
      tipoOportunidad: TIPOS[deLaHoja.tipo] ?? deLaHoja.tipo,
      potencialLiderazgo: numero(deLaHoja.potencial),
      riesgoAgenciaExistente: RIESGOS[deLaHoja.riesgo] ?? deLaHoja.riesgo ?? 'Sin confirmar',
      anguloEntrada: deLaHoja.angulo ?? null,
      clasificacionDerivada: false,
    }
  }

  const texto = [
    ...(mensaje?.objeciones ?? []).map((o) => o.objecion),
    prospecto.anguloVenta ?? '',
  ].join(' ').toLowerCase()

  const mencionaEstructura = /agencia|equipo que|nos maneja|quien nos maneja/.test(texto)
  const mencionaCorporativo = /corporativ/.test(texto)

  // «Sin confirmar» y no «Bajo» cuando no hay señal: que no aparezca una
  // objecion sobre su agencia no demuestra que no la tengan.
  const riesgo = mencionaCorporativo ? 'Alto' : mencionaEstructura ? 'Medio' : 'Sin confirmar'
  const peso = { HIGH: 3, MEDIUM: 2, SMALL: 1 }[prospecto.potencialNegocio] ?? 1

  const liderazgo = riesgo === 'Alto' ? Math.min(2, peso)
    : riesgo === 'Medio' ? (peso >= 3 ? 3 : 2)
    : Math.min(5, 2 + peso)

  const tipo = liderazgo >= 4 ? 'Agencia completa' : 'Soporte especializado'

  return {
    tipoOportunidad: tipo,
    potencialLiderazgo: liderazgo,
    riesgoAgenciaExistente: riesgo,
    anguloEntrada: tipo === 'Agencia completa'
      ? 'Sistema completo de captación: contenido, Meta Ads, landing y derivación a WhatsApp.'
      : mencionaCorporativo
        ? 'Ejecución local que complementa al equipo corporativo: contenido de sede, campañas y derivación de consultas.'
        : 'Pieza concreta que no reemplaza a su equipo: landing, ruta a WhatsApp y seguimiento de campaña.',
    clasificacionDerivada: true,
  }
}

/* ── La construccion ─────────────────────────────────────────────────────── */

export function construir({ leads, queue, daily, camara, inbound = [], traducciones = {}, glosario = {}, redactar = false, fuentes: origenes = {} }) {
  const tapar = redactar ? redactarTelefono : (v) => v

  /**
   * El idioma, en dos capas y con expectativas distintas.
   *
   * 1. GLOSARIO — sustitucion de terminos. Escala: se aplica a cualquier fila,
   *    presente o futura, porque los agentes escriben con vocabulario cerrado
   *    (rubros, nombres de servicio, prefijos de evidencia). Las claves largas
   *    van primero para que «Real Estate Development» no lo pise «Real Estate».
   *
   * 2. TRADUCCIONES — frases enteras, empresa por empresa. NO escala y no
   *    pretende escalar: es un parche para las filas que ya existian.
   *
   * Lo que ninguna de las dos arregla es la prosa libre de cada lote nuevo. Eso
   * solo se arregla haciendo que el agente escriba en español, y esta dicho en
   * CONTRATO.md §8.
   */
  const terminos = Object.entries(glosario).sort((a, b) => b[0].length - a[0].length)
  const conGlosario = (t) => {
    if (!t) return t
    let salida = t
    for (const [en, es] of terminos) salida = salida.split(en).join(es)
    return salida
  }
  const enEspanol = (campo, empresa, original) =>
    conGlosario(traducciones[campo]?.[empresa] ?? original)

  /* 1. Leads: la investigacion */
  const gL = lector(leads, 'Leads')
  const porClave = new Map()

  const outbound = leads.datos.map((f, i) => {
    const g = (c) => gL(f, c)
    const notas = g('Notes')
    const ciudad = g('City')
    const empresa = g('Business Name')

    const redes = {}
    for (const [c, k] of [['Instagram', 'instagram'], ['Facebook', 'facebook'], ['TikTok', 'tiktok'], ['LinkedIn', 'linkedin']]) {
      const v = g(c); if (v) redes[k] = v
    }

    const p = {
      id: `out-${String(i + 1).padStart(3, '0')}`,
      origen: 'outbound',
      etapa: 'investigado',
      // Lo escribe el panel, no los agentes: es la unica marca que un humano
      // puede dejar sobre una fila que todavia no ha salido de Leads.
      pedido: g('Panel Request') === 'REQUESTED',
      pedidoEn: g('Panel Request At'),
      empresa,
      persona: null,
      rubro: conGlosario(g('Industry')),
      // La hoja escribe la ciudad a veces en mayusculas (CHICLAYO) y a veces no.
      // Se normaliza aqui o la UI acaba con dos filtros para la misma ciudad.
      ciudad: ciudad ? ciudad[0] + ciudad.slice(1).toLowerCase() : null,
      fuente: /C.mara/i.test(notas ?? '') ? 'Camara' : 'Senal publica',

      score: numero(g('DAK Opportunity Score')),
      scoreDetalle: {
        potencial: numero(g('Business Potential Score')),
        senal: numero(g('Buying Signal Score')),
        oportunidad: numero(g('Marketing Opportunity Score')),
        encaje: numero(g('DAK Fit Score')),
        contactabilidad: numero(g('Contactability Score')),
      },
      readiness: null, readinessBand: null, scoreBot: null,
      // Lead Temperature y Status son la misma columna duplicada.
      // Valores de CONTROL: se guardan crudos y se traducen al pintar. Si se
      // traducen aqui, las comparaciones del codigo dejan de encontrarlos.
      temperatura: g('Lead Temperature'),
      potencialNegocio: null,

      contacto: {
        handle: null, motivoCanal: null, canal: null, mejorMomento: null,
        verificado: false,
        telefono: tapar(g('Phone')),
        whatsapp: tapar(g('WhatsApp')),
        email: g('Email'),
        decisor: g('Decision Maker'),
        redes,
      },

      oportunidad: conGlosario(g('Primary Opportunity')),
      senalCompra: enEspanol('senalCompra', empresa, g('Buying Signal')),
      porQueAhora: enEspanol('porQueAhora', empresa, g('Why Now')),
      servicioSugerido: conGlosario(g('Recommended First Service')),
      anguloVenta: conGlosario(g('Sales Angle')),
      evidencia: conGlosario(tapar(g('Evidence / Sources'))),
      web: g('Website'),
      mapsUrl: g('Google Maps URL'),

      responsable: null, proximaAccion: null, fechaSeguimiento: null,
      enviadoEn: null, estadoEnvio: null, estadoRespuesta: null, resumenRespuesta: null,

      enlaceFuente: null,
      tipoOportunidad: null, potencialLiderazgo: null,
      riesgoAgenciaExistente: null, anguloEntrada: null, clasificacionDerivada: false,

      // Si la hoja ya trae las columnas nuevas, se guardan para clasificar sin deducir.
      _deLaHoja: {
        tipo: g('Opportunity Type'),
        potencial: g('Agency Ownership Potential'),
        riesgo: g('Existing Agency Risk'),
        angulo: g('Recommended Entry Angle'),
      },

      fechaDeteccion: g('Date Found'),
      dedupKey: null,
      notas: conGlosario(tapar(notas)),
    }
    porClave.set(clave(p.empresa), p)
    return p
  })

  /* 2. OUTREACH QUEUE: contacto verificado y mensaje escrito */
  const gQ = lector(queue, 'QUEUE')
  const huerfanas = []
  const mensajes = []

  for (const f of queue.datos) {
    const g = (c) => gQ(f, c)
    const p = porClave.get(clave(g('Business Name')))
    if (!p) { huerfanas.push(['QUEUE', g('Business Name')]); continue }

    p.readiness = numero(g('Outreach Readiness Score'))
    p.readinessBand = g('Readiness Band')
    p.potencialNegocio = g('Deal Potential')
    p.contacto = {
      ...p.contacto,
      handle: tapar(g('Contact Handle')),
      motivoCanal: conGlosario(g('Channel Reason')),
      canal: g('Recommended Channel'),
      mejorMomento: g('Best Timing'),
      verificado: true,
    }
    const revision = g('Human Review')
    p.etapa = revision === 'APPROVED' ? 'por-enviar' : 'por-aprobar'

    const seguimientos = []
    for (const [orden, msg, ang, plazo] of [
      [1, 'Follow-up 1 Message (2-4 business days)', 'Follow-up 1 Angle (internal)', '2-4 días hábiles'],
      [2, 'Follow-up 2 Message (5-8 business days)', 'Follow-up 2 Angle (internal)', '5-8 días hábiles'],
    ]) {
      const m = g(msg); if (m) seguimientos.push({ orden, mensaje: tapar(m), angulo: g(ang), plazo })
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
      enlaceWhatsApp: null,
      texto: tapar(g('Spanish WhatsApp/DM Opener')),
      asuntoEmail: g('Email Subject'),
      cuerpoEmail: tapar(g('Spanish Email Body')),
      ganchoValor: conGlosario(g('Value Hook')),
      primeraOferta: conGlosario(g('Suggested First Offer')),
      formaRelacion: g('Engagement Shape'),
      ideaVenta: conGlosario(g('Sales Idea')),
      objeciones,
      seguimientos,
    })
  }

  /* 3. DAILY OUTREACH: la capa operativa */
  const gD = lector(daily, 'DAILY')
  for (const f of daily.datos) {
    const g = (c) => gD(f, c)
    const p = porClave.get(clave(g('Business Name')))
    if (!p) { huerfanas.push(['DAILY', g('Business Name')]); continue }

    p.responsable = g('Owner')
    p.proximaAccion = g('Next Action')
    p.fechaSeguimiento = g('Next Follow-Up Due')
    p.enviadoEn = g('Sent At')
    p.estadoEnvio = g('Send Status')
    p.estadoRespuesta = g('Reply Status')
    p.resumenRespuesta = g('Reply Summary')
    p.dedupKey = tapar(g('Dedup Key'))
    if (p.estadoEnvio === 'SENT') p.etapa = p.estadoRespuesta === 'REPLIED' ? 'respondido' : 'enviado'

    const m = mensajes.find((x) => x.prospectoId === p.id)
    if (m) m.enlaceWhatsApp = tapar(g('WhatsApp Link'))
  }

  /* 3.5 Clasificacion — necesita el mensaje, por eso va despues de la QUEUE */
  for (const p of outbound) {
    Object.assign(p, clasificar(p, mensajes.find((m) => m.prospectoId === p.id), p._deLaHoja))
    delete p._deLaHoja
  }

  /* 4. CAMARA: salud de la fuente, no una lista */
  const fuentes = []
  if (camara?.datos?.length) {
    const gC = lector(camara, 'CAMARA')
    const desglose = {}
    let validados = 0
    for (const f of camara.datos) {
      const d = gC(f, 'Disposition') ?? '(sin disposicion)'
      desglose[d] = (desglose[d] || 0) + 1
      if (gC(f, 'Validated Phone') || gC(f, 'Validated WhatsApp')) validados++
    }
    const aceptadas = desglose['APPENDED TO LEADS'] ?? 0
    fuentes.push({
      fuente: 'Cámara de Comercio de Lambayeque',
      procesadas: camara.datos.length,
      aceptadas,
      rendimiento: Number((aceptadas / camara.datos.length).toFixed(4)),
      contactosValidados: validados,
      desglose,
      notas: 'La reactivación no validó ni un solo teléfono. Los contactos verificados que hoy existen salieron de la investigación web de la QUEUE, no del padrón.',
    })
  }

  const prospectos = [...outbound, ...inbound]
  const cuenta = (e) => prospectos.filter((p) => p.etapa === e).length

  return {
    meta: {
      esMock: redactar,
      telefonosRedactados: redactar,
      fuentes: origenes,
      embudo: {
        investigados: cuenta('investigado'),
        porAprobar: cuenta('por-aprobar'),
        porEnviar: cuenta('por-enviar'),
        enviados: cuenta('enviado'),
        respondidos: cuenta('respondido'),
      },
      totales: {
        prospectos: prospectos.length,
        outbound: outbound.length,
        inbound: inbound.length,
        mensajes: mensajes.length,
      },
    },
    prospectos,
    mensajes,
    fuentes,
    huerfanas,
  }
}
