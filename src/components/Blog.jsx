import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Blog.css'

const Blog = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const blogPosts = [
    {
      id: 1,
      title: 'IA Cambió el Ecosistema de Startups',
      category: 'Startups',
      date: '10 Mar, 2025'
    },
    {
      id: 2,
      title: 'De la Idea al Impacto',
      category: 'Startups',
      date: '10 Mar, 2025'
    },
    {
      id: 3,
      title: 'Comunidad de Startups',
      category: 'Inversión',
      date: '17 Abr, 2025'
    },
    {
      id: 4,
      title: 'Errores que Cometen los Fundadores',
      category: 'Inversión',
      date: '26 Feb, 2025'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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

  return (
    <section className="blog" id="blog" ref={ref}>
      <motion.div
        className="blog-header"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">BLOG</h2>
        <motion.a
          href="#"
          className="blog-header-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Todos los Artículos
        </motion.a>
      </motion.div>

      <motion.div
        className="blog-grid"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {blogPosts.map((post) => (
          <motion.article
            key={post.id}
            className="blog-card"
            variants={itemVariants}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="blog-image-wrapper">
              <div className="blog-image-placeholder">
                <div className="placeholder-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect width="80" height="80" rx="12" fill="white" fillOpacity="0.2" />
                    <path d="M20 25H60M20 40H60M20 55H45" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category">{post.category}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h3 className="blog-title">{post.title}</h3>
            </div>
            {/* Arrow circle - always visible */}
            <div className="blog-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}

export default Blog

