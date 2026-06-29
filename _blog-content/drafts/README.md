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
> Nota: al 2026-06-29 las imágenes de SEO-IMG (Drive) son de otros temas (inmobiliario,
> web por rubro, agroindustria…); **estos 8 aún no tienen imagen** y la política viene después.

**Cluster político / electoral** (1 pilar + 5 hermanos, enlazados entre sí y al pilar):

| Archivo | Tema | Falta |
|---|---|---|
| `0018-marketing-politico-en-chiclayo.json` | **Pilar:** Marketing político en Chiclayo | imagen → `assets/0018-...webp` |
| `0019-redes-sociales-para-candidatos.json` | Redes sociales para candidatos | imagen → `assets/0019-...webp` |
| `0020-whatsapp-para-campanas-politicas.json` | WhatsApp para campañas políticas | imagen → `assets/0020-...webp` |
| `0021-video-para-campanas-politicas.json` | Video para campañas políticas | imagen → `assets/0021-...webp` |
| `0024-propaganda-electoral-en-peru.json` | Propaganda electoral en Perú (ley) | imagen → `assets/0024-...webp` |
| `0025-encuestas-y-escucha-social-en-campana.json` | Encuestas y escucha social | imagen → `assets/0025-...webp` |

**Variedad geográfica** (nacional + ciudades, modelo remoto):

| Archivo | Tema | Falta |
|---|---|---|
| `0022-cuanto-cuesta-el-marketing-digital-en-peru.json` | Precios marketing digital en Perú (nacional) | imagen → `assets/0022-...webp` |
| `0023-marketing-digital-lima-trujillo.json` | Marketing en Lima y Trujillo (remoto) | imagen → `assets/0023-...webp` |

> Orden de publicación sugerido para el cluster político: **pilar (0018) primero**, luego hermanos.
> El cron publica 1 por corrida; el orden alfabético ya los deja en esa secuencia.
