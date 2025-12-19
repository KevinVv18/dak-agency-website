import React, { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import './Services.css'

const Services = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [playingVideo, setPlayingVideo] = useState(null)

  const handleVideoHover = (e) => {
    const video = e.currentTarget.querySelector('video')
    if (video) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }

  const handleVideoLeave = (e) => {
    const video = e.currentTarget.querySelector('video')
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  // Handle click/tap for mobile - toggle video play
  const handleVideoClick = (e, serviceId) => {
    const video = e.currentTarget.querySelector('video')
    if (video) {
      if (playingVideo === serviceId) {
        video.pause()
        video.currentTime = 0
        setPlayingVideo(null)
      } else {
        // Pause any other playing video first
        document.querySelectorAll('.service-video').forEach(v => {
          v.pause()
          v.currentTime = 0
        })
        video.currentTime = 0
        video.play().catch(() => {})
        setPlayingVideo(serviceId)
      }
    }
  }

  const handleScrollToContact = (e) => {
    e.preventDefault()
    const contactSection = document.querySelector('#contact, #contacto, .contact-form')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Fila 1: Branding, Fotografía Profesional, Video Publicitario, Social Media Management
  // Fila 2: Diseño Web, SEO, Automatización & CRM
  const services = [
    {
      id: 1,
      title: 'Branding',
      subtitle: 'Identidad Visual',
      category: 'BRANDING',
      description: 'Construcción de identidades de marca memorables que destacan en el mercado digital.',
      features: [
        'Identidad visual (logo, colores, estilo)',
        'Rediseño de marca',
        'Manual de marca'
      ],
      color: '#B024FF',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763849733/60774eb1-3b74-41e0-9238-796bc61b4c36_hd_m5uts5.mp4'
    },
    {
      id: 2,
      title: 'Fotografía Profesional',
      subtitle: 'Captura Visual',
      category: 'PHOTOGRAPHY',
      description: 'Fotografía profesional para eventos, productos y contenido de marca con edición de alta calidad.',
      features: [
        'Sesiones en estudio',
        'Eventos y festivales',
        'Edición y entrega digital'
      ],
      color: '#00C8C8',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763852525/12810774_2160_3840_30fps_srdrpp.mp4'
    },
    {
      id: 3,
      title: 'Video Publicitario',
      subtitle: 'Producción Audiovisual',
      category: 'VIDEO',
      description: 'Creación de contenido audiovisual profesional que cuenta la historia de tu marca.',
      features: [
        'Grabación 4K',
        'Tomas con dron',
        'Edición profesional'
      ],
      color: '#00B478',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763854544/8906351-hd_1080_1920_24fps_axwmvp.mp4'
    },
    {
      id: 4,
      title: 'Social Media Management',
      subtitle: 'Gestión de Redes',
      category: 'SOCIAL MEDIA',
      description: 'Gestión completa de tus redes sociales con contenido estratégico que conecta con tu audiencia.',
      features: [
        'Gestión de redes',
        'Contenido + Reels/TikToks',
        'Publicidad en Meta/TikTok'
      ],
      color: '#D4A574',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763858866/6003991-uhd_2160_3840_30fps_mnavuh.mp4'
    },
    {
      id: 5,
      title: 'Diseño Web & UX/UI',
      subtitle: 'Experiencia Digital',
      category: 'WEB DESIGN',
      description: 'Desarrollo de sitios web modernos, rápidos y optimizados para convertir visitantes en clientes.',
      features: [
        'Sitios en WordPress',
        'Tiendas Online / Ecommerce',
        'Diseño responsivo y rápido'
      ],
      color: '#FF6B35',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/Crea_un_video_202512081540_3trka_f71zay.mp4'
    },
    {
      id: 6,
      title: 'SEO & Publicidad Digital',
      subtitle: 'Marketing Digital (SEM)',
      category: 'SEO/SEM',
      description: 'Posicionamiento en buscadores y campañas publicitarias que generan resultados medibles.',
      features: [
        'SEO para posicionamiento',
        'Google Ads y campañas PPC',
        'Reportes y optimización'
      ],
      color: '#4A90E2',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765238189/a7bd9fdd-f753-4ef3-8a39-8e8d00b1afe2_gyqzwi.mp4'
    },
    {
      id: 7,
      title: 'Automatización & CRM',
      subtitle: 'Optimización de Procesos',
      category: 'AUTOMATION',
      description: 'Configuración de sistemas para automatizar procesos y mejorar la gestión de clientes.',
      features: [
        'Configuración de CRM',
        'Flujos automatizados',
        'Segmentación de clientes'
      ],
      color: '#B024FF',
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1765239599/7bb56f61-ca44-4c3f-9918-8b61aa68140d_jnv2ti.mp4'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  }

  // SVG Icons para cada servicio (orden: Branding, Fotografía, Video, Social, Web, SEO, CRM)
  const getServiceIcon = (id) => {
    const icons = {
      1: ( // Branding - Sparkles
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/>
          <path d="M19 17v4"/>
          <path d="M3 5h4"/>
          <path d="M17 19h4"/>
        </svg>
      ),
      2: ( // Fotografía - Camera
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      ),
      3: ( // Video - Video
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
          <rect x="2" y="6" width="14" height="12" rx="2"/>
        </svg>
      ),
      4: ( // Social Media - Share2
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
          <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
        </svg>
      ),
      5: ( // Web - Monitor
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2"/>
          <line x1="8" x2="16" y1="21" y2="21"/>
          <line x1="12" x2="12" y1="17" y2="21"/>
        </svg>
      ),
      6: ( // SEO - TrendingUp
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
      7: ( // CRM - Database
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
          <path d="M3 12A9 3 0 0 0 21 12"/>
        </svg>
      )
    }
    return icons[id] || icons[1]
  }

  return (
    <section className="services" id="services" ref={ref}>
      <div className="container">
        <motion.div
          className="services-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-subtitle">
            Soluciones digitales completas para acelerar el crecimiento de tu negocio
          </p>
        </motion.div>

        <motion.div
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="service-card-wrapper"
              variants={itemVariants}
            >
              <div
                className={`service-card service-card-${service.id} ${playingVideo === service.id ? 'video-playing' : ''}`}
                onMouseEnter={handleVideoHover}
                onMouseLeave={handleVideoLeave}
                onClick={(e) => handleVideoClick(e, service.id)}
              >
                {/* Video overlay */}
                <div className="video-overlay">
                  <video
                    src={service.videoSrc}
                    preload="auto"
                    muted
                    playsInline
                    loop
                    className="service-video"
                    poster={`${service.videoSrc}#t=0.1`}
                  />
                  <div className="video-dark-overlay"></div>
                </div>

                {/* Top section */}
                <div className="service-top">
                  <div className="service-header-row">
                    <div className="service-icon">
                      {getServiceIcon(service.id)}
                    </div>
                    <span className="service-badge">{service.category}</span>
                  </div>

                  <div className="service-title-section">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-subtitle">{service.subtitle}</p>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="service-bottom">
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-features">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="service-footer">
                    <button 
                      onClick={handleScrollToContact}
                      className="contact-button"
                    >
                      Contactar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Services


