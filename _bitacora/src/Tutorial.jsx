import { useState } from 'react'
import { api } from './api.js'
import { Boton, Contador } from './ui.jsx'

/**
 * La guía de entrada, una por concha.
 *
 * Va montada como la COLA DE ARRANQUE de una bobina: la cuenta atrás con su
 * círculo y su cruz que precede a cualquier proyección. Es nativa de este mundo
 * —no un patrón de onboarding traído de fuera— y es exactamente lo que va antes
 * de que empiece la película, que es lo que esta guía hace.
 *
 * Dos salidas, y significan cosas distintas a propósito:
 *
 *   · «Saltar» es AHORA NO. No escribe nada; la guía vuelve mañana.
 *   · La casilla es NUNCA MÁS. Escribe en el servidor, así que vale también
 *     desde otro teléfono.
 *
 * Confundir las dos es como se pierde una guía que alguien quería volver a ver.
 */

const GUIAS = {
  audiovisual: {
    titulo: 'Cómo funciona',
    pasos: [
      {
        titulo: 'Una vez al día',
        texto:
          'Entras al terminar tu jornada. Durante el día no tienes que tocar nada: la app no te va a pedir horas ni porcentajes.',
      },
      {
        titulo: 'Ya sabe dónde quedaste',
        texto:
          'No escribes de cero. Cada pieza llega con lo que dijiste ayer, y tú solo confirmas. Escribir es la excepción, no la regla.',
      },
      {
        titulo: 'Marcas con un gesto',
        texto:
          'Una pieza por pantalla y cinco marcas. Ojo con una: «Terminé mi parte» la manda a revisión — darla por cerrada le toca a otra persona, no a ti.',
      },
      {
        titulo: 'Y te llevas el informe',
        texto:
          'Al final anotas lo demás que hiciste y copias el informe para WhatsApp. Si un día olvidas cerrar, no se pierde nada: la próxima vez la app te pregunta.',
      },
    ],
  },
  admin: {
    titulo: 'Cómo leer la mesa',
    pasos: [
      {
        titulo: 'Nada de esto está inventado',
        texto:
          'Todo lo que ves sale de lo que Fabián marcó. Cuando falta un dato, la pantalla dice «sin dato» en vez de rellenarlo con un cero.',
      },
      {
        titulo: '«Te espera a ti» es tu deuda',
        texto:
          'Lo que está en revisión no avanza hasta que apruebas o pides cambios, y verás cuántos días lleva parado. Ese panel mide tu tiempo de respuesta, no el suyo.',
      },
      {
        titulo: 'Puedes ver su pantalla',
        texto:
          '«Ver su pantalla» es un espejo de solo lectura: ves exactamente lo que él tiene delante ahora mismo, y no puedes tocar nada. Su historial no se ensucia con acciones que él no hizo.',
      },
      {
        titulo: 'Los días sin cierre se dicen',
        texto:
          'Si olvidó cerrar un día, la mesa te dice qué día fue y desde cuándo no hay señal. Nunca se da una tarea por terminada ni por abandonada sola.',
      },
    ],
  },
}

export default function Tutorial({ rol, alTerminar }) {
  const guia = GUIAS[rol] || GUIAS.audiovisual
  const [i, setI] = useState(0)
  const [nuncaMas, setNuncaMas] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  const ultimo = i === guia.pasos.length - 1
  const paso = guia.pasos[i]

  const salir = async () => {
    setSaliendo(true)
    // Solo se marca si pidió no volver a verlo. Saltar no escribe nada.
    if (nuncaMas) {
      try {
        await api.tutorialVisto()
      } catch {
        // Que no se pueda guardar la preferencia no puede dejar a nadie
        // encerrado en la guía: se cierra igual y volverá a salir mañana.
      }
    }
    alTerminar()
  }

  return (
    <div className="guia campo-naranja" role="dialog" aria-modal="true" aria-label={guia.titulo}>
      <Contador total={guia.pasos.length} actual={i} />

      <div className="hoja__cuerpo">
        <article className="fotograma tinta guia__hoja">
          {/* La cuenta atrás de la cola de arranque: círculo, cruz y número. */}
          <span className="cuenta" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" />
              <circle cx="50" cy="50" r="30" />
              <path d="M50 0v100M0 50h100" />
            </svg>
            <b className="cifra">{guia.pasos.length - i}</b>
          </span>

          <h1 className="fotograma__titulo">{paso.titulo}</h1>
          <p className="ventana guia__texto">{paso.texto}</p>
        </article>
      </div>

      <label className="casilla">
        <input
          type="checkbox"
          checked={nuncaMas}
          onChange={(e) => setNuncaMas(e.target.checked)}
        />
        <span className="casilla__caja" aria-hidden="true" />
        <span>No volver a mostrarlo</span>
      </label>

      <div className="acciones acciones--linea">
        <Boton onClick={salir} disabled={saliendo}>
          {nuncaMas ? 'Cerrar' : 'Saltar'}
        </Boton>
        <Boton
          variante="principal"
          disabled={saliendo}
          onClick={() => (ultimo ? salir() : setI(i + 1))}
        >
          {ultimo ? 'Empezar' : 'Siguiente'}
        </Boton>
      </div>
    </div>
  )
}
