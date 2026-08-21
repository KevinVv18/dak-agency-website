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
