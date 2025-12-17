import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './CTASection.css'

const CTASection = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  const handleScrollToProjects = (e) => {
    e.preventDefault()
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  const stats = [
    { number: '50+', label: 'Proyectos Completados' },
    { number: '98%', label: 'Clientes Satisfechos' },
    { number: '5+', label: 'Años de Experiencia' }
  ]

  return (
    <section className="cta-section" ref={sectionRef}>
      {/* Background animated elements */}
      <div className="cta-bg-elements">
        <div className="cta-glow cta-glow-1"></div>
        <div className="cta-glow cta-glow-2"></div>
        <div className="cta-glow cta-glow-3"></div>
      </div>

      {/* Animated lines */}
      <div className="cta-lines">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="cta-line"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 0.1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 1.5, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
          />
        ))}
      </div>

      <div className="cta-container">
        {/* Main content */}
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="cta-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="badge-dot"></span>
            <span>Listos para tu próximo proyecto</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="cta-title"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Hagamos crecer
            <span className="cta-title-highlight"> tu marca</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="cta-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Transformamos ideas en experiencias digitales que generan resultados. 
            Desde branding hasta desarrollo web, estamos aquí para impulsar tu negocio.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="cta-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA - Interactive Card to Projects */}
          <motion.div
            className="cta-interactive-link"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div
              className="project-preview-card"
              onClick={handleScrollToProjects}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-content">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="card-text">
                  <h3>Explora Nuestro Trabajo</h3>
                  <p>Descubre proyectos recientes que transformaron marcas</p>
                </div>
                <div className="card-arrow">
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </motion.svg>
                </div>
              </div>
              
              <div className="card-glow"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="cta-decorative">
          <motion.div
            className="deco-circle deco-circle-1"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.div
            className="deco-circle deco-circle-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.div
            className="deco-ring"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={isInView ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -45 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
          />
        </div>
      </div>
    </section>
  )
}

export default CTASection
