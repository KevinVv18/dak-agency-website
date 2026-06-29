# Estrategia SEO operativa — DAK Agency blog

> Base: documento del usuario `SEO_2026_Estrategia_DAK_Agency.docx` (sólido y bien
> fundamentado en Google Search Central). Este archivo lo **aterriza a nuestro caso
> real** y añade lo que faltaba según investigación de junio 2026. Es la referencia
> que sigue el generador de blogs (`_blog-content/`).

## 1. La verdad incómoda sobre nuestra arquitectura (lo más importante)
El doc recomienda **páginas comerciales por servicio/ciudad** (`/servicios/seo/`,
`/agencia-seo-chiclayo/`, etc.) como pilares que convierten. **Problema:** el sitio
principal `dakagency.net` es una **SPA de React (Vite, sin SSR)** → NO genera páginas
por-URL rastreables ni meta por página. Hoy el único activo realmente indexable y
con SEO on-page es el **WordPress en `/blog/`**.

**Decisión recomendada:** usar **WordPress como hub SEO**. Crear las páginas pilar/
servicio/local DENTRO de WP (p.ej. `/blog/servicios/seo-chiclayo/` o un WP en
`/servicios/`), no en la SPA. Alternativas: prerender/SSR para la SPA (más trabajo).
Hasta tener pilares, los posts enlazan a `/#services` y entre sí (parche, no ideal).

## 2. Reglas YA integradas al generador de blogs (workflow)
- **Investigación de keywords** (etapa con WebSearch): keywords reales + "preguntas que la gente hace" → al redactor.
- **Answer-first**: gancho corto + **respuesta directa y autocontenida en los primeros 150–200 palabras** (para AI Overviews/snippets, que ya salen en +25% de búsquedas). *(antes teníamos "loop abierto" que escondía la respuesta; corregido.)*
- **E-E-A-T / Experiencia** (clave por el **core update de marzo 2026** que premia la experiencia de primera mano): bloque **"Cómo lo hacemos en DAK"** + hablar desde la experiencia local.
- **Prueba accionable**: checklist, tabla o mini-ejemplo que el lector quiera guardar.
- **Localización real** Chiclayo/Lambayeque + CTA WhatsApp/agendar + contacto siempre.
- **No inventar datos** (revisión adversaria lo caza), tildes correctas, 1 solo H1 (el del tema), 5 FAQs + schema FAQPage, 2–4 enlaces internos, imagen destacada optimizada (<300 KB WebP).
- **Sitemap**: se regenera solo tras publicar (Rank Math) para que Google descubra.

## 2.1 Variedad geográfica y de alcance (no todo es "en Chiclayo")

No todos los posts deben terminar en "...en Chiclayo". Repetir el mismo gancho de
ciudad cansa al lector y hace que nuestros propios posts compitan por la misma
keyword. La variedad correcta abre **más búsquedas** y se ve más natural.

> ⚠️ **Regla de oro (anti-doorway):** variar geografía **solo con sustancia local
> real**. Clonar un post cambiando únicamente el nombre de la ciudad/distrito es una
> *doorway page* y Google la penaliza. Si no puedes decir algo genuino y específico
> de esa zona (rubros, zonas, problemas reales), **no crees esa variante**. Mejor 4
> posts geográficos con contenido real que 20 clones.

**Ejes de variedad permitidos:**
1. **Local (Chiclayo)** — el núcleo, la mayoría de posts.
2. **Distrital** (José Leonardo Ortiz, La Victoria, Pimentel, Pomalca, etc.) — válido
   **solo** con contexto propio del distrito, como `0016-marketing-digital-en-jose-leonardo-ortiz`
   (rubros de JLO, zonas, dinámica comercial). Pocos y buenos.
