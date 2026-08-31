import { useCallback, useEffect, useState } from 'react'
import { api, guardarToken } from './api.js'
import { Aviso, Cargando, Marca } from './ui.jsx'
import Fabian from './audiovisual/Fabian.jsx'
import Panorama from './admin/Panorama.jsx'

/**
 * Raíz.
 *
 * Un solo build, dos conchas, y el rol lo decide el servidor — nunca un
 * parámetro de la URL. Aunque alguien forzara la vista de admin en el
 * navegador, la API le devolvería 403: la interfaz elige qué enseñar, no quién
 * puede.
 */
export default function App() {
  const [sesion, setSesion] = useState(null)
  const [estado, setEstado] = useState(null)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setEstado(await api.hoy())
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const s = await api.sesion()
        guardarToken(s.token)
        setSesion(s)
        if (s.rol === 'audiovisual') setEstado(await api.hoy())
      } catch (e) {
        setError(e)
      }
    })()
  }, [])

  if (error?.motivo === 'sin_alta' || (sesion && sesion.rol === 'pendiente')) {
    return (
      <Envoltorio>
        <h1>Todavía no tienes acceso.</h1>
        <Aviso>
          Tu cuenta {sesion?.correo ? <strong>{sesion.correo}</strong> : null} es del dominio, pero
          nadie la ha dado de alta en Bitácora. Pídele a un administrador que te añada.
        </Aviso>
        <Pie />
      </Envoltorio>
    )
  }

  if (error) {
    return (
      <Envoltorio>
        <h1>Algo no responde.</h1>
        <Aviso>{error.message}</Aviso>
        <Pie />
      </Envoltorio>
    )
  }

  if (!sesion) {
    return (
      <Envoltorio>
        <Cargando />
      </Envoltorio>
    )
  }

  return (
    <Envoltorio ancho={sesion.rol === 'admin'}>
      {sesion.rol === 'admin' ? (
        <Panorama />
      ) : estado ? (
        <Fabian estado={estado} recargar={recargar} />
      ) : (
        <Cargando />
      )}
      <Pie nombre={sesion.nombre} />
    </Envoltorio>
  )
}

function Envoltorio({ children, ancho = false }) {
  return (
    <div className={ancho ? 'envoltorio envoltorio--ancho' : 'envoltorio'}>
      <Marca />
      {children}
    </div>
  )
}

function Pie({ nombre }) {
  return (
    <p className="pie">
      {nombre ? `${nombre} · ` : null}
      <a href="/?salir=1">Cerrar sesión</a>
    </p>
  )
}
