import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Carousel from './Carousel'
import { portfolioData } from '../data/portfolioData'
import './Projects.css'

const Projects = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { clients, banners } = portfolioData

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
      <div className="projects-content">
        <motion.div
          className="projects-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Nuestros Proyectos</h2>
          <p className="section-subtitle">
            Explora nuestro portafolio de trabajos con clientes de diferentes industrias
          </p>
        </motion.div>

        <motion.div
          className="portfolio-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Primera fila: 3 clientes */}
          {clients.slice(0, 3).map((client) => (
            <motion.div
              key={client.id}
              className="client-card"
              variants={itemVariants}
            >
              <div className="client-header">
                <div className="client-logo-container">
                  <img 
                    src={client.logo} 
                    alt={`Logo ${client.nombre}`}
                    className="client-logo"
                  />
                </div>
                <div className="client-info">
                  <h3 className="client-name">{client.nombre}</h3>
                  <span 
                    className="client-tag"
                    style={{ 
                      backgroundColor: `${client.color}20`,
                      color: client.color,
                      borderColor: client.color
                    }}
                  >
                    {client.categoria}
                  </span>
                </div>
              </div>
              
              <div className="client-carousel">
                <Carousel 
                  images={client.imagenes}
                  color={client.color}
                  autoPlay={true}
                  interval={5000}
                />
              </div>

              <div className="client-services">
                {client.servicios.map((servicio, idx) => (
                  <span 
                    key={idx} 
                    className="service-badge"
                    style={{ borderColor: client.color }}
                  >
                    {servicio}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Fila completa: Banners */}
          <motion.div
            className="banners-section"
            variants={itemVariants}
          >
            <div className="banners-header">
              <h3 className="banners-title">Banners & Portadas</h3>
              <span 
                className="banners-tag"
                style={{
                  backgroundColor: `${banners.color}20`,
                  color: banners.color,
                  borderColor: banners.color
                }}
              >
                {banners.categoria}
              </span>
            </div>
            
            <div className="banners-carousel">
              <Carousel 
                images={banners.imagenes}
                color={banners.color}
                autoPlay={true}
                interval={6000}
              />
            </div>
          </motion.div>

          {/* Segunda fila: 3 clientes restantes */}
          {clients.slice(3, 6).map((client) => (
            <motion.div
              key={client.id}
              className="client-card"
              variants={itemVariants}
            >
              <div className="client-header">
                <div className="client-logo-container">
                  <img 
                    src={client.logo} 
                    alt={`Logo ${client.nombre}`}
                    className="client-logo"
                  />
                </div>
                <div className="client-info">
                  <h3 className="client-name">{client.nombre}</h3>
                  <span 
                    className="client-tag"
                    style={{ 
                      backgroundColor: `${client.color}20`,
                      color: client.color,
                      borderColor: client.color
                    }}
                  >
                    {client.categoria}
                  </span>
                </div>
              </div>
              
              <div className="client-carousel">
                <Carousel 
                  images={client.imagenes}
                  color={client.color}
                  autoPlay={true}
                  interval={5000}
                />
              </div>

              <div className="client-services">
                {client.servicios.map((servicio, idx) => (
                  <span 
                    key={idx} 
                    className="service-badge"
                    style={{ borderColor: client.color }}
                  >
                    {servicio}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects


