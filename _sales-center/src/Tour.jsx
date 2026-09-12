import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * El tour de entrada.
 *
 * Para quien no es tecnico, lo que falta no es saber que es cada pantalla: es
 * saber QUE SE ESPERA DE ELLA. Por eso esto no recorre el panel vista por vista
 * —seria un indice, no una explicacion— sino que cuenta una sola cosa: lee los
 * mensajes que ya estan escritos, di si valen, y mandalos. Todo lo demas del
 * panel es contexto, y el contexto se mira cuando hay curiosidad, no el primer
 * dia.
 *
 * Va anclado a los elementos DE VERDAD, con un foco que viaja de uno a otro. Un
 * carrusel de pantallazos se entiende mientras se mira y se olvida al cerrarlo,
 * porque no enseña donde estan las cosas; esto deja el dedo puesto encima.
 *
 * Se puede saltar desde el primer paso y desde todos los demas. Un tutorial del
 * que no se puede salir se vuelve un obstaculo a la segunda vez que lo ves.
 */

const VISTO = 'dak-tour-visto'

export const tocaTour = () => {
  try { return window.localStorage.getItem(VISTO) !== '1' } catch { return false }
}

const marcarVisto = () => {
  try { window.localStorage.setItem(VISTO, '1') } catch { /* modo privado: se volvera a ver, y no pasa nada */ }
}

/**
 * Cada paso puede dar varias anclas. Se usa la primera que exista de verdad en
 * pantalla, y si no hay ninguna la tarjeta se queda centrada explicando lo mismo.
 * Esto no es defensivo por si acaso: en movil la ficha no esta montada mientras
 * miras la lista, y con la bandeja vacia no hay ni cola a la que apuntar. El
 * paso tiene que seguir enseñando aunque no haya a que señalar.
 */
const PASOS = [
  {
    id: 'bienvenida',
    titulo: 'Hola. Esto es lo que se hace aquí.',
    texto: 'Te lo enseño en un minuto. Lo primero, para que estés tranquila: desde este panel no le sale un mensaje a nadie sin que tú lo decidas.',
    avanzar: 'Enséñame',
  },
  {
    id: 'rail',
    vista: 'hoy',
    anclas: ['[data-tour="rail"]'],
    titulo: 'Todo el panel son estas cinco',
    texto: 'La que vas a usar casi siempre es la segunda, Hoy. Las otras están para mirar cuando tengas curiosidad.',
  },
  {
    id: 'hoy',
    vista: 'hoy',
    anclas: ['[data-grupo="aprobar"]', '[data-grupo="enviar"]', '.work-queue'],
    titulo: 'Hoy es tu lista del día',
    texto: 'Estos mensajes ya están escritos. Tu trabajo es leerlos y decir si salen así o no. Si algún día la lista está vacía, no hay nada pendiente.',
  },
  {
    id: 'decidir',
    vista: 'hoy',
    anclas: ['[data-tour="decidir"]', '[data-grupo="aprobar"]'],
    titulo: 'Aprobar no envía nada',
    texto: 'Aprobar solo significa «este mensaje está bien». Rechazar lo saca de la lista. Ninguno de los dos escribe al cliente.',
  },
  {
    id: 'enviar',
    vista: 'hoy',
    anclas: ['[data-tour="enviar"]', '[data-grupo="enviar"]'],
    titulo: 'Aquí sí se manda',
    texto: 'Lo que apruebas pasa a «Por enviar». El botón te abre WhatsApp con el mensaje ya escrito: tú lo lees una última vez y le das a enviar.',
  },
  {
    id: 'fin',
    titulo: 'Ya está',
    texto: 'Aprobar, y después enviar. Eso es todo lo que hay que hacer. Si te pierdes, en «Cómo funciona» puedes volver a ver esto cuando quieras.',
    avanzar: 'Entendido',
  },
]

const MARGEN = 14
const HUECO = 10

