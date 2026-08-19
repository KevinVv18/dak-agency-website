import React, { useEffect, useMemo, useState } from 'react'
import {
  getBaseHealth,
  getDisplayName,
  getOpener,
  getProspects,
  getTodayActions,
  loadSalesData,
} from './lib/sales'

const VIEWS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'prospectos', label: 'Prospectos' },
  { id: 'base', label: 'Base' },
  { id: 'como-funciona', label: 'Cómo funciona' },
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
    arrow: <path d="M5 19 19 5M9 5h10v10" />,
    copy: (
      <>
        <rect width="12" height="12" x="8" y="8" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
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
      className={`copy-button ${status === 'error' ? 'copy-button--error' : ''}`}
      disabled={!canCopy}
      onClick={copy}
      type="button"
    >
      <Icon name="copy" size={15} />
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

function TodayView({ todayActions }) {
  return (
    <>
      <PageHeading title="Qué necesita pasar hoy">
        <p>Ocho conversaciones están detenidas antes del primer contacto. Primero se revisan las cinco pendientes; después se envían las tres aprobadas.</p>
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
      <PageHeading title="Prospectos y contexto"><p>Tabla derivada de las filas disponibles. Selecciona una fila para leer una ficha humana, no una exportación de columnas.</p></PageHeading>
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
        <ProspectDetail data={data} prospect={selectedProspect} />
      </section>
    </>
  )
}

function BaseView({ baseHealth }) {
  return (
    <>
      <PageHeading title="¿Qué fuente merece más trabajo?"><p>Esta vista no enumera la base cruda. Contrasta el rendimiento que reporta cada fuente con los contactos que realmente quedaron validados.</p></PageHeading>
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
      <PageHeading title="Cómo se mueve un prospecto"><p>Twin y DAK LEADS MASTER mantienen la operación. Este panel solo presenta una vista de lectura para que las decisiones humanas no queden ocultas entre columnas.</p></PageHeading>
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
    return VIEWS.some((view) => view.id === requested) ? requested : 'hoy'
  }
  const [currentView, setCurrentView] = useState(getCurrentView)
  const [resource, setResource] = useState({ status: 'loading', data: null })
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const syncView = () => setCurrentView(getCurrentView())
    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
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

  const selectView = (viewId) => { window.location.hash = viewId }
  const data = resource.data
  const todayActions = data ? getTodayActions(data) : null
  const prospects = data ? getProspects(data) : null
  const baseHealth = data ? getBaseHealth(data) : null

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#hoy" onClick={() => selectView('hoy')}><span aria-hidden="true" className="brand__mark"><i /><i /><i /></span><span><strong>DAK</strong><small>Sales Control Center</small></span></a>
        <nav aria-label="Vistas del panel" className="primary-nav">
          {VIEWS.map((view) => <button aria-current={currentView === view.id ? 'page' : undefined} className={currentView === view.id ? 'is-active' : ''} key={view.id} onClick={() => selectView(view.id)} type="button">{view.label}</button>)}
        </nav>
        {data?.meta.esMock && <Badge tone="mock">Datos de ejemplo</Badge>}
      </header>
      <main className="main-content">
        {resource.status === 'loading' && <LoadingState />}
        {resource.status === 'error' && <ErrorState onRetry={() => setRequestKey((key) => key + 1)} />}
        {resource.status === 'ready' && currentView === 'hoy' && <TodayView todayActions={todayActions} />}
        {resource.status === 'ready' && currentView === 'prospectos' && <ProspectsView data={data} prospects={prospects} />}
        {resource.status === 'ready' && currentView === 'base' && <BaseView baseHealth={baseHealth} />}
        {resource.status === 'ready' && currentView === 'como-funciona' && <HowItWorksView />}
      </main>
      <footer className="app-footer"><span>Modo mock · teléfonos redactados · lectura únicamente</span><span>Fuente: DAK LEADS MASTER + inventario inbound</span></footer>
    </div>
  )
}

export default App
