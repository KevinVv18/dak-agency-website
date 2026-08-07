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
