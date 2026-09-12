import { useEffect, useState } from 'react'
import { api } from '../api.js'
import {
  Apunte,
  Aviso,
  Boton,
  Cargando,
  Cinta,
  DESENLACES,
  ETIQUETAS_ESTADO,
  Marca,
  fechaLarga,
  hace,
} from '../ui.jsx'

/**
 * La mesa entera, para los jefes.
 *
 * NO es una columna de tarjetas con scroll. La tesis lo rechaza expresamente y
 * la primera construcción entregó justo eso: sección, rejilla, tarjeta, repetir,
 * desplazar. Es lo que la aplicación ya era antes del rediseño.
 *
 * Ahora es la mesa: las dos deudas ocupan la pantalla, y el estado de la
 * producción es una tira de contadores —cuenta de fotogramas, no seis columnas
 * de tarjetas—. Cabe en una pantalla y no se desplaza, que es lo que «leer la
 * producción en treinta segundos» significa. El detalle está a un clic.
 *
 * El orden es el de urgencia:
 *   1. Quién está en qué, y desde cuándo no se sabe nada.
 *   2. Qué espera a LOS JEFES — en campo naranja, porque es lo único de esta
 *      pantalla que sólo pueden desatascar ellos.
 *   3. Qué está roto.
 *   4. El resto, como contadores.
 */
export default function Panorama() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)
  const [pov, setPov] = useState(null)
  const [grupo, setGrupo] = useState(null)

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

  if (error) {
    return (
      <div className="hoja__cuerpo">
        <Aviso titulo="No responde">{error}</Aviso>
      </div>
    )
  }
  if (!datos) {
    return (
      <div className="hoja__cuerpo">
        <Cargando que="Encendiendo la mesa…" />
      </div>
    )
  }

  const GRUPOS = [
    ['EN_PRODUCCION', 'En producción'],
    ['REVISION', 'En revisión'],
    ['CAMBIOS', 'Con cambios'],
    ['BLOQUEADO', 'Bloqueado'],
    ['PAUSADO', 'Pausado'],
    ['PROXIMO', 'Próximo'],
    ['BACKLOG', 'Por hacer'],
  ]

  return (
    <>
      <div className="mesa campo-naranja">
        <div className="mesa__centro">
          {datos.gente.map((p) => (
            <Persona key={p.id} persona={p} onVerPov={() => setPov(p)} />
          ))}

          <div className="mesa__deudas">
            <Esperando revisiones={datos.esperando} alResolver={cargar} />
            <Bloqueos bloqueos={datos.bloqueos} cola={datos.cola} />
          </div>

          {/*
            El cesto de la mesa, y no un hueco.

            Con los paneles midiendo su contenido sobraba casi media pantalla, y
            dejarla como suelo naranja era el mismo vacío de antes pintado de
            otro color. Aquí cuelga lo que viene: por defecto la cola accionable,
            y al pulsar un contador, ese estado. Es el cesto bajo el riel, que es
            donde cuelga el trabajo apartado en una moviola de verdad, y le dice
            al jefe lo único que le faltaba: qué hay por delante.
          */}
          <BinDeLaMesa
            titulo={grupo ? ETIQUETAS_ESTADO[grupo] : 'Por delante'}
            piezas={
              grupo
                ? datos.por_estado[grupo] || []
                : [...(datos.por_estado.PROXIMO || []), ...(datos.por_estado.BACKLOG || [])]
            }
          />
        </div>

        {/*
          Cada estado ocupa celdas en proporción a sus piezas: el rango se marca
          por cuántas celdas ocupa algo, que es la regla de este mundo, y no por
          el tamaño de una cifra. «Por hacer 3» es tres veces más ancho que «en
          producción 1» y se entiende sin leer un número.
        */}
        <div className="contadores">
          {GRUPOS.map(([clave, texto]) => {
            const n = (datos.por_estado[clave] || []).length
            return (
              <button
                key={clave}
                type="button"
                className="contadores__celda tinta"
                style={{ '--peso': Math.max(n, 0.55) }}
                aria-pressed={grupo === clave}
                aria-label={`${texto}: ${n}`}
                disabled={n === 0}
                onClick={() => setGrupo(grupo === clave ? null : clave)}
              >
                <span className="contadores__n cifra">{n}</span>
                <span className="contadores__que">{texto}</span>
              </button>
            )
          })}
        </div>
      </div>

      {pov ? <Pov persona={pov} onCerrar={() => setPov(null)} /> : null}
    </>
  )
}

/* ── Quién está en qué ───────────────────────────────────────────────────*/

