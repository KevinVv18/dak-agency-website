import React, { useEffect } from 'react'
import Gallery from '../components/Gallery'

const GalleryPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return <Gallery />
}

export default GalleryPage
