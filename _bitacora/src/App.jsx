import { useCallback, useEffect, useState } from 'react'
import { api, guardarToken } from './api.js'
import { Aviso, Cargando, Logo, fechaCorta } from './ui.jsx'
import Fabian from './audiovisual/Fabian.jsx'
import Panorama from './admin/Panorama.jsx'
import Tutorial from './Tutorial.jsx'

/**
 * La mesa de montaje.
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
  const [guia, setGuia] = useState(false)

  const recargar = useCallback(async () => {
    setEstado(await api.hoy())
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const s = await api.sesion()
        guardarToken(s.token)
        setSesion(s)
        // La guía solo a quien puede entrar. A una cuenta pendiente de alta se
        // le explicaría un producto que todavía no puede usar.
        if (s.activo && s.rol !== 'pendiente' && !s.tutorial_visto) setGuia(true)
        if (s.rol === 'audiovisual') setEstado(await api.hoy())
      } catch (e) {
        setError(e)
      }
    })()
  }, [])

  const sinAlta = error?.motivo === 'sin_alta' || sesion?.rol === 'pendiente'

  return (
    <>
      {guia && sesion ? <Tutorial rol={sesion.rol} alTerminar={() => setGuia(false)} /> : null}

      <Hoja sesion={sesion} estado={estado}>
        {sinAlta ? (
          <SinAlta sesion={sesion} />
        ) : error ? (
          <Roto mensaje={error.message} />
        ) : !sesion ? (
          <div className="hoja__cuerpo">
            <Cargando />
          </div>
        ) : sesion.rol === 'admin' ? (
          <Panorama />
        ) : estado ? (
          <Fabian estado={estado} recargar={recargar} />
        ) : (
          <div className="hoja__cuerpo">
            <Cargando />
          </div>
        )}
      </Hoja>
    </>
  )
}

/**
 * La hoja: el riel arriba, y debajo lo que toque.
 *
 * La clase `enhebra` se pone una sola vez, al montar. Es el único momento de
 * autor de la aplicación: la tira entra desde arriba desenfocada, frena con
 * inercia y encaja en la perforación. No se repite en cada cambio de pantalla,
 * porque una entrada que se repite deja de ser un momento y pasa a ser un peaje.
 */
function Hoja({ sesion, estado, children }) {
  return (
    <div className="hoja enhebra">
      <header className="riel campo-naranja">
        <div className="riel__marca">
          <Logo />
          <span className="etiqueta">Bitácora</span>
        </div>
        <div className="riel__derecha">
          {estado?.hoy ? <span className="cifra">{fechaCorta(estado.hoy)}</span> : null}
          {sesion ? <a href="/?salir=1">Salir</a> : null}
        </div>
      </header>
      <div className="hoja__contenido">{children}</div>
    </div>
  )
}

function SinAlta({ sesion }) {
  return (
    <div className="hoja__cuerpo">
      <h1>Todavía no tienes acceso</h1>
      <Aviso titulo="Sin alta">
        Tu cuenta {sesion?.correo ? <strong>{sesion.correo}</strong> : null} es del dominio, pero
        nadie la ha dado de alta. Pídele a un administrador que te añada.
      </Aviso>
      <p className="ventana">
        Haber demostrado que tienes un correo de la empresa no es lo mismo que estar autorizado a
        ver la producción. El alta se hace a mano, y es a propósito.
      </p>
    </div>
  )
}

function Roto({ mensaje }) {
  return (
    <div className="hoja__cuerpo">
      <h1>Algo no responde</h1>
      <Aviso titulo="Error">{mensaje}</Aviso>
    </div>
  )
}
