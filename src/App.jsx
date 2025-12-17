import React from 'react'
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
  return (
    <div className="app">
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


