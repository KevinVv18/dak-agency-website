import React, { useEffect, useRef, useState } from 'react'
import './CTASection.css'
import { scrollToSection } from '../utils/scrollToSection'
import { CIFRAS, CIFRAS_DESTACADAS } from '../data/cifras'

/**
 * EL TITULAR, ENTREGADO POR LA CORRIENTE
 *
 * Segundo acto del túnel. No es una sección aparte con su propio fondo: la
 * superficie es el campo de flujo, que sigue corriendo por detrás.
 *
 * ─── POR QUÉ NO HAY NI UNA ANIMACIÓN DE ENTRADA ───────────────────────────
 *
 * Todo lo que aparece aquí lo hace SEGÚN BAJAS, leyendo --entrega, que escribe
 * el bucle del campo sobre .tunel. Antes cada pieza entraba con su propio
 * temporizador disparado por un observador: bajabas rápido y te encontrabas la
 * sección a medio montar, o parada, según lo que hubiera tardado el reloj. Un
 * túnel de viento no tiene un reloj por instrumento.
 *
 * Como consecuencia, framer-motion desaparece de este archivo: no hay ninguna
 * animación que dependa del tiempo. Solo transform y opacity leyendo una
 * variable, que es lo que el compositor sabe hacer gratis.
 */

/* De dónde a dónde entra cada pieza, en fracción de --entrega. El escalonado
   es el que da la sensación de que la corriente va DEPOSITANDO el contenido. */
const ENTRADAS = {
  distintivo: 0.02,
  titular: 0.1,
  bajada: 0.3,
  medidas: 0.42,
  acciones: 0.66,
}

/** Separa «+80» en el signo y el número, para poder contar solo la cifra. */
const partir = (valor) => {
  const n = parseInt(String(valor).replace(/\D/g, ''), 10) || 0
  return { prefijo: String(valor).replace(/[\d]/g, ''), n }
}

