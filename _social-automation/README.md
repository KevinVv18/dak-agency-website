# Automatización de redes de DAK — gratis, en tu Hostinger

Publica contenido y recolecta métricas de **Instagram y Facebook** desde tu
**hosting compartido de Hostinger**, usando **PHP + el cron de hPanel** — el
mismo patrón que ya usa tu blog. **Sin VPS, sin n8n, sin suscripciones.**

> ¿Por qué no n8n? Tu Hostinger es hosting compartido: no tiene Docker ni deja
> correr procesos permanentes (lo confirmamos por SSH). n8n necesita eso; esto no.

## Qué hace

| Script | Qué hace | Cron |
|---|---|---|
| `publish.php` | Lee tu **calendario** (una Google Sheet), y publica en FB/IG lo que ya toca. | cada hora |
| `metrics.php` | Guarda seguidores/alcance del día en `data/metrics.csv`. | 1 vez al día |

## Requisitos (del runbook)

- Token permanente del **Usuario de Sistema** de Meta.
- **ID de tu Página de Facebook** e **ID de tu cuenta de Instagram Business**.
- Las páginas legales (ya publicadas) y la app de Meta en modo desarrollo.

## Instalación (una vez)

1. **Sube los archivos** al servidor, fuera de `public_html` (para que no sean
   públicos). Por SSH o por el Administrador de Archivos de hPanel, a una carpeta
   como `~/dak-social/`. (Yo puedo subirlos por ti con un workflow si quieres.)

2. **Crea `config.php`** en el servidor a partir de `config.example.php` y llena
   el token, los dos IDs y la URL CSV del calendario. `config.php` **no** se sube
   al repo (está en `.gitignore`).

3. **Arma el calendario** en una Google Sheet con estos encabezados en la fila 1:

   | fecha_hora | red | texto | imagen_url |
   |---|---|---|---|
   | 2026-07-25 09:00 | ambos | ¡Nuevo proyecto en Chiclayo! 🚀 | https://.../foto.jpg |
   | 2026-07-26 18:00 | ig | Tip de marketing del día… | https://.../tip.jpg |

   - `red`: `fb`, `ig` o `ambos`.
   - `imagen_url`: URL pública de la imagen (**obligatoria para Instagram**).
   - Publica la hoja como CSV: **Archivo → Compartir → Publicar en la web → CSV**,
     y pega esa URL en `config.php` (`CALENDAR_CSV_URL`).

4. **Programa el cron** en hPanel → *Cron Jobs* (ajusta la ruta a tu usuario):

   ```
   # Publicar lo que toque, cada hora
   0 * * * *   php $HOME/dak-social/publish.php >> $HOME/dak-social/data/cron.log 2>&1

   # Métricas del día, una vez (04:30 UTC ≈ 23:30 Perú)
   30 4 * * *  php $HOME/dak-social/metrics.php >> $HOME/dak-social/data/cron.log 2>&1
   ```

## Cómo usarlo día a día

Solo agregas filas a la Google Sheet con la fecha/hora futura. Cuando llegue la
hora, el cron publica solo. El registro queda en `data/automation.log` y las
métricas se acumulan en `data/metrics.csv` (descárgalo cuando quieras un reporte).

## Notas

- **Seguridad:** el token vive solo en `config.php` en el servidor, nunca en el repo.
- **Sin duplicados:** `publish.php` recuerda lo ya publicado en `data/posted.json`.
- **TikTok / WhatsApp:** se pueden sumar después (TikTok en modo borrador; WhatsApp
  con un webhook PHP). Empezamos por FB+IG, que es lo directo y sin trámites.
- **Prueba manual:** en SSH puedes correr `php ~/dak-social/publish.php` para
  forzar una corrida y ver el log.
