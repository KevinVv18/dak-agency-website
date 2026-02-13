import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Services.css'

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [viewedServices, setViewedServices] = useState(new Set([0]))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const thumbnailsRef = useRef(null)
  const videoRef = useRef(null)
  const preloadRef = useRef(null)
  const servicesRef = useRef(null)

  // Servicios con contenido completo
  const services = [
    {
      id: 1,
      title: 'Branding',
      tagline: 'Tu marca, inolvidable',
      description: 'Creamos identidades visuales únicas que destacan en el mercado. Desde logotipos hasta sistemas de marca completos que conectan emocionalmente con tu audiencia.',
      category: 'IDENTIDAD',
      color: '#B024FF',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763849733/60774eb1-3b74-41e0-9238-796bc61b4c36_hd_m5uts5.mp4',
      price: 'Desde S/ 1,500',
      clients: 6,
      icon: 'M19 3H5L2 9l10 13L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.24 5h2.65l-1.5 3H4.74l1.5-3z'
    },
    {
      id: 2,
      title: 'Fotografía',
      tagline: 'Imágenes que venden por ti',
      description: 'Fotografía profesional que captura la esencia de tu marca. Productos, retratos corporativos y contenido visual que eleva tu presencia.',
      category: 'VISUAL',
      color: '#00C8C8',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763852525/12810774_2160_3840_30fps_srdrpp.mp4',
      price: 'Desde S/ 800',
      clients: 5,
      icon: 'M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H5v-9H3v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM5 6h3V4H5V1H3v3H0v2h3v3h2z'
    },
    {
      id: 3,
      title: 'Video',
      tagline: 'Historias que conectan',
      description: 'Producción audiovisual de alto impacto. Comerciales, contenido para redes y videos corporativos que cuentan tu historia de forma memorable.',
      category: 'PRODUCCIÓN',
      color: '#00B478',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763854544/8906351-hd_1080_1920_24fps_axwmvp.mp4',
      price: 'Desde S/ 2,000',
      clients: 4,
      icon: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z'
    },
    {
      id: 4,
      title: 'Social Media',
      tagline: 'Convierte seguidores en clientes',
      description: 'Estrategias de contenido y gestión de redes que construyen comunidades activas. Engagement real que se traduce en resultados de negocio.',
      category: 'REDES',
      color: '#D4A574',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763858866/6003991-uhd_2160_3840_30fps_mnavuh.mp4',
      price: 'Desde S/ 600/mes',
      clients: 6,
      icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
    },
    {
      id: 5,
      title: 'Diseño Web',
      tagline: 'Tu mejor vendedor 24/7',
      description: 'Sitios web modernos y funcionales que convierten visitantes en clientes. Diseño responsivo, rápido y optimizado para resultados.',
      category: 'DESARROLLO',
      color: '#FF6B35',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/Crea_un_video_202512081540_3trka_f71zay.mp4',
      price: 'Desde S/ 2,500',
      clients: 3,
      icon: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z'
    },
    {
      id: 6,
      title: 'SEO & Ads',
      tagline: 'Aparece primero, vende más',
      description: 'Posicionamiento orgánico y campañas publicitarias que maximizan tu inversión. Aparece donde tus clientes te buscan.',
      category: 'MARKETING',
      color: '#4A90E2',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/a7bd9fdd-f753-4ef3-8a39-8e8d00b1afe0_gyqzwi.mp4',
      price: 'Desde S/ 800/mes',
      clients: 4,
      icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
    },
    {
      id: 7,
      title: 'Automatización',
      tagline: 'Trabaja menos, logra más',
      description: 'Sistemas inteligentes que automatizan tu marketing y ventas. CRM, email marketing y workflows que trabajan mientras duermes.',
      category: 'CRM',
      color: '#9B59B6',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765239599/7bb56f61-ca44-4c3f-9918-8b61aa68140d_jnv2ti.mp4',
      price: 'Desde S/ 1,200',
      clients: 2,
      icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'
    }
  ]

  const activeService = services[activeIndex]

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll thumbnail activa al centro en mobile
  useEffect(() => {
    if (isMobile && thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[activeIndex]
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        })
      }
    }
  }, [activeIndex, isMobile])

  // Reiniciar video al cambiar servicio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [activeIndex])

  const handleScrollToContact = (e) => {
    e.preventDefault()
    const contactSection = document.querySelector('#contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle thumbnail click (desktop)
  const handleThumbnailClick = (index) => {
    setActiveIndex(index)
    setViewedServices(prev => new Set([...prev, index]))
  }

  // Handle drawer service click (mobile) - scroll to services + change video
  const handleDrawerServiceClick = (index) => {
    setActiveIndex(index)
    setViewedServices(prev => new Set([...prev, index]))
    setDrawerOpen(false)
    
    // Scroll to services section
    setTimeout(() => {
      if (servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 200)
  }

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev)
  }

  // Navigate services (mobile arrows)
  const goNext = () => {
    const next = (activeIndex + 1) % services.length
    setActiveIndex(next)
    setViewedServices(prev => new Set([...prev, next]))
  }

  const goPrev = () => {
    const prev = (activeIndex - 1 + services.length) % services.length
    setActiveIndex(prev)
    setViewedServices(p => new Set([...p, prev]))
  }

  // Preload next video
  useEffect(() => {
    const nextIndex = (activeIndex + 1) % services.length
    if (preloadRef.current && services[nextIndex]) {
      preloadRef.current.src = services[nextIndex].videoSrc
    }
  }, [activeIndex, services])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev + 1) % services.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev - 1 + services.length) % services.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [services.length])

  return (
    <>
      <section className="services" id="services" ref={servicesRef}>
        <div className="services-container">
          {/* Header */}
          <motion.div
            className="services-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">[ 01 ]</span>
            <h2 className="section-title">
              <span className="title-bold">Servicios</span>
            </h2>
            <div className="title-line" />
            <p className="section-subtitle">
              Soluciones digitales que impulsan tu negocio
            </p>
          </motion.div>

          {/* Showcase Layout */}
          <div className="showcase-layout">
            {/* Panel principal - Servicio destacado */}
            <div className="featured-service">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  className="featured-video-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <video
                    ref={videoRef}
                    src={activeService.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="featured-video"
                  />
                  <div 
                    className="featured-overlay"
                    style={{ 
                      background: `linear-gradient(135deg, 
                        ${activeService.color}15 0%, 
                        rgba(0,0,0,0.7) 50%, 
                        rgba(0,0,0,0.95) 100%)`
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Mobile navigation arrows */}
              {isMobile && (
                <>
                  <button className="nav-arrow nav-arrow-left" onClick={goPrev} aria-label="Anterior">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button className="nav-arrow nav-arrow-right" onClick={goNext} aria-label="Siguiente">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  className="featured-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div className="featured-header-info">
                    <span 
                      className="featured-number"
                      style={{ color: activeService.color }}
                    >
                      {String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    
                    <span 
                      className="featured-category"
                      style={{ 
                        color: activeService.color,
                        backgroundColor: `${activeService.color}20`
                      }}
                    >
                      {activeService.category}
                    </span>
                  </div>
                  
                  <motion.div 
                    className="featured-icon" 
                    style={{ color: activeService.color }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                  >
                    <svg 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      className="service-icon"
                    >
                      <path d={activeService.icon} />
                    </svg>
                  </motion.div>

                  <h3 className="featured-title">{activeService.title}</h3>
                  <p className="featured-tagline">{activeService.tagline}</p>
                  <p className="featured-description">{activeService.description}</p>
                  
                  <div className="featured-stats">
                    <span className="stat-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      {activeService.clients}+ clientes
                    </span>
                    <span className="stat-badge price-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                      {activeService.price}
                    </span>
                  </div>
                  
                  <button
                    className="featured-cta"
                    onClick={handleScrollToContact}
                    style={{ backgroundColor: activeService.color }}
                  >
                    Cotizar Servicio
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Progress indicator */}
              <div className="featured-progress">
                <div className="progress-track">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      className={`progress-segment ${viewedServices.has(index) ? 'viewed' : ''} ${index === activeIndex ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: viewedServices.has(index) ? service.color : 'rgba(255,255,255,0.1)',
                        flex: 1
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    />
                  ))}
                </div>
                <span className="progress-text">
                  {viewedServices.size} de {services.length} servicios vistos
                </span>
              </div>

              {/* Preload next video */}
              <video
                ref={preloadRef}
                preload="auto"
                style={{ display: 'none' }}
              />
            </div>

            {/* Panel de miniaturas - Desktop only */}
            <div className="thumbnails-panel">
              <div className="thumbnails-header">
                <span className="thumbnails-count">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                </span>
                <span className="thumbnails-label">Servicios</span>
              </div>
              
              <div 
                className="services-thumbnails"
                ref={thumbnailsRef}
              >
                {services.map((service, index) => {
                  const isActive = index === activeIndex
                  const isViewed = viewedServices.has(index)
                  return (
                    <motion.div
                      key={service.id}
                      className={`thumbnail ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                      style={{ 
                        '--thumb-color': service.color,
                        borderColor: isActive ? service.color : 'transparent'
                      }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="thumbnail-video-wrapper">
                        <video
                          src={service.videoSrc}
                          muted
                          playsInline
                          loop
                          preload="metadata"
                          className="thumbnail-video"
                        />
                        <div className="thumbnail-overlay" />
                      </div>
                      
                      <div className="thumbnail-icon" style={{ color: service.color }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d={service.icon} />
                        </svg>
                      </div>

                      <div className="thumbnail-info">
                        <span 
                          className="thumbnail-number"
                          style={{ color: isActive ? service.color : 'rgba(255,255,255,0.4)' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="thumbnail-title">{service.title}</span>
                        <span className="thumbnail-tagline">{service.tagline}</span>
                        <span className="thumbnail-price-static" style={{ color: service.color }}>
                          {service.price}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div 
                          className="thumbnail-active-indicator"
                          layoutId="activeIndicator"
                          style={{ backgroundColor: service.color }}
                        />
                      )}

                      {isViewed && !isActive && (
                        <div className="thumbnail-viewed-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DESKTOP SIDEBAR - Icons nav lateral ===== */}
      {!isMobile && (
        <div className="services-sidebar">
          <span className="sidebar-label">SERVICIOS</span>
          <div className="sidebar-track">
            <div className="sidebar-progress-line">
              <motion.div 
                className="sidebar-progress-fill"
                style={{ backgroundColor: activeService.color }}
                animate={{ height: `${((activeIndex) / (services.length - 1)) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            {services.map((service, index) => {
              const isActive = index === activeIndex
              const isViewed = viewedServices.has(index)
              return (
                <div
                  key={service.id}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                  onClick={() => {
                    setActiveIndex(index)
                    setViewedServices(prev => new Set([...prev, index]))
                    if (servicesRef.current) {
                      servicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  <motion.div
                    className="sidebar-icon"
                    style={{
                      color: isActive ? service.color : isViewed ? service.color : 'rgba(255,255,255,0.3)',
                      backgroundColor: isActive ? `${service.color}15` : 'transparent',
                      borderColor: isActive ? `${service.color}40` : 'transparent'
                    }}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d={service.icon} />
                    </svg>
                    {isActive && (
                      <motion.div
                        className="sidebar-icon-glow"
                        style={{ backgroundColor: service.color }}
                        layoutId="sidebarGlow"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                  </motion.div>
                  <div className="sidebar-tooltip">
                    <span className="sidebar-tooltip-title">{service.title}</span>
                    <span className="sidebar-tooltip-price" style={{ color: service.color }}>
                      {service.price}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <span className="sidebar-counter">
            {viewedServices.size}<span className="sidebar-counter-sep">/</span>{services.length}
          </span>
        </div>
      )}

      {/* ===== GLOBAL BOTTOM BAR - Visible siempre en móvil ===== */}
      {isMobile && (
        <>
          {/* Backdrop overlay cuando drawer está abierto */}
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                className="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Bottom Bar + Drawer */}
          <motion.div
            className="services-bottom-bar"
            initial={false}
            animate={{ 
              height: drawerOpen ? '75vh' : '56px'
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Bar Header - siempre visible */}
            <div className="bottom-bar-header" onClick={toggleDrawer}>
              <div className="bottom-bar-left">
                <div 
                  className="bottom-bar-dot"
                  style={{ backgroundColor: activeService.color }}
                />
                <span className="bottom-bar-title">Servicios</span>
                <span className="bottom-bar-active" style={{ color: activeService.color }}>
                  {activeService.title}
                </span>
              </div>
              <div className="bottom-bar-right">
                <span className="bottom-bar-count">
                  {viewedServices.size}/{services.length}
                </span>
                <motion.svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="white"
                  animate={{ rotate: drawerOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </motion.svg>
              </div>
            </div>

            {/* Drawer Content - servicios grid */}
            <AnimatePresence>
              {drawerOpen && (
                <motion.div
                  className="drawer-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <div className="drawer-services-grid">
                    {services.map((service, index) => {
                      const isActive = index === activeIndex
                      const isViewed = viewedServices.has(index)
                      return (
                        <motion.div
                          key={service.id}
                          className={`drawer-service-card ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                          onClick={() => handleDrawerServiceClick(index)}
                          style={{ borderColor: isActive ? service.color : 'transparent' }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <div className="drawer-card-icon" style={{ color: service.color }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d={service.icon} />
                            </svg>
                          </div>
                          <div className="drawer-card-info">
                            <h4 className="drawer-card-title">{service.title}</h4>
                            <p className="drawer-card-tagline">{service.tagline}</p>
                            <span className="drawer-card-price" style={{ color: service.color }}>
                              {service.price}
                            </span>
                          </div>
                          {isActive && (
                            <motion.div 
                              className="drawer-card-active"
                              style={{ backgroundColor: service.color }}
                              layoutId="drawerActive"
                            />
                          )}
                          {isViewed && !isActive && (
                            <div className="drawer-card-check">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </>
  )
}

export default Services