const CTASection = () => {
  const sectionRef = useRef(null)
  const [hoveredWord, setHoveredWord] = useState(null)

  /* ── Los contadores ──
   *
   * El CSS puede llenar una barra pero no puede contar. Estos tres números se
   * escriben directamente en el DOM, sin pasar por React: un estado por
   * fotograma de scroll volvería a renderizar la sección entera, que es
   * justamente el problema que tenía el seguimiento del ratón que se retiró
   * con los orbes.
   *
   * Solo se escribe cuando el ENTERO cambia, así que en la mayoría de los
   * fotogramas no se toca el DOM. */
  const cifrasRef = useRef([])
  useEffect(() => {
    const nodos = cifrasRef.current.filter(Boolean)
    if (!nodos.length) return
    const tunel = sectionRef.current?.closest('.tunel')
    if (!tunel) return

    let cuadro = 0
    let visible = false
    const ultimos = nodos.map(() => -1)

    const pintar = () => {
      const t = parseFloat(getComputedStyle(tunel).getPropertyValue('--entrega')) || 0
      nodos.forEach((nodo, i) => {
        const total = Number(nodo.dataset.total)
        // Cada cifra termina de contar cuando su barra acaba de llenarse.
        const propio = Math.min(1, Math.max(0, (t - ENTRADAS.medidas - i * 0.05) / 0.34))
        const v = Math.round(total * propio)
        if (v !== ultimos[i]) {
          nodo.textContent = nodo.dataset.prefijo + v
          ultimos[i] = v
        }
      })
      cuadro = requestAnimationFrame(pintar)
    }

    // Solo cuenta mientras se ve, igual que el campo.
    const observador = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !cuadro) cuadro = requestAnimationFrame(pintar)
      if (!visible && cuadro) { cancelAnimationFrame(cuadro); cuadro = 0 }
    }, { threshold: 0 })
    observador.observe(sectionRef.current)

    return () => { cancelAnimationFrame(cuadro); observador.disconnect() }
  }, [])

  const handleScrollToProjects = (e) => {
    e.preventDefault()
    scrollToSection('#demos')
  }

  const handleScrollToContact = (e) => {
    e.preventDefault()
    scrollToSection('#contact')
  }

  /* Las tres palabras del titular.
   *
   * Un solo acento, el morado de marca. Antes cada una llevaba el suyo
   * —morado, teal y un naranja #FF6B35 que no aparecía en ningún otro sitio de
   * la web—, y sobre el túnel eso se leía como tres sistemas distintos. El
   * contenido de las tarjetas se conserva entero: es real y solo sale si lo
   * buscas. */
  const words = {
    branding: {
      icon: 'M19 3H5L2 9l10 13L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.24 5h2.65l-1.5 3H4.74l1.5-3z',
      label: 'Identidad Visual',
      desc: 'Logos · Paletas · Tipografía',
    },
    digital: {
      icon: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
      label: 'Experiencia Digital',
      desc: 'Web · Apps · UI/UX',
    },
    impacto: {
      icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
      label: 'Resultados Reales',
      desc: `${CIFRAS.proyectos.valor} proyectos entregados`,
    },
  }

  const Palabra = ({ clave, llega, children }) => (
    <span
      className={`hover-word ${hoveredWord === clave ? 'active' : ''}`}
      style={{ '--llega': llega }}
      onMouseEnter={() => setHoveredWord(clave)}
      onMouseLeave={() => setHoveredWord(null)}
    >
      {children}
      {/* La tarjeta vive siempre en el DOM y se muestra con CSS. Montándola y
          desmontándola hacía falta una animación en JS para que no apareciera
          de golpe; con una transición no hace falta ninguna. */}
      <span className="word-popup" aria-hidden="true">
        <svg className="popup-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d={words[clave].icon} />
        </svg>
        <span className="popup-label">{words[clave].label}</span>
        <span className="popup-desc">{words[clave].desc}</span>
      </span>
    </span>
  )

  /*
   * Las cifras vienen de src/data/cifras.js, que es la única fuente. Antes
   * estaban escritas aquí y en Gallery.jsx, y se habían contradicho: esta
   * página decía 50+ proyectos y /gallery decía 150+.
   *
   * "98% satisfechos" se retiró y no se sustituyó por otro porcentaje. Nadie
   * ha encuestado a nadie y el lector lo sabe: un dato que no se puede
   * comprobar no suma confianza, la resta. En su lugar va el número de
   * clientes, que además se puede ir contando al bajar por la página.
   */
  const medidas = CIFRAS_DESTACADAS.map((c) => ({ etiqueta: c.etiqueta, ...partir(c.valor) }))

  return (
    <section className="cta-section" ref={sectionRef}>
      {/* El fondo es la corriente del túnel, que sigue corriendo por detrás.
          Aquí había dos orbes de 550 y 450 px desenfocados a 120 px, más una
          rejilla, los tres desplazándose con el ratón. Sobre un campo de flujo
          que ya reacciona al puntero, eso eran dos sistemas de movimiento
          compitiendo por el mismo gesto.

          El velo que hace legible el titular sobre las líneas lo pone el CSS
          con un degradado, no un elemento. */}
      <div className="cta-container">
        <div className="cta-entra cta-badge" style={{ '--desde': ENTRADAS.distintivo }}>
          <span className="badge-dot" />
          <span>Listos para tu próximo proyecto</span>
        </div>

        {/* Es el h1 del documento: el enunciado dominante de la home. Antes la
            página no tenía ningún h1 y su primer encabezado era el «- RUIDO»
            del hero. */}
        {/* El barrido de medición: una línea cruza el enunciado según bajas —el
            mismo índice que recorre el eje del hero, ahora midiendo el
            titular—. Por detrás el texto queda pleno; por delante, atenuado. Y
            las tres palabras clave se subrayan justo cuando el barrido las
            alcanza, reutilizando el mismo subrayado que ya tenían para el ratón
            en vez de inventar otro camino.

            `--llega` es dónde cae cada fila y cada palabra a lo largo del
            barrido. Va aquí, en el marcado, porque es composición: depende de
            en qué línea y en qué posición está cada cosa. */}
        <h1 className="cta-entra cta-heading" style={{ '--desde': ENTRADAS.titular }}>
          <span className="cta-barrido" aria-hidden="true">
            <span className="cta-barrido-linea" />
          </span>
          <span className="heading-row" style={{ '--llega': 0.14 }}>Creamos</span>
          <span className="heading-row" style={{ '--llega': 0.3 }}>
            <Palabra clave="branding" llega={0.36}>branding</Palabra> y experiencias
          </span>
          <span className="heading-row" style={{ '--llega': 0.46 }}>
            <Palabra clave="digital" llega={0.5}>digitales</Palabra> de alto{' '}
            <Palabra clave="impacto" llega={0.62}>impacto</Palabra>
          </span>
        </h1>

        <p className="cta-entra cta-subtitle" style={{ '--desde': ENTRADAS.bajada }}>
          Transformamos ideas en resultados. Desde identidad visual hasta desarrollo web,
          impulsamos tu negocio al siguiente nivel.
        </p>

        {/* ── Las cifras, como lecturas de un instrumento ──
            Mismo vocabulario que el eje del ensayo del hero: escala con marcas
            y un tramo que se llena. El túnel mide el flujo arriba y mide el
            trabajo aquí. */}
        <div className="cta-medidas">
          {medidas.map((m, i) => (
            <div
              key={m.etiqueta}
              className="cta-entra medida"
              style={{ '--desde': ENTRADAS.medidas + i * 0.05 }}
            >
              <span className="medida-etq">{m.etiqueta}</span>
              <span
                className="medida-valor"
                ref={(n) => { cifrasRef.current[i] = n }}
                data-total={m.n}
                data-prefijo={m.prefijo}
              >
                {m.prefijo}{m.n}
              </span>
              <span className="medida-escala">
                <span className="medida-barra" />
              </span>
            </div>
          ))}
        </div>

        <div className="cta-entra cta-actions" style={{ '--desde': ENTRADAS.acciones }}>
          <a href="#contact" className="cta-btn-primary" onClick={handleScrollToContact}>
            Comenzar Proyecto
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://plan.dakagency.net/agendar.html"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn-schedule"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agendar Reunión
          </a>
          <a href="#demos" className="cta-btn-ghost" onClick={handleScrollToProjects}>
            Ver Proyectos
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTASection
