import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navigation.css'
import logoSvg from '../assets/logo-nav.svg'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Servicios', href: '#services' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Galería', href: '/gallery' },
    { name: 'Blog', href: '#blog' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Contacto', href: '#contact' }
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    setIsOpen(false)

    // Route-based link (like /gallery)
    if (href.startsWith('/')) {
      navigate(href)
      return
    }

    // Anchor link — if we're not on home, go home first then scroll
    if (location.pathname !== '/') {
      navigate('/')
      // Wait for home to render, then scroll
      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isGallery = location.pathname === '/gallery'

  const renderLink = (link, index, isMobile) => {
    const isRoute = link.href.startsWith('/')
    const isActive = isRoute && location.pathname === link.href

    return (
      <motion.li
        key={link.name}
        initial={{ opacity: 0, ...(isMobile ? { x: -20 } : { y: -20 }) }}
        animate={{ opacity: 1, ...(isMobile ? { x: 0 } : { y: 0 }) }}
        {...(isMobile ? { exit: { opacity: 0, x: -20 } } : {})}
        transition={{ delay: index * 0.1 }}
      >
        <a
          href={link.href}
          className={isActive ? 'nav-link-active' : ''}
          onClick={(e) => handleLinkClick(e, link.href)}
        >
          <span className="link-arrow">↳</span>
          {link.name.toUpperCase()}
        </a>
      </motion.li>
    )
  }

  return (
    <motion.nav
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="nav-container">
        <motion.a
          href="/"
          className="nav-logo"
          onClick={handleLogoClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-box">
            <img src={logoSvg} alt="DAK Agency" className="logo-svg" />
          </div>
        </motion.a>

        {/* Desktop Menu */}
        <ul className="nav-links desktop">
          {navLinks.map((link, index) => renderLink(link, index, false))}
        </ul>

        {/* CTA Button */}
        <motion.a
          href="#contact"
          className="nav-cta-button"
          onClick={(e) => handleLinkClick(e, '#contact')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          COMENZAR
        </motion.a>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="nav-links mobile">
              {navLinks.map((link, index) => renderLink(link, index, true))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navigation
