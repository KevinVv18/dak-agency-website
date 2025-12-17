import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './Projects.css'

// Importar imágenes
import restaurante2 from '../assets/projects/restaurante2.jpeg'
import restaurant0 from '../assets/projects/restaurant0.jpg'
import restaurante3 from '../assets/projects/restaurante3.jpeg'
import portadaBM from '../assets/projects/portada-bm.png'
import pardo from '../assets/projects/pardo.png'
import pardo3 from '../assets/projects/pardo3.png'
import pardo2 from '../assets/projects/pardo2.png'

const Projects = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const projects = [
    {
      id: 1,
      title: 'Proyecto Restaurante',
      category: 'Gastronomía',
      description: 'Descripción del proyecto próximamente',
      image: restaurante2
    },
    {
      id: 2,
      title: 'Proyecto Restaurante',
      category: 'Gastronomía',
      description: 'Descripción del proyecto próximamente',
      image: restaurant0
    },
    {
      id: 3,
      title: 'Proyecto Restaurante',
      category: 'Gastronomía',
      description: 'Descripción del proyecto próximamente',
      image: restaurante3
    },
    {
      id: 4,
      title: 'Berse Line',
      category: 'Bienestar & Estética',
      description: 'Descripción del proyecto próximamente',
      image: portadaBM
    },
    {
      id: 5,
      title: 'Colegio Manuel Pardo',
      category: 'Educación',
      description: 'Descripción del proyecto próximamente',
      image: pardo
    },
    {
      id: 6,
      title: 'Colegio Manuel Pardo',
      category: 'Educación',
      description: 'Descripción del proyecto próximamente',
      image: pardo3
    },
    {
      id: 7,
      title: 'Colegio Manuel Pardo',
      category: 'Educación',
      description: 'Descripción del proyecto próximamente',
      image: pardo2
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <section className="projects" id="projects" ref={ref}>
      <div className="container">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Últimos Proyectos</h2>
          <p className="section-subtitle">
            Trabajos recientes que demuestran nuestra experiencia y creatividad
          </p>
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`project-card project-${index + 1}`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, zIndex: 20 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="project-image-wrapper">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="project-image"
                  loading="lazy"
                />
                <motion.div
                  className="project-overlay"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overlay-content">
                    <span className="view-project">Ver Proyecto</span>
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </motion.div>
              </div>
              <div className="project-info">
                <span className="project-category">{project.category}</span>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects


