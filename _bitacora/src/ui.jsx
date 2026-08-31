/**
 * Las piezas de la mesa de montaje.
 *
 * El estado es una MARCA, no un tono, y eso se construye en dos escalas:
 *
 *   · el GLIFO, dentro de la fila que se pulsa (38 px)
 *   · el SELLO, estampado sobre el fotograma a tamaño de fotograma
 *
 * La primera construcción sólo tenía glifos, todos encerrados en el mismo
 * marco con seis perforaciones: a 30 px el trazo que los diferenciaba eran diez
 * píxeles y las cinco marcas se leían como cinco cajitas naranjas iguales.
 * Aquí el gesto llena la caja y no hay marco compartido — el marco ya lo pone
 * la fila, que es un fotograma.
 *
 * Y elegir no rellena el botón de color: estampa el gesto sobre la pieza. Un
 * relleno de color es un tono; una cruz de graso sobre el fotograma es una
 * marca.
 */

export function Logo() {
  return (
    <span className="riel__logo" aria-hidden="true">
      <svg viewBox="0 0 521.16 420.36" xmlns="http://www.w3.org/2000/svg">
        <polygon points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61" />
      </svg>
    </span>
  )
}

/* ── Los glifos: el gesto solo, llenando su caja ─────────────────────────*/

