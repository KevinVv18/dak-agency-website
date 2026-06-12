// =============================================
// EMAILJS CONFIGURATION
// =============================================
// Keys loaded from environment variables (Vite)
// Set these in a .env.local file (NOT committed to git):
//
//   VITE_EMAILJS_PUBLIC_KEY=...
//   VITE_EMAILJS_SERVICE_ID=...
//   VITE_EMAILJS_TEMPLATE_NOTIFICATION=...
//   VITE_EMAILJS_TEMPLATE_AUTOREPLY=...
//
// Real values: see .env.local (local) — NEVER commit them here.
// =============================================

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  TEMPLATE_NOTIFICATION: import.meta.env.VITE_EMAILJS_TEMPLATE_NOTIFICATION || '',
  TEMPLATE_AUTOREPLY: import.meta.env.VITE_EMAILJS_TEMPLATE_AUTOREPLY || '',
}
