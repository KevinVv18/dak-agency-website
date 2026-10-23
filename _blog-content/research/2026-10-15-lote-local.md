# Lote editorial — 15 de octubre de 2026

## Entrega solicitada

- Viernes 16 de octubre de 2026, 04:00:00, America/Lima: `0080-artesania-de-monsefu-catalogo-digital`.
- Miércoles 21 de octubre de 2026, 04:00:00, America/Lima: `0081-como-presentar-un-producto-en-una-feria`.
- Fechas confirmadas por Kevin en esta conversación. Horario contrastado con las publicaciones reales del blog: las últimas corridas regulares registran las 04:00 de Perú (09:00 UTC).
- Programación explícita con estado `future` usando el importador existente. La idempotencia por slug considera cualquier estado, así que el drip no debe adelantar el artículo del miércoles a la corrida del lunes.
- Sin cambios en workflows, protección de deploy, autenticación ni configuración de Hostinger. Sin push a main.

## Investigación: ventana 8–15 de octubre

Se eligieron señales de actualidad y eventos futuros locales. No se dispone de una serie de Google Trends para Lambayeque: no se presentan volúmenes, porcentajes de crecimiento ni posiciones de tendencia.

### 0080 · Artesanía de Monsefú

- Señal reciente: entrevista de Andina a la artesana Manuela Ayasta, publicada el 9 de octubre; preparativos de talleres de Monsefú ante la visita papal prevista para noviembre.
- Fuente directa de la entrevista: [Andina, 9-oct-2026](https://andina.pe/agencia/noticia-papa-leon-chiclayo-artesanas-monsefu-preparan-prendas-y-recuerdos-unicos-1095348.aspx).
- Términos elegidos: **artesanía de Monsefú**, **bordados de Monsefú**, **catálogo digital para artesanos**. Selección editorial por su relación con el hecho local, no clasificación medida de Google Trends.
- Intención: presentar y describir piezas de un taller; no repetir la guía general de fotografía, el artículo de ecommerce ni el manual de marca.
- Construcción: escena de compra → información invisible → ficha anotada con campos pendientes → disponibilidad frente a encargo. Ejemplo identificado como ficticio.
- Categoría existente: `por-rubro`.

### 0081 · Demostración en feria

- Señales recientes: anuncio de Perú con Ciencia recogido por Andina el 9 de octubre y confirmación de participación de Universidad Científica del Sur del 12 de octubre.
- Evento futuro: 29–31 de octubre, Parque Miguel Grau, La Victoria, Chiclayo, según el anuncio consultado.
- Fuentes: [Andina, 9-oct-2026](https://andina.pe/agencia/noticia-feria-peru-ciencia-2026-se-realizara-chiclayo-del-29-al-31-octubre-1095248.aspx), [Universidad Científica del Sur, 12-oct-2026](https://investigacion.cientifica.edu.pe/la-cientifica-participara-en-la-edicion-2026-de-peru-con-ciencia-con-proyectos-de-medicina-y-biologia-marina/).
- Términos elegidos: **Perú con Ciencia 2026**, **ferias en Chiclayo**, **cómo presentar un producto en una feria**. Oportunidad editorial contextual, sin atribuirles volúmenes medidos.
- Intención: explicar un prototipo a visitantes; no repetir el calendario comercial, la guía de video ni el seguimiento de prospectos.
- Construcción: diálogo → ensayo por tiempos → observación del resultado → prueba de comprensión. Los noventa segundos son una pauta editorial; el aparato de ejemplo es ficticio.
- Categoría existente: `publicidad`.

## Estado previo contrastado con WordPress

- `0076`, `0077` y `0079` siguen en la cola del repositorio, pero WordPress los registra publicados (IDs 289, 291 y 293).
- `0078-que-publicar-en-diciembre` no figura publicado y carece de imagen en el staging; se conserva sin alterarlo.
- No había entradas en estado `future` al comenzar.
- Mayor prefijo observado en `origin/main` actualizado: `0079`. Reservados aquí `0080` y `0081`.

## Imágenes finales

Generadas mediante la herramienta integrada **imagegen**, sin CLI ni claves nuevas. Ilustraciones conceptuales; no documentan talleres, instituciones o prototipos reales. Tanto el cuerpo como el ALT identifican su carácter ilustrativo.

- `../assets/0080-artesania-de-monsefu-catalogo-digital.webp`
- `../assets/0081-como-presentar-un-producto-en-una-feria.webp`

### Prompt final · 0080

Create a landscape 1536x1024 editorial blog cover for DAK Agency. Use-case: editorial-illustration. Topic: how artisan workshops in Monsefú, Lambayeque, Peru can show the origin and workmanship of an embroidered product in a digital catalogue. Make a sophisticated tactile still-life illustration, overhead composition: ivory woven cotton textile with rich restrained multicolored floral hand embroidery inspired by north-coast Peruvian craftsmanship, embroidery hoop, a simple unbranded product card and a phone displaying a close-up of the same fabric, interface with abstract lines only. Warm grazing light, physical textures, deep charcoal backdrop with restrained violet and teal reflected accents. Elegant editorial crop with generous breathing room, no people and no buildings. It must read as a conceptual illustration, not a documentary photograph of a real workshop or a reported news event. No text, no lettering, no numbers, no logo, no QR code. The cover should honor craft and material detail rather than resemble a generic marketing dashboard.

### Prompt final · 0081

Create a landscape 1536x1024 editorial blog cover for DAK Agency. Use-case: editorial-illustration. Topic: explaining a working innovation demo clearly at a science fair in Chiclayo. A bold architectural side-view cutaway illustration of a small exhibition counter with a functional tabletop water-loop demonstrator: a translucent elevated water reservoir, a simple visible tube, a small clear collection chamber, one hand-operated valve, and three sequential pools of teal light visually leading the eye from problem to action to observable result. A small portrait screen shows a magnified detail of the tubing, only abstract shapes, no writing. A few distant anonymous visitor silhouettes give scale, with the apparatus the focal point. Deep midnight blue gallery setting, sharp violet structural planes and teal illumination, precise sculptural 3D paper and glass materials, dramatically spacious asymmetrical composition. It must clearly be a conceptual editorial illustration, not a documentary photo of Peru con Ciencia or an actual institution's technology. No medical equipment, no branding, no text, no lettering, no numbers, no QR codes. Distinct from an overhead still-life cover.

## Comprobaciones y programación

- WordPress confirmó `future` para ambas entradas; título, extracto y cuerpo coinciden exactamente con los JSON, incluido el schema FAQ.
- **ID 295** — viernes 16-oct-2026, 04:00 America/Lima / 09:00 UTC. Imagen destacada **296** (WebP y ALT verificados).
- **ID 297** — miércoles 21-oct-2026, 04:00 America/Lima / 09:00 UTC. Imagen destacada **298** (WebP y ALT verificados).
- Rank Math conserva keyword, título y descripción esperados en los dos registros.
- Existen los dos eventos `publish_future_post`, para 16-oct 09:00 UTC y 21-oct 09:00 UTC.
- `wp cron test`: **Success: WP-Cron spawning is working as expected.**
- Los cuatro archivos nuevos están también en el staging existente `~/dak-autopost/queue/` y `~/dak-autopost/assets/`. Los SHA-256 coinciden con los locales.
- Imágenes: 1280 × 853 px; 0080 = **201.668 bytes**, 0081 = **41.786 bytes**, ambas bajo 300 KB.
- Cinco FAQs visibles por artículo; cada respuesta coincide con su entidad en el schema. SEO: títulos ≤60 caracteres y descripciones ≤155.
- Enlaces internos, agenda y fuentes: HTTP 200 al comprobarlos.
- Lectura visual local con el HTML/CSS del tema vigente, sustituyendo cuerpo, título, extracto e imagen: 1440 px y 390 px, sin desbordamiento horizontal e imágenes cargadas. Fue una comprobación local de presentación, no una vista previa autenticada de WordPress.
- No se ejecutó build de la SPA: no se modificaron código, rutas, estilos ni dependencias de esa superficie.
- Cambios del lote limitados a dos JSON, dos portadas y este registro. Las modificaciones previas de los worktrees se conservaron.

### Acceso a los registros programados

- [Editar entrada 295 en WordPress](https://dakagency.net/blog/wp-admin/post.php?post=295&action=edit)
- [Editar entrada 297 en WordPress](https://dakagency.net/blog/wp-admin/post.php?post=297&action=edit)

### Archivos de portada en el workspace

- [0080 · Artesanía de Monsefú](C:/Users/kevin/OneDrive/Desktop/paginas/DAK_WP/_blog-content/assets/0080-artesania-de-monsefu-catalogo-digital.webp)
- [0081 · Demostración en feria](C:/Users/kevin/OneDrive/Desktop/paginas/DAK_WP/_blog-content/assets/0081-como-presentar-un-producto-en-una-feria.webp)

