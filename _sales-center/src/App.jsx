import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Intro, { tocaIntro } from './Intro'
import {
  getBaseHealth,
  getDisplayName,
  getOpener,
  getProspects,
  getShortName,
  diasDesde,
  estaEstancado,
  resumenAntiguedad,
  puedeEscribir,
  escribirEnHoja,
  getTodayActions,
  loadSalesData,
} from './lib/sales'

const VIEWS = [
  { id: 'inicio', label: 'Inicio', icon: 'panorama' },
  { id: 'hoy', label: 'Hoy', icon: 'today' },
  { id: 'prospectos', label: 'Prospectos', icon: 'prospects' },
  { id: 'base', label: 'Base', icon: 'database' },
  { id: 'como-funciona', label: 'Cómo funciona', icon: 'info' },
]

const stages = {
  investigado: 'Investigado',
  'con-mensaje': 'Con mensaje',
  'por-aprobar': 'Por aprobar',
  'por-enviar': 'Por enviar',
  enviado: 'Enviado',
  respondido: 'Respondido',
  descartado: 'Descartado',
}

const missing = 'sin dato'

/**
 * Los enums de control se traducen AL PINTAR, nunca en el dato.
 *
 * El contrato con Twin es explicito: los valores de maquina siguen en ingles y
 * el frontend los traduce para mostrar. Traducirlos al leer parece mas comodo y
 * es una trampa — lo hice con el glosario y deje muerto el marcador de
 * prioridad, porque el codigo buscaba PRIORITY OUTREACH y el dato ya decia
 * «Contacto prioritario». El fallo no daba error: simplemente el oro dejo de
 * aparecer y nadie se entera hasta que lo mira alguien.
 */
const ENUMS = {
  'PRIORITY OUTREACH': 'Contacto prioritario',
  READY: 'Listo',
  STRONG: 'Señal fuerte',
  QUALIFIED: 'Calificado',
  WARM: 'Tibio',
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
  SMALL: 'Chico',
  UNKNOWN: 'Sin confirmar',
  APPROVED: 'Aprobado',
  PENDING: 'Pendiente',
  REJECTED: 'Rechazado',
  SENT: 'Enviado',
  'NOT SENT': 'Sin enviar',
  'NO REPLY': 'Sin respuesta',
  REPLIED: 'Respondió',
  'FULL AGENCY PROSPECT': 'Agencia completa',
  'SPECIALIZED SUPPORT PROSPECT': 'Soporte especializado',
}
const traducirEnum = (v) => v == null ? missing : (ENUMS[v] ?? v)

function valueOrMissing(value) {
  return value === null || value === undefined || value === '' ? missing : value
}

