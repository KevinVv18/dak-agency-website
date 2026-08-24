import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * La entrada del panel.
 *
 * Tres ideas, y las tres salen del material que ya habia:
 *
 * 1. El logo de DAK son POLIGONOS CON TRAZO, no una imagen plana. Eso permite
 *    dibujarlo con stroke-dashoffset en vez de que aparezca de golpe — que es
 *    exactamente el lenguaje de linea fina que usa el resto de la consola.
 *
 * 2. La D no se desvanece: VIAJA AL RAIL y se queda ahi como marca. Es el mismo
 *    elemento del principio al final, asi que no hay empalme que disimular. La
 *    A y la K se retiran por el camino.
 *
 * 3. El ultimo tramo no se construye: la entrada escalonada del contenido ya
 *    existe en styles.css (`content-arrival`, `measure-entry`...). La intro solo
 *    tiene que desembocar en ella.
 *
 * El salto de la D es un FLIP medido, no una animacion a ojo: se miden las dos
 * cajas reales y se calcula la transformacion. Aterriza donde tiene que
 * aterrizar en cualquier tamaño de ventana.
 */

/** Cuanto dura cada tramo. En un sitio, para poder afinarlo sin buscar. */
export const TIEMPOS = {
  telon: 120,
  trazo: 700,   // los tres contornos, ya escalonados
  relleno: 250,
  pausa: 200,   // el silencio que hace que se lea como intencion, no como carga
  salto: 450,
}
const HASTA_EL_SALTO = TIEMPOS.telon + TIEMPOS.trazo + TIEMPOS.relleno + TIEMPOS.pausa

export const prefiereQuieto = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Una vez por sesion.
 *
 * sessionStorage y no localStorage a proposito: recargar mientras trabajas
 * entra directo, pero mañana vuelve a verse entera. Es la semantica de «abrir
 * la aplicacion», que es justo lo que la intro celebra.
 */
const MARCA_SESION = 'dak-intro-vista'
export const tocaIntro = () => {
  if (prefiereQuieto()) return false
  try {
    return window.sessionStorage.getItem(MARCA_SESION) !== '1'
  } catch {
    // Modo incognito con almacenamiento bloqueado: se ve la intro y ya esta.
    return true
  }
}
const marcarVista = () => {
  try { window.sessionStorage.setItem(MARCA_SESION, '1') } catch { /* da igual */ }
}

/**
 * El wordmark, en un solo sitio.
 *
 * Los mismos puntos alimentan el relleno y el contorno, asi que no hay dos
 * copias del logo que se puedan desincronizar. Salen tal cual de
 * `src/assets/logo.svg`.
 */
const LETRAS = [
  {
    id: 'd',
    contornos: ['521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61'],
  },
  {
    id: 'a',
    morada: true,
    contornos: [
      '698.28 275.48 622.19 55.94 470.31 420.36 645.56 420.36 698.28 275.48',
      '650.75 .44 826 .44 971.2 420.36 795.95 420.36 650.75 .44',
    ],
  },
  {
    id: 'k',
    contornos: [
      '1462 123.47 1327.27 258.2 1210.27 375.19 1165.1 420.36 1022.71 420.36 1022.71 .44 1165.1 .44 1165.1 219 1361.34 22.75 1462 123.47',
      '1418.91 278.02 1418.91 420.36 1257.53 385.44 1374.58 268.39 1418.91 278.02',
    ],
  },
]

/** "x y x y ..." → "M x,y L x,y ... Z". Los `points` de un polygon, como path. */
const aTrazado = (puntos) => {
  const n = puntos.trim().split(/[\s,]+/).map(Number)
  const pares = []
  for (let i = 0; i < n.length; i += 2) pares.push(`${n[i]},${n[i + 1]}`)
  return `M${pares[0]}L${pares.slice(1).join('L')}Z`
}

