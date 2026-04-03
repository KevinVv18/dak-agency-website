import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { galleryItems, bannerItems, photoItems, categories } from '../data/galleryData'
import './Gallery.css'

/* ─────────────────────────────────────────
   Section 1: Hero + Category Filter
   ───────────────────────────────────────── */
const GalleryHero = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="gallery-hero" ref={ref}>
      <motion.div
        className="gallery-hero-badge"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, type: 'spring', damping: 15 }}
      >
        <span className="badge-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
        </span>
        <span>GALLERY</span>
        <span className="badge-count">{galleryItems.length + bannerItems.length + photoItems.length}</span>
      </motion.div>
      <motion.h1
        className="gallery-hero-title"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <span className="title-bold">Nuestro</span>{' '}
        <span className="title-accent">Trabajo</span>
      </motion.h1>
      <div className="title-line" />
      <motion.p
        className="gallery-hero-sub"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        Diseño, fotografía y estrategia visual — todo lo que hacemos, en un solo lugar.
      </motion.p>
    </div>
  )
}

/* ─────────────────────────────────────────
   Section 2: Masonry Grid with Filters
   ───────────────────────────────────────── */
const MasonryGrid = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)

  const filtered = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(i => i.category === activeFilter)

  return (
    <div className="masonry-section" ref={ref}>
      {/* Filter bar */}
      <motion.div
        className="filter-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-pill ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <motion.div className="masonry-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className={`masonry-item masonry-item--${i % 3 === 0 ? 'tall' : i % 5 === 0 ? 'wide' : 'normal'}`}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              onClick={() => setLightbox(item)}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
              <div className="masonry-overlay">
                <span className="masonry-type" style={{ borderColor: item.color }}>{item.type}</span>
                <h4>{item.alt}</h4>
                <p>{item.client}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src} alt={lightbox.alt} />
              <div className="lightbox-info">
                <span className="lightbox-type" style={{ color: lightbox.color }}>{lightbox.type}</span>
                <h3>{lightbox.alt}</h3>
                <p>{lightbox.client}</p>
              </div>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────
   Section 3: Horizontal Banner Scroll
   ───────────────────────────────────────── */
const BannerShowcase = () => {
  const containerRef = useRef(null)
  const scrollRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-60px' })

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  return (
    <div className="banner-section" ref={containerRef}>
      <motion.div
        className="banner-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h3 className="banner-title">Portadas que <span className="title-accent">Impactan</span></h3>
        <div className="banner-nav">
          <button className="banner-arrow" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="banner-arrow" onClick={() => scroll(1)} aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </motion.div>

      <div className="banner-track" ref={scrollRef}>
        {bannerItems.map((b, i) => (
          <motion.div
            key={b.id}
            className="banner-card"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <img src={b.src} alt={b.alt} loading="lazy" />
            <div className="banner-card-overlay">
              <span>{b.client}</span>
              <h4>{b.alt}</h4>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="banner-accent-line" />
    </div>
  )
}

/* ─────────────────────────────────────────
   Section 4: Photography Parallax Showcase
   ───────────────────────────────────────── */
const PhotoParallax = () => {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-60px' })
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] })

  return (
    <div className="photo-parallax-section" ref={containerRef}>
      <motion.div
        className="photo-parallax-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h3 className="photo-parallax-title">Detrás del <span className="title-accent">Lente</span></h3>
        <p className="photo-parallax-sub">Sesiones profesionales que capturan la esencia de cada marca</p>
      </motion.div>

      <div className="photo-parallax-grid">
        {photoItems.map((photo, i) => (
          <ParallaxCard key={photo.id} photo={photo} index={i} scrollProgress={scrollYProgress} isInView={isInView} />
        ))}
      </div>
    </div>
  )
}

