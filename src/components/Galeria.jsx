import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CATEGORIAS, OBRAS } from '../data/taller'
import { sesionesPublicadas, srcDeSesion, fuentesDeSesion, LINEAS } from '../data/fotografia'
import { CIFRAS_DESTACADAS } from '../data/cifras'
import ArchivoEstudio from './ArchivoEstudio'
import VisorObra from './VisorObra'
import './Galeria.css'

/* El contrato de dirección va como comentario en el HTML emitido, no en el
   código fuente, para que sobreviva al build y al prerender y se pueda auditar
   abriendo el volcado. Se busca con: grep "mesa-de-luz" dist/gallery/index.html */
const CONTRATO = `<!--
IMPECCABLE DIRECTION CONTRACT · surface /gallery · seed ba2921fc · form mesa-de-luz

THESIS: el archivo se enseña entero de una vez, como la hoja de contactos que
la agencia revisa sobre su propia mesa. Rechaza el tapiz filtrable con hero
decorativo y párrafo de bienvenida: la cantidad de trabajo real es el argumento
y tiene que verse en el primer segundo, no después de tres scrolls.

OWN-WORLD: mundo DAK sin cambios (#030106, #B024FF, #B93EFF en texto, Poppins
600/700/800). La materialidad es la hoja: retícula estricta de celdas al
formato real del negativo, filete de 1px, número de fotograma en placa opaca
en cada celda, y el morado como luz de la mesa y lápiz graso de marcado, nunca
como relleno de tarjeta.

STORY: el visitante ve cuánto trabajo hay antes de leer una sola frase, marca
la categoría que le toca, se detiene en una celda con la lupa, la abre a
tamaño completo y sale por el pie de la hoja hacia el contacto.

FIRST VIEWPORT: rótulo de la hoja arriba a la izquierda —h1 "Trabajo" y una
línea de datos con obras, clientes y sede—, la fila de marcado a su derecha, y
desde ahí abajo la retícula ocupando todo lo que queda, ya poblada. Sin hero.
La acción principal vive al pie, donde termina el archivo.

FORM: hoja de contactos sobre mesa de luz. Candidata 7 de 7 de la lista
ordenada por resonancia. Seed key ba2921fc.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
-->`

/* Los tres anchos de cada pieza del Taller. El visor pide el original; la hoja
   y la lupa se quedan con las variantes que genera `npm run taller:variantes`. */
const fuentesDeObra = (o) => `${o.srcXs} 360w, ${o.srcSm} 700w, ${o.src} ${o.w}w`

/**
 * Ancho al que se pinta cada celda, en el mismo orden que los cortes de
 * `.hoja--taller` en Galeria.css: tres columnas hasta 600px, cinco hasta 1023,
 * siete por encima, con la hoja topada en 1400px.
 *
 * Medido en el sitio: 113px a 375 de viewport (30vw), 139 a 768 (18vw), 165 a
 * 1280 (13vw) y 165 fijos en cuanto la hoja llega a su tope.
 */
const MEDIDA_CELDA = '(max-width: 600px) 30vw, (max-width: 1023px) 18vw, (max-width: 1460px) 13vw, 165px'

/* Las fotos del Estudio van en la MISMA retícula que el Taller, así que piden el
   mismo ancho. Antes tenían la suya, más grande, y el archivo secundario pesaba
   siete veces más que el principal en altura de página: la tesis decía que lo
   que manda es el Taller y la composición decía lo contrario. */
const MEDIDA_ARCHIVO = MEDIDA_CELDA

/* La tira de portadas: dos columnas en móvil, cuatro desde tableta.
   Medido: 174px a 375 de viewport (46vw), 180 a 768 y 302 a 1280 (24vw), y 341
   fijos con la hoja en su tope. */
const MEDIDA_PANORAMA = '(max-width: 600px) 46vw, (max-width: 1460px) 24vw, 341px'

/* En el visor la obra se pinta a lo que le deje la ventana. */
const MEDIDA_VISOR = '(max-width: 900px) 92vw, 62vw'

