import { useState, useEffect } from 'react'
import { loadPosts } from './wordpressPosts'

/**
 * Los últimos posts del blog, ya formateados para la sección de Blog.
 *
 * La petición vive en wordpressPosts.js y se comparte con useAnnouncements:
 * antes cada uno pedía por su cuenta y salían dos llamadas por los mismos
 * datos. Aquí solo se recorta al límite pedido y se da forma.
 */
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
          excerpt: post.excerpt.rendered
            .replace(/<[^>]*>/g, '')
            .substring(0, 150) + '...',
          date: new Date(post.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          link: postLink,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
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