const ParallaxCard = ({ photo, index, scrollProgress, isInView }) => {
  const speed = index % 2 === 0 ? 40 : -40
  const y = useTransform(scrollProgress, [0, 1], [speed, -speed])

  return (
    <motion.div
      className={`parallax-card parallax-card--${index % 3 === 0 ? 'large' : 'small'}`}
      style={{ y }}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="parallax-img-wrap">
        <img src={photo.src} alt={photo.title} loading="lazy" />
        <div className="parallax-overlay">
          <span className="parallax-cat">{photo.category}</span>
          <h4>{photo.title}</h4>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Section 5: Reveal-on-Scroll Showcase
   ───────────────────────────────────────── */
const ScrollRevealShowcase = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const featuredItems = [
    { ...galleryItems[0], description: 'Diseño de contenido visual para redes sociales que conecta con la audiencia objetivo.' },
    { ...galleryItems[7], description: 'Campañas promocionales con diseño llamativo y estrategia de comunicación efectiva.' },
    { ...galleryItems[2], description: 'Identidad visual médica que transmite profesionalismo y confianza.' },
  ]

  return (
    <div className="reveal-section" ref={ref}>
      <motion.div
        className="reveal-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h3 className="reveal-title">Lo que nos <span className="title-accent">Define</span></h3>
      </motion.div>

      {featuredItems.map((item, i) => (
        <RevealRow key={item.id} item={item} index={i} reverse={i % 2 !== 0} />
      ))}
    </div>
  )
}

const RevealRow = ({ item, index, reverse }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      className={`reveal-row ${reverse ? 'reveal-row--reverse' : ''}`}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="reveal-image">
        <motion.div
          className="reveal-image-curtain"
          initial={{ scaleX: 1 }}
          animate={isInView ? { scaleX: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
        />
        <img src={item.src} alt={item.alt} loading="lazy" />
      </div>
      <div className="reveal-info">
        <span className="reveal-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="reveal-type" style={{ color: item.color }}>{item.type}</span>
        <h4>{item.alt}</h4>
        <p className="reveal-client">{item.client}</p>
        <p className="reveal-desc">{item.description}</p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Section 6: Stats + CTA
   ───────────────────────────────────────── */
const GalleryCTA = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const stats = [
    { number: '150+', label: 'Proyectos' },
    { number: '30+', label: 'Clientes' },
    { number: '5', label: 'Años' },
  ]

  return (
    <div className="gallery-cta-section" ref={ref}>
      <div className="gallery-cta-grid-bg" />
      <motion.div
        className="gallery-stats"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="gallery-cta-content"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3>Tu marca merece <span className="title-accent">verse así</span></h3>
        <p>Cuéntanos tu idea y la convertimos en algo que nadie pueda ignorar.</p>
        <a href="#contact" className="gallery-cta-btn">
          <span>Conversemos</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Glossy Floating Nav (bottom)
   ───────────────────────────────────────── */
const navSections = [
  { id: 'masonry', label: 'Grid', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id: 'banners', label: 'Banners', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="18" y2="10"/></svg> },
  { id: 'photos', label: 'Fotos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> },
  { id: 'featured', label: 'Destacados', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
]

const GlossyNav = ({ activeSection, totalImages }) => {
  const scrollTo = (sectionId) => {
    const map = { masonry: '.masonry-section', banners: '.banner-section', photos: '.photo-parallax-section', featured: '.reveal-section' }
    const el = document.querySelector(map[sectionId])
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`gallery-floating-nav ${activeSection ? 'visible' : ''}`}>
      {navSections.map((s, i) => (
        <React.Fragment key={s.id}>
          {i > 0 && <div className="floating-nav-divider" />}
          <button
            className={`floating-nav-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => scrollTo(s.id)}
            aria-label={s.label}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        </React.Fragment>
      ))}
      <div className="floating-nav-counter">{totalImages} obras</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Gallery Component
   ───────────────────────────────────────── */
const Gallery = () => {
  const [activeSection, setActiveSection] = useState(null)
  const totalImages = galleryItems.length + bannerItems.length + photoItems.length

  useEffect(() => {
    const sectionMap = [
      { id: 'masonry', selector: '.masonry-section' },
      { id: 'banners', selector: '.banner-section' },
      { id: 'photos', selector: '.photo-parallax-section' },
      { id: 'featured', selector: '.reveal-section' },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) => a.intersectionRatio > b.intersectionRatio ? a : b)
          const match = sectionMap.find(s => top.target.matches(s.selector))
          if (match) setActiveSection(match.id)
        }
      },
      { threshold: 0.2 }
    )

    const galleryEl = document.querySelector('.gallery-page')
    if (!galleryEl) return

    // Show/hide nav based on gallery being in view
    const galleryObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setActiveSection(null)
      },
      { threshold: 0 }
    )
    galleryObserver.observe(galleryEl)

    sectionMap.forEach(s => {
      const el = document.querySelector(s.selector)
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
      galleryObserver.disconnect()
    }
  }, [])

  return (
    <section className="gallery-page" id="gallery">
      <GalleryHero />
      <MasonryGrid />
      <BannerShowcase />
      <PhotoParallax />
      <ScrollRevealShowcase />
      <GalleryCTA />
      <GlossyNav activeSection={activeSection} totalImages={totalImages} />
    </section>
  )
}

export default Gallery
