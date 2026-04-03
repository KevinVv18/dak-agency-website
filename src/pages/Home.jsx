import React from 'react'
import Hero from '../components/Hero'
import CTASection from '../components/CTASection'
import Services from '../components/Services'
import Projects from '../components/Projects'
import PhotoGallery from '../components/PhotoGallery'
import Blog from '../components/Blog'
import ContactForm from '../components/ContactForm'

const Home = () => {
  return (
    <>
      <Hero />
      <CTASection />
      <Services />
      <Projects />
      <PhotoGallery />
      <Blog />
      <ContactForm />
    </>
  )
}

export default Home
