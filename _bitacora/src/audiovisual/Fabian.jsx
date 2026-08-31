import { useState } from 'react'
import { api } from '../api.js'
import { Aviso, Boton, Cargando, Dato, Estado, fechaLarga, hace } from '../ui.jsx'

/**
 * La concha de Fabián. Móvil, una columna, botones grandes.
 *
 * No hay router: la pantalla la decide el `modo` que devuelve el servidor. Eso
 * es deliberado — el estado de la jornada vive en la base, no en la URL, así
 * que recargar en cualquier momento cae siempre donde toca y no hay forma de
 * llegar a mano a una pantalla que no corresponde.
 */
export default function Fabian({ estado, recargar }) {
  const [cerrando, setCerrando] = useState(false)

  if (estado.modo === 'reconciliar') {
    return <Reconciliar estado={estado} recargar={recargar} />
  }
  if (estado.modo === 'plan') {
    return <InicioDeJornada estado={estado} recargar={recargar} />
  }
  if (estado.modo === 'cerrada') {
    return <DiaCerrado estado={estado} />
  }
  if (cerrando) {
    return <Cierre estado={estado} recargar={recargar} volver={() => setCerrando(false)} />
  }
  return <EnMarcha estado={estado} alCerrar={() => setCerrando(true)} />
}

/* ── Los cinco desenlaces ──────────────────────────────────────────────────
 *
 * Lenguaje humano, no nombres de estado. Fabián no debería tener que pensar en
 * qué es «REVISION»: pulsa «Terminé mi parte» y el servidor sabe qué significa.
 *
 * «Terminé mi parte» y no «Terminé»: él nunca cierra una pieza, la manda a
 * revisión. Que el botón lo diga evita la decepción de creer que algo quedó
 * cerrado cuando sigue esperando a alguien.
 */
const DESENLACES = [
  { id: 'continuo', icono: '▶️', texto: 'Continúo' },
  { id: 'termine', icono: '✅', texto: 'Terminé mi parte' },
  { id: 'pause', icono: '⏸', texto: 'Pausé' },
  { id: 'bloqueado', icono: '🚫', texto: 'Estoy bloqueado' },
  { id: 'no_trabaje', icono: '↪', texto: 'No trabajé esto' },
]

const TIPOS_BLOQUEO = [
  { id: 'falta_material', texto: 'Falta material' },
  { id: 'esperando_aprobacion', texto: 'Esperando aprobación' },
  { id: 'esperando_cliente', texto: 'Esperando cliente' },
  { id: 'falta_recurso', texto: 'Falta recurso' },
  { id: 'problema_tecnico', texto: 'Problema técnico' },
  { id: 'otro', texto: 'Otro' },
]

/**
 * Una pieza a resolver: los cinco botones y, si hace falta, el detalle.
 *
 * El campo de texto solo aparece cuando aporta algo, y siempre con el último
 * punto conocido delante y un «sin cambios» por defecto. La regla del encargo
 * es «menos escribir, más confirmar»: escribir tiene que ser la excepción.
 */
