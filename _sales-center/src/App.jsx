import React, { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  getBaseHealth,
  getDisplayName,
  getOpener,
  getProspects,
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

function QueueHeader({ title, copy, count, tone = 'violet' }) {
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
            <Badge tone={readyToSend ? 'teal' : 'violet'}>
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
            <button className="decision-row decision-row--teal" onClick={() => onSelectView('hoy')} type="button">
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

function TodayView({ todayActions }) {
  const blockers = todayActions.pending.length + todayActions.readyToSend.length
  return (
    <>
      <PageHeading title={`${blockers} bloqueos`}>
        <p>Vista derivada de las colas por aprobar y por enviar.</p>
      </PageHeading>

      <section className="queue-section" aria-labelledby="pending-heading">
        <QueueHeader count={todayActions.pending.length} title="Por aprobar" copy="Lee el mensaje completo, su contexto y sus respuestas antes de decidir en la hoja." />
        <div className="message-stack">
          {todayActions.pending.map(({ prospect, message }) => <MessageCard key={prospect.id} message={message} prospect={prospect} />)}
        </div>
      </section>

      <section className="queue-section" aria-labelledby="ready-heading">
        <QueueHeader count={todayActions.readyToSend.length} title="Por enviar" tone="teal" copy="Ya fueron aprobados. Relee el opener y abre WhatsApp con el texto ya preparado." />
        <div className="message-stack">
          {todayActions.readyToSend.map(({ prospect, message }) => <MessageCard key={prospect.id} message={message} prospect={prospect} readyToSend />)}
        </div>
      </section>

      <section className="queue-section queue-section--reply" aria-labelledby="reply-heading">
        <QueueHeader count={todayActions.waitingForReply.length} title="Esperando respuesta" tone="neutral" copy="Seguimiento de los contactos que ya salieron y todavía no respondieron." />
        {todayActions.waitingForReply.length ? (
          <div className="message-stack">
            {todayActions.waitingForReply.map(({ prospect, message }) => <MessageCard key={prospect.id} message={message} prospect={prospect} />)}
          </div>
        ) : <EmptyReplyState />}
      </section>
    </>
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
        <Badge tone={prospect.origen === 'inbound' ? 'teal' : 'violet'}>{prospect.origen === 'inbound' ? 'Llegó solo' : 'Búsqueda activa'}</Badge>
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

  return (
    <>
      <PageHeading title={`${prospects.length} prospectos`}><p>Vista derivada · selecciona una fila para abrir su contexto.</p></PageHeading>
      <section className="prospect-workbench">
        <div className="prospect-list">
          <div className="filter-bar">
            <label className="search-field"><span>Buscar</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Empresa, persona, fuente…" type="search" value={query} /></label>
            <label><span>Origen</span><select onChange={(event) => setOrigin(event.target.value)} value={origin}><option value="todos">Todos</option><option value="outbound">Búsqueda activa</option><option value="inbound">Llegaron solos</option></select></label>
            <label><span>Etapa</span><select onChange={(event) => setStage(event.target.value)} value={stage}><option value="todas">Todas</option>{Object.entries(stages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <p className="derived-note prospect-list__count">{filteredProspects.length} filas encontradas · vista derivada del mock.</p>
          <div className="table-wrap"><table><thead><tr><th scope="col">Prospecto</th><th scope="col">Origen</th><th scope="col">Etapa</th><th scope="col">Score</th><th scope="col">Contacto</th></tr></thead><tbody>
            {filteredProspects.map((prospect) => <tr className={selectedProspect?.id === prospect.id ? 'is-selected' : ''} key={prospect.id}><td><button aria-pressed={selectedProspect?.id === prospect.id} className="table-select" onClick={() => setSelectedId(prospect.id)} type="button"><span>{getDisplayName(prospect)}</span><small>{valueOrMissing(prospect.fuente)}</small></button></td><td>{prospect.origen === 'inbound' ? 'Llegó solo' : 'Búsqueda activa'}</td><td>{valueOrMissing(stages[prospect.etapa])}</td><td>{valueOrMissing(prospect.score)}</td><td>{valueOrMissing(prospect.contacto?.handle)}</td></tr>)}
          </tbody></table></div>
          {!filteredProspects.length && <div className="empty-state empty-state--compact"><div><h3>Sin resultados</h3><p>Ninguna fila del mock coincide con estos filtros.</p></div></div>}
        </div>
        <ProspectDetail data={data} key={selectedProspect?.id ?? 'empty'} prospect={selectedProspect} />
      </section>
    </>
  )
}

function BaseView({ baseHealth }) {
  return (
    <>
      <PageHeading title={`${baseHealth.length} ${baseHealth.length === 1 ? 'fuente' : 'fuentes'}`}><p>Rendimiento reportado · vista derivada.</p></PageHeading>
      <section className="base-grid">
        {baseHealth.map((source) => <article className="source-card" key={source.fuente}>
          <div className="source-card__heading"><div><span className="detail-kicker">Fuente · vista derivada</span><h2>{source.fuente}</h2></div></div>
          <div className="source-metrics"><div><span>Procesadas</span><strong>{valueOrMissing(source.procesadas)}</strong></div><div><span>Aceptadas</span><strong>{valueOrMissing(source.aceptadas)}</strong></div><div><span>Rendimiento reportado</span><strong>{formatPercent(source.rendimiento)}</strong></div><div><span>Contactos validados</span><strong>{valueOrMissing(source.contactosValidados)}</strong></div></div>
          <div className="source-card__decision"><p className="section-label">Lectura para decidir</p><p>La fuente reporta {formatPercent(source.rendimiento)} de aceptación y {valueOrMissing(source.contactosValidados)} contactos validados. La decisión de continuar o pausar requiere comparar este rendimiento con las demás fuentes cuando haya datos.</p></div>
          <div className="source-card__notes"><p className="section-label">Nota de la fuente</p><p>{valueOrMissing(source.notas)}</p></div>
        </article>)}
      </section>
    </>
  )
}

const flow = [
  { number: '01', title: 'Base identificada', copy: 'Se procesan empresas de fuentes como Cámara, Apollo, Apify o reactivación. No toda la base es vendible todavía.', agent: 'Database Reactivation' },
  { number: '02', title: 'Investigación y encaje', copy: 'Se documentan señal, oportunidad y servicio sugerido. El prospecto pasa de una fila de base a una hipótesis comercial.', agent: 'Lead Hunter' },
  { number: '03', title: 'Mensaje preparado', copy: 'Con un contacto verificado, se redactan opener, respuestas a objeciones y seguimientos. La prioridad se revisa antes de aprobar.', agent: 'Outreach Strategist' },
  { number: '04', title: 'Decisión y contacto', copy: 'Una persona aprueba en la hoja y envía desde WhatsApp. La respuesta y el seguimiento se registran en la fuente de verdad.', agent: 'Decisión humana' },
]

function HowItWorksView() {
  return (
    <>
      <PageHeading title={`${flow.length} etapas`}><p>Twin y DAK LEADS MASTER mantienen la operación.</p></PageHeading>
      <section aria-label="Embudo comercial de cuatro etapas" className="flow-diagram">
        {flow.map((step, index) => <article className="flow-step" key={step.number}><span className="flow-step__number">{step.number}</span><div><p className="section-label">Etapa {index + 1}</p><h2>{step.title}</h2><p>{step.copy}</p><Badge tone={index === 3 ? 'teal' : 'outline'}>{step.agent}</Badge></div></article>)}
      </section>
      <aside className="scope-note"><p className="section-label">Límite de esta fase</p><p>No se escribe ningún dato desde este sitio. Aprobar sigue ocurriendo en la hoja; enviar abre WhatsApp con el texto preparado. El panel no reemplaza a Twin ni a DAK LEADS MASTER.</p></aside>
    </>
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
      document.startViewTransition(() => {
        flushSync(() => {
          renderedViewRef.current = nextView
          setRenderedView(nextView)
          setViewPhase('entered')
        })
      })
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
