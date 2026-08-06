import React, { useEffect } from 'react'
import Gallery from '../components/Gallery'

const GalleryPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    // Mismo patron que LegalPage. Sin esto la galeria heredaba el title de la
    // home, y desde que el prerender genera un HTML por ruta eso significaba
    // dos paginas indexadas con el mismo titulo.
    document.title = 'Nuestro Trabajo · DAK Agency'
  }, [])

  return <Gallery />
}

export default GalleryPage
