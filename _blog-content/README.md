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
- **GitHub Actions** (`.github/workflows/blog-autopublish.yml`) corre el cron
  **Lun/Mié/Vie 09:00 Perú** y commitea el cambio de estado de la cola.

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
