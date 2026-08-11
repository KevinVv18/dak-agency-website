import React from 'react'
import { motion } from 'framer-motion'
import './Hero.css'
import { scrollToSection } from '../utils/scrollToSection'
import AnnouncementTicker from './AnnouncementTicker'
import Wordmark from './Wordmark'
import './Wordmark.css'

// Import client logos for carousel
import logoBerseLine from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.webp'
import logoJeny from '../assets/logos/LOGO BLANCO.svg'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.webp'
import logoProsadis from '../assets/logos/LOGO 1.svg'
import logoSpaKreativos from '../assets/logos/logo-spa-kreativos.svg'

const Hero = () => {
  // Client logos for carousel (6 clientes)
  const clientLogos = [
    { id: 1, src: logoBerseLine, alt: 'Berse Line', className: 'logo-berse' },
    { id: 2, src: logoGO, alt: 'Gran Oportunidad GO!', className: 'logo-go' },
    { id: 3, src: logoJeny, alt: 'Dra. Jenny', className: 'logo-jeny' },
    { id: 4, src: logoPardo, alt: 'Colegio Manuel Pardo', className: 'logo-pardo' },
    { id: 5, src: logoProsadis, alt: 'Prosadis', className: 'logo-prosadis' },
    { id: 6, src: logoSpaKreativos, alt: 'Spa Kreativos', className: 'logo-spa' }
  ]

  return (
    <section className="hero" id="hero">
      <AnnouncementTicker />
      <div className="hero-container">
        {/* MASSIVE Title Section */}
        {/* La marca construyéndose. Ya no es un <img> del logo: el SVG va
            insertado para poder trazarlo, rellenarlo y texturizarlo por partes.
            Ver Wordmark.jsx y Wordmark.css.

            Sin envoltorio de framer-motion: la entrada la hace el propio SVG
            con CSS y la salida va ligada al scroll de forma nativa, fuera del
            hilo principal. Una animación de opacidad en JS aquí solo añadiría
            trabajo al hilo para tapar la construcción. */}
        <div className="hero-title-section">
          <div className="hero-content">
            <div className="hero-logo-container wordmark-wrap">
              <Wordmark />
            </div>
          </div>
        </div>

        {/* Subtitle Strip - Client Wall */}
        <motion.div
          className="hero-subtitle-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Left logos */}
          <div className="client-logos-side left">
            {clientLogos.slice(0, 3).map((logo, i) => (
              <motion.div
                key={`logo-l-${logo.id}`}
                className="logo-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`logo-image ${logo.className}`}
                />
              </motion.div>
            ))}
          </div>

          {/* Center text */}
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
          >
            Digital Acceleration Key
          </motion.p>

          {/* Right logos */}
          <div className="client-logos-side right">
            {clientLogos.slice(3, 6).map((logo, i) => (
              <motion.div
                key={`logo-r-${logo.id}`}
                className="logo-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`logo-image ${logo.className}`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section - Asymmetric Blocks */}
        <div className="hero-bottom-section">
          {/* Left Block - CTA */}
          <motion.div
            className="hero-cta-block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Recurso grafico, no estructura del documento: son dos lineas de
                un lema, no la cabecera de una seccion. Como encabezados dejaban
                el documento abriendo en h3 y sin h1. El CSS no cambia. */}
            <div className="cta-text-group">
              <p className="cta-small-text">- RUIDO</p>
              <p className="cta-large-text">+ IMPACTO</p>
            </div>
            {/* Las acciones agrupadas: sin el bloque social, el lema y lo que
                se puede hacer se reparten la anchura en una linea de base, como
                el pie de un cartel. Sueltas se solapaban al maquetar. */}
            <div className="hero-acciones">
            <motion.p
              className="cta-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Transformamos ideas en resultados
            </motion.p>
            <motion.a
              href="#contact"
              className="btn-cta-hero"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#contact')
              }}
            >
              <span>Comenzar Proyecto</span>
              <svg className="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.a>
            <motion.a
              href="https://plan.dakagency.net/agendar.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-schedule-hero"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Agendar reunión gratuita</span>
            </motion.a>
            </div>
          </motion.div>

          {/* Aqui iba una rejilla de cuatro iconos sociales gigantes.

              Ocupaba la mitad derecha del bloque inferior, y medido en
              1280x800 era lo unico de esta franja que SI se veia sin hacer
              scroll: los dos botones propios caian a 933px y 1025px, fuera
              de pantalla. El sitio mas caro de la web ensenaba la marca de
              Meta y de TikTok y escondia la de DAK.

              Los cuatro enlaces siguen en el pie, que es su sitio. Al
              liberarse esta mitad, "- RUIDO / + IMPACTO" gana todo el ancho
              y la seccion cabe en una pantalla. */}
        </div>
      </div>

      {/* Aqui vivian dos circulos decorativos con repeat: Infinity,
          animando scale y opacity para siempre — tambien con el hero fuera
          de pantalla. Eran 2 de las 14 animaciones infinitas de la pagina.
          Lo que se mueve ahora se mueve una vez, o se mueve porque el
          visitante esta haciendo scroll. */}
    </section>
  )
}

export default Hero
