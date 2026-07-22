import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TICKER_MAX, typeColor } from '../data/announcements'
import useAnnouncements from '../hooks/useAnnouncements'
import { scrollToSection } from '../utils/scrollToSection'
import './AnnouncementTicker.css'

/* Píldora rotativa de anuncios en el hero. Rota sola cada 5.5s,
   se pausa al pasar el mouse y toda la píldora es clickeable. */
const ROTATE_MS = 5500

const AnnouncementTicker = () => {
  const announcements = useAnnouncements()
  const items = announcements.slice(0, TICKER_MAX)
  const [idx, setIdx] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => {
      if (!paused.current) setIdx(p => (p + 1) % items.length)
    }, ROTATE_MS)
    return () => clearInterval(t)
  }, [items.length])

  if (!items.length) return null
  const a = items[idx]
  const color = typeColor[a.type] || '#B024FF'

  const onClick = (e) => {
    if (!a.external && a.href.startsWith('#')) {
      e.preventDefault()
      scrollToSection(a.href)
    }
  }

  return (
    <motion.div
      className="ann-ticker"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.4 }}
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      <a
        className="ann-pill"
        href={a.href}
        target={a.external ? '_blank' : undefined}
        rel={a.external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        aria-live="polite"
      >
        <span className="ann-tag" style={{ '--ann-color': color }}>
          <span className="ann-dot" />
          {a.tag}
        </span>
        <span className="ann-text-clip">
          <AnimatePresence mode="wait">
            <motion.span
              key={idx}
              className="ann-text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {a.title}
            </motion.span>
          </AnimatePresence>
        </span>
        <svg className="ann-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </a>
      {items.length > 1 && (
        <div className="ann-dots" role="tablist" aria-label="Anuncios">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`ann-step ${i === idx ? 'on' : ''}`}
              aria-label={`Anuncio ${i + 1}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default AnnouncementTicker
