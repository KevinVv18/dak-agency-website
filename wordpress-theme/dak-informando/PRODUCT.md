# Product

<!-- impeccable:product-schema 1 -->

> **Alcance:** el blog de DAK Agency (`dakagency.net/blog/`), servido por el tema
> WordPress `dak-informando`. Este archivo vive dentro del tema porque el tema es
> lo único versionado del blog; el WordPress en sí se administra en vivo.

## Platform

web

## Users

**Usuario primario: dueño o encargado de marketing de un negocio pequeño o mediano de Chiclayo y Lambayeque.** No conoce a DAK: llega desde una búsqueda en Google con un problema concreto ("por qué no me llegan clientes por Facebook", "cuánto cuesta una página web", "cómo aparecer en Google"). Aterriza **en un post suelto, no en la portada**.

Está evaluando dos cosas a la vez, aunque solo admita la primera: si el artículo le resuelve la duda, y si quien lo escribió sabe lo suficiente como para contratarlo.

**Usuario secundario:** el propio equipo de DAK, que enseña la portada en reuniones como prueba de que la agencia produce contenido serio.

## Product Purpose

Captar demanda de búsqueda en el nicho local y convertirla en leads para DAK. No es un blog de marca ni un diario de la empresa: es **infraestructura de posicionamiento**. Cada artículo existe para rankear por una intención concreta y llevar al lector hacia la página pilar del servicio que resuelve su problema.

Éxito = el lector resuelve su duda, cree en quien se la resolvió y pide una cotización. Fracaso = rebota, o resuelve la duda pero no confía en el autor.

## Positioning

Contenido escrito para el mercado lambayecano real, con precios en soles, ejemplos locales y realidades del negocio de provincia. La competencia son blogs de agencias de Lima o traducciones genéricas que hablan de presupuestos y contextos que no aplican aquí.

## Operating Context

- El lector llega **de Google, a un post, y muchas veces desde el celular**.
- Los artículos son largos (guías) y se leen de corrido; el TOC lateral existe por eso.
- Se publica **3 posts/semana** (Lun/Mié/Vie) de forma automatizada; el diseño debe funcionar sin curaduría manual por post.
- Cada post cierra con un bloque «Servicio relacionado» que apunta a su página pilar.

## Capabilities and Constraints

**Arquitectura SEO — intocable, es el activo del proyecto:**
- **49 posts + 6 páginas pilar** (`agencia-seo-chiclayo`, `diseno-web-chiclayo`, `agencia-de-publicidad-en-redes-chiclayo`, `agencia-de-redes-sociales-chiclayo`, `automatizacion-para-negocios-chiclayo`, `agencia-de-branding-chiclayo`), todas en `/blog/<slug>/`.
- **Clusters enlazados en ambos sentidos**: pilar→posts y posts→pilar.
- **Las URLs no cambian. Nunca.**
- Rank Math gestiona meta, schema FAQ y sitemap. La jerarquía semántica de encabezados (h1→h2→h3) alimenta tanto al buscador como al TOC que genera `single.php`.

**Técnicas:**
- Tema WordPress clásico (PHP), sin build. `style.css` con cache-busting por `filemtime()`.
- Plantillas: `front-page.php` (portada), `single.php` (post), `page.php` (pilares, reutiliza estilos de single), `category.php`, `index.php`.
- Se despliega con rsync **sin `--delete`**, limitado a la carpeta del tema.
- El contenido de los posts viene de `_blog-content/` como HTML de WordPress: el diseño debe verse bien con marcado que no controla el tema (h2, h3, p, ul, blockquote, img, tablas).

## Brand Commitments

- **Púrpura `#B024FF`**: color de DAK, presente también en la web principal. Se conserva como firma.
- El blog debe quedar atribuido a DAK Agency y conservar su ruta al servicio (WhatsApp, agenda, correo).
- Confirmado por el usuario (2026-07-25): **la paleta y el tono quedan libres** salvo ese púrpura de firma. La estética actual (crema + Playfair + maqueta de periódico) no es un compromiso de marca, es una decisión heredada revisable.

## Evidence on Hand

- 49 artículos reales publicados, con imágenes destacadas propias.
- 6 páginas pilar de servicio con copy de conversión.
- Datos de mercado local recogidos por el equipo (precios en soles, comparativas de agencias locales).
- **No hay** métricas de tráfico ni testimonios de lectores a la vista en esta sesión: no deben inventarse cifras de audiencia, rankings ni casos de éxito.

## Product Principles

1. **El post es la portada.** La mayoría del tráfico entra por un artículo; esa página carga el peso de la primera impresión.
2. **Credibilidad antes que espectáculo.** El lector está evaluando si contratar. Confirmado por el usuario: el fracaso es verse poco serio.
3. **La legibilidad de un texto largo es la función principal**, no un detalle de acabado.
4. **El SEO es el activo**: URLs, semántica y enlazado interno se preservan pase lo que pase.
5. **Debe aguantar contenido automatizado**: se publica sin diseñador de por medio, tres veces por semana.

## Accessibility & Inclusion

Sin requisito formal del cliente. Piso heredado del pase de refinamiento (2026-07-25), que no debe revertirse: contraste AA en texto de cuerpo y metadatos, texto funcional ≥11px, interlineado ≥1.3 en titulares multilínea, medida de lectura ~75 caracteres.
