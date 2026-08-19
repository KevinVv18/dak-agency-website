import React, { lazy, Suspense } from 'react'
import Hero from '../components/Hero'
import CTASection from '../components/CTASection'
import CampoDeFlujo from '../components/CampoDeFlujo'
import './Home.css'

// Code-splitting: las secciones below-the-fold se descargan en paralelo
// sin bloquear el primer render del Hero. Los anchors (#services, #contact...)
// siguen funcionando gracias al retry de scrollToSection.
const Services = lazy(() => import('../components/Services'))
const Projects = lazy(() => import('../components/Projects'))
const PhotoGallery = lazy(() => import('../components/PhotoGallery'))
const Blog = lazy(() => import('../components/Blog'))
const About = lazy(() => import('../components/About'))
const ContactForm = lazy(() => import('../components/ContactForm'))

const Home = () => {
  return (
    <>
      {/* ── El túnel ──
          El campo de flujo ya no pertenece al hero: es la superficie de los DOS
          primeros actos. Queda fijo mientras pasan por encima la marca —que se
          suelta— y después el titular, que llega al aire ya en calma.

          Que sea un solo plano no es un efecto: antes el hero era un
          instrumento de precisión y lo siguiente que se veía eran orbes
          flotando con paralaje. La página se partía en dos, solo que una
          sección más abajo. */}
      <div className="tunel">
        <CampoDeFlujo />
        <Hero />
        <CTASection />
      </div>

      <Suspense fallback={null}>
        <Services />
        <Projects />
        <PhotoGallery />
        <Blog />
        <About />
        <ContactForm />
      </Suspense>
    </>
  )
}

export default Home
