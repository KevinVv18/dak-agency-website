# Borradores en espera (NO se publican solos)

Los `.json` de esta carpeta son posts **terminados pero en pausa**, normalmente
porque **falta su imagen destacada**. `publish.sh` **solo lee `queue/`**, así que
nada aquí se publica por accidente (ni en el cron de Lun/Mié/Vie).

## Cómo activar un borrador (cuando ya tengas la imagen)

1. Sube la imagen del post a tu carpeta de Google Drive **SEO-IMG**.
2. Bájala y optimízala a `assets/<mismo-nombre-del-json>.webp`
   (≤1600 px, ≤300 KB — ver [../assets/README.md](../assets/README.md)).
   > Ej.: para `0018-marketing-politico-en-chiclayo.json` →
   > `assets/0018-marketing-politico-en-chiclayo.webp`.
3. Mueve el JSON de `drafts/` a `queue/`.
4. Listo: el siguiente `publish.sh` (manual o cron) lo publica **con** su imagen.

> ¿Apuro y sin imagen aún? Puedes publicarlo sin foto moviéndolo a `queue/`,
> pero lo recomendado es esperar la imagen (el post sin featured image se ve pobre
> y resta en redes/SEO).

## En espera ahora

> Cada uno necesita su imagen en `assets/<mismo-nombre>.webp` antes de pasar a `queue/`.
> (El cluster político 0018-0021/0024-0025 ya se publicó con flyers generados — 2026-06-30.)
> Nota: cualquier borrador se puede desbloquear generándole un **flyer DAK** (SVG+sharp→WebP);
> no es obligatorio esperar una imagen del Drive.

**Variedad geográfica** (nacional + ciudades, modelo remoto):

| Archivo | Tema | Falta |
|---|---|---|
| `0022-cuanto-cuesta-el-marketing-digital-en-peru.json` | Precios marketing digital en Perú (nacional) | imagen → `assets/0022-...webp` |
| `0023-marketing-digital-lima-trujillo.json` | Marketing en Lima y Trujillo (remoto) | imagen → `assets/0023-...webp` |
