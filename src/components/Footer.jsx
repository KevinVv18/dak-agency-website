import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'
/* La marca, en crudo. FORMAS son los cinco polígonos que el campo de flujo del
   hero usa como OBSTÁCULO; aquí se pintan como trazo. No es una copia del
   logo: es literalmente la misma geometría con la que abre la página. */
import { CAJA, FORMAS } from '../data/marca'
import { scrollToSection } from '../utils/scrollToSection'

/* ═══════════════════════════════════════════════════════════════
   EL PIE — la placa del instrumento

   La página abre con un túnel de viento que construye la marca como huecos en
   una corriente, y todo lo que viene después es instrumental: filete,
   esquineras, lecturas y una estela que se apaga sección a sección.

   AQUÍ SE DETIENE. Por eso el pie no lleva textura de fondo —es la única
   sección sin ella— y por eso no es un cajón de enlaces sino la placa de
   características que va atornillada al fondo de una máquina: qué es esto,
   dónde está, cuándo funciona, por dónde se le habla y la letra pequeña.

   Lo que había: un filete superior con un arcoíris de cuatro colores y un
   resplandor de 40px, dos animaciones en bucle infinito (una rejilla que
   pulsaba cada 8s y un marquee de 30s), cuatro iconos sociales que al pasar el
   ratón se pintaban con el azul de Facebook, el degradado de Instagram, el
   cian de TikTok y el verde de WhatsApp, y un iframe de Google Maps que costaba
   31 peticiones y medio mega.
   ═══════════════════════════════════════════════════════════════ */

/* Los siete servicios, quietos y pulsables. Antes desfilaban en bucle dentro
   de un marquee con aria-hidden: siete palabras que nadie podía pulsar ni leer
   con lector de pantalla. */
const SERVICIOS = [
  'Branding', 'Fotografía', 'Video', 'Social Media',
  'Diseño Web', 'SEO & Ads', 'Automatización',
]

/* La posición, como lectura. Estas coordenadas están verificadas contra
   OpenStreetMap para «Condominio Los Parques de San Gabriel, Chiclayo» y DEBEN
   coincidir con el geo del JSON-LD de index.html. Cuatro decimales (~11 m):
   más sería precisión fingida para el centroide de un condominio.

   La dirección es la vigente desde el 07-ago-2026. Si cambia, cambia TAMBIÉN
   en src/pages/LegalPage.jsx y en el JSON-LD de index.html. */
const SEDE = {
  lat: -6.7744,
  lon: -79.8747,
  calle: 'Av. Víctor Andrés Belaunde 101',
  zona: 'Los Parques de San Gabriel, Chiclayo',
}

const grados = ({ lat, lon }) =>
  `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'} · ${Math.abs(lon).toFixed(4)}° ${lon < 0 ? 'O' : 'E'}`

/* La marca en trazo, construida con los mismos polígonos del túnel. */
const MarcaEnReposo = () => (
  <svg
    className="pie-marca"
    viewBox={`0 0 ${CAJA.ancho} ${CAJA.alto}`}
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    {FORMAS.map((puntos, i) => (
      <polygon
        key={i}
        points={puntos.join(',')}
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    ))}

    {/* La misma geometría con el trazo engordado, en transparente y sin pintar:
        es contra ESTA con la que se comprueba si el ratón cruza la marca. El
        trazo visible mide 2px y acertarle sería puntería, no un roce. */}
    <g className="pie-marca-tacto" stroke="transparent" strokeWidth="26">
      {FORMAS.map((puntos, i) => (
        <polygon key={i} points={puntos.join(',')} />
      ))}
    </g>
  </svg>
)

