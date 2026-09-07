import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * El visor: una obra levantada de la hoja y puesta sobre la mesa de luz.
 *
 * Sustituye al lightbox anterior, que se cerraba solo con clic —ni Escape, ni
 * `role="dialog"`, ni `aria-modal`, ni foco— y colgaba de tarjetas que eran
 * `div` con `onClick`, es decir, inalcanzables con el teclado.
 *
 * El patrón de diálogo no se inventa aquí: es el mismo de `Projects.jsx`
 * (líneas 220-305), el del demo del bot, con sus dos defensas independientes:
 *
 *   1. Un velo por encima de todo lo fijo (la nav, la burbuja del chat).
 *   2. `inert` + `aria-hidden` sobre `#root`, para que lo de detrás no sea
 *      alcanzable ni con el tabulador ni con un lector de pantalla.
 *
 * Se pinta con un portal a <body> porque si viviera dentro de `#root` se
 * congelaría a sí mismo. Y esas dos defensas juntas hacen que no haga falta
 * ningún bucle manual de focusables: el tabulador no tiene a dónde salir.
 */
const VisorObra = ({ obra, indice, total, onCerrar, onAnterior, onSiguiente }) => {
  const cajaRef = useRef(null)
  const cerrarRef = useRef(null)
  const focoPrevio = useRef(null)

  useEffect(() => {
    const raiz = document.getElementById('root')
    focoPrevio.current = document.activeElement
    document.body.style.overflow = 'hidden'
    if (raiz) {
      raiz.inert = true
      raiz.setAttribute('aria-hidden', 'true')
    }

    /* El foco entra en el diálogo de inmediato y no en el siguiente frame: si se
       quedara detrás, el tabulador recorrería una página que ya no se ve. El
       portal está montado cuando corre este efecto, así que no hay que esperar. */
    cerrarRef.current?.focus()

    const alPulsar = (e) => {
      if (e.key === 'Escape') onCerrar()
      else if (e.key === 'ArrowLeft') onAnterior()
      else if (e.key === 'ArrowRight') onSiguiente()
    }
    window.addEventListener('keydown', alPulsar)

    return () => {
      window.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = ''
      if (raiz) {
        raiz.inert = false
        raiz.removeAttribute('aria-hidden')
      }
      /* Vuelve al sitio del que salió. La celda se localiza por su id y no
         guardando el nodo: la hoja se repinta al filtrar y el nodo guardado
         puede haber dejado de existir. */
      const celda = document.querySelector(`[data-obra="${obra.id}"]`)
      if (celda) celda.focus()
      else focoPrevio.current?.focus?.()
    }
    // Solo al montar y desmontar: navegar entre obras no reinicia el diálogo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const numero = String(indice + 1).padStart(2, '0')

  return createPortal(
    <div className="visor-velo" onClick={onCerrar}>
      <div
        className="visor"
        ref={cajaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visor-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="visor-lienzo">
          <img
            className="visor-img"
            src={obra.src}
            {...(obra.srcSet ? { srcSet: obra.srcSet, sizes: obra.sizes } : {})}
            alt={obra.alt}
            width={obra.w}
            height={obra.h}
            decoding="async"
          />
        </div>

        {/* La ficha es una banda al pie y no una columna a la derecha. Como
            columna se estiraba hasta la altura del lienzo y dejaba 470px de panel
            vacío en escritorio: el contenido cabía en 350 y la caja medía 815.
            Una banda mide lo que mide su contenido a cualquier ancho, y además es
            el sitio donde va la anotación en una hoja de contactos: al pie del
            fotograma, corrida a lo largo de la tira. */}
        <div className="visor-ficha">
          <div className="visor-datos">
            {/* El cliente iba encima del titular, en versalitas y en morado: eso
                es un eyebrow, y el suelo de calidad de impeccable lo prohíbe sin
                excepciones —«no brief earns it back»—. Ahora va en la línea de
                datos, con el tipo de pieza y el número de fotograma, que es donde
                se lee como dato y no como decoración tipográfica. */}
            <h2 className="visor-titulo" id="visor-titulo">{obra.titulo}</h2>
            <p className="visor-meta">
              <span className="visor-cliente">{obra.cliente}</span>
              <span>{obra.tipo}</span>
              <span className="visor-conteo">{numero} de {total}</span>
            </p>
          </div>

          <p className="visor-teclas">
            <kbd>←</kbd> <kbd>→</kbd> para moverse por el archivo<br />
            <kbd>Esc</kbd> para volver a la hoja
          </p>

          <div className="visor-mandos">
            <button className="visor-mando" onClick={onAnterior} aria-label="Obra anterior">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="visor-mando" onClick={onSiguiente} aria-label="Obra siguiente">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <button className="visor-cerrar" ref={cerrarRef} onClick={onCerrar} aria-label="Cerrar el visor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  )
}

export default VisorObra
