import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './About.css'
import logoBerseLine from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.webp'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.webp'

/**
 * Cómo trabajamos: 4 pasos.
 *
 * Sin color por paso. Antes cada uno llevaba el suyo —morado, cyan, naranja,
 * verde— y no significaban nada: "Diseñamos" no es más cyan que "Lanzamos".
 * Entre estos cuatro, los tres resaltados del manifiesto y los tres bloques de
 * cliente, la sección acumulaba cuatro colores repartidos por diez sitios en
 * tres sistemas que no tienen relación entre sí.
 *
 * Los números SÍ se quedan: aquí hay una secuencia de verdad —no se puede
 * lanzar antes de diseñar— y eso es información, al revés que los números de
 * sección decorativos que se retiraron del resto del sitio.
 */
const STEPS = [
  {
    n: '01',
    title: 'Descubrimos',
    desc: 'Escuchamos tu negocio, tu cliente y tus números. Sin plantillas: cada marca arranca con un diagnóstico real.',
  },
  {
    n: '02',
    title: 'Diseñamos',
    desc: 'Identidad, contenido y experiencia digital que se sienten tuyos. Todo se presenta, se discute y se afina contigo.',
  },
  {
    n: '03',
    title: 'Lanzamos',
    desc: 'Web, campañas y automatizaciones salen a producción con métricas conectadas desde el día uno.',
  },
  {
    n: '04',
    title: 'Escalamos',
    desc: 'Medimos, aprendemos y duplicamos lo que funciona. El objetivo no es publicar: es crecer.',
  },
]

/**
 * Qué hicimos para cada cliente.
 *
 * ─── POR QUÉ YA NO SON CITAS ──────────────────────────────────────────────
 *
 * Esto era un bloque de "testimonios": tres citas entrecomilladas, con cinco
 * estrellas y el logo del cliente, como si las hubieran dicho ellos. El
 * comentario que había aquí lo admitía: «citas redactadas por DAK, pendientes
 * de confirmación literal con cada cliente».
 *
 * Poner en boca de un cliente algo que no ha dicho no es un problema de
 * diseño. Y las cinco estrellas eran directamente una nota que nadie ha
 * puesto: no hay encuesta, no hay reseña, no hay de dónde salga ese 5/5.
 *
 * El contenido es el mismo —lo que DAK dice haber hecho para cada uno— pero
 * atribuido a quien lo afirma. Y encima es comprobable sin salir de la página:
 * los tres clientes aparecen con su trabajo en el Taller y en el Estudio.
 *
 * Si algún día hay citas confirmadas por escrito con cada cliente, vuelven a
 * ser citas. Hasta entonces, esto es lo que se puede sostener.
 */
const CLIENTES = [
  {
    trabajo: 'Rehicimos la marca de arriba abajo: identidad, catálogo y campañas.',
    logo: logoBerseLine,
    name: 'Berse Line',
    role: 'Moda · Chiclayo',
  },
  {
    trabajo: 'Web con catálogo y campañas en Meta, para vender online sin complicarse.',
    logo: logoGO,
    name: 'Gran Oportunidad GO!',
    role: 'Retail · Lambayeque',
  },
  {
    trabajo: 'Cobertura fotográfica y gestión de redes durante la campaña de admisión.',
    logo: logoPardo,
    name: 'Colegio Manuel Pardo',
    role: 'Educación · Chiclayo',
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
        className="about-header section-head"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title section-title--medio">
          <span className="title-bold">Nosotros</span>
        </h2>
      </motion.div>

      {/* Manifiesto */}
      <motion.div
        className="about-manifesto"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        {/* Una palabra en color, no tres.
            Iban resaltadas «llave» en morado, «estrategia» en teal y
            «tecnología» en naranja, con el color escrito a mano en cada una. Ni
            el teal ni el naranja existen ya en ninguna otra parte de la web, y
            sobre todo: si se subrayan tres palabras de una frase de trece, no
            se está subrayando nada.

            La que se queda es LLAVE, y no por gusto — DAK es Digital
            Acceleration Key. Es la única de las tres que dice algo que el
            lector no sabía. */}
        <h3 className="about-statement">
          Somos la <span className="about-hl">llave</span> que acelera negocios:
          estrategia, diseño y tecnología desde Chiclayo para el mundo.
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
              variants={itemVariants}
            >
              <span className="about-step-n">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Qué hicimos para cada cliente — ver la nota sobre CLIENTES arriba */}
      <div className="about-testimonials" ref={testRef}>
        <motion.p
          className="about-kicker"
          initial={{ opacity: 0 }}
          animate={testInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Algunos de nuestros clientes
        </motion.p>
        <motion.ul
          className="about-t-grid"
          variants={containerVariants}
          initial="hidden"
          animate={testInView ? 'visible' : 'hidden'}
        >
          {CLIENTES.map((c) => (
            <motion.li
              key={c.name}
              className="about-t-card"
              variants={itemVariants}
              whileHover={{ y: -6 }}
            >
              <span className="about-t-logo">
                <img src={c.logo} alt="" loading="lazy" />
              </span>
              <p className="about-t-nombre">{c.name}</p>
              <p className="about-t-rubro">{c.role}</p>
              <p className="about-t-trabajo">{c.trabajo}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

export default About
