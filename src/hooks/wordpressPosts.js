/**
 * Una sola peticion al REST de WordPress por carga de pagina.
 *
 * Antes salian dos para los mismos posts: `?per_page=6` desde useAnnouncements
 * (campanita y ticker) y `?per_page=4&_embed` desde useWordPressPosts (seccion
 * de blog). Dos viajes al mismo sitio y dos formas de fallar cuando el blog no
 * responde.
 *
 * La respuesta con `_embed` es un superconjunto de la otra —trae ademas imagen
 * destacada, categorias y autor—, asi que una peticion sirve a los dos. Aqui
 * vive el fetch y su cache; cada hook se queda con lo que necesita.
 */
const API = 'https://dakagency.net/blog/wp-json/wp/v2/posts?per_page=6&_embed'

let cache = null
let inflight = null

/**
 * Devuelve el array crudo de posts, o null si el blog no responde.
 *
 * Solo se cachea un resultado bueno: si falla, el siguiente montaje reintenta
 * en vez de quedarse con el fallo pegado para toda la sesion.
 */
export function loadPosts() {
  if (cache) return Promise.resolve(cache)
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) return null
      const posts = await res.json()
      if (!Array.isArray(posts)) return null
      cache = posts
      return posts
    } catch {
      return null
    } finally {
      inflight = null
    }
  })()

  return inflight
}
