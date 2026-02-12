// =============================================
// EMAILJS CONFIGURATION
// =============================================
// Para configurar esto necesitas:
// 1. Crear cuenta gratis en https://www.emailjs.com/
// 2. Agregar tu servicio de email (Gmail, Outlook, etc.)
// 3. Crear 2 templates (notificacion + auto-reply)
// 4. Copiar los IDs aqui abajo
// =============================================

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'QtRdYOqHr4-zNgIUY',
  SERVICE_ID: 'service_feg2or7',
  TEMPLATE_NOTIFICATION: 'template_9rfcj3j',
  TEMPLATE_AUTOREPLY: 'template_y7y363r',
}

// =============================================
// TEMPLATE VARIABLES - Referencia
// =============================================
// Ambos templates usaran estas variables:
//
// {{from_name}}    - Nombre del cliente
// {{from_email}}   - Email del cliente
// {{service}}      - Servicio seleccionado
// {{message}}      - Mensaje del cliente
// {{to_email}}     - Email destino (marketing@dakagency.net)
//
// El template de AUTO-REPLY ademas puede usar:
// {{reply_to}}     - Email del cliente (para Reply-To header)
// =============================================
