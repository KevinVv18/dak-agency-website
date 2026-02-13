import React from 'react'
import { motion } from 'framer-motion'
import './Footer.css'
import logoSvg from '../assets/logo-nav.svg'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const marqueeItems = [
    'BRANDING', 'FOTOGRAFÍA', 'VIDEO', 'SOCIAL MEDIA',
    'DISEÑO WEB', 'SEO & ADS', 'AUTOMATIZACIÓN', 'MARKETING DIGITAL'
  ]

  const footerLinks = [
    { name: 'Servicios', href: '#services' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Blog', href: '#blog' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Contacto', href: '#contact' }
  ]

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/dakagency',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/dakagency',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@dakagency',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/51906765040',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    }
  ]

  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const marqueeText = marqueeItems.map(item => `${item} ✦`).join('  ')

  return (
    <footer className="footer" id="about">
      {/* Neon grid background */}
      <div className="footer-neon-grid" />

      {/* Marquee Ticker */}
      <div className="footer-marquee" aria-hidden="true">
        <div className="marquee-track">
          <span className="marquee-content">{marqueeText}</span>
          <span className="marquee-content">{marqueeText}</span>
          <span className="marquee-content">{marqueeText}</span>
        </div>
      </div>

      <div className="footer-container">
        {/* Main 3-column grid */}
        <div className="footer-main">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <motion.div
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
              onClick={scrollToTop}
            >
              <img src={logoSvg} alt="DAK Agency Logo" className="footer-logo-img" />
            </motion.div>
            <p className="footer-tagline">Digital Acceleration Key</p>
            <p className="footer-description">
              Tu socio estratégico en marketing digital.
              Transformamos ideas en resultados medibles
              a través de estrategias innovadoras, diseño
              creativo y tecnología de vanguardia.
            </p>

            <div className="footer-social">
              <div className="social-links">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`social-link social-${social.name.toLowerCase()}`}
                    title={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-glow" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-links">
            <h4 className="footer-col-title">
              <span className="title-decorator" />
              Navega
            </h4>
            <ul className="footer-nav">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    <span className="nav-arrow">→</span>
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Column 3: Location & Map */}
          <div className="footer-location">
            <h4 className="footer-col-title">
              <span className="title-decorator" />
              Ubicación
            </h4>
            <div className="footer-map-wrapper">
              <iframe
                className="footer-map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.964!2d-79.044!3d-8.112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDYnNDMuMiJTIDc5wrAwMic0MC44Ilc!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DAK Agency Location"
              />
              <div className="map-overlay" />
            </div>
            <div className="location-info">
              <div className="location-pin">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <p className="location-address">Mnz G. Lt.11 Av. Antenor Orrego</p>
                  <p className="location-city">La Victoria, Perú</p>
                </div>
              </div>
              <div className="location-hours">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>Lun - Vie: 9:00am - 6:00pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-divider" />
          <div className="footer-copyright">
            <p>© {currentYear} DAK Agency. Todos los Derechos Reservados.</p>
            <motion.button
              className="back-to-top"
              onClick={scrollToTop}
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Volver arriba"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
              <span>TOP</span>
            </motion.button>
            <div className="footer-legal">
              <a href="#">Política de Privacidad</a>
              <span className="separator">·</span>
              <a href="#">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
