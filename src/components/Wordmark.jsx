import React from 'react'

/**
 * El wordmark de DAK, insertado en el documento en vez de servido como <img>.
 *
 * ─── POR QUÉ INLINE ───────────────────────────────────────────────────────
 *
 * Antes era `<img src={logoSvg}>`, o sea una FOTO de la marca: el CSS no puede
 * entrar dentro de una imagen. Insertándolo se puede trazar, rellenar y
 * texturizar por partes — y cuesta 0 KB de red, porque el archivo son 2,7 KB y
 * encima se ahorra una petición.
 *
 * Los 11 polígonos vienen tal cual de src/assets/logo-nav.svg. Si el logo
 * cambia, se vuelven a copiar de ahí: este archivo no es la fuente de verdad
 * del dibujo, solo del comportamiento.
 *
 * ─── CÓMO ESTÁ DESPIEZADO ─────────────────────────────────────────────────
 *
 *   D  relleno negro + contorno blanco (12) + contorno negro interior (6)
 *   A  dos polígonos morados macizos, sin contorno
 *   K  dos rellenos negros + sus dos pares de contornos
 *
 * Eso permite la secuencia: primero se dibuja el contorno de la D, luego el de
 * la K, después entran los rellenos y al final aterriza la A morada. La marca
 * se construye delante del visitante en vez de aparecer ya hecha — que para
 * una agencia de branding es el argumento, no un adorno.
 *
 * ─── pathLength ───────────────────────────────────────────────────────────
 *
 * Cada contorno lleva pathLength="1", que normaliza su perímetro real a 1. Así
 * el trazado se anima con `stroke-dasharray: 1` y `stroke-dashoffset: 1 → 0`
 * sin tener que medir a mano el contorno de cada letra, y sale exacto aunque
 * el logo cambie de forma.
 *
 * ─── LA TEXTURA ───────────────────────────────────────────────────────────
 *
 * El filtro `dak-tinta` desplaza los bordes con ruido Perlin: rompe la
 * perfección mecánica del vector y lo deja con el borde de una serigrafía. Va
 * ESTÁTICO a propósito — se rasteriza una vez y no cuesta nada por fotograma.
 * Animar un filtro SVG obliga a re-rasterizar en cada frame, y eso en un
 * Android de gama media es justo lo que no podemos permitirnos.
 */
const Wordmark = ({ className = '' }) => (
  <svg
    className={`wordmark ${className}`}
    viewBox="-8 -8 1478 436.36"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="DAK Agency"
    shapeRendering="geometricPrecision"
  >
    <defs>
      {/*
        baseFrequency alta y scale bajo = grano fino que raspa el borde.
        Con la frecuencia baja y el scale alto saldrían ondas grandes y el
        logo parecería roto, no impreso: es un dibujo geométrico y duro.
      */}
      <filter id="dak-tinta" x="-3%" y="-6%" width="106%" height="112%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.045"
          numOctaves="2"
          seed="7"
          result="ruido"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="ruido"
          scale="3.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>

    <g className="wm-tinta">
      {/* ── D ── */}
      <g className="wm-letra wm-d">
        <polygon
          className="wm-relleno"
          points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61"
        />
        <polygon
          className="wm-trazo wm-trazo--fuera"
          pathLength="1"
          points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61"
        />
        <polygon
          className="wm-trazo wm-trazo--dentro"
          pathLength="1"
          points="521.16 123.61 398.75 420.36 49.35 420.36 49.87 419.85 0 419.85 76.23 236.93 200.97 236.93 174.41 300.63 316.74 300.63 391.92 119.75 133.8 119.75 26.6 0 441.69 0 521.16 123.61"
        />
      </g>

      {/* ── A ── la única maciza, y la única en color */}
      <g className="wm-letra wm-a">
        <polygon className="wm-acento" points="698.28 275.48 622.19 55.94 470.31 420.36 645.56 420.36 698.28 275.48" />
        <polygon className="wm-acento" points="650.75 .44 826 .44 971.2 420.36 795.95 420.36 650.75 .44" />
      </g>

      {/* ── K ── */}
      <g className="wm-letra wm-k">
        <polygon
          className="wm-relleno"
          points="1462 123.47 1327.27 258.2 1210.27 375.19 1165.1 420.36 1022.71 420.36 1022.71 .44 1165.1 .44 1165.1 219 1361.34 22.75 1462 123.47"
        />
        <polygon className="wm-relleno" points="1418.91 278.02 1418.91 420.36 1257.53 385.44 1374.58 268.39 1418.91 278.02" />
        <polygon
          className="wm-trazo wm-trazo--fuera"
          pathLength="1"
          points="1462 123.47 1327.27 258.2 1210.27 375.19 1165.1 420.36 1022.71 420.36 1022.71 .44 1165.1 .44 1165.1 219 1361.34 22.75 1462 123.47"
        />
        <polygon className="wm-trazo wm-trazo--fuera" pathLength="1" points="1418.91 278.02 1418.91 420.36 1257.53 385.44 1374.58 268.39 1418.91 278.02" />
        <polygon
          className="wm-trazo wm-trazo--dentro"
          pathLength="1"
          points="1462 123.47 1327.27 258.2 1210.27 375.19 1165.1 420.36 1022.71 420.36 1022.71 .44 1165.1 .44 1165.1 219 1361.34 22.75 1462 123.47"
        />
        <polygon className="wm-trazo wm-trazo--dentro" pathLength="1" points="1418.91 278.02 1418.91 420.36 1257.53 385.44 1374.58 268.39 1418.91 278.02" />
      </g>
    </g>
  </svg>
)

export default Wordmark
