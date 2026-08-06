# Rollback — punto de retorno del 6 de agosto de 2026

Snapshot tomado antes de ejecutar el plan de mejoras de `dakagency.net`
(prerender, `h1`, unificación de redes, rendimiento móvil, limpieza de
anti-patrones visuales).

**Estado congelado:** commit `4b956a8`, desplegado el 2026-08-05 01:54 UTC.

---

## Qué existe y dónde

### Código

| Artefacto | Dónde | Contenido |
|---|---|---|
| Tag `pre-impeccable-2026-08-06` | local **y** `origin` | Apunta a `4b956a8`, el commit que produjo lo que hoy está en producción |

Ningún workflow se dispara con tags (`deploy.yml` escucha `push: branches: [main]`),
así que el tag no provoca despliegues.

### Servidor — `/home/u567580447/backups/pre-impeccable-20260806/`

| Archivo | Tamaño | Qué cubre |
|---|---|---|
| `spa-superficie.tar.gz` | 6,2 MB | **El objetivo real de rollback.** Todo lo que el `rsync --delete` de la SPA sí toca: `index.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `og-image.png`, `favicon.svg`, los dos ficheros de verificación de Google, `assets/`, `images/` y `agro/`. 109 entradas. |
| `blog-db.sql.gz` | 484 KB | Base de datos completa de WordPress (`u567580447_blog`), 21 tablas, volcado con `--single-transaction`. 2,18 MB descomprimido. |
| `public_html-completo.tar.gz` | 112 MB | Docroot entero: 11.321 entradas, de las cuales 11.124 del blog (795 en `wp-content/uploads`) y 11 de `agro/`. La opción nuclear. |

### Verificación hecha el 2026-08-06

No basta con que el archivo exista. Se comprobó que **restaura de verdad**:

- `gzip -t` correcto en los tres archivos, en el servidor y en la copia local.
- Restauración de prueba a un directorio temporal y `diff` contra los originales
  en vivo: `index.html`, `.htaccess`, `agro/blog/index.html` y `blog/wp-config.php`
  salieron **idénticos byte a byte**, tanto desde el tarball completo como desde
  `spa-superficie.tar.gz`.
- El volcado SQL contiene `wp_posts`, `wp_users`, las tablas de Rank Math y el
  post más reciente que aparece en la home.

**El directorio de backups vive fuera de `public_html/` a propósito.** Si estuviera
dentro, el `rsync --delete` del siguiente deploy se lo llevaría por delante junto con
todo lo demás.

### Copia fuera del servidor — `DAK_WP/_backups/pre-impeccable-20260806/`

`spa-superficie.tar.gz` y `blog-db.sql.gz`, verificados con `gzip -t`.
La carpeta está en `.gitignore`: **el volcado de la base lleva hashes de contraseña
y las `wp_options` del blog, y nunca debe entrar al repo.**

---

## ⚠️ Bloqueante antes del primer deploy: `agro/`

`public_html/agro/` **no está** en los `--exclude` del rsync de
[deploy.yml](.github/workflows/deploy.yml), y `dakagency.net/agro/blog/`
responde **200** — está publicado y vivo (artículos del demo de agroinsumos ARENAL).

Como `agro/` no existe en `public/` del repo, **el próximo push a `main` lo borra.**
Es exactamente el patrón que ya destruyó el demo inmobiliario y el microsite de
análisis, documentado en los comentarios del propio workflow.

Antes de desplegar cualquier fase del plan, añadir a los switches del rsync:

```
--exclude='agro/'
```

Si aun así se pierde, se restaura con el procedimiento B: `agro/` está dentro
de `spa-superficie.tar.gz`.

---

## Procedimientos de restauración

Ordenados de menos a más agresivo. Empezar siempre por el más suave que resuelva.

### A — Revertir el código y dejar que el CI redespliegue

Lo normal cuando un cambio se desplegó y salió mal. Conserva el historial.

```bash
git revert -m 1 <sha-del-merge>
git push origin main
```

El deploy se dispara solo y en pocos minutos el sitio vuelve al estado anterior.
Si hay varios commits que revertir, `git revert <sha1> <sha2> ...` en una sola
operación evita despliegues intermedios rotos.

### B — Restaurar la superficie de la SPA en el servidor, sin esperar al CI

Cuando el sitio está caído y hay prisa. Devuelve `index.html`, `assets/`,
`images/`, `agro/` y el `.htaccess` al estado del 6 de agosto. **No toca `blog/`.**

```bash
ssh -p 65002 u567580447@89.116.115.11
cd /home/u567580447/domains/dakagency.net/public_html
tar xzf /home/u567580447/backups/pre-impeccable-20260806/spa-superficie.tar.gz
```

`tar xzf` sobrescribe lo que coincide y deja lo demás intacto; no borra archivos
nuevos. Si el problema es justamente un archivo nuevo que sobra, borrarlo a mano
después.

Tras esto, **revertir también el código** (procedimiento A) o el siguiente push
volverá a subir la versión rota.

### C — Restaurar el docroot completo

Solo si el `rsync --delete` se comió una carpeta-subdominio entera.

```bash
ssh -p 65002 u567580447@89.116.115.11
cd /home/u567580447/domains/dakagency.net/public_html
tar xzf /home/u567580447/backups/pre-impeccable-20260806/public_html-completo.tar.gz
```

Para recuperar **solo** una carpeta sin tocar el resto:

```bash
tar xzf /home/u567580447/backups/pre-impeccable-20260806/public_html-completo.tar.gz ./agro
```

### D — Restaurar la base de datos de WordPress

El plan no toca WordPress, así que esto es seguro de último recurso.

```bash
ssh -p 65002 u567580447@89.116.115.11
cd /home/u567580447/domains/dakagency.net/public_html/blog
gunzip -c /home/u567580447/backups/pre-impeccable-20260806/blog-db.sql.gz > /tmp/restore.sql
/usr/local/bin/wp db import /tmp/restore.sql
rm /tmp/restore.sql
```

---

## Comprobar que el sitio volvió

```bash
curl -sI https://dakagency.net/ | head -1
curl -s https://dakagency.net/ | grep -c "root"
curl -sI https://dakagency.net/agro/blog/ | head -1
curl -sI https://dakagency.net/blog/ | head -1
```

Las cuatro deben responder `200`. Y en el navegador, que la home pinte el hero
y que la consola salga limpia.

---

## Cuándo se puede borrar todo esto

Cuando las seis fases del plan estén desplegadas, verificadas y estables durante
al menos una semana. Para liberar los ~300 MB:

```bash
rm -rf /home/u567580447/backups/pre-impeccable-20260806
```

El tag de git se queda: no ocupa nada y es el único registro permanente del
estado previo.
