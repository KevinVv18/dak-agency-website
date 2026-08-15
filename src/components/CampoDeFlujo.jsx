import React, { useEffect, useRef } from 'react'
import { CAJA, trazarMarca } from '../data/marca'

/**
 * El túnel de viento: la marca revelada como obstáculo en una corriente.
 *
 * ─── LA IDEA ──────────────────────────────────────────────────────────────
 *
 * Las letras de DAK no se dibujan. Miles de líneas de flujo cruzan la pantalla
 * y se desvían al chocar contra ellas: la marca existe porque el aire la
 * esquiva. Y como el flujo ACELERA al rodear un obstáculo —eso es física, no
 * una metáfora— el contorno se enciende solo, sin que nadie lo pinte. DAK es
 * Digital Acceleration Key.
 *
 * El campo entra turbulento por la izquierda y sale laminar por la derecha.
 * Turbulento y laminar son los dos estados con nombre propio de un flujo: son,
 * literalmente, ruido y orden. De ahí que el lema de la casa rotule el
 * fenómeno en vez de colgar debajo del logo.
 *
 * ─── POR QUÉ NO FUNDE UN MÓVIL ────────────────────────────────────────────
 *
 * No hay simulación de fluidos. Un solver de Navier-Stokes recalcularía el
 * campo entero en cada fotograma; aquí el campo se PRECALCULA una vez sobre
 * una rejilla de baja resolución y después solo se muestrea. Por fotograma
 * queda mover partículas y pintar segmentos cortos: coste lineal y previsible.
 *
 * Lo único que se recalcula en vivo es la repulsión del puntero, que es una
 * distancia por partícula.
 */

/* ── La rejilla del campo ──
 *
 *  Basta con ser gruesa: el flujo es suave por naturaleza y el muestreo entre
 *  celdas hace el resto. Lo que NO puede ser es de proporción fija.
 *
 *  Con una rejilla fija de 340×190 estirada sobre el encuadre, en escritorio
 *  —proporción parecida— salía bien, pero en un teléfono de 375×812 las celdas
 *  quedaban casi cuatro veces más altas que anchas y la marca se estiraba hasta
 *  dejar de leerse: se veían barras verticales, no un DAK. Así que la rejilla
 *  se construye con la proporción de la pantalla y un presupuesto constante de
 *  celdas, para que el coste no dependa del dispositivo. */
const CELDAS = 110000
const REJILLA = { ancho: 340, alto: 190 }

const dimensionarRejilla = (ancho, alto) => {
  const alt = Math.max(48, Math.round(Math.sqrt((CELDAS * alto) / ancho)))
  REJILLA.alto = alt
  REJILLA.ancho = Math.max(48, Math.round(CELDAS / alt))
}

/** Cuántas líneas de flujo.
 *
 *  Por ÁREA, no por ancho. Antes era un escalón fijo —2.300 por encima de
 *  1.100 px— y eso hacía que la densidad se desplomase al agrandar la ventana:
 *  2.246 partículas por megapíxel a 1280×800, pero solo 1.321 a 1920×907. La
 *  marca se revela por ausencia, así que con un 40% menos de material hay un
 *  40% menos de lo que estar ausente, y a pantalla ancha dejaba de leerse. No
 *  era falta de contraste: era falta de aire.
 *
 *  2.250 por megapíxel es la densidad del 1280, medida donde sí lee.
 *
 *  El suelo es para el móvil, donde la marca ocupa poca superficie y necesita
 *  densidad relativa alta; el techo es para que un monitor 4K no dispare el
 *  coste, que crece lineal con este número. */
const POR_MEGAPIXEL = 2250
const cuantasParticulas = (ancho, alto) =>
  Math.round(Math.min(4200, Math.max(1100, ((ancho * alto) / 1e6) * POR_MEGAPIXEL)))

/** Densidad de píxel del lienzo.
 *
 *  La estela se hace rellenando el lienzo ENTERO con alfa baja en cada
 *  fotograma, así que este número pesa tanto como el de partículas: es un coste
 *  fijo proporcional al área. En escritorio 1.5 mantiene los trazos finos; en
 *  móvil, donde la pantalla real va a densidad 3 y el trazo ya se suaviza de
 *  todos modos, 1.25 recorta un tercio del relleno sin diferencia visible. */
const densidad = (w) => Math.min(window.devicePixelRatio || 1, w < 700 ? 1.25 : 1.5)

/** La rapidez del aire libre, lejos de cualquier obstáculo. Es también el
 *  estado al que tiende todo el campo cuando la marca se suelta, así que vive
 *  aquí para que el campo y el compás no puedan discrepar. */
const BASE_LAMINAR = 0.14

