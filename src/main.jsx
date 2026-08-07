import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
/* Tipografía display (sección de demos): geométrica, como el diseño de marca */
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import './index.css'

// scripts/prerender.mjs deja el HTML ya pintado dentro de #root para que los
// rastreadores que no ejecutan JavaScript vean la pagina.
//
// Aqui se usa createRoot a proposito, NO hydrateRoot, aunque el contenedor
// llegue con contenido. Se probo hidratar y esta aplicacion no puede hacerlo
// de forma limpia:
//
//   - AnnouncementTicker y Blog piden datos al REST de WordPress al montarse.
//     La instantanea lleva los posts del momento del build; el primer render
//     del cliente llega sin ellos. Eso es un desajuste de texto (error #425).
//   - framer-motion escribe estilos en linea, y el volcado los congela ya
//     animados (opacity: 1), mientras que el primer render parte de opacity: 0.
//
// El resultado medido era React abortando la hidratacion (#418 y #423) y
// re-renderizando entero de todas formas: se pagaba el intento, se re-renderizaba
// igual y encima quedaban errores en consola. createRoot hace lo mismo sin el
// intento fallido ni el ruido, y con el comportamiento identico al de hoy.
//
// Lo que se gana con el prerender (que los rastreadores vean la pagina) se
// conserva intacto. Lo que se renuncia es a la mejora de tiempo hasta
// interactivo que daria una hidratacion correcta.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


