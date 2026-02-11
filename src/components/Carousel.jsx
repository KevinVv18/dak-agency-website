import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Carousel.css'

const Carousel = ({ images, color, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(() => {
      handleNext()
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, autoPlay, images.length, interval])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  }

  if (images.length === 0) return null

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            className="carousel-image-container"
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="carousel-image"
              loading="lazy"
            />
            {images[currentIndex].tipo && (
              <span 
                className="carousel-tipo-badge"
                style={{ backgroundColor: color }}
              >
                {images[currentIndex].tipo}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              className="carousel-button carousel-button-prev"
              onClick={handlePrev}
              aria-label="Anterior"
              style={{ borderColor: color }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button
              className="carousel-button carousel-button-next"
              onClick={handleNext}
              aria-label="Siguiente"
              style={{ borderColor: color }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Ir a imagen ${index + 1}`}
              style={{
                backgroundColor: index === currentIndex ? color : 'rgba(255,255,255,0.3)'
              }}
            />
          ))}
        </div>
      )}

      <div className="carousel-counter" style={{ color }}>
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}

export default Carousel
