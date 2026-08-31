import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Aviso, Boton, Cargando, Dato, Estado, hace } from '../ui.jsx'

/**
 * §15 — el panorama de los jefes.
 *
 * El objetivo es entender el estado de producción en menos de 30 segundos sin
 * preguntarle nada a nadie. El orden de la pantalla es el orden de urgencia,
 * no el del modelo de datos:
 *
 *   1. Qué está haciendo Fabián ahora, y desde cuándo no se sabe nada.
 *   2. Qué está esperando a LOS JEFES. Va arriba a propósito: es lo único de
 *      esta pantalla que solo pueden desatascar ellos.
 *   3. Qué está roto (bloqueos).
 *   4. Todo lo demás, por estado.
 */
export default function Panorama() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)

  const cargar = async () => {
    try {
      setDatos(await api.panorama())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  if (error) return <Aviso>{error}</Aviso>
  if (!datos) return <Cargando que="Cargando el panorama…" />

  return (
    <>
      <p className="rotulo">Panorama</p>
      <h1>Producción</h1>

      {datos.gente.map((p) => (
        <Persona key={p.id} persona={p} />
      ))}

      {datos.cola.baja ? (
        <Aviso tono="atencion">
          Solo quedan {datos.cola.accionables} piezas accionables. Toca una ronda nueva de
          referencias.
        </Aviso>
      ) : null}

      <Esperando revisiones={datos.esperando} alResolver={cargar} />

      {datos.bloqueos.length > 0 ? (
        <section className="bloque">
          <p className="rotulo separador">Bloqueado</p>
          {datos.bloqueos.map((b) => (
            <article key={b.id} className="tarjeta tarjeta--roja">
              <header className="pieza__cabecera">
                <div>
                  <span className="pieza__marca">{b.marca || 'General'}</span>
                  <h3 className="pieza__titulo">{b.titulo || b.detalle}</h3>
                </div>
                <span className="dias">{b.dias} {b.dias === 1 ? 'día' : 'días'}</span>
              </header>
              {b.titulo && b.detalle ? <p className="pieza__nota">{b.detalle}</p> : null}
            </article>
          ))}
        </section>
      ) : null}

      <Columna titulo="En producción" piezas={datos.por_estado.EN_PRODUCCION} />
      <Columna titulo="Con cambios" piezas={datos.por_estado.CAMBIOS} />
      <Columna titulo="Próximos" piezas={datos.por_estado.PROXIMO} />
      <Columna titulo="Pausados" piezas={datos.por_estado.PAUSADO} />
      <Columna titulo="Terminados hoy" piezas={datos.por_estado.TERMINADO_HOY} />
      <Columna titulo="Por hacer" piezas={datos.por_estado.BACKLOG} />
    </>
  )
}

function Persona({ persona }) {
  const sinCierre = persona.sin_cierre_desde

  return (
    <section className="tarjeta tarjeta--destacada">
      <p className="rotulo">{persona.nombre}</p>

      {persona.trabajando_en ? (
        <>
          <h2 className="titular">{persona.trabajando_en.titulo}</h2>
          <Dato etiqueta="Último punto">{persona.trabajando_en.ultimo_punto}</Dato>
          <Dato etiqueta="Siguiente paso">{persona.trabajando_en.siguiente_paso}</Dato>
        </>
      ) : (
        <h2 className="titular sin-dato">Nada en producción ahora mismo</h2>
      )}

      <Dato etiqueta="Última señal">{hace(persona.ultima_actualizacion)}</Dato>
      <Dato etiqueta="Jornada de hoy">
        {{ abierta: 'Abierta', cerrada: 'Cerrada', sin_cierre: 'Sin cierre' }[persona.jornada_hoy] ||
          'Sin empezar'}
      </Dato>

      {/*
        No se inventa ningún estado: solo se dice qué días no se cerraron. Es
        la diferencia entre informar y suponer.
      */}
      {sinCierre.length > 0 ? (
        <Aviso tono="atencion">
          Sin cierre {sinCierre.length === 1 ? `del ${sinCierre[0]}` : `de ${sinCierre.length} días`}.
          Las tareas siguen como estaban; se resolverán la próxima vez que abra la app.
        </Aviso>
      ) : null}
    </section>
  )
}

/**
 * Lo que espera a los jefes.
 *
 * Con el veredicto a un toque: si pedir cambios costara navegar a otra
 * pantalla, la cola de revisión se quedaría creciendo y el cuello de botella
 * seguiría siendo invisible.
 */
function Esperando({ revisiones, alResolver }) {
  if (revisiones.length === 0) return null

  return (
    <section className="bloque">
      <p className="rotulo separador">Te está esperando a ti</p>
      {revisiones.map((r) => (
        <Revision key={r.id} revision={r} alResolver={alResolver} />
      ))}
    </section>
  )
}

function Revision({ revision, alResolver }) {
  const [pidiendo, setPidiendo] = useState(false)
  const [comentario, setComentario] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const decidir = async (veredicto) => {
    if (veredicto === 'cambios' && !comentario.trim()) {
      setPidiendo(true)
      return
    }
    setOcupado(true)
    setError(null)
    try {
      await api.revisar(revision.pieza_id, { veredicto, comentario: comentario || null })
      await alResolver()
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <article className="tarjeta tarjeta--ambar">
      <header className="pieza__cabecera">
        <div>
          <span className="pieza__marca">{revision.marca}</span>
          <h3 className="pieza__titulo">{revision.titulo}</h3>
        </div>
        <span className="dias">
          {revision.dias === 0 ? 'hoy' : `${revision.dias} ${revision.dias === 1 ? 'día' : 'días'}`}
        </span>
      </header>

      <Dato etiqueta="Último punto">{revision.ultimo_punto}</Dato>

      {pidiendo ? (
        <input
          className="campo-texto"
          autoFocus
          placeholder="¿Qué hay que cambiar?"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      ) : null}

      {error ? <Aviso>{error}</Aviso> : null}

      <div className="acciones acciones--linea">
        <Boton variante="principal" disabled={ocupado} onClick={() => decidir('aprobado')}>
          Aprobar
        </Boton>
        <Boton disabled={ocupado} onClick={() => decidir('cambios')}>
          {pidiendo ? 'Enviar cambios' : 'Pedir cambios'}
        </Boton>
      </div>
    </article>
  )
}

function Columna({ titulo, piezas }) {
  if (!piezas || piezas.length === 0) return null
  return (
    <section className="bloque">
      <p className="rotulo separador">
        {titulo} <span className="cuenta tabular">{piezas.length}</span>
      </p>
      {piezas.map((p) => (
        <article key={p.id} className="tarjeta tarjeta--tenue">
          <header className="pieza__cabecera">
            <div>
              <span className="pieza__marca">
                {p.marca}
                {p.cliente_nombre ? ` · ${p.cliente_nombre}` : ''}
              </span>
              <h3 className="pieza__titulo">{p.titulo}</h3>
            </div>
            <Estado valor={p.estado} />
          </header>
          {p.ultimo_punto ? <p className="pieza__nota">{p.ultimo_punto}</p> : null}
          {p.motivo_pausa ? <p className="pieza__nota">Pausa: {p.motivo_pausa}</p> : null}
        </article>
      ))}
    </section>
  )
}
