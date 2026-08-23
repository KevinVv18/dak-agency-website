import mock from '../../data/mock.json'

const byReadiness = (left, right) => (right.readiness ?? -1) - (left.readiness ?? -1)

export const salesData = mock

export const getDisplayName = (prospect) => prospect.empresa ?? prospect.persona ?? 'sin dato'

/**
 * El nombre para una lista compacta.
 *
 * La hoja guarda el nombre con una coletilla entre parentesis que le sirve al
 * agente para desambiguar —«(Chiclayo)», «(housing project)», «(Lambayeque
 * investment dossier)»— y que en una columna de 300px se come la mitad del
 * ancho y encima esta en ingles. En la ficha se enseña el nombre entero; aqui
 * solo el nombre.
 *
 * Se recorta unicamente el parentesis FINAL: si una empresa se llamase «(AB)
 * Repuestos», se queda como esta.
 */
export const getShortName = (prospect) => {
  const nombre = getDisplayName(prospect)
  const corto = nombre.replace(/\s*\([^()]*\)\s*$/, '').trim()
  return corto || nombre
}

export const getOpener = (prospectId, data = mock) =>
  data.mensajes.find(
    (message) => message.prospectoId === prospectId && message.etapa === 'OPENER',
  ) ?? null

/**
 * Cuantos dias lleva parada una fecha.
 *
 * Es el dato que le faltaba al panel. Todo el diagnostico de este proyecto fue
 * «las cosas se atascan en las dos puertas humanas», y sin embargo nada en la
 * interfaz se daba cuenta de que Acuña lleva dias esperando. Una lista que no
 * sabe que el tiempo pasa no empuja a nadie.
 *
 * Es un valor DERIVADO, no un dato de la hoja: se calcula contra el reloj de
 * quien mira. Por eso la UI lo etiqueta como derivado, igual que los conteos.
 */
export const diasDesde = (fecha, hoy = new Date()) => {
  if (!fecha) return null
  const [anio, mes, dia] = fecha.split('-').map(Number)
  if (!anio || !mes || !dia) return null
  const desde = Date.UTC(anio, mes - 1, dia)
  const hasta = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dias = Math.round((hasta - desde) / 86400000)
  return dias >= 0 ? dias : null
}

/**
 * El umbral del aviso en oro.
 *
 * Empezo en 3 dias y fue un error: con los datos reales las once filas cruzaban
 * el umbral y las once salian en oro. Un aviso que llevan todos deja de ser un
 * aviso y se convierte en decoracion — el mismo problema que tenia la paleta
 * cuando todo era de color.
 *
 * A 30 dias solo lo cruzan los dos leads de julio que nadie contesto, que es
 * exactamente lo que hay que ver. Los 8 dias del lote de agosto siguen
 * mostrandose, pero en hueso: son informacion, no una alarma.
 *
 * Que TODO el conjunto este parado no es un problema de fila, es un problema de
 * conjunto — y por eso se dice una vez arriba, no once veces abajo.
 */
export const DIAS_PARA_ALERTAR = 30

export const estaEstancado = (prospect, hoy = new Date()) => {
  const dias = diasDesde(prospect.fechaDeteccion, hoy)
  return dias !== null && dias >= DIAS_PARA_ALERTAR
}

/** Resumen de antigüedad de un grupo de filas, para decirlo una sola vez. */
export const resumenAntiguedad = (filas, hoy = new Date()) => {
  const dias = filas
    .map(({ prospect }) => diasDesde(prospect.fechaDeteccion, hoy))
    .filter((valor) => valor !== null)
  if (!dias.length) return null
  return { min: Math.min(...dias), max: Math.max(...dias), cuantas: dias.length }
}

export const getTodayActions = (data = mock) => {
  const withOpener = (prospect) => ({ prospect, message: getOpener(prospect.id, data) })

  return {
    pending: data.prospectos
      .filter((prospect) => prospect.etapa === 'por-aprobar')
      .map(withOpener)
      .sort((left, right) => byReadiness(left.prospect, right.prospect)),
    readyToSend: data.prospectos
      .filter((prospect) => prospect.etapa === 'por-enviar')
      .map(withOpener)
      .sort((left, right) => byReadiness(left.prospect, right.prospect)),
    waitingForReply: data.prospectos
      .filter(
        (prospect) =>
          prospect.estadoEnvio === 'SENT' && prospect.estadoRespuesta === 'NO REPLY',
      )
      .map(withOpener),
    /**
     * Los que llegaron solos y no ha contestado nadie.
     *
     * Esto era un agujero, no un extra: un lead entrante no tiene mensaje
     * redactado, asi que no caia en ninguna de las tres colas de arriba y por
     * tanto NO APARECIA en Hoy. Se podia ver en Panorama y en Prospectos, pero
     * no habia ni un sitio donde te tocara hacer algo con el. Justo por eso el
     * del 17 de agosto lleva ahi.
     *
     * Se ordena por el mas viejo primero: aqui la antiguedad no es un detalle,
     * es el problema.
     */
    inboundSinAtender: data.prospectos
      .filter(
        (prospect) =>
          prospect.origen === 'inbound' &&
          !prospect.responsable &&
          prospect.estado !== 'Descartado',
      )
      .map(withOpener)
      .sort((left, right) =>
        (left.prospect.fechaDeteccion ?? '').localeCompare(right.prospect.fechaDeteccion ?? ''),
      ),
  }
}

export const getProspects = (data = mock) => [...data.prospectos]

export const getBaseHealth = (data = mock) => [...data.fuentes]

export const getProspectById = (id, data = mock) =>
  data.prospectos.find((prospect) => prospect.id === id) ?? null

export const loadSalesData = () =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(mock), 260)
  })
