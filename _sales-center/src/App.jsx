import React, { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  getBaseHealth,
  getDisplayName,
  getOpener,
  getProspects,
  getShortName,
  getTodayActions,
  loadSalesData,
} from './lib/sales'

const VIEWS = [
  { id: 'panorama', label: 'Panorama', icon: 'panorama' },
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
 * Falta a proposito el hueco de "sin dato" por cada red: la hoja no trae ni una
 * sola red social rellena, asi que enseñar cinco huecos vacios seria ruido con
 * forma de dato. Se pintan solo los enlaces que existen, y si no hay ninguno se
 * dice en una linea. Web sale en 7 de 12 y Maps en 9 de 12; las redes se
 * pintaran solas el dia que el pipeline las traiga.
 */
function EnlacesEmpresa({ prospect }) {
  const redes = prospect.contacto?.redes ?? {}
  const enlaces = [
    { etiqueta: 'Web', href: getHref(prospect.web) },
    { etiqueta: 'Google Maps', href: getHref(prospect.mapsUrl) },
    { etiqueta: 'Instagram', href: getHref(redes.instagram) },
    { etiqueta: 'Facebook', href: getHref(redes.facebook) },
    { etiqueta: 'LinkedIn', href: getHref(redes.linkedin) },
    { etiqueta: 'TikTok', href: getHref(redes.tiktok) },
  ].filter((enlace) => enlace.href)

  return (
    <div className="company-links">
      <span className="context-label">Mirar a la empresa</span>
      {enlaces.length ? (
        <p>
          {enlaces.map((enlace) => (
            <a href={enlace.href} key={enlace.etiqueta} rel="noreferrer noopener" target="_blank">
              {enlace.etiqueta}
              <Icon name="arrow" size={12} />
            </a>
          ))}
        </p>
      ) : (
        <p className="empty-inline">Sin enlaces públicos verificados.</p>
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

      <EnlacesEmpresa prospect={prospect} />

      <div className="message-card__message">
        <span className="context-label">Mensaje tal como se enviaría</span>
        <p>{valueOrMissing(message?.texto)}</p>
      </div>

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

function getSnapshotDate(data) {
  const source = data.meta?.fuentes?.outbound ?? ''
  const date = source.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  return formatDate(date)
}

function PanoramaView({ data, todayActions, prospects, baseHealth, onSelectView }) {
  // Que etapa del embudo se esta señalando. Vive aqui y no en cada nodo porque
  // la linea de estado es UNA sola y compartida.
  const [activeStage, setActiveStage] = useState(null)
  const processed = baseHealth.length && baseHealth.every((source) => source.procesadas !== null)
    ? baseHealth.reduce((total, source) => total + source.procesadas, 0)
    : null
  const funnel = [
    { label: 'Minadas', value: processed, note: 'Base procesada por las fuentes disponibles.' },
    { label: 'Investigadas', value: data.meta?.totales?.outbound, note: 'Prospectos outbound con investigación comercial.' },
    { label: 'Con mensaje', value: data.meta?.totales?.mensajes, note: 'Contacto verificado y mensaje redactado.' },
    { label: 'Aprobadas', value: data.meta?.embudo?.porEnviar, note: 'Listas para salir por WhatsApp.' },
    { label: 'Enviadas', value: data.meta?.embudo?.enviados, note: 'Contactos registrados como enviados.', warning: true },
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
              <div
                aria-label={`${valueOrMissing(stage.value)} ${stage.label}. ${stage.note}`}
                className={`funnel-node ${stage.warning ? 'funnel-node--warning' : ''} ${activeStage === index ? 'is-active' : ''}`}
                onBlur={() => setActiveStage(null)}
                onFocus={() => setActiveStage(index)}
                onMouseEnter={() => setActiveStage(index)}
                tabIndex="0"
              >
                <span className="funnel-node__survival">{index ? wholePercent(stage.value, funnel[index - 1].value) : stage.value === null ? missing : '100 %'}</span>
                <strong>{valueOrMissing(stage.value)}</strong>
                <span className="funnel-node__label">{stage.label}</span>
                <span className="funnel-node__measure"><i style={{ '--measure': Math.max((stage.value ?? 0) / maxFunnel, 0) }} /></span>
              </div>
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
          </div>
        </section>

        <section className="console-zone coverage-zone" aria-labelledby="coverage-title">
          <header className="zone-heading"><h2 id="coverage-title">Dónde están</h2><span>Outbound · derivado</span></header>
          <div className="coverage-list">
            {cities.map(([city, count]) => <div className="coverage-row" key={city}><span>{city}</span><strong>{count}</strong><i><b style={{ '--measure': count / maxCity }} /></i></div>)}
          </div>
        </section>

        <section className="console-zone inbound-zone" aria-labelledby="inbound-title">
          <header className="zone-heading"><h2 id="inbound-title">Vinieron solos</h2></header>
          <div className="inbound-signal">
            <strong>{valueOrMissing(data.meta?.totales?.inbound)}</strong>
            <span>Chat y WhatsApp</span>
            <p>{newestInbound ? `Uno del ${formatDate(newestInbound.fechaDeteccion).replace(/\s+\d{4}$/, '')} sigue sin responsable` : `Último ingreso: ${missing}`}</p>
          </div>
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
        <PotentialGauge value={prospect.potencialNegocio} />
        <span className="work-row__score">{valueOrMissing(valor)}</span>
      </span>
      <span aria-hidden="true" className="work-row__meter">
        <i style={{ '--w': `${Math.min(valor ?? 0, 100)}%` }} />
      </span>
    </button>
  )
}

function TodayView({ todayActions }) {
  const grupos = [
    { id: 'aprobar', titulo: 'Por aprobar', items: todayActions.pending },
    { id: 'enviar', titulo: 'Por enviar', items: todayActions.readyToSend, listo: true },
    { id: 'espera', titulo: 'Esperando respuesta', items: todayActions.waitingForReply },
  ].filter((grupo) => grupo.items.length)

  const filas = grupos.flatMap((grupo) =>
    grupo.items.map((item) => ({ ...item, grupo: grupo.id, listo: Boolean(grupo.listo) })),
  )

  const [elegido, setElegido] = useState(null)
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

  return (
    <div className="work-split">
      <div className="work-queue" onKeyDown={alTeclado}>
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
                    <WorkRow onSelect={setElegido} prospect={prospect} selected={seleccionada} />
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
        <MessageCard message={activo.message} prospect={activo.prospect} readyToSend={activo.listo} />
      </div>
    </div>
  )
}

function ScoreBreakdown({ prospect }) {
  if (!prospect.scoreDetalle) return <p className="empty-inline">Detalle de score: {missing}</p>

  const detailEntries = [
    ['Potencial', prospect.scoreDetalle.potencial], ['Señal', prospect.scoreDetalle.senal],
    ['Oportunidad', prospect.scoreDetalle.oportunidad], ['Encaje', prospect.scoreDetalle.encaje],
    ['Contactabilidad', prospect.scoreDetalle.contactabilidad],
  ]
  const sum = detailEntries.reduce((total, [, value]) => total + value, 0)

  return (
    <div className="score-breakdown">
      {detailEntries.map(([label, value]) => <div className="score-breakdown__item" key={label}><span>{label}</span><strong>{valueOrMissing(value)}</strong></div>)}
      <div className="score-breakdown__total"><span>Suma de componentes <em>vista derivada</em></span><strong>{sum}</strong></div>
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

  return (
    <aside aria-live="polite" className="prospect-detail">
      <div className="prospect-detail__header">
        <div><span className="detail-kicker">Ficha derivada del registro</span><h2>{getDisplayName(prospect)}</h2></div>
        <Badge tone={prospect.origen === 'inbound' ? 'oro' : 'marca'}>{prospect.origen === 'inbound' ? 'Llegó solo' : 'Búsqueda activa'}</Badge>
      </div>
      <div className="detail-grid">
        <Field label="Etapa" value={stages[prospect.etapa]} /><Field label="Fuente" value={prospect.fuente} />
        <Field label="Detectado" value={formatDate(prospect.fechaDeteccion)} /><Field label="Responsable" value={prospect.responsable} />
      </div>
      <div className="detail-section">
        <p className="section-label">Qué sabemos</p><Field label="Rubro" value={prospect.rubro} /><Field label="Ciudad" value={prospect.ciudad} />
        <Field label="Oportunidad detectada" value={prospect.oportunidad} /><Field label="Evidencia" value={prospect.evidencia} />
      </div>
      <div className="detail-section"><p className="section-label">Por qué importa</p><p className="detail-prose">{valueOrMissing(prospect.senalCompra)}</p><p className="detail-prose">{valueOrMissing(prospect.porQueAhora)}</p></div>
      <div className="detail-section">
        <p className="section-label">Qué ofrecer</p><Field label="Servicio sugerido" value={prospect.servicioSugerido} />
        <Field label="Ángulo comercial" value={prospect.anguloVenta} /><Field label="Primera oferta" value={message?.primeraOferta} />
      </div>
      <div className="detail-section">
        <p className="section-label">Cómo contactarlo</p><Field label="Canal" value={contact.canal} /><Field label="Contacto" value={contact.handle} />
        <Field label="Por qué ese canal" value={contact.motivoCanal} /><Field label="Mejor momento" value={contact.mejorMomento} />
      </div>
      <div className="detail-section"><div className="score-heading"><p className="section-label">Por qué puntúa así</p><strong>Score {valueOrMissing(prospect.score)}</strong></div><ScoreBreakdown prospect={prospect} /></div>
      <div className="detail-actions"><CopyButton label="Copiar ficha" text={buildProspectCopy(prospect, message)} /><SourceLink prospect={prospect} /></div>
    </aside>
  )
}

function ProspectsView({ data, prospects }) {
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState('todos')
  const [stage, setStage] = useState('todas')
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? null)
  const filteredProspects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    return prospects.filter((prospect) => {
      const matchesQuery = !normalizedQuery || [prospect.empresa, prospect.persona, prospect.fuente, prospect.rubro, prospect.ciudad].filter(Boolean).some((value) => value.toLocaleLowerCase('es').includes(normalizedQuery))
      return matchesQuery && (origin === 'todos' || prospect.origen === origin) && (stage === 'todas' || prospect.etapa === stage)
    })
  }, [origin, prospects, query, stage])
  const selectedProspect = filteredProspects.find((prospect) => prospect.id === selectedId) ?? filteredProspects[0] ?? null

  // Las quince filas se agrupan por etapa del embudo. Una lista plana de quince
  // nombres no dice nada; agrupada, la forma del embudo se lee en la propia
  // columna sin mirar Panorama.
  const porEtapa = Object.entries(stages)
    .map(([clave, titulo]) => ({ clave, titulo, items: filteredProspects.filter((p) => p.etapa === clave) }))
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
    <div className="work-split">
      <div className="work-queue" onKeyDown={alTeclado}>
        <div className="filter-bar">
          <label className="search-field">
            <span>Buscar</span>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Empresa, fuente, ciudad…" type="search" value={query} />
          </label>
          <label>
            <span>Origen</span>
            <select onChange={(event) => setOrigin(event.target.value)} value={origin}>
              <option value="todos">Todos</option>
              <option value="outbound">Búsqueda activa</option>
              <option value="inbound">Llegaron solos</option>
            </select>
          </label>
          <label>
            <span>Etapa</span>
            <select onChange={(event) => setStage(event.target.value)} value={stage}>
              <option value="todas">Todas</option>
              {Object.entries(stages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        {porEtapa.map((grupo) => (
          <section className="work-group" key={grupo.clave}>
            <header><h2>{grupo.titulo}</h2><span>{grupo.items.length}</span></header>
            <ul>
              {grupo.items.map((prospect) => (
                <li key={prospect.id}>
                  <WorkRow
                    metric="score"
                    onSelect={setSelectedId}
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
            <div><h3>Sin resultados</h3><p>Ninguna fila del mock coincide con estos filtros.</p></div>
          </div>
        )}
      </div>

      <div className="work-detail" key={selectedProspect?.id ?? 'empty'}>
        <ProspectDetail data={data} prospect={selectedProspect} />
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
  const getCurrentView = () => {
    const requested = window.location.hash.replace('#', '')
    return VIEWS.some((view) => view.id === requested) ? requested : 'panorama'
  }
  const [currentView, setCurrentView] = useState(getCurrentView)
  const [renderedView, setRenderedView] = useState(getCurrentView)
  const [viewPhase, setViewPhase] = useState('entered')
  const [resource, setResource] = useState({ status: 'loading', data: null })
  const [requestKey, setRequestKey] = useState(0)
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
    window.addEventListener('hashchange', syncView)
    return () => {
      window.removeEventListener('hashchange', syncView)
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

  const selectView = (viewId) => {
    if (viewId === currentView) return
    window.location.hash = viewId
  }
  const data = resource.data
  const todayActions = data ? getTodayActions(data) : null
  const prospects = data ? getProspects(data) : null
  const baseHealth = data ? getBaseHealth(data) : null
  const activeView = VIEWS.find((view) => view.id === currentView) ?? VIEWS[0]
  const viewContent = renderedView === 'panorama'
    ? <PanoramaView baseHealth={baseHealth} data={data} onSelectView={selectView} prospects={prospects} todayActions={todayActions} />
    : renderedView === 'hoy'
      ? <TodayView todayActions={todayActions} />
      : renderedView === 'prospectos'
        ? <ProspectsView data={data} prospects={prospects} />
        : renderedView === 'base'
          ? <BaseView baseHealth={baseHealth} />
          : <HowItWorksView />

  return (
    <div className="app-shell">
      <nav aria-label="Vistas del panel" className="app-rail">
        <a aria-label="Ir a Panorama" className="brand" href="#panorama" onClick={() => selectView('panorama')}><span aria-hidden="true" className="brand__mark"><i /><i /><i /></span></a>
        <div className="rail-actions">
          {VIEWS.map((view) => <button aria-current={currentView === view.id ? 'page' : undefined} aria-label={view.label} className={currentView === view.id ? 'is-active' : ''} data-view={view.id} key={view.id} onClick={() => selectView(view.id)} type="button"><Icon name={view.icon} size={17} /><span aria-hidden="true">{view.label}</span></button>)}
        </div>
      </nav>
      <header className="app-header">
        <h1>{activeView.label}</h1>
        {data && <span className="header-meta">{getSnapshotDate(data)}</span>}
        <span className="header-spacer" />
        {data?.meta.esMock && <Badge tone="mock">Datos de ejemplo</Badge>}
      </header>
      <main className={`main-content main-content--${renderedView}`}>
        {resource.status === 'loading' && <LoadingState />}
        {resource.status === 'error' && <ErrorState onRetry={() => setRequestKey((key) => key + 1)} />}
        {resource.status === 'ready' && <div className={`view-frame view-frame--${viewPhase}`} key={renderedView}>{viewContent}</div>}
      </main>
    </div>
  )
}

export default App
