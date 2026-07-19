import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './About.css'
import logoBerseLine from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.webp'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.webp'

/* Cómo trabajamos: 4 pasos. */
const STEPS = [
  {
    n: '01',
    title: 'Descubrimos',
    desc: 'Escuchamos tu negocio, tu cliente y tus números. Sin plantillas: cada marca arranca con un diagnóstico real.',
    color: '#B024FF',
  },
  {
    n: '02',
    title: 'Diseñamos',
    desc: 'Identidad, contenido y experiencia digital que se sienten tuyos. Todo se presenta, se discute y se afina contigo.',
    color: '#00C8C8',
  },
  {
    n: '03',
    title: 'Lanzamos',
    desc: 'Web, campañas y automatizaciones salen a producción con métricas conectadas desde el día uno.',
    color: '#FF6B35',
  },
  {
    n: '04',
    title: 'Escalamos',
    desc: 'Medimos, aprendemos y duplicamos lo que funciona. El objetivo no es publicar: es crecer.',
    color: '#2ECC71',
  },
]

/* Testimonios de clientes (citas redactadas por DAK, pendientes de
   confirmación literal con cada cliente — editar aquí para ajustar). */
const TESTIMONIALS = [
  {
    quote:
      'DAK nos ordenó la marca de pies a cabeza: identidad, catálogo y campañas. Ahora los clientes nos escriben diciendo que la tienda "se ve de otro nivel".',
    logo: logoBerseLine,
    name: 'Berse Line',
    role: 'Moda · Chiclayo',
    color: '#B024FF',
  },
  {
    quote:
      'Necesitábamos vender online sin complicarnos. Nos lanzaron la web con catálogo y las campañas de Meta; las consultas por WhatsApp se multiplicaron.',
    logo: logoGO,
    name: 'Gran Oportunidad GO!',
    role: 'Retail · Lambayeque',
    color: '#00C8C8',
  },
  {
    quote:
      'La cobertura fotográfica y el manejo de redes en admisión nos dieron una imagen a la altura del colegio. Puntuales, creativos y muy fáciles de trabajar.',
    logo: logoPardo,
    name: 'Colegio Manuel Pardo',
    role: 'Educación · Chiclayo',
    color: '#FF6B35',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
}

const About = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' })
  const testRef = useRef(null)
  const testInView = useInView(testRef, { once: true, margin: '-80px' })

  return (
    <section className="about" id="about" ref={ref}>
      <div className="about-grid-bg" />

      <motion.div
        className="about-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">[ 05 ]</span>
        <h2 className="section-title">
          <span className="title-bold">Nosotros</span>
        </h2>
        <div className="title-line" />
      </motion.div>

      {/* Manifiesto */}
      <motion.div
        className="about-manifesto"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <h3 className="about-statement">
          Somos la <span className="about-hl" style={{ '--hl': '#B024FF' }}>llave</span> que
          acelera negocios: <span className="about-hl" style={{ '--hl': '#00C8C8' }}>estrategia</span>,
          diseño y <span className="about-hl" style={{ '--hl': '#FF6B35' }}>tecnología</span> desde
          Chiclayo para el mundo.
        </h3>
        <p className="about-sub">
          DAK significa <b>Digital Acceleration Key</b>. Nacimos en La Victoria, Chiclayo,
          con una idea simple: menos ruido, más impacto. No vendemos humo — por eso
          publicamos demos que puedes probar y resultados que puedes medir.
        </p>
      </motion.div>

      {/* Cómo trabajamos */}
      <div className="about-steps-wrap" ref={stepsRef}>
        <motion.p
          className="about-kicker"
          initial={{ opacity: 0 }}
          animate={stepsInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Cómo trabajamos
        </motion.p>
        <motion.div
          className="about-steps"
          variants={containerVariants}
          initial="hidden"
          animate={stepsInView ? 'visible' : 'hidden'}
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              className={`about-step ${stepsInView ? 'lit' : ''}`}
              style={{ '--sc': s.color }}
              variants={itemVariants}
            >
              <span className="about-step-n">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Testimonios */}
      <div className="about-testimonials" ref={testRef}>
        <motion.p
          className="about-kicker"
          initial={{ opacity: 0 }}
          animate={testInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Lo que dicen nuestros clientes
        </motion.p>
        <motion.div
          className="about-t-grid"
          variants={containerVariants}
          initial="hidden"
          animate={testInView ? 'visible' : 'hidden'}
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              className="about-t-card"
              style={{ '--tc': t.color }}
              variants={itemVariants}
              whileHover={{ y: -6 }}
            >
              <div className="about-t-stars" aria-hidden="true">★★★★★</div>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="about-t-logo">
                  <img src={t.logo} alt={t.name} loading="lazy" />
                </span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default About
