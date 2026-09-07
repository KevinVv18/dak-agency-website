import React from 'react'
import { srcDeSesion, fuentesDeSesion } from '../data/fotografia'

/**
 * El archivo del Estudio, montado sobre la misma hoja que el Taller.
 *
 * POR QUÉ NO ES `EstudioRejilla`
 * `EstudioRejilla.jsx:14-23` dice, con todas las letras, que vive aparte «para
 * que las dos se vean exactamente igual: si el tratamiento se duplicara en dos
 * componentes, acabarían divergiendo». Aquí divergen a propósito, y conviene
 * que quede escrito para que nadie lo tome por descuido:
 *
 *   · La portada enseña una selección de nueve como aperitivo, en columnas que
 *     respetan la forma de cada foto. Ahí el componente es un escaparate.
 *   · /gallery es el archivo entero, y su trabajo es que las 26 se vean de un
 *     vistazo y en la misma retícula que las 25 piezas del Taller. Dos lenguajes
 *     en una ruta harían que la mitad del archivo pareciera de otra página.
 *
 * Lo que sí se comparte es el DATO, no el tratamiento: `srcDeSesion` y
 * `fuentesDeSesion` de `src/data/fotografia.js`, dos funciones puras que no
 * tocan ni el DOM ni el CSS. Este componente no importa `Estudio.css`, así que
 * en /gallery esas 252 líneas ni siquiera se descargan.
 *
 * EL RECORTE
 * Las fotos van a `object-fit: cover` y las piezas del Taller a `contain`. No es
 * una inconsistencia: en una hoja de contactos el positivo de una foto se
 * recorta sin drama —el fotograma entero está en el visor—, mientras que una
 * pieza gráfica ES sus bordes; recortarla le corta el titular y el teléfono.
 */

const ArchivoEstudio = ({ sesiones, medida, alAbrir, alMirar, alDejarDeMirar }) => (
  <ul className="hoja hoja--estudio" onMouseLeave={alDejarDeMirar}>
    {sesiones.map((s, i) => (
      <li className="celda celda--estudio" key={s.id}>
        <button
          type="button"
          className="celda-boton"
          data-obra={`e-${s.id}`}
          onClick={() => alAbrir(i)}
          onMouseEnter={(e) => alMirar(s, e.currentTarget)}
          onFocus={(e) => alMirar(s, e.currentTarget)}
          onBlur={alDejarDeMirar}
          aria-label={`Ver la sesión de ${s.cliente || s.sector} a tamaño completo`}
        >
          <span className="celda-numero" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <img
            className="celda-img"
            src={srcDeSesion(s, 700)}
            {...fuentesDeSesion(s, medida)}
            alt=""
            width={s.w}
            height={s.h}
            loading="lazy"
            decoding="async"
          />
        </button>

        {/* La anotación del fotograma: el rubro, que es lo que cabe en una línea
            a 113px y lo que le dice algo al que busca su propio caso. El cliente
            se lee en la lupa y en el visor, igual que en el Taller. */}
        <p className="celda-nota">{s.sector}</p>
      </li>
    ))}
  </ul>
)

export default ArchivoEstudio
