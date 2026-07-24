# Product

<!-- impeccable:product-schema 1 -->

> **Alcance:** este registro cubre el demo inmobiliario de `_inmobiliaria-demo/`
> (publicado en inmobiliaria.dakagency.net), no todo el repositorio DAK_WP.
> Vive en la raíz a propósito: `_inmobiliaria-demo/` se despliega con
> `rsync --delete` y cualquier archivo ahí queda accesible públicamente.

## Platform

web

## Users

**Usuario primario: el dueño o director comercial de una inmobiliaria, desarrolladora o lotizadora de Chiclayo y Lambayeque.** No llega por búsqueda: lo ve porque alguien de DAK le pasa el celular en una reunión y recorre un guion de ~5 minutos. Está evaluando si contratar el desarrollo de su propia web. Su pregunta real no es "¿me gusta?", sino "¿esto puede ser mío, y me hace ver mejor que mi competencia?".

Perfil confirmado: conservador, compra confianza, compara contra webs locales de Chiclayo y contra las de los grandes de Lima.

**Audiencia simulada dentro del producto:** el comprador de vivienda de la región. Existe como personaje del escenario que el demo representa, no como visitante real de esta URL. El sitio lleva `noindex`.

## Product Purpose

Es un **mostrador comercial**, no una inmobiliaria. Su trabajo es vender servicios de desarrollo web al nicho inmobiliario demostrando capacidades en vivo en lugar de describirlas en una propuesta. Reúne en un solo sitio todos los niveles de cliente del nicho (corredor independiente → desarrolladora establecida) para que una sola demo sirva a cualquier prospecto.

Éxito = el prospecto pide presupuesto en esa misma reunión. Fracaso = le parece "una web más".

## Positioning

Capacidades que, según investigación de jul-2026, **ninguna web inmobiliaria local de Chiclayo ofrece** y que en Lima solo tienen los grandes:

- Recorrido 360° **self-hosted y open source**: el cliente no paga mensualidad de Matterport (~US$70/mes) ni Kuula. Se paga una vez y es suyo.
- Simulador de cuota que deja al comprador autoconvencerse con números antes de llamar.
- Avance de obra online, que ataca el miedo #1 del comprador en el norte: la estafa.
- Leads que caen en un CRM con presupuesto y proyecto de interés, en vez de perderse en Messenger.

Y el argumento transversal: **adaptable a la marca del cliente en días, no meses.**

## Operating Context

- Se enseña **desde un celular, en una reunión presencial**, no en un escritorio con calma. El primer viewport en móvil es la superficie que más trabaja.
- Guion de venta de 7 momentos, documentado en `PITCH.md` del repo `paginas/demo-inmobiliaria`. El golpe central es el tour 360°.
- Mercado: Lambayeque es la 2ª región del Perú en créditos MiVivienda. Competencia local nombrada: Menorca, Marka, Cissac, La Muralla, Villa del Norte.
- Checklist de descubrimiento del prospecto en PITCH.md (nº de proyectos, si hay piloto físico o renders para producir el 360, tipo de financiamiento, cómo reciben leads hoy).

## Capabilities and Constraints

- **Un solo archivo HTML estático** (`_inmobiliaria-demo/index.html`, ~83 KB) con CSS y JS embebidos. Sin paso de build, sin framework, sin dependencias npm en runtime.
- Despliegue automático por GitHub Actions (`deploy-inmobiliaria.yml`) con `rsync --delete` al docroot del subdominio. Todo lo que viva en esa carpeta se publica.
- Visor 360°: Pannellum, servido localmente desde `vendor/`.
- Leads: `POST` a `admin.dakagency.net/api/lead`; con fallback a WhatsApp.
- El sitio lleva `noindex` y debe conservar su marca visible de DEMO y el crédito a DAK Agency.
- Existe una versión React anterior (`paginas/demo-inmobiliaria`), congelada desde 2026-07-08. No es la que se publica.

## Brand Commitments

**Ninguna vinculante.** Confirmado por el usuario (2026-07-24): la marca ficticia NORVIA —nombre, paleta oro sobre negro e ícono de casa— es reemplazable en su totalidad.

Lo único que debe sobrevivir: la señal de que es un **demo** y la atribución a **DAK Agency**.

## Evidence on Hand

**Real:**
- Datos de mercado de jul-2026 (posición de Lambayeque en MiVivienda; ausencia de 360/simulador/avance de obra en las webs locales; costos de Matterport/Kuula).
- Fotografía de stock (Unsplash/Pexels) y panorámicas equirectangulares CC0 de Poly Haven, en `_inmobiliaria-demo/assets/`.
- Las capacidades demostradas funcionan de verdad: el 360, el simulador, los filtros y el envío de leads al CRM no son maquetas.

**Inventado, y no debe presentarse como real:** NORVIA no existe. Sus propiedades, precios en soles, estadísticas ("12 años", "1850 familias") y los tres testimonios con nombre y foto son material de demostración. Deben quedar legibles como demo y **no deben ampliarse con nuevas cifras comerciales, clientes ni casos de éxito inventados.**

## Product Principles

1. **Demostrar, no describir.** Cada sección existe para que el prospecto vea una capacidad funcionando. Una sección que solo afirma algo es longitud, no argumento.
2. **El celular es la superficie principal**, porque ahí ocurre la venta.
3. **Ser clonable es parte del producto.** Lo que no se pueda rehacer con la marca de un cliente en días, no sirve como argumento.
4. **Superar a la competencia local es el listón mínimo**; la referencia real son las webs de Lima.
5. **Lo ficticio se ve ficticio.** El demo puede ser espectacular, pero nunca puede hacer pasar datos inventados por reales.

## Accessibility & Inclusion

Sin requisito formal establecido por el cliente. Restricción heredada del trabajo previo: se corrigieron contraste, jerarquía de encabezados y tamaños mínimos de texto (11px), y no deben reintroducirse regresiones. El hero mantiene deliberadamente su kicker dorado sobre cielo, decisión consciente del usuario registrada en `.impeccable/config.json`.
