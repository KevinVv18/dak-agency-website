import React, { useEffect } from 'react'
import Galeria from '../components/Galeria'

const GalleryPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    // Mismo patron que LegalPage. Sin esto la galeria heredaba el title de la
    // home, y desde que el prerender genera un HTML por ruta eso significaba
    // dos paginas indexadas con el mismo titulo.
    document.title = 'Trabajo · el archivo de DAK Agency'
  }, [])

  return <Galeria />
}

export default GalleryPage
