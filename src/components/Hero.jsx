import React from 'react'
import { motion } from 'framer-motion'
import './Hero.css'
import logoSvg from '../assets/logo-nav.svg'

// Import client logos for carousel
import logoBerseLine from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.png'
import logoJeny from '../assets/logos/LOGO BLANCO.svg'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.png'
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
      <div className="hero-container">
        {/* MASSIVE Title Section */}
        <div className="hero-title-section">
          <div className="hero-content">
            <motion.div
              className="hero-title-wrapper"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="hero-logo-container">
                <img 
                  src={logoSvg} 
                  alt="DAK Agency Logo" 
                  className="hero-logo-svg"
                />
              </div>
            </motion.div>
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
            <div className="cta-text-group">
              <h3 className="cta-small-text">- RUIDO</h3>
              <h2 className="cta-large-text">+ IMPACTO</h2>
            </div>
            <motion.div
              className="cta-accent-line"
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.19, 1, 0.22, 1] }}
            />
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
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>Comenzar Proyecto</span>
              <svg className="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Right Block - Social Media */}
          <motion.div
            className="hero-social-block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="social-grid">
              {/* Facebook */}
              <motion.a
                href="https://www.facebook.com/profile.php?id=61577374078273"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="social-label">Facebook</span>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/agency_dak/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="social-label">Instagram</span>
              </motion.a>

              {/* TikTok */}
              <motion.a
                href="https://www.tiktok.com/@dakagency"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="social-label">TikTok</span>
              </motion.a>

              {/* WhatsApp */}
              <motion.a
                href="https://api.whatsapp.com/send/?phone=51906765040&text=Hola+DAK+Agency%2C+me+interesa+conocer+sus+servicios&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="social-label">WhatsApp</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="hero-bg-decoration">
        <motion.div
          className="decoration-circle circle-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="decoration-circle circle-2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </section>
  )
}

export default Hero