/**
 * Un fotograma de la hoja.
 *
 * El disparador es un <button> de verdad y no un div con onClick: la rejilla
 * anterior era inalcanzable con el teclado e invisible para un lector de
 * pantalla. El nombre accesible va aquí y no en el alt de la imagen, que queda
 * vacío, para que no se anuncie dos veces lo mismo.
 */
const Celda = ({ obra, indice, marcada, alAbrir, alMirar, alDejarDeMirar }) => {
  const apagada = marcada !== 'todo' && obra.categoria !== marcada
  return (
    <li className={`celda celda--${obra.formato}${apagada ? ' celda--apagada' : ''}`}>
      <button
        type="button"
        className="celda-boton"
        data-obra={obra.id}
        onClick={() => alAbrir(indice)}
        onMouseEnter={(e) => alMirar(obra, e.currentTarget)}
        onFocus={(e) => alMirar(obra, e.currentTarget)}
        onBlur={alDejarDeMirar}
        aria-label={`Ver ${obra.titulo}, ${obra.tipo} para ${obra.cliente}`}
      >
        <span className="celda-numero" aria-hidden="true">
          {String(indice + 1).padStart(2, '0')}
        </span>
        <img
          className="celda-img"
          src={obra.srcXs}
          srcSet={fuentesDeObra(obra)}
          sizes={obra.formato === 'panorama' ? MEDIDA_PANORAMA : MEDIDA_CELDA}
          alt=""
          width={obra.w}
          height={obra.h}
          loading={indice < 6 ? 'eager' : 'lazy'}
          fetchpriority={indice < 3 ? 'high' : undefined}
          decoding="async"
        />
      </button>

      {/* La anotación del fotograma. Una línea y corta, como la que se escribe a
          mano en el margen de una hoja de contactos. El cliente completo no cabe
          a 113px sin partirse en tres líneas, así que vive en la lupa y en el
          visor; aquí va lo que sí cabe y sí ordena. */}
      <p className="celda-nota">{obra.tipo}</p>
    </li>
  )
}

