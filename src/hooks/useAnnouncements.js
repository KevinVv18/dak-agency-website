import { useState, useEffect } from 'react'
import { announcements as manualAnnouncements } from '../data/announcements'
import { loadPosts } from './wordpressPosts'

/**
 * useAnnouncements — fusiona los avisos manuales (demos, features, páginas)
 * con los últimos posts del blog traídos en vivo del WP REST API.
 *
 * Así, cada blog nuevo aparece SOLO en la campanita y el ticker, sin tener
 * que editar announcements.js a mano. Los avisos manuales siguen mandando:
 * si un post ya está curado a mano (con título propio), no se duplica.
 *
 * El fetch se hace UNA sola vez por carga y lo comparten la campanita, el
 * ticker y la sección de blog: vive en wordpressPosts.js. Si el blog no
 * responde, degrada al array estático.
 */
const MAX_ITEMS = 10

const normHref = (u = '') => u.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase()

const toISODate = (d) => {
  try { return new Date(d).toISOString().slice(0, 10) } catch { return String(d).slice(0, 10) }
}

const decodeTitle = (html = '') => {
  const txt = html.replace(/<[^>]*>/g, '')
  if (typeof document !== 'undefined') {
    const el = document.createElement('textarea')
    el.innerHTML = txt
    return el.value.trim()
  }
  return txt
    .replace(/&#8217;|&#039;|&#39;/g, '’')
    .replace(/&#8220;|&#8221;|&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .trim()
}

async function loadAnnouncements() {
  const posts = await loadPosts()
  if (!posts) return manualAnnouncements   // el blog no respondió: array estático

  const manualHrefs = new Set(manualAnnouncements.map(a => normHref(a.href)))

  const blogItems = posts
    .map(p => ({
      id: `blog-${p.slug}`,
      date: toISODate(p.date),
      tag: 'Blog',
      type: 'blog',
      title: decodeTitle(p.title?.rendered || ''),
      href: p.link || `https://dakagency.net/blog/${p.slug}/`,
      external: true,
    }))
    .filter(it => it.title && !manualHrefs.has(normHref(it.href)))

  const seen = new Set()
  return [...manualAnnouncements, ...blogItems]
    .filter(a => (seen.has(a.id) ? false : (seen.add(a.id), true)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, MAX_ITEMS)
}

const useAnnouncements = () => {
  const [list, setList] = useState(manualAnnouncements)

  useEffect(() => {
    let alive = true
    loadAnnouncements().then(result => {
      if (alive && result) setList(result)
    })
    return () => { alive = false }
  }, [])

  return list
}

export default useAnnouncements
