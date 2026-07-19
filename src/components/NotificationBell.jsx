import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { announcements, typeColor, relativeDate } from '../data/announcements'
import { scrollToSection } from '../utils/scrollToSection'
import './NotificationBell.css'

/* Campanita "Lo nuevo" del nav: badge con no-leídos (persistido en
   localStorage) y panel con la lista completa de anuncios. */
const SEEN_KEY = 'dak_notif_seen'

const ICONS = {
  demo: <path d="M12 2v4M4.9 4.9l2.8 2.8M2 12h4M4.9 19.1l2.8-2.8M12 22v-4M19.1 19.1l-2.8-2.8M22 12h-4M19.1 4.9l-2.8 2.8" />,
  web: <><path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21V12h6v9" /></>,
  bot: <><rect x="5" y="7" width="14" height="12" rx="3" /><circle cx="9.5" cy="13" r="1" /><circle cx="14.5" cy="13" r="1" /><path d="M12 7V4M8 4h8" /></>,
  blog: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
}

const readSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] }
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)
  const rootRef = useRef(null)
  const unread = announcements.filter(a => !seen.includes(a.id)).length

  const toggle = () => {
    setOpen(o => {
      const next = !o
      if (next) {
        const all = announcements.map(a => a.id)
        setSeen(all)
        try { localStorage.setItem(SEEN_KEY, JSON.stringify(all)) } catch { /* privado */ }
      }
      return next
    })
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onItemClick = (a) => (e) => {
    if (!a.external && a.href.startsWith('#')) {
      e.preventDefault()
      setOpen(false)
      scrollToSection(a.href)
    } else {
      setOpen(false)
    }
  }

  return (
    <div className="notif" ref={rootRef}>
      <button
        className={`notif-btn ${open ? 'open' : ''}`}
        onClick={toggle}
        aria-label={unread ? `Novedades: ${unread} sin leer` : 'Novedades'}
        aria-expanded={open}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Novedades de DAK"
          >
            <div className="notif-head">
              <span>Lo nuevo en DAK</span>
              <button className="notif-close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            </div>
            <ul className="notif-list">
              {announcements.map(a => (
                <li key={a.id}>
                  <a
                    className="notif-item"
                    href={a.href}
                    target={a.external ? '_blank' : undefined}
                    rel={a.external ? 'noopener noreferrer' : undefined}
                    onClick={onItemClick(a)}
                  >
                    <span className="notif-ico" style={{ '--n-color': typeColor[a.type] || '#B024FF' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {ICONS[a.type] || ICONS.demo}
                      </svg>
                    </span>
                    <span className="notif-body">
                      <span className="notif-title">{a.title}</span>
                      <span className="notif-meta">
                        <b style={{ color: typeColor[a.type] || '#B024FF' }}>{a.tag}</b> · {relativeDate(a.date)}
                      </span>
                    </span>
                    <svg className="notif-go" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7" /><path d="M8 7h9v9" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
