import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useWordPressPosts from '../hooks/useWordPressPosts'
import './Blog.css'

const Blog = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { posts, loading, error } = useWordPressPosts(4)

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
        <div className="blog-header-left">
          <span className="section-tag">[ 04 ]</span>
          <h2 className="section-title">
            <span className="title-bold">Blog</span>
          </h2>
        </div>
        <motion.a
          href="https://dakagency.net/blog/"
          target="_blank"
          rel="noopener noreferrer"
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
          <a href="https://dakagency.net/blog/" target="_blank" rel="noopener noreferrer">
            Visitar Blog
          </a>
        </div>
      )}

      {!loading && !error && (
        <motion.div
          className="blog-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              className="blog-card"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.open(post.link, '_blank')}
            >
              <div className="blog-image-wrapper">
                {post.featuredImage ? (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="blog-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="blog-image-placeholder">
                    <div className="placeholder-icon">
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <rect width="80" height="80" rx="12" fill="white" fillOpacity="0.2" />
                        <path d="M20 25H60M20 40H60M20 55H45" stroke="white" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="blog-image-overlay" />
              </div>
              
              <div className="blog-content">
                <div className="blog-meta">
                  {post.categories[0] && (
                    <span 
                      className="blog-category"
                      style={{ 
                        backgroundColor: getCategoryColor(post.categories[0]) 
                      }}
                    >
                      {post.categories[0]}
                    </span>
                  )}
                  <span className="blog-date">{post.date}</span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
              </div>

              <div className="blog-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

// Category colors helper
const getCategoryColor = (category) => {
  const colors = {
    'Marketing Digital': '#B024FF',
    'Redes Sociales': '#00C8C8',
    'SEO': '#00B478',
    'Email Marketing': '#FF6B35',
    'Inversión': '#D4A574',
    'Startups': '#4A90E2'
  }
  return colors[category] || '#B024FF'
}

export default Blog