function ResolverPieza({ pieza, valor, alCambiar }) {
  const d = valor || {}
  const pideNota = d.desenlace === 'continuo'
  const pideMotivo = d.desenlace === 'pause' || d.desenlace === 'bloqueado'

  return (
    <article className="tarjeta pieza">
      <header className="pieza__cabecera">
        <div>
          <span className="pieza__marca">{pieza.marca}</span>
          <h3 className="pieza__titulo">{pieza.titulo}</h3>
        </div>
        <Estado valor={pieza.estado} />
      </header>

      {pieza.ultimo_punto ? (
        <Dato etiqueta="Último punto">{pieza.ultimo_punto}</Dato>
      ) : null}
      {pieza.siguiente_paso ? (
        <Dato etiqueta="Siguiente paso">{pieza.siguiente_paso}</Dato>
      ) : null}

      <div className="desenlaces">
        {DESENLACES.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`desenlace ${d.desenlace === x.id ? 'desenlace--activo' : ''}`}
            aria-pressed={d.desenlace === x.id}
            onClick={() => alCambiar({ ...d, desenlace: x.id })}
          >
            <span className="desenlace__icono" aria-hidden="true">{x.icono}</span>
            {x.texto}
          </button>
        ))}
      </div>

      {pideNota ? (
        <div className="detalle">
          <label className="detalle__etiqueta" htmlFor={`nota-${pieza.id}`}>
            ¿Dónde quedaste? <span className="opcional">opcional — si no cambia, déjalo vacío</span>
          </label>
          <textarea
            id={`nota-${pieza.id}`}
            className="campo-texto"
            rows={2}
            placeholder={pieza.ultimo_punto || 'Ej. escenas 5-6 montadas'}
            value={d.nota || ''}
            onChange={(e) => alCambiar({ ...d, nota: e.target.value })}
          />
          <input
            className="campo-texto"
            placeholder={pieza.siguiente_paso || 'Y mañana toca… (opcional)'}
            value={d.siguiente_paso || ''}
            onChange={(e) => alCambiar({ ...d, siguiente_paso: e.target.value })}
          />
        </div>
      ) : null}

      {pideMotivo ? (
        <div className="detalle">
          {d.desenlace === 'bloqueado' ? (
            <div className="chips">
              {TIPOS_BLOQUEO.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip ${d.tipo_bloqueo === t.id ? 'chip--activo' : ''}`}
                  aria-pressed={d.tipo_bloqueo === t.id}
                  onClick={() => alCambiar({ ...d, tipo_bloqueo: t.id, motivo: d.motivo || t.texto })}
                >
                  {t.texto}
                </button>
              ))}
            </div>
          ) : null}
          <input
            className="campo-texto"
            placeholder={d.desenlace === 'pause' ? '¿Por qué se pausa?' : 'Detalle del bloqueo (opcional)'}
            value={d.motivo || ''}
            onChange={(e) => alCambiar({ ...d, motivo: e.target.value })}
          />
        </div>
      ) : null}
    </article>
  )
}

/** Estado compartido por las dos pantallas que resuelven piezas. */
function useDesenlaces(piezas) {
  const [mapa, setMapa] = useState({})
  const listo = piezas.every((p) => mapa[p.id]?.desenlace)
  const cambiar = (id, v) => setMapa((m) => ({ ...m, [id]: v }))
  const comoLista = () =>
    piezas.map((p) => ({ pieza_id: p.id, ...mapa[p.id] }))
  return { mapa, listo, cambiar, comoLista }
}

/**
 * §13 — el día que nadie cerró.
 *
 * Sale antes que el plan de hoy y no se puede saltar. El plan de hoy se calcula
 * a partir de unos estados que, hasta resolver esto, no son de fiar.
 */
function Reconciliar({ estado, recargar }) {
  const piezas = estado.reconciliar.piezas
  const dias = estado.reconciliar.jornadas
  const { listo, mapa, cambiar, comoLista } = useDesenlaces(piezas)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async () => {
    setEnviando(true)
    setError(null)
    try {
      await api.reconciliar({ desenlaces: comoLista() })
      await recargar()
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <>
      <p className="rotulo">Antes de empezar</p>
      <h1>
        {dias.length === 1
          ? `El ${fechaLarga(dias[0].fecha)} quedó sin cerrar.`
          : `Hay ${dias.length} días sin cerrar.`}
      </h1>
      <p className="entradilla">
        No se dio nada por hecho: estas tareas siguen como estaban. Dinos qué pasó con cada una.
      </p>

      {piezas.map((p) => (
        <ResolverPieza key={p.id} pieza={p} valor={mapa[p.id]} alCambiar={(v) => cambiar(p.id, v)} />
      ))}

      {error ? <Aviso>{error}</Aviso> : null}

      <div className="acciones">
        <Boton variante="principal" disabled={!listo || enviando} onClick={enviar}>
          {enviando ? 'Guardando…' : listo ? 'Listo, seguir' : 'Falta responder alguna'}
        </Boton>
      </div>
    </>
  )
}

/** §6 — inicio de turno. Diez o veinte segundos, y sin escribir nada. */
function InicioDeJornada({ estado, recargar }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const plan = estado.plan

  const comenzar = async () => {
    setEnviando(true)
    setError(null)
    try {
      await api.abrirJornada({})
      await recargar()
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <>
      <p className="rotulo">{saludo()}</p>
      <h1>Tu plan de hoy</h1>

      {plan.length === 0 ? (
        <Aviso tono="neutro">
          No hay nada en cola para producir. Toca una ronda nueva de referencias con la socia.
        </Aviso>
      ) : (
        plan.map((l) => (
          <article key={l.pieza.id} className="tarjeta pieza">
            <header className="pieza__cabecera">
              <div>
                <span className="pieza__marca">
                  {l.orden}. {l.rol === 'continuar' ? 'Continuar' : 'Después'} · {l.pieza.marca}
                </span>
                <h3 className="pieza__titulo">{l.pieza.titulo}</h3>
              </div>
              <Estado valor={l.pieza.estado} />
            </header>
            {l.nota_plan ? <p className="pieza__nota">{l.nota_plan}</p> : null}
            {l.rol === 'continuar' ? (
              <>
                <Dato etiqueta="Último punto">{l.pieza.ultimo_punto}</Dato>
                <Dato etiqueta="Siguiente paso">{l.pieza.siguiente_paso}</Dato>
              </>
            ) : null}
          </article>
        ))
      )}

      <ColaBaja cola={estado.cola} />
      {error ? <Aviso>{error}</Aviso> : null}

      <div className="acciones">
        <Boton variante="principal" disabled={enviando || plan.length === 0} onClick={comenzar}>
          {enviando ? 'Empezando…' : 'Comenzar jornada'}
        </Boton>
      </div>
    </>
  )
}

/** Durante el día no hay que tocar nada. Esta pantalla solo recuerda dónde vas. */
function EnMarcha({ estado, alCerrar }) {
  const plan = estado.plan_congelado
  const actual = plan[0]

  return (
    <>
      <p className="rotulo">Jornada en marcha</p>
      <h1>{actual ? actual.titulo : 'Sin tarea principal'}</h1>

      {actual ? (
        <article className="tarjeta">
          <Dato etiqueta="Marca">{actual.marca}</Dato>
          <Dato etiqueta="Último punto">{actual.ultimo_punto}</Dato>
          <Dato etiqueta="Siguiente paso">{actual.siguiente_paso}</Dato>
        </article>
      ) : null}

      {plan.length > 1 ? (
        <>
          <p className="rotulo separador">Después</p>
          {plan.slice(1).map((p) => (
            <article key={p.id} className="tarjeta tarjeta--tenue">
              <header className="pieza__cabecera">
                <div>
                  <span className="pieza__marca">{p.marca}</span>
                  <h3 className="pieza__titulo">{p.titulo}</h3>
                </div>
                <Estado valor={p.estado} />
              </header>
            </article>
          ))}
        </>
      ) : null}

      <ColaBaja cola={estado.cola} />

      <div className="acciones">
        <Boton variante="principal" onClick={alCerrar}>
          Hacer cierre del día
        </Boton>
      </div>
    </>
  )
}

/** §9 — la pantalla más importante del trabajador. */
function Cierre({ estado, recargar, volver }) {
  const piezas = estado.plan_congelado
  const { listo, mapa, cambiar, comoLista } = useDesenlaces(piezas)
  const [bloqueo, setBloqueo] = useState(null)
  const [detalleBloqueo, setDetalleBloqueo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [informe, setInforme] = useState(null)

  const enviar = async () => {
    setEnviando(true)
    setError(null)
    try {
      const r = await api.cerrarJornada({
        desenlaces: comoLista(),
        bloqueos: bloqueo && bloqueo !== 'ninguno'
          ? [{ tipo: bloqueo, detalle: detalleBloqueo || null }]
          : [],
      })
      setInforme(r)
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  if (informe) {
    return <TrasElCierre datos={informe} recargar={recargar} />
  }

  return (
    <>
      <p className="rotulo">Cierre del día</p>
      <h1>¿Qué pasó?</h1>

      {piezas.map((p) => (
        <ResolverPieza key={p.id} pieza={p} valor={mapa[p.id]} alCambiar={(v) => cambiar(p.id, v)} />
      ))}

      <p className="rotulo separador">¿Tienes algún bloqueo?</p>
      <div className="chips">
        <button
          type="button"
          className={`chip ${bloqueo === 'ninguno' ? 'chip--activo' : ''}`}
          aria-pressed={bloqueo === 'ninguno'}
          onClick={() => setBloqueo('ninguno')}
        >
          ✅ Ninguno
        </button>
        {TIPOS_BLOQUEO.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${bloqueo === t.id ? 'chip--activo' : ''}`}
            aria-pressed={bloqueo === t.id}
            onClick={() => setBloqueo(t.id)}
          >
            {t.texto}
          </button>
        ))}
      </div>
      {bloqueo && bloqueo !== 'ninguno' ? (
        <input
          className="campo-texto"
          placeholder="¿Qué falta exactamente? (opcional)"
          value={detalleBloqueo}
          onChange={(e) => setDetalleBloqueo(e.target.value)}
        />
      ) : null}

      {error ? <Aviso>{error}</Aviso> : null}

      <div className="acciones">
        <Boton variante="principal" disabled={!listo || !bloqueo || enviando} onClick={enviar}>
          {enviando ? 'Cerrando…' : !listo ? 'Falta responder alguna' : !bloqueo ? 'Responde lo del bloqueo' : 'Cerrar el día'}
        </Boton>
        <Boton onClick={volver}>Volver</Boton>
      </div>
    </>
  )
}

