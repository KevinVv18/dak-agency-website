import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './ContactForm.css'

const ContactForm = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Form submitted:', formData)
    setSubmitSuccess(true)
    setFormData({ name: '', email: '', message: '' })
    setIsSubmitting(false)
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
    }, 5000)
  }

  return (
    <section className="contact-form-section" id="contact" ref={ref}>
      <div className="container-narrow">
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Contáctanos</h2>
          <p className="section-subtitle">
            ¿Listo para acelerar tu presencia digital? Cuéntanos sobre tu proyecto
          </p>
        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <motion.input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />
            {errors.name && (
              <motion.span
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.name}
              </motion.span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />
            {errors.email && (
              <motion.span
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email}
              </motion.span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Mensaje
            </label>
            <motion.textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              className={`form-input ${errors.message ? 'error' : ''}`}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />
            {errors.message && (
              <motion.span
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.message}
              </motion.span>
            )}
          </div>

          <motion.button
            type="submit"
            className="form-submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? (
              <span className="submitting">
                <span className="spinner"></span>
                Enviando...
              </span>
            ) : (
              'Enviar Mensaje'
            )}
          </motion.button>

          {submitSuccess && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              ✓ ¡Mensaje enviado con éxito! Te contactaremos pronto.
            </motion.div>
          )}

          <p className="form-note">
            📝 Este es un formulario frontend. Conecta tu backend para procesar envíos reales.
          </p>
        </motion.form>
      </div>
    </section>
  )
}

export default ContactForm


