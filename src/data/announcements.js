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
    id: 'seccion-nosotros',
    date: '2026-07-19',
    tag: 'Nuevo',
    type: 'demo',
    title: 'Conócenos: así trabajamos en DAK',
    href: '#about',
  },
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
    href: '#demos',
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
/* Un solo acento, el de la casa.
 *
 * Eran cuatro colores por tipo de aviso: morado, teal, otro morado y verde. Es
 * el mismo arcoíris que ya salió de Servicios (siete), Demos (cuatro), Taller
 * (seis) y Blog (catorce): color inventado por categoría en una web de un solo
 * acento. Lo que distingue un aviso de otro es su ETIQUETA, que además es lo
 * único de las dos cosas que se puede leer.
 *
 * Se conserva el mapa —y no una constante— porque el ticker y la campana lo
 * consultan por tipo, y porque es donde vive el porqué.
 *
 * El tono es #B93EFF y no el #B024FF de marca: sobre el fondo oscuro del panel
 * el morado sin aclarar se queda en 4.49:1 y falla AA por una centésima. Es el
 * mismo aclarado que --color-accent-texto define en index.css. */
export const typeColor = {
  demo: '#B93EFF',
  web: '#B93EFF',
  bot: '#B93EFF',
  blog: '#B93EFF',
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
