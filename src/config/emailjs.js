// =============================================
// EMAILJS CONFIGURATION
// =============================================
// Keys loaded from environment variables (Vite)
// Set these in a .env.local file (NOT committed to git):
//
//   VITE_EMAILJS_PUBLIC_KEY=QtRdYOqHr4-zNgIUY
//   VITE_EMAILJS_SERVICE_ID=service_feg2or7
//   VITE_EMAILJS_TEMPLATE_NOTIFICATION=template_9rfcj3j
//   VITE_EMAILJS_TEMPLATE_AUTOREPLY=template_y7y363r
//
// =============================================

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  TEMPLATE_NOTIFICATION: import.meta.env.VITE_EMAILJS_TEMPLATE_NOTIFICATION || '',
  TEMPLATE_AUTOREPLY: import.meta.env.VITE_EMAILJS_TEMPLATE_AUTOREPLY || '',
}