3. **Nacional (Perú)** — para keywords informativas de mayor volumen donde no peleamos
   con lo local (p. ej. "cuánto cuesta una página web en Perú", "tendencias de marketing
   en Perú 2026"). Repetir un tópico ya cubierto pero en clave nacional es válido.
4. **Otras ciudades donde SÍ vendemos: Lima y Trujillo** — DAK las atiende en
   **modalidad remota**, con **paquetes y precio adicional** (por la distancia/logística).
   Mencionarlo explícito y sin prometer oficina física: *"También trabajamos con negocios
   de Lima y Trujillo con paquetes especiales para trabajo remoto."*

**Calculadora de precios (CTA nuevo):** en posts de **costo/precio** o con CTA comercial,
enlazar además la calculadora **https://plan.dakagency.net/** ("calcula una referencia de
tu inversión al instante"), junto a WhatsApp y agendar. Es fondo de embudo y filtra leads.

## 3. Mapa de clusters (posts actuales → pilar)
> Tenemos muchos posts de SOPORTE pero **faltan las páginas PILAR** (ver §1). Crearlas en WP es la prioridad estructural.

| Cluster | Pilar a crear (WP) | Posts de soporte ya publicados/en cola |
|---|---|---|
| Buscadores/SEO | Agencia SEO en Chiclayo | SEO/SEM, Google Business Profile, cómo elegir agencia |
| Diseño web | Diseño web en Chiclayo | creación de páginas web, cuánto cuesta una página web |
| Publicidad/Ads | Publicidad (Meta Ads) en Chiclayo | Meta Ads, cuánto cuesta la publicidad en redes |
| Social/contenido | Gestión de redes y contenido | redes sociales, fotografía, video |
| Automatización | Automatización en Chiclayo | automatización de marketing |
| Branding | Branding en Chiclayo | branding (puede volverse pilar) |
| Por rubro (industria) | (enlazan a los pilares de arriba) | inmobiliario, clínicas dentales, restaurantes, spas, colegios |

**Regla:** cada post de soporte debe enlazar a su pilar (cuando exista) + 2–3 posts hermanos + un CTA comercial.

## 4. Lo que falta — estratégico (requiere tu decisión / dev, no es del generador)
1. **Páginas pilar/servicio en WordPress** (lo más importante; ver §1). Sin pilares, el blog atrae tráfico pero convierte poco.
2. **Autor E-E-A-T**: hoy los posts son de "dak_agency" sin bio. Google añadió sección "Authors" (feb 2026) y el core update premia credenciales verificables → crear página de autor/equipo con experiencia y bylines consistentes.
3. **Medición (lo que el doc llama "medir por leads"):** conectar **GA4 + Google Search Console** + eventos de clic a WhatsApp/formulario. Hoy no hay analítica de leads. Sin esto no sabemos qué keywords/posts traen clientes (la rueda de datos).
4. **SEO local operacional (alto ROI):** optimizar **Google Business Profile** (GBP = 32% del ranking local) y **reseñas** (16%; importan velocidad, recencia, responder ≥80%, y hay un salto notable al pasar de 9→10 reseñas). NAP consistente, fotos reales, categorías.
5. **Nombres de archivo de imagen descriptivos**: hoy WP las guarda como `featured.webp` / `featured-1.webp`. Mejor subir con nombre por slug+keyword (mejora SEO de imagen). *(ajuste pendiente en el publicador.)*
6. **Core Web Vitals** de la SPA (LCP/INP/CLS) — revisar aparte del blog.

## 5. Lo que NO haremos (alineado con el doc + políticas Google)
- Nada de 100 posts genéricos de IA sin experiencia (scaled content abuse).
- Nada de "GEO/AEO hacks" para manipular respuestas de IA (Google lo trata como spam).
- No indexar tags/archivos pobres; no backlinks de directorios basura.
- No una sola landing "marketing digital" para todo: separar por servicio/ciudad/industria.

## 6. Fuentes (verificadas jun-2026)
- Google: AI features / guía de optimización para IA, spam policies, Core Web Vitals, structured data, GBP guidelines, sitemaps, canonical, helpful content. (S1–S12 del doc original.)
- Core update marzo 2026: amplifica la "E" de Experiencia (experiencia de primera mano + autor con credenciales).
- AI Overviews: +25% de búsquedas; gana contenido answer-first, estructurado, original y mantenido.
- SEO local 2026: GBP ~32% del ranking local; reseñas ~16% (velocidad/recencia/respuesta).
