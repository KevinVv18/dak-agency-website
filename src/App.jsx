import React, { useEffect, useRef } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Services from './components/Services'
import Projects from './components/Projects'
import PhotoGallery from './components/PhotoGallery'
import Blog from './components/Blog'
import CTASection from './components/CTASection'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

function App() {
  const gridRef = useRef(null)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const onMove = (e) => {
      el.style.setProperty('--mx', `${e.clientX}px`)
      el.style.setProperty('--my', `${e.clientY}px`)
      el.style.opacity = '1'
    }

    const onLeave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="app">
      {/* Cursor grid reveal */}
      <div ref={gridRef} className="cursor-grid-reveal" />
      <Navigation />
      <main>
        <Hero />
        <CTASection />
        <Services />
        <Projects />
        <PhotoGallery />
        <Blog />
        <ContactForm />
      </main>
      <Footer />
    </div>
  )
}

export default App


