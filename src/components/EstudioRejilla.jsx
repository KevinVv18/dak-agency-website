import React from 'react'
import { motion } from 'framer-motion'
import { srcDeSesion, fuentesDeSesion, LOGOS, monograma } from '../data/fotografia'

/**
 * Ancho al que se pinta cada foto, en el mismo orden que los cortes de
 * Estudio.css: una columna hasta 640px, dos hasta 1024, tres por encima.
 * Medido en el sitio: 325px a 375 de viewport (87vw), 348 a 768 (45vw) y
 * 395 a 1280 (31vw). Si cambia el número de columnas, hay que cambiar esto o
 * el navegador elegirá el tamaño equivocado.
 */
const MEDIDA = '(max-width: 640px) 88vw, (max-width: 1024px) 46vw, 32vw'

/**
 * Rejilla de fotografía del Estudio.
 *
 * La usan la home (una selección de 9) y /gallery (el archivo completo). Vive
 * aparte para que las dos se vean exactamente igual: si el tratamiento se
 * duplicara en dos componentes, acabarían divergiendo.
 *
 * Columnas y no grid: la mayoría de las fotos son verticales y de proporciones
 * distintas, así cada una conserva su forma sin recortes ni huecos.
 */
const EstudioRejilla = ({ sesiones, ancho = 900 }) => (
  <ul className="estudio-rejilla">
    {sesiones.map((s, i) => (
      <motion.li
        key={s.id}
        className="estudio-pieza"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.06, ease: [0.19, 1, 0.22, 1] }}
      >
        <figure className="estudio-figura">
          {/* w y h no fijan el tamaño —el CSS manda—, solo la proporción, y
              con eso el navegador reserva el hueco antes de que la imagen
              baje. Sin ellos la página crecía mientras cargaban las 26 fotos y
              el scroll de los botones de sección se quedaba corto: en móvil,
              pulsar "Destacados" te dejaba a mitad del Estudio. */}
          <img
            className="estudio-img"
            src={srcDeSesion(s, ancho)}
            {...fuentesDeSesion(s, MEDIDA)}
            alt={s.alt}
            width={s.w}
            height={s.h}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="estudio-pie">
            {/* La marca del cliente: su logo cuando lo hay y, si no, sus
                iniciales. El respaldo existe para que la rejilla no tenga
                huecos donde falta el archivo. */}
            {s.cliente && (
              <span className="estudio-marca" aria-hidden="true">
                {LOGOS[s.cliente]
                  ? <img className="estudio-logo" src={LOGOS[s.cliente]} alt="" loading="lazy" />
                  : <span className="estudio-monograma">{monograma(s.cliente)}</span>}
              </span>
            )}
            <span className="estudio-datos">
              {s.cliente && <span className="estudio-cliente">{s.cliente}</span>}
              <span className="estudio-sector">{s.sector}</span>
            </span>
          </figcaption>
        </figure>
      </motion.li>
    ))}
  </ul>
)

export default EstudioRejilla
