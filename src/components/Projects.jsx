import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { portfolioData } from '../data/portfolioData'
import './Projects.css'

const Projects = () => {
  const [isMobile, setIsMobile] = useState(false)
  const { clients } = portfolioData

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) return <MobileProjects clients={clients} />

  // Each client gets a different layout style
  const layouts = ['hero', 'mosaic', 'minimal', 'filmstrip', 'split', 'scattered']

  return (
    <section className="projects-section" id="projects">
      <ProjectsHeader count={clients.length} />
      <div className="projects-flow">
        {clients.map((client, i) => (
          <ProjectBlock
            key={client.id}
            client={client}
            index={i}
            total={clients.length}
            layout={layouts[i % layouts.length]}
          />
        ))}
      </div>
    </section>
  )
}

/* ── Section Header ── */
const ProjectsHeader = ({ count }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="proj-header" ref={ref}>
      <motion.div
        className="proj-header-inner"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <span className="section-tag">[ 02 ]</span>
        <h2 className="proj-title">Proyectos</h2>
        <div className="title-line" />
        <p className="proj-subtitle">{count} clientes que confían en nosotros</p>
      </motion.div>
    </div>
  )
}

/* ── Router: picks the right layout for each block ── */
const ProjectBlock = ({ client, index, total, layout }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const props = { client, index, total, inView }

  return (
    <div ref={ref} className={`proj-block proj-block--${layout}`}>
      {layout === 'hero' && <HeroLayout {...props} />}
      {layout === 'mosaic' && <MosaicLayout {...props} />}
      {layout === 'minimal' && <MinimalLayout {...props} />}
      {layout === 'filmstrip' && <FilmstripLayout {...props} />}
      {layout === 'split' && <SplitLayout {...props} />}
      {layout === 'scattered' && <ScatteredLayout {...props} />}
    </div>
  )
}

/* ── Client Info Badge (shared) ── */
const ClientBadge = ({ client, variant = 'default' }) => (
  <div className={`client-badge client-badge--${variant}`}>
    <div className="client-badge-logo">
      <img src={client.logo} alt={client.nombre} />
    </div>
    <div className="client-badge-text">
      <h3 className="client-badge-name">{client.nombre}</h3>
      <span className="client-badge-cat" style={{ color: client.color }}>{client.categoria}</span>
    </div>
  </div>
)

const ServiceTags = ({ client }) => (
  <div className="proj-services">
    {client.servicios.map((s, i) => (
      <span key={i} className="proj-service-tag" style={{ borderColor: `${client.color}30` }}>{s}</span>
    ))}
  </div>
)

/* ═══════════════════════════════════════
   LAYOUT 1: HERO — full-width cinematic
   ═══════════════════════════════════════ */
