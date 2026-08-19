import React, { useRef, useState, useEffect } from 'react'
/* `useScroll`, `useTransform` y `AnimatePresence` se han ido con las cuatro
   maquetaciones a medida: eran los carruseles automáticos que rotaban la pieza
   cada 3,5-4 segundos dentro de cada bloque de cliente. */
import { motion, useInView } from 'framer-motion'
import { portfolioData } from '../data/portfolioData'
/* Capturas de los productos EN VIVO, generadas por `npm run demos:capturas`.
   Los recortes que había antes —cartera.webp, periodico.webp, robot.webp,
   inmobiliaria.webp— siguen en el repo por si hiciera falta volver. */
import capTienda from '../assets/demos/vivo-tienda.webp'
import capTiendaSm from '../assets/demos/vivo-tienda-sm.webp'
import capBlog from '../assets/demos/vivo-blog.webp'
import capBlogSm from '../assets/demos/vivo-blog-sm.webp'
import capAsistente from '../assets/demos/vivo-asistente.webp'
import capAsistenteSm from '../assets/demos/vivo-asistente-sm.webp'
import capInmo from '../assets/demos/vivo-inmobiliaria.webp'
import capInmoSm from '../assets/demos/vivo-inmobiliaria-sm.webp'
import './Projects.css'

/* ── El reparto entre Taller y la galería ──
 *
 * Gallery filtra POR CATEGORÍA (Todo · Social Media · Branding · Campañas) y
 * enseña las veinte piezas. Taller agrupa POR CLIENTE. Ahí está el reparto
 * natural, y dice qué tiene que hacer cada una:
 *
 *   Gallery es el archivo de piezas. Taller es el padrón de marcas.
 *
 * Por eso Taller enseña hasta TRES piezas por cliente y no todas: dieciocho de
 * veinte sería la galería otra vez, en la portada y peor.
 *
 * Aquí vivía FEATURED, que asignaba a mano qué cliente llevaba cuál de las
 * cuatro maquetaciones a medida. Se va con ellas: ahora los seis clientes se
 * enseñan igual, en su propio orden. */
const POR_CLIENTE = 3

/* ── Demos en vivo ──
 *
 * Cuatro productos reales que se abren y se usan. Lo que se enseñaba de cada
 * uno era un RECORTE: un bolso, un periódico, un robot 3D y un colgador de
 * puerta, flotando sobre el fondo. Ninguno era el producto — la metáfora ocupaba
 * el sitio de la prueba, y la prueba está a un clic.
 *
 * Ahora la imagen es el producto: capturas de los cuatro sitios funcionando,
 * generadas por `npm run demos:capturas`. Se regeneran con un comando cuando
 * alguno cambie, que era la única pega real de enseñar capturas.
 *
 * Los cuatro colores por sector —naranja, verde, morado y teal— se van al
 * morado de marca, igual que los siete de Servicios. Lo que distingue un demo
 * de otro es su número y su captura, no un color inventado.
 */
