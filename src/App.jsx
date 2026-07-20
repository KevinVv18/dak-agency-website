import React, { useEffect, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'

// Code-splitting: la galería completa solo se descarga al visitar /gallery
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))

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
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app">
          {/* Cursor grid reveal */}
          <div ref={gridRef} className="cursor-grid-reveal" />
          <Navigation />
          <main>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/privacidad" element={<LegalPage doc="privacidad" />} />
                <Route path="/eliminacion-de-datos" element={<LegalPage doc="eliminacion-de-datos" />} />
                <Route path="/terminos" element={<LegalPage doc="terminos" />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ChatWidget />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
