# DAK Agency Website — Documento de Contexto Completo

> **Última verificación:** 12 de junio de 2026  
> **Branch:** `main` — sincronizado con `origin/main`  
> **Último commit:** `12404f8` — *fix: contact layout, blog contrast, services card, projects title*  
> **Repositorio:** [github.com/KevinVv18/dak-agency-website](https://github.com/KevinVv18/dak-agency-website)

---

## 1. Identidad del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | DAK Agency Website |
| **Dominio** | [dakagency.net](https://dakagency.net/) |
| **Tipo** | Sitio web corporativo SPA + Blog WordPress |
| **Negocio** | Agencia de marketing digital en La Victoria, Chiclayo, Lambayeque, Perú |
| **Teléfono** | +51 906 765 040 |
| **Email** | marketing@dakagency.net |
| **Redes** | [Facebook](https://www.facebook.com/profile.php?id=61577374078273), [Instagram](https://www.instagram.com/agency_dak/), [TikTok](https://www.tiktok.com/@dakagency) |

### Servicios que ofrece la agencia:
1. Branding
2. Fotografía
3. Video
4. Social Media
5. Diseño Web
6. SEO & Ads
7. Automatización

### Clientes actuales:
- Berse Line (Spa & Wellness)
- Gran Oportunidad GO! (Retail & Promociones)
- Dra. Jenny (Salud & Medicina)
- Manuel Pardo (Educación)
- Prosadis (Salud Dental)
- Spa Kreativos (Spa & Wellness)

---

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 18.3.1 | Librería UI |
| **Vite** | 5.2.11 | Build tool + dev server |
| **Framer Motion** | 11.0.8 | Animaciones |
| **EmailJS** | 4.4.1 (`@emailjs/browser`) | Envío de emails desde el cliente |
| **React Router DOM** | (dependencia) | Routing SPA |
| **Node.js** | 20 (CI) | Runtime para build |
| **CSS** | Vanilla (CSS Variables) | Estilos, sin frameworks CSS |

> [!IMPORTANT]
> **NO usa Tailwind**, no usa TypeScript de runtime (solo `@types/*` para editor hints). El estilo es 100% vanilla CSS con variables globales.

---

## 3. Estructura del Proyecto

```
dak-agency-website/
├── .env.example                # Variables de entorno ejemplo
├── .eslintrc.cjs               # Config ESLint
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: auto-deploy a Hostinger
├── .hostinger/
│   └── deploy.sh               # Script post-build para WordPress
├── .gitignore
├── favicon.svg
├── index.html                  # Entry HTML con SEO completo + JSON-LD
├── package.json
├── vite.config.js              # Puerto 3000, auto-open
├── public/
│   ├── .htaccess               # Rewrite rules (SPA + WordPress)
│   ├── robots.txt              # SEO robots
│   └── images/                 # Imágenes estáticas (web_design.png, seo_ads.png, automation.png)
├── scripts/
│   ├── setup-wordpress.sh      # Script setup WordPress
│   └── wp-config.template.php  # Template wp-config
├── src/
│   ├── main.jsx                # Entry point React
│   ├── App.jsx                 # Root component + routing
│   ├── index.css               # Design system global (variables, reset, utilities)
│   ├── assets/                 # Imágenes y logos
│   │   ├── logo.svg            # Logo principal
│   │   ├── logo-nav.svg        # Logo para navbar
│   │   ├── banners/            # 4 banners de portada
│   │   ├── clients/            # Imágenes por cliente (berseline, go, jeny, pardo, prosadis, spa)
│   │   ├── dak/                # Showcase DAK (fotografía, dron, inmobiliario, sephora, skincare, veterinaria)
│   │   ├── gallery/            # Fotografías profesionales
│   │   ├── logos/              # Logos de clientes
│   │   └── projects/           # Imágenes de proyectos
│   ├── components/             # 14 componentes (JSX + CSS cada uno)
│   ├── config/
│   │   └── emailjs.js          # Configuración EmailJS
│   ├── data/
│   │   ├── portfolioData.js    # Data de clientes y banners
│   │   └── galleryData.js      # Data de galería, categorías, fotos
│   ├── hooks/
│   │   └── useWordPressPosts.js # Hook para API REST de WordPress
│   └── pages/
│       ├── Home.jsx            # Página principal
│       └── GalleryPage.jsx     # Página de galería
└── wordpress-theme/
    └── dak-informando/         # Tema WordPress custom
        ├── style.css
        ├── functions.php
        ├── header.php
        ├── footer.php
        ├── front-page.php
        ├── single.php
        ├── index.php
        ├── assets/
        └── template-parts/
```

---

## 4. Arquitectura de la Aplicación

### Routing (React Router DOM — BrowserRouter)

| Ruta | Página | Componentes |
|------|--------|------------|
| `/` | `Home` | Hero → CTASection → Services → Projects → PhotoGallery → Blog → ContactForm |
| `/gallery` | `GalleryPage` | Gallery (masonry completo) |
| `/blog/*` | WordPress | Servido directamente por WordPress (no pasa por React) |

### Componentes globales (siempre visibles):
- **Navigation** — Navbar fija con scroll-aware, menú mobile hamburger
- **Footer** — 3 columnas (brand, nav, mapa), marquee ticker
- **ChatWidget** — Chat bot conversacional flotante (esquina inferior derecha)
- **Cursor Grid Reveal** — Efecto visual de grilla que sigue al mouse

### Layout del `App.jsx`:
```jsx
<BrowserRouter>
  <div className="app">
    <div className="cursor-grid-reveal" />  {/* Efecto mouse */}
    <Navigation />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </main>
    <Footer />
    <ChatWidget />
  </div>
</BrowserRouter>
```

---

## 5. Componentes — Detalle

### Página Home (`/`)

| # | Componente | Archivo | Descripción |
|---|-----------|---------|-------------|
| — | **Hero** | `Hero.jsx` + `Hero.css` | Logo SVG grande, carrusel de logos de clientes, CTA "Comenzar Proyecto", botón agendar reunión, redes sociales, decoraciones animadas |
| — | **CTASection** | `CTASection.jsx` + `CTASection.css` | Sección call-to-action con imágenes flotantes dispersas |
| 01 | **Services** | `Services.jsx` + `Services.css` | **Componente más complejo** (~737 líneas). Showcase de 7 servicios con video/imagen de fondo. Desktop: panel de miniaturas lateral + sidebar con iconos. Mobile: navegación con flechas + drawer bottom-sheet |
| 02 | **Projects** | `Projects.jsx` + `Projects.css` | Portafolio con 6 layouts diferentes por cliente: hero, mosaic, minimal, filmstrip, split, scattered. Mobile tiene layouts propios (mHero, mMosaic, mCard) |
| 03 | **PhotoGallery** | `PhotoGallery.jsx` + `PhotoGallery.css` | Galería de fotos con preview en la home |
| 04 | **Blog** | `Blog.jsx` + `Blog.css` | Grilla de posts cargados desde WordPress REST API. Skeleton loading, manejo de errores |
| 05 | **ContactForm** | `ContactForm.jsx` + `ContactForm.css` | Formulario con validación + EmailJS (doble envío: notificación + auto-reply). Layout 2 columnas: info + formulario |

### Componentes de soporte

| Componente | Descripción |
|-----------|-------------|
| **Navigation** | Navbar con logo, 6 links (Servicios, Proyectos, Galería, Blog, Nosotros, Contacto), CTA button, hamburger mobile. Maneja navegación SPA (anchors `#`) y routes (`/gallery`) |
| **ChatWidget** | Bot conversacional multi-step: Greeting → Servicios → Nombre → Email → Phone → Mensaje → Envío a API → Done. Incluye botón WhatsApp y "Agendar reunión" |
| **Footer** | Marquee con servicios, 3 columnas (brand + links + mapa Google), links legales, botón "back to top" |
| **Gallery** | Página completa de galería con hero de imágenes DAK, filtrado por categorías, masonry grid, lightbox |
| **Carousel** | Componente carrusel reutilizable |
| **LiquidLogo** | Efecto líquido sobre el logo SVG |

---

## 6. APIs e Integraciones

### 6.1 EmailJS (Formulario de Contacto)

**Propósito:** Enviar emails directamente desde el navegador sin backend propio.

| Parámetro | Variable de entorno |
|-----------|-------------------|
| Public Key | `VITE_EMAILJS_PUBLIC_KEY` |
| Service ID | `VITE_EMAILJS_SERVICE_ID` |
| Template Notificación | `VITE_EMAILJS_TEMPLATE_NOTIFICATION` |
| Template Auto-reply | `VITE_EMAILJS_TEMPLATE_AUTOREPLY` |

**Flujo:**
1. Usuario llena formulario (nombre, email, servicio, mensaje)
2. Se envía email de notificación a `marketing@dakagency.net`
3. Se envía email de confirmación automática al cliente
4. Ambos usan `emailjs.send()` del paquete `@emailjs/browser`

**Template params enviados:**
```js
{
  from_name, from_email, service, message,
  to_email: 'marketing@dakagency.net',
  reply_to: formData.email
}
```

### 6.2 WordPress REST API (Blog)

**Endpoint:** `https://dakagency.net/blog/wp-json/wp/v2/posts`

**Hook:** `useWordPressPosts(limit)`

```js
// Ejemplo de llamada
fetch(`https://dakagency.net/blog/wp-json/wp/v2/posts?per_page=${limit}&_embed`)
```

**Datos formateados devueltos:**
```js
{ id, title, excerpt, date, link, featuredImage, categories, author }
```

> [!NOTE]
> El link de WordPress se convierte de absoluto a relativo para mantener navegación dentro del sitio. El blog WordPress vive en `/blog/` y se excluye del routing SPA.

### 6.3 API de Leads (Chat Widget)

**Base URL:** `VITE_API_URL` → `https://admin.dakagency.net`

**Endpoint:** `POST /api/leads`

**Body:**
```json
{
  "nombre": "...",
  "email": "...",
  "telefono": "...",
  "servicio": "...",
  "mensaje": "...",
  "fuente": "website-chat",
  "fecha": "2026-06-12T..."
}
```

> [!WARNING]
> Si la API falla, el chat widget muestra un fallback con WhatsApp como contacto alternativo. No bloquea la experiencia del usuario.

### 6.4 Cloudflare / Cloudinary (Media)

- **Videos de servicios** se sirven desde **Cloudinary**: `res.cloudinary.com/dm4ijuzmi/video/upload/...`
- Algunos servicios usan imágenes estáticas locales (`/images/web_design.png`, etc.) en lugar de video

### 6.5 Enlaces externos

| Destino | URL |
|---------|-----|
| Agendar reunión | `https://plan.dakagency.net/agendar.html` |
| Cotizar paquetes | `https://plan.dakagency.net` |
| WhatsApp | `https://api.whatsapp.com/send/?phone=51906765040` |

---

## 7. Variables de Entorno

Archivo: `.env.local` (NO se commitea)

```env
VITE_EMAILJS_PUBLIC_KEY=QtRdYOqHr4-zNgIUY
VITE_EMAILJS_SERVICE_ID=service_feg2or7
VITE_EMAILJS_TEMPLATE_NOTIFICATION=template_9rfcj3j
VITE_EMAILJS_TEMPLATE_AUTOREPLY=template_y7y363r
VITE_API_URL=https://admin.dakagency.net
```

> [!CAUTION]
> Los valores reales están en el comentario dentro de `src/config/emailjs.js`. El `.env.example` contiene placeholders genéricos.

---

## 8. Sistema de Diseño (CSS)

### Paleta de colores principal

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-primary` | `#030106` | Negro profundo (fondo) |
| `--color-secondary` | `#B024FF` | Púrpura brillante (acento principal) |
| `--color-accent` | `#B024FF` | Mismo púrpura |
| `--color-white` | `#ffffff` | Texto principal |

### Colores por servicio

| Servicio | Color |
|----------|-------|
| Branding | `#B024FF` |
| Fotografía | `#00C8C8` |
| Video | `#00B478` |
| Social Media | `#D4A574` |
| Diseño Web | `#FF6B35` |
| SEO & Ads | `#4A90E2` |
| Automatización | `#9B59B6` |

### Tipografía
- Font stack del sistema: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'...`
- Headings con `clamp()` para responsive (ej: `h1: clamp(3rem, 8vw, 8rem)`)
- Font weights: 600-900

### Breakpoints
- **Mobile:** `< 768px`
- **Tablet:** `768px - 1024px`
- **Desktop:** `> 1024px`

### Efectos visuales
- **Cursor Grid Reveal:** Grilla SVG que aparece alrededor del mouse (desktop only)
- **Glow effects** con `box-shadow` púrpura
- **Gradientes** lineales con el color brand
- **Animaciones:** fadeIn, slideUp, pulse, parallax scrolling
- **`prefers-reduced-motion`** respetado

---

## 9. Deployment / CI-CD

### Pipeline (automatizado)

```mermaid
graph LR
    A["git push main"] --> B["GitHub Actions"]
    B --> C["npm ci"]
    C --> D["npm run build"]
    D --> E["rsync/SSH → Hostinger"]
    E --> F["dakagency.net LIVE"]
```

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

- **Trigger:** Push a `main`
- **Runner:** `ubuntu-latest`
- **Node:** v20
- **Build:** `npm run build` (que ejecuta `vite build && bash .hostinger/deploy.sh`)
- **Deploy:** `rsync -avz --delete --exclude='blog/' --exclude='.builds/'`
- **Destino:** `/home/u567580447/domains/dakagency.net/public_html/`

### Script post-build (`.hostinger/deploy.sh`)

1. **SAVE:** Respalda WordPress live (`public_html/blog/`) a `/home/u567580447/wordpress_blog/`
2. **COPY:** Copia el respaldo a `dist/blog/`
3. **THEME:** Actualiza tema `dak-informando` desde el repo

> [!IMPORTANT]
> El `--exclude='blog/'` en rsync es **CRÍTICO** para no borrar WordPress durante deploy. El blog se preserva independientemente.

### Hosting

| Concepto | Detalle |
|----------|---------|
| **Proveedor** | Hostinger |
| **IP** | `89.116.115.11` |
| **Puerto SSH** | `65002` |
| **Usuario** | `u567580447` |
| **Path** | `/home/u567580447/domains/dakagency.net/public_html/` |
| **Secret requerido** | `SSH_PRIVATE_KEY` (en GitHub Secrets) |

### Cómo subir cambios

```bash
# 1. Hacer cambios
# 2. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# El deploy es AUTOMÁTICO vía GitHub Actions
```

### Build local (sin deploy)

```bash
npm run local-build    # Solo vite build, sin deploy.sh
```

---

## 10. WordPress — Blog integrado

### Ubicación
- **URL:** `https://dakagency.net/blog/`
- **Tema custom:** `wordpress-theme/dak-informando/`
- **Archivos del tema:** `style.css`, `functions.php`, `header.php`, `footer.php`, `front-page.php`, `single.php`, `index.php`

### Coexistencia SPA + WordPress
El `.htaccess` en `public/` maneja esto:
```apache
# WordPress: pasa todo /blog/ a WordPress
RewriteRule ^blog(/.*)?$ - [L]

# SPA: todo lo demás va a index.html
RewriteRule . /index.html [L]
```

### Integración con React
- El componente `Blog.jsx` usa el hook `useWordPressPosts()` para cargar posts vía REST API
- Los posts se muestran como tarjetas en la home, con link al blog WordPress

---

## 11. SEO

### Meta tags (`index.html`)
- Title, description, keywords en español
- Open Graph (Facebook/WhatsApp)
- Twitter Cards
- Schema.org JSON-LD (`MarketingAgency`)
- Canonical URL: `https://dakagency.net/`

### robots.txt
- Permite crawling general
- Bloquea `wp-admin/`, `wp-login.php`, `wp-includes/`
- Bloquea bots de scraping (AhrefsBot, SemrushBot, etc.)
- Sitemap: `https://dakagency.net/blog/sitemap_index.xml`

### .htaccess
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`)
- Cache de assets estáticos (imágenes 1 año, CSS/JS 1 mes)

---

## 12. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local (puerto 3000, auto-open)
npm run dev

# Build producción (+ intenta deploy)
npm run build

# Build local sin deploy
npm run local-build

# Preview del build
npm run preview
```

---

## 13. Patrones y Convenciones

### Estructura de componentes
- Cada componente tiene su `.jsx` + `.css` en `src/components/`
- Imports de CSS propios al inicio del componente
- Animaciones con Framer Motion (`motion.div`, `useInView`, `AnimatePresence`)
- Responsive handling: `useEffect` con `window.innerWidth <= 768` → `isMobile` state

### Data
- Los datos de clientes/portfolio están en `src/data/portfolioData.js`
- Los datos de galería están en `src/data/galleryData.js`
- Imports de imágenes usan imports estáticos de ES modules (Vite los optimiza)

### Navegación interna
- Links anchor (`#services`, `#projects`, etc.) → `scrollIntoView({ behavior: 'smooth' })`
- Links de ruta (`/gallery`) → `navigate()` de React Router
- Si estás en `/gallery` y clickeas un anchor → primero navega a `/`, espera 100ms, luego scroll

### Idioma
- Todo el contenido visible está en **español**
- Código y comentarios mezclados español/inglés

---

## 14. Dependencias completas

### Producción
```json
{
  "@emailjs/browser": "^4.4.1",
  "framer-motion": "^11.0.8",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "installed"
}
```

### Desarrollo
```json
{
  "@types/react": "^18.3.1",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react": "^4.3.0",
  "vite": "^5.2.11"
}
```

---

## 15. Notas Importantes para IAs

> [!TIP]
> **Para editar estilos globales:** Modificar `src/index.css` (variables CSS en `:root`)  
> **Para agregar un nuevo servicio:** Editar el array `services` dentro de `Services.jsx` y agregar video/imagen correspondiente  
> **Para agregar un cliente:** Editar `src/data/portfolioData.js` y `src/data/galleryData.js`, agregar imágenes en `src/assets/clients/`  
> **Para cambiar colores brand:** Editar las CSS variables en `src/index.css` bajo `:root`

> [!WARNING]
> - **NO borrar `/blog/`** durante deploys — WordPress vive ahí  
> - **NO commitear `.env.local`** — contiene claves de EmailJS  
> - Los videos de Cloudinary son externos; si se caen, los servicios 1-4 pierden su fondo  
> - `react-router-dom` aparece en el código pero **no está explícitamente en package.json** — se instala como dependencia transitiva o podría haberse instalado manualmente

> [!NOTE]
> El proyecto no tiene tests automatizados. No hay i18n formal. No hay state management global (todo es local state con useState). No hay SSR — es una SPA pura servida como archivos estáticos.