/* ── La paleta, precalculada por franjas de rapidez ──
 *
 *  El color no se elige: lo dicta la rapidez del flujo. Donde la corriente se
 *  estrecha al rodear la letra, acelera y se enciende en el morado de marca.
 *  El contorno lo dibuja la física, no una capa encima.
 *
 *  Se corta en 12 franjas para poder agrupar el trazado. Pintando partícula a
 *  partícula hacía falta una llamada de trazado por partícula —2.300 por
 *  fotograma en escritorio—, y cada una tiene un coste fijo que no depende de
 *  lo corto que sea el segmento. Agrupadas quedan 12, una por franja. En
 *  pantalla no cambia nada: el degradado ya era continuo y a esta resolución
 *  doce escalones no se distinguen de infinitos. */
const FRANJAS = 12
const PALETA = Array.from({ length: FRANJAS }, (_, i) => {
  const vel = (i + 0.5) / FRANJAS
  /* Dos colores, no tres. Hubo un tercero —un teal— por en medio, y no venía
     de ningún sitio: la marca es morada y blanca. Un color inventado convierte
     una visualización en decoración de ciencia ficción genérica.
     Blanco donde el aire va libre, #B024FF pegado a la pared, y el degradado
     entero entre medias. */
  const t = Math.min(1, Math.max(0, (vel - 0.3) / 0.55))
  const r = Math.round(255 - 79 * t)
  const v = Math.round(255 - 219 * t)
  return `rgba(${r}, ${v}, 255, ${(0.18 + vel * 0.55).toFixed(3)})`
})

/* Ruido barato por capas de senos. No hace falta Perlin: el campo se calcula
   una sola vez, y a esta escala unas pocas capas dan remolinos convincentes
   por una fracción del coste y sin tabla de permutaciones. */
const ondas = (x, y) =>
  Math.sin(x * 2.7 + y * 1.3) * 0.55 +
  Math.sin(x * 6.1 - y * 4.4) * 0.28 +
  Math.sin(x * 13.3 + y * 9.7) * 0.14

