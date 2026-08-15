/**
 * La geometría de la marca DAK, como números.
 *
 * Son los mismos polígonos de src/assets/logo-nav.svg, pero aquí en crudo para
 * que el campo de flujo pueda usarlos como obstáculo.
 *
 * ─── POR QUÉ NO SE RASTERIZA EL SVG ───────────────────────────────────────
 *
 * Lo obvio sería cargar el SVG en una <img> y pintarlo en un canvas para leer
 * su alfa. Eso obliga a un Blob, una carga asíncrona y un primer fotograma sin
 * máscara. Con los puntos en JavaScript se construye un Path2D y se rellena de
 * una vez, en el mismo tick: sin red, sin espera y sin depender de cómo el
 * navegador escale el SVG.
 *
 * ─── SI EL LOGO CAMBIA ────────────────────────────────────────────────────
 *
 * Se vuelven a copiar los `points` de logo-nav.svg y se ajusta CAJA. Nada más
 * depende de estas coordenadas.
 */

/** El encuadre de las letras, sin el margen del SVG original. */
export const CAJA = { ancho: 1462, alto: 420.36 }

/** Los cinco polígonos que forman la marca, en coordenadas de CAJA. */
export const FORMAS = [
  // D
  [521.16, 123.61, 398.75, 420.36, 49.35, 420.36, 49.87, 419.85, 0, 419.85,
    76.23, 236.93, 200.97, 236.93, 174.41, 300.63, 316.74, 300.63, 391.92, 119.75,
    133.8, 119.75, 26.6, 0, 441.69, 0, 521.16, 123.61],
  // A — lado izquierdo
  [698.28, 275.48, 622.19, 55.94, 470.31, 420.36, 645.56, 420.36, 698.28, 275.48],
  // A — lado derecho
  [650.75, 0.44, 826, 0.44, 971.2, 420.36, 795.95, 420.36, 650.75, 0.44],
  // K — cuerpo
  [1462, 123.47, 1327.27, 258.2, 1210.27, 375.19, 1165.1, 420.36, 1022.71, 420.36,
    1022.71, 0.44, 1165.1, 0.44, 1165.1, 219, 1361.34, 22.75, 1462, 123.47],
  // K — cuña inferior
  [1418.91, 278.02, 1418.91, 420.36, 1257.53, 385.44, 1374.58, 268.39, 1418.91, 278.02],
]

/**
 * Dibuja la marca en un contexto 2D, escalada y centrada dentro de `destino`.
 * Devuelve la caja que ocupó, que el campo necesita para saber dónde está el
 * obstáculo.
 */
export const trazarMarca = (ctx, destino) => {
  const escala = Math.min(destino.ancho / CAJA.ancho, destino.alto / CAJA.alto)
  const w = CAJA.ancho * escala
  const h = CAJA.alto * escala
  const x = destino.x + (destino.ancho - w) / 2
  const y = destino.y + (destino.alto - h) / 2

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(escala, escala)
  ctx.beginPath()
  for (const puntos of FORMAS) {
    ctx.moveTo(puntos[0], puntos[1])
    for (let i = 2; i < puntos.length; i += 2) ctx.lineTo(puntos[i], puntos[i + 1])
    ctx.closePath()
  }
  ctx.fill()
  ctx.restore()

  return { x, y, ancho: w, alto: h }
}
