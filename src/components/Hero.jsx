import React, { useEffect, useRef } from 'react'
import './Hero.css'
import { scrollToSection } from '../utils/scrollToSection'
import AnnouncementTicker from './AnnouncementTicker'

// Los doce clientes del banco inferior.
import logoBerseLine from '../assets/logos/logo-berse-line.svg'
import logoGO from '../assets/logos/logo-go.webp'
import logoJeny from '../assets/logos/LOGO BLANCO.svg'
import logoPardo from '../assets/logos/LOGO-MANUEL PARDO@4x-8.webp'
import logoProsadis from '../assets/logos/LOGO 1.svg'
import logoSpaKreativos from '../assets/logos/logo-spa-kreativos.svg'
import logoBHouse from '../assets/logos/Logo principal BHouse.webp'
import logoVault from '../assets/logos/logo-american-vault.svg'
import logoBumbum from '../assets/logos/logo-bumbum.webp'
import logoRosita from '../assets/logos/logo-cocina-rosita.webp'
import logoOasis from '../assets/logos/logo-oasis-dental.webp'
import logoUrbanPet from '../assets/logos/logo-urban-pet.webp'

/**
 * TÚNEL DE VIENTO
 *
 * THESIS — La marca no se dibuja: se revela como el obstáculo dentro de una
 * corriente. Rechaza el arreglo por defecto de la categoría, el wordmark
 * gigante centrado sobre negro con acento neón, que es lo que esta misma
 * página hacía antes.
 *
 * OWN-WORLD — Visualización de flujo: fondo #030106, miles de trazos de un
 * píxel, blanco donde la corriente va lenta, teal al acelerar y morado #B024FF
 * donde se estrecha al rodear la letra. Rótulos técnicos en versalitas
 * espaciadas. Ni cajas, ni marcos, ni degradados de superficie.
 *
 * STORY — El visitante ve un sistema calculándose en vivo, mueve el puntero y
 * la corriente se abre a su alrededor: entiende que esto no es una plantilla
 * ni un vídeo, y de ahí deduce el nivel técnico de quien lo hizo. Al desplazar,
 * el ensayo AVANZA: la marca se suelta y el flujo se ordena. La acción vive
 * abajo, sin protagonismo.
 *
 * FIRST VIEWPORT — El campo ocupa la pantalla entera. La marca aparece por
 * ausencia en la franja superior. Debajo, «- RUIDO» anclado a la izquierda
 * donde el flujo entra turbulento y «+ IMPACTO» a la derecha donde sale
 * laminar. Al pie, el raíl de seis clientes y una sola acción discreta.
 *
 * SECOND BEAT — El hero mide más de una pantalla y el lienzo queda fijo dentro.
 * Al desplazar, la marca se disuelve y la corriente pasa de turbulenta a
 * laminar. No es un efecto de salida: son los dos estados con nombre propio de
 * un flujo, que son literalmente ruido y orden. El lema deja de rotular y pasa
 * a ser la estructura del scroll. Todo lo lee una sola variable, --ensayo, que
 * el bucle del campo escribe una vez por fotograma.
 *
 * FORM — Túnel de viento, candidata 3 de la lista ordenada por resonancia.
 * Seed key a92eb373.
 *
 * FINISH — unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, and DESIGN.md.
 */