const CampoDeFlujo = ({ className = '' }) => {
  const lienzoRef = useRef(null)
  const contenedorRef = useRef(null)
  const punteroRef = useRef({ x: -9999, y: -9999 })
  const estadoRef = useRef(null)

  useEffect(() => {
    const lienzo = lienzoRef.current
    const contenedor = contenedorRef.current
    if (!lienzo || !contenedor) return

    const ctx = lienzo.getContext('2d', { alpha: false })
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let ancho = 0
    let alto = 0
    let campoX = null
    let campoY = null
    let rapidez = null
    let particulas = null
    let cuadro = 0
    let visible = false
    /* Un buzón de segmentos por franja de color, reservado una sola vez.
       Dentro del fotograma no se asigna memoria: solo se rellena y se vacía. */
    let buzones = null
    let cuantos = null
    let propCampo = 0
    let mascara = null
    let franjaMarca = { centro: 0.44, medio: 0.3 }

    /* ── El censo de ocupación ──
     *
     *  Cuenta cuántas partículas hay en cada zona para sembrar DONDE FALTA.
     *
     *  Hace falta porque un obstáculo deja sombra: la cuña inferior de la K
     *  dejaba un 18-24% menos de material a sotavento, con el filo recto de la
     *  propia cuña. Un escalón de densidad con borde recto sobre un fondo casi
     *  negro no se lee como estela — se lee como una grieta.
     *
     *  Sembrar más «hacia el lado de sotavento» a ojo no sirvió, medido. Contar
     *  sí: se corrige solo ante cualquier sombra, sin tener que saber dónde
     *  está, que es lo que hace un túnel de verdad al colocar sus tomas. */
    const CENSO_X = 16
    const CENSO_Y = 9
    let censo = new Uint16Array(CENSO_X * CENSO_Y)
    let censoPrevio = new Uint16Array(CENSO_X * CENSO_Y)


    /* ── El avance del ensayo ──
     *
     *  0 = la marca obstruye y la corriente entra revuelta.
     *  1 = la marca se ha soltado y el flujo va laminar.
     *
     *  Se saca del desplazamiento, pero SIN medir nada por fotograma: un
     *  getBoundingClientRect() dentro del bucle obliga al navegador a recalcular
     *  la maquetación sesenta veces por segundo. Lo único que hace el escuchador
     *  es guardar un número que el navegador ya tiene; la geometría del hero se
     *  cachea en medir() y solo se refresca al redimensionar. */
    let ensayo = 0
    /* Cuánto se ha soltado la marca. Es `ensayo` pasado por una curva suave,
       no el mismo número: el índice del eje mide el avance del ensayo y la
       marca se va con su propio ritmo. */
    let suelta = 0
    let desplazamiento = window.scrollY
    let tunelNodo = null
    let heroNodo = null
    let heroDesde = 0
    let recorrido = 0
    let ctaDesde = 0
    let ensayoEscrito = -1
    let entregaEscrita = -1
    /* Cuánto se ha cerrado la tobera de salida: al final del titular la
       corriente converge hacia el centro de abajo, como el conducto por el que
       sale el aire de un túnel real, y empuja hacia la sección siguiente. */
    let tobera = 0

    /* ── 1. La máscara: dónde hay letra y dónde hay aire ──
       Se rellenan los polígonos de la marca en una rejilla de baja resolución
       y se lee el alfa. Con los puntos en JS no hace falta cargar el SVG como
       imagen: se traza y se lee en el mismo tick. */
    const construirMascara = () => {
      const m = document.createElement('canvas')
      m.width = REJILLA.ancho
      m.height = REJILLA.alto
      const mc = m.getContext('2d', { willReadFrequently: true })
      mc.fillStyle = '#fff'

      // La caja de destino se da ya con la proporción exacta de la marca, en
      // vez de dejar que un encaje por el lado menor decida el tamaño. Así el
      // obstáculo mide lo mismo en pantalla —una fracción del ANCHO— tanto en
      // un monitor como en un teléfono, que es lo que hace que se lea igual.
      // Pantalla estrecha, marca más ancha: a 375px un 78% deja las letras
      // demasiado pequeñas para distinguirse entre los trazos.
      const parte = REJILLA.ancho / REJILLA.alto < 1 ? 0.92 : 0.84
      const anchoMarca = REJILLA.ancho * parte
      const altoMarca = anchoMarca * (CAJA.alto / CAJA.ancho)
      const centroY = REJILLA.alto * 0.44
      trazarMarca(mc, {
        x: (REJILLA.ancho - anchoMarca) / 2,
        y: centroY - altoMarca / 2,
        ancho: anchoMarca,
        alto: altoMarca,
      })

      const datos = mc.getImageData(0, 0, REJILLA.ancho, REJILLA.alto).data
      const solido = new Float32Array(REJILLA.ancho * REJILLA.alto)
      for (let i = 0; i < solido.length; i++) solido[i] = datos[i * 4 + 3] / 255

      /* La caja que ocupa la marca, en fracciones del encuadre y con un margen
         para abarcar también la zona donde el flujo la rodea. La usa la rejilla
         de humo para saber dónde hace falta material. */
      const medio = (altoMarca / 2 + altoMarca * 0.22) / REJILLA.alto
      const centro = centroY / REJILLA.alto
      return { solido, altoMarca, franja: { centro, medio } }
    }

    /* ── 2. El campo, calculado UNA vez ──
       Se difumina la máscara para obtener una rampa alrededor de las letras;
       su gradiente apunta hacia fuera del sólido. Sumando ese gradiente al
       flujo base, la corriente rodea el obstáculo en vez de atravesarlo. */
    const construirCampo = () => {
      dimensionarRejilla(ancho, alto)
      const { solido, altoMarca, franja } = construirMascara()
      mascara = solido
      franjaMarca = franja
      const { ancho: GW, alto: GH } = REJILLA

      /* Difuminado por cajas. Se generan DOS rampas del mismo sólido:
         - una estrecha, que define la pared contra la que resbala el flujo.
           Cuanto más apretada, más nítida sale la letra.
         - una ancha, que define hasta dónde llega la aceleración.
         Con una sola rampa había que elegir: apretada dejaba las letras
         nítidas pero el brillo del borde solo tocaba a un par de celdas, así
         que casi ninguna partícula se encendía; ancha encendía el contorno
         pero emborronaba la tipografía. Son dos trabajos distintos. */
      const difuminar = (origen, radio, pasadas) => {
        const a = Float32Array.from(origen)
        const b = new Float32Array(GW * GH)
        for (let pase = 0; pase < pasadas; pase++) {
          // Horizontal: la suma entra por delante y sale por detrás, así que
          // cada celda cuesta una suma y una resta sea cual sea el radio.
          for (let y = 0; y < GH; y++) {
            const f = y * GW
            let suma = 0
            let n = 0
            for (let x = 0; x <= radio && x < GW; x++) { suma += a[f + x]; n++ }
            for (let x = 0; x < GW; x++) {
              b[f + x] = suma / n
              const entra = x + radio + 1
              const sale = x - radio
              if (entra < GW) { suma += a[f + entra]; n++ }
              if (sale >= 0) { suma -= a[f + sale]; n-- }
            }
          }
          // Vertical, sobre el resultado del horizontal.
          for (let x = 0; x < GW; x++) {
            let suma = 0
            let n = 0
            for (let y = 0; y <= radio && y < GH; y++) { suma += b[y * GW + x]; n++ }
            for (let y = 0; y < GH; y++) {
              a[y * GW + x] = suma / n
              const entra = y + radio + 1
              const sale = y - radio
              if (entra < GH) { suma += b[entra * GW + x]; n++ }
              if (sale >= 0) { suma -= b[sale * GW + x]; n-- }
            }
          }
        }
        return a
      }

      /* ── DOS rampas, porque son dos trabajos ──
         Las medidas van como FRACCIÓN de la altura de la marca, nunca en
         celdas: en celdas, el mismo ajuste da una banda distinta en cada
         resolución, que es por lo que el móvil no se parecía al escritorio.
         El suelo en píxeles es aparte: en un teléfono la banda llegó a medir
         3,6 px y, con trazos de un píxel, casi ninguna partícula la cruzaba.

         · La ESTRECHA aparta la corriente, así que decide el tamaño y el filo
           del hueco — o sea, la forma de la letra.
         · La ANCHA pinta el halo, así que decide cuánto se enciende.

         Con una sola para las dos cosas hay que elegir: estrecha dejaba el
         contorno en un pelo que no cerraba la forma; ancha encendía bien pero
         ENGORDABA las letras, porque apartaba las partículas mucho antes de la
         letra real y el hueco salía más gordo que la marca.

         La ancha se saca difuminando otra vez la estrecha en lugar de partir
         del sólido: difuminados encadenados suman varianzas (σ² = σ₁² + σ₂²),
         así que sale la misma campana con dos pasadas más en vez de tres. */
      const celdasPorPixel = GW / ancho
      const radioDe = (s, pasadas) =>
        Math.max(1, Math.round((Math.sqrt(1 + (12 / pasadas) * s * s) - 1) / 2))

      const sigmaForma = Math.max(1, altoMarca * 0.03, 5 * celdasPorPixel)
      const sigmaHalo = Math.max(sigmaForma * 1.6, altoMarca * 0.075, 10 * celdasPorPixel)
      const sigmaExtra = Math.sqrt(sigmaHalo * sigmaHalo - sigmaForma * sigmaForma)

      const rampaForma = difuminar(solido, radioDe(sigmaForma, 3), 3)
      const rampaAncha = difuminar(rampaForma, radioDe(sigmaExtra, 2), 2)


      /* Los remolinos se calculan en coordenadas normalizadas, así que en una
         pantalla estrecha saldrían tan estirados a lo alto como lo esté el
         encuadre. La frecuencia vertical se corrige contra la proporción de
         escritorio, que es donde se ajustó a ojo; el tope evita que en un móvil
         muy alargado la turbulencia degenere en rayado fino. */
      const frecuenciaV = 3.2 * Math.min(2.2, Math.max(1, 1.6 / (ancho / alto)))

      campoX = new Float32Array(GW * GH)
      campoY = new Float32Array(GW * GH)
      rapidez = new Float32Array(GW * GH)

      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          const i = y * GW + x
          const u = x / GW
          const v = y / GH

          // La normal de la superficie: gradiente de la rampa, apuntando hacia
          // fuera del sólido.
          const ix = Math.min(GW - 1, x + 1)
          const dx0 = Math.max(0, x - 1)
          const iy = Math.min(GH - 1, y + 1)
          const dy0 = Math.max(0, y - 1)
          /* La normal sale de la rampa de FORMA, que es la que define el hueco.
             Sacándola de la ancha, la corriente se apartaba mucho antes de la
             letra real y el hueco salía más gordo que la marca: las letras se
             veían hinchadas y con las esquinas redondeadas. Sacándola de una
             rampa demasiado apretada pasa lo contrario — la corriente entra
             recta hasta chocar y se corta en seco contra el borde, dejando un
             peinado de trazos truncados. El ajuste de sigmaForma está entre
             esas dos cosas. */
          let nx = -(rampaForma[y * GW + ix] - rampaForma[y * GW + dx0])
          let ny = -(rampaForma[iy * GW + x] - rampaForma[dy0 * GW + x])
          const nm = Math.hypot(nx, ny)

          // Turbulencia que se apaga hacia la derecha: entra revuelto (RUIDO)
          // y sale ordenado (IMPACTO).
          const turbulencia = Math.max(0, 1 - u * 1.5)
          const remolino = ondas(u * 3.2, v * frecuenciaV) * turbulencia * 0.42

          // Flujo base de izquierda a derecha.
          let fx = 1
          let fy = remolino

          if (solido[i] > 0.5) {
            // Dentro de la letra: empuje hacia fuera, para que ninguna
            // partícula quede atrapada.
            fx = nx * 60
            fy = ny * 60
          } else if (nm > 0.0006) {
            // Fuera pero cerca: se le RESTA a la velocidad su componente
            // entrante, en vez de sumarle una saliente.
            //
            // Sumar el gradiente lanzaba las líneas en radial desde la letra,
            // como una explosión — que es lo que se veía y no es cómo se
            // comporta un fluido. Restando solo lo que entra queda el
            // componente tangencial: la corriente RESBALA por el contorno y lo
            // dibuja en vez de huir de él.
            nx /= nm
            ny /= nm
            const entrante = fx * nx + fy * ny
            if (entrante < 0) {
              // El factor por encima de 1 despega la corriente de la pared;
              // exactamente 1 la dejaría pegada y las letras se emborronarían.
              fx -= entrante * nx * 1.35
              fy -= entrante * ny * 1.35
            }

          }


          const mag = Math.hypot(fx, fy) || 1
          campoX[i] = fx / mag
          campoY[i] = fy / mag
          /* Donde la corriente se estrecha al rodear la letra, acelera. Es lo
             que enciende el contorno en el morado de marca sin que nadie lo
             dibuje encima.

             La rapidez es la rampa MISMA, no su pendiente. Con la pendiente
             —que es lo que había— la zona encendida era una cresta de un par de
             celdas: casi ninguna partícula caía dentro y el contorno salía
             gris. En un flujo real la velocidad es máxima pegada al cuerpo y
             decae con la distancia, que es justo la forma de la rampa. Además,
             en un hueco estrecho —el ojo de la D, el ángulo de la A— las
             rampas de ambas paredes se suman y ahí es donde más se enciende:
             eso es un venturi, y sale gratis. */
          //
          // La raíz no es decorativa: la deflexión aparta las partículas justo
          // de la primera celda pegada a la pared, que es donde la rampa vale
          // casi 1. Sin ella, la banda encendida cae fuera de por donde de
          // verdad pasa la corriente y el contorno vuelve a salir gris. La raíz
          // levanta los valores bajos y estira el encendido hacia afuera, hasta
          // alcanzar el flujo real.
          rapidez[i] = Math.min(1, BASE_LAMINAR + Math.sqrt(rampaAncha[i]) * 1.75)
        }
      }
    }

    const sembrar = () => {
      const n = cuantasParticulas(ancho, alto)
      particulas = new Float32Array(n * 5) // x, y, px, py, vida
      // Cada partícula aporta un segmento (cuatro coordenadas) y podrían caer
      // todas en la misma franja, así que cada buzón se dimensiona al total.
      buzones = Array.from({ length: FRANJAS }, () => new Float32Array(n * 4))
      cuantos = new Uint16Array(FRANJAS)
      for (let i = 0; i < n; i++) sembrarUna(i * 5, Math.random() * 220)
    }

    const medir = () => {
      const caja = contenedor.getBoundingClientRect()
      ancho = Math.max(1, Math.round(caja.width))
      alto = Math.max(1, Math.round(caja.height))
      const dpr = densidad(ancho)
      lienzo.width = Math.round(ancho * dpr)
      lienzo.height = Math.round(alto * dpr)
      lienzo.style.width = `${ancho}px`
      lienzo.style.height = `${alto}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#030106'
      ctx.fillRect(0, 0, ancho, alto)

      /* El campo depende de la PROPORCIÓN del encuadre, no de su tamaño, así
         que solo se reconstruye cuando esa proporción cambia de verdad. Al
         girar un teléfono sí; al aparecer la barra del navegador al desplazar,
         no — y esa es la diferencia entre un giro y un tirón cada vez que la
         barra entra o sale. */
      const prop = ancho / alto
      if (!campoX || Math.abs(prop - propCampo) / propCampo > 0.08) {
        construirCampo()
        propCampo = prop
      }

      /* La geometría del compás, cacheada.
         El recorrido lo marca el HERO, no el túnel entero: así --ensayo llega a
         1 justo cuando la capa del hero se despega, que es exactamente cuando
         entra el titular. La entrega no hay que sincronizarla, cae sola.
         La variable se escribe en el túnel para que la lean los dos actos. */
      tunelNodo = contenedor.closest('.tunel')
      heroNodo = tunelNodo ? tunelNodo.querySelector('.hero') : null
      if (heroNodo) {
        heroDesde = heroNodo.getBoundingClientRect().top + window.scrollY
        recorrido = Math.max(1, heroNodo.offsetHeight - alto)
      }
      /* El segundo acto. Su progreso arranca cuando el titular asoma por el
         borde de abajo y termina cuando ya está puesto; de ahí en adelante
         empieza la contracción de salida. */
      const cta = tunelNodo ? tunelNodo.querySelector('.cta-section') : null
      ctaDesde = cta ? cta.getBoundingClientRect().top + window.scrollY : 0

      sembrar()
    }

    /* ── Muestreo del campo, interpolado entre las cuatro celdas vecinas ──
     *
     *  Cogiendo solo la celda más cercana, todas las partículas que caen en la
     *  misma celda salen con la MISMA dirección exacta, y como la celda mide
     *  varios píxeles en pantalla, el contorno de las letras aparecía
     *  escalonado: una escalera visible en las diagonales de la A y en el
     *  interior de la D. Es lo que hacía que la marca no se viera nítida.
     *
     *  Interpolando entre las cuatro vecinas, la dirección varía de forma
     *  continua y el borde sigue el trazo real de la letra en vez del de la
     *  rejilla. Los resultados van a `salida` para no crear un objeto por
     *  partícula y fotograma. */
    /* ── Dónde puede nacer una partícula ──
     *
     *  En el aire, nunca dentro de la letra. Sembrando a ciegas por todo el
     *  campo, una de cada tantas aparecía dentro del sólido y salía disparada
     *  hacia fuera: eso llenaba el interior de las letras de pelusa, justo la
     *  zona que tiene que quedar vacía para que la marca se lea. Unos pocos
     *  intentos bastan —el sólido ocupa una fracción pequeña del encuadre— y el
     *  tope evita cualquier posibilidad de bucle. */
    const aire = (x, y) => {
      const gx = Math.min(REJILLA.ancho - 1, ((x / ancho) * REJILLA.ancho) | 0)
      const gy = Math.min(REJILLA.alto - 1, ((y / alto) * REJILLA.alto) | 0)
      return mascara[gy * REJILLA.ancho + gx] < 0.5
    }

    const sembrarUna = (b, vidaInicial) => {
      let x = 0
      let y = 0
      // Una vez soltada la marca ya no hay sólido que esquivar, y seguir
      // esquivándolo dejaría un hueco fantasma con la forma de las letras justo
      // donde el aire tiene que haber quedado limpio.
      const hayObstaculo = suelta < 0.55
      /* ── La rejilla de humo ──
         Un túnel de viento real inyecta humo en la zona del modelo: sin humo no
         se ve nada, y repartirlo por todo el conducto sería desperdiciarlo.
         Aquí igual — parte de las partículas nacen dentro de la franja que
         ocupa la marca, en vez de esparcirse por un lienzo que arriba y abajo
         está vacío. Sube lo que se lee sin subir lo que cuesta.

         Se reparte a cualquier x, no solo por la izquierda: sembrando solo en
         el borde de entrada, la D hacía sombra y la A y la K no se revelaban.

         Hubo un intento de sembrar de más a sotavento de la marca, buscando un
         corte vertical que Kevin veía hacia el 80% del ancho. Medido, no cambió
         nada: ese corte no estaba en el campo, era una línea de la rejilla que
         seguía al cursor (.cursor-grid-reveal, ya retirada). El escalón de
         brillo que sí hay ahí es el borde del halo de la marca — física
         correcta, no un fallo. */
      /* La concentración es SUAVE, sin bordes.
       *
       *  Antes se sorteaba uniformemente dentro de una franja con extremos
       *  duros. Eso metía un escalón de densidad en el borde de la franja: por
       *  debajo de él, la banda inferior recibía menos de la mitad de la siembra
       *  que le tocaba por superficie. Y un escalón de densidad recto a lo ancho
       *  de la pantalla no se lee como flujo — se lee como una GRIETA. Era la
       *  que Kevin veía, y por eso dependía del tamaño de la ventana: la franja
       *  se dimensiona con la marca, y la marca escala con el ancho.
       *
       *  Sumar tres sorteos da una campana en vez de una caja: la concentración
       *  se mantiene, pero se apaga gradualmente y no deja ningún borde. */
      /* Mitad de los renacimientos van a reponer la zona más pobre; el resto
         mantiene la concentración sobre la marca. La zona se elige por torneo
         entre seis al azar: apuntar siempre a LA más vacía la llena de golpe,
         el mínimo salta a otra y el reparto oscila sin cerrar nada. */
      const aReponer = Math.random() < 0.5
      const enLaFranja = !aReponer && hayObstaculo && Math.random() < 0.55
      for (let intento = 0; intento < 8; intento++) {
        if (aReponer) {
          let c = (Math.random() * censoPrevio.length) | 0
          for (let k = 0; k < 5; k++) {
            const o = (Math.random() * censoPrevio.length) | 0
            if (censoPrevio[o] < censoPrevio[c]) c = o
          }
          x = (((c % CENSO_X) + Math.random()) / CENSO_X) * ancho
          y = ((((c / CENSO_X) | 0) + Math.random()) / CENSO_Y) * alto
        } else {
          x = Math.random() * ancho
          if (enLaFranja) {
            const campana = (Math.random() + Math.random() + Math.random()) / 3 - 0.5
            y = Math.min(1, Math.max(0, franjaMarca.centro + campana * franjaMarca.medio * 2.6)) * alto
          } else {
            y = Math.random() * alto
          }
        }
        if (!hayObstaculo || aire(x, y)) break
      }
      particulas[b] = x
      particulas[b + 1] = y
      particulas[b + 2] = x
      particulas[b + 3] = y
      particulas[b + 4] = vidaInicial
    }

    const salida = { vx: 0, vy: 0, vel: 0 }
    const muestrear = (x, y) => {
      const GW = REJILLA.ancho
      const GH = REJILLA.alto
      let cx = (x / ancho) * GW - 0.5
      let cy = (y / alto) * GH - 0.5
      if (cx < 0) cx = 0; else if (cx > GW - 1.001) cx = GW - 1.001
      if (cy < 0) cy = 0; else if (cy > GH - 1.001) cy = GH - 1.001

      const x0 = cx | 0
      const y0 = cy | 0
      const tx = cx - x0
      const ty = cy - y0
      const i00 = y0 * GW + x0
      const i10 = i00 + 1
      const i01 = i00 + GW
      const i11 = i01 + 1
      const p00 = (1 - tx) * (1 - ty)
      const p10 = tx * (1 - ty)
      const p01 = (1 - tx) * ty
      const p11 = tx * ty

      salida.vx = campoX[i00] * p00 + campoX[i10] * p10 + campoX[i01] * p01 + campoX[i11] * p11
      salida.vy = campoY[i00] * p00 + campoY[i10] * p10 + campoY[i01] * p01 + campoY[i11] * p11
      salida.vel = rapidez[i00] * p00 + rapidez[i10] * p10 + rapidez[i01] * p01 + rapidez[i11] * p11
      return salida
    }

    const pintar = () => {
      /* ── Dónde va el ensayo ──
         El campo despejado no se almacena: un flujo laminar es (1, 0) con la
         rapidez de fondo, o sea una constante. Así que no hay segundo campo en
         memoria ni nada que reconstruir al desplazar — solo una interpolación
         entre lo ya calculado y ese valor fijo. Con t = 0 el resultado es
         exactamente idéntico al de antes. */
      ensayo = quieto
        ? 0
        : Math.min(1, Math.max(0, (desplazamiento - heroDesde) / recorrido))

      /* El segundo acto y el remate, con el mismo reloj. El titular resolvía
         con un temporizador que se dispara al entrar en pantalla; ahora entra
         SEGÚN BAJAS, igual que todo lo demás del túnel. */
      const entrega = quieto
        ? 1
        : Math.min(1, Math.max(0, (desplazamiento - (ctaDesde - alto)) / (alto * 0.85)))
      /* El remate. Ojo: mientras el lienzo se ve solo llega a ~0,21 de su
         recorrido — está medido en docs/brecha-hero.md, junto con lo demás que
         quedó sin resolver. */
      tobera = quieto
        ? 0
        : Math.min(1, Math.max(0, (desplazamiento - (ctaDesde - alto * 0.15)) / (alto * 0.7)))

      if (tunelNodo) {
        // Una sola fuente de verdad para el lienzo y para la tipografía: si la
        // escala y los rótulos leyeran el scroll por su cuenta, tendrían su
        // propio reloj y podrían desfasarse del campo.
        if (Math.abs(ensayo - ensayoEscrito) > 0.002) {
          tunelNodo.style.setProperty('--ensayo', ensayo.toFixed(3))
          ensayoEscrito = ensayo
        }
        if (Math.abs(entrega - entregaEscrita) > 0.002) {
          tunelNodo.style.setProperty('--entrega', entrega.toFixed(3))
          entregaEscrita = entrega
        }
      }

      /* La marca no se disuelve linealmente desde el primer píxel de scroll.
         Así se iba justo cuando la estabas mirando, y era la queja: que se
         notara más. Lo que más pesa en que algo «se note» no es el contraste,
         es el tiempo que está puesto — con esta curva aguanta formada casi todo
         el primer cuarto del compás y se va deprisa al final. Suave por los dos
         extremos y sin tramo muerto, así que el índice del eje sigue
         avanzando de forma continua mientras tanto. */
      suelta = ensayo * ensayo * (3 - 2 * ensayo)

      // La estela: en vez de borrar, se pinta el fondo con alfa baja, así lo
      // anterior se desvanece y cada partícula deja rastro. Al ordenarse el
      // flujo la estela se alarga: es lo que hace que laminar se lea como
      // rápido y limpio en vez de como «se apagó».
      ctx.fillStyle = `rgba(3, 1, 6, ${(0.055 - suelta * 0.022).toFixed(4)})`
      ctx.fillRect(0, 0, ancho, alto)

      const n = particulas.length / 5
      const p = punteroRef.current
      const empuje = 1 + suelta * 1.1
      ctx.lineWidth = 1
      cuantos.fill(0)

      // El censo del fotograma anterior es la referencia; se empieza uno nuevo.
      const tmpCenso = censoPrevio
      censoPrevio = censo
      censo = tmpCenso
      censo.fill(0)


      for (let i = 0; i < n; i++) {
        const b = i * 5
        let x = particulas[b]
        let y = particulas[b + 1]

        const m = muestrear(x, y)
        let vx = m.vx
        let vy = m.vy
        let vel = m.vel

        // La marca se suelta: la corriente deja de rodearla y se endereza.
        if (suelta > 0) {
          vx += (1 - vx) * suelta
          vy -= vy * suelta
          vel += (BASE_LAMINAR - vel) * suelta
        }

        /* La tobera de salida: todo converge hacia un punto por debajo del
           centro. Un túnel de viento no dobla su corriente al terminar, la
           ESTRECHA — y al estrecharse acelera, que es justo el empujón que
           hace falta para pasar a lo siguiente.

           OJO, medido y sin resolver: converger hacia un punto es un sumidero,
           y un sumidero vacía los lados. A 0,21 —todo lo que alcanza mientras
           el lienzo se ve— deja la derecha al 76% del centro y la izquierda al
           121%. Ver docs/brecha-hero.md. */
        if (tobera > 0) {
          const hx = ancho * 0.5 - x
          const hy = alto * 1.35 - y
          const hm = Math.hypot(hx, hy) || 1
          const k = tobera * 0.85
          vx += (hx / hm - vx) * k
          vy += (hy / hm - vy) * k
          vel += (0.42 - vel) * tobera
        }

        // El puntero abre la corriente a su alrededor. Es lo único que se
        // recalcula por fotograma, y es lo que prueba que esto está vivo.
        const dx = x - p.x
        const dy = y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 26000) {
          const d = Math.sqrt(d2) || 1
          const fuerza = (1 - d / 161) * 2.6
          vx += (dx / d) * fuerza
          vy += (dy / d) * fuerza
        }

        const paso = (0.9 + vel * 2.4) * empuje
        particulas[b + 2] = x
        particulas[b + 3] = y
        x += vx * paso
        y += vy * paso
        particulas[b] = x
        particulas[b + 1] = y
        particulas[b + 4] -= 1

        // Reaparece en cualquier punto del campo, no solo por la izquierda.
        //
        // Reapareciendo solo en el borde izquierdo, la D hacía sombra: las
        // partículas chocaban con ella, se desviaban, y detrás no volvía a
        // entrar corriente. Resultado, la A y la K no se revelaban. Sembrando
        // por todo el campo cada región mantiene su densidad y las tres letras
        // se leen. La vida corta evita que se acumulen en los remansos.
        if (x < -20 || x > ancho + 20 || y < -20 || y > alto + 20 || particulas[b + 4] < 0) {
          sembrarUna(b, 70 + Math.random() * 130)
          continue
        }


        // Censo: en qué zona ha quedado.
        censo[
          Math.min(CENSO_Y - 1, Math.max(0, ((y / alto) * CENSO_Y) | 0)) * CENSO_X +
          Math.min(CENSO_X - 1, Math.max(0, ((x / ancho) * CENSO_X) | 0))
        ]++

        // El segmento no se traza aquí: se deja en el buzón de su franja de
        // rapidez para trazarlo luego junto a todos los de su mismo color.
        const franja = vel < 1 ? (vel * FRANJAS) | 0 : FRANJAS - 1
        const buzon = buzones[franja]
        const c = cuantos[franja] * 4
        buzon[c] = particulas[b + 2]
        buzon[c + 1] = particulas[b + 3]
        buzon[c + 2] = x
        buzon[c + 3] = y
        cuantos[franja]++
      }

      /* La zona más vacía, para los renacimientos del fotograma siguiente. Se
         excluyen las que están dentro del sólido: ahí NO tiene que haber
         material, es la letra. */

      // Doce trazados por fotograma en vez de uno por partícula.
      for (let f = 0; f < FRANJAS; f++) {
        const total = cuantos[f]
        if (!total) continue
        const buzon = buzones[f]
        ctx.strokeStyle = PALETA[f]
        ctx.beginPath()
        for (let s = 0; s < total; s++) {
          const c = s * 4
          ctx.moveTo(buzon[c], buzon[c + 1])
          ctx.lineTo(buzon[c + 2], buzon[c + 3])
        }
        ctx.stroke()
      }
    }

    const bucle = () => {
      pintar()
      cuadro = requestAnimationFrame(bucle)
    }

    const arrancar = () => {
      if (cuadro || quieto) return
      cuadro = requestAnimationFrame(bucle)
    }
    const parar = () => {
      cancelAnimationFrame(cuadro)
      cuadro = 0
    }

    medir() // construye el campo por dentro, ya con el encuadre conocido

    if (quieto) {
      // Sin movimiento: se deja el campo asentado en un fotograma fijo, como
      // una lámina impresa de la corriente. La marca se sigue leyendo.
      for (let k = 0; k < 220; k++) pintar()
    }

    // Solo corre mientras se ve. Mismo patrón que el vídeo de Servicios.
    const observador = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible) arrancar()
        else parar()
      },
      { threshold: 0.05 },
    )
    observador.observe(contenedor)

    const alMover = (e) => {
      const caja = contenedor.getBoundingClientRect()
      punteroRef.current = { x: e.clientX - caja.left, y: e.clientY - caja.top }
    }
    const alSalir = () => { punteroRef.current = { x: -9999, y: -9999 } }

    let reajuste
    const alRedimensionar = () => {
      clearTimeout(reajuste)
      reajuste = setTimeout(() => {
        medir()
        if (quieto) for (let k = 0; k < 220; k++) pintar()
      }, 180)
    }

    // Solo guarda un número que el navegador ya tiene calculado. Nada de leer
    // geometría aquí: eso es lo que convierte un scroll en un tirón.
    const alDesplazar = () => { desplazamiento = window.scrollY }

    window.addEventListener('pointermove', alMover, { passive: true })
    window.addEventListener('pointerleave', alSalir, { passive: true })
    window.addEventListener('scroll', alDesplazar, { passive: true })
    window.addEventListener('resize', alRedimensionar)
    estadoRef.current = { parar }

    return () => {
      parar()
      observador.disconnect()
      clearTimeout(reajuste)
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerleave', alSalir)
      window.removeEventListener('scroll', alDesplazar)
      window.removeEventListener('resize', alRedimensionar)
    }
  }, [])

  return (
    <div ref={contenedorRef} className={`campo ${className}`} aria-hidden="true">
      <canvas ref={lienzoRef} className="campo-lienzo" />
    </div>
  )
}

export default CampoDeFlujo
