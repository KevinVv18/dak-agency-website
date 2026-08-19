import React from 'react'
import './IndicePagina.css'
import { scrollToSection } from '../utils/scrollToSection'

/**
 * EL ÍNDICE DE LA PÁGINA
 *
 * Ocupa el sitio que tenía el raíl de Servicios, y responde otra pregunta.
 *
 * ─── POR QUÉ SE CAMBIÓ ────────────────────────────────────────────────────
 *
 * Ahí vivía un mando del carrusel de Servicios —siete iconos y un «1/7»—
 * clavado en `position: fixed` sobre TODA la web. Medido: aparecía en las ocho
 * secciones, y sobre el Estudio —el único tramo claro— su rótulo daba 1,12:1
 * de contraste. Era cromo blanco pintado sobre fondo blanco. Además duplicaba
 * lo que ya hay dentro del panel de Servicios: las siete miniaturas y las
 * flechas.
 *
 * Un sitio que está SIEMPRE tiene que responder algo que importe siempre. En
 * una página de quince mil píxeles eso es: dónde estoy y cuánto queda.
 *
 * ─── DE DÓNDE SALE LA SECCIÓN ACTIVA ──────────────────────────────────────
 *
 * De ningún sitio nuevo. Navigation ya recorría las secciones en cada scroll
 * para marcar su menú; ahora ese mismo cálculo devuelve también la estación de
 * aquí y la pasa por prop. Un solo listener para toda la página.
 *
 * ─── LA LISTA ES PROPIA, Y NO UN DESCUIDO ─────────────────────────────────
 *
 * El menú tiene seis entradas y deja Taller fuera a propósito (ver SPY_IDS en
 * Navigation.jsx: incluirlo apagaría el indicador del menú durante toda esa
 * sección, porque no hay enlace que encender). El índice sí lo lista, porque
 * aquí Taller es una parada como las demás. Dos listas, una sola pasada.
 */
export const ESTACIONES = [
  { id: 'services', nombre: 'Servicios' },
  { id: 'demos', nombre: 'Demos' },
  { id: 'taller', nombre: 'Taller' },
  { id: 'gallery', nombre: 'Estudio' },
  { id: 'blog', nombre: 'Blog' },
  { id: 'about', nombre: 'Nosotros' },
  { id: 'contact', nombre: 'Contacto' },
]

/* El Estudio es el único tramo claro de la web. El índice lo cruza, así que
   ahí invierte la tinta: sin esto se queda en 1,12:1, que es el fallo que este
   rediseño viene a arreglar. */
const CLARAS = new Set(['gallery'])

const IndicePagina = ({ activa }) => {
  const i = ESTACIONES.findIndex((e) => e.id === activa)
  const claro = CLARAS.has(activa)

  return (
    <nav
      className={`indice ${claro ? 'indice--claro' : ''}`}
      aria-label="Secciones de la página"
    >
      <ol className="indice-eje">
        {ESTACIONES.map((e) => (
          <li key={e.id} className="indice-parada">
            <button
              type="button"
              className={`indice-boton ${e.id === activa ? 'esta' : ''}`}
              onClick={() => scrollToSection(`#${e.id}`)}
              aria-current={e.id === activa ? 'true' : undefined}
            >
              <span className="indice-marca" aria-hidden="true" />
              <span className="indice-nombre">{e.nombre}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* La lectura. Solo aparece cuando hay una estación de verdad: antes de
          Servicios el visitante está en el túnel, y un «00 / 07» ahí no dice
          nada. */}
      {i >= 0 && (
        <p className="indice-cuenta">
          <span className="indice-cuenta-n">{String(i + 1).padStart(2, '0')}</span>
          <span className="indice-cuenta-sep" aria-hidden="true">/</span>
          {String(ESTACIONES.length).padStart(2, '0')}
        </p>
      )}
    </nav>
  )
}

export default IndicePagina
