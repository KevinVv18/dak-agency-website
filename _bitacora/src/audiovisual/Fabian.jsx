import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import {
  Apunte,
  Aviso,
  Boton,
  Cesto,
  Cinta,
  Contador,
  DESENLACES,
  ETIQUETAS_ESTADO,
  ETIQUETAS_TRABAJO,
  MARCAS,
  Marca,
  SelloDe,
  TIPOS_BLOQUEO,
  TIPOS_TRABAJO,
  fechaLarga,
} from '../ui.jsx'

/**
 * La concha de Fabián.
 *
 * Una sola visita al día. Entra al terminar, deja sus marcas y se va. Por la
 * mañana, si abre, mira la tira y no se le pide nada.
 *
 * No hay router: la pantalla la decide el `modo` que devuelve el servidor. El
 * estado de la jornada vive en la base, no en la URL, así que recargar cae
 * siempre donde toca.
 *
 * Y no hay scroll. Nunca hay más de una decisión a la vista.
 */
export default function Fabian({ estado, recargar }) {
  const [cerrando, setCerrando] = useState(false)

  if (estado.modo === 'reconciliar') return <Reconciliar estado={estado} recargar={recargar} />
  if (estado.modo === 'cerrada') return <DiaCerrado estado={estado} />
  if (cerrando) {
    return <Cierre estado={estado} volver={() => setCerrando(false)} recargar={recargar} />
  }
  return <LaTira estado={estado} alCerrar={() => setCerrando(true)} />
}

/* ══ La tira: lo que ve al entrar ══════════════════════════════════════════
 *
 * El fotograma de hoy punzado en la tinta, y el tercio inferior en campo
 * naranja con el cesto y la única acción. Si sólo viene a mirar, aquí termina.
 */

function LaTira({ estado, alCerrar }) {
  const plan = estado.plan_congelado || []
  const [actual, ...despues] = plan

  // El suelo también aquí es naranja, y el fotograma de hoy va punzado encima.
  // Sin esto la pantalla de entrada medía un 14 % de naranja —el fotograma se
  // comía el suelo— y volvía a leerse como el panel oscuro con un acento.
  return (
    <div className="campo-naranja hoja__contenido">
      <div className="hoja__cuerpo">
        {actual ? (
          <div className="fotograma fotograma--portada tinta">
            <h1 className="fotograma__titulo">{actual.titulo}</h1>
            {/* La cinta va DEBAJO del titular. Nunca encima: un rótulo apilado
                sobre un encabezado está prohibido sin excepción. */}
            <Cinta sobreTinta>
              {actual.marca}
              {actual.cliente_nombre ? ` · ${actual.cliente_nombre}` : ''} ·{' '}
              {ETIQUETAS_ESTADO[actual.estado] || actual.estado}
            </Cinta>
            <div style={{ marginTop: 'calc(var(--paso) * 0.9)' }}>
              <Apunte etiqueta="Dónde quedaste">{actual.ultimo_punto}</Apunte>
              <Apunte etiqueta="Siguiente paso">{actual.siguiente_paso}</Apunte>
            </div>
          </div>
        ) : (
          <div className="fotograma fotograma--crece tinta">
            <h1 className="fotograma__titulo">Nada en marcha</h1>
            <div style={{ marginTop: 'calc(var(--paso) * 0.8)' }}>
              <Aviso titulo="Cola vacía">
                No tienes piezas asignadas para producir. Toca una ronda nueva de referencias con
                la socia.
              </Aviso>
            </div>
          </div>
        )}

        {estado.cola?.baja && actual ? (
          <Aviso titulo="Queda poco por producir">
            Solo hay {estado.cola.accionables} piezas accionables. Toca una ronda nueva de
            referencias.
          </Aviso>
        ) : null}
      </div>

      <div className="pie-hoja">
        <Cesto titulo="Después" piezas={despues} alto />
        <div className="acciones">
          <Boton variante="principal" onClick={alCerrar} disabled={plan.length === 0}>
            Cerrar el día
          </Boton>
        </div>
      </div>
    </div>
  )
}

/* ══ La secuencia ═════════════════════════════════════════════════════════
 *
 * Un fotograma por pantalla. La comparten el cierre y la reconciliación porque
 * son el mismo gesto.
 *
 * Nada se envía hasta el final: todo es estado local, así que un toque
 * equivocado se corrige con «atrás» y no llega nunca a la base.
 */

