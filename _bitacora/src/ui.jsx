/**
 * Piezas de interfaz compartidas por las dos conchas.
 *
 * Fase 1: sobrias y correctas. La pasada de diseño es la Fase 3; lo que no debe
 * cambiar entonces es la estructura ni los tamaños de toque.
 */

export function Marca() {
  return (
    <div className="marca" aria-hidden="true">
      <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg">
        <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61" />
      </svg>
    </div>
  )
}

export function Boton({ children, variante = 'normal', ...resto }) {
  return (
    <button className={`boton boton--${variante}`} {...resto}>
      {children}
    </button>
  )
}

export function Cargando({ que = 'Cargando…' }) {
  // Texto, no un esqueleto que brilla. Un esqueleto animado sobre una pantalla
  // que casi siempre tarda 200 ms se lee como que algo va mal.
  return <p className="cargando">{que}</p>
}

export function Aviso({ children, tono = 'alerta' }) {
  return (
    <p className={`aviso aviso--${tono}`} role={tono === 'alerta' ? 'alert' : undefined}>
      <b />
      <span>{children}</span>
    </p>
  )
}

/**
 * «Sin dato» es un estado de primera clase.
 *
 * Nunca un cero, nunca un guion ambiguo, nunca un valor estimado: un hueco
 * honesto se entiende, y un cero inventado engaña.
 */
export function Dato({ etiqueta, children }) {
  const vacio = children === null || children === undefined || children === ''
  return (
    <div className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <span className={vacio ? 'campo__valor sin-dato' : 'campo__valor'}>
        {vacio ? 'sin dato' : children}
      </span>
    </div>
  )
}

export const ETIQUETAS_ESTADO = {
  BACKLOG: 'Por hacer',
  PROXIMO: 'Próximo',
  EN_PRODUCCION: 'En producción',
  REVISION: 'En revisión',
  CAMBIOS: 'Con cambios',
  PAUSADO: 'Pausado',
  BLOQUEADO: 'Bloqueado',
  TERMINADO: 'Terminado',
}

export function Estado({ valor }) {
  return <span className={`estado estado--${valor}`}>{ETIQUETAS_ESTADO[valor] || valor}</span>
}

/** «2026-08-31» → «31 de agosto». */
export function fechaLarga(iso) {
  if (!iso) return null
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} de ${meses[m - 1]}${a !== new Date().getFullYear() ? ` de ${a}` : ''}`
}

/** «hace 3 días» a partir de un DATETIME de Lima. Sin librería. */
export function hace(iso) {
  if (!iso) return null
  const t = new Date(iso.replace(' ', 'T')).getTime()
  const min = Math.round((Date.now() - t) / 60000)
  if (min < 2) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}