/** §11 y §14 — el plan de mañana y el informe, ya generados. */
function TrasElCierre({ datos, recargar }) {
  return (
    <>
      <p className="rotulo">Listo por hoy</p>
      <h1>Mañana empiezas por aquí</h1>

      {datos.plan_manana.map((l) => (
        <article key={l.pieza.id} className="tarjeta tarjeta--tenue">
          <header className="pieza__cabecera">
            <div>
              <span className="pieza__marca">
                {l.orden}. {l.rol === 'continuar' ? 'Continuar' : 'Después'} · {l.pieza.marca}
              </span>
              <h3 className="pieza__titulo">{l.pieza.titulo}</h3>
            </div>
          </header>
          {l.nota_plan ? <p className="pieza__nota">{l.nota_plan}</p> : null}
        </article>
      ))}

      <Informe texto={datos.informe.texto} />

      <div className="acciones">
        <Boton onClick={recargar}>Volver al inicio</Boton>
      </div>
    </>
  )
}

function DiaCerrado({ estado }) {
  return (
    <>
      <p className="rotulo">Jornada cerrada</p>
      <h1>Ya cerraste el {fechaLarga(estado.jornada.fecha)}.</h1>
      {estado.resumen ? <Informe texto={estado.resumen.texto} /> : null}
    </>
  )
}

/** El informe copiable. Lo genera el servidor: así el texto es idéntico venga de donde venga. */
function Informe({ texto }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2200)
    } catch {
      // Sin permiso de portapapeles el texto sigue estando a la vista y se
      // puede seleccionar a mano. No se rompe nada.
      setCopiado(false)
    }
  }

  return (
    <section className="informe">
      <p className="rotulo separador">Informe del día</p>
      <pre className="informe__texto">{texto}</pre>
      <Boton onClick={copiar}>{copiado ? '✓ Copiado' : 'Copiar informe'}</Boton>
    </section>
  )
}

/** §18 — avisar cuando se está acabando el contenido aprobado. */
function ColaBaja({ cola }) {
  if (!cola?.baja) return null
  return (
    <Aviso tono="atencion">
      Quedan {cola.accionables} piezas por producir. Toca una ronda nueva de referencias.
    </Aviso>
  )
}

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}
