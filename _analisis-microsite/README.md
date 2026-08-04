# `analisis.dakagency.net` — entregables de análisis de marca

Cada análisis del [circuito de research](../../../research/CIRCUITO.md) se publica aquí
como una página propia. El deck en `.pptx` queda como archivo de trabajo; **lo que se
manda al prospecto es el link.**

```
_analisis-microsite/
├─ .htaccess       ← noindex + cabeceras. NO borrar: aquí hay datos reales de prospectos
├─ robots.txt      ← Disallow: /
├─ index.html      ← raíz neutra, no lista clientes
├─ assets/         ← logotipo DAK compartido
├─ ayb/index.html  ← A&B Representaciones (Chiclayo)
└─ server.cjs      ← preview local; el workflow lo excluye del deploy
```

## Por qué un link y no un adjunto

El diagnóstico dice «no tienes un lugar propio en internet». Mandarlo como `.pptx`
adjunto contradice el mensaje. Además el dueño lo abre en el celular por WhatsApp, donde
un `.pptx` se ve mal y una web se ve al 100%.

El botón «Guardar en PDF» llama a `window.print()` contra la hoja de estilos de impresión
de la propia página: siempre está sincronizado y no depende de subir un archivo aparte.

## Previsualizar en local

```bash
node _analisis-microsite/server.cjs
```

Luego abre `http://localhost:4320/ayb/`. También está como entrada `analisis` en
`.claude/launch.json`.

## Publicar

1. **Una sola vez:** crear el subdominio `analisis.dakagency.net` en hPanel. Hostinger lo
   coloca dentro de `domains/dakagency.net/public_html/analisis/`, igual que hizo con
   `inmobiliaria/`.
2. Push a `main` tocando `_analisis-microsite/**` → dispara `deploy-analisis.yml`.
   También sirve `workflow_dispatch` o un commit con `[deploy-analisis]`.

> ⚠️ **`analisis/` ya está en la lista de `--exclude` de `deploy.yml`.** No la quites: ese
> workflow hace `rsync --delete` sobre `public_html/` y borraría todos los entregables.
> Es exactamente lo que pasó con el demo inmobiliario.

## Diseño: las reglas que sostienen el formato

Estos informes tienen **dos usos y hay que servir a los dos**: se proyectan en una reunión
y se releen después en el celular. Todo lo de abajo sale de ahí.

### Se comporta como deck cuando hace falta

- **Riel de capítulos** a la izquierda en pantallas ≥ 1240 px, y **botón «Índice»** en la
  barra para el resto. Ambos se construyen solos leyendo las `<section>` y sus `h1`/`h2`
  (o el `.kick` si la sección no tiene titular): **un informe nuevo no añade una sola
  marca extra**.
- **Teclado**: ↓ / ↑ / espacio / RePág / AvPág saltan de capítulo, `Inicio` y `Fin` van a
  los extremos, `Esc` cierra el índice. Es lo que lo vuelve mejor que un PPT: mismo
  control, pero es un enlace.
- El riel mide **30 px** (solo los guiones). La etiqueta es un tooltip absoluto, así que
  no roba ancho al contenido.

### Motion: tres técnicas, y solo tres

Un dictamen no es un carrusel. Nada de fondos que laten ni elementos flotando.

1. **Entrada escalonada** al hacer scroll — los hijos de una rejilla entran en orden de
   lectura, 90 ms de diferencia.
2. **Conteo de cifras** en `.stat` y `.bval`. Anima solo la primera cifra del texto y
   respeta prefijos y sufijos (`~99`, `0.12 %`, `4.5★`). Los ceros no se animan: un cero
   contando desde cero es ruido.
3. **Elevación al pasar el cursor** en tarjetas y filas de tabla, solo en `hover:hover`.

Todo se apaga con `prefers-reduced-motion`.

### Identidad estructural

El púrpura **no decora, estructura**: numera los capítulos (contador CSS sobre `.kick`),
marca dónde estás en el riel y firma cada bloque de fuentes. Si un color solo aparece en
los botones, no es identidad, es adorno.

### Legibilidad de sala

`.stat` sube a `clamp(3rem,5.2vw,4.6rem)` en ≥ 900 px y todas las cifras usan
`tabular-nums` para que no bailen mientras cuentan. Las cabeceras de tabla quedan fijas
dentro de su contenedor.

## Añadir una marca nueva

Copia `ayb/index.html`, cambia el contenido por el dossier de la marca y ajusta las rutas
`../assets/`. El riel, el índice, la numeración, el conteo y el teclado **vienen gratis**.
Mantén:

- `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
- cada afirmación con su fuente y fecha al pie de sección (`.src`)
- las tablas dentro de `.tw` (scroll propio en móvil)
- las cifras grandes en `.stat` para que entren al conteo
- la clase `.js` que activa el ocultado: **sin JavaScript la página debe verse completa**,
  nunca en blanco. Por eso el CSS es `.js .rv{opacity:0}` y no `.rv{opacity:0}`.