const Footer = () => {
  const currentYear = new Date().getFullYear()

  /* ── El grabado del pie se enciende ──

     Dos disparadores, tal como los pidió Kevin:

     - AUTOMÁTICO, en móvil y en escritorio: cada tanto la marca prende TRABADA,
       como un fluorescente que no arranca a la primera, aguanta constante unos
       segundos y se apaga sola.
     - AL ROCE, solo con ratón: cuando el puntero cruza uno de los trazos, se
       enciende los mismos segundos pero SIN el trabado, que es un gesto del
       evento automático y no de la respuesta al gesto.

     Lo del roce no se puede resolver con :hover: la marca vive detrás de la
     placa del pie y con `pointer-events: none`, así que nunca recibe el
     puntero. Se comprueba por GEOMETRÍA, con isPointInStroke contra una copia
     de trazo grueso — eso responde de verdad a «cruzar un trazo», y no a
     «entrar en el rectángulo del logo».

     Coste: el escuchador vive en el pie, no en la ventana; se estrangula a un
     fotograma; y el reloj automático solo corre mientras el pie está a la
     vista. Con el visitante pidiendo no ver movimiento no se monta nada. */
  const fondoRef = useRef(null)

  useEffect(() => {
    const fondo = fondoRef.current
    if (!fondo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const svg = fondo.querySelector('svg')
    const pie = fondo.closest('.pie')
    let aLaVista = false

    const apagar = () => fondo.classList.remove('pie-fondo--tubo', 'pie-fondo--roce')
    const encender = (clase) => {
      // Si ya está encendida, no se reinicia: dos disparos seguidos harían un
      // tartamudeo que no es el trabado que buscamos.
      if (!aLaVista) return
      if (fondo.classList.contains('pie-fondo--tubo') ||
          fondo.classList.contains('pie-fondo--roce')) return
      fondo.classList.add(clase)
    }
    fondo.addEventListener('animationend', apagar)

    /* El reloj solo corre mientras el pie está a la vista, y arranca AL
       LLEGAR: con un intervalo pelado, quien baja hasta aquí podía quedarse
       hasta 17s mirando una placa muerta antes del primer encendido. */
    let reloj = null
    let primera = null
    const parar = () => { clearInterval(reloj); clearTimeout(primera); reloj = null; primera = null }

    const observador = new IntersectionObserver(([e]) => {
      aLaVista = e.isIntersecting
      if (!aLaVista) { apagar(); parar(); return }
      if (reloj) return
      primera = setTimeout(() => encender('pie-fondo--tubo'), 1200)
      reloj = setInterval(() => encender('pie-fondo--tubo'), 17000)
    }, { threshold: 0 })
    observador.observe(fondo)

    // ── El roce, solo con ratón ──
    let pendiente = false
    let ultimo = null
    const comprobar = () => {
      pendiente = false
      const m = svg.getScreenCTM()
      if (!m || !ultimo) return
      const p = new DOMPoint(ultimo.clientX, ultimo.clientY).matrixTransform(m.inverse())
      for (const trazo of svg.querySelectorAll('.pie-marca-tacto polygon')) {
        if (trazo.isPointInStroke(p)) { encender('pie-fondo--roce'); return }
      }
    }
    const alMover = (e) => {
      if (e.pointerType !== 'mouse') return
      ultimo = e
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(comprobar)
    }
    const conRaton = window.matchMedia('(pointer: fine)').matches
    if (conRaton && pie) pie.addEventListener('pointermove', alMover)

    return () => {
      parar()
      observador.disconnect()
      fondo.removeEventListener('animationend', apagar)
      if (conRaton && pie) pie.removeEventListener('pointermove', alMover)
    }
  }, [])


  const footerLinks = [
    { name: 'Servicios', href: '#services' },
    { name: 'Demos', href: '#demos' },
    { name: 'Blog', href: '#blog' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Contacto', href: '#contact' },
    { name: 'Agendar Reunión', href: 'https://plan.dakagency.net/agendar.html', external: true }
  ]

  // Los perfiles reales son estos. Hasta el 06-ago-2026 convivian dos juegos de
  // URLs distintos en la misma pagina (Hero y el JSON-LD apuntaban aqui; Footer
  // y Navigation a /dakagency), asi que uno de los dos daba 404 y Google no
  // podia consolidar la entidad. Si cambian, cambian TAMBIEN en Hero.jsx,
  // Navigation.jsx y en el sameAs del JSON-LD de index.html.
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61577374078273',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/agency_dak/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@dakagency',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/51906765040',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    }
  ]

  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      scrollToSection(href)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="pie">
      {/* ── La cinta de servicios ──
          Vuelve a desfilar, que es como funcionaba y como debe verse, pero
          construida de otra manera: el marquee original era un <span> con
          aria-hidden y el texto pegado con «✦», o sea siete palabras que nadie
          podía pulsar ni oír con lector de pantalla.

          Aquí la PRIMERA copia es una lista de enlaces de verdad —van a
          #services— y solo la segunda, la que existe para que la vuelta sea
          continua, lleva aria-hidden. Se detiene al pasar el ratón o al entrar
          con el tabulador, y no arranca si el visitante pidió no ver
          movimiento. */}
      <div className="pie-cinta">
        <div className="pie-cinta-riel">
          {/* CUATRO copias, no dos. Con dos, el grupo de siete servicios mide
              menos de mil pixeles y no llegaba a llenar ni una pantalla ancha:
              se veia una sola hilera cruzando y detras un riel vacio la mayor
              parte del tiempo. Con cuatro, lo que queda a la vista tras el
              desplazamiento son tres grupos seguidos, que cubren cualquier
              ancho razonable, y la cinta no se vacia nunca.

              Solo la primera copia son enlaces de verdad; las otras tres estan
              fuera del arbol de accesibilidad y fuera del tabulador. */}
          {[0, 1, 2, 3].map((copia) => (
            <nav
              key={copia}
              className="pie-cinta-grupo"
              aria-label={copia === 0 ? 'Servicios' : undefined}
              aria-hidden={copia > 0 ? 'true' : undefined}
            >
              {SERVICIOS.map((nombre, i) => (
                <a
                  key={nombre}
                  href="#services"
                  className="pie-cinta-item"
                  tabIndex={copia > 0 ? -1 : undefined}
                  onClick={(e) => handleLinkClick(e, '#services')}
                >
                  <span className="pie-cinta-n">{String(i + 1).padStart(2, '0')}</span>
                  {nombre}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </div>

      {/* La marca, de fondo. Ya no es un bloque propio al final: vive detrás de
          toda la placa, muy tenue, como el grabado de una chapa. */}
      <div className="pie-fondo" aria-hidden="true" ref={fondoRef}>
        <MarcaEnReposo />
      </div>

      <div className="pie-placa">
        {/* ── Fila 1: qué es y por dónde se le habla ── */}
        <div className="pie-col pie-col--marca">
          <p className="pie-rotulo">Equipo</p>
          <p className="pie-nombre">DAK Agency</p>
          <p className="pie-dato">Digital Acceleration Key</p>
          <p className="pie-dato">Chiclayo · Lambayeque · Perú</p>

          <div className="pie-canales">
            {socialLinks.map((red) => (
              <a
                key={red.name}
                href={red.href}
                className="pie-canal"
                aria-label={red.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {red.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Fila 2: la navegación ── */}
        <div className="pie-col">
          <p className="pie-rotulo">Índice</p>
          <ul className="pie-nav">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => !link.external && handleLinkClick(e, link.href)}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.name}
                  {link.external && (
                    <svg className="pie-fuera" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Fila 3: dónde está y cuándo funciona ──
            Aquí iba un iframe de Google Maps: 31 peticiones y ~520 KB, con la
            interfaz de Google dentro de la página de DAK —su logo, «Datos del
            mapa ©2026», los negocios vecinos—. Un instrumento no incrusta la
            pantalla de otro: REPORTA SU POSICIÓN. Y el enlace, en un móvil,
            abre la app de Maps de verdad con indicaciones, que es lo que quiere
            quien busca una dirección. */}
        <div className="pie-col">
          <p className="pie-rotulo">Posición</p>
          <p className="pie-coords">{grados(SEDE)}</p>
          <p className="pie-dato">{SEDE.calle}</p>
          <p className="pie-dato">{SEDE.zona}</p>
          <a
            className="pie-enlace"
            href={`https://www.google.com/maps/search/?api=1&query=${SEDE.lat},${SEDE.lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir en Maps
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>

          <p className="pie-rotulo pie-rotulo--seg">Horario</p>
          <p className="pie-dato">Lun a Vie · 9:00 – 18:00</p>
        </div>
      </div>

      <div className="pie-legal">
        <p className="pie-copy">© {currentYear} DAK Agency</p>

        {/* El volver-arriba vivía en la marca gigante. Al pasar la marca al
            fondo hacía falta un control de verdad, y este es el sitio donde se
            busca al llegar al final. */}
        <button className="pie-arriba" onClick={scrollToTop}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Volver arriba
        </button>
        <p className="pie-terminos">
          <Link to="/privacidad">Privacidad</Link>
          <span aria-hidden="true">·</span>
          <Link to="/eliminacion-de-datos">Eliminación de datos</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terminos">Términos</Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