function Persona({ persona, onVerPov }) {
  const sinCierre = persona.sin_cierre_desde
  const p = persona.trabajando_en

  return (
    <section className="panel tinta">
      <h2 className="panel__titulo">
        {persona.nombre}
        <span style={{ opacity: 0.6 }}>
          ·{' '}
          {{ abierta: 'jornada abierta', cerrada: 'jornada cerrada', sin_cierre: 'sin cierre' }[
            persona.jornada_hoy
          ] || 'sin abrir'}
        </span>
        <span style={{ marginLeft: 'auto' }} className="cifra">
          {hace(persona.ultima_actualizacion) || 'sin señal'}
        </span>
        <button type="button" className="panel__accion" onClick={onVerPov}>
          Ver su pantalla
        </button>
      </h2>

      {/* Dos columnas en escritorio: la pieza a la izquierda y sus dos apuntes
          a la derecha. En una sola columna el panel dejaba media pantalla de
          negro vacío a la derecha y se leía como algo sin terminar. */}
      <div className="panel__lista panel__lista--ancha">
        {p ? (
          <>
            <div>
              <h3 className="fotograma__titulo">{p.titulo}</h3>
              <Cinta sobreTinta>
                {p.marca} · {ETIQUETAS_ESTADO[p.estado] || p.estado}
              </Cinta>
            </div>
            <div>
              <Apunte etiqueta="Dónde quedó">{p.ultimo_punto}</Apunte>
              <Apunte etiqueta="Siguiente paso">{p.siguiente_paso}</Apunte>
            </div>
          </>
        ) : (
          <p className="sin-dato">Nada en producción ahora mismo.</p>
        )}

        {/* No se inventa ningún estado: sólo se dice qué días no se cerraron.
            Es la diferencia entre informar y suponer. */}
        {sinCierre.length > 0 ? (
          <Aviso titulo="Sin cierre">
            {sinCierre.length === 1
              ? `El ${fechaLarga(sinCierre[0])} pasó sin cierre.`
              : `${sinCierre.length} días pasaron sin cierre.`}{' '}
            Las tareas siguen como estaban; se resolverán la próxima vez que abra la app.
          </Aviso>
        ) : null}

      </div>
    </section>
  )
}

/* ── La deuda de los jefes: en campo naranja ─────────────────────────────*/

function Esperando({ revisiones, alResolver }) {
  return (
    <section className="panel campo-naranja">
      <h2 className="panel__titulo">
        Te espera a ti <span className="cifra">{revisiones.length}</span>
      </h2>
      <div className="panel__lista">
        {revisiones.length === 0 ? (
          <p className="sin-dato">Nada esperando tu revisión.</p>
        ) : (
          revisiones.map((r) => <Revision key={r.id} revision={r} alResolver={alResolver} />)
        )}
      </div>
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
    <article className="fotograma tinta">
      <h3 className="fotograma__titulo">{revision.titulo}</h3>
      <Cinta sobreTinta>
        {revision.marca} ·{' '}
        {revision.dias === 0 ? 'hoy' : `${revision.dias} ${revision.dias === 1 ? 'día' : 'días'}`}
      </Cinta>
      <div style={{ marginTop: 'calc(var(--paso) * 0.6)' }}>
        <Apunte etiqueta="Dónde quedó">{revision.ultimo_punto}</Apunte>
      </div>

      {pidiendo ? (
        <input
          className="campo"
          autoFocus
          placeholder="¿Qué hay que cambiar?"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      ) : null}
      {error ? <Aviso titulo="No se pudo guardar">{error}</Aviso> : null}

      <div className="acciones acciones--linea" style={{ padding: '3px 0 0' }}>
        <Boton variante="principal" disabled={ocupado} onClick={() => decidir('aprobado')}>
          Aprobar
        </Boton>
        <Boton disabled={ocupado} onClick={() => decidir('cambios')}>
          {pidiendo ? 'Enviar' : 'Cambios'}
        </Boton>
      </div>
    </article>
  )
}

