# Imágenes destacadas (featured images)

Cada post puede tener una imagen destacada. La convención es por **nombre**:

```
queue/0007-fotografia-profesional-chiclayo.json   ← el post
assets/0007-fotografia-profesional-chiclayo.webp  ← su imagen destacada
```

`publish.sh` busca automáticamente `assets/<mismo-nombre>.<ext>` (prueba `.webp`,
`.jpg`, `.jpeg`, `.png` en ese orden), la sube por SSH y `wp-create-post.php` la
importa, la asigna como **thumbnail** del post y le pone el `alt`.

El texto ALT se toma del campo `"featured_image_alt"` del JSON del post (o, si falta,
del título). Pon un ALT con la keyword local, p. ej.:
`"featured_image_alt": "Fotografía profesional para empresas en Chiclayo - DAK Agency"`

## De dónde salen las imágenes (flujo con Google Drive)

1. Tendrás una carpeta en Google Drive con imágenes **ya comprimidas y listas**,
   cada una con una descripción (en el nombre o en su descripción de Drive).
2. Al preparar un lote, Claude busca en esa carpeta la imagen que mejor calce con
   el tema del post, la **descarga** y la guarda aquí como
   `assets/<nombre-del-post>.<ext>` (mismo basename que el JSON en `queue/`).
3. Se commitea junto con el post. El cron de GitHub Actions la sube sola al publicar.

> Requisitos de la imagen: idealmente **≤ 1600 px** de ancho y **≤ 300 KB**
> (WebP o JPG). WordPress regenera los tamaños (`large`, `hero-featured`, etc.).
> Mantén el peso bajo: la imagen es lo más pesado de cada post.

### Receta de descarga + optimización (probada, funciona)

1. **Conector Google Drive** conectado. Carpeta de origen: **SEO-IMG**. Dentro hay
   *shortcuts*; el archivo real se busca con
   `title contains '<nombre>' and mimeType contains 'image/'`.
2. `download_file_content(fileId)` → el harness vuelca el base64 a un archivo en
   disco (no hay que transcribirlo). Se decodifica con Node: `Buffer.from(content,'base64')`.
3. Optimizar con **sharp**: `resize(≤1600, { withoutEnlargement:true })` +
   `.webp({ quality: 80 })`; bajar calidad si supera 300 KB. Guardar como
   `assets/<basename-del-post>.webp`.
4. Los originales del Drive son PNG de 1.4–2.8 MB → tras optimizar quedan ~110–250 KB (−90%).

> Para procesar varias imágenes, hazlo en un **subagente**: el base64 grande se
> queda en SU contexto y no infla el principal.

> ⚠️ Si el conector da `Not connected`, reconéctalo en Settings → Connectors.
