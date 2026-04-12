import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../config/emailjs'
import './ContactForm.css'

const ContactForm = () => {
  const ref = useRef(null)
  const formRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const services = [
    'Branding',
    'Fotografía',
    'Video',
    'Social Media',
    'Diseño Web',
    'SEO & Ads',
    'Automatización'
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setIsSubmitting(true)
    setSubmitError(false)

    // Template params for both emails
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      service: formData.service || 'No especificado',
      message: formData.message,
      to_email: 'marketing@dakagency.net',
      reply_to: formData.email,
    }

    try {
      // 1. Send notification email to DAK Agency
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_NOTIFICATION,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      )

      // 2. Send auto-reply confirmation to the client
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_AUTOREPLY,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      )

      setSubmitSuccess(true)
      setFormData({ name: '', email: '', service: '', message: '' })
      setTimeout(() => setSubmitSuccess(false), 8000)
    } catch (error) {
      console.error('EmailJS Error:', error)
      setSubmitError(true)
      setTimeout(() => setSubmitError(false), 6000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="contact-section" id="contact" ref={ref}>
      <div className="contact-layout">
        {/* LEFT - Info Panel */}
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="section-tag contact-tag">[ 05 ]</span>
          <h2 className="contact-title">Hablemos.</h2>
          <p className="contact-desc">
            Transformamos ideas en resultados digitales. Cuéntanos tu proyecto y hagámoslo realidad.
          </p>

          <div className="contact-details">
            <a href="mailto:marketing@dakagency.net" className="contact-item">
              <div className="contact-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">Email</span>
                <span className="contact-item-value">marketing@dakagency.net</span>
              </div>
            </a>

            <a href="https://api.whatsapp.com/send/?phone=51906765040&text=Hola+DAK+Agency%2C+me+interesa+conocer+sus+servicios&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="contact-item">
              <div className="contact-item-icon whatsapp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">WhatsApp</span>
                <span className="contact-item-value">+51 906 765 040</span>
              </div>
            </a>

            <div className="contact-item">
              <div className="contact-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">Horario</span>
                <span className="contact-item-value">Lun - Vie: 9:00am - 6:00pm</span>
              </div>
            </div>

            <a
              href="https://plan.dakagency.net/agendar.html"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item contact-item-schedule"
            >
              <div className="contact-item-icon schedule">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">Reunión gratuita</span>
                <span className="contact-item-value">Agendar en Google Meet</span>
                <span className="contact-item-sub">60 min · Sin compromiso</span>
              </div>
            </a>
          </div>
        </motion.div>

        {/* RIGHT - Form Panel */}
        <motion.div
          className="contact-form-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
        >
          <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="service" className="form-label">Servicio que te interesa</label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="">Seleccionar servicio</option>
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">Mensaje</label>
              <textarea
                id="message"
                name="message"
                placeholder="Cuéntanos sobre tu proyecto..."
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`form-input ${errors.message ? 'error' : ''}`}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <motion.button
              type="submit"
              className="form-submit"
              disabled={isSubmitting || submitSuccess}
              whileHover={!(isSubmitting || submitSuccess) ? { y: -2 } : {}}
              whileTap={!(isSubmitting || submitSuccess) ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="submitting">
                  <span className="spinner" />
                  Enviando...
                </span>
              ) : (
                <>
                  Enviar Mensaje
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>

            {submitSuccess && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                ¡Mensaje enviado! Revisa tu email para la confirmación. Te contactaremos lo antes posible.
              </motion.div>
            )}

            {submitError && (
              <motion.div
                className="error-banner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                Error al enviar. Intenta por{' '}
                <a href="https://api.whatsapp.com/send/?phone=51906765040&text=Hola+DAK+Agency%2C+me+interesa+conocer+sus+servicios&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                {' '}o a{' '}
                <a href="mailto:marketing@dakagency.net">marketing@dakagency.net</a>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactForm
