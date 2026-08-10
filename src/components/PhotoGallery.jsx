import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './PhotoGallery.css'
import { sesionesPublicadas, srcDeSesion, LOGOS, monograma } from '../data/fotografia'

/**
 * Estudio — la sección de fotografía.
 *
 * Es el único tramo claro del sitio, y no por capricho: la fotografía de DAK
 * está hecha sobre fondos claros y saturados (ciclorama blanco, terciopelo,
 * neones), y sobre el negro del resto de la página se apaga. Además rompe el
 * "todo es fondo negro" con un motivo, que es lo que separa una decisión de un
 * adorno.
 *
 * No lleva atrezzo: ni texturas de papel ni maquetas de escritorio. En la
 * página donde se vende que sabes hacer imágenes, poner imágenes compradas
 * dice lo contrario. Lo que distingue a esta sección es el dato —cada foto
 * rotulada con su cliente y su rubro—, porque eso no lo puede tener quien usa
 * banco de imágenes.
 */

/** Cuántas entran en la home. El archivo completo vive en /gallery. */
const EN_PORTADA = 9

/**
 * Una por cliente hasta llenar, para que la selección enseñe variedad de
 * rubros y no cuántas fotos hay de uno solo. Si sobran huecos, se rellenan con
 * las segundas tomas.
 */
const seleccionar = (todas, limite) => {
  const vistos = new Set()
  const primeras = []
  const resto = []
  for (const s of todas) {
    const clave = s.cliente || s.sector
    if (vistos.has(clave)) resto.push(s)
    else { vistos.add(clave); primeras.push(s) }
  }
  return [...primeras, ...resto].slice(0, limite)
}

const PhotoGallery = () => {
  const seleccion = useMemo(
    () => seleccionar(sesionesPublicadas(), EN_PORTADA),
    [],
  )

  // Solo los rubros COMERCIALES. Contar tambien los de la linea familiar
  // (maternidad, recien nacido, retrato de pareja) inflaba la cifra a 15 y la
  // frase afirmaba algo falso: esas no son rubros de negocio.
  const rubros = useMemo(
    () => new Set(
      sesionesPublicadas()
        .filter((s) => s.linea === 'comercial')
        .map((s) => s.sector),
    ).size,
    [],
  )

  return (
    <section className="estudio" id="gallery">
      <div className="estudio-cabecera">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2 className="estudio-titulo">Estudio</h2>
          <div className="estudio-filete" />
          <p className="estudio-entrada">
            Fotografía comercial para negocios de Chiclayo y Lambayeque.
            De una clínica dental a una chicharronería: {rubros} rubros
            distintos, cada uno con su propia manera de verse bien.
          </p>
        </motion.div>
      </div>

      <ul className="estudio-rejilla">
        {seleccion.map((s, i) => (
          <motion.li
            key={s.id}
            className="estudio-pieza"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.06, ease: [0.19, 1, 0.22, 1] }}
          >
            <figure className="estudio-figura">
              <img
                className="estudio-img"
                src={srcDeSesion(s, 900)}
                alt={s.alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="estudio-pie">
                {/* La marca del cliente: su logo cuando lo hay y, si no, sus
                    iniciales. El respaldo existe para que la retícula no tenga
                    huecos donde falta el archivo — solo 4 de los 13 clientes
                    tienen logo en el repo. */}
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

      <div className="estudio-cierre">
        <Link to="/gallery" className="estudio-enlace">
          Ver el archivo completo
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

export default PhotoGallery