function Glifo({ children }) {
  return (
    <svg
      className="marca__glifo"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** CONTINÚO — la banderita de cinta doblada sobre la perforación. */
const GlifoBandera = () => (
  <Glifo>
    <path d="M5.5 22V2.4" />
    <path d="M5.5 3.6h13.5l-3.6 4.3 3.6 4.3H5.5" fill="none" />
  </Glifo>
)

/** TERMINÉ MI PARTE — la cruz de graso. */
const GlifoCruz = () => (
  <Glifo>
    <path d="M3.4 3.8 20.6 20.4" strokeWidth="3.2" />
    <path d="M20.6 3.6 3.4 20.2" strokeWidth="3.2" />
  </Glifo>
)

/** PAUSÉ — colgado de un pincho. */
const GlifoPincho = () => (
  <Glifo>
    <circle cx="12" cy="3.6" r="2.4" />
    <path d="M12 6v3.4" />
    <path d="M7.6 9.6h8.8l-1.4 12.2H9z" />
  </Glifo>
)

/** BLOQUEADO — la esquina perforada: no puede avanzar. */
const GlifoPerforado = () => (
  <Glifo>
    <path d="M3.2 3.2h9.6l7.8 7.8v9.8H3.2z" />
    <path d="M12.8 3.2V11h7.8" />
    <circle cx="10.4" cy="15.4" r="3.1" strokeWidth="3" />
  </Glifo>
)

/**
 * NO TRABAJÉ ESTO — un tramo de tira en blanco que pasó de largo.
 *
 * Estuvo como una flecha dentro de una caja, que es un icono genérico de
 * interfaz y no una marca física. Aquí son las dos hileras de perforación con
 * nada en medio: película que corrió sin que nadie la tocara.
 */
const GlifoPasa = () => (
  <Glifo>
    <path d="M2.2 4.6h1.6M7.2 4.6h1.6M12.2 4.6h1.6M17.2 4.6h1.6M22 4.6h.2" strokeWidth="3" />
    <path d="M2.2 19.4h1.6M7.2 19.4h1.6M12.2 19.4h1.6M17.2 19.4h1.6M22 19.4h.2" strokeWidth="3" />
  </Glifo>
)

/* ── Los sellos: el mismo gesto, a tamaño de fotograma ──────────────────
 *
 * `preserveAspectRatio="none"` estira la geometría a la caja, y
 * `vector-effect: non-scaling-stroke` mantiene el grosor del trazo uniforme —
 * sin eso, estirar convierte una cruz limpia en dos cuñas deformes.
 */

function Sello({ children }) {
  return (
    <span className="sello" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      >
        {children}
      </svg>
    </span>
  )
}

const SELLOS = {
  termine: (
    <Sello>
      <path d="M6 8 94 92" style={{ vectorEffect: 'non-scaling-stroke' }} />
      <path d="M94 8 6 92" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </Sello>
  ),
  continuo: (
    <Sello>
      <path d="M12 4V96" style={{ vectorEffect: 'non-scaling-stroke' }} />
      <path d="M12 10h46l-14 15 14 15H12" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </Sello>
  ),
  pause: (
    <Sello>
      <circle cx="50" cy="12" r="7" style={{ vectorEffect: 'non-scaling-stroke' }} />
      <path d="M50 19v14" style={{ vectorEffect: 'non-scaling-stroke' }} />
      <path d="M28 33h44l-6 60H34z" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </Sello>
  ),
  bloqueado: (
    <Sello>
      <circle cx="50" cy="50" r="26" style={{ vectorEffect: 'non-scaling-stroke' }} />
      <path d="M50 4v20M50 76v20" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </Sello>
  ),
  no_trabaje: (
    <Sello>
      <path
        d="M4 14h6M20 14h6M36 14h6M52 14h6M68 14h6M84 14h6"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
      <path
        d="M4 86h6M20 86h6M36 86h6M52 86h6M68 86h6M84 86h6"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
    </Sello>
  ),
}

export function SelloDe({ desenlace }) {
  return SELLOS[desenlace] || null
}

/**
 * Los cinco desenlaces, en el orden en que se piensan al final del día: lo que
 * sigue vivo primero, lo excepcional al final.
 *
 * «Terminé mi parte» y no «Terminé»: Fabián nunca cierra una pieza, la manda a
 * revisión. Que el botón lo diga evita creer que algo quedó cerrado cuando
 * sigue esperando a otra persona.
 */
export const DESENLACES = [
  { id: 'continuo', texto: 'Continúo', Glifo: GlifoBandera },
  { id: 'termine', texto: 'Terminé mi parte', Glifo: GlifoCruz },
  { id: 'pause', texto: 'Pausé', Glifo: GlifoPincho },
  { id: 'bloqueado', texto: 'Estoy bloqueado', Glifo: GlifoPerforado },
  { id: 'no_trabaje', texto: 'No trabajé esto', Glifo: GlifoPasa },
]

export const TIPOS_BLOQUEO = [
  { id: 'falta_material', texto: 'Falta material' },
  { id: 'esperando_aprobacion', texto: 'Esperando aprobación' },
  { id: 'esperando_cliente', texto: 'Esperando cliente' },
  { id: 'falta_recurso', texto: 'Falta recurso' },
  { id: 'problema_tecnico', texto: 'Problema técnico' },
  { id: 'otro', texto: 'Otro' },
]

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

/* ── Piezas ─────────────────────────────────────────────────────────────*/

export function Marca({ desenlace, elegida = false, onClick }) {
  const { Glifo: G, texto } = desenlace
  return (
    <button
      type="button"
      className={elegida ? 'marca marca--elegida' : 'marca tinta'}
      onClick={onClick}
    >
      <G />
      <span>{texto}</span>
    </button>
  )
}

export function Boton({ children, variante, ...resto }) {
  return (
    <button className={variante ? `boton boton--${variante}` : 'boton tinta'} {...resto}>
      {children}
    </button>
  )
}

/**
 * La cinta: marca y estado de una pieza.
 *
 * NO va encima del titular. Un rótulo en versales pequeñas apilado sobre un
 * encabezado está prohibido sin excepción por el suelo de calidad, y la primera
 * construcción lo puso en todas las pantallas. Aquí es una cinta pegada bajo el
 * fotograma, que es donde un montador escribe sobre la tira.
 */
export function Cinta({ children, sobreTinta = false }) {
  return <span className={sobreTinta ? 'cinta cinta--tinta' : 'cinta'}>{children}</span>
}

/**
 * Un dato del fotograma. «Sin dato» es un estado de primera clase: nunca un
 * cero, nunca un guion ambiguo. Un hueco honesto se entiende; un cero inventado
 * engaña.
 */
export function Apunte({ etiqueta, children }) {
  const vacio = children === null || children === undefined || children === ''
  return (
    <div className="apunte">
      <span className="apunte__etiqueta">{etiqueta}</span>
      <span className={vacio ? 'sin-dato' : undefined}>{vacio ? 'sin dato' : children}</span>
    </div>
  )
}

/** La prosa vive en ventana blanca. Es la regla del mundo, y se cumple aquí. */
export function Aviso({ titulo, children }) {
  return (
    <p className="aviso" role="status">
      {titulo ? <b>{titulo}</b> : null}
      {children}
    </p>
  )
}

export function Cargando({ que = 'Enhebrando…' }) {
  return <p className="cargando">{que}</p>
}

/** El cesto: lo apartado, colgando de sus pinchos. Está, se ve, no pide nada. */
export function Cesto({ titulo, piezas, alto = false }) {
  if (!piezas || piezas.length === 0) return null
  return (
    <section className={alto ? 'cesto cesto--alto' : 'cesto'}>
      <h2 className="cesto__titulo">
        {titulo} <span className="cifra">{piezas.length}</span>
      </h2>
      <div className="cesto__carril">
        {piezas.map((p, i) => (
          <article
            key={p.id}
            className="trim tinta"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <p className="trim__titulo">{p.titulo}</p>
            <p className="trim__pie">{ETIQUETAS_ESTADO[p.estado] || p.estado}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Cuántos fotogramas del día llevas. Ticks al paso, no una barra redondeada. */
export function Contador({ total, actual }) {
  if (total <= 1) return null
  return (
    <div
      className="contador"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={actual + 1}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            'contador__tick' +
            (i < actual ? ' contador__tick--hecho' : i === actual ? ' contador__tick--actual' : '')
          }
        />
      ))}
    </div>
  )
}

/* ── Fechas ─────────────────────────────────────────────────────────────*/

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export function fechaLarga(iso) {
  if (!iso) return null
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} de ${MESES[m - 1]}${a !== new Date().getFullYear() ? ` de ${a}` : ''}`
}

export function fechaCorta(iso) {
  if (!iso) return null
  const [, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MESES[m - 1].slice(0, 3).toUpperCase()}`
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
