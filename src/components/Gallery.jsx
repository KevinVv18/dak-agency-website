import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { galleryItems, bannerItems, categories, heroImages } from '../data/galleryData'
import { sesionesPublicadas } from '../data/fotografia'
import EstudioRejilla from './EstudioRejilla'
import './Estudio.css'
import './Gallery.css'
import { CIFRAS_DESTACADAS } from '../data/cifras'

/* ─────────────────────────────────────────
   Section 1: Hero + Category Filter
   ───────────────────────────────────────── */
const heroClassNames = ['hero-img-1', 'hero-img-2', 'hero-img-3', 'hero-img-4', 'hero-img-5']

const GalleryHero = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div className="gallery-hero" ref={ref}>
      {/* Overlapping images — edge to edge */}
      <div className="hero-images-row">
        {heroImages.map((img, i) => (
          <motion.div
            key={i}
            className={`hero-img-card ${heroClassNames[i] || ''}`}
            initial={{ opacity: 0, y: 60, rotate: (i - 2) * 2.5 }}
            animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.19, 1, 0.22, 1] }}
          >
            <img src={img.src} alt={img.alt} />
          </motion.div>
        ))}
      </div>

      {/* Title below the images */}
      <motion.h1
        className="gallery-hero-title"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.35 }}
      >
        <span className="title-bold">Nuestro</span>{' '}
        <span className="title-accent">Trabajo</span>
      </motion.h1>
      <motion.p
        className="gallery-hero-sub"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        Explora nuestra curaduría de proyectos digitales donde la estrategia
        creativa se encuentra con la excelencia visual. Transformamos
        marcas a través del diseño.
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
      {/* Esta seccion solo tiene barra de filtros: sin encabezado, sus tarjetas
          colgaban directamente del h1 y dejaban un salto h1 -> h3. */}
      <h2 className="sr-only">Taller: piezas gráficas por categoría</h2>
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
              {/* Los archivos son de 1080px y aquí se pintan a 134px en móvil,
                  318 en tableta y 393 en escritorio. La variante de 700px que
                  genera `npm run taller:variantes` cubre el peor caso (393 en
                  una pantalla de densidad 2 pide 786, y por encima de eso el
                  navegador ya coge el original). El lightbox se queda con el
                  grande, que ahí sí se ve entero. */}
              <img
                src={item.src}
                {...(item.srcSm ? { srcSet: `${item.srcSm} 700w, ${item.src} 1080w`, sizes: '(max-width: 768px) 40vw, 32vw' } : {})}
                alt={item.alt}
                loading="lazy"
              />
              <div className="masonry-overlay">
                <span className="masonry-type" style={{ borderColor: item.color }}>{item.type}</span>
                <h3>{item.alt}</h3>
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
        <h2 className="banner-title">Portadas que <span className="title-accent">Impactan</span></h2>
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
              <h3>{b.alt}</h3>
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
/**
 * El archivo fotográfico completo.
 *
 * Antes esta sección mostraba seis fotos fijas —cinco de línea familiar— desde
 * galleryData. Eran las mismas seis que ya salían en la home, así que el
 * "archivo" no añadía nada; y desde que la portada enseña el trabajo comercial,
 * la galería se había quedado sin la mayor parte de la cartera.
 *
 * Ahora lee el mismo catálogo que la home (src/data/fotografia.js) y las
 * muestra todas, con tratamiento idéntico: mismo tramo claro y mismos rótulos
 * de cliente y rubro.
 */
const EstudioArchivo = () => {
  const todas = sesionesPublicadas()

  return (
    <div className="estudio">
      <div className="estudio-cabecera">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2 className="estudio-titulo">Estudio</h2>
          <div className="estudio-filete" />
          <p className="estudio-entrada">
            Las {todas.length} sesiones del archivo, comerciales y de familia.
          </p>
        </motion.div>
      </div>

      <EstudioRejilla sesiones={todas} />
    </div>
  )
}


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
        <h2 className="reveal-title">Lo que nos <span className="title-accent">Define</span></h2>
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
        {/* Aquí iba un "01 / 02 / 03" a 15% de opacidad. Numerar tres tarjetas
            no le dice nada a nadie, no llegaba ni a 1.1:1 de contraste y el
            lector de pantalla lo leía como si fuera contenido. */}
        <span className="reveal-type" style={{ color: item.color }}>{item.type}</span>
        <h3>{item.alt}</h3>
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
  const navigate = useNavigate()

  /* Estas cifras estaban escritas a mano aquí y decían 150+ proyectos y 30+
     clientes, mientras la portada decía 50+ y 98% satisfechos. El mismo sitio
     se contradecía según la página. Ahora salen de src/data/cifras.js. */
  const stats = CIFRAS_DESTACADAS.map((c) => ({ number: c.valor, label: c.etiqueta }))

  const handleCTA = (e) => {
    e.preventDefault()
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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
        <h2>Tu marca merece <span className="title-accent">verse así</span></h2>
        <p>Cuéntanos tu idea y la convertimos en algo que nadie pueda ignorar.</p>
        <a href="/#contact" className="gallery-cta-btn" onClick={handleCTA}>
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
  { id: 'masonry', label: 'Taller', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id: 'banners', label: 'Banners', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="18" y2="10"/></svg> },
  { id: 'photos', label: 'Estudio', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> },
  { id: 'featured', label: 'Destacados', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
]

const GlossyNav = ({ activeSection, totalImages }) => {
  const scrollTo = (sectionId) => {
    const map = { masonry: '.masonry-section', banners: '.banner-section', photos: '.estudio', featured: '.reveal-section' }
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
  const totalImages = galleryItems.length + bannerItems.length + sesionesPublicadas().length

  useEffect(() => {
    const sectionMap = [
      { id: 'masonry', selector: '.masonry-section' },
      { id: 'banners', selector: '.banner-section' },
      { id: 'photos', selector: '.estudio' },
      { id: 'featured', selector: '.reveal-section' },
    ]

    /*
     * Qué sección está activa se decide por una línea imaginaria trazada al
     * 30% de la altura del viewport: la sección que la cruza es la que se está
     * mirando. Eso es lo que hace el rootMargin, que reduce el área de
     * observación a esa franja.
     *
     * Al 30% y no a media altura porque los botones hacen scrollIntoView, que
     * deja la sección pegada al borde superior; con la línea en el centro, al
     * pulsar "Banners" se encendía "Estudio", que es lo que quedaba a media
     * pantalla.
     *
     * Antes se elegía por intersectionRatio con umbral 0.2, y eso solo funciona
     * mientras las secciones quepan en pantalla. Al pasar el Estudio de 6 fotos
     * a 26, su ratio ya no llega nunca al 20% y el observador dejaba de
     * dispararse: se podía estar en mitad del Estudio con "Destacados"
     * encendido. Medir contra una línea no depende del alto de la sección.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const cruzando = entries.find(e => e.isIntersecting)
        if (!cruzando) return
        const match = sectionMap.find(s => cruzando.target.matches(s.selector))
        if (match) setActiveSection(match.id)
      },
      { rootMargin: '-30% 0px -69% 0px', threshold: 0 }
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
      <EstudioArchivo />
      <ScrollRevealShowcase />
      <GalleryCTA />
      <GlossyNav activeSection={activeSection} totalImages={totalImages} />
    </section>
  )
}

export default Gallery
