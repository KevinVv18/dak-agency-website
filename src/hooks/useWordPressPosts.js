import { useState, useEffect } from 'react'
import { loadPosts } from './wordpressPosts'

/**
 * Los últimos posts del blog, ya formateados para la sección de Blog.
 *
 * La petición vive en wordpressPosts.js y se comparte con useAnnouncements:
 * antes cada uno pedía por su cuenta y salían dos llamadas por los mismos
 * datos. Aquí solo se recorta al límite pedido y se da forma.
 */

/**
 * Recorta por palabra entera, no a mitad.
 *
 * Antes era `.substring(0, 150) + '...'` y el resultado en pantalla era
 * «…Cómo funciona esa búsqueda, qué mira e...». Cortar a mitad de palabra
 * hace que el texto parezca roto en vez de continuado, que es justo lo
 * contrario de lo que busca un extracto.
 *
 * Si el texto ya cabe entero, se devuelve tal cual y sin puntos suspensivos:
 * los tres puntos prometen que hay más, y si no lo hay, mienten.
 */
const recortar = (texto, limite) => {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (limpio.length <= limite) return limpio
  const corte = limpio.slice(0, limite)
  const ultimoEspacio = corte.lastIndexOf(' ')
  return (ultimoEspacio > limite * 0.6 ? corte.slice(0, ultimoEspacio) : corte).replace(/[,;:.\s]+$/, '') + '…'
}

/**
 * srcset de la imagen destacada, a partir de los tamaños que WordPress ya
 * generó al subirla.
 *
 * Se estaba usando `source_url`, que es el original: 1080px para pintarse a
 * 274px en escritorio. Cuatro portadas así eran 301 KB, el bloque más pesado
 * que quedaba en la home. WordPress ya tiene medium, medium_large, large y
 * varios recortes del tema; basta con ofrecerlos y dejar que el navegador
 * elija.
 *
 * Se filtran los recortes de proporción distinta (thumbnail es cuadrado,
 * hero-featured apaisado): mezclar proporciones dentro de un mismo srcset hace
 * que la tarjeta cambie de encuadre según la pantalla. Solo entran los que
 * conservan la proporción del original.
 */
const srcSetDeMedio = (medio) => {
  const d = medio?.media_details
  if (!d?.sizes || !d.width || !d.height) return undefined

  const proporcion = d.width / d.height
  const candidatos = Object.values(d.sizes)
    .filter((s) => s.source_url && s.width && Math.abs(s.width / s.height - proporcion) < 0.02)
    .concat([{ source_url: medio.source_url, width: d.width }])

  // Un mismo ancho puede venir por dos recortes distintos; con uno basta.
  const porAncho = new Map()
  for (const s of candidatos) if (!porAncho.has(s.width)) porAncho.set(s.width, s.source_url)
  if (porAncho.size < 2) return undefined

  return [...porAncho.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([w, url]) => `${url} ${w}w`)
    .join(', ')
}
const useWordPressPosts = (limit = 3) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    loadPosts().then((data) => {
      if (!alive) return

      if (!data) {
        setError('Error al cargar posts')
        setLoading(false)
        return
      }

      const formattedPosts = data.slice(0, limit).map((post) => {
        // Convert absolute WP link to relative path for SPA routing
        let postLink = post.link || `/blog/${post.slug}`
        try {
          const url = new URL(postLink)
          postLink = url.pathname
        } catch (e) {
          // Already relative, keep as-is
        }

        return {
          id: post.id,
          title: post.title.rendered,
          excerpt: recortar(post.excerpt.rendered.replace(/<[^>]*>/g, ''), 200),
          date: new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          link: postLink,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          featuredSrcSet: srcSetDeMedio(post._embedded?.['wp:featuredmedia']?.[0]),
          categories: post._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || ['General'],
          author: post._embedded?.author?.[0]?.name || 'DAK Agency'
        }
      })

      setPosts(formattedPosts)
      setError(null)
      setLoading(false)
    })

    return () => { alive = false }
  }, [limit])

  return { posts, loading, error }
}

export default useWordPressPosts