const DEMOS = [
  {
    id: 'av',
    n: '01',
    label: 'Tienda',
    prueba: 'Catálogo con stock real y pedido por WhatsApp',
    dominio: 'american-vault.com',
    img: capTienda,
    imgSm: capTiendaSm,
    alt: 'Catálogo en vivo de American Vault: rejilla de carteras con marca, precio y disponibilidad',
    liveUrl: 'https://american-vault.com/',
    liveLabel: 'Abrir la tienda',
    wa: 'Hola DAK, vi el catálogo de American Vault y quiero una web así para mi negocio',
  },
  {
    id: 'seo',
    n: '02',
    label: 'Blog',
    prueba: 'Artículos propios que nos traen clientes desde Google',
    dominio: 'dakagency.net/blog',
    img: capBlog,
    imgSm: capBlogSm,
    alt: 'Portada del blog de DAK Agency con sus artículos publicados',
    liveUrl: 'https://dakagency.net/blog/',
    liveLabel: 'Abrir el blog',
    wa: 'Hola DAK, quiero posicionar mi negocio en Google como lo hacen ustedes',
  },
  {
    id: 'bot',
    n: '03',
    label: 'Asistente',
    prueba: 'Responde, entiende el negocio y guarda el contacto solo',
    dominio: 'admin.dakagency.net',
    img: capAsistente,
    imgSm: capAsistenteSm,
    alt: 'El asistente de DAK conversando y rellenando la ficha del contacto en tiempo real',
    liveUrl: 'https://admin.dakagency.net/simulator/',
    liveLabel: 'Probar el asistente',
    wa: 'Hola DAK, probé el chatbot de su web y quiero uno para mi negocio',
  },
  {
    id: 'inmo',
    n: '04',
    label: 'Inmobiliaria',
    prueba: 'Un mostrador de propiedades, en dos direcciones de diseño',
    dominio: 'inmobiliaria.dakagency.net',
    img: capInmo,
    imgSm: capInmoSm,
    alt: 'Demo inmobiliario NORVIA de DAK, con sus dos direcciones de diseño',
    liveUrl: 'https://inmobiliaria.dakagency.net/',
    liveLabel: 'Abrir el demo',
    wa: 'Hola DAK, vi su demo de web inmobiliaria y quiero una así para mi negocio',
  },
]

// Aqui vivia DemoChips: dos cuadrados redondeados de 36px al lado de cada
// demo, aria-hidden, sin significado ninguno. Uno se pintaba del color del
// demo y el otro llevaba un borde #F39C12 fijo que no correspondia a nada.
// Geometria de relleno: ocupaba sitio junto al recorte del producto —que es
// lo que de verdad hay que mirar— sin decir nada de el.

/* Una celda = una ventana con la captura + su lectura debajo.
 *
 * Antes las cuatro alternaban el orden —las de arriba con el rótulo encima y
 * las de abajo debajo— alrededor de una cruz de ejes, con 5rem de relleno
 * hacia el centro. Esa geometría hacía trabajar a la maquetación sin decir
 * nada de los demos. Ahora las cuatro son iguales, que es lo que son: cuatro
 * cosas del mismo tipo que puedes abrir.
 */
