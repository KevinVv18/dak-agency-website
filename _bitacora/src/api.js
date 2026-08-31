/**
 * Cliente de la API.
 *
 * Todo pasa por aqui para que dos cosas se hagan siempre y nunca por descuido:
 *
 *  1. El token de escritura viaja en cada peticion que no sea GET.
 *  2. Un 401 no se trata como un error cualquiera. Significa que la sesion
 *     caduco con la aplicacion abierta, y lo unico sensato es recargar para que
 *     la puerta PHP enseñe la pantalla de acceso.
 */

let token = ''

export function guardarToken(t) {
  token = t || ''
}

export class ErrorApi extends Error {
  constructor(mensaje, codigo, extra) {
    super(mensaje)
    this.codigo = codigo
    Object.assign(this, extra || {})
  }
}

async function pedir(ruta, opciones = {}) {
  const metodo = opciones.metodo || 'GET'

  const cabeceras = { Accept: 'application/json' }
  if (opciones.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (metodo !== 'GET') cabeceras['X-DAK-Token'] = token

  const r = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    // Las rutas de la aplicacion las resuelve la puerta PHP, no el navegador.
    credentials: 'same-origin',
  })

  if (r.status === 401) {
    // Recargar es la respuesta correcta: la puerta esta en el servidor y es
    // quien tiene que decidir que enseñar.
    window.location.reload()
    throw new ErrorApi('Sesión caducada.', 401)
  }

  let datos = null
  try {
    datos = await r.json()
  } catch {
    datos = null
  }

  if (!r.ok) {
    throw new ErrorApi(datos?.error || `Error ${r.status}.`, r.status, datos || {})
  }

  return datos
}

export const api = {
  sesion: () => pedir('/sesion'),
  salud: () => pedir('/salud'),
}