export default function Tour({ alSalir, irAVista }) {
  const [n, setN] = useState(0)
  const [caja, setCaja] = useState(null)
  const tarjeta = useRef(null)
  const [sitio, setSitio] = useState({ top: 0, left: 0, listo: false })

  const paso = PASOS[n]
  const ultimo = n === PASOS.length - 1

  const cerrar = useCallback(() => { marcarVisto(); alSalir() }, [alSalir])

  // Cambiar de vista antes de buscar el ancla, o se mediria un elemento de la
  // pantalla anterior justo antes de que desaparezca.
  useEffect(() => {
    if (paso.vista) irAVista(paso.vista)
  }, [irAVista, paso.vista])

  // Vale la primera que EXISTA Y SE VEA, no la primera que exista. En movil la
  // ficha esta montada pero oculta, asi que sus elementos aparecen en el DOM
  // midiendo 0x0: se elegia esa, no se podia medir, y el paso se quedaba sin
  // señalar nada teniendo un ancla de repuesto perfectamente visible detras.
  const buscarAncla = useCallback(() => {
    if (!paso.anclas) return null
    for (const selector of paso.anclas) {
      const el = document.querySelector(selector)
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) return el
    }
    return null
  }, [paso])

  const medir = useCallback(() => {
    const el = buscarAncla()
    if (!el) { setCaja(null); return }
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) { setCaja(null); return }
    // Sin recortar a los margenes. Un ancla pegada al borde —el rail lo esta—
    // acababa con el foco 14px adentro, mordiendole un trozo a lo que señala.
    // El velo es una sombra enorme: que la caja se salga por un lado no deja
    // ningun hueco por el que se vea la pantalla.
    // El alto se recorta. Una columna de lista puede medir mas que la pantalla,
    // y entonces el foco no señala nada: ilumina todo y no deja sitio ni para la
    // tarjeta, que acaba encima. Enseñar donde EMPIEZA la lista dice lo mismo y
    // deja respirar; que siga hacia abajo se entiende solo.
    const techo = Math.max(160, window.innerHeight * 0.5)
    setCaja({
      top: r.top - HUECO,
      left: r.left - HUECO,
      width: r.width + HUECO * 2,
      height: Math.min(r.height + HUECO * 2, techo),
    })
  }, [buscarAncla])

  // La vista tarda un poco en montar tras el cambio: se mide al llegar y otra
  // vez cuando ya ha entrado, en vez de adivinar un solo instante bueno.
  useEffect(() => {
    setCaja(null)
    setSitio((s) => ({ ...s, listo: false }))

    // Traer el ancla a la vista ANTES de medirla. El paso del boton de WhatsApp
    // apuntaba a algo que estaba 300px por debajo del borde: el foco se dibujaba
    // fuera de la pantalla y lo unico que se veia era la penumbra y una tarjeta
    // hablando de un boton invisible. Se desplaza de golpe y no suave: el foco
    // ya viaja, y dos movimientos a la vez marean.
    const traer = () => {
      const el = buscarAncla()
      if (!el) return
      const r = el.getBoundingClientRect()
      const fuera = r.top < 0 || r.bottom > window.innerHeight
      if (fuera) el.scrollIntoView({ block: 'center', behavior: 'auto' })
    }
    const relojes = [
      setTimeout(traer, 60),
      setTimeout(traer, 380),
      ...[0, 120, 420, 700, 820].map((ms) => setTimeout(medir, ms)),
    ]
    return () => relojes.forEach(clearTimeout)
  }, [buscarAncla, medir])

  useEffect(() => {
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [medir])

  // Donde va la tarjeta.
  //
  // Debajo del foco, encima si no cabe, y AL LADO si tampoco cabe. Ese tercer
  // caso no es un adorno: la columna de «Por aprobar» ocupa casi todo el alto de
  // la pantalla, asi que arriba y abajo no queda sitio y la tarjeta terminaba
  // plantada encima de lo que estaba señalando. Al lado sobra espacio, porque un
  // elemento alto suele ser estrecho.
  const colocar = useCallback(() => {
    const t = tarjeta.current
    if (!t) return
    const { width: ancho, height: alto } = t.getBoundingClientRect()
    if (!ancho || !alto) return

    const centrado = () => ({
      top: Math.max(MARGEN, (window.innerHeight - alto) / 2),
      left: Math.max(MARGEN, (window.innerWidth - ancho) / 2),
      listo: true,
    })
    if (!caja) { setSitio(centrado()); return }

    const alto_ = window.innerHeight
    const anchoV = window.innerWidth
    const derecha = caja.left + caja.width
    const abajo = caja.top + caja.height
    const pegar = (v, max) => Math.min(Math.max(MARGEN, v), Math.max(MARGEN, max))

    // Centrada sobre el foco en el eje que no manda, y recortada a la pantalla.
    const xSobreElFoco = pegar(caja.left + caja.width / 2 - ancho / 2, anchoV - ancho - MARGEN)
    const ySobreElFoco = pegar(caja.top + caja.height / 2 - alto / 2, alto_ - alto - MARGEN)

    if (abajo + 12 + alto + MARGEN <= alto_) {
      setSitio({ top: abajo + 12, left: xSobreElFoco, listo: true }); return
    }
    if (caja.top - 12 - alto >= MARGEN) {
      setSitio({ top: caja.top - 12 - alto, left: xSobreElFoco, listo: true }); return
    }
    if (derecha + 12 + ancho + MARGEN <= anchoV) {
      setSitio({ top: ySobreElFoco, left: derecha + 12, listo: true }); return
    }
    if (caja.left - 12 - ancho >= MARGEN) {
      setSitio({ top: ySobreElFoco, left: caja.left - 12 - ancho, listo: true }); return
    }

    // No cabe en ningun lado —pantalla pequeña, foco grande—: se va al borde
    // donde menos tape, que es el contrario al centro del foco.
    const centroY = caja.top + caja.height / 2
    setSitio({
      top: centroY > alto_ / 2 ? MARGEN : Math.max(MARGEN, alto_ - alto - MARGEN),
      left: xSobreElFoco,
      listo: true,
    })
  }, [caja])

  useLayoutEffect(() => { colocar() }, [colocar, n])

  // La tarjeta se vigila a si misma. La primera colocacion llegaba a medirla
  // antes de que se le aplicara su propio CSS —360px de ancho, esquinas, relleno—
  // y entonces media lo que mide un div suelto: todo el ancho de la pantalla. Se
  // quedaba pegada arriba a la izquierda. Tambien cubre el texto que reflue al
  // cargar la tipografia y los pasos con mas letra que otros.
  useLayoutEffect(() => {
    const t = tarjeta.current
    if (!t) return undefined
    const vigia = new ResizeObserver(colocar)
    vigia.observe(t)
    return () => vigia.disconnect()
  }, [colocar])

  useEffect(() => {
    window.addEventListener('resize', colocar)
    return () => window.removeEventListener('resize', colocar)
  }, [colocar])

  useEffect(() => {
    const alTeclado = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar() }
      if (e.key === 'ArrowRight') { e.preventDefault(); ultimo ? cerrar() : setN((v) => v + 1) }
      if (e.key === 'ArrowLeft' && n > 0) { e.preventDefault(); setN((v) => v - 1) }
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cerrar, n, ultimo])

  return (
    <div aria-label="Guía rápida del panel" className="tour" role="dialog">
      {/* Un solo elemento hace de velo y de foco a la vez: el agujero es su
          propia caja y la penumbra es su sombra. Asi lo que viaja entre pasos es
          UNA cosa —se ve a donde va la atencion— en vez de apagarse aqui y
          encenderse alla. Se traga los clics a proposito: durante la guia lo
          unico que se puede tocar son sus botones. */}
      <div className={`tour-foco ${caja ? '' : 'tour-foco--sinAncla'}`} style={caja ?? undefined} />

      {/* Una key por paso: la tarjeta se vuelve a montar, y con eso repite su
          entrada ya en el sitio nuevo en vez de deslizarse hasta el. */}
      <div
        className={`tour-tarjeta ${sitio.listo ? 'is-puesta' : ''}`}
        key={n}
        ref={tarjeta}
        style={{ top: sitio.top, left: sitio.left }}
      >
        <p className="tour-cuenta">{n + 1} de {PASOS.length}</p>
        <h2>{paso.titulo}</h2>
        <p className="tour-texto">{paso.texto}</p>

        <div className="tour-botones">
          <button className="tour-boton tour-boton--principal" onClick={() => (ultimo ? cerrar() : setN((v) => v + 1))} type="button">
            {paso.avanzar ?? 'Siguiente'}
          </button>
          {n > 0 && !ultimo && (
            <button className="tour-boton" onClick={() => setN((v) => v - 1)} type="button">Atrás</button>
          )}
          {!ultimo && (
            <button className="tour-boton tour-boton--salir" onClick={cerrar} type="button">Saltar</button>
          )}
        </div>

        <div aria-hidden="true" className="tour-puntos">
          {PASOS.map((p, i) => <i className={i === n ? 'is-aqui' : ''} key={p.id} />)}
        </div>
      </div>
    </div>
  )
}