const HeroLayout = ({ client, index, inView }) => {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (client.imagenes.length <= 1) return
    const t = setInterval(() => setImgIdx(p => (p + 1) % client.imagenes.length), 4000)
    return () => clearInterval(t)
  }, [client.imagenes.length])

  return (
    <motion.div
      className="hero-layout"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
    >
      <div className="hero-layout-img">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={client.imagenes[imgIdx].src}
            alt={client.imagenes[imgIdx].alt}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="hero-layout-overlay" />
        <span className="hero-number" style={{ color: `${client.color}20` }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="hero-layout-info">
        <ClientBadge client={client} variant="light" />
        <ServiceTags client={client} />
        {client.imagenes.length > 1 && (
          <div className="hero-dots">
            {client.imagenes.map((_, i) => (
              <button key={i} className={`hdot ${i === imgIdx ? 'active' : ''}`}
                onClick={() => setImgIdx(i)}
                style={{ backgroundColor: i === imgIdx ? client.color : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   LAYOUT 2: MOSAIC — multi-image grid
   ═══════════════════════════════════════ */
const MosaicLayout = ({ client, index, inView }) => {
  const imgs = client.imagenes

  return (
    <motion.div
      className="mosaic-layout"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="mosaic-info">
        <span className="mosaic-number" style={{ color: `${client.color}18` }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <ClientBadge client={client} />
        <ServiceTags client={client} />
        <span className="mosaic-count">{imgs.length} diseños</span>
      </div>
      <div className={`mosaic-grid mosaic-grid--${Math.min(imgs.length, 4)}`}>
        {imgs.slice(0, 4).map((img, i) => (
          <motion.div
            key={i}
            className="mosaic-cell"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * i }}
          >
            <img src={img.src} alt={img.alt} />
            <span className="mosaic-tipo" style={{ backgroundColor: client.color }}>{img.tipo}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   LAYOUT 3: MINIMAL — centered showcase
   ═══════════════════════════════════════ */
const MinimalLayout = ({ client, index, inView }) => {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (client.imagenes.length <= 1) return
    const t = setInterval(() => setImgIdx(p => (p + 1) % client.imagenes.length), 3500)
    return () => clearInterval(t)
  }, [client.imagenes.length])

  return (
    <motion.div
      className="minimal-layout"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="minimal-top">
        <span className="minimal-idx" style={{ color: client.color }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="minimal-name">{client.nombre}</h3>
        <span className="minimal-cat" style={{ color: `${client.color}90` }}>{client.categoria}</span>
      </div>
      <div className="minimal-img-wrap">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={client.imagenes[imgIdx].src}
            alt={client.imagenes[imgIdx].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>
      <div className="minimal-bottom">
        <ServiceTags client={client} />
        {client.imagenes.length > 1 && (
          <div className="minimal-dots">
            {client.imagenes.map((_, i) => (
              <div key={i} className={`mdot ${i === imgIdx ? 'active' : ''}`}
                style={{ backgroundColor: i === imgIdx ? client.color : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   LAYOUT 4: FILMSTRIP — horizontal images
   ═══════════════════════════════════════ */
const FilmstripLayout = ({ client, index, inView }) => (
  <motion.div
    className="film-layout"
    initial={{ opacity: 0, y: 50 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6 }}
  >
    <div className="film-header">
      <ClientBadge client={client} />
      <span className="film-number" style={{ color: `${client.color}30` }}>
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
    <div className="film-strip">
      {client.imagenes.map((img, i) => (
        <motion.div
          key={i}
          className="film-frame"
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.12 * i }}
        >
          <img src={img.src} alt={img.alt} />
          <span className="film-tipo">{img.tipo}</span>
        </motion.div>
      ))}
    </div>
    <ServiceTags client={client} />
  </motion.div>
)

/* ═══════════════════════════════════════
   LAYOUT 5: SPLIT — side-by-side asymmetric
   ═══════════════════════════════════════ */
const SplitLayout = ({ client, index, inView }) => {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = client.imagenes

  useEffect(() => {
    if (imgs.length <= 1) return
    const t = setInterval(() => setImgIdx(p => (p + 1) % imgs.length), 3500)
    return () => clearInterval(t)
  }, [imgs.length])

  return (
    <motion.div
      className="split-layout"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="split-left">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={imgs[imgIdx].src}
            alt={imgs[imgIdx].alt}
            className="split-main-img"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>
      <div className="split-right">
        <span className="split-number" style={{ color: `${client.color}15` }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="split-logo-wrap">
          <img src={client.logo} alt={client.nombre} />
        </div>
        <h3 className="split-name">{client.nombre}</h3>
        <span className="split-cat" style={{ color: client.color }}>{client.categoria}</span>
        <ServiceTags client={client} />
        {imgs.length > 1 && (
          <div className="split-thumbs">
            {imgs.map((img, i) => (
              <button key={i} className={`split-thumb ${i === imgIdx ? 'active' : ''}`}
                onClick={() => setImgIdx(i)}
                style={{ borderColor: i === imgIdx ? client.color : 'transparent' }}>
                <img src={img.src} alt={img.alt} />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   LAYOUT 6: SCATTERED — overlapping cards
   ═══════════════════════════════════════ */
const ScatteredLayout = ({ client, index, inView }) => {
  const offsets = [
    { top: '0%', left: '5%', rotate: -3, z: 3 },
    { top: '8%', left: '45%', rotate: 2, z: 2 },
    { top: '35%', left: '20%', rotate: -1, z: 1 },
  ]

  return (
    <motion.div
      className="scattered-layout"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="scattered-imgs">
        {client.imagenes.slice(0, 3).map((img, i) => (
          <motion.div
            key={i}
            className="scattered-card"
            style={{
              top: offsets[i].top,
              left: offsets[i].left,
              zIndex: offsets[i].z,
            }}
            initial={{ opacity: 0, rotate: offsets[i].rotate, scale: 0.8 }}
            animate={inView ? { opacity: 1, rotate: offsets[i].rotate, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
          >
            <img src={img.src} alt={img.alt} />
          </motion.div>
        ))}
      </div>
      <div className="scattered-info">
        <span className="scattered-num" style={{ color: `${client.color}25` }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <ClientBadge client={client} />
        <ServiceTags client={client} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   MOBILE
   ═══════════════════════════════════════ */
const MobileProjects = ({ clients }) => {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  const mobileLayouts = ['mHero', 'mMosaic', 'mCard', 'mMosaic', 'mCard', 'mHero']

  return (
    <section className="projects-mobile" id="projects">
      <div className="pm-header" ref={headerRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">[ 02 ]</span>
          <h2 className="proj-title">Proyectos</h2>
          <div className="title-line" />
        </motion.div>
      </div>

      <div className="pm-cards">
        {clients.map((client, i) => {
          const layout = mobileLayouts[i % mobileLayouts.length]
          if (layout === 'mHero') return <MobileHeroCard key={client.id} client={client} index={i} total={clients.length} />
          if (layout === 'mMosaic') return <MobileMosaicCard key={client.id} client={client} index={i} total={clients.length} />
          return <MobileSimpleCard key={client.id} client={client} index={i} total={clients.length} />
        })}
      </div>
    </section>
  )
}

const MobileHeroCard = ({ client, index }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (client.imagenes.length <= 1) return
    const t = setInterval(() => setImgIdx(p => (p + 1) % client.imagenes.length), 4000)
    return () => clearInterval(t)
  }, [client.imagenes.length])

  return (
    <motion.div ref={ref} className="pm-hero"
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="pm-hero-img">
        <AnimatePresence mode="wait">
          <motion.img key={imgIdx} src={client.imagenes[imgIdx].src} alt={client.imagenes[imgIdx].alt}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
        </AnimatePresence>
        <div className="pm-hero-overlay" />
        <div className="pm-hero-content">
          <div className="pm-hero-logo"><img src={client.logo} alt={client.nombre} /></div>
          <h3>{client.nombre}</h3>
          <span style={{ color: client.color }}>{client.categoria}</span>
        </div>
      </div>
    </motion.div>
  )
}

const MobileMosaicCard = ({ client, index }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref} className="pm-mosaic"
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="pm-mosaic-head">
        <div className="pm-mosaic-logo"><img src={client.logo} alt={client.nombre} /></div>
        <div>
          <h3 className="pm-mosaic-name">{client.nombre}</h3>
          <span className="pm-mosaic-cat" style={{ color: client.color }}>{client.categoria}</span>
        </div>
      </div>
      <div className={`pm-mosaic-grid pm-mosaic-grid--${Math.min(client.imagenes.length, 3)}`}>
        {client.imagenes.slice(0, 3).map((img, i) => (
          <motion.div key={i} className="pm-mosaic-cell"
            initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.08 * i }}>
            <img src={img.src} alt={img.alt} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const MobileSimpleCard = ({ client, index, total }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (client.imagenes.length <= 1) return
    const t = setInterval(() => setImgIdx(p => (p + 1) % client.imagenes.length), 3800)
    return () => clearInterval(t)
  }, [client.imagenes.length])

  return (
    <motion.div ref={ref} className="pm-simple"
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="pm-simple-img">
        <AnimatePresence mode="wait">
          <motion.img key={imgIdx} src={client.imagenes[imgIdx].src} alt={client.imagenes[imgIdx].alt}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
        </AnimatePresence>
      </div>
      <div className="pm-simple-info">
        <div className="pm-simple-logo"><img src={client.logo} alt={client.nombre} /></div>
        <div>
          <h3>{client.nombre}</h3>
          <span style={{ color: client.color }}>{client.categoria}</span>
        </div>
        <span className="pm-simple-counter" style={{ color: `${client.color}50` }}>{index + 1}/{total}</span>
      </div>
    </motion.div>
  )
}

export default Projects
