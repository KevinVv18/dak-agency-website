# Guía de Inicio Rápido - DAK Agency Website

## 🎉 ¡Proyecto Completado con Estilo Geométrico!

Tu sitio web de DAK Agency está listo con el **diseño geométrico audaz** inspirado en Innostart. Este proyecto replica el estilo blocky, simétrico y moderno con bordes definidos y bloques de color atrevidos.

## 📦 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:3000`

## 🎨 Personalización de Colores

Los colores se gestionan mediante CSS Variables para facilitar cambios. Abre `src/index.css` y modifica:

```css
:root {
  --color-primary: #000002;    /* Color principal (negro) */
  --color-secondary: #a040ec;  /* Color secundario (púrpura) */
  --color-accent: #6b21a8;     /* Color de acento */
  --color-light: #f3e8ff;      /* Color claro */
}
```

**Prueba diferentes combinaciones:**
- Para un look más vibrante: `--color-primary: #1a1a2e; --color-secondary: #ff006e;`
- Para un estilo corporativo: `--color-primary: #0f172a; --color-secondary: #3b82f6;`
- Para un toque moderno: `--color-primary: #18181b; --color-secondary: #a855f7;`

## 📸 Imágenes a Reemplazar

### 1. Logo DAK
**Ubicación:** Navegación y Footer  
**Tipo:** Logo vectorial (SVG)  
**Recomendación:** Logo simple con transparencia

### 2. Hero Section
**Ubicación:** `src/components/Hero.jsx` línea 52-64  
**Tipo:** Imagen decorativa o ilustración  
**Tamaño:** 500x500px aprox  
**Formato:** WebP o PNG

### 3. Services Icons (5 imágenes)
**Ubicación:** `src/components/Services.jsx` línea 50-60  
**Tipo:** Iconos o ilustraciones isométricas  
**Tamaño:** 400x300px  
**Formato:** WebP o SVG  
**Servicios:**
- Social Media Management
- Web Development
- SEO & SEM
- Branding
- Content Creation

### 4. Project Screenshots (4 imágenes)
**Ubicación:** `src/components/Projects.jsx` línea 82-96  
**Tipo:** Screenshots de proyectos o mockups  
**Tamaño:** 600x400px  
**Formato:** WebP o JPG  
**Aspecto:** 3:2 ratio

### 5. Blog Thumbnails (3 imágenes)
**Ubicación:** `src/components/Blog.jsx` línea 85-97  
**Tipo:** Imágenes de artículos  
**Tamaño:** 500x300px  
**Formato:** WebP o JPG  
**Aspecto:** 5:3 ratio

### 6. CTA Floating Images (6 imágenes) ⭐ IMPORTANTE
**Ubicación:** `src/components/CTASection.jsx` línea 80-92  
**Tipo:** Imágenes minimalistas/abstractas (estilo product photography)  
**Tamaño:** 200x200px  
**Formato:** WebP o JPG  
**Estilo:** Fotografías de objetos con fondos de colores sólidos (similar a Innostart)  
**Ejemplos:** flores, objetos geométricos, productos minimalistas

**Estas son las más importantes visualmente!**

## 🎬 Animaciones Implementadas

### ✅ Hero Section
- Título con fade + slide up desde abajo
- Subtítulo con slide desde la derecha
- CTA con bounce effect

### ✅ Cards (Services, Projects, Blog)
- Grid stagger animation (cada card aparece con 0.1s de delay)
- Hover con scale y shadow
- Image zoom en hover

### ✅ CTA Section - ¡La Estrella del Show! ⭐
**Animación de Imágenes Dispersas:**
- 6 imágenes comienzan agrupadas en el centro (scale: 0.3, opacity: 0)
- Al hacer scroll, se dispersan a posiciones específicas con rotación
- Efecto bounce al aparecer
- Parallax adicional durante el scroll
- Esta es la animación más impresionante del sitio

### ✅ Form Interactions
- Focus con scale + border color transition
- Label animations
- Validation con mensajes animados
- Loading state con spinner

## 🎨 Características del Diseño Geométrico

