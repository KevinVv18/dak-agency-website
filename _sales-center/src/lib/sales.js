import mock from '../../data/mock.json'

const byReadiness = (left, right) => (right.readiness ?? -1) - (left.readiness ?? -1)

export const salesData = mock

export const getDisplayName = (prospect) => prospect.empresa ?? prospect.persona ?? 'sin dato'

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