const Hero = () => {
  /* La deriva del banco se para fuera de pantalla, igual que el campo. Es una
     animación de compositor y cuesta poco, pero «poco» por tiempo indefinido en
     una pestaña de fondo sigue siendo batería que nadie está mirando. */
  const bancoRef = useRef(null)
  useEffect(() => {
    const nodo = bancoRef.current
    if (!nodo) return
    const pista = nodo.querySelector('.hero-banco-pista')
    if (!pista) return
    const observador = new IntersectionObserver(
      ([e]) => { pista.style.animationPlayState = e.isIntersecting ? 'running' : 'paused' },
      { threshold: 0 },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  /* Los doce clientes.
   *
   * `invertir` no es un gusto: son los logos cuya tinta es oscura, medida. Con
   * el gris de siempre quedaban por debajo de 50 de luminancia media sobre un
   * fondo casi negro — es decir, invisibles. Invertidos se leen y CONSERVAN su
   * estructura interna, que es lo que se pierde si se aplanan a silueta blanca:
   * probado, y así el escudo de Manuel Pardo o el círculo de Prosadis se
   * convertían en manchas macizas. Cada logo según su tinta. */
  const clientes = [
    { id: 1, src: logoBerseLine, alt: 'Berse Line', clase: 'logo-berse' },
    { id: 2, src: logoGO, alt: 'Gran Oportunidad GO!', clase: 'logo-go' },
    { id: 3, src: logoJeny, alt: 'Dra. Jenny', clase: 'logo-jeny' },
    { id: 4, src: logoPardo, alt: 'Colegio Manuel Pardo', clase: 'logo-pardo' },
    { id: 5, src: logoProsadis, alt: 'Clínica Prosadis', clase: 'logo-prosadis' },
    { id: 6, src: logoSpaKreativos, alt: 'Kreativos Salón & Spa', clase: 'logo-spa' },
    { id: 7, src: logoBHouse, alt: 'Beauty House', clase: 'logo-bhouse' },
    { id: 8, src: logoVault, alt: 'American Vault', clase: 'logo-vault invertir' },
    { id: 9, src: logoBumbum, alt: 'BumBum Globos y Flores', clase: 'logo-bumbum invertir' },
    { id: 10, src: logoRosita, alt: 'Cocina Rosita', clase: 'logo-rosita' },
    { id: 11, src: logoOasis, alt: 'Oasis Dental', clase: 'logo-oasis' },
    { id: 12, src: logoUrbanPet, alt: 'The Urban Pet', clase: 'logo-urban invertir' },
  ]

  return (
    <section className="hero" id="hero">
      {/* El campo no se monta aquí: vive en el envoltorio .tunel de Home.jsx,
          porque es también la superficie del titular que viene después. */}

      {/* La marca vive en el campo como hueco, así que no hay ningún texto que
          la nombre. Para quien navega con lector de pantalla eso sería una
          sección muda: este rótulo la nombra sin pintar nada. */}
      <span className="sr-only">DAK — Digital Acceleration Key</span>

      {/* La capa va fija sobre el campo durante todo el compás, por eso el
          ticker vive dentro y no suelto en la sección: si no, se iría por
          arriba en cuanto empezara a desplazarse. */}
      <div className="hero-capa">
        <AnnouncementTicker />

        {/* Los dos estados de un flujo tienen nombre propio en física:
            turbulento y laminar. Son, literalmente, ruido y orden. Por eso el
            lema no cuelga debajo del logo — rotula el fenómeno, anclado a la
            zona del campo que describe.

            Y como el ensayo va de uno al otro, entre ambos hay un eje medido de
            verdad: marcas finas y un índice que recorre la escala conforme la
            marca se suelta. El lema deja de ser una etiqueta y pasa a ser la
            lectura del aparato. */}
        <div className="hero-medida">
          {/* RUIDO como señal mal sintonizada: la palabra queda QUIETA y el
              ruido son dos copias fantasma desfasadas que se disipan conforme
              avanza el índice (ver Hero.css). Hubo una versión con cada letra
              desplazada por su cuenta; hacía lo que decía, pero rompía la
              simetría del par − RUIDO / + IMPACTO, y un diagrama vive de su
              equilibrio. El fantasma ensucia sin mover la caja. */}
          <p className="hero-rotulo hero-rotulo--ruido">
            <span className="hero-signo">−</span>
            <span className="hero-fantasma" data-t="RUIDO">RUIDO</span>
          </p>
          {/* El índice va dentro de un carro que mide todo el eje: así se
              desplaza con un transform en porcentaje de SU PROPIO ancho —que es
              el del eje— en vez de con `left`, que obligaría a recalcular la
              maquetación en cada fotograma del scroll.

              El tramo recorrido se pinta detrás. Un índice de tres píxeles
              sobre un eje de mil quinientos es invisible por mucho que brille;
              lo que hace legible el avance es la parte que ya se ha medido. */}
          <div className="hero-eje" aria-hidden="true">
            <span className="hero-eje-recorrido" />
            <span className="hero-eje-carro">
              <span className="hero-eje-indice" />
            </span>
          </div>
          <p className="hero-rotulo hero-rotulo--impacto">
            <span className="hero-signo">+</span>
            <span className="hero-crece">IMPACTO</span>
          </p>
        </div>

        <div className="hero-pie">
          {/* ── El banco de clientes ──
              Se apoyan en una regla con marcas —el mismo vocabulario que el eje
              del ensayo— en vez de flotar sobre el vacío, y derivan muy despacio
              como muestras pasando por el conducto. La pista lleva los doce DOS
              veces: el bucle recorre exactamente la mitad, así que al reiniciar
              cae en un punto idéntico y no se ve la costura. La segunda copia
              está oculta al lector de pantalla para no leer doce clientes dos
              veces. */}
          <div className="hero-banco" ref={bancoRef}>
            <ul className="hero-banco-pista">
              {clientes.map((c) => (
                <li key={c.id} className="hero-banco-item">
                  <img src={c.src} alt={c.alt} className={`logo-image ${c.clase}`} loading="lazy" />
                </li>
              ))}
              {clientes.map((c) => (
                <li key={`bis-${c.id}`} className="hero-banco-item" aria-hidden="true">
                  <img src={c.src} alt="" className={`logo-image ${c.clase}`} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#contact"
            className="hero-accion"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#contact')
            }}
          >
            Comenzar proyecto
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