function formatDate(value) {
  if (!value) return missing
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatPercent(value) {
  return value === null || value === undefined
    ? missing
    : new Intl.NumberFormat('es-PE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(value)
}

function getHref(value) {
  if (!value) return null
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function Icon({ name, size = 16 }) {
  const paths = {
    panorama: (
      <>
        <rect height="7" rx="1.5" width="7" x="3" y="3" />
        <rect height="7" rx="1.5" width="7" x="14" y="3" />
        <rect height="7" rx="1.5" width="7" x="3" y="14" />
        <rect height="7" rx="1.5" width="7" x="14" y="14" />
      </>
    ),
    today: <path d="M4 6h16M4 12h10M4 18h6" />,
    prospects: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 10h16M10 10v9" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    arrow: <path d="M5 19 19 5M9 5h10v10" />,
    copy: (
      <>
        <rect width="12" height="12" x="8" y="8" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    buscar: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    cerrar: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    retry: (
      <>
        <path d="M20 11a8 8 0 1 0 2.2 5.5" />
        <path d="M20 4v7h-7" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths[name]}
    </svg>
  )
}

/**
 * Adonde ir para mirar a la empresa por tu cuenta antes de decidir.
 *
 * Los huecos SE ENSEÑAN, y eso cambio a proposito. Antes se ocultaban por no
 * meter ruido, pero resulta que el hueco es el dato accionable: dice exactamente
 * que pedirle al agente que rellena la hoja. Un Instagram que falta no es un
 * espacio en blanco, es una tarea.
 */
function EnlacesEmpresa({ prospect }) {
  const redes = prospect.contacto?.redes ?? {}
  const todos = [
    { etiqueta: 'Web', href: getHref(prospect.web) },
    { etiqueta: 'Google Maps', href: getHref(prospect.mapsUrl) },
    { etiqueta: 'Instagram', href: getHref(redes.instagram) },
    { etiqueta: 'Facebook', href: getHref(redes.facebook) },
    { etiqueta: 'TikTok', href: getHref(redes.tiktok) },
    { etiqueta: 'LinkedIn', href: getHref(redes.linkedin) },
  ]
  const hay = todos.filter((e) => e.href)
  const faltan = todos.filter((e) => !e.href).map((e) => e.etiqueta)

  return (
    <div className="company-links">
      <span className="context-label">Mirar a la empresa</span>
      <p>
        {hay.map((enlace) => (
          <a href={enlace.href} key={enlace.etiqueta} rel="noreferrer noopener" target="_blank">
            {enlace.etiqueta}
            <Icon name="arrow" size={12} />
          </a>
        ))}
        {/* Los huecos se enseñan a proposito. Antes se ocultaban por no meter
            ruido, pero el hueco ES el dato accionable: dice exactamente que
            pedirle al agente que rellena la hoja. Van apagados, sin enlace. */}
        {faltan.map((etiqueta) => (
          <span className="company-links__falta" key={etiqueta}>{etiqueta}</span>
        ))}
      </p>
      {faltan.length > 0 && (
        <p className="company-links__nota">
          {/* «Sin verificar todavía», no «falta». El contrato con Twin dice que
              solo escribe perfiles que confirma, así que una celda vacía es un
              estado legítimo del proceso y no un error de nadie. */}
          {faltan.length === todos.length
            ? 'Sin perfiles verificados todavía. Twin solo escribe los que confirma.'
            : `Sin verificar todavía: ${faltan.join(', ')}.`}
        </p>
      )}
    </div>
  )
}

/**
 * Cuanto pesa el negocio, en tres muescas. HIGH tres, MEDIUM dos, SMALL una.
 *
 * Es el segundo eje, y hace falta: la lista se ordena por preparacion, asi que
 * Acuña sale arriba con 94 aunque su potencial sea SMALL, mientras ARKANA —el
 * unico HIGH del lote— queda por debajo. Sin esto, el orden miente sobre cual
 * es la mejor conversacion.
 *
 * Va en hueso, nunca en oro: el oro ya significa "esto te esta esperando" y si
 * empieza a significar tambien "esto es grande", deja de significar nada.
 */
function PotentialGauge({ value }) {
  const niveles = { HIGH: 3, MEDIUM: 2, SMALL: 1 }
  const lleno = niveles[value] ?? 0
  if (!lleno) return null

  const etiqueta = { HIGH: 'Potencial alto', MEDIUM: 'Potencial medio', SMALL: 'Potencial chico' }[value]
  return (
    <span aria-label={etiqueta} className="potential-gauge" role="img" title={etiqueta}>
      {[1, 2, 3].map((paso) => (
        <i className={paso <= lleno ? 'is-on' : ''} key={paso} />
      ))}
    </span>
  )
}

/**
 * Los botones que escriben en la hoja.
 *
 * Es la unica parte del panel que no es de solo lectura, y esta deliberadamente
 * acotada: dos acciones, sobre dos columnas, con el resultado dicho en la misma
 * fila donde se pulso.
 *
 * No hay optimismo aqui. Hasta que la hoja no confirma, no se dice que se hizo:
 * un panel que da por buena una escritura que fallo es peor que uno de solo
 * lectura, porque te hace creer que el trabajo ya esta registrado.
 *
 * Si el puente no esta configurado, este bloque no existe y la ficha se queda
 * con el enlace a la hoja de siempre.
 */
function AccionesHoja({ prospect, readyToSend }) {
  const [estado, setEstado] = useState({ fase: 'listo', mensaje: null })

  if (!puedeEscribir || !prospect.empresa) return null

  const lanzar = async (accion, valor, etiquetaHecho) => {
    setEstado({ fase: 'enviando', mensaje: null })
    const resultado = await escribirEnHoja({ accion, empresa: prospect.empresa, valor })
    setEstado(
      resultado.ok
        ? { fase: 'hecho', mensaje: `${etiquetaHecho} · la hoja tenía «${resultado.anterior || 'vacío'}»` }
        : { fase: 'fallo', mensaje: resultado.error ?? 'La hoja rechazó el cambio.' },
    )
  }

  const trabajando = estado.fase === 'enviando'

  return (
    <div className="sheet-actions">
      <span className="context-label">Registrar en la hoja</span>
      <div className="sheet-actions__row">
        {readyToSend ? (
          <button className="sheet-button sheet-button--principal" disabled={trabajando} onClick={() => lanzar('enviar', 'SENT', 'Marcado como enviado')} type="button">
            {trabajando ? 'Guardando…' : 'Marcar como enviado'}
          </button>
        ) : (
          <>
            <button className="sheet-button sheet-button--principal" disabled={trabajando} onClick={() => lanzar('aprobar', 'APPROVED', 'Aprobado')} type="button">
              {trabajando ? 'Guardando…' : 'Aprobar'}
            </button>
            <button className="sheet-button" disabled={trabajando} onClick={() => lanzar('aprobar', 'REJECTED', 'Rechazado')} type="button">
              Rechazar
            </button>
          </>
        )}
      </div>
      {estado.mensaje && (
        <p aria-live="polite" className={`sheet-actions__result ${estado.fase === 'fallo' ? 'is-fallo' : ''}`}>
          {estado.mensaje}
        </p>
      )}
      {estado.fase === 'hecho' && (
        <p className="sheet-actions__note">
          El panel sigue mostrando los datos de ejemplo hasta la próxima lectura de la hoja.
        </p>
      )}
    </div>
  )
}

/**
 * Volver a la lista. Solo existe en movil.
 *
 * En el telefono la lista y la ficha son dos pantallas, no una encima de otra.
 * Apiladas, tocar una fila no parecia hacer nada: la ficha se dibujaba fuera de
 * pantalla y habia que adivinar que tocaba bajar. Con dos pantallas el gesto es
 * el de cualquier bandeja de correo — entras y vuelves.
 */
function BotonVolver({ onClick, titulo }) {
  return (
    <button className="volver" onClick={onClick} type="button">
      <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" width="16">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{titulo}</span>
    </button>
  )
}

/**
 * Agencia completa o soporte especializado.
 *
 * Es la pregunta central del sistema comercial nuevo: ¿podemos ser LA agencia
 * de esta empresa, o solo entrar por una pieza concreta? Son dos conversaciones
 * distintas y dos mensajes distintos, y hasta ahora el panel no las separaba.
 *
 * Agencia completa va en oro porque es lo que hay que perseguir. Soporte va en
 * hueso: sigue valiendo, pero no es lo mismo.
 */
function TipoOportunidad({ tipo, derivada }) {
  if (!tipo) return null
  const completa = tipo === 'Agencia completa'
  return (
    <span
      className={`tipo-badge ${completa ? 'tipo-badge--completa' : ''}`}
      title={derivada ? 'Clasificación deducida por el panel; la hoja todavía no trae esta columna.' : undefined}
    >
      {tipo}
      {derivada && <i aria-label="deducido por el panel">·</i>}
    </span>
  )
}

/** Cuanto puede DAK liderar el crecimiento de esta empresa, de 1 a 5. */
function EscalaLiderazgo({ valor }) {
  if (!valor) return null
  return (
    <span aria-label={`Potencial para que DAK lidere: ${valor} de 5`} className="escala-liderazgo" role="img">
      {[1, 2, 3, 4, 5].map((paso) => <i className={paso <= valor ? 'is-on' : ''} key={paso} />)}
      <b>{valor}/5</b>
    </span>
  )
}

/**
 * La lectura comercial: si DAK puede ser la agencia o solo entrar por una pieza.
 *
 * Va marcada como deducida mientras la hoja no traiga sus columnas. No es un
 * detalle legal: si el equipo la toma por dato de Twin y resulta que la dedujo
 * el panel, la proxima vez no se creera nada de lo que hay en pantalla.
 */
function Clasificacion({ prospect }) {
  if (!prospect.tipoOportunidad) return null

  return (
    <div className="clasificacion">
      <span className="context-label">
        Lectura comercial
        {prospect.clasificacionDerivada && <em> · deducida por el panel</em>}
      </span>

      <div className="clasificacion__cabeza">
        <TipoOportunidad derivada={prospect.clasificacionDerivada} tipo={prospect.tipoOportunidad} />
        <EscalaLiderazgo valor={prospect.potencialLiderazgo} />
      </div>

      <dl className="clasificacion__datos">
        <div>
          <dt>Riesgo de agencia existente</dt>
          <dd>{traducirEnum(prospect.riesgoAgenciaExistente)}</dd>
        </div>
        <div>
          <dt>Entrada recomendada</dt>
          <dd>{valueOrMissing(prospect.anguloEntrada)}</dd>
        </div>
      </dl>
    </div>
  )
}

/**
 * El mensaje, y ahora tambien su edicion.
 *
 * En reposo es texto, no un campo: un formulario permanente invita a toquetear
 * y aqui lo normal es leer y aprobar, no reescribir. Se entra a editar a
 * proposito, y al guardar se escribe en la hoja.
 *
 * Guardar NO aprueba. Son dos decisiones distintas —cambiar el texto y darlo
 * por bueno— y juntarlas haria que corregir una tilde aprobara el mensaje.
 */
function EditorMensaje({ empresa, texto }) {
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(texto ?? '')
  const [estado, setEstado] = useState({ fase: 'listo', mensaje: null })
  const [guardado, setGuardado] = useState(null)

  const actual = guardado ?? texto
  const editable = puedeEscribir && Boolean(empresa) && Boolean(texto)

  const guardar = async () => {
    setEstado({ fase: 'guardando', mensaje: null })
    const resultado = await escribirEnHoja({ accion: 'editar', empresa, valor: borrador })
    if (resultado.ok) {
      setGuardado(borrador)
      setEditando(false)
      setEstado({ fase: 'hecho', mensaje: 'Guardado en la hoja.' })
    } else {
      setEstado({ fase: 'fallo', mensaje: resultado.error ?? 'La hoja rechazó el cambio.' })
    }
  }

  return (
    <div className="message-card__message">
      <span className="context-label">
        Mensaje tal como se enviaría
        {editable && !editando && (
          <button className="editar-link" onClick={() => { setBorrador(actual); setEditando(true); setEstado({ fase: 'listo', mensaje: null }) }} type="button">
            Editar
          </button>
        )}
      </span>

      {editando ? (
        <>
          <textarea
            className="message-editor"
            onChange={(evento) => setBorrador(evento.target.value)}
            rows={Math.min(14, Math.max(5, Math.ceil(borrador.length / 60)))}
            value={borrador}
          />
          <div className="message-editor__acciones">
            <button className="sheet-button sheet-button--principal" disabled={estado.fase === 'guardando' || borrador === actual} onClick={guardar} type="button">
              {estado.fase === 'guardando' ? 'Guardando…' : 'Guardar en la hoja'}
            </button>
            <button className="sheet-button" disabled={estado.fase === 'guardando'} onClick={() => { setEditando(false); setEstado({ fase: 'listo', mensaje: null }) }} type="button">
              Descartar
            </button>
          </div>
        </>
      ) : (
        <p>{valueOrMissing(actual)}</p>
      )}

      {estado.mensaje && (
        <p aria-live="polite" className={`sheet-actions__result ${estado.fase === 'fallo' ? 'is-fallo' : ''}`}>
          {estado.mensaje}
        </p>
      )}
    </div>
  )
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

function Field({ label, value }) {
  return (
    <div className="field">
      <span>{label}</span>
      <strong className="field__value">{valueOrMissing(value)}</strong>
    </div>
  )
}

function CopyButton({ text, label }) {
  const [status, setStatus] = useState('idle')
  const canCopy = Boolean(text && text !== missing)

  const copy = async () => {
    if (!canCopy) return
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    window.setTimeout(() => setStatus('idle'), 2200)
  }

  const feedback = status === 'copied' ? 'Copiado' : status === 'error' ? 'No se pudo copiar' : label

  return (
    <button
      className={`copy-button ${status === 'copied' ? 'copy-button--copied' : ''} ${status === 'error' ? 'copy-button--error' : ''}`}
      disabled={!canCopy}
      onClick={copy}
      type="button"
    >
      <span className="copy-button__icon" aria-hidden="true"><Icon name="copy" size={15} /><Icon name="check" size={15} /></span>
      <span>{feedback}</span>
    </button>
  )
}

function SourceLink({ prospect, actionLabel = 'Abrir origen' }) {
  const href = getHref(prospect.enlaceFuente)
  if (!href) return <span className="source-unavailable">Enlace de origen: {missing}</span>

  return (
    <a className="source-link" href={href} rel="noreferrer" target="_blank">
      <span>{actionLabel}</span>
      <Icon name="arrow" size={15} />
    </a>
  )
}

function PageHeading({ title, children }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      {children && <div className="page-heading__copy">{children}</div>}
    </header>
  )
}

function QueueHeader({ title, copy, count, tone = 'marca' }) {
  return (
    <div className="queue-header">
      <div className={`queue-header__signal queue-header__signal--${tone}`} aria-hidden="true" />
      <div>
        <div className="queue-header__title-row">
          <h2>{title}</h2>
          <Badge tone={tone}>{count} filas</Badge>
        </div>
        <p>{copy}</p>
        <span className="derived-note">Vista derivada de las filas disponibles en el mock.</span>
      </div>
    </div>
  )
}

function MessageCard({ prospect, message, readyToSend = false }) {
  const contact = prospect.contacto ?? {}

  return (
    <article className={`message-card ${readyToSend ? 'message-card--ready' : ''}`}>
      <div className="message-card__topline">
        <div>
          <div className="message-card__labels">
            <Badge tone={readyToSend ? 'oro' : 'marca'}>
              {readyToSend ? 'Aprobado' : 'Revisión pendiente'}
            </Badge>
            {prospect.readiness !== null && <Badge tone="outline">Preparación {prospect.readiness}</Badge>}
          </div>
          <h3>{getDisplayName(prospect)}</h3>
        </div>
        <span className="stage-label">{stages[prospect.etapa]}</span>
      </div>

      <div className="message-card__context">
        <div>
          <span className="context-label">Señal que justifica el contacto</span>
          <p>{valueOrMissing(prospect.senalCompra)}</p>
        </div>
        <div className="context-grid">
          <Field label="Canal" value={message?.canal ?? contact.canal} />
          <Field label="Horario recomendado" value={contact.mejorMomento} />
          <Field label="Responsable" value={prospect.responsable} />
        </div>
      </div>

      <AccionesHoja prospect={prospect} readyToSend={readyToSend} />

      <Clasificacion prospect={prospect} />

      <EnlacesEmpresa prospect={prospect} />

      <EditorMensaje empresa={prospect.empresa} texto={message?.texto} />

      <div className="message-card__actions">
        {readyToSend && message?.enlaceWhatsApp ? (
          <a className="whatsapp-button" href={message.enlaceWhatsApp} rel="noreferrer" target="_blank">
            <span>Abrir WhatsApp con el mensaje</span>
            <Icon name="arrow" size={16} />
          </a>
        ) : readyToSend ? (
          <span className="source-unavailable">Enlace de WhatsApp: {missing}</span>
        ) : (
          <SourceLink prospect={prospect} actionLabel="Abrir fila para aprobar" />
        )}
        <CopyButton label="Copiar mensaje" text={message?.texto} />
      </div>

      {/* Antes esto estaba siempre desplegado y era la mitad del texto de la
          pantalla. Pero no se lee para decidir: se lee cuando el prospecto ya
          contesto algo. Colapsado por defecto, la ficha pasa de muro de texto a
          una decision con su mensaje delante — y lo demas sigue a un clic. */}
      <details className="message-card__support-toggle">
        <summary>
          <span>Objeciones y seguimientos</span>
          <em>{(message?.objeciones?.length ?? 0) + (message?.seguimientos?.length ?? 0)}</em>
          <Icon name="chevron" size={14} />
        </summary>
      <div className="message-card__support">
        <section>
          <p className="section-label">Objeciones previstas</p>
          {message?.objeciones?.length ? (
            <ol className="objections-list">
              {message.objeciones.map((item, index) => (
                <li key={`${prospect.id}-objection-${index}`}>
                  <strong>{item.objecion}</strong>
                  <p>{item.respuesta}</p>
                </li>
              ))}
            </ol>
          ) : <p className="empty-inline">Objeciones: {missing}</p>}
        </section>
        <section>
          <p className="section-label">Seguimientos redactados</p>
          {message?.seguimientos?.length ? (
            <ol className="followup-list">
              {message.seguimientos.map((item) => (
                <li key={`${prospect.id}-followup-${item.orden}`}>
                  <div>
                    <span>Seguimiento {item.orden}</span>
                    <span className="followup-list__timing">{item.plazo}</span>
                  </div>
                  <p>{item.mensaje}</p>
                  <span className="followup-list__angle">Ángulo: {item.angulo}</span>
                </li>
              ))}
            </ol>
          ) : <p className="empty-inline">Seguimientos: {missing}</p>}
        </section>
      </div>
      </details>
    </article>
  )
}

function EmptyReplyState() {
  return (
    <div className="empty-state">
      <span className="empty-state__line" aria-hidden="true" />
      <div>
        <h3>El mock reporta 0 mensajes enviados.</h3>
        <p>Esta cola se poblará con prospectos enviados que todavía tengan el estado «sin respuesta».</p>
      </div>
    </div>
  )
}

function wholePercent(value, previous) {
  if (value === null || value === undefined || !previous) return missing
  return `${Math.round((value / previous) * 100)} %`
}

/**
 * De cuando son los datos, y cuanto hace de eso.
 *
 * Con mock da igual. Con la hoja de verdad no: mirar cifras de hace tres dias
 * creyendo que son de hoy es peor que no mirarlas. La antiguedad va pegada a la
 * fecha para que no haya forma de leer una sin la otra.
 */
function getSnapshotDate(data) {
  const source = data.meta?.fuentes?.outbound ?? ''
  const date = source.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (!date) return missing
  const dias = diasDesde(date)
  const antiguedad = dias === null ? '' : dias === 0 ? ' · hoy' : dias === 1 ? ' · hace 1 día' : ` · hace ${dias} días`
  return `${formatDate(date)}${antiguedad}`
}

function PanoramaView({ data, todayActions, prospects, baseHealth, onSelectView }) {
  // Que etapa del embudo se esta señalando. Vive aqui y no en cada nodo porque
  // la linea de estado es UNA sola y compartida.
  const [activeStage, setActiveStage] = useState(null)
  const processed = baseHealth.length && baseHealth.every((source) => source.procesadas !== null)
    ? baseHealth.reduce((total, source) => total + source.procesadas, 0)
    : null
  // `destino` son los argumentos de selectView: cada cifra lleva a la vista y al
  // recorte que la explica. Una cifra que no se puede abrir es una cifra que
  // obliga a buscarla a mano, y entonces el panel no ahorra nada.
  const funnel = [
    { label: 'Minadas', value: processed, note: 'Base procesada por las fuentes disponibles.', destino: ['base'] },
    { label: 'Investigadas', value: data.meta?.totales?.outbound, note: 'Prospectos outbound con investigación comercial.', destino: ['prospectos', { origen: 'outbound' }] },
    { label: 'Con mensaje', value: data.meta?.totales?.mensajes, note: 'Contacto verificado y mensaje redactado.', destino: ['hoy'] },
    { label: 'Aprobadas', value: data.meta?.embudo?.porEnviar, note: 'Listas para salir por WhatsApp.', destino: ['prospectos', { etapa: 'por-enviar' }] },
    { label: 'Enviadas', value: data.meta?.embudo?.enviados, note: 'Contactos registrados como enviados.', warning: true, destino: ['prospectos', { etapa: 'enviado' }] },
  ]
  const maxFunnel = funnel[0].value || 1
  const cities = Object.entries(
    prospects
      .filter((prospect) => prospect.origen === 'outbound')
      .reduce((groups, prospect) => {
        const city = valueOrMissing(prospect.ciudad)
        groups[city] = (groups[city] ?? 0) + 1
        return groups
      }, {}),
  ).sort((left, right) => right[1] - left[1])
  const maxCity = cities[0]?.[1] || 1

  // El reparto entre agencia completa y soporte especializado. Se fija el orden
  // en vez de ordenarlo por cantidad: «Agencia completa» va siempre arriba
  // aunque hoy sea la minoria, porque es lo que hay que perseguir. Si se
  // ordenara por volumen, la lista premiaria justo lo que sobra.
  const reparto = ['Agencia completa', 'Soporte especializado'].map((tipo) => [
    tipo,
    prospects.filter((prospect) => prospect.tipoOportunidad === tipo).length,
  ])
  const maxTipo = Math.max(...reparto.map(([, n]) => n), 1)
  const inbound = prospects.filter((prospect) => prospect.origen === 'inbound')
  const newestInbound = [...inbound].sort((left, right) => (right.fechaDeteccion ?? '').localeCompare(left.fechaDeteccion ?? ''))[0] ?? null
  const readyNames = todayActions.readyToSend.map(({ prospect }) => getDisplayName(prospect)).join(' · ')
  const topPending = todayActions.pending[0]?.prospect ?? null

  return (
    <section aria-label="Panorama comercial" className="panorama-console">
      <section className="console-zone panorama-funnel" aria-labelledby="panorama-funnel-title">
        <header className="zone-heading"><h2 id="panorama-funnel-title">Recorrido</h2><span>Vista derivada</span></header>
        <div className="funnel-route" onMouseLeave={() => setActiveStage(null)}>
          {funnel.map((stage, index) => (
            <React.Fragment key={stage.label}>
              <button
                aria-label={`${valueOrMissing(stage.value)} ${stage.label}. ${stage.note}. Abrir esta etapa.`}
                className={`funnel-node ${stage.warning ? 'funnel-node--warning' : ''} ${activeStage === index ? 'is-active' : ''}`}
                onBlur={() => setActiveStage(null)}
                onClick={() => onSelectView(...(stage.destino ?? ['prospectos']))}
                onFocus={() => setActiveStage(index)}
                onMouseEnter={() => setActiveStage(index)}
                type="button"
              >
                <span className="funnel-node__survival">{index ? wholePercent(stage.value, funnel[index - 1].value) : stage.value === null ? missing : '100 %'}</span>
                <strong>{valueOrMissing(stage.value)}</strong>
                <span className="funnel-node__label">{stage.label}</span>
                <span className="funnel-node__measure"><i style={{ '--measure': Math.max((stage.value ?? 0) / maxFunnel, 0) }} /></span>
              </button>
              {index < funnel.length - 1 && (
                <div className={`funnel-connector ${funnel[index + 1].warning ? 'funnel-connector--warning' : ''}`} aria-label={`${wholePercent(funnel[index + 1].value, stage.value)} continúa`}>
                  <span>{wholePercent(funnel[index + 1].value, stage.value)}</span>
                  <i aria-hidden="true" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Una sola linea, siempre en el mismo sitio. En reposo enseña la etapa
            rota en gris; al recorrer el embudo cambia de contenido sin mover
            nada. La caratula no se mueve, solo la aguja. */}
        <p className="funnel-readout">
          <span className={activeStage === null ? '' : 'is-on'}>
            {(activeStage === null ? funnel.find((stage) => stage.warning) ?? funnel[0] : funnel[activeStage]).note}
          </span>
        </p>
      </section>

      <div className="panorama-lower">
        <section className="console-zone decision-zone" aria-labelledby="decision-title">
          <header className="zone-heading"><h2 id="decision-title">Requiere tu decisión</h2></header>
          <div className="decision-list">
            <button className="decision-row decision-row--purple" onClick={() => onSelectView('hoy')} type="button">
              <strong>{todayActions.pending.length}</strong>
              <span><b>Por aprobar</b><small>{topPending ? `${getDisplayName(topPending)} · preparación ${valueOrMissing(topPending.readiness)}` : missing}</small></span>
              <Icon name="arrow" size={15} />
            </button>
            <button className="decision-row decision-row--oro" onClick={() => onSelectView('hoy')} type="button">
              <strong>{todayActions.readyToSend.length}</strong>
              <span><b>Por enviar</b><small>{readyNames || missing}</small></span>
              <Icon name="arrow" size={15} />
            </button>
            {/* Tercera cola: lo que ya salio y todavia no contesta. Hoy es cero
                porque no se ha enviado nada; en cuanto salga el primer mensaje,
                esta fila es la que avisa de quien no responde. Se pinta aunque
                este vacia: un hueco explicito informa, y una fila que aparece
                de la nada el dia que hay datos, no. */}
            <button
              className={`decision-row decision-row--espera ${todayActions.waitingForReply.length ? '' : 'decision-row--vacia'}`}
              onClick={() => onSelectView('prospectos', { etapa: 'enviado' })}
              type="button"
            >
              <strong>{todayActions.waitingForReply.length}</strong>
              <span>
                <b>Sin respuesta</b>
                <small>{todayActions.waitingForReply.length
                  ? todayActions.waitingForReply.map(({ prospect }) => getShortName(prospect)).join(' · ')
                  : 'Nada enviado todavía'}</small>
              </span>
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>

        {/* Esta zona era «Dónde están» (ciudades). La sustituye el tipo de
            oportunidad porque es la pregunta central del sistema nuevo:
            ¿podemos ser su agencia o solo entrar por una pieza? Las ciudades no
            se pierden — siguen como filtro en Prospectos. */}
        <section className="console-zone coverage-zone" aria-labelledby="coverage-title">
          <header className="zone-heading"><h2 id="coverage-title">Tipo de oportunidad</h2><span>Deducido</span></header>
          <div className="coverage-list">
            {reparto.map(([tipo, count]) => (
              <button
                className={`coverage-row ${tipo === 'Agencia completa' ? 'coverage-row--completa' : ''}`}
                key={tipo}
                onClick={() => onSelectView('prospectos', { tipo })}
                type="button"
              >
                <span>{tipo}</span><strong>{count}</strong><i><b style={{ '--measure': count / maxTipo }} /></i>
              </button>
            ))}
          </div>
        </section>

        <section className="console-zone inbound-zone" aria-labelledby="inbound-title">
          <header className="zone-heading"><h2 id="inbound-title">Vinieron solos</h2></header>
          <button className="inbound-signal" onClick={() => onSelectView('prospectos', { origen: 'inbound' })} type="button">
            <strong>{valueOrMissing(data.meta?.totales?.inbound)}</strong>
            <span>Chat y WhatsApp</span>
            <p>{newestInbound ? `Uno del ${formatDate(newestInbound.fechaDeteccion).replace(/\s+\d{4}$/, '')} sigue sin responsable` : `Último ingreso: ${missing}`}</p>
          </button>
        </section>
      </div>
    </section>
  )
}

/**
 * Hoy — maestro-detalle.
 *
 * Antes era una pila de tarjetas enormes que habia que recorrer con scroll, y
 * cada una enseñaba todo a la vez aunque solo te interesara una. Ahora las ocho
 * conversaciones caben de un vistazo a la izquierda —empresa y preparacion, y
 * nada mas— y a la derecha va SOLO la elegida, entera.
 *
 * El texto largo no desaparece: hay que leer el mensaje antes de aprobarlo. Lo
 * que cambia es que aparece para una fila y no para ocho.
 */
/** PRIORITY OUTREACH lo decide Twin, no el panel. Aqui solo se pinta. */
const prioritaria = (prospect) => prospect.readinessBand === 'PRIORITY OUTREACH'

/**
 * La fila de una cola. La comparten Hoy y Prospectos a proposito: si cada vista
 * dibujase su propia fila, en dos semanas tendrian tres pesos de tipografia y
 * dos formas de marcar la seleccion. La coherencia se consigue reusando el
 * componente, no copiando el CSS.
 *
 * `metric` deja que cada vista elija que cifra pesa: en Hoy es la preparacion
 * para contactar, en Prospectos la oportunidad. La barra siempre representa la
 * cifra que se muestra.
 */
function WorkRow({ prospect, selected, onSelect, metric = 'readiness' }) {
  const valor = metric === 'score' ? prospect.score : prospect.readiness
  const dias = diasDesde(prospect.fechaDeteccion)
  const estancado = estaEstancado(prospect)

  return (
    <button
      aria-selected={selected}
      className={`work-row ${prioritaria(prospect) ? 'work-row--prioritaria' : ''}`}
      onClick={() => onSelect(prospect.id)}
      role="option"
      type="button"
    >
      <span className="work-row__top">
        <span className="work-row__name">{getShortName(prospect)}</span>
        {prospect.tipoOportunidad === 'Agencia completa' && <span aria-label="Agencia completa" className="marca-completa" title="Agencia completa" />}
        <PotentialGauge value={prospect.potencialNegocio} />
        <span className="work-row__score">{valueOrMissing(valor)}</span>
      </span>
      <span aria-hidden="true" className="work-row__meter">
        <i style={{ '--w': `${Math.min(valor ?? 0, 100)}%` }} />
      </span>
      {/* La antiguedad se ve siempre, en hueso: es informacion y sirve para
          comparar filas de un vistazo. Solo sube a oro cuando cruza el umbral
          de abandono — si la llevaran todas, no seria un aviso. */}
      {dias !== null && (
        <span className={`work-row__age ${estancado ? 'is-alerta' : ''}`}>
          {dias === 0 ? 'hoy' : dias === 1 ? '1 día' : `${dias} días`}
        </span>
      )}
    </button>
  )
}

function TodayView({ todayActions }) {
  const grupos = [
    { id: 'aprobar', titulo: 'Por aprobar', items: todayActions.pending },
    { id: 'enviar', titulo: 'Por enviar', items: todayActions.readyToSend, listo: true },
    { id: 'espera', titulo: 'Esperando respuesta', items: todayActions.waitingForReply },
    { id: 'inbound', titulo: 'Vinieron solos, sin atender', items: todayActions.inboundSinAtender },
  ].filter((grupo) => grupo.items.length)

  const filas = grupos.flatMap((grupo) =>
    grupo.items.map((item) => ({ ...item, grupo: grupo.id, listo: Boolean(grupo.listo) })),
  )

  const [elegido, setElegido] = useState(null)
  // En movil la lista y la ficha son DOS PANTALLAS, no una encima de otra:
  // apilarlas hacia que tocar una fila no pareciera hacer nada, porque la ficha
  // quedaba fuera de pantalla. En escritorio esto no cambia nada.
  const [enDetalle, setEnDetalle] = useState(false)
  const abrir = (id) => { setElegido(id); setEnDetalle(true) }
  const activo = filas.find((fila) => fila.prospect.id === elegido) ?? filas[0] ?? null

  // El teclado mueve la seleccion, como en cualquier bandeja. Es lo que separa
  // una lista de una consola.
  const alTeclado = (evento) => {
    const salto = evento.key === 'ArrowDown' ? 1 : evento.key === 'ArrowUp' ? -1 : 0
    if (!salto || !activo) return
    evento.preventDefault()
    const desde = filas.findIndex((fila) => fila.prospect.id === activo.prospect.id)
    const hasta = Math.min(Math.max(desde + salto, 0), filas.length - 1)
    setElegido(filas[hasta].prospect.id)
  }

  if (!activo) {
    return (
      <div className="work-split work-split--vacia">
        <EmptyReplyState />
      </div>
    )
  }

  // Que TODO lleve parado no es un problema de fila, es un problema de
  // conjunto. Por eso se dice una vez aqui arriba en lugar de repetir el mismo
  // aviso once veces en la columna, que es como se pierde un aviso.
  const antiguedad = resumenAntiguedad(filas)

  return (
    <div className={`work-split ${enDetalle ? 'work-split--detalle' : 'work-split--lista'}`}>
      <div className="work-queue" onKeyDown={alTeclado}>
        {antiguedad && antiguedad.min >= 1 && (
          <p className="queue-alarm">
            <b>Nada se ha movido.</b>{' '}
            {antiguedad.min === antiguedad.max
              ? `Las ${antiguedad.cuantas} llevan ${antiguedad.max} días paradas.`
              : `Las ${antiguedad.cuantas} llevan entre ${antiguedad.min} y ${antiguedad.max} días paradas.`}
          </p>
        )}
        {grupos.map((grupo) => (
          <section className="work-group" key={grupo.id}>
            <header>
              <h2>{grupo.titulo}</h2>
              <span>{grupo.items.length}</span>
            </header>
            <ul>
              {grupo.items.map(({ prospect }) => {
                const seleccionada = prospect.id === activo.prospect.id
                return (
                  <li key={prospect.id}>
                    <WorkRow onSelect={abrir} prospect={prospect} selected={seleccionada} />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* La `key` fuerza el remontaje al cambiar de fila: asi el detalle entra
          con su animacion en vez de cambiar de texto de golpe. */}
      <div className="work-detail" key={activo.prospect.id}>
        <BotonVolver onClick={() => setEnDetalle(false)} titulo={getShortName(activo.prospect)} />
        <MessageCard message={activo.message} prospect={activo.prospect} readyToSend={activo.listo} />
      </div>
    </div>
  )
}

/**
 * El score, descompuesto en sus cinco componentes.
 *
 * Aqui SI entra el color, y por un motivo concreto: esto es un grafico, y en un
 * grafico el color codifica un dato en vez de decorar. Cinco componentes con
 * cinco tonos se comparan de un vistazo; cinco barras del mismo gris obligan a
 * leer las etiquetas una por una.
 *
 * Fuera de este bloque el panel sigue siendo hueso y un solo acento. La regla no
 * era «poco color»: era «color solo cuando significa algo».
 *
 * Los maximos por componente salen de la propia hoja (25/25/20/20/10 suman 100).
 */
const COMPONENTES = [
  { clave: 'potencial', etiqueta: 'Potencial', maximo: 25 },
  { clave: 'senal', etiqueta: 'Señal de compra', maximo: 25 },
  { clave: 'oportunidad', etiqueta: 'Oportunidad', maximo: 20 },
  { clave: 'encaje', etiqueta: 'Encaje con DAK', maximo: 20 },
  { clave: 'contactabilidad', etiqueta: 'Contactabilidad', maximo: 10 },
]

function ScoreBreakdown({ prospect }) {
  if (!prospect.scoreDetalle) return <p className="empty-inline">Detalle de score: {missing}</p>

  return (
    <div className="score-breakdown">
      {COMPONENTES.map(({ clave, etiqueta, maximo }, n) => {
        const valor = prospect.scoreDetalle[clave]
        const parte = valor === null || valor === undefined ? 0 : valor / maximo
        return (
          <div className={`score-comp score-comp--${n}`} key={clave}>
            <span className="score-comp__nombre">{etiqueta}</span>
            <span className="score-comp__cifra">{valueOrMissing(valor)}<em>/{maximo}</em></span>
            <span aria-hidden="true" className="score-comp__barra">
              <i style={{ '--parte': Math.max(0, Math.min(1, parte)) }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

function buildProspectCopy(prospect, message) {
  const contact = prospect.contacto ?? {}
  return [
    getDisplayName(prospect), `Origen: ${valueOrMissing(prospect.origen)}`,
    `Etapa: ${valueOrMissing(stages[prospect.etapa])}`, `Fuente: ${valueOrMissing(prospect.fuente)}`,
    `Oportunidad: ${valueOrMissing(prospect.oportunidad)}`, `Señal de compra: ${valueOrMissing(prospect.senalCompra)}`,
    `Servicio sugerido: ${valueOrMissing(prospect.servicioSugerido)}`, `Canal: ${valueOrMissing(contact.canal)}`,
    `Contacto: ${valueOrMissing(contact.handle)}`, `Mejor momento: ${valueOrMissing(contact.mejorMomento)}`,
    `Primera oferta: ${valueOrMissing(message?.primeraOferta)}`,
  ].join('\n')
}

function ProspectDetail({ data, prospect }) {
  if (!prospect) return <aside className="prospect-detail prospect-detail--empty"><h2>Selecciona un prospecto</h2><p>La ficha conservará los huecos de la fuente como «sin dato».</p></aside>

  const message = getOpener(prospect.id, data)
  const contact = prospect.contacto ?? {}

  const dias = diasDesde(prospect.fechaDeteccion)
  const senas = [prospect.rubro, prospect.ciudad, stages[prospect.etapa]].filter(Boolean)

  return (
    <aside aria-live="polite" className="prospect-detail">
      {/* La portada: quién es y cuánto vale, sin que haya que leer nada. Antes
          esto eran cuatro pares etiqueta/valor en mayúsculas y parecía un
          formulario; el nombre competía con «FICHA DERIVADA DEL REGISTRO». */}
      <header className="ficha-portada">
        <h2>{getDisplayName(prospect)}</h2>
        <p className="ficha-senas">{senas.join(' · ')}</p>

        <div className="ficha-marcas">
          <TipoOportunidad derivada={prospect.clasificacionDerivada} tipo={prospect.tipoOportunidad} />
          {prospect.origen === 'inbound' && <span className="tipo-badge tipo-badge--completa">Llegó solo</span>}
          {dias !== null && (
            <span className={`ficha-dias ${estaEstancado(prospect) ? 'is-alerta' : ''}`}>
              {dias === 0 ? 'detectado hoy' : dias === 1 ? 'hace 1 día' : `hace ${dias} días`}
            </span>
          )}
        </div>

        <div className="ficha-cifras">
          <div>
            <strong>{valueOrMissing(prospect.score)}</strong>
            <span>Oportunidad</span>
          </div>
          <div>
            <strong>{valueOrMissing(prospect.readiness)}</strong>
            <span>Preparación</span>
          </div>
          <div>
            <strong>{prospect.potencialLiderazgo ? `${prospect.potencialLiderazgo}/5` : missing}</strong>
            <span>DAK puede liderar</span>
          </div>
        </div>

        {/* El desglose va a lo ancho y no dentro de la celda de «Oportunidad»:
            ahi le tocaban 317px y las etiquetas de dos palabras se partian. */}
        <ScoreBreakdown prospect={prospect} />
      </header>

      {/* Tres preguntas, no diez campos. Un socio abre esto para decidir, y la
          decisión se toma con estas tres respuestas. */}
      <section className="ficha-bloque">
        <h3>Por qué esta empresa</h3>
        <p>{valueOrMissing(prospect.senalCompra)}</p>
        {prospect.porQueAhora && <p>{prospect.porQueAhora}</p>}
        {prospect.oportunidad && <p className="ficha-destacado">{prospect.oportunidad}</p>}
      </section>

      <section className="ficha-bloque">
        <h3>Qué le ofrecemos</h3>
        <p>{valueOrMissing(prospect.servicioSugerido)}</p>
        {prospect.anguloVenta && <p>{prospect.anguloVenta}</p>}
        {message?.primeraOferta && (
          <p className="ficha-destacado">{message.primeraOferta}</p>
        )}
      </section>

      <section className="ficha-bloque">
        <h3>Cómo entramos</h3>
        {prospect.anguloEntrada && <p>{prospect.anguloEntrada}</p>}
        <dl className="ficha-contacto">
          <div><dt>Canal</dt><dd>{traducirEnum(contact.canal)}</dd></div>
          <div><dt>Contacto</dt><dd>{valueOrMissing(contact.handle)}</dd></div>
          <div><dt>Mejor momento</dt><dd>{valueOrMissing(contact.mejorMomento)}</dd></div>
          <div><dt>Riesgo de agencia</dt><dd>{traducirEnum(prospect.riesgoAgenciaExistente)}</dd></div>
          <div><dt>Responsable</dt><dd>{valueOrMissing(prospect.responsable)}</dd></div>
          <div><dt>Fuente</dt><dd>{valueOrMissing(prospect.fuente)}</dd></div>
        </dl>
      </section>

      <EnlacesEmpresa prospect={prospect} />

      {/* Solo en «investigado»: en el resto de etapas la fila ya vive en la
          QUEUE y las acciones que tocan son aprobar y enviar, que estan en Hoy. */}
      {prospect.etapa === 'investigado' && <PedirMensaje prospect={prospect} />}

      {/* La evidencia es procedencia, no material de decisión. Va plegada:
          importa poder comprobarla, no tenerla siempre delante. */}
      {prospect.evidencia && (
        <details className="ficha-evidencia">
          <summary><span>De dónde sale esto</span><Icon name="chevron" size={14} /></summary>
          <p>{prospect.evidencia}</p>
        </details>
      )}

      <div className="detail-actions">
        <CopyButton label="Copiar ficha" text={buildProspectCopy(prospect, message)} />
        <SourceLink prospect={prospect} />
      </div>
    </aside>
  )
}

/**
 * Cifra que rueda hasta su valor nuevo.
 *
 * Es el momento con autoria de esta vista, y no es decoracion: el trabajo del
 * panel es mirar como se mueven unas cifras al recortar el conjunto. Si al
 * pulsar un filtro los numeros SALTAN, cambian sin que los veas cambiar y toca
 * releerlos todos. Rodando, la vista sigue el que se movio mas.
 *
 * Con cifras tabulares el ancho no baila mientras rueda, asi que nada de
 * alrededor se mueve — que es la diferencia entre esto y una animacion que
 * estorba.
 */
function useRueda(objetivo) {
  // Se pinta `objetivo` salvo mientras hay una rueda en marcha. Al reves —guardar
  // el numero en el estado y moverlo por fotogramas— la cifra se queda en el
  // valor viejo si los fotogramas no llegan, y llegan a no llegar: una pestaña
  // en segundo plano congela requestAnimationFrame. La animacion es un añadido
  // encima del valor bueno, nunca la unica via para llegar a el.
  const [rodando, setRodando] = useState(null)
  const pintado = useRef(objetivo)

  useEffect(() => {
    const desde = pintado.current
    pintado.current = objetivo
    if (desde === objetivo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const inicio = performance.now()
    const duracion = 300
    let ficha = requestAnimationFrame(function paso(ahora) {
      const parte = Math.min(1, (ahora - inicio) / duracion)
      const suave = 1 - (1 - parte) ** 4
      const valor = Math.round(desde + (objetivo - desde) * suave)
      pintado.current = parte < 1 ? valor : objetivo
      setRodando(parte < 1 ? valor : null)
      if (parte < 1) ficha = requestAnimationFrame(paso)
    })
    return () => { cancelAnimationFrame(ficha); setRodando(null) }
  }, [objetivo])

  return rodando ?? objetivo
}

function Rueda({ valor }) {
  return <>{useRueda(valor)}</>
}

/**
 * Un rail de opciones con UNA marca de oro que viaja de una a otra.
 *
 * Dos marcas que se apagan y se encienden dicen «esta se apago, esta se
 * encendio». Una sola que se desplaza dice «has cambiado de sitio», que es lo
 * que de verdad ha pasado, y ademas deja claro sin explicarlo que aqui solo se
 * puede elegir una cosa. Las medidas de arriba se encienden por separado
 * justamente porque ahi si se pueden combinar: el movimiento explica la regla.
 */
function RailFaceta({ activa, neutro, opciones, poner, titulo }) {
  const rail = useRef(null)
  const marca = useRef(null)
  const primera = useRef(true)

  const situar = useCallback(() => {
    const caja = rail.current
    const linea = marca.current
    if (!caja || !linea) return
    const elegida = caja.querySelector('[aria-pressed="true"]')
    if (!elegida) { linea.style.opacity = '0'; return }
    const base = caja.getBoundingClientRect()
    const suya = elegida.getBoundingClientRect()
    // La marca mide 1px y se estira: escalar es transformar, y transformar no
    // recalcula el layout en cada fotograma como lo haria animar el ancho.
    linea.style.opacity = '1'
    linea.style.transform = `translateX(${suya.left - base.left}px) scaleX(${suya.width})`
  }, [])

  useLayoutEffect(() => {
    // En el primer pintado la marca aparece donde le toca; sin esto entraria
    // deslizandose desde el borde izquierdo cada vez que se abre la vista.
    if (primera.current) {
      const linea = marca.current
      if (linea) linea.style.transition = 'none'
      situar()
      if (linea) { linea.getBoundingClientRect(); linea.style.transition = '' }
      primera.current = false
    } else {
      situar()
    }
  })

  // Si cambia el ancho —redimensionar, plegar la ficha— la marca tiene que
  // seguir debajo de su opcion y no quedarse a medio camino. Se vigila una vez,
  // no en cada pulsacion de tecla del buscador.
  useLayoutEffect(() => {
    const caja = rail.current
    if (!caja) return undefined
    const vigia = new ResizeObserver(situar)
    vigia.observe(caja)
    return () => vigia.disconnect()
  }, [situar])

  return (
    <div className="faceta">
      <h2>{titulo}</h2>
      <div aria-label={titulo} className="faceta__rail" ref={rail} role="group">
        <span aria-hidden="true" className="faceta__marca" ref={marca} />
        {opciones.map((o) => (
          <button
            aria-pressed={activa === o.valor}
            className="faceta__opcion"
            disabled={!o.total && o.valor !== neutro && activa !== o.valor}
            key={o.valor}
            onClick={() => poner(activa === o.valor ? neutro : o.valor)}
            type="button"
          >
            {o.texto}<i><Rueda valor={o.total} /></i>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Pedir que a una empresa se le escriba el mensaje.
 *
 * Es lo unico que el panel puede hacer con un prospecto que sigue en
 * «investigado», y hay una razon de fondo: la etapa no es un campo que se
 * escriba, se deduce de en que hoja vive la fila. Pasar de «investigado» a «con
 * mensaje» significa CREAR la fila en la QUEUE con el mensaje ya redactado, y
 * eso es la salida del Outreach Strategist. Un boton que fabricara esa fila con
 * el mensaje en blanco no adelantaria el trabajo: lo falsearia.
 *
 * Asi que el panel marca la empresa en su propia fila de Leads y el agente la
 * prioriza en la proxima corrida. El humano elige el orden; el agente sigue
 * siendo quien escribe.
 */
function PedirMensaje({ prospect }) {
  const [estado, setEstado] = useState({ fase: 'listo', mensaje: null })
  const [pedido, setPedido] = useState(Boolean(prospect.pedido))

  if (!puedeEscribir || !prospect.empresa) return null

  const lanzar = async (quiero) => {
    setEstado({ fase: 'enviando', mensaje: null })
    const resultado = await escribirEnHoja({
      accion: 'pedir', empresa: prospect.empresa, valor: quiero ? 'REQUESTED' : '',
    })
    if (resultado.ok) {
      setPedido(quiero)
      setEstado({ fase: 'hecho', mensaje: quiero ? 'Pedido. Twin lo tomara en su proxima corrida.' : 'Retirado de la cola de peticiones.' })
    } else {
      setEstado({ fase: 'fallo', mensaje: resultado.error ?? 'La hoja rechazo el cambio.' })
    }
  }

  const trabajando = estado.fase === 'enviando'

  return (
    <div className="sheet-actions">
      <span className="context-label">Todavía sin mensaje</span>
      <div className="sheet-actions__row">
        <button
          className={`sheet-button ${pedido ? '' : 'sheet-button--principal'}`}
          disabled={trabajando}
          onClick={() => lanzar(!pedido)}
          type="button"
        >
          {trabajando ? 'Guardando…' : pedido ? 'Quitar la petición' : 'Pedir mensaje a Twin'}
        </button>
      </div>
      {estado.mensaje && (
        <p aria-live="polite" className={`sheet-actions__result ${estado.fase === 'fallo' ? 'is-fallo' : ''}`}>
          {estado.mensaje}
        </p>
      )}
      {pedido && estado.fase !== 'hecho' && (
        <p className="sheet-actions__note">
          Pedido{prospect.pedidoEn ? ` el ${prospect.pedidoEn}` : ''}. Sigue sin mensaje: Twin no ha corrido todavía o no le tocó turno.
        </p>
      )}
      {!pedido && (
        <p className="sheet-actions__note">
          El panel no escribe mensajes ni encola filas — eso lo hace Twin. Esto solo marca la empresa para que la tome primero.
        </p>
      )}
    </div>
  )
}

/**
 * Prospectos.
 *
 * El filtro dejo de ser una barra de formularios. Cinco controles —buscar,
 * tipo, origen, etapa y orden— no caben en el ancho de una lista, y ahi es
 * exactamente donde estaban: dentro de `work-queue`, la columna de 300px.
 *
 * El intento siguiente los saco de ahi pero los convirtio en cinco tarjetas de
 * cifra grande, cada una con su filete de color. Es la plantilla mas repetida
 * que existe en paneles generados —numero enorme, etiqueta pequeña, acento
 * lateral, cinco colores— y se nota de lejos. Fuera.
 *
 * Lo que hay ahora es un RAIL DE MEDIDAS: las cifras sobre el propio fondo,
 * separadas por filetes de 1px y nada mas, como la escala de un instrumento.
 * Sin tarjetas, sin colores y sin sombras. Y sin nada de eso, lo que distingue
 * a un panel bueno de uno generado es lo unico que queda: como se mueve. Las
 * cifras ruedan hasta su valor nuevo y una sola marca de oro viaja hasta la
 * opcion elegida.
 *
 * Las cuentas son de faceta: cada dimension se cuenta con el resto de filtros
 * aplicados pero ignorando el suyo propio. Asi el numero de cada opcion dice
 * cuantas filas veras si la pulsas, que es lo unico que se le pregunta a un
 * numero puesto ahi.
 */
function ProspectsView({ data, prospects, filtrosIniciales = {} }) {
  const [query, setQuery] = useState(filtrosIniciales.buscar ?? '')
  const [origin, setOrigin] = useState(filtrosIniciales.origen ?? 'todos')
  const [stage, setStage] = useState(filtrosIniciales.etapa ?? 'todas')
  const [tipo, setTipo] = useState(filtrosIniciales.tipo ?? 'todos')
  const [foco, setFoco] = useState(null)
  const [orden, setOrden] = useState('score')
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? null)
  const [enDetalle, setEnDetalle] = useState(false)
  const abrir = (id) => { setSelectedId(id); setEnDetalle(true) }

  const sinContacto = (p) => !p.contacto?.handle && !p.contacto?.telefono && !p.contacto?.email
  const deHoy = (p) => diasDesde(p.fechaDeteccion) === 0

  const termino = query.trim().toLocaleLowerCase('es')
  const coincideTexto = (p) => !termino || [p.empresa, p.persona, p.fuente, p.rubro, p.ciudad]
    .filter(Boolean).some((valor) => valor.toLocaleLowerCase('es').includes(termino))

  // `salvo` desactiva UNA dimension. Es lo que hace que las cuentas sirvan en
  // vez de ser circulares: contar «Etapa: enviado» con el filtro de etapa ya
  // puesto daria cero para todas las demas.
  const pasa = (p, salvo = null) => coincideTexto(p)
    && (salvo === 'tipo' || tipo === 'todos' || p.tipoOportunidad === tipo)
    && (salvo === 'origen' || origin === 'todos' || p.origen === origin)
    && (salvo === 'etapa' || stage === 'todas' || p.etapa === stage)
    && (salvo === 'foco' || foco !== 'sin-contacto' || sinContacto(p))
    && (salvo === 'foco' || foco !== 'hoy' || deHoy(p))

  const cuenta = (condicion, salvo) => prospects.filter((p) => pasa(p, salvo) && condicion(p)).length
  const filteredProspects = prospects.filter((p) => pasa(p))
  const selectedProspect = filteredProspects.find((p) => p.id === selectedId) ?? filteredProspects[0] ?? null

  const hayFiltro = Boolean(termino) || tipo !== 'todos' || origin !== 'todos' || stage !== 'todas' || foco
  const limpiar = () => { setQuery(''); setTipo('todos'); setOrigin('todos'); setStage('todas'); setFoco(null) }
  const alternar = (valor, actual, poner, neutro) => poner(actual === valor ? neutro : valor)

  // Cinco medidas del conjunto. Solo una va en oro y siempre la misma: agencia
  // completa es la unica que significa dinero grande, y el oro en este panel
  // quiere decir eso. Las demas son hueso; la marca de abajo dice cual filtra.
  const medidas = [
    { clave: 'total', etiqueta: 'Prospectos', valor: prospects.filter(coincideTexto).length,
      activo: !hayFiltro, alPulsar: limpiar },
    { clave: 'agencia', etiqueta: 'Agencia completa', oro: true,
      valor: cuenta((p) => p.tipoOportunidad === 'Agencia completa', 'tipo'),
      activo: tipo === 'Agencia completa',
      alPulsar: () => alternar('Agencia completa', tipo, setTipo, 'todos') },
    { clave: 'soporte', etiqueta: 'Soporte',
      valor: cuenta((p) => p.tipoOportunidad === 'Soporte especializado', 'tipo'),
      activo: tipo === 'Soporte especializado',
      alPulsar: () => alternar('Soporte especializado', tipo, setTipo, 'todos') },
    { clave: 'sin-contacto', etiqueta: 'Sin contacto', valor: cuenta(sinContacto, 'foco'),
      activo: foco === 'sin-contacto',
      alPulsar: () => alternar('sin-contacto', foco, setFoco, null) },
    { clave: 'hoy', etiqueta: 'Detectados hoy', valor: cuenta(deHoy, 'foco'),
      activo: foco === 'hoy',
      alPulsar: () => alternar('hoy', foco, setFoco, null) },
  ]

  const facetas = [
    {
      titulo: 'Etapa', activa: stage, neutro: 'todas', poner: setStage,
      opciones: [
        { valor: 'todas', texto: 'Todas', total: prospects.filter((p) => pasa(p, 'etapa')).length },
        ...Object.entries(stages).map(([valor, texto]) => ({
          valor, texto, total: cuenta((p) => p.etapa === valor, 'etapa'),
        })),
      ],
    },
    {
      titulo: 'Origen', activa: origin, neutro: 'todos', poner: setOrigin,
      opciones: [
        { valor: 'todos', texto: 'Todos', total: prospects.filter((p) => pasa(p, 'origen')).length },
        { valor: 'outbound', texto: 'Búsqueda activa', total: cuenta((p) => p.origen === 'outbound', 'origen') },
        { valor: 'inbound', texto: 'Llegaron solos', total: cuenta((p) => p.origen === 'inbound', 'origen') },
      ],
    },
  ]

  // Las filas se agrupan por etapa del embudo. Una lista plana no dice nada;
  // agrupada, la forma del embudo se lee en la propia columna.
  const porEtapa = Object.entries(stages)
    .map(([clave, titulo]) => ({
      clave,
      titulo,
      items: filteredProspects.filter((p) => p.etapa === clave).sort((a, b) => {
        if (orden === 'nombre') return getShortName(a).localeCompare(getShortName(b), 'es')
        if (orden === 'antiguedad') return (a.fechaDeteccion ?? '').localeCompare(b.fechaDeteccion ?? '')
        if (orden === 'liderazgo') return (b.potencialLiderazgo ?? 0) - (a.potencialLiderazgo ?? 0)
        return (b.score ?? -1) - (a.score ?? -1)
      }),
    }))
    .filter((grupo) => grupo.items.length)

  const alTeclado = (evento) => {
    const salto = evento.key === 'ArrowDown' ? 1 : evento.key === 'ArrowUp' ? -1 : 0
    if (!salto || !selectedProspect) return
    evento.preventDefault()
    const desde = filteredProspects.findIndex((p) => p.id === selectedProspect.id)
    const hasta = Math.min(Math.max(desde + salto, 0), filteredProspects.length - 1)
    setSelectedId(filteredProspects[hasta].id)
  }

  return (
    <div className={`vista-prospectos ${enDetalle ? 'vista-prospectos--detalle' : ''}`}>
      <header className="prospectos-cabecera">
        <div className="cabecera-linea">
          <label className="cabecera-buscar">
            <Icon name="buscar" size={15} />
            <input
              onChange={(evento) => setQuery(evento.target.value)}
              placeholder="Buscar empresa, ciudad o rubro…"
              type="search"
              value={query}
            />
            {query && (
              <button aria-label="Limpiar la búsqueda" onClick={() => setQuery('')} type="button">
                <Icon name="cerrar" size={12} />
              </button>
            )}
          </label>
          {/* Ordenar no es filtrar: no recorta nada, solo cambia el turno. Por
              eso vive aparte del rail y no mezclado entre las medidas. */}
          <label className="cabecera-orden">
            <span>Ordenar</span>
            <select onChange={(evento) => setOrden(evento.target.value)} value={orden}>
              <option value="score">Oportunidad</option>
              <option value="liderazgo">Podemos liderar</option>
              <option value="antiguedad">Más antiguos</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>
        </div>

        <div className="rail-medidas">
          {medidas.map((m) => (
            <button
              aria-pressed={m.activo}
              className={`medida ${m.activo ? 'is-activa' : ''} ${m.oro ? 'medida--oro' : ''}`}
              key={m.clave}
              onClick={m.alPulsar}
              type="button"
            >
              <strong><Rueda valor={m.valor} /></strong>
              <span>{m.etiqueta}</span>
            </button>
          ))}
        </div>

        <div className="cabecera-facetas">
          {facetas.map((f) => <RailFaceta key={f.titulo} {...f} />)}
        </div>
      </header>

      <div className={`work-split ${enDetalle ? 'work-split--detalle' : 'work-split--lista'}`}>
        <div className="work-queue" onKeyDown={alTeclado}>
          {porEtapa.map((grupo) => (
            <section className="work-group" key={grupo.clave}>
              <header><h2>{grupo.titulo}</h2><span><Rueda valor={grupo.items.length} /></span></header>
              <ul>
                {grupo.items.map((prospect) => (
                  <li key={prospect.id}>
                    <WorkRow
                      metric="score"
                      onSelect={abrir}
                      prospect={prospect}
                      selected={selectedProspect?.id === prospect.id}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {!filteredProspects.length && (
            <div className="empty-state empty-state--compact">
              <div>
                <h3>Sin resultados</h3>
                <p>Ninguna empresa coincide con estos filtros.</p>
                <button className="retry-button" onClick={limpiar} type="button">Quitar los filtros</button>
              </div>
            </div>
          )}
        </div>

        <div className="work-detail" key={selectedProspect?.id ?? 'empty'}>
          {selectedProspect && <BotonVolver onClick={() => setEnDetalle(false)} titulo={getShortName(selectedProspect)} />}
          <ProspectDetail data={data} prospect={selectedProspect} />
        </div>
      </div>
    </div>
  )
}

/**
 * Base — cuanto rinde cada fuente.
 *
 * No es una lista de las 109 empresas minadas: es la respuesta a «¿vale la pena
 * seguir minando esto?». Y hoy la respuesta se ve sola — 2 aceptadas de 109 y
 * cero telefonos validados.
 *
 * Mismo lenguaje que Panorama: cifras grandes en peso 200, una barra
 * proporcional debajo y la explicacion en una linea, no en un parrafo.
 */
function BaseView({ baseHealth }) {
  return (
    <div className="base-console">
      {baseHealth.map((source) => {
        const desglose = Object.entries(source.desglose ?? {})
        const total = source.procesadas || 1
        const rinde = (source.aceptadas ?? 0) / total

        return (
          <section className="source-panel" key={source.fuente}>
            <header className="zone-heading">
              <h2>{source.fuente}</h2>
              <span>Vista derivada</span>
            </header>

            <div className="source-figures">
              {[
                { etiqueta: 'Procesadas', valor: valueOrMissing(source.procesadas) },
                { etiqueta: 'Aceptadas', valor: valueOrMissing(source.aceptadas) },
                { etiqueta: 'Rendimiento', valor: formatPercent(source.rendimiento), alerta: rinde < 0.05 },
                { etiqueta: 'Contactos validados', valor: valueOrMissing(source.contactosValidados), alerta: !source.contactosValidados },
              ].map((cifra) => (
                <div className={`source-figure ${cifra.alerta ? 'source-figure--alerta' : ''}`} key={cifra.etiqueta}>
                  <strong>{cifra.valor}</strong>
                  <span>{cifra.etiqueta}</span>
                </div>
              ))}
            </div>

            {desglose.length > 0 && (
              <div className="source-split">
                <p className="section-label">En qué acabó cada empresa</p>
                <ul>
                  {desglose.sort((a, b) => b[1] - a[1]).map(([estado, cuantas]) => (
                    <li key={estado}>
                      <span className="source-split__name">{estado}</span>
                      <span className="source-split__count">{cuantas}</span>
                      <span aria-hidden="true" className="source-split__meter">
                        <i style={{ '--w': `${(cuantas / total) * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {source.notas && <p className="source-note">{source.notas}</p>}
          </section>
        )
      })}
    </div>
  )
}

const flow = [
  { number: '01', title: 'Base identificada', copy: 'Se procesan empresas de fuentes como Cámara, Apollo, Apify o reactivación. No toda la base es vendible todavía.', agent: 'Database Reactivation' },
  { number: '02', title: 'Investigación y encaje', copy: 'Se documentan señal, oportunidad y servicio sugerido. El prospecto pasa de una fila de base a una hipótesis comercial.', agent: 'Lead Hunter' },
  { number: '03', title: 'Mensaje preparado', copy: 'Con un contacto verificado, se redactan opener, respuestas a objeciones y seguimientos. La prioridad se revisa antes de aprobar.', agent: 'Outreach Strategist' },
  { number: '04', title: 'Decisión y contacto', copy: 'Una persona aprueba en la hoja y envía desde WhatsApp. La respuesta y el seguimiento se registran en la fuente de verdad.', agent: 'Decisión humana' },
]

/**
 * Como funciona — las cuatro etapas en horizontal, como el embudo de Panorama.
 *
 * Antes eran cuatro tarjetas apiladas con su parrafo desplegado. Aqui la
 * explicacion vive en el hover, igual que en el embudo: se ven las cuatro
 * etapas de golpe y el texto aparece donde estas mirando.
 */
function HowItWorksView() {
  const [activa, setActiva] = useState(null)
  const mostrada = activa === null ? flow.length - 1 : activa

  return (
    <div className="flow-console">
      <header className="zone-heading"><h2>Recorrido del sistema</h2><span>Cuatro etapas</span></header>

      <div className="flow-track" onMouseLeave={() => setActiva(null)}>
        {flow.map((step, index) => (
          <button
            aria-label={`${step.title}. ${step.copy}`}
            className={`flow-node ${index === mostrada ? 'is-active' : ''} ${index === flow.length - 1 ? 'flow-node--humana' : ''}`}
            key={step.number}
            onBlur={() => setActiva(null)}
            onFocus={() => setActiva(index)}
            onMouseEnter={() => setActiva(index)}
            type="button"
          >
            <span className="flow-node__number">{step.number}</span>
            <span className="flow-node__title">{step.title}</span>
            <span className="flow-node__agent">{step.agent}</span>
          </button>
        ))}
      </div>

      <p className="flow-readout">
        <span className={activa === null ? '' : 'is-on'}>{flow[mostrada].copy}</span>
      </p>

      <aside className="scope-note">
        <p className="section-label">Límite de esta fase</p>
        <p>No se escribe ningún dato desde aquí. Aprobar sigue ocurriendo en la hoja; enviar abre WhatsApp con el texto preparado. El panel no reemplaza a Twin ni a DAK LEADS MASTER.</p>
      </aside>
    </div>
  )
}

function LoadingState() {
  return <section aria-live="polite" className="resource-state" role="status"><span aria-hidden="true" className="loading-mark" /><div><h1>Preparando las filas de hoy</h1><p>El adaptador de lectura está cargando los datos de ejemplo.</p></div></section>
}

function ErrorState({ onRetry }) {
  return <section aria-live="assertive" className="resource-state resource-state--error" role="alert"><div><h1>No se pudieron cargar los datos</h1><p>Vuelve a intentarlo. Si el problema continúa, revisa el adaptador de lectura.</p></div><button className="retry-button" onClick={onRetry} type="button"><Icon name="retry" size={16} /><span>Volver a intentar</span></button></section>
}

function App() {
  // URLs de verdad: /inicio, /prospectos?etapa=por-enviar. Sin almohadilla.
  //
  // Que esto funcione al recargar depende de dos cosas fuera de este archivo, y
  // las dos son faciles de romper sin darse cuenta:
  //   · vite.config.js tiene que tener `base: '/'`. Con './' un asset pedido
  //     desde /prospectos se busca en /prospectos/assets/ y sale pantalla blanca.
  //   · publico/.htaccess necesita el fallback a index.html.
  const leerRuta = () => {
    const camino = window.location.pathname.replace(/^\/+|\/+$/g, '')
    return {
      vista: VIEWS.some((view) => view.id === camino) ? camino : VIEWS[0].id,
      filtros: Object.fromEntries(new URLSearchParams(window.location.search)),
    }
  }
  const getCurrentView = () => leerRuta().vista
  const [currentView, setCurrentView] = useState(getCurrentView)
  const [renderedView, setRenderedView] = useState(getCurrentView)
  const [viewPhase, setViewPhase] = useState('entered')
  const [resource, setResource] = useState({ status: 'loading', data: null })
  const [requestKey, setRequestKey] = useState(0)
  // 'corriendo' mientras se ve la intro, 'fuera' despues. `vieneDeIntro` deja
  // que el chasis se dibuje solo cuando de verdad hubo intro; si se entro
  // directo, la consola ya estaba ahi y animarla seria un parpadeo gratis.
  const [faseIntro, setFaseIntro] = useState(() => (tocaIntro() ? 'corriendo' : 'fuera'))
  const vieneDeIntro = useRef(tocaIntro()).current
  const exitTimerRef = useRef(null)
  const entryFrameRef = useRef(null)
  const renderedViewRef = useRef(renderedView)

  const clearViewTransition = () => {
    window.clearTimeout(exitTimerRef.current)
    window.cancelAnimationFrame(entryFrameRef.current)
  }

  const transitionToView = (nextView) => {
    clearViewTransition()
    setCurrentView(nextView)

    if (nextView === renderedViewRef.current) {
      setViewPhase('entered')
      return
    }

    if (document.startViewTransition) {
      // Si se cambia de vista antes de que termine la transicion anterior, el
      // navegador la aborta y rechaza `finished`. No es un fallo —el cambio se
      // aplica igual— pero sin capturarla llena la consola de
      // InvalidStateError. Se ignora a proposito: no hay nada que hacer con ella.
      const transicion = document.startViewTransition(() => {
        flushSync(() => {
          renderedViewRef.current = nextView
          setRenderedView(nextView)
          setViewPhase('entered')
        })
      })
      // Las tres promesas, no solo `finished`: al abortar tambien rechazan
      // `ready` y `updateCallbackDone`, y basta con que quede una sin capturar
      // para que el error salga igual.
      transicion.finished?.catch(() => {})
      transicion.ready?.catch(() => {})
      transicion.updateCallbackDone?.catch(() => {})
      return
    }

    setViewPhase('exiting')
    exitTimerRef.current = window.setTimeout(() => {
      renderedViewRef.current = nextView
      setRenderedView(nextView)
      setViewPhase('entering')
      entryFrameRef.current = window.requestAnimationFrame(() => {
        entryFrameRef.current = window.requestAnimationFrame(() => setViewPhase('entered'))
      })
    }, 240)
  }

  useEffect(() => {
    const syncView = () => transitionToView(getCurrentView())
    window.addEventListener('popstate', syncView)
    return () => {
      window.removeEventListener('popstate', syncView)
      clearViewTransition()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setResource({ status: 'loading', data: null })
    loadSalesData().then((data) => {
      if (!cancelled) setResource({ status: 'ready', data })
    }).catch(() => {
      if (!cancelled) setResource({ status: 'error', data: null })
    })
    return () => { cancelled = true }
  }, [requestKey])

  // Segundo argumento opcional: el recorte con el que abrir la vista.
  // Segundo argumento opcional: el recorte con el que abrir la vista. Va en el
  // hash y no en estado de React a proposito — asi el enlace se puede pegar en
  // un chat y abre exactamente lo mismo que estaba viendo quien lo mando.
  const selectView = (viewId, filtros) => {
    const consulta = filtros ? `?${new URLSearchParams(filtros)}` : ''
    const destino = `/${viewId}${consulta}`
    if (destino === window.location.pathname + window.location.search) return
    // pushState no dispara popstate, asi que la transicion se lanza a mano. El
    // listener de popstate se queda para el boton de atras del navegador.
    window.history.pushState(null, '', destino)
    transitionToView(viewId)
  }
  const data = resource.data
  const todayActions = data ? getTodayActions(data) : null
  const prospects = data ? getProspects(data) : null
  const baseHealth = data ? getBaseHealth(data) : null
  const activeView = VIEWS.find((view) => view.id === currentView) ?? VIEWS[0]
  const viewContent = renderedView === 'inicio'
    ? <PanoramaView baseHealth={baseHealth} data={data} onSelectView={selectView} prospects={prospects} todayActions={todayActions} />
    : renderedView === 'hoy'
      ? <TodayView todayActions={todayActions} />
      : renderedView === 'prospectos'
        ? <ProspectsView data={data} filtrosIniciales={leerRuta().filtros} key={window.location.pathname + window.location.search} prospects={prospects} />
        : renderedView === 'base'
          ? <BaseView baseHealth={baseHealth} />
          : <HowItWorksView />

  return (
    <>
      {/* El chasis se monta desde el primer frame aunque no se vea: la intro
          necesita medir donde esta la marca del rail para aterrizar ahi. */}
      {faseIntro !== 'fuera' && (
        <Intro datosListos={resource.status === 'ready'} onTerminada={() => setFaseIntro('fuera')} />
      )}
    <div className={`app-shell ${faseIntro === 'corriendo' ? 'app-shell--entrando' : ''} ${faseIntro === 'fuera' && vieneDeIntro ? 'app-shell--montando' : ''}`}>
      <nav aria-label="Vistas del panel" className="app-rail">
        <a
          aria-label="Ir al inicio"
          className="brand"
          href="/inicio"
          onClick={(evento) => { evento.preventDefault(); selectView('inicio') }}
        >
          {/* La D del logo de verdad. Es el mismo glifo en el que aterriza la
              intro, por eso el salto no necesita ningun disimulo. */}
          <span aria-hidden="true" className="brand__mark">
            <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg">
              <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61" />
            </svg>
          </span>
        </a>
        <div className="rail-actions">
          {VIEWS.map((view) => <button aria-current={currentView === view.id ? 'page' : undefined} aria-label={view.label} className={currentView === view.id ? 'is-active' : ''} data-view={view.id} key={view.id} onClick={() => selectView(view.id)} type="button"><Icon name={view.icon} size={17} /><span aria-hidden="true">{view.label}</span></button>)}
        </div>
      </nav>
      <header className="app-header">
        <h1>{activeView.label}</h1>
        {data && <span className="header-meta">{getSnapshotDate(data)}</span>}
        <span className="header-spacer" />
        {/* Mientras carga NO se dice nada. La primera version caia al `else`
            con `data` en null y anunciaba «En vivo» antes de haber leido una
            sola fila — justo la mentira que esta insignia existe para evitar. */}
        {data && (data.meta.esMock
          ? <Badge title={data.meta.motivoMock ?? undefined} tone="mock">Datos de ejemplo</Badge>
          : <Badge tone="oro">En vivo</Badge>)}
      </header>
      <main className={`main-content main-content--${renderedView}`}>
        {resource.status === 'loading' && <LoadingState />}
        {resource.status === 'error' && <ErrorState onRetry={() => setRequestKey((key) => key + 1)} />}
        {resource.status === 'ready' && <div className={`view-frame view-frame--${viewPhase}`} key={renderedView}>{viewContent}</div>}
      </main>
    </div>
    </>
  )
}

export default App
