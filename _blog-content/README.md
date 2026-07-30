# Auto-publicación de blog — DAK Agency

Pipeline para publicar posts SEO al blog WordPress (`dakagency.net/blog/`) de forma
automática vía **SSH + WP-CLI**. No usa la REST API (la cabecera `Authorization` la
elimina el CDN de Hostinger), así que esto la evita por completo.

## Cómo funciona

```
queue/*.json   ──(publish.sh)──>  SSH ──> wp eval-file lib/wp-create-post.php ──> WordPress
                                                                                      │
   published/  <───────────────  se mueve el JSON tras crearse  ◀────────────────────┘
```

- **Yo (Claude) genero** los posts como archivos JSON en `queue/`, nombrados
  `NNNN-slug.json` (se publican en orden alfabético).
- **`publish.sh`** toma el **primer** JSON de la cola, lo sube por SSH y ejecuta
  `wp eval-file lib/wp-create-post.php` en el servidor, que inserta el post,
  setea Rank Math (focus keyword, título SEO, meta), asigna categoría y agrega el
  schema FAQ. Publica **uno por corrida** (drip).
- Es **idempotente**: si el slug ya existe en el blog, no lo recrea (lo salta y
  mueve el archivo a `published/`).
- El **cron real corre en el servidor** (hPanel, Lun/Mié/Vie **09:00 UTC = 04:00
  Perú**) sobre el staging `~/dak-autopost` y **no hace commit-back**: la cola del
  repo puede quedar desfasada del estado real del blog (verificar con la REST
  pública o el sitemap).
- El staging se actualiza por rsync desde Actions. Desde el 30-jul-2026,
  **"Blog Sync Staging"** (`blog-sync-staging.yml`) se dispara **automáticamente en
  cada push a `main` que toque `_blog-content/**`**: basta encolar el post y
  mergear para que el cron lo vea. Sigue el disparo manual por si acaso.
  `blog-autopublish.yml` (dispatch manual) sincroniza **y** publica 1 post al
  instante — úsalo cuando no quieras esperar al cron.
- ⚠️ Si publicas corriendo `publish.sh` **desde tu PC**, el post queda vivo pero el
  repo no se entera solo: mueve el JSON a `published/` y commitea el `.result.txt`,
  o el registro queda incompleto (pasó con 0044-0047 en jul-2026).
- ⚠️ **Numeración:** el prefijo `NNNN` debe ser único en el repo. Con varias
  sesiones trabajando en paralelo es fácil que dos usen el mismo número (pasó con
  `0043`): antes de crear un post, revisa el mayor en `published/` **de
  `origin/main` actualizado**, no solo el local.

## Formato de un post en cola (`queue/NNNN-slug.json`)

```json
{
  "title": "Título visible del post",
  "slug": "slug-seo-del-post",
  "excerpt": "Resumen corto (también sirve de meta si Rank Math no tiene una).",
  "category": 8,
  "content": "<p>HTML del cuerpo…</p>",
  "rank_math": {
    "focus_keyword": "keyword principal",
    "title": "Título SEO (≤60 car.)",
    "description": "Meta description (≤155 car.)"
  },
  "faq_jsonld": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [] },
  "featured_image_alt": "Texto ALT con keyword local para la imagen destacada",
  "tags": ["chiclayo", "marketing"]
}
```

Campos mínimos: `title` + `slug`. Todo lo demás es opcional.
`status` lo decide el workflow (`publish` por defecto); no hace falta ponerlo en el JSON.

**Imagen destacada:** se asocia por nombre — pon el archivo en
`assets/<mismo-nombre-que-el-json>.webp` (o `.jpg/.png`). `publish.sh` la sube y la
asigna sola. Ver [assets/README.md](assets/README.md) y el flujo con Google Drive.

## Uso manual (desde tu PC)

```bash
# Prueba segura: crea como BORRADOR (invisible al público)
POST_STATUS=draft bash _blog-content/publish.sh

# Publicar de verdad el siguiente de la cola
bash _blog-content/publish.sh
```

> Requiere tu llave SSH local (`~/.ssh/id_ed25519`, ya autorizada en Hostinger).

## Datos del servidor (referencia)

| | |
|---|---|
| Host / puerto / user | `89.116.115.11` : `65002` — `u567580447` |
| Ruta WP | `/home/u567580447/domains/dakagency.net/public_html/blog` |
| Categoría "Marketing" | id **8** (`marketing-digital`) |
| Autor (admin) | id **1** (`dak_agency`) |
| SEO | Rank Math (`seo-by-rank-math`) |

## Notas SEO (importante)

- Ritmo objetivo: **3 posts/semana**. No subir a "7/día" sin contenido local real:
  Google penaliza el *scaled content abuse* (caídas de 50–80% de tráfico).
- Cada post debe ser **localizado** (Chiclayo/Lambayeque), con CTA a WhatsApp /
  agendar, enlaces internos y FAQs. Ver `roadmap.md` para el plan de clusters.
- Tras publicar, idealmente pedir indexación en Google Search Console.