const DemoCell = ({ d, index, inView, onLive }) => (
  <motion.article
    className="demo-cell"
    initial={{ opacity: 0, y: 24 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay: index * 0.08 }}
  >
    <a
      className="demo-ventana"
      href={d.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${d.label} — ${d.liveLabel}`}
      onClick={onLive}
    >
      <img
        className="demo-img"
        src={d.img}
        srcSet={`${d.imgSm} 500w, ${d.img} 1000w`}
        sizes="(max-width: 768px) 92vw, 46vw"
        alt={d.alt}
        width="1000"
        height="625"
        loading="lazy"
        decoding="async"
        /* Medido: con `lazy` a secas Chrome se las trae igualmente en el
           primer medio segundo, con la sección a 3.300px del viewport. No es
           un fallo del atributo — el umbral de precarga de Chrome depende de
           la conexión y CRECE en las lentas, justo donde más duele. Lo que sí
           se puede hacer es que no compitan: con prioridad baja el navegador
           las pone detrás de todo lo que se ve de entrada. */
        fetchPriority="low"
      />
    </a>

    <div className="demo-lectura">
      <h3 className="demo-name">
        <span className="demo-n">{d.n}</span>
        {d.label}
      </h3>
      <p className="demo-prueba">{d.prueba}</p>
      {/* El dominio real. Es lo que convierte esto en una prueba y no en una
          maqueta: se puede escribir en la barra del navegador y comprobarlo. */}
      <span className="demo-dominio">{d.dominio}</span>

      <div className="demo-links">
        <a
          className="demo-try"
          href={d.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLive}
        >
          {d.liveLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
        <a
          className="demo-wa"
          href={`https://wa.me/51906765040?text=${encodeURIComponent(d.wa)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quiero uno así
        </a>
      </div>
    </div>
  </motion.article>
)

const LiveDemos = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [botOpen, setBotOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = botOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [botOpen])

  /* Escape cierra. Faltaba: el modal se traga el scroll de la página y su
     única salida era acertarle a la ✕ o al fondo. */
  useEffect(() => {
    if (!botOpen) return
    const alPulsar = (e) => { if (e.key === 'Escape') setBotOpen(false) }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [botOpen])

  const openBot = (e) => { e.preventDefault(); setBotOpen(true) }

  return (
    <div className="live-demos" ref={ref}>
      {/* Aqui iba "Demos en vivo — no te lo contamos, pruébalo tú mismo",
          que repetia palabra por palabra el subtitulo que esta tres lineas
          mas arriba ("No te lo contamos: pruébalo. Cuatro trabajos nuestros,
          en vivo y funcionando."). Decirlo dos veces seguidas no lo hace mas
          creible; lo hace sonar a relleno. */}
      {/* La cruz de ejes que iba aquí se retira con la maquetación que la
          necesitaba: existía para separar cuatro recortes que flotaban sobre
          el fondo. Ahora cada demo tiene su propia ventana con filete, así que
          los límites ya están dibujados por lo que hay dentro. */}
      <div className="demo-stage">
        {DEMOS.map((d, i) => (
          <DemoCell
            key={d.id}
            d={d}
            index={i}
            inView={inView}
            onLive={d.id === 'bot' ? openBot : undefined}
          />
        ))}
      </div>

      {botOpen && (
        <div className="demo-modal-overlay" onClick={() => setBotOpen(false)}>
          <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="demo-modal-head">
              <span className="demo-modal-title">
                <span className="demo-live-dot" />
                Demo en vivo — Asistente de DAK
              </span>
              <div className="demo-modal-actions">
                <a href="https://admin.dakagency.net/simulator/" target="_blank" rel="noopener noreferrer">
                  Abrir en pestaña ↗
                </a>
                <button className="demo-modal-close" onClick={() => setBotOpen(false)} aria-label="Cerrar demo">
                  ✕
                </button>
              </div>
            </div>
            <iframe
              className="demo-modal-iframe"
              src="https://admin.dakagency.net/simulator/"
              title="Demo del asistente IA de DAK"
            />
          </div>
        </div>
      )}
    </div>
  )
}

const Projects = () => {
  const { clients } = portfolioData

  /* Ya no hace falta saber si es un móvil.
     Existía porque Taller tenía SIETE maquetaciones —cuatro de escritorio y
     tres de móvil— y había que elegir árbol entero según el ancho. Con una sola
     fila, de eso se encarga el CSS, que es donde va. De paso desaparece el
     listener de `resize` y el doble render del arranque. */

  // Dos secciones, no una. Antes los 4 demos y el trabajo de clientes iban
  // seguidos bajo el mismo titulo, y el subtitulo tenia que explicar las dos
  // cosas a la vez ("pruébalo Y mira proyectos de clientes"). Son cosas
  // distintas: unos se abren y se usan, los otros se miran.
  return (
    <>
      <section className="projects-section demos-section" id="demos">
        <SectionHeader
          titulo="Demos"
          subtitulo="No te lo contamos: pruébalo. Cuatro trabajos nuestros, en vivo y funcionando."
        />
        <LiveDemos />
      </section>

      <section className="projects-section taller-section" id="taller">
        {/* El Taller va a escala grande: junto al Estudio es el trabajo, que
            es a lo que se viene. Demos, Servicios, Blog y Nosotros lo rodean
            en escalas menores. */}
        <SectionHeader
          titulo="Taller"
          subtitulo="Las marcas de Chiclayo y Lambayeque para las que producimos."
          escala="grande"
        />
        <div className="taller-padron">
          {clients.map((client, i) => (
            <FilaCliente key={client.id} client={client} index={i} />
          ))}
        </div>
        <GalleryCTA />
      </section>
    </>
  )
}

/**
 * Fuentes de una pieza del Taller.
 *
 * Los archivos son de 1080px y aquí se pintan a 240. Medido en su día en la
 * portada en vivo, hasta 4,9× más grandes de lo necesario.
 * `npm run taller:variantes` genera un gemelo de 700px y esto deja que el
 * navegador elija según el ancho real y la densidad de la pantalla.
 *
 * `medida` tiene que ser el ancho al que se pinta DE VERDAD: si mientes ahí, el
 * navegador elige mal. Ahora hay una sola maquetación para las dos pantallas,
 * así que la medida lleva su consulta de medios en vez de un píxel fijo — antes
 * podía ir fijo porque el árbol de escritorio no se renderizaba en móvil.
 *
 * Sin gemelo —Berse Line no tiene variantes generadas— no devuelve nada y la
 * etiqueta se queda con su src de siempre.
 */
const fuentes = (img, medida) =>
  img.srcSm ? { srcSet: `${img.srcSm} 700w, ${img.src} 1080w`, sizes: medida } : {}

/* ── Una fila por cliente ──
 *
 * Sustituye a las cuatro maquetaciones a medida (hero, minimal, filmstrip,
 * scattered) y a las tres de móvil. No era riqueza: era de donde salían los
 * fallos. La dispersa pintaba sus cartas 134px por debajo de su propia caja y
 * tapaba 86px del botón de la galería; la hero enterraba la pieza bajo un velo
 * casi opaco —en la sección que se llama Taller—; la minimal le daba 758px de
 * alto a una sola imagen.
 *
 * La variedad la pone el TRABAJO, que ya es distinto en cada fila. No la caja.
 */
const FilaCliente = ({ client, index }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const piezas = client.imagenes.slice(0, POR_CLIENTE)

  return (
    <motion.article
      ref={ref}
      className="tal-fila"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index, 3) * 0.07 }}
    >
      <div className="tal-lectura">
        <span className="tal-n">{String(index + 1).padStart(2, '0')}</span>
        <div className="tal-marca">
          <span className="tal-logo">
            <img src={client.logo} alt="" loading="lazy" />
          </span>
          <h3 className="tal-nombre">{client.nombre}</h3>
        </div>
        <p className="tal-sector">{client.categoria}</p>
        <p className="tal-servicios">{client.servicios.join(' · ')}</p>
        {/* El recuento es el real, no el de lo que se enseña: Manuel Pardo tiene
            cinco piezas y aquí caben tres. Decir «5 piezas» y enseñar tres es
            honesto y además explica para qué está el botón de la galería. */}
        <span className="tal-cuenta">
          {client.imagenes.length} {client.imagenes.length === 1 ? 'pieza' : 'piezas'}
        </span>
      </div>

      <div className="tal-tira">
        {piezas.map((img, i) => (
          <div className="tal-pieza" key={i}>
            <img
              src={img.src}
              {...fuentes(img, '(max-width: 768px) 42vw, 240px')}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            {img.tipo && <span className="tal-tipo">{img.tipo}</span>}
          </div>
        ))}
      </div>
    </motion.article>
  )
}

/* ── CTA → galería completa ── */
const GalleryCTA = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      className="projects-cta"
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <p className="projects-cta-text">¿Quieres ver más de nuestro trabajo?</p>
      <a href="/gallery" className="projects-cta-btn">
        <span>Ver galería completa</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </motion.div>
  )
}

/* ── Cabecera de sección ──
   Sin el `[ 0N ]` que llevaba antes: era un eyebrow sobre el encabezado, un
   número de sección que no aportaba secuencia y monoespaciada de adorno; tres
   recursos que el suelo de calidad de impeccable desaconseja, y estaban juntos.
   El título se sostiene solo. */
const SectionHeader = ({ titulo, subtitulo, escala = 'medio' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="proj-header" ref={ref}>
      <motion.div
        className="proj-header-inner section-head"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className={`section-title section-title--${escala}`}>
          <span className="title-bold">{titulo}</span>
        </h2>
        <p className="section-subtitle">{subtitulo}</p>
      </motion.div>
    </div>
  )
}


export default Projects