export default function Intro({ datosListos, onTerminada }) {
  const [fase, setFase] = useState('telon')
  const capaRef = useRef(null)
  const marcaRef = useRef(null)
  const dRef = useRef(null)

  // El dibujado va por la Web Animations API y no por CSS.
  //
  // Con CSS no funcionaba, y la causa merece quedar escrita: stroke-dashoffset
  // es a la vez atributo de presentacion SVG y propiedad CSS, y el navegador no
  // resolvia las reglas por fase de forma fiable — el contorno se quedaba en su
  // valor inicial hasta el ultimo tramo. Ademas `pathLength` solo funciona en
  // <path>, no en <polygon>, asi que el dasharray se interpretaba en pixeles y
  // el trazo salia punteado en vez de oculto.
  //
  // Aqui se mide el perimetro real con getTotalLength() y se anima a mano. Es
  // mas codigo, pero es determinista y se puede comprobar.
  useEffect(() => {
    const marca = marcaRef.current
    if (!marca) return

    const trazos = [...marca.querySelectorAll('.intro__trazo')]
    const rellenos = [...marca.querySelectorAll('.intro__letra')].map((letra) => [
      ...letra.querySelectorAll('.intro__relleno'),
    ])
    const retrasoDe = (nodo) => {
      const letra = nodo.closest('.intro__letra')
      return letra?.classList.contains('intro__letra--a') ? 140
        : letra?.classList.contains('intro__letra--k') ? 280 : 0
    }

    const vivas = []
    for (const trazo of trazos) {
      const largo = trazo.getTotalLength()
      trazo.style.strokeDasharray = `${largo}`
      trazo.style.strokeDashoffset = `${largo}`
      vivas.push(trazo.animate(
        [{ strokeDashoffset: largo }, { strokeDashoffset: 0 }],
        { duration: 420, delay: TIEMPOS.telon + retrasoDe(trazo), easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' },
      ))
    }
    rellenos.flat().forEach((relleno) => {
      vivas.push(relleno.animate(
        [{ fillOpacity: 0 }, { fillOpacity: 1 }],
        { duration: TIEMPOS.relleno, delay: TIEMPOS.telon + TIEMPOS.trazo + retrasoDe(relleno) / 2, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' },
      ))
    })

    return () => vivas.forEach((a) => a.cancel())
  }, [])

  // Encadenado de fases. La unica que espera a algo es el salto: si los datos
  // todavia no estan, la intro AGUANTA en el logo en vez de cortar a un
  // esqueleto vacio. Un logo quieto medio segundo se lee como intencion; un
  // esqueleto parpadeando, como que algo va mal.
  useEffect(() => {
    const relojes = []
    relojes.push(setTimeout(() => setFase('dibujando'), TIEMPOS.telon))
    relojes.push(setTimeout(() => setFase('rellenando'), TIEMPOS.telon + TIEMPOS.trazo))
    relojes.push(setTimeout(() => setFase('esperando'), HASTA_EL_SALTO))
    return () => relojes.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (fase === 'esperando' && datosListos) setFase('saltando')
  }, [fase, datosListos])

  // El FLIP. useLayoutEffect y no useEffect: hay que medir y aplicar la
  // transformacion antes de que el navegador pinte, o se ve un fotograma con la
  // marca en el sitio equivocado.
  useLayoutEffect(() => {
    if (fase !== 'saltando') return

    const marca = marcaRef.current
    const glifoD = dRef.current
    const destino = document.querySelector('.brand__mark')
    if (!marca || !glifoD || !destino) {
      onTerminada()
      return
    }

    const desde = glifoD.getBoundingClientRect()
    const hasta = destino.getBoundingClientRect()
    const caja = marca.getBoundingClientRect()
    if (!desde.width || !hasta.width) {
      onTerminada()
      return
    }

    const escala = hasta.width / desde.width
    // El origen de la transformacion es la esquina de la D, no la del wordmark:
    // asi la D se queda quieta como ancla y son la A y la K las que se van.
    marca.style.transformOrigin = `${desde.left - caja.left}px ${desde.top - caja.top}px`
    marca.style.transform = `translate(${hasta.left - desde.left}px, ${hasta.top - desde.top}px) scale(${escala})`

    const reloj = setTimeout(() => {
      marcarVista()
      onTerminada()
    }, TIEMPOS.salto)
    return () => clearTimeout(reloj)
  }, [fase, onTerminada])

  return (
    <div aria-hidden="true" className={`intro intro--${fase}`} ref={capaRef}>
      <div className="intro__marca" ref={marcaRef}>
        <svg viewBox="0 0 1462 420.36" xmlns="http://www.w3.org/2000/svg">
          {LETRAS.map(({ id, morada, contornos }) => (
            <g className={`intro__letra intro__letra--${id}`} key={id} ref={id === 'd' ? dRef : undefined}>
              {contornos.map((puntos, n) => (
                <polygon
                  className={`intro__relleno ${morada ? 'intro__relleno--morado' : ''}`}
                  key={`relleno-${n}`}
                  points={puntos}
                />
              ))}
              {contornos.map((puntos, n) => (
                // <path> y no <polygon>: pathLength solo funciona en path. Con
                // polygon, Chrome interpreta el dasharray en unidades de usuario
                // y el contorno sale punteado en vez de dibujarse.
                <path className="intro__trazo" d={aTrazado(puntos)} key={`trazo-${n}`} pathLength="1" />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
