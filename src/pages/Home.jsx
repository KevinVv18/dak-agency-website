import React, { lazy, Suspense } from 'react'
import Hero from '../components/Hero'
import CTASection from '../components/CTASection'

// Code-splitting: las secciones below-the-fold se descargan en paralelo
// sin bloquear el primer render del Hero. Los anchors (#services, #contact...)
// siguen funcionando gracias al retry de scrollToSection.
const Services = lazy(() => import('../components/Services'))
const Projects = lazy(() => import('../components/Projects'))
const PhotoGallery = lazy(() => import('../components/PhotoGallery'))
const Blog = lazy(() => import('../components/Blog'))
const ContactForm = lazy(() => import('../components/ContactForm'))

const Home = () => {
  return (
    <>
      <Hero />
      <CTASection />
      <Suspense fallback={null}>
        <Services />
        <Projects />
        <PhotoGallery />
        <Blog />
        <ContactForm />
      </Suspense>
    </>
  )
}

export default Home
