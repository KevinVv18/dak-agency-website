import { useState, useEffect } from 'react'

const useWordPressPosts = (limit = 3) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://blog.dakagency.net/wp-json/wp/v2/posts?per_page=${limit}&_embed`
        )
        
        if (!response.ok) {
          throw new Error('Error al cargar posts')
        }

        const data = await response.json()
        
        // Formatear los datos
        const formattedPosts = data.map(post => ({
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
          link: `/blog/${post.slug}`,
          featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          categories: post._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || [],
          author: post._embedded?.author?.[0]?.name || 'DAK Agency'
        }))

        setPosts(formattedPosts)
        setError(null)
      } catch (err) {
        console.error('Error fetching WordPress posts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [limit])

  return { posts, loading, error }
}

export default useWordPressPosts