function Secuencia({
  piezas,
  entradilla,
  onEnviar,
  onCancelar,
  textoFinal,
  error,
  trabajosAyer = [],
  conTrabajos = false,
}) {
  const [i, setI] = useState(0)
  const [mapa, setMapa] = useState({})
  const [paso, setPaso] = useState('piezas')
  const [trabajos, setTrabajos] = useState([])
  const [bloqueo, setBloqueo] = useState(null)
  const [detalleBloqueo, setDetalleBloqueo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const pieza = piezas[i]
  const d = mapa[pieza?.id] || {}
  const pideDetalle = ['continuo', 'pause', 'bloqueado'].includes(d.desenlace)

  const marcar = (id) => {
    setMapa((m) => ({ ...m, [pieza.id]: { ...d, desenlace: id } }))
    if (!['continuo', 'pause', 'bloqueado'].includes(id)) {
      // Un respiro para que el sello se vea estampado antes de que la tira avance.
      clearTimeout(temporizador.current)
      temporizador.current = setTimeout(avanzar, 420)
    }
  }

  const editar = (parche) => setMapa((m) => ({ ...m, [pieza.id]: { ...d, ...parche } }))
  const avanzar = () =>
    i + 1 < piezas.length ? setI(i + 1) : setPaso(conTrabajos ? 'trabajos' : 'bloqueo')
  const atras = () => {
    clearTimeout(temporizador.current)
    if (paso === 'bloqueo') setPaso(conTrabajos ? 'trabajos' : 'piezas')
    else if (paso === 'trabajos') setPaso('piezas')
    else if (i > 0) setI(i - 1)
    else onCancelar?.()
  }

  const enviar = async () => {
    setEnviando(true)
    await onEnviar(
      piezas.map((p) => ({ pieza_id: p.id, ...mapa[p.id] })),
      bloqueo && bloqueo !== 'ninguno' ? [{ tipo: bloqueo, detalle: detalleBloqueo || null }] : [],
      trabajos
    )
    setEnviando(false)
  }

  const totalPasos = piezas.length + (conTrabajos ? 2 : 1)

  if (paso === 'trabajos') {
    return (
      <ElResto
        trabajos={trabajos}
        setTrabajos={setTrabajos}
        ayer={trabajosAyer}
        total={totalPasos}
        actual={piezas.length}
        atras={atras}
        seguir={() => setPaso('bloqueo')}
      />
    )
  }

  if (paso === 'bloqueo') {
    return (
      <div className="campo-naranja hoja__contenido">
        <Contador total={totalPasos} actual={totalPasos - 1} />
        <div className="hoja__cuerpo">
          <h1>¿Algo te frena?</h1>
          <div className="fichas">
            <button
              type="button"
              className={bloqueo === 'ninguno' ? 'ficha ficha--activa' : 'ficha tinta'}
              aria-pressed={bloqueo === 'ninguno'}
              onClick={() => setBloqueo('ninguno')}
            >
              Nada
            </button>
            {TIPOS_BLOQUEO.map((t) => (
              <button
                key={t.id}
                type="button"
                className={bloqueo === t.id ? 'ficha ficha--activa' : 'ficha tinta'}
                aria-pressed={bloqueo === t.id}
                onClick={() => setBloqueo(t.id)}
              >
                {t.texto}
              </button>
            ))}
          </div>
          {bloqueo && bloqueo !== 'ninguno' ? (
            <input
              className="campo"
              placeholder="¿Qué falta exactamente? (opcional)"
              value={detalleBloqueo}
              onChange={(e) => setDetalleBloqueo(e.target.value)}
            />
          ) : null}
          {error ? <Aviso titulo="No se pudo guardar">{error}</Aviso> : null}
        </div>
        <div className="acciones acciones--linea">
          <Boton onClick={atras}>Atrás</Boton>
          <Boton variante="principal" disabled={!bloqueo || enviando} onClick={enviar}>
            {enviando ? 'Guardando…' : textoFinal}
          </Boton>
        </div>
      </div>
    )
  }

  return (
    <div className="campo-naranja hoja__contenido">
      <Contador total={totalPasos} actual={i} />

      <div className="hoja__cuerpo" key={i}>
        <div className="avanza">
          {i === 0 && entradilla ? <Aviso titulo="Ponerse al día">{entradilla}</Aviso> : null}

          <div className="fotograma fotograma--crece tinta">
            <h1 className="fotograma__titulo">{pieza.titulo}</h1>
            <Cinta sobreTinta>
              {pieza.marca}
              {pieza.cliente_nombre ? ` · ${pieza.cliente_nombre}` : ''} ·{' '}
              {ETIQUETAS_ESTADO[pieza.estado] || pieza.estado}
            </Cinta>
            {!d.desenlace && pieza.ultimo_punto ? (
              <div style={{ marginTop: 'calc(var(--paso) * 0.8)' }}>
                <Apunte etiqueta="Dónde quedaste">{pieza.ultimo_punto}</Apunte>
              </div>
            ) : null}
            {/* El sello: el gesto elegido, estampado sobre la pieza a tamaño de
                fotograma. Esto es «el estado es una marca» construido. */}
            {d.desenlace ? <SelloDe desenlace={d.desenlace} /> : null}
          </div>

          {d.desenlace ? (
            <div className="marcas">
              <Marca
                desenlace={DESENLACES.find((x) => x.id === d.desenlace)}
                elegida
                onClick={() => editar({ desenlace: null })}
              />
            </div>
          ) : (
            <div className="marcas marcas--llena">
              {DESENLACES.map((x) => (
                <Marca key={x.id} desenlace={x} onClick={() => marcar(x.id)} />
              ))}
            </div>
          )}

          {pideDetalle ? <Detalle pieza={pieza} d={d} editar={editar} /> : null}
        </div>
      </div>

      <div className="acciones acciones--linea">
        <Boton onClick={atras}>{i === 0 && onCancelar ? 'Salir' : 'Atrás'}</Boton>
        <Boton variante="principal" disabled={!d.desenlace} onClick={avanzar}>
          {i + 1 < piezas.length ? 'Siguiente' : 'Continuar'}
        </Boton>
      </div>
    </div>
  )
}

/**
 * «¿Qué más hiciste?» — el trabajo suelto del día.
 *
 * Fabián no produce dos o tres piezas con nombre: sus informes reales llevan
 * entre tres y nueve salidas, muchas en lote («5 videos para vault con IA»),
 * más trabajo recurrente que no es una pieza entregable —crear prompts,
 * investigar temas—. Sin esta pantalla el informe de la aplicación diría menos
 * que el mensaje que ya escribe a mano, y eso la convierte en un retroceso.
 *
 * Lo de ayer va primero y se repite de un toque, porque sus días se parecen
 * muchísimo entre sí. Recomponer la misma lista cada tarde es justo el trabajo
 * que esta aplicación existe para quitar.
 */
function ElResto({ trabajos, setTrabajos, ayer, total, actual, atras, seguir }) {
  const [tipo, setTipo] = useState(null)
  const [marca, setMarca] = useState('DAK')
  const [cantidad, setCantidad] = useState(1)

  const añadir = () => {
    if (!tipo) return
    setTrabajos((t) => [...t, { tipo, marca, cantidad }])
    setTipo(null)
    setCantidad(1)
  }

  const repetirAyer = () =>
    setTrabajos((t) => [
      ...t,
      ...ayer.map((a) => ({ tipo: a.tipo, marca: a.marca, cantidad: Number(a.cantidad) })),
    ])

  return (
    <div className="campo-naranja hoja__contenido">
      <Contador total={total} actual={actual} />
      <div className="hoja__cuerpo">
        <h1>¿Qué más hiciste?</h1>

        {trabajos.length > 0 ? (
          <div className="anotados">
            {trabajos.map((t, n) => (
              <button
                key={n}
                type="button"
                className="anotado"
                onClick={() => setTrabajos((x) => x.filter((_, k) => k !== n))}
                aria-label={`Quitar ${ETIQUETAS_TRABAJO[t.tipo]} de ${t.marca}`}
              >
                {t.cantidad > 1 ? `${t.cantidad} × ` : ''}
                {ETIQUETAS_TRABAJO[t.tipo]} · {t.marca} <span aria-hidden="true">✕</span>
              </button>
            ))}
          </div>
        ) : null}

        {ayer.length > 0 && trabajos.length === 0 ? (
          <button type="button" className="repetir tinta" onClick={repetirAyer}>
            Repetir lo de ayer
            <span className="repetir__detalle">
              {ayer
                .map(
                  (a) =>
                    `${Number(a.cantidad) > 1 ? a.cantidad + ' × ' : ''}${ETIQUETAS_TRABAJO[a.tipo]} ${a.marca}`
                )
                .join(' · ')}
            </span>
          </button>
        ) : null}

        <div className="fichas">
          {TIPOS_TRABAJO.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tipo === t.id ? 'ficha ficha--activa' : 'ficha tinta'}
              aria-pressed={tipo === t.id}
              onClick={() => setTipo(t.id)}
            >
              {t.texto}
            </button>
          ))}
        </div>

        {tipo ? (
          <div className="anadir">
            <div className="fichas">
              {MARCAS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={marca === m ? 'ficha ficha--activa' : 'ficha tinta'}
                  aria-pressed={marca === m}
                  onClick={() => setMarca(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="fichas">
              {[1, 2, 3, 5, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cantidad === n ? 'ficha ficha--activa cifra' : 'ficha tinta cifra'}
                  aria-pressed={cantidad === n}
                  aria-label={`${n} ${n === 1 ? 'unidad' : 'unidades'}`}
                  onClick={() => setCantidad(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <Boton variante="principal" onClick={añadir}>
              Anotar {cantidad > 1 ? `${cantidad} × ` : ''}
              {ETIQUETAS_TRABAJO[tipo]} de {marca}
            </Boton>
          </div>
        ) : null}
      </div>

      <div className="acciones acciones--linea">
        <Boton onClick={atras}>Atrás</Boton>
        <Boton variante="principal" onClick={seguir}>
          {trabajos.length > 0 ? 'Seguir' : 'Nada más'}
        </Boton>
      </div>
    </div>
  )
}

/**
 * El detalle, sólo cuando aporta.
 *
 * El marcador de posición es el último punto CONOCIDO, no un ejemplo inventado:
 * dejarlo vacío no pierde nada, que es lo que «menos escribir, más confirmar»
 * quiere decir.
 */
function Detalle({ pieza, d, editar }) {
  if (d.desenlace === 'continuo') {
    /*
     * El valor anterior va FUERA del campo, como dato, y el campo lleva su
     * propia etiqueta.
     *
     * Estuvo como marcador de posición: los dos recuadros blancos sólo
     * contenían el valor de ayer en gris, así que se leían como campos ya
     * rellenados. El riesgo no era estético — Fabián se los salta creyendo que
     * está guardado, y en la pantalla donde tiene diez segundos y un pulgar eso
     * pierde el trabajo del día. Además, en cuanto empezaba a escribir,
     * desaparecía lo único que decía qué era cada campo.
     */
    return (
      <div className="detalles">
        <label className="detalle">
          <span className="detalle__etiqueta">Dónde quedaste</span>
          {pieza.ultimo_punto ? (
            <span className="detalle__previo">Ahora dice: {pieza.ultimo_punto}</span>
          ) : null}
          <textarea
            className="campo"
            rows={2}
            placeholder="Escribe sólo si cambió"
            value={d.nota || ''}
            onChange={(e) => editar({ nota: e.target.value })}
          />
        </label>
        <label className="detalle">
          <span className="detalle__etiqueta">Siguiente paso</span>
          {pieza.siguiente_paso ? (
            <span className="detalle__previo">Ahora dice: {pieza.siguiente_paso}</span>
          ) : null}
          <input
            className="campo"
            placeholder="Escribe sólo si cambió"
            value={d.siguiente_paso || ''}
            onChange={(e) => editar({ siguiente_paso: e.target.value })}
          />
        </label>
      </div>
    )
  }

  if (d.desenlace === 'bloqueado') {
    return (
      <div className="fichas">
        {TIPOS_BLOQUEO.map((t) => (
          <button
            key={t.id}
            type="button"
            className={d.tipo_bloqueo === t.id ? 'ficha ficha--activa' : 'ficha tinta'}
            aria-pressed={d.tipo_bloqueo === t.id}
            onClick={() => editar({ tipo_bloqueo: t.id, motivo: d.motivo || t.texto })}
          >
            {t.texto}
          </button>
        ))}
      </div>
    )
  }

  return (
    <input
      className="campo"
      placeholder="¿Por qué se pausa? (opcional)"
      value={d.motivo || ''}
      onChange={(e) => editar({ motivo: e.target.value })}
    />
  )
}

/* ══ Los dos usos de la secuencia ═════════════════════════════════════════*/

/** §13 — el día que nadie cerró. Sale antes que nada y no se puede saltar. */
function Reconciliar({ estado, recargar }) {
  const [error, setError] = useState(null)
  const dias = estado.reconciliar.jornadas

  const enviar = async (desenlaces) => {
    setError(null)
    try {
      await api.reconciliar({ desenlaces })
      await recargar()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Secuencia
      piezas={estado.reconciliar.piezas}
      entradilla={
        dias.length === 1
          ? `El ${fechaLarga(dias[0].fecha)} quedó sin cerrar. Nada se dio por hecho: todo sigue como estaba.`
          : `Hay ${dias.length} días sin cerrar. Nada se dio por hecho: todo sigue como estaba.`
      }
      onEnviar={enviar}
      textoFinal="Ponerse al día"
      error={error}
    />
  )
}

/** §9 — el cierre. La pantalla que de verdad importa. */
function Cierre({ estado, volver, recargar }) {
  const [error, setError] = useState(null)
  const [hecho, setHecho] = useState(null)

  const enviar = async (desenlaces, bloqueos, trabajos) => {
    setError(null)
    try {
      setHecho(await api.cerrarJornada({ desenlaces, bloqueos, trabajos }))
    } catch (e) {
      setError(e.message)
    }
  }

  if (hecho) return <TrasElCierre datos={hecho} recargar={recargar} />

  return (
    <Secuencia
      piezas={estado.plan_congelado}
      onEnviar={enviar}
      onCancelar={volver}
      textoFinal="Cerrar el día"
      error={error}
      // El trabajo suelto sólo se pregunta en el cierre del día. La
      // reconciliación resuelve días PASADOS, y pedirle a alguien que
      // reconstruya de memoria cuántos videos generó el martes es justo el tipo
      // de dato inventado que esta aplicación no quiere.
      conTrabajos
      trabajosAyer={estado.trabajos_ayer || []}
    />
  )
}

/* ══ Después ══════════════════════════════════════════════════════════════*/

function TrasElCierre({ datos, recargar }) {
  const manana = datos.plan_manana.slice(0, 2)
  return (
    <div className="campo-naranja hoja__contenido">
      <div className="hoja__cuerpo">
        <h1>Mañana empiezas aquí</h1>
        {manana.map((l) => (
          <div key={l.pieza.id} className="fotograma tinta">
            <h2 className="fotograma__titulo">{l.pieza.titulo}</h2>
            <Cinta sobreTinta>
              {l.rol === 'continuar' ? 'Continuar' : 'Después'} · {l.pieza.marca}
            </Cinta>
          </div>
        ))}
        <Informe texto={datos.informe.texto} />
      </div>
      <div className="acciones">
        <Boton onClick={recargar}>Listo</Boton>
      </div>
    </div>
  )
}

function DiaCerrado({ estado }) {
  return (
    <div className="campo-naranja hoja__contenido">
      <div className="hoja__cuerpo">
        <h1>Día cerrado</h1>
        <p className="etiqueta">{fechaLarga(estado.jornada.fecha)}</p>
        {estado.resumen ? <Informe texto={estado.resumen.texto} /> : null}
      </div>
      <div className="acciones" />
    </div>
  )
}

/**
 * El informe: la cola de la tira, que se arranca por la perforación.
 *
 * Lo compone el servidor, así que el texto que se pega en WhatsApp es idéntico
 * venga de donde venga.
 */
function Informe({ texto }) {
  const [copiado, setCopiado] = useState(false)
  const t = useRef(null)
  useEffect(() => () => clearTimeout(t.current), [])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      t.current = setTimeout(() => setCopiado(false), 2200)
    } catch {
      // Sin permiso de portapapeles el texto sigue a la vista y se puede
      // seleccionar a mano. No se rompe nada.
      setCopiado(false)
    }
  }

  return (
    <div style={{ minHeight: 0, display: 'grid', gap: '3px' }}>
      <div className="cola">
        <pre className="cola__texto">{texto}</pre>
      </div>
      <Boton onClick={copiar}>{copiado ? 'Copiado' : 'Copiar informe'}</Boton>
    </div>
  )
}
