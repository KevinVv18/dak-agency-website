/**
 * Anuncios del sitio — UNA sola fuente para dos superficies:
 *   1. El ticker del hero (píldora rotativa en la portada)
 *   2. La campanita de notificaciones del nav (badge + panel "Lo nuevo")
 *
 * Para publicar un anuncio: agrega un objeto AL INICIO del array y despliega.
 *   id:       único y estable (se usa para marcar leído/no-leído en el navegador;
 *             cambiarlo hace que el anuncio vuelva a contar como "no leído")
 *   date:     'YYYY-MM-DD' (se muestra relativa: "hoy", "hace 3 días"…)
 *   tag:      etiqueta corta visible (Nuevo, Blog, Demo…)
 *   type:     ícono/color → 'demo' | 'web' | 'bot' | 'blog'
 *   title:    texto del anuncio (corto: es una píldora)
 *   href:     a dónde lleva (#ancla interna o URL completa)
 *   external: true si abre en pestaña nueva
 *
 * El ticker muestra los primeros TICKER_MAX; la campanita muestra todos.
 */
export const TICKER_MAX = 4

export const announcements = [
  {
    id: 'demo-inmobiliaria-360',
    date: '2026-07-18',
    tag: 'Nuevo demo',
    type: 'web',
    title: 'Estrenamos el demo inmobiliario con recorridos 360°',
    href: 'https://inmobiliaria.dakagency.net/',
    external: true,
  },
  {
    id: 'demos-en-vivo',
    date: '2026-07-13',
    tag: 'Demos',
    type: 'demo',
    title: 'Nueva sección de demos: no te lo contamos, pruébalo',
    href: '#projects',
  },
  {
    id: 'post-agentes-ia',
    date: '2026-07-13',
    tag: 'Blog',
    type: 'bot',
    title: 'Agentes de IA para negocios: el empleado digital 24/7',
    href: 'https://dakagency.net/blog/agentes-de-ia-para-negocios/',
    external: true,
  },
  {
    id: 'post-elegir-agencia',
    date: '2026-07-13',
    tag: 'Blog',
    type: 'blog',
    title: '¿Cómo saber si una agencia es buena? Pide demos',
    href: 'https://dakagency.net/blog/como-saber-si-una-agencia-de-marketing-es-buena/',
    external: true,
  },
]

/* ── helpers compartidos ── */
export const typeColor = {
  demo: '#B024FF',
  web: '#4ECDC4',
  bot: '#9B59B6',
  blog: '#2ECC71',
}

export function relativeDate(iso) {
  const d = new Date(iso + 'T12:00:00')
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  const w = Math.floor(days / 7)
  if (w < 5) return w === 1 ? 'hace 1 semana' : `hace ${w} semanas`
  const m = Math.floor(days / 30)
  return m === 1 ? 'hace 1 mes' : `hace ${m} meses`
}
