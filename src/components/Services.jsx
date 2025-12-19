import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Services.css'

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const thumbnailsRef = useRef(null)
  const videoRef = useRef(null)

  // Servicios con contenido completo
  const services = [
    {
      id: 1,
      title: 'Branding',
      tagline: 'Tu marca, inolvidable',
      description: 'Creamos identidades visuales únicas que destacan en el mercado. Desde logotipos hasta sistemas de marca completos que conectan emocionalmente con tu audiencia.',
      category: 'IDENTIDAD',
      color: '#B024FF',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763849733/60774eb1-3b74-41e0-9238-796bc61b4c36_hd_m5uts5.mp4'
    },
    {
      id: 2,
      title: 'Fotografía',
      tagline: 'Imágenes que venden por ti',
      description: 'Fotografía profesional que captura la esencia de tu marca. Productos, retratos corporativos y contenido visual que eleva tu presencia.',
      category: 'VISUAL',
      color: '#00C8C8',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763852525/12810774_2160_3840_30fps_srdrpp.mp4'
    },
    {
      id: 3,
      title: 'Video',
      tagline: 'Historias que conectan',
      description: 'Producción audiovisual de alto impacto. Comerciales, contenido para redes y videos corporativos que cuentan tu historia de forma memorable.',
      category: 'PRODUCCIÓN',
      color: '#00B478',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763854544/8906351-hd_1080_1920_24fps_axwmvp.mp4'
    },
    {
      id: 4,
      title: 'Social Media',
      tagline: 'Convierte seguidores en clientes',
      description: 'Estrategias de contenido y gestión de redes que construyen comunidades activas. Engagement real que se traduce en resultados de negocio.',
      category: 'REDES',
      color: '#D4A574',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763858866/6003991-uhd_2160_3840_30fps_mnavuh.mp4'
    },
    {
      id: 5,
      title: 'Diseño Web',
      tagline: 'Tu mejor vendedor 24/7',
      description: 'Sitios web modernos y funcionales que convierten visitantes en clientes. Diseño responsivo, rápido y optimizado para resultados.',
      category: 'DESARROLLO',
      color: '#FF6B35',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/Crea_un_video_202512081540_3trka_f71zay.mp4'
    },
    {
      id: 6,
      title: 'SEO & Ads',
      tagline: 'Aparece primero, vende más',
      description: 'Posicionamiento orgánico y campañas publicitarias que maximizan tu inversión. Aparece donde tus clientes te buscan.',
      category: 'MARKETING',
      color: '#4A90E2',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/a7bd9fdd-f753-4ef3-8a39-8e8d00b1afe0_gyqzwi.mp4'
    },
    {
      id: 7,
      title: 'Automatización',
      tagline: 'Trabaja menos, logra más',
      description: 'Sistemas inteligentes que automatizan tu marketing y ventas. CRM, email marketing y workflows que trabajan mientras duermes.',
      category: 'CRM',
      color: '#9B59B6',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765239599/7bb56f61-ca44-4c3f-9918-8b61aa68140d_jnv2ti.mp4'
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
    <section className="services" id="services">
      <div className="services-container">
        {/* Header */}
        <motion.div
          className="services-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Nuestros Servicios</h2>
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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                className="featured-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
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
                
                <h3 className="featured-title">{activeService.title}</h3>
                <p className="featured-tagline">{activeService.tagline}</p>
                <p className="featured-description">{activeService.description}</p>
                
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
              <motion.div 
                className="progress-bar"
                style={{ backgroundColor: activeService.color }}
                initial={{ width: '0%' }}
                animate={{ width: `${((activeIndex + 1) / services.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Panel de miniaturas */}
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
                return (
                  <motion.div
                    key={service.id}
                    className={`thumbnail ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                    style={{ 
                      '--thumb-color': service.color,
                      borderColor: isActive ? service.color : 'transparent'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                    
                    <div className="thumbnail-info">
                      <span 
                        className="thumbnail-number"
                        style={{ color: isActive ? service.color : 'rgba(255,255,255,0.4)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="thumbnail-title">{service.title}</span>
                      <span className="thumbnail-tagline">{service.tagline}</span>
                    </div>

                    {isActive && (
                      <motion.div 
                        className="thumbnail-active-indicator"
                        layoutId="activeIndicator"
                        style={{ backgroundColor: service.color }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