const Galeria = () => {
  const navigate = useNavigate()
  const sinMovimiento = useReducedMotion()

  const sesiones = useMemo(() => sesionesPublicadas(), [])
  const totalObras = OBRAS.length + sesiones.length

  const [marcada, setMarcada] = useState('todo')
  const [lupa, setLupa] = useState(null)
  const [visor, setVisor] = useState(null)

  const enTaller = useMemo(
    () => (marcada === 'todo' ? OBRAS.length : OBRAS.filter((o) => o.categoria === marcada).length),
    [marcada]
  )

  /* ── La lupa ──
     Solo existe donde hay puntero fino. En una pantalla táctil no hay estado
     intermedio entre mirar y tocar: el dedo abre el visor directamente, que es
     lo que se quiere, y una lupa que apareciera al arrastrar solo pelearía con
     el scroll. */
  const punteroFino = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    punteroFino.current = mq.matches
    const alCambiar = (e) => {
      punteroFino.current = e.matches
      if (!e.matches) setLupa(null)
    }
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [])

  const encenderLupa = useCallback((obra, elemento) => {
    if (!punteroFino.current || !elemento) return
    const celda = elemento.getBoundingClientRect()
    const ancho = obra.formato === 'panorama' ? 320 : 240
    const alto = Math.round((ancho * obra.h) / obra.w) + 58

    // A la derecha si cabe; si no, a la izquierda. Y siempre dentro de la ventana.
    const hueco = 14
    const x = celda.right + hueco + ancho < window.innerWidth - 12
      ? celda.right + hueco
      : Math.max(12, celda.left - hueco - ancho)
    const y = Math.min(
      Math.max(12, celda.top + celda.height / 2 - alto / 2),
      Math.max(12, window.innerHeight - alto - 12)
    )
    setLupa({ obra, x, y, ancho })
  }, [])

  /* La lupa del Estudio: la sesión no trae ni srcSm ni formato, así que se le
     da la forma que la lupa espera. Es la misma lente, no una segunda. */
  const mirarSesion = useCallback((s, elemento) => {
    encenderLupa({
      w: s.w, h: s.h, formato: 'vertical',
      srcSm: srcDeSesion(s, 700),
      cliente: s.cliente || 'Sesión de estudio',
      titulo: s.sector,
    }, elemento)
  }, [encenderLupa])

  const apagarLupa = useCallback(() => setLupa(null), [])

  /* ── El visor ──
     Guarda de qué archivo salió y en qué posición, para que las flechas
     recorran el archivo que el visitante estaba mirando y no los dos mezclados. */
  const abrirTaller = useCallback((i) => { setLupa(null); setVisor({ archivo: 'taller', i }) }, [])
  const abrirEstudio = useCallback((i) => { setLupa(null); setVisor({ archivo: 'estudio', i }) }, [])
  const cerrarVisor = useCallback(() => setVisor(null), [])

  const manos = { alAbrir: abrirTaller, alMirar: encenderLupa, alDejarDeMirar: apagarLupa }

  const listaVisor = visor?.archivo === 'estudio' ? sesiones : OBRAS
  const mover = useCallback((paso) => {
    setVisor((v) => {
      if (!v) return v
      const n = v.archivo === 'estudio' ? sesiones.length : OBRAS.length
      return { ...v, i: (v.i + paso + n) % n }
    })
  }, [sesiones.length])

  const obraDelVisor = useMemo(() => {
    if (!visor) return null
    if (visor.archivo === 'taller') {
      const o = OBRAS[visor.i]
      return {
        id: o.id,
        src: o.src,
        srcSet: fuentesDeObra(o),
        sizes: MEDIDA_VISOR,
        alt: `${o.titulo}, pieza de ${o.tipo} para ${o.cliente}`,
        w: o.w,
        h: o.h,
        titulo: o.titulo,
        cliente: o.cliente,
        tipo: o.tipo,
      }
    }
    const s = sesiones[visor.i]
    return {
      id: `e-${s.id}`,
      src: srcDeSesion(s, 1400),
      ...fuentesDeSesion(s, MEDIDA_VISOR),
      alt: s.alt,
      w: s.w,
      h: s.h,
      titulo: s.sector,
      cliente: s.cliente || 'Sesión de estudio',
      tipo: LINEAS[s.linea],
    }
  }, [visor, sesiones])

  const irAlContacto = (e) => {
    e.preventDefault()
    navigate('/')
    // La home se monta en el siguiente frame; antes de eso el ancla no existe.
    requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView({
        behavior: sinMovimiento ? 'auto' : 'smooth',
      })
    })
  }

  return (
    <section className="galeria">
      <div hidden aria-hidden="true" data-contrato="mesa-de-luz" dangerouslySetInnerHTML={{ __html: CONTRATO }} />

      {/* ─────────── Rótulo de la hoja ─────────── */}
      <header className="rotulo">
        <div className="rotulo-identidad">
          <h1 className="rotulo-titulo">Trabajo</h1>
          <p className="rotulo-datos">
            <span>{totalObras} obras</span>
            <span>Taller y Estudio</span>
            <span>Chiclayo</span>
          </p>
        </div>

        {/* El marcado no esconde nada: subraya. Es el lápiz graso sobre la hoja
            de contactos, no un filtro que vacía la rejilla. Por eso las celdas
            que no entran siguen visibles y siguen siendo pulsables: quitarlas
            haría que el archivo pareciera más pequeño de lo que es. */}
        <div className="marcado" role="group" aria-label="Marcar piezas por categoría">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="marcado-boton"
              aria-pressed={marcada === c.id}
              onClick={() => setMarcada(c.id)}
            >
              {c.etiqueta}
            </button>
          ))}
        </div>
        <p className="marcado-aviso" aria-live="polite">
          {marcada === 'todo'
            ? `${OBRAS.length} piezas gráficas en la hoja`
            : `${enTaller} de ${OBRAS.length} piezas marcadas`}
        </p>
      </header>

      {/* ─────────── Hoja 1: el Taller ─────────── */}
      <h2 className="hoja-titulo">Taller</h2>
      <ul className="hoja hoja--taller" onMouseLeave={apagarLupa}>
        {OBRAS.map((o, i) =>
          o.formato === 'panorama' ? null : (
            <Celda key={o.id} obra={o} indice={i} marcada={marcada} {...manos} />
          )
        )}
      </ul>

      {/* La tira de panorámicas.
          Las portadas son otro formato de negativo y van en su propia tira, como
          en una hoja de contactos de verdad. Meterlas en la misma rejilla con un
          span de tres columnas dejaba un hueco al final de la fila anterior, y
          taparlo con `grid-auto-flow: dense` desordenaba la numeración de los
          fotogramas — que en una hoja tiene que correr en orden. */}
      <ul className="hoja hoja--portadas" onMouseLeave={apagarLupa}>
        {OBRAS.map((o, i) =>
          o.formato !== 'panorama' ? null : (
            <Celda key={o.id} obra={o} indice={i} marcada={marcada} {...manos} />
          )
        )}
      </ul>

      {/* ─────────── La costura: la mesa se enciende ───────────
          El único momento animado de la página. Antes había seis entradas
          idénticas de fade + desplazamiento, una por sección, que es la deuda
          nº 4 que DESIGN.md declara. Aquí solo hay esto: la luz que sube por
          debajo de la hoja justo donde el archivo pasa de negativo a positivo.
          Anima transform y opacity, nada que recalcule el layout. */}
      <div className="costura">
        <motion.span
          className="costura-luz"
          aria-hidden="true"
          initial={sinMovimiento ? false : { scaleX: 0.15, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>

      {/* ─────────── Hoja 2: el Estudio ─────────── */}
{/* «Taller» y «Estudio» son el mismo rango en la historia de la página, así
          que se rotulan igual. Estaban a cuatro escalones de escala: uno en 13px
          y el otro en display a 3.25rem, y eso decía que el archivo secundario
          era el titular. El único tipo de display de la ruta es el h1. */}
      <div className="tramo-claro">
        <h2 className="hoja-titulo">Estudio</h2>
        {/* Dos datos y no tres: «Archivo completo» repetía lo que ya dice el
            número, y en un móvil de 375px empujaba el punto de separación al
            principio de la segunda línea, donde se leía como una viñeta. */}
        <p className="hoja-datos">
          <span>{sesiones.length} sesiones</span>
          <span>Comercial y familiar</span>
        </p>

        <ArchivoEstudio
          sesiones={sesiones}
          medida={MEDIDA_ARCHIVO}
          alAbrir={abrirEstudio}
          alMirar={mirarSesion}
          alDejarDeMirar={apagarLupa}
        />
      </div>

      {/* ─────────── Pie de hoja ─────────── */}
      <footer className="pie-hoja">
        <p className="pie-cifras">
          {CIFRAS_DESTACADAS.map((c) => (
            <span className="pie-cifra" key={c.etiqueta}>
              <b>{c.valor}</b> {c.etiqueta}
            </span>
          ))}
        </p>

        {/* La frase decía «esta hoja es todo lo que hay» tres líneas debajo de
            «+80 proyectos» y una página debajo de «51 obras». Se contradecía
            sola. Ahora dice la relación entre las dos cifras, que es lo único
            que hacía falta. */}
        <div className="pie-cierre">
          <p className="pie-frase">
            Estas {totalObras} son las que podemos publicar: hay clientes cuyo
            material no sale de su casa. Ni una está de relleno. Si quieres la
            tuya en la siguiente hoja, hablamos.
          </p>
          <a className="pie-accion" href="/#contact" onClick={irAlContacto}>
            Empezar un proyecto
          </a>
        </div>
      </footer>

      {visor && obraDelVisor && (
        <VisorObra
          obra={obraDelVisor}
          indice={visor.i}
          total={listaVisor.length}
          onCerrar={cerrarVisor}
          onAnterior={() => mover(-1)}
          onSiguiente={() => mover(1)}
        />
      )}

      {lupa && (
        <div
          className="lupa"
          aria-hidden="true"
          style={{ left: lupa.x, top: lupa.y, width: lupa.ancho }}
        >
          <img
            className="lupa-img"
            src={lupa.obra.srcSm}
            alt=""
            width={lupa.obra.w}
            height={lupa.obra.h}
            decoding="async"
          />
          <span className="lupa-ficha">
            <b>{lupa.obra.cliente}</b>
            {lupa.obra.titulo}
          </span>
        </div>
      )}
    </section>
  )
}

export default Galeria
