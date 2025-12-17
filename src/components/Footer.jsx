import React from 'react'
import { motion } from 'framer-motion'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { name: 'Servicios', href: '#services' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Blog', href: '#blog' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Contacto', href: '#contact' }
  ]

  const socialLinks = [
    { name: 'Instagram', icon: '📸', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'Facebook', icon: '👥', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' }
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

  return (
    <footer className="footer" id="about">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <motion.h3
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
            >
              DAK
            </motion.h3>
            <p className="footer-description">
              DAK Agency es tu socio estratégico en marketing digital. 
              Transformamos ideas en resultados medibles a través de 
              estrategias innovadoras, diseño creativo y tecnología de vanguardia. 
              Desde 2025, ayudamos a empresas a acelerar su crecimiento digital.
            </p>
            
            <div className="footer-social">
              <p className="social-title">Síguenos</p>
              <div className="social-links">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="social-link"
                    title={social.name}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="social-icon">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-links">
            <h4 className="footer-links-title">Links Rápidos</h4>
            <ul className="footer-nav">
              {footerLinks.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            <p>© {currentYear} DAK Agency. Todos los Derechos Reservados.</p>
            <div className="footer-legal">
              <a href="#">Política de Privacidad</a>
              <span className="separator">•</span>
              <a href="#">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


