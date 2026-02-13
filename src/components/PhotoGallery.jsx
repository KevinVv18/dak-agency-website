import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import './PhotoGallery.css'

// Import gallery images
import babyPhoto from '../assets/gallery/baby1-min.jpg'
import familiaPhoto from '../assets/gallery/Familia1-min.jpg'
import hermanosPhoto from '../assets/gallery/hermanos.jpg'
import mamiPhoto from '../assets/gallery/mami1-min.jpg'
import parejaPhoto from '../assets/gallery/pareja1-min.jpg'
import pediatraPhoto from '../assets/gallery/PEDIATRA CORRALES@3x-min.jpg'

const PhotoGallery = () => {
  const sectionRef = useRef(null)
  const galleryRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMouseInside, setIsMouseInside] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)

  // Array de fotos reales
  const photos = [
    {
      id: 1,
      src: pediatraPhoto,
      title: 'Fotografía Profesional',
      category: 'Comercial',
      description: 'Imágenes corporativas que transmiten confianza y profesionalismo'
    },
    {
      id: 2,
      src: familiaPhoto,
      title: 'Retrato Familiar',
      category: 'Familias',
      description: 'Momentos especiales que unen a toda la familia para siempre'
    },
    {
      id: 3,
      src: hermanosPhoto,
      title: 'Lazos de Hermanos',
      category: 'Infantil',
      description: 'La complicidad y el amor entre hermanos en cada imagen'
    },
    {
      id: 4,
      src: parejaPhoto,
      title: 'Amor en Pareja',
      category: 'Parejas',
      description: 'Sesiones románticas que capturan la conexión especial entre dos'
    },
    {
      id: 5,
      src: mamiPhoto,
      title: 'Maternidad',
      category: 'Maternidad',
      description: 'Celebrando la belleza y la espera de una nueva vida'
    },
    {
      id: 6,
      src: babyPhoto,
      title: 'Sesión Newborn',
      category: 'Bebés',
      description: 'Capturando los primeros días de vida con ternura y delicadeza'
    }
  ]

  // Ocultar hint después del primer cambio de foto
  useEffect(() => {
    if (currentIndex > 0) {
      setShowScrollHint(false)
    }
  }, [currentIndex])

  // Handlers para detectar si el mouse está dentro del contenedor
  const handleMouseEnter = () => {
    setIsMouseInside(true)
  }

  const handleMouseLeave = () => {
    setIsMouseInside(false)
  }

  // Manejo del scroll para cambiar fotos (solo cuando el mouse está dentro)
  useEffect(() => {
    let lastScrollTime = 0
    const scrollCooldown = 500 // ms entre cambios de foto

    const handleWheel = (e) => {
      // Solo funciona si el mouse está dentro del contenedor
      if (!isMouseInside) return

      const now = Date.now()
      if (now - lastScrollTime < scrollCooldown) {
        e.preventDefault()
        return
      }

      // Scrolling hacia abajo
      if (e.deltaY > 0) {
        if (currentIndex < photos.length - 1) {
          e.preventDefault()
          setCurrentIndex(prev => prev + 1)
          lastScrollTime = now
        }
        // Si estamos en la última foto, permitir scroll normal
      }
      // Scrolling hacia arriba
      else if (e.deltaY < 0) {
        if (currentIndex > 0) {
          e.preventDefault()
          setCurrentIndex(prev => prev - 1)
          lastScrollTime = now
        }
        // Si estamos en la primera foto, permitir scroll normal
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [currentIndex, photos.length, isMouseInside])

  // Touch support para móviles - HORIZONTAL SWIPE
  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    let touchStartX = 0
    let touchStartY = 0
    let isSwiping = false

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      isSwiping = false
    }

    const handleTouchMove = (e) => {
      if (!touchStartX) return
      
      const touchX = e.touches[0].clientX
      const touchY = e.touches[0].clientY
      const deltaX = touchStartX - touchX
      const deltaY = touchStartY - touchY

      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        e.preventDefault()
        isSwiping = true
      }
    }

    const handleTouchEnd = (e) => {
      if (!isSwiping) return
      
      const touchEndX = e.changedTouches[0].clientX
      const deltaX = touchStartX - touchEndX

      // Swipe left = next photo
      if (deltaX > 50 && currentIndex < photos.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowScrollHint(false)
      }
      // Swipe right = previous photo
      else if (deltaX < -50 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
        setShowScrollHint(false)
      }

      touchStartX = 0
      touchStartY = 0
      isSwiping = false
    }

    gallery.addEventListener('touchstart', handleTouchStart, { passive: true })
    gallery.addEventListener('touchmove', handleTouchMove, { passive: false })
    gallery.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      gallery.removeEventListener('touchstart', handleTouchStart)
      gallery.removeEventListener('touchmove', handleTouchMove)
      gallery.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, photos.length])

  const currentPhoto = photos[currentIndex]

  const goToPhoto = (index) => {
    setCurrentIndex(index)
    setShowScrollHint(false)
  }

  return (
    <section className="photo-gallery" id="gallery" ref={sectionRef}>
      {/* Header */}
      <motion.div
        className="gallery-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">[ 03 ]</span>
        <h2 className="gallery-title">
          <span className="title-bold">Estudio</span>
        </h2>
        <div className="title-line" />
        <p className="gallery-subtitle">
          Capturando momentos que cuentan historias
        </p>
      </motion.div>

      {/* Gallery Container */}
      <div 
        className={`gallery-container ${isMouseInside ? 'active' : ''}`} 
        ref={galleryRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="gallery-content">
          {/* Foto Principal */}
          <motion.div
            className="gallery-image-container"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="gallery-image-wrapper">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="gallery-image-slide"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentPhoto.src ? (
                    <img
                      src={currentPhoto.src}
                      alt={currentPhoto.title}
                      className="gallery-image"
                    />
                  ) : (
                    <div className={`gallery-placeholder placeholder-${currentPhoto.id}`}>
                      <div className="placeholder-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                          <circle cx="12" cy="13" r="3"/>
                        </svg>
                        <span>Imagen {currentPhoto.id}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Overlay con número */}
              <div className="image-counter">
                <span className="counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="counter-separator">/</span>
                <span className="counter-total">{String(photos.length).padStart(2, '0')}</span>
              </div>

              {/* Scroll Hint - Mouse Animation */}
              <AnimatePresence>
                {showScrollHint && isMouseInside && (
                  <motion.div
                    className="scroll-hint"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="scroll-mouse">
                      <div className="scroll-wheel"></div>
                    </div>
                    <span>Scroll para navegar</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Panel de Información */}
          <motion.div
            className="gallery-info-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Progress Dots */}
            <div className="gallery-dots">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`gallery-dot ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'visited' : ''}`}
                  onClick={() => goToPhoto(index)}
                  aria-label={`Ver foto ${index + 1}`}
                />
              ))}
            </div>

            {/* Info de la foto actual */}
            <AnimatePresence mode="wait">
              <motion.div 
                className="photo-info"
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="photo-category">{currentPhoto.category}</span>
                <h3 className="photo-title">{currentPhoto.title}</h3>
                <p className="photo-description">{currentPhoto.description}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="scroll-progress">
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  animate={{ scaleX: (currentIndex + 1) / photos.length }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="progress-label">
                {currentIndex === photos.length - 1 ? '✓ Galería completa' : `${currentIndex + 1} de ${photos.length} fotos`}
              </span>
            </div>

            {/* Navigation Arrows */}
            <div className="gallery-nav">
              <button 
                className="nav-button prev"
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1)
                    setShowScrollHint(false)
                  }
                }}
                disabled={currentIndex === 0}
                aria-label="Foto anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button 
                className="nav-button next"
                onClick={() => {
                  if (currentIndex < photos.length - 1) {
                    setCurrentIndex(currentIndex + 1)
                    setShowScrollHint(false)
                  }
                }}
                disabled={currentIndex === photos.length - 1}
                aria-label="Siguiente foto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Button */}
      <motion.div
        className="gallery-cta"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <a href="/galeria" className="gallery-button">
          <span>Ver Galería Completa</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </motion.div>
    </section>
  )
}

export default PhotoGallery
