import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import './CTASection.css'

const CTASection = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [hoveredWord, setHoveredWord] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMousePos({ x, y })
    }
    const el = sectionRef.current
    if (el) el.addEventListener('mousemove', handleMouseMove)
    return () => { if (el) el.removeEventListener('mousemove', handleMouseMove) }
  }, [])

  const handleScrollToProjects = (e) => {
    e.preventDefault()
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollToContact = (e) => {
    e.preventDefault()
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Interactive words data
  const words = {
    branding: {
      color: '#B024FF',
      icon: 'M19 3H5L2 9l10 13L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.24 5h2.65l-1.5 3H4.74l1.5-3z',
      label: 'Identidad Visual',
      desc: 'Logos · Paletas · Tipografía'
    },
    digital: {
      color: '#00C8C8',
      icon: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
      label: 'Experiencia Digital',
      desc: 'Web · Apps · UI/UX'
    },
    impacto: {
      color: '#FF6B35',
      icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
      label: 'Resultados Reales',
      desc: '50+ proyectos exitosos'
    }
  }

  // Stats with icons and colors
  const stats = [
    { 
      value: '50+', 
      label: 'Proyectos', 
      color: '#B024FF',
      icon: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
      offset: { x: -1, y: -0.8 } 
    },
    { 
      value: '98%', 
      label: 'Satisfechos', 
      color: '#00C8C8',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      offset: { x: 1.2, y: -0.5 } 
    },
    { 
      value: '5+', 
      label: 'Años', 
      color: '#FF6B35',
      icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
      offset: { x: 0.9, y: 0.7 } 
    }
  ]

  return (
    <section className="cta-section" ref={sectionRef}>
      {/* Background */}
      <div className="cta-bg-elements">
        <motion.div
          className="cta-orb cta-orb-1"
          animate={{ x: mousePos.x * 25, y: mousePos.y * 25 }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
        <motion.div
          className="cta-orb cta-orb-2"
          animate={{ x: mousePos.x * -18, y: mousePos.y * -18 }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
        <motion.div
          className="cta-grid-bg"
          animate={{ x: mousePos.x * 6, y: mousePos.y * 6 }}
          transition={{ type: 'spring', stiffness: 80, damping: 40 }}
        />
      </div>

      <div className="cta-container">
        {/* Badge */}
        <motion.div
          className="cta-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="badge-dot" />
          <span>Listos para tu próximo proyecto</span>
        </motion.div>

        {/* Interactive Heading */}
        <motion.h2
          className="cta-heading"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
        >
          <span className="heading-row">Creamos</span>
          <span className="heading-row">
            <span
              className={`hover-word ${hoveredWord === 'branding' ? 'active' : ''}`}
              style={{ '--wc': words.branding.color }}
              onMouseEnter={() => setHoveredWord('branding')}
              onMouseLeave={() => setHoveredWord(null)}
            >
              branding
              <AnimatePresence>
                {hoveredWord === 'branding' && (
                  <motion.div
                    className="word-popup"
                    style={{ borderColor: words.branding.color }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <svg className="popup-icon" width="22" height="22" viewBox="0 0 24 24" fill={words.branding.color}><path d={words.branding.icon}/></svg>
                    <span className="popup-label">{words.branding.label}</span>
                    <span className="popup-desc">{words.branding.desc}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
            {' '}y experiencias
          </span>
          <span className="heading-row">
            <span
              className={`hover-word ${hoveredWord === 'digital' ? 'active' : ''}`}
              style={{ '--wc': words.digital.color }}
              onMouseEnter={() => setHoveredWord('digital')}
              onMouseLeave={() => setHoveredWord(null)}
            >
              digitales
              <AnimatePresence>
                {hoveredWord === 'digital' && (
                  <motion.div
                    className="word-popup"
                    style={{ borderColor: words.digital.color }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <svg className="popup-icon" width="22" height="22" viewBox="0 0 24 24" fill={words.digital.color}><path d={words.digital.icon}/></svg>
                    <span className="popup-label">{words.digital.label}</span>
                    <span className="popup-desc">{words.digital.desc}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
            {' '}de alto{' '}
            <span
              className={`hover-word ${hoveredWord === 'impacto' ? 'active' : ''}`}
              style={{ '--wc': words.impacto.color }}
              onMouseEnter={() => setHoveredWord('impacto')}
              onMouseLeave={() => setHoveredWord(null)}
            >
              impacto
              <AnimatePresence>
                {hoveredWord === 'impacto' && (
                  <motion.div
                    className="word-popup"
                    style={{ borderColor: words.impacto.color }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <svg className="popup-icon" width="22" height="22" viewBox="0 0 24 24" fill={words.impacto.color}><path d={words.impacto.icon}/></svg>
                    <span className="popup-label">{words.impacto.label}</span>
                    <span className="popup-desc">{words.impacto.desc}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="cta-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Transformamos ideas en resultados. Desde identidad visual hasta desarrollo web,
          impulsamos tu negocio al siguiente nivel.
        </motion.p>

        {/* Floating Stats */}
        <div className="cta-stats-floating">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="floating-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? {
                opacity: 1,
                y: 0,
                x: mousePos.x * stat.offset.x * 8,
              } : {}}
              transition={{
                opacity: { duration: 0.5, delay: 0.6 + i * 0.12 },
                y: { duration: 0.5, delay: 0.6 + i * 0.12 },
                x: { type: 'spring', stiffness: 60, damping: 30 },
              }}
              style={{ '--stat-color': stat.color }}
            >
              <div className="fs-accent" style={{ backgroundColor: stat.color }} />
              <div className="fs-icon" style={{ color: stat.color }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d={stat.icon} />
                </svg>
              </div>
              <div className="fs-content">
                <span className="fs-value" style={{ color: stat.color }}>{stat.value}</span>
                <span className="fs-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          className="cta-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a
            href="#contact"
            className="cta-btn-primary"
            onClick={handleScrollToContact}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Comenzar Proyecto
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.a>
          <motion.a
            href="#projects"
            className="cta-btn-ghost"
            onClick={handleScrollToProjects}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Ver Proyectos
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