### Estilo Innostart Aplicado:
✅ **Tipografía MASIVA** - Títulos que dominan toda la pantalla  
✅ **Bloques de color audaces** - Secciones con fondos de colores sólidos y vibrantes  
✅ **Bordes geométricos negros** - Líneas de 2-3px que dividen secciones  
✅ **Grid sin gaps** - Cards con bordes compartidos para efecto blocky  
✅ **Layouts asimétricos** pero perfectamente balanceados  
✅ **Línea vertical izquierda** en hero (como Innostart)  
✅ **Franja horizontal de subtítulo** que cruza toda la página  
✅ **Bloques de dos colores** en hero (púrpura + turquesa)  
✅ **Ancho completo** - Sin max-width en containers, uso total del viewport  
✅ **Blog horizontal** - Layout con imagen izq, contenido der, círculo negro con flecha  
✅ **Fondos pasteles** - Cada blog card con color diferente (rosa, azul, naranja, amarillo)

### Características Técnicas:
✅ **Navigation responsive** - Estilo Innostart con logo en caja, flechas en links, botón CTA  
✅ **Logo con borde** - Cuadro negro alrededor del logo DAK  
✅ **Flechas en navegación** - Símbolo "↳" antes de cada link  
✅ **Botón CTA negro** - "GET STARTED" en navbar estilo Innostart  
✅ **Hero section** con diseño de 3 capas (título masivo / franja / bloques)  
✅ **Services section** con grid sin gaps y bordes compartidos  
✅ **Projects preview** con grid 2x2 y bordes geométricos  
✅ **Blog preview** con layout horizontal y círculos negros con flecha  
✅ **CTA section** con 6 imágenes flotantes dispersándose (¡animación clave!)  
✅ **Contact form** con validación completa  
✅ **Footer** con descripción, links y redes sociales  
✅ **Responsive design** optimizado para móvil, tablet y desktop  
✅ **Smooth scroll** entre secciones  
✅ **CSS Variables** para fácil personalización de colores  

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

Todas las secciones están optimizadas para estos breakpoints.

## 🛠️ Estructura del Proyecto

```
dak-agency-website/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx/css
│   │   ├── Hero.jsx/css
│   │   ├── Services.jsx/css
│   │   ├── Projects.jsx/css
│   │   ├── Blog.jsx/css
│   │   ├── CTASection.jsx/css (¡ANIMACIÓN ESTRELLA!)
│   │   ├── ContactForm.jsx/css
│   │   └── Footer.jsx/css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css (CSS Variables aquí)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Próximos Pasos

1. **Instala las dependencias:** `npm install`
2. **Inicia el servidor:** `npm run dev`
3. **Personaliza los colores** en `src/index.css`
4. **Reemplaza las imágenes placeholder** (especialmente las 6 de la sección CTA)
5. **Ajusta los textos** según tu marca
6. **Conecta el formulario** a tu backend cuando esté listo

## 💡 Tips de Optimización

### Para mejorar el rendimiento:

1. **Optimiza las imágenes:**
   - Usa formato WebP cuando sea posible
   - Comprime las imágenes (TinyPNG, Squoosh)
   - Usa lazy loading para imágenes below the fold

2. **Build para producción:**
```bash
npm run build
```

3. **Preview del build:**
```bash
npm run preview
```

## 🎨 Recursos para Imágenes

**Para las 6 imágenes flotantes de la sección CTA:**
- [Unsplash](https://unsplash.com) - Fotografías de alta calidad
- [Pexels](https://pexels.com) - Imágenes gratuitas
- Busca: "minimalist objects", "product photography", "colorful background"

**Para iconos de servicios:**
- [Undraw](https://undraw.co) - Ilustraciones SVG personalizables
- [Storyset](https://storyset.com) - Ilustraciones animadas
- [Freepik](https://freepik.com) - Iconos e ilustraciones

## 📞 Soporte

Si tienes preguntas o necesitas ajustes, revisa:
- El `README.md` principal
- Los comentarios en el código
- La documentación de [Framer Motion](https://www.framer.com/motion/)

## 🎉 ¡Disfruta tu nuevo sitio web!

Todos los to-dos han sido completados. El sitio está listo para desarrollo adicional.

