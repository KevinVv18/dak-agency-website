import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useWordPressPosts from '../hooks/useWordPressPosts'
import './Blog.css'

/* A nivel de modulo y no dentro de Blog: los usan tambien Destacado y EnLista,
   que son componentes hermanos. Ademas son constantes — recrearlas en cada
   render no aportaba nada. */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1]
    }
  }
}

const Blog = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { posts, loading, error } = useWordPressPosts(4)

  return (
    <section className="blog" id="blog" ref={ref}>
      <motion.div
        className="blog-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <div className="blog-header-left section-head">
          <h2 className="section-title section-title--menor">
            <span className="title-bold">Blog</span>
          </h2>
        </div>
        <motion.a
          href="/blog/"
          className="blog-header-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Visitar Blog
        </motion.a>
      </motion.div>

      {loading && (
        <div className="blog-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="blog-card skeleton">
              <div className="blog-image-wrapper skeleton-image" />
              <div className="blog-content">
                <div className="skeleton-text skeleton-category" />
                <div className="skeleton-text skeleton-title" />
                <div className="skeleton-text skeleton-excerpt" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="blog-error">
          <p>No se pudieron cargar los artículos.</p>
          <a href="/blog/">
            Visitar Blog
          </a>
        </div>
      )}

      {!loading && !error && (
        <motion.div
          className="blog-layout"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Destacado post={posts[0]} />
          <ul className="blog-lista">
            {posts.slice(1).map((post) => (
              <EnLista key={post.id} post={post} />
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  )
}

/**
 * El post más reciente, con su titular ENTERO.
 *
 * Antes eran cuatro tarjetas iguales y los cuatro titulares se cortaban a dos
 * líneas: «Tus Clientes Ya No Buscan Solo en…», «Contenido con IA: Hasta Dónde
 * Usarla…». El titular es lo único que decide si alguien entra a leer, y
 * cortarlo a media frase es tirar justo lo que hace falta. Aquí no se recorta.
 */
const Destacado = ({ post }) => {
  if (!post) return null
  const color = getCategoryColor(post.categories[0])

  return (
    <motion.article
      className="blog-destacado"
      variants={itemVariants}
      style={{ '--cat': color }}
    >
      <a href={post.link} className="blog-destacado-enlace">
        {post.featuredImage && (
          <div className="blog-destacado-img">
            <img
              src={post.featuredImage}
              srcSet={post.featuredSrcSet}
              sizes="(max-width: 900px) 92vw, 46vw"
              alt=""
              loading="lazy"
            />
          </div>
        )}
        <div className="blog-destacado-texto">
          <p className="blog-meta">
            <span className="blog-category" style={{ backgroundColor: color }}>
              {post.categories[0]}
            </span>
            <span className="blog-date">{post.date}</span>
          </p>
          <h3 className="blog-titular blog-titular--destacado">{post.title}</h3>
          <p className="blog-excerpt">{post.excerpt}</p>
          <span className="blog-leer">
            Leer el artículo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </a>
    </motion.article>
  )
}

/**
 * Los tres restantes, en lista y sin imagen.
 *
 * Sin imagen a propósito: la mitad de las portadas que genera el pipeline son
 * el mismo flyer de plantilla —degradado morado, un icono y la palabra de la
 * categoría— y ocupaban más de un tercio de la tarjeta para repetir lo que ya
 * dice la etiqueta. Quitándolas cabe el titular completo, que sí informa.
 */
const EnLista = ({ post }) => {
  const color = getCategoryColor(post.categories[0])

  return (
    <motion.li className="blog-item" variants={itemVariants} style={{ '--cat': color }}>
      <a href={post.link} className="blog-item-enlace">
        <p className="blog-item-meta">
          <span className="blog-item-cat">{post.categories[0]}</span>
          <span className="blog-item-sep" aria-hidden="true">·</span>
          <span className="blog-date">{post.date}</span>
        </p>
        <h3 className="blog-titular">{post.title}</h3>
      </a>
    </motion.li>
  )
}

// Category colors helper
/**
 * Color de fondo de la píldora de categoría. La tinta encima es #030106.
 *
 * El morado de marca #B024FF daba 4.49:1 con esa tinta — falla AA por una
 * centésima. Se usa #B93EFF, que es el mismo morado aclarado que ya define
 * --color-accent-texto en index.css para este problema exacto, y sube a
 * 5.14:1. Comprobadas las once categorías: era la única por debajo, y encima
 * era el color por defecto, así que cualquier categoría nueva del blog nacía
 * fallando.
 */
const getCategoryColor = (category) => {
  const colors = {
    'Marketing Digital': '#B93EFF',
    'Marketing': '#B93EFF',
    'Redes Sociales': '#00C8C8',
    'SEO': '#00B478',
    'SEO & Ads': '#00A5A5',
    'Email Marketing': '#FF6B35',
    'Inversión': '#D4A574',
    'Startups': '#4A90E2',
    'Branding': '#009462',
    'Video': '#C08850',
    'Diseño Web': '#00A5A5',
    'Opinión': '#B93EFF',
    'Entrevistas': '#009462',
    'General': '#B93EFF'
  }
  return colors[category] || '#B93EFF'
}

export default Blog