function Bloqueos({ bloqueos, cola }) {
  return (
    <section className="panel tinta">
      <h2 className="panel__titulo">
        Parado <span className="cifra">{bloqueos.length}</span>
      </h2>
      <div className="panel__lista">
        {cola.baja ? (
          <Aviso titulo="Cola baja">
            Solo quedan {cola.accionables} piezas accionables. Toca una ronda nueva de referencias.
          </Aviso>
        ) : null}
        {bloqueos.length === 0 ? (
          <p className="sin-dato">Nada bloqueado.</p>
        ) : (
          bloqueos.map((b) => (
            <article key={b.id} className="fotograma tinta">
              <h3 className="fotograma__titulo">{b.titulo || b.detalle}</h3>
              <Cinta>
                {b.marca || 'General'} · {b.dias} {b.dias === 1 ? 'día' : 'días'}
              </Cinta>
              {b.titulo && b.detalle ? (
                <div style={{ marginTop: 'calc(var(--paso) * 0.5)' }}>
                  <Apunte etiqueta="Falta">{b.detalle}</Apunte>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

/* ── Sobreimpresión: detalle a un clic, sin sacar al jefe de la mesa ────*/

function Sobre({ titulo, onCerrar, children, banda }) {
  useEffect(() => {
    const alPulsar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  return (
    <div className="pov" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="pov__banda campo-naranja">
        <span>{banda || titulo}</span>
        <button type="button" className="pov__cerrar" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
      <div className="pov__pantalla">{children}</div>
    </div>
  )
}

/**
 * El POV: la pantalla exacta que Fabián tiene delante ahora mismo.
 *
 * Espejo de SOLO LECTURA, y se nota: la luz de la mesa apagada y nada que
 * pulsar. No es defensa decorativa — un jefe que pudiera cerrar la jornada
 * desde aquí ensuciaría el historial con eventos que Fabián no hizo, y el
 * registro dejaría de ser fiable justo en los días raros, que son los únicos
 * que alguien va a querer investigar. El servidor tampoco lo permite.
 */
function Pov({ persona, onCerrar }) {
  const [estado, setEstado] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    api
      .pov(persona.id)
      .then((d) => vivo && setEstado(d))
      .catch((e) => vivo && setError(e.message))
    return () => {
      vivo = false
    }
  }, [persona.id])

  return (
    <Sobre
      titulo="POV"
      banda={`Lo que ${persona.nombre} ve ahora · sólo lectura`}
      onCerrar={onCerrar}
    >
      {error ? <Aviso titulo="No se pudo mirar">{error}</Aviso> : null}
      {!estado && !error ? <Cargando /> : null}
      {estado ? <EspejoDeHoy estado={estado} nombre={persona.nombre} /> : null}
    </Sobre>
  )
}

function EspejoDeHoy({ estado, nombre }) {
  const enSecuencia = estado.modo === 'reconciliar'
  const piezas = enSecuencia
    ? estado.reconciliar.piezas
    : estado.plan_congelado || (estado.plan || []).map((l) => l.pieza)

  if (estado.modo === 'cerrada') {
    return (
      <>
        <div className="fotograma tinta">
          <h3 className="fotograma__titulo">Ya cerró el día</h3>
        </div>
        {estado.resumen ? (
          <div className="cola">
            <pre className="cola__texto">{estado.resumen.texto}</pre>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <>
      {enSecuencia ? (
        <Aviso titulo="Le pide ponerse al día">
          {estado.reconciliar.jornadas.length}{' '}
          {estado.reconciliar.jornadas.length === 1 ? 'día sin cerrar' : 'días sin cerrar'}. Verá{' '}
          {piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'}, una por pantalla.
        </Aviso>
      ) : null}

      {piezas.length === 0 ? (
        <p className="sin-dato">{nombre} no tiene nada asignado para producir.</p>
      ) : (
        piezas.map((p) => <FotogramaFicha key={p.id} pieza={p} />)
      )}

      {/* Las cinco marcas, inertes: para que el jefe vea la decisión que se le
          pide, no sólo la lista de piezas. */}
      <div className="marcas campo-naranja">
        {DESENLACES.map((x) => (
          <Marca key={x.id} desenlace={x} />
        ))}
      </div>
    </>
  )
}

/**
 * El cesto de la mesa: lo que viene, colgando de sus pinchos.
 *
 * Ocupa las celdas que los paneles no necesitan, así que la pantalla se llena
 * con trabajo real en vez de con suelo. Los descartes cuelgan a altura
 * completa, como en un cesto de moviola.
 */
function BinDeLaMesa({ titulo, piezas }) {
  return (
    <section className="cesto cesto--alto cesto--mesa">
      <h2 className="cesto__titulo">
        {titulo} <span className="cifra">{piezas.length}</span>
      </h2>
      {piezas.length === 0 ? (
        <p className="sin-dato">Nada colgando aquí.</p>
      ) : (
        <div className="cesto__carril">
          {piezas.map((p, i) => (
            <article
              key={p.id}
              className="trim tinta"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <p className="trim__titulo">{p.titulo}</p>
              {p.ultimo_punto ? <p className="trim__punto">{p.ultimo_punto}</p> : null}
              <p className="trim__pie">
                {p.marca} · {ETIQUETAS_ESTADO[p.estado] || p.estado}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function FotogramaFicha({ pieza }) {
  return (
    <article className="fotograma tinta">
      <h3 className="fotograma__titulo">{pieza.titulo}</h3>
      <Cinta sobreTinta>
        {pieza.marca}
        {pieza.cliente_nombre ? ` · ${pieza.cliente_nombre}` : ''} ·{' '}
        {ETIQUETAS_ESTADO[pieza.estado] || pieza.estado}
      </Cinta>
      <div style={{ marginTop: 'calc(var(--paso) * 0.5)' }}>
        <Apunte etiqueta="Dónde quedó">{pieza.ultimo_punto}</Apunte>
        {pieza.motivo_pausa ? <Apunte etiqueta="Pausa">{pieza.motivo_pausa}</Apunte> : null}
      </div>
    </article>
  )
}
