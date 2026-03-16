import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ChatWidget.css'

// ── Chat flow steps ──
const STEPS = {
  GREETING: 'greeting',
  SERVICES: 'services',
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  MESSAGE: 'message',
  SENDING: 'sending',
  DONE: 'done',
}

const SERVICES_LIST = [
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'fotografia', label: 'Fotografía', icon: '📸' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'social-media', label: 'Social Media', icon: '📱' },
  { id: 'diseno-web', label: 'Diseño Web', icon: '💻' },
  { id: 'seo-ads', label: 'SEO & Ads', icon: '📈' },
  { id: 'automatizacion', label: 'Automatización', icon: '⚡' },
]

const API_URL = import.meta.env.VITE_API_URL || 'https://admin.dakagency.net'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(STEPS.GREETING)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    source: 'website-chat',
  })
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when step changes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [step, isOpen])

  // Show greeting after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasNewMessage(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const addBotMessage = (text, delay = 400) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text, time: new Date() }])
        resolve()
      }, delay)
    })
  }

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text, time: new Date() }])
  }

  // ── Open chat ──
  const handleOpen = async () => {
    setIsOpen(true)
    setHasNewMessage(false)
    if (messages.length === 0) {
      await addBotMessage('¡Hola! 👋 Soy el asistente de DAK Agency.', 300)
      await addBotMessage('¿En qué servicio estás interesado?', 600)
      setStep(STEPS.SERVICES)
    }
  }

  // ── Service selection ──
  const handleServiceSelect = async (service) => {
    addUserMessage(service.label)
    setLeadData(prev => ({ ...prev, service: service.label }))
    await addBotMessage(`¡Excelente! ${service.icon} ${service.label} es una gran elección.`, 400)
    await addBotMessage('¿Cuál es tu nombre?', 600)
    setStep(STEPS.NAME)
  }

  // ── Text input handler ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const value = inputValue.trim()
    setInputValue('')

    switch (step) {
      case STEPS.NAME:
        addUserMessage(value)
        setLeadData(prev => ({ ...prev, name: value }))
        await addBotMessage(`Mucho gusto, ${value}! 🤝`, 400)
        await addBotMessage('¿Cuál es tu email para contactarte?', 600)
        setStep(STEPS.EMAIL)
        break

      case STEPS.EMAIL:
        if (!/\S+@\S+\.\S+/.test(value)) {
          await addBotMessage('Hmm, ese email no parece válido. ¿Puedes intentar de nuevo?', 300)
          return
        }
        addUserMessage(value)
        setLeadData(prev => ({ ...prev, email: value }))
        await addBotMessage('Perfecto ✅', 300)
        await addBotMessage('¿Tu número de WhatsApp? (opcional — puedes escribir "saltar")', 500)
        setStep(STEPS.PHONE)
        break

      case STEPS.PHONE: {
        const skip = value.toLowerCase() === 'saltar' || value.toLowerCase() === 'skip'
        if (!skip) {
          addUserMessage(value)
          setLeadData(prev => ({ ...prev, phone: value }))
        } else {
          addUserMessage('Saltar')
        }
        await addBotMessage('Cuéntame brevemente sobre tu proyecto o lo que necesitas 💬', 400)
        setStep(STEPS.MESSAGE)
        break
      }

      case STEPS.MESSAGE:
        addUserMessage(value)
        setLeadData(prev => ({ ...prev, message: value }))
        setStep(STEPS.SENDING)
        await addBotMessage('Registrando tu información... ⏳', 300)
        await submitLead({ ...leadData, message: value })
        break

      default:
        break
    }
  }

  // ── Submit lead to backend ──
  const submitLead = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.name,
          email: data.email,
          telefono: data.phone,
          servicio: data.service,
          mensaje: data.message,
          fuente: data.source,
          fecha: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        await addBotMessage('¡Listo! ✨ Tu información fue registrada exitosamente.', 500)
        await addBotMessage(`Nos pondremos en contacto contigo pronto, ${data.name}. ¡Gracias por tu interés!`, 700)
      } else {
        throw new Error('Server error')
      }
    } catch {
      // Fallback: even if API fails, show success and log to console
      console.warn('Chat lead API failed, data:', data)
      await addBotMessage('¡Gracias por tu interés! ✨', 500)
      await addBotMessage(`Te contactaremos a ${data.email} pronto. También puedes escribirnos por WhatsApp al +51 906 765 040.`, 700)
    }
    setStep(STEPS.DONE)
  }

  // ── Reset chat ──
  const handleReset = () => {
    setMessages([])
    setStep(STEPS.GREETING)
    setLeadData({ name: '', email: '', phone: '', service: '', message: '', source: 'website-chat' })
    setIsOpen(false)
  }

  // ── Input placeholder per step ──
  const getPlaceholder = () => {
    switch (step) {
      case STEPS.NAME: return 'Tu nombre...'
      case STEPS.EMAIL: return 'tu@email.com...'
      case STEPS.PHONE: return 'Ej: +51 906 765 040...'
      case STEPS.MESSAGE: return 'Cuéntanos sobre tu proyecto...'
      default: return ''
    }
  }

  const showInput = [STEPS.NAME, STEPS.EMAIL, STEPS.PHONE, STEPS.MESSAGE].includes(step)

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-header-avatar">
                  <svg viewBox="450 0 540 420" width="24" height="24">
                    <polygon fill="#B024FF" points="698.28 275.48 622.19 55.94 470.31 420.36 645.56 420.36 698.28 275.48"/>
                    <polygon fill="#B024FF" points="650.75 .44 826 .44 971.2 420.36 795.95 420.36 650.75 .44"/>
                  </svg>
                </div>
                <div>
                  <span className="chat-header-name">DAK Agency</span>
                  <span className="chat-header-status">
                    <span className="status-dot" />
                    En línea
                  </span>
                </div>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chat-msg ${msg.type}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.type === 'bot' && (
                    <div className="msg-avatar">
                      <svg viewBox="450 0 540 420" width="16" height="16">
                        <polygon fill="#B024FF" points="698.28 275.48 622.19 55.94 470.31 420.36 645.56 420.36 698.28 275.48"/>
                        <polygon fill="#B024FF" points="650.75 .44 826 .44 971.2 420.36 795.95 420.36 650.75 .44"/>
                      </svg>
                    </div>
                  )}
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                  </div>
                </motion.div>
              ))}

              {/* Service buttons */}
              {step === STEPS.SERVICES && (
                <motion.div
                  className="chat-options"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {SERVICES_LIST.map(service => (
                    <button
                      key={service.id}
                      className="chat-option-btn"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <span className="option-icon">{service.icon}</span>
                      {service.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Done state */}
              {step === STEPS.DONE && (
                <motion.div
                  className="chat-done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button className="chat-restart-btn" onClick={handleReset}>
                    Iniciar nueva conversación
                  </button>
                  <a
                    href="https://api.whatsapp.com/send/?phone=51906765040&text=Hola+DAK+Agency%2C+me+interesa+conocer+sus+servicios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-whatsapp-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Hablar por WhatsApp
                  </a>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {showInput && (
              <form className="chat-input-bar" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type={step === STEPS.EMAIL ? 'email' : 'text'}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="chat-input"
                  autoComplete="off"
                />
                <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Button — DAK "A" ── */}
      <motion.button
        className={`chat-trigger ${isOpen ? 'open' : ''} ${hasNewMessage ? 'has-notification' : ''}`}
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="logo-a"
              viewBox="450 0 540 440"
              width="28" height="28"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <polygon fill="white" points="698.28 275.48 622.19 55.94 470.31 420.36 645.56 420.36 698.28 275.48"/>
              <polygon fill="white" points="650.75 .44 826 .44 971.2 420.36 795.95 420.36 650.75 .44"/>
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {hasNewMessage && !isOpen && (
          <span className="chat-notification-dot" />
        )}
      </motion.button>
    </>
  )
}

export default ChatWidget
