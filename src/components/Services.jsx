import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Services.css'
import { scrollToSection } from '../utils/scrollToSection'
import { cld, cldPoster, videoUrl } from '../utils/cloudinary'

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  // Se mide el ancho YA en el primer render, no en un efecto posterior.
  //
  // Arrancando en false, el primer render era siempre el arbol de escritorio:
  // siete miniaturas <video> y el precargador a w_1600. El navegador lanzaba
  // esas peticiones de inmediato y el efecto llegaba tarde a evitarlas — en un
  // movil se pedian diez videos para acabar mostrando uno.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768,
  )
  const [viewedServices, setViewedServices] = useState(new Set([0]))
  const [swipeHintVisible, setSwipeHintVisible] = useState(true)
  // Es estado y no ref a proposito: tres efectos distintos dependen de si la
  // seccion se ve (reproducir, rebobinar y precargar el siguiente), y con una
  // ref ninguno se volveria a ejecutar al cambiar la visibilidad.
  const [seccionVisible, setSeccionVisible] = useState(false)

  // Auto-dismiss swipe hint after 4 seconds
  useEffect(() => {
    if (!isMobile || !swipeHintVisible) return
    const timer = setTimeout(() => setSwipeHintVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [isMobile, swipeHintVisible])
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Arranca PLEGADA: el vídeo es el argumento de la sección, la ficha se pide.
  const [textVisible, setTextVisible] = useState(false)
  const thumbnailsRef = useRef(null)
  const videoRef = useRef(null)
  const preloadRef = useRef(null)
  const servicesRef = useRef(null)
  const reducedMotionRef = useRef(false)   // respeta prefers-reduced-motion
  const contentFocusedRef = useRef(false)  // no ocultar si un boton tiene foco
  const hoveringRef = useRef(false)        // no ocultar mientras el mouse esta encima
  // Espejo de seccionVisible para leerlo desde callbacks imperativos sin
  // arrastrar un valor obsoleto de un closure viejo.
  const visibleRef = useRef(false)

  // ════════════════════════════════════════════════════════════
  //  VIDEOS PERSONALIZADOS — cómo agregar los links
  //  Para cada servicio:
  //    videoDesktop → link del video HORIZONTAL (16:9) para escritorio
  //    videoMobile  → link del video VERTICAL  (9:16) para móvil
  //  Pega la URL completa de Cloudinary entre las comillas.
  //  Mientras estén vacíos ('') se usa el video stock de videoSrc.
  //  Orden de prioridad: videoMobile/videoDesktop → videoSrc → imageSrc
  // ════════════════════════════════════════════════════════════
  const services = [
    {
      id: 1,
      title: 'Branding',
      tagline: 'Logo · Paleta · Tipografía · Sistema de marca',
      description: 'Diseñamos logo, colores y un sistema de marca completo para que destaques y conectes con tu cliente desde el primer segundo.',
      category: 'IDENTIDAD',
      /* Los siete llevan EL MISMO morado. Primero fueron siete colores
         distintos —un arcoíris en una web de dos colores—, luego dos alternando
         con el teal, y ahora uno solo: el de la marca.
         (#B024FF daba 4.34:1 como texto sobre la barra inferior; este es el
         mismo tono con un 9% de blanco y llega a 4.79:1.)

         El campo se conserva por servicio aunque hoy todos valgan igual: es lo
         que alimenta --acento-servicio, y así queda un único sitio donde
         cambiarlo si algún día uno necesita separarse. Lo que distingue un
         servicio de otro es su NÚMERO, 01 a 07, no su color. */
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/5_Branding_gs86zn.mp4', // HORIZONTAL (16:9)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318150/v4_branding_z4upbs.mp4',  // VERTICAL (9:16)
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763849733/60774eb1-3b74-41e0-9238-796bc61b4c36_hd_m5uts5.mp4', // stock (fallback)
      price: 'Desde S/ 1,500',
      clients: 6,
      icon: 'M19 3H5L2 9l10 13L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.24 5h2.65l-1.5 3H4.74l1.5-3z'
    },
    {
      id: 2,
      title: 'Fotografía',
      tagline: 'Producto · Marca · Equipo',
      description: 'Fotografía profesional de producto, marca y equipo que transmite calidad y despierta las ganas de comprar.',
      category: 'VISUAL',
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/1_Fotografia_wzigdo.mp4', // HORIZONTAL (16:9)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318151/v2_fotografia_g9fidq.mp4',  // VERTICAL (9:16)
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763852525/12810774_2160_3840_30fps_srdrpp.mp4', // stock (fallback)
      price: 'Desde S/ 800',
      clients: 5,
      icon: 'M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H5v-9H3v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM5 6h3V4H5V1H3v3H0v2h3v3h2z'
    },
    {
      id: 3,
      title: 'Video',
      tagline: 'Redes · Anuncios · Marca',
      description: 'Producción audiovisual para redes, anuncios y marca que detiene el scroll y se queda en la memoria.',
      category: 'PRODUCCIÓN',
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318081/3_Audiovisual_ereexn.mp4', // HORIZONTAL (16:9)
      videoMobile: '',  // sin vertical aún → usa videoSrc (stock)
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763854544/8906351-hd_1080_1920_24fps_axwmvp.mp4', // stock (fallback)
      price: 'Desde S/ 2,000',
      clients: 4,
      icon: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z'
    },
    {
      id: 4,
      title: 'Social Media',
      tagline: 'Contenido · Gestión · Estrategia',
      description: 'Contenido y gestión con estrategia, enfocados en resultados de negocio reales.',
      category: 'REDES',
      color: '#B738FF',
      videoDesktop: '', // sin horizontal aún → usa videoSrc (stock)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318150/v7_meta_ads_anezlx.mp4',  // VERTICAL (9:16)
      videoSrc: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1763858866/6003991-uhd_2160_3840_30fps_mnavuh.mp4', // stock (fallback)
      price: 'Desde S/ 600/mes',
      clients: 6,
      icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
    },
    {
      id: 5,
      title: 'Diseño Web',
      tagline: 'Rápida · Responsive · Orientada a convertir',
      description: 'Webs rápidas y modernas, pensadas para convertir visitas en clientes y verse perfectas en cualquier pantalla.',
      category: 'DESARROLLO',
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318082/2_Web_pxlanb.mp4', // HORIZONTAL (16:9)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318150/v3_pagina_web_ashwff.mp4',  // VERTICAL (9:16)
      imageSrc: '/images/web_design.webp', // imagen actual (fallback si no hay video)
      price: 'Desde S/ 2,500',
      clients: 3,
      icon: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z'
    },
    {
      id: 6,
      title: 'SEO & Ads',
      tagline: 'Posicionamiento · Campañas · Contactos',
      description: 'Posicionamiento y campañas que aprovechan cada sol invertido y te traen contactos listos para comprar.',
      category: 'MARKETING',
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318081/8_Seo_y_Sem_syktwr.mp4', // HORIZONTAL (16:9)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318150/v6_seo_y_sem_f7zfh9.mp4',  // VERTICAL (9:16)
      imageSrc: '/images/seo_ads.webp', // imagen actual (fallback si no hay video)
      price: 'Desde S/ 800/mes',
      clients: 4,
      icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
    },
    {
      id: 7,
      title: 'Automatización',
      tagline: 'CRM · Correos · Flujos de seguimiento',
      description: 'CRM, correos y flujos que responden, hacen seguimiento y cierran ventas mientras tú te enfocas en crecer.',
      category: 'CRM',
      // #9B59B6 daba 4.29:1 como texto; +6% de blanco lo sube a 4.78:1.
      color: '#B738FF',
      videoDesktop: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318081/6_Automatizacion_vcbtoi.mp4', // HORIZONTAL (16:9)
      videoMobile: 'https://res.cloudinary.com/dm4ijuzmi/video/upload/v1782318151/v5_automatizacion_hba6se.mp4',  // VERTICAL (9:16)
      imageSrc: '/images/automation.webp', // imagen actual (fallback si no hay video)
      price: 'Desde S/ 1,200',
      clients: 2,
      demoUrl: 'https://admin.dakagency.net/simulator/',
      demoLabel: 'Probar demo en vivo',
      icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'
    }
  ]

  // Devuelve el video correcto según el dispositivo (con fallback a stock)
  const getServiceVideo = (service) =>
    (isMobile ? service.videoMobile : service.videoDesktop) || service.videoSrc || ''

  const activeService = services[activeIndex]
  const activeVideo = getServiceVideo(activeService)
  const activeVideoSrc = activeVideo
    ? videoUrl(activeVideo, isMobile ? 640 : 1600, isMobile)
    : ''

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll thumbnail activa al centro en mobile
  useEffect(() => {
    if (isMobile && thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[activeIndex]
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        })
      }
    }
  }, [activeIndex, isMobile])

  /**
   * El vídeo solo corre mientras la sección se ve.
   *
   * Antes llevaba `autoPlay`, así que empezaba a descargar en cuanto se
   * montaba —con la sección aún fuera de pantalla— y en bucle acababa
   * trayéndose el archivo entero: 1,7 MB por servicio. Ahora, con
   * `preload="none"`, no pide un byte hasta este play(), y se pausa al salir
   * de pantalla. Quien pasa de largo se lleva unos cientos de KB en vez del
   * archivo completo, y quien se queda mirando lo ve igual que antes.
   *
   * El umbral es 0.25 y no 0: con 0 se dispararía con la sección asomando un
   * píxel, que es justo lo que se quiere evitar.
   */
  useEffect(() => {
    const seccion = servicesRef.current
    if (!seccion) return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visibleRef.current = entrada.isIntersecting
        setSeccionVisible(entrada.isIntersecting)
        // Se lee el ref en cada aviso en vez de capturar el elemento al crear
        // el observador: con `key` en el <video>, el elemento cambia cada vez
        // que se cambia de servicio y el capturado quedaba obsoleto.
        const video = videoRef.current
        if (!video) return
        if (entrada.isIntersecting) video.play().catch(() => { })
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observador.observe(seccion)
    return () => observador.disconnect()
  }, [])

  /**
   * Arrancar el vídeo cuando el elemento se monta, no cuando cambia el estado.
   *
   * Aquí estaba el fallo que se veía en el móvil: solo funcionaba el primer
   * servicio. El <video> lleva `key`, así que al cambiar de servicio React
   * monta un elemento NUEVO, y va dentro de un <AnimatePresence mode="wait">,
   * que espera a que termine la animación de salida antes de montarlo. El
   * efecto que llamaba a play() se disparaba al cambiar activeIndex —cuando el
   * elemento nuevo todavía no existía— y ya no volvía a dispararse. Resultado:
   * play() no se llegaba a llamar nunca y el vídeo se quedaba en readyState 0.
   *
   * Antes no se notaba porque el elemento llevaba `autoPlay` y el navegador
   * arrancaba solo al montarlo. Al quitarlo para poder usar preload="none" se
   * perdió eso sin sustituirlo.
   *
   * Con un ref de función el navegador nos avisa en el momento exacto en que
   * el elemento entra en el DOM, que es justo cuando hay que reproducirlo.
   */
  const montarVideo = useCallback((nodo) => {
    videoRef.current = nodo
    if (nodo && visibleRef.current) nodo.play().catch(() => { })
  }, [])

  /* ── La placa: el vídeo manda, el texto se pide ──
   *
   * Antes esto era un temporizador de inactividad y el disparador de hover
   * estaba en `.featured-service`: el PANEL ENTERO, vídeo incluido. Como el
   * ratón está justo encima del panel mientras miras el vídeo, `hoveringRef`
   * se quedaba en true, el temporizador salía por la puerta de atrás sin
   * armarse y el texto NO SE CONTRAÍA NUNCA. La placa tapaba el vídeo de forma
   * permanente, que es lo contrario de lo que hace falta en una sección cuyo
   * argumento es enseñar trabajo.
   *
   * Ahora el disparador está en la placa de texto y solo en ella:
   *   - en reposo, plegada — se ve el vídeo;
   *   - el ratón sobre la placa la abre; sacarlo hacia el vídeo la cierra;
   *   - nunca se abre sola, ni al llegar ni al cambiar de servicio.
   *
   * El temporizador entero (IDLE_MS, armIdle, clearIdle) se retiró: sin nada
   * que auto-ocultar, no tenía trabajo.
   */
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    // Sin movimiento la placa se queda abierta y fija: el plegado es una
    // animación, y quien lo ha desactivado no debería tener que buscar el
    // precio pasando el ratón.
    if (reducedMotionRef.current) setTextVisible(true)
  }, [])

  const handlePanelEnter = () => { if (isMobile) return; hoveringRef.current = true; setTextVisible(true) }
  const handlePanelLeave = () => {
    if (isMobile) return
    hoveringRef.current = false
    // El foco de teclado manda sobre el ratón: si hay un botón enfocado dentro,
    // sacar el ratón no puede plegar lo que se está usando.
    if (!contentFocusedRef.current && !reducedMotionRef.current) setTextVisible(false)
  }
  /* Con teclado no hay hover, y `.featured-extra` va con pointer-events a none
     al estar plegada: tabular hasta dentro es lo que la abre. Sin esto, los
     botones quedarían fuera de alcance para quien navega sin ratón. */
  const handleContentFocus = () => { contentFocusedRef.current = true; setTextVisible(true) }
  const handleContentBlur = () => {
    contentFocusedRef.current = false
    if (!hoveringRef.current && !reducedMotionRef.current) setTextVisible(false)
  }
  /* En móvil no hay hover, así que el equivalente es el toque: sobre la placa
     la abre, sobre el vídeo la cierra. Los clics que nacen dentro de la ficha
     desplegada se dejan pasar — si no, pulsar «Cotizar paquetes» plegaría la
     placa por el camino. */
  const handleVideoTap = () => {
    if (!isMobile || reducedMotionRef.current) return
    setTextVisible((v) => !v)
  }
  const handlePlacaTap = (e) => {
    if (!isMobile || reducedMotionRef.current) return
    if (e.target.closest && e.target.closest('.featured-extra')) return
    setTextVisible((v) => !v)
  }

  // Al cambiar de servicio se vuelve a plegar: cada uno se presenta con su
  // vídeo, no con su ficha.
  useEffect(() => {
    if (!reducedMotionRef.current) setTextVisible(false)
  }, [activeIndex, isMobile])

  const handleScrollToContact = (e) => {
    e.preventDefault()
    scrollToSection('#contact')
  }

  // Handle thumbnail click (desktop)
  const handleThumbnailClick = (index) => {
    setActiveIndex(index)
    setViewedServices(prev => new Set([...prev, index]))
    setSwipeHintVisible(false)
  }

  // Handle drawer service click (mobile) - scroll to services + change video
  const handleDrawerServiceClick = (index) => {
    setActiveIndex(index)
    setViewedServices(prev => new Set([...prev, index]))
    setDrawerOpen(false)

    // Scroll to services section
    setTimeout(() => {
      if (servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 200)
  }

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev)
  }

  // Navigate services (mobile arrows)
  const goNext = () => {
    const next = (activeIndex + 1) % services.length
    setActiveIndex(next)
    setViewedServices(prev => new Set([...prev, next]))
    setSwipeHintVisible(false)
  }

  const goPrev = () => {
    const prev = (activeIndex - 1 + services.length) % services.length
    setActiveIndex(prev)
    setViewedServices(p => new Set([...p, prev]))
    setSwipeHintVisible(false)
  }

  // Preload next video/image (según orientación del dispositivo)
  //
  // En movil NO se precarga: el video siguiente pesa megas y en un 4G de
  // Chiclayo eso es la diferencia entre una demo que impresiona y una pestana
  // que se cierra. El carrusel funciona igual, solo tarda un instante mas en el
  // primer cambio.
  //
  // En escritorio se conserva, pero con preload="metadata" (ver el elemento):
  // con "auto" se traia el archivo completo del servicio siguiente.
  useEffect(() => {
    if (!preloadRef.current) return
    // Tampoco se precarga con la seccion fuera de pantalla. Medido en
    // escritorio: recorriendo la portada entera se descargaban DIEZ videos,
    // 4.259 KB, la mayoria de servicios que el visitante nunca llego a abrir.
    // Adelantar el siguiente tiene sentido mientras se esta mirando el
    // carrusel; antes de llegar a el, no.
    if (isMobile || !seccionVisible) {
      preloadRef.current.removeAttribute('src')
      return
    }
    const nextIndex = (activeIndex + 1) % services.length
    const nextVideo = services[nextIndex] && getServiceVideo(services[nextIndex])
    if (nextVideo) {
      preloadRef.current.src = cld(nextVideo, 1600)
    }
  }, [activeIndex, services, isMobile, seccionVisible])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev + 1) % services.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev - 1 + services.length) % services.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [services.length])

  return (
    <>
      <section className="services" id="services" ref={servicesRef}>
        <div className="services-container">
          {/* Header */}
          <motion.div
            className="services-header section-head"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title section-title--medio">
              <span className="title-bold">Servicios</span>
            </h2>
            {/* «Soluciones digitales que impulsan tu negocio» era una frase que
                podría estar en la web de cualquier agencia del mundo. Esta dice
                lo que hay en la pantalla y lo que hay que hacer con ello. */}
            <p className="section-subtitle">
              Siete servicios. Cada uno con su muestra de trabajo.
            </p>
          </motion.div>

          {/* Showcase Layout */}
          <div className="showcase-layout">
            {/* Panel principal - Servicio destacado */}
            {/* El acento del servicio activo baja por herencia: el CSS lo lee
                de --acento-servicio y no hace falta pintar cada hijo con un
                estilo en línea, que era como estaba y por lo que había siete
                colores repartidos por todo el árbol. */}
            {/* El hover ya no vive aquí. Estaba en el panel entero —vídeo
                incluido—, y como el ratón está encima del panel justo mientras
                miras el vídeo, la placa no se plegaba nunca. Ahora el
                disparador está en `.featured-content`, que es la zona de texto
                y solo ella. */}
            <div
              className="featured-service"
              style={{ '--acento-servicio': activeService.color }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  className="featured-video-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* El video se queda tambien en movil: es la muestra de
                      trabajo, y un audiovisual congelado vende menos de lo que
                      es. Lo que se corrige es lo que costaba de mas.

                      1. Ancho real. Se pedia w_900 para pintarse a 319px. Con
                         w_640 cubre una pantalla de densidad 2 exacta.
                      2. preload="none" y poster. El fotograma pesa ~30 KB y
                         aparece al instante; el video no pide un byte hasta que
                         empieza a reproducirse.
                      3. Solo corre mientras se ve (ver el efecto de abajo). Con
                         autoPlay a secas empezaba a bajar aunque la seccion
                         estuviera fuera de pantalla, y en bucle acababa
                         trayendose el archivo entero. Asi se paga por lo que se
                         mira: quien pasa de largo se lleva unos cientos de KB
                         en vez de 1,7 MB. */}
                  {activeVideo ? (
                    <video
                      ref={montarVideo}
                      key={activeVideoSrc}
                      src={activeVideoSrc}
                      poster={cldPoster(activeVideo, isMobile ? 640 : 1600)}
                      preload="none"
                      muted
                      loop
                      playsInline
                      className="featured-video"
                    />
                  ) : (
                    <img
                      src={activeService.imageSrc}
                      alt={activeService.title}
                      className="featured-video"
                      loading="lazy"
                      decoding="async"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  )}
                  {/* El velo ya no se pinta en línea. Iba de negro 0.85 abajo a
                      transparente al 55% de la altura, y el bloque de texto es
                      más alto que eso: con un vídeo claro —los de WhatsApp son
                      pantallas blancas— el título quedaba ILEGIBLE. Ahora el
                      velo solo suaviza el pie del vídeo y quien garantiza la
                      lectura es la placa de .featured-content, que mide
                      exactamente lo que mide el texto. */}
                  <div className="featured-overlay" onClick={handleVideoTap} />
                </motion.div>
              </AnimatePresence>

              {/* ── El mando, una flecha a cada lado ──
                  Antes eran dos pastillas redondas pegadas la una a la otra en
                  la esquina superior derecha, y solo en móvil.

                  Van dentro de una banda que es un HERMANO EN FLEX de la placa
                  de texto, no un absoluto con un porcentaje a ojo. Como la
                  placa lleva `margin-top: auto`, esta banda ocupa exactamente
                  el hueco que queda por encima: las flechas quedan centradas en
                  el vídeo que se ve, y cuando la placa se abre suben solas para
                  no meterse debajo. Sin números mágicos y sin JS.

                  La banda no intercepta el puntero —así el clic para plegar y
                  desplegar sigue llegando al vídeo—; solo lo hacen los botones. */}
              <div className="nav-banda">
                <button className="nav-arrow nav-arrow-left" onClick={goPrev} aria-label="Servicio anterior">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="nav-arrow nav-arrow-right" onClick={goNext} aria-label="Servicio siguiente">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  className={`featured-content ${textVisible ? '' : 'is-idle'}`}
                  onMouseEnter={handlePanelEnter}
                  onMouseLeave={handlePanelLeave}
                  onClick={handlePlacaTap}
                  onFocusCapture={handleContentFocus}
                  onBlurCapture={handleContentBlur}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {/* El galón: en móvil no hay hover que descubra que hay más
                      debajo, y sin esta señal el precio y los botones quedarían
                      escondidos tras un gesto que nadie adivina. Gira al abrir,
                      igual que el de la barra inferior. */}
                  {isMobile && (
                    <span className="featured-galon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                      </svg>
                    </span>
                  )}

                  {/* Distintivo, icono y título COMPARTEN RENGLÓN.

                      Apilados sumaban 78px de los 213 que medía la placa
                      plegada, y en un panel que ahora mide 375px de alto eso es
                      un quinto de la pantalla gastado en dos líneas cortas. En
                      un renglón dicen lo mismo y ocupan 44px. Envuelve solo si
                      no cabe, que es lo que pasa en móvil.

                      El "01" delante de la categoría no es adorno: es lo que
                      distingue un servicio de otro ahora que los siete
                      comparten el mismo morado. (Aquí hubo un "01" de 4rem al
                      15% de opacidad de fondo; ese sí era decoración, y además
                      el lector de pantalla lo leía como contenido.) */}
                  <div className="featured-titular">
                    <span className="featured-category">
                      <span className="featured-indice">
                        {String(activeIndex + 1).padStart(2, '0')}
                      </span>
                      {activeService.category}
                    </span>

                    {/* El icono llevaba tres decoraciones encima: entraba
                        girando media vuelta desde escala 0 con un muelle,
                        flotaba en bucle infinito y tenía resplandor propio.
                        Ahora es una marca quieta a tamaño de mayúscula. */}
                    <span className="featured-icon" aria-hidden="true">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                        <path d={activeService.icon} />
                      </svg>
                    </span>
                    <h3 className="featured-title">{activeService.title}</h3>
                  </div>
                  <p className="featured-tagline">{activeService.tagline}</p>
                  {/* El envoltorio interno lo necesita el plegado por
                      grid-template-rows: el contenedor pasa de 1fr a 0fr y el
                      hijo unico recorta. Sustituye a animar max-height, que
                      recalculaba layout en cada frame. */}
                  <div className="featured-extra">
                  <div className="featured-extra-inner">
                  <p className="featured-description">{activeService.description}</p>

                  {/* Dos píldoras con su iconito pasan a dos lecturas: rótulo
                      arriba, cifra abajo, el mismo instrumento que las medidas
                      del CTA.

                      Y se va el «+» de «6+ clientes». Un más sobre un número de
                      una cifra resta en vez de sumar —el mismo criterio que
                      retiró el «98% satisfechos» de cifras.js—; y en el peor
                      caso decía «2+ clientes», que es leer en voz alta que son
                      dos. Un 06 en un cuadro de lectura no promete nada: mide. */}
                  <div className="featured-stats">
                    <span className="medida-servicio">
                      <span className="medida-rotulo">Clientes</span>
                      <span className="medida-cifra">
                        {String(activeService.clients).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="medida-servicio">
                      <span className="medida-rotulo">Desde</span>
                      <span className="medida-cifra medida-cifra--precio">
                        {activeService.price.replace(/^Desde\s+/i, '')}
                      </span>
                    </span>
                  </div>

                  {/* Los tres botones iban pintados en línea con el color del
                      servicio: relleno sólido el primero, borde y texto de color
                      los otros dos. Con el acento heredado ya no hace falta —y
                      además así el CSS puede darles las esquineras de mira que
                      llevan los del CTA, que es lo que los ata a esta web y no a
                      cualquier plantilla. */}
                  <div className="featured-actions">
                    <button className="featured-cta" onClick={handleScrollToContact}>
                      Hablemos de tu proyecto
                      <svg className="featured-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>

                    <a
                      href="https://plan.dakagency.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="featured-calc-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 16H6v-6h7v6zm8-2h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zM6 11V7h11v4H6z" />
                      </svg>
                      Cotizar paquetes
                    </a>

                    {activeService.demoUrl && (
                      <a
                        href={activeService.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="featured-calc-btn"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        {activeService.demoLabel || 'Probar demo en vivo'}
                      </a>
                    )}
                  </div>
                  </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Escala de marcas: siete divisiones de un instrumento, no siete
                  pastillas. La activa se distingue por altura.

                  Iba con un `motion.div` por segmento que entraba escalando en
                  X con retardo escalonado — una animación de entrada sobre una
                  barra de progreso, siete nodos de framer-motion para siete
                  rectángulos que no se mueven nunca más.

                  Y desaparece «N de 7 servicios vistos»: el contenedor mide 3px
                  con overflow oculto, así que ese texto NUNCA se vio; solo lo
                  leían los lectores de pantalla. Lo que dice ya está, y visible,
                  en el «01 / 07» de la cabecera de miniaturas. */}
              <div className="featured-progress">
                <div className="progress-track">
                  {services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`progress-segment ${viewedServices.has(index) ? 'viewed' : ''} ${index === activeIndex ? 'active' : ''}`}
                      style={{ '--marca-color': service.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preload next video */}
              <video
                ref={preloadRef}
                /* "metadata" y no "auto". Con auto se descargaba el siguiente
                   video ENTERO por si acaso: medido, 3.144 KB solo el de
                   Fotografia, para un servicio que el visitante puede no abrir
                   nunca. Con metadata el navegador resuelve cabeceras y
                   dimensiones —el cambio sigue siendo mas rapido que en frio—
                   sin traerse los megas. */
                preload="metadata"
                style={{ display: 'none' }}
              />
            </div>

            {/* Panel de miniaturas - Desktop only.
                El CSS ya lo ocultaba en movil con display:none, pero seguia en
                el DOM: siete <video preload="metadata"> que el navegador iba a
                pedir igualmente para algo que nadie ve. Ocultar no es no
                descargar; hay que no renderizarlo. */}
            {!isMobile && (
            <div className="thumbnails-panel">
              <div className="thumbnails-header">
                <span className="thumbnails-count">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                </span>
                <span className="thumbnails-label">Servicios</span>
              </div>

              <div
                className="services-thumbnails"
                ref={thumbnailsRef}
              >
                {services.map((service, index) => {
                  const isActive = index === activeIndex
                  const isViewed = viewedServices.has(index)
                  return (
                    <motion.div
                      key={service.id}
                      className={`thumbnail ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                      style={{
                        '--thumb-color': service.color,
                        borderColor: isActive ? service.color : 'transparent'
                      }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="thumbnail-video-wrapper">
                        {(service.videoDesktop || service.videoSrc) ? (
                          <video
                            src={cld(service.videoDesktop || service.videoSrc, 400)}
                            poster={cldPoster(service.videoDesktop || service.videoSrc, 400)}
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            className="thumbnail-video"
                          />
                        ) : (
                          <img
                            src={service.imageSrc}
                            alt={service.title || service.name || 'Servicio DAK'}
                            className="thumbnail-video"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                        <div className="thumbnail-overlay" />
                      </div>

                      <div className="thumbnail-icon" style={{ color: service.color }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d={service.icon} />
                        </svg>
                      </div>

                      <div className="thumbnail-info">
                        <span
                          className="thumbnail-number"
                          style={{ color: isActive ? service.color : 'rgba(255,255,255,0.4)' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="thumbnail-title">{service.title}</span>
                        <span className="thumbnail-tagline">{service.tagline}</span>
                        <span className="thumbnail-price-static" style={{ color: service.color }}>
                          {service.price}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          className="thumbnail-active-indicator"
                          layoutId="activeIndicator"
                          style={{ backgroundColor: service.color }}
                        />
                      )}

                      {isViewed && !isActive && (
                        <div className="thumbnail-viewed-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== DESKTOP SIDEBAR - Icons nav lateral ===== */}
      {!isMobile && (
        <div className="services-sidebar">
          <span className="sidebar-label">SERVICIOS</span>
          <div className="sidebar-track">
            <div className="sidebar-progress-line">
              <motion.div
                className="sidebar-progress-fill"
                style={{ backgroundColor: activeService.color }}
                animate={{ height: `${((activeIndex) / (services.length - 1)) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            {services.map((service, index) => {
              const isActive = index === activeIndex
              const isViewed = viewedServices.has(index)
              return (
                <div
                  key={service.id}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                  onClick={() => {
                    setActiveIndex(index)
                    setViewedServices(prev => new Set([...prev, index]))
                    if (servicesRef.current) {
                      servicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  <motion.div
                    className="sidebar-icon"
                    style={{
                      color: isActive ? service.color : isViewed ? service.color : 'rgba(255,255,255,0.3)',
                      backgroundColor: isActive ? `${service.color}15` : 'transparent',
                      borderColor: isActive ? `${service.color}40` : 'transparent',
                      boxShadow: 'none'
                    }}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d={service.icon} />
                    </svg>
                  </motion.div>
                  <div className="sidebar-tooltip">
                    <span className="sidebar-tooltip-title">{service.title}</span>
                    <span className="sidebar-tooltip-price" style={{ color: service.color }}>
                      {service.price}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <span className="sidebar-counter">
            {viewedServices.size}<span className="sidebar-counter-sep">/</span>{services.length}
          </span>
        </div>
      )}

      {/* ===== GLOBAL BOTTOM BAR - Visible siempre en móvil ===== */}
      {isMobile && (
        <>
          {/* Backdrop overlay cuando drawer está abierto */}
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                className="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Bottom Bar + Drawer */}
          <motion.div
            className="services-bottom-bar"
            initial={false}
            animate={{
              height: drawerOpen ? '75vh' : '56px'
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Bar Header - siempre visible */}
            <div className="bottom-bar-header" onClick={toggleDrawer}>
              <div className="bottom-bar-left">
                <div
                  className="bottom-bar-dot"
                  style={{ backgroundColor: activeService.color }}
                />
                <span className="bottom-bar-title">Servicios</span>
                <span className="bottom-bar-active" style={{ color: activeService.color }}>
                  {activeService.title}
                </span>
              </div>
              <div className="bottom-bar-right">
                <span className="bottom-bar-count">
                  {viewedServices.size}/{services.length}
                </span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  animate={{ rotate: drawerOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </motion.svg>
              </div>
            </div>

            {/* Drawer Content - servicios grid */}
            <AnimatePresence>
              {drawerOpen && (
                <motion.div
                  className="drawer-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  {/* Drawer Header */}
                  <div className="drawer-header">
                    <div className="drawer-header-left">
                      <span className="drawer-header-title">Nuestros Servicios</span>
                      <span className="drawer-header-badge">{services.length}</span>
                    </div>
                    <span className="drawer-header-hint">Toca para explorar</span>
                  </div>

                  <div className="drawer-services-grid">
                    {services.map((service, index) => {
                      const isActive = index === activeIndex
                      const isViewed = viewedServices.has(index)
                      return (
                        <motion.div
                          key={service.id}
                          className={`drawer-service-card ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                          onClick={() => handleDrawerServiceClick(index)}
                          style={{
                            '--card-color': service.color,
                            borderColor: isActive ? service.color : 'transparent'
                          }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Numbered label */}
                          <span className="drawer-card-number" style={{ color: service.color }}>
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          {/* Icon with glow */}
                          <div
                            className="drawer-card-icon"
                            style={{
                              color: service.color,
                              backgroundColor: `${service.color}15`,
                              boxShadow: 'none'
                            }}
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                              <path d={service.icon} />
                            </svg>
                          </div>

                          {/* Info */}
                          <div className="drawer-card-info">
                            <h4 className="drawer-card-title">{service.title}</h4>
                            <p className="drawer-card-tagline">{service.tagline}</p>
                            <p className="drawer-card-description">{service.description}</p>
                            <span className="drawer-card-price" style={{ color: service.color }}>
                              {service.price}
                            </span>
                          </div>

                          {/* Right side: arrow or check */}
                          <div className="drawer-card-right">
                            {isActive && (
                              <motion.div
                                className="drawer-card-active"
                                style={{ backgroundColor: service.color }}
                                layoutId="drawerActive"
                              />
                            )}
                            {isViewed && !isActive ? (
                              <div className="drawer-card-check">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                </svg>
                              </div>
                            ) : (
                              <svg className="drawer-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 6 15 12 9 18" />
                              </svg>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </>
  )
}

export default Services
