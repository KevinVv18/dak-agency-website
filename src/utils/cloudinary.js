/**
 * Cloudinary: construcción de URLs con transformación.
 *
 * Vivía dentro de Services.jsx, que era el único que lo usaba. Se saca aquí
 * porque la fotografía también va a servirse desde Cloudinary y no tiene
 * sentido duplicarlo.
 *
 * Por qué Cloudinary y no el repo: los originales de sesión pesan entre 500 KB
 * y 2,7 MB. Metidos al repo engordan el bundle, el deploy y el rsync, y no hay
 * forma de servir una variante distinta por viewport. Desde Cloudinary el repo
 * no crece un byte y cada pantalla recibe su tamaño.
 */
const CLOUD_NAME = 'dm4ijuzmi'
const BASE_IMAGEN = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

/**
 * Transformaciones que se aplican siempre:
 *   f_auto    mejor formato según el navegador (AVIF, WebP…)
 *   q_auto    calidad decidida por contenido
 *   c_limit   SOLO reduce si el original es mayor que w; nunca amplía
 */
const TRANSFORMACION = (w) => `f_auto,q_auto,c_limit,w_${w}`

/** Reescribe una URL completa de Cloudinary (vídeo o imagen) añadiendo el ancho. */
export const cld = (url, w) => {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${TRANSFORMACION(w)}/`)
}

/**
 * URL de un vídeo al ancho y la calidad que toca.
 *
 * En móvil el reproductor mide 319px, así que w_640 cubre exacto una pantalla
 * de densidad 2; se pedía w_900. Y `q_auto:eco` baja otro 15% sin que se note
 * a ese tamaño: el vídeo va detrás de un degradado y a un tercio de pantalla.
 * Medido sobre los tres verticales: 1.594-1.701 KB el archivo entero a w_900,
 * 1.082-1.222 KB así.
 *
 * En escritorio se queda la calidad normal, que ahí el vídeo ocupa media
 * pantalla y sí se mira de cerca.
 */
export const videoUrl = (url, w, eco = false) => {
  if (!url || !url.includes('/upload/')) return url
  const q = eco ? 'q_auto:eco' : 'q_auto'
  return url.replace('/upload/', `/upload/f_auto,${q},c_limit,w_${w}/`)
}

/**
 * Fotograma de portada de un vídeo, generado por Cloudinary con so_0 (segundo 0).
 * Pesa unos 36 KB frente a los megas del vídeo y evita el rectángulo negro
 * mientras este decodifica.
 */
export const cldPoster = (url, w) => {
  if (!url || !url.includes('/upload/')) return undefined
  return url
    .replace('/upload/', `/upload/${TRANSFORMACION(w)},so_0/`)
    .replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg')
}

/**
 * URL de una foto a partir de su identificador dentro de la carpeta del sitio.
 *
 *   fotoUrl('oasis-dental-01', 900)
 *   → https://res.cloudinary.com/dm4ijuzmi/image/upload/f_auto,q_auto,c_limit,w_900/dak/estudio/oasis-dental-01
 *
 * No lleva extensión a propósito: con f_auto, Cloudinary sirve el formato que
 * mejor soporte el navegador, sea cual sea el que se subió.
 */
export const CARPETA_ESTUDIO = 'dak/estudio'

export const fotoUrl = (publicId, w) =>
  `${BASE_IMAGEN}/${TRANSFORMACION(w)}/${CARPETA_ESTUDIO}/${publicId}`

/**
 * Los anchos que se ofrecen en el srcset del Estudio.
 *
 * La rejilla pinta a una columna en móvil (~343px) y a tres en escritorio
 * (~290px), así que en una pantalla de densidad 2 el peor caso pide 686. Pedir
 * 900 a todo el mundo —como se hacía— significaba mandar el doble de píxeles a
 * un teléfono de densidad 1, y en la portada eso eran cientos de KB.
 *
 * c_limit no amplía, así que un ancho mayor que el original no gasta de más:
 * Cloudinary devuelve el original y el navegador lo escala.
 */
const ANCHOS_FOTO = [400, 700, 1000, 1400]

/**
 * srcset + sizes de una foto del Estudio, para que el navegador pida el ancho
 * que de verdad necesita según su pantalla.
 *
 * `medida` describe el ancho al que se pinta en CSS. Si no coincide con la
 * realidad el navegador elige mal, así que hay que actualizarla si cambia la
 * rejilla.
 */
export const fotoFuentes = (publicId, medida) => ({
  srcSet: ANCHOS_FOTO.map((w) => `${fotoUrl(publicId, w)} ${w}w`).join(', '),
  sizes: medida,
})
