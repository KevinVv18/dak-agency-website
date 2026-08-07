# Product

<!-- impeccable:product-schema 1 -->

> **Alcance:** el sitio principal, `dakagency.net` (SPA de Vite + React en la
> raíz del repo). El demo inmobiliario tiene su propio registro en
> [PRODUCT.inmobiliaria.md](PRODUCT.inmobiliaria.md).

## Platform

web

## Users

**Usuario primario: el dueño o encargado de marketing de un negocio de Chiclayo
y Lambayeque.** Consultorios dentales y médicos, veterinarias, restaurantes,
spas, colegios, retail, floristerías. Perfil confirmado por la propia cartera de
DAK: son negocios locales de servicio, no startups ni corporaciones.

Llega por búsqueda («agencia de marketing Chiclayo»), por recomendación o por un
enlace que le pasa alguien de DAK. Su pregunta real no es «¿qué servicios
ofrecen?» sino **«¿esta gente sabe hacerlo y cuánto me va a costar?»**.

Compra desconfiando: en el rubro abunda quien promete alcance y no entrega nada
medible. Por eso el sitio enseña precios y demos que se pueden abrir, en vez de
adjetivos.

**Usuario secundario: el propio equipo de DAK**, que usa el sitio como material
de venta en reuniones —igual que el demo inmobiliario— y como destino de las
campañas.

## Product Purpose

Es un **generador de conversaciones comerciales**, no un folleto. Su trabajo es
que un negocio local pase de «no los conozco» a escribir por WhatsApp, enviar el
formulario o agendar una reunión.

Éxito = mensajes entrantes con contexto (qué servicio le interesa). Fracaso =
visitas que se van sin dejar rastro, o que llegan pensando que DAK hace otra
cosa de la que hace.

## Positioning

**«Menos ruido, más impacto».** El sitio compite contra dos cosas:

1. **Agencias locales que solo describen.** DAK publica **4 demos que se abren y
   se usan**: una tienda con catálogo (American Vault), un blog posicionando en
   Google, un asistente de IA que cotiza y agenda, y una web inmobiliaria. La
   diferencia no es decir «hacemos webs», es que el prospecto la pruebe.
2. **La opacidad de precios.** Los siete servicios muestran su precio de
   entrada, de S/ 600/mes a S/ 2 500. Es una decisión comercial deliberada:
   filtra a quien no puede pagar y desarma la desconfianza de quien sí.

Anclaje local real: sede en Chiclayo, cartera de clientes de Lambayeque, blog
que posiciona por búsquedas de la zona.

## Operating Context

- **El móvil manda.** El tráfico local llega por redes y busca desde el
  teléfono, muchas veces en 4G. Una home pesada se paga en visitas perdidas.
- **El blog es el motor de captación.** Vive en `/blog/` sobre WordPress, con
  publicación automatizada (lunes, miércoles y viernes) por SSH + WP-CLI. La
  home consume sus últimas entradas por REST.
- **Los rastreadores de IA importan.** DAK vende posicionamiento, incluido el
  aparecer en respuestas de ChatGPT y similares. El sitio se prerenderiza para
  ser legible sin JavaScript; predicar lo contrario de lo que se practica sería
  el peor argumento de venta posible.

## Capabilities and Constraints

- **SPA estática** de Vite + React 18 con `react-router-dom`, desplegada como
  archivos en Hostinger. Sin servidor de aplicación, sin base de datos propia.
- **Prerender obligatorio** (`scripts/prerender.mjs`) dentro de `npm run build`.
  Genera un HTML por ruta. Si se añade una `<Route>`, va también al script, al
  `.htaccess` y a `public/sitemap.xml`.
- **Deploy por `rsync --delete`** sobre `public_html/`. Las carpetas que no
  produce el build se protegen en `deploy-protect.txt`; una carpeta sin proteger
  detiene el despliegue en vez de desaparecer.
- **Media pesada en Cloudinary**, no en el repo. El helper aplica
  `f_auto,q_auto,c_limit,w_N` y sirve la variante según el viewport.
- **Formulario por EmailJS**; el chat y el CRM viven en `admin.dakagency.net`.
- **`/blog/` es intocable desde este repo**: es un WordPress administrado en
  vivo, sin código versionado aquí.

## Brand Commitments

Vinculantes:

- **Paleta**: fondo `#030106`, morado `#B024FF` (con `#B93EFF` para texto
  pequeño), teal `#00C8C8`.
- **Tipografía**: Poppins (600/700/800), autoalojada.
- **Nombre**: DAK, de *Digital Acceleration Key*.

No vinculante: la composición actual de las secciones, en revisión.

## Evidence on Hand

**Real y comprobable:**

- 4 demos en producción, con URL pública y funcionando.
- Cartera fotográfica de **15 clientes** con sesión propia (Oasis Dental,
  American Vault, Manuel Pardo, Bumbum Florería, Spa Kreativos, La Cocina de
  Rosita, Casa Club T&G, GO!, Al Palo, Beauty House, Dra. Jenny Rodríguez,
  Prosadis, Bersa Medic, Titan, The Urban Pet). Vive en el Drive de la agencia.
- 24 piezas gráficas de 6 clientes ya en el repo.
- Blog con entradas propias posicionando.
- Precios reales por servicio.

**Lo que NO debe presentarse como dato duro:** las cifras redondas de la home
(«50+ proyectos», «98% satisfechos», «5+ años») no tienen respaldo verificable
en el repo. Y los tres testimonios son citas, no un sistema de reseñas: por eso
el schema **no** declara `aggregateRating`.

## Product Principles

1. **Demostrar antes que describir.** Un demo que se abre vale más que un
   párrafo. Una sección que solo afirma algo es longitud, no argumento.
2. **El precio se enseña.** Es lo que separa a DAK de la agencia que pide una
   reunión para decir cuánto cuesta.
3. **No se inventan clientes, cifras ni casos.** El material real alcanza.
4. **Lo que se predica se practica.** Si el sitio vende SEO, rendimiento y
   accesibilidad, tiene que ser el primero en cumplirlos. Es el argumento de
   venta más barato y el más difícil de fingir.
5. **El móvil es la superficie principal**, porque ahí ocurre el primer
   contacto.

## Accessibility & Inclusion

Piso establecido y verificado, que **no debe reintroducir regresiones**:

- Texto funcional nunca por debajo de **11px**.
- Contraste **AA** (4.5:1 normal, 3:1 grande), contando el alpha del texto.
- Objetivos táctiles de **44×44** donde el espaciado lo permita; nunca por
  debajo de los 24×24 de WCAG 2.5.8.
- Un solo `h1` por ruta y jerarquía de encabezados sin saltos.
- `prefers-reduced-motion` respetado.

Se comprueba con `npm run auditar:movil`, que mide con Chromium propio porque el
panel del navegador no compone frames cuando no está a la vista y congela las
animaciones, falseando la medida.
