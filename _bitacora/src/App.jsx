import { useEffect, useState } from 'react'
import { api, guardarToken } from './api.js'

/**
 * Fase 0 — cimientos.
 *
 * Esta pantalla existe para demostrar la tuberia entera antes de que haya
 * producto: puerta de Google, sesion, PHP, MySQL y build servido desde app/.
 * Si esto se ve, todo lo de debajo funciona, y la Fase 1 puede construir
 * encima sin ir a ciegas.
 *
 * La sustituye el carril vertical (inicio de jornada → cierre → plan de mañana).
 */
export default function App() {
  const [sesion, setSesion] = useState(null)
  const [salud, setSalud] = useState(null)
  const [error, setError] = useState(null)
  const [sinAlta, setSinAlta] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const s = await api.sesion()
        guardarToken(s.token)
        setSesion(s)

        if (s.rol === 'pendiente' || !s.activo) {
          setSinAlta(true)
          return
        }
        setSalud(await api.salud())
      } catch (e) {
        if (e.motivo === 'sin_alta') setSinAlta(true)
        else setError(e.message)
      }
    })()
  }, [])

  return (
    <div className="envoltorio">
      <div className="marca" aria-hidden="true">
        <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg">
          <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61" />
        </svg>
      </div>

      <p className="rotulo">Bitácora</p>

      {sinAlta ? <SinAlta sesion={sesion} /> : null}
      {error ? (
        <>
          <h1>Algo no responde.</h1>
          <p className="aviso">
            <b />
            <span>{error}</span>
          </p>
        </>
      ) : null}

      {!sinAlta && !error ? (
        <>
          <h1>{sesion ? `Hola, ${primerNombre(sesion.nombre)}.` : 'Cargando…'}</h1>

          <div className="tarjeta">
            <dl>
              <Dato etiqueta="Cuenta" valor={sesion?.correo} />
              <Dato etiqueta="Rol" valor={sesion ? nombreDeRol(sesion.rol) : null} />
              <Dato etiqueta="Fecha de hoy" valor={sesion?.hoy} />
              <Dato etiqueta="Hora del servidor" valor={salud?.hora} />
              <Dato etiqueta="Zona horaria" valor={salud?.zona} />
            </dl>
          </div>

          <p className="nota-fase">
            <strong>Fase 0 — cimientos.</strong> Si estás leyendo esto es porque la puerta de
            Google, la sesión, PHP, MySQL y el build funcionan de punta a punta. La Fase 1 sustituye
            esta pantalla por el carril real: inicio de jornada, cierre guiado y plan de mañana.
          </p>
        </>
      ) : null}

      <p className="pie">
        <a href="/?salir=1">Cerrar sesión</a>
      </p>
    </div>
  )
}

function SinAlta({ sesion }) {
  return (
    <>
      <h1>Todavía no tienes acceso.</h1>
      <p className="aviso">
        <b />
        <span>
          Tu cuenta {sesion?.correo ? <strong>{sesion.correo}</strong> : null} es del dominio, pero
          nadie la ha dado de alta en Bitácora. Pídele a un administrador que te añada.
        </span>
      </p>
      <p className="nota-fase">
        Haber demostrado que tienes un correo de la empresa no es lo mismo que estar autorizado a
        ver la producción. El alta se hace a mano, y es a propósito.
      </p>
    </>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div className="dato">
      <dt>{etiqueta}</dt>
      <dd className={valor ? 'tabular' : 'sin-dato'}>{valor || 'sin dato'}</dd>
    </div>
  )
}

function primerNombre(nombre) {
  return (nombre || '').trim().split(/\s+/)[0] || 'hola'
}

function nombreDeRol(rol) {
  return { audiovisual: 'Audiovisual', admin: 'Administrador', pendiente: 'Pendiente de alta' }[rol] || rol
}
