import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'

// Code-splitting: la galería completa solo se descarga al visitar /gallery
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))

/*
 * La rejilla que seguía al cursor se retiró.
 *
 * Era un elemento fijo a pantalla completa, a z-index 9999, con una rejilla
 * morada de 60×60 px revelada en un círculo de 180 px alrededor del ratón. Dos
 * motivos para quitarla, y ninguno es de gusto:
 *
 * 1. Se veía como un fallo. Sobre el túnel, donde todo son trazos orgánicos,
 *    una línea recta de rejilla no se lee como decoración: se lee como una
 *    grieta. Kevin la señaló como tal en una captura.
 *
 * 2. Competía con el campo. El campo de flujo YA responde al puntero, y esa es
 *    la interacción que demuestra que está vivo. Dos sistemas moviéndose con el
 *    mismo gesto es ruido — el mismo motivo por el que se retiró el paralaje de
 *    los orbes del CTA.
 *
 * Y de paso: escribía dos variables CSS y forzaba el repintado de una capa
 * enmascarada del tamaño de la ventana en CADA movimiento del ratón.
 */
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app">
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
