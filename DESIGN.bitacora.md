---
name: DAK Bitácora
description: La mesa de montaje — el día se entrega como una tira física que se marca, no como una lista de tarjetas que se rellena.
colors:
  naranja: "#e94007"
  naranja-hondo: "#c33505"
  naranja-texto: "#ff5a1a"
  tinta: "#020202"
  tinta-quemada: "#0d0a09"
  perforado: "#fdfdfd"
  emulsion: "#e8e2da"
  sobre-naranja: "#180500"
  sobre-naranja-2: "rgba(24, 5, 0, 0.7)"
  sobre-tinta-2: "#a79b91"
  sobre-perforado: "#241f1c"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(32px, 9.5vw, 58px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.03em"
    fontStretch: "62%"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
    fontStretch: "88%"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "0.13em"
    fontStretch: "74%"
rounded:
  none: "0px"
spacing:
  hilo: "3px"
  paso: "13px"
  medio-paso: "6.5px"
  doble-paso: "26px"
components:
  boton-secundario:
    backgroundColor: "{colors.tinta-quemada}"
    textColor: "{colors.emulsion}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "56px"
  boton-principal:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.sobre-naranja}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "56px"
  boton-principal-sobre-campo:
    backgroundColor: "{colors.perforado}"
    textColor: "{colors.sobre-naranja}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "56px"
  boton-deshabilitado:
    backgroundColor: "{colors.sobre-naranja}"
    textColor: "#c8703f"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "56px"
  marca:
    backgroundColor: "{colors.tinta-quemada}"
    textColor: "{colors.emulsion}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "56px"
  cinta:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.sobre-naranja}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  cinta-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.naranja-texto}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  ventana:
    backgroundColor: "{colors.perforado}"
    textColor: "{colors.sobre-perforado}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  campo:
    backgroundColor: "{colors.perforado}"
    textColor: "{colors.sobre-perforado}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    width: "100%"
  ficha:
    backgroundColor: "{colors.tinta-quemada}"
    textColor: "{colors.emulsion}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "48px"
  ficha-activa:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.sobre-naranja}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "48px"
  celda-contador:
    backgroundColor: "{colors.tinta-quemada}"
    textColor: "{colors.emulsion}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "46px"
  celda-contador-activa:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.sobre-naranja}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "46px"
---

# Design System: DAK Bitácora

> Este documento describe **solo** la superficie interna `_bitacora/` (Bitácora, tras el muro de
> Google). La web pública `dakagency.net` tiene su propio sistema en [`DESIGN.md`](DESIGN.md) y la
> demo inmobiliaria el suyo en [`DESIGN.inmobiliaria.md`](DESIGN.inmobiliaria.md). No se heredan
> reglas entre las tres.
>
> Registrado desde el artefacto construido (`_bitacora/src/styles.css`, `ui.jsx`,
> `audiovisual/Fabian.jsx`, `admin/Panorama.jsx`, `gate/acceso.php`), no desde la intención.
> Contrato de dirección: semilla `1d90a862`, retador `operate-a-cutting-bench-select-rail`.

## Overview

**Creative North Star: "La mesa de montaje"**

Bitácora es una moviola, no un panel. El día no es una lista de tarjetas que se rellena: es una
tira de película que cruza la pantalla a altura fija, se marca a mano y se entrega a mañana. Todo
lo que se ve es una de dos materias —tinta o campo naranja— y las dos llevan el grano de película
**dentro**, mezclado con `background-blend-mode: soft-light` contra un mosaico de 160×160 px. El
grano nunca es un velo por encima del contenido; es el material del que está hecha la superficie.

La inversión que define el mundo: **el naranja es el suelo y los fotogramas se punzan en negro
sobre él**. No hay filetes naranjas de un píxel sobre negro; hay campos de tinta naranja con
agujeros negros dentro. Esta regla no se declara, se mide: `scripts/capturar.mjs` cuenta píxeles
naranjas por captura y la construcción entregada da 46,6 % en la entrada, 42,8 % en teléfono
pequeño, 22–28 % en las pantallas de secuencia, 39 % en la mesa de admin y 30,1 % en la mesa
estrecha. Una pantalla nueva que caiga por debajo de ese rango no está en este mundo.

La densidad es alta y el ritmo es duro. Cero radios: nada tiene esquinas redondeadas en ninguna
parte del sistema. Las separaciones son de 3 px —el hilo entre fotogramas de una tira— y todo lo
demás es múltiplo del **paso de perforación de 13 px**. Las jerarquías no se marcan con once
cuerpos de letra sino con **cuántas celdas ocupa algo** y con el color del campo en el que está.
La aplicación no hace scroll: `overflow: hidden` en `body`, `100dvh` en la hoja, una decisión por
pantalla. Lo único que se desplaza es el carril del cesto, y dentro de su propio carril.

**Key Characteristics:**
- Dos materias, y solo dos: `.tinta` y `.campo-naranja`, ambas con el grano incrustado.
- El naranja es campo, nunca filete: un tercio de pantalla, verificado por medición de píxeles.
- Tres tamaños de letra en todo el sistema; el rango se marca por celdas ocupadas.
- Cero radios, cero degradados decorativos, cero bordes de un píxel como recurso de estructura.
- El estado es una marca dibujada, nunca un cambio de fondo.
- La prosa y los objetos ajenos viven exclusivamente dentro de ventanas de blanco perforado.
- Un solo momento de autor animado: la tira se enhebra al entrar.

## Colors

Una paleta de laboratorio de revelado: un naranja de emulsión quemada, negro tinta, y un blanco de
película perforada que solo aparece cuando hay que leer prosa.

### Primary
- **Naranja de grano** (`#e94007`): el suelo. Es el fondo de `.campo-naranja`, de la banda del
  riel, de la cinta, de las fichas activas y de las celdas pulsadas del contador. También es el
  color de los glifos y de los sellos, y el de las perforaciones que se ven a través de la tinta.
  Es campo y grafismo; nunca es letra sobre negro.
- **Naranja de texto** (`#ff5a1a`): el mismo naranja subido de valor para que pase AA sobre tinta
  (6,1:1). Es el único naranja permitido como letra sobre negro: cinta sobre tinta, pie del
  descarte, cifra del contador de la mesa, hover de botones, botón de cierre del POV.
- **Naranja hondo** (`#c33505`): el naranja en sombra. Separa planos donde el naranja de campo
  sería ruido: pulgar de la barra de desplazamiento, rótulo de aviso y etiqueta de detalle sobre
  blanco perforado.

### Neutral
- **Tinta** (`#020202`): el negro absoluto del mundo. Fondo del documento, color de las
  perforaciones punzadas en la banda naranja, fondo de la cinta sobre tinta y del `theme-color`.
- **Tinta quemada** (`#0d0a09`): el negro real de las superficies. Es lo que pinta `.tinta` bajo el
  grano; el fotograma, el panel, el botón secundario y el descarte están hechos de esto.
- **Blanco perforado** (`#fdfdfd`): el agujero por el que se mira. Ventanas de prosa, avisos,
  campos de texto, informe, y la acción principal cuando está sobre campo naranja.
- **Emulsión** (`#e8e2da`): la letra sobre tinta. Blanco roto, nunca blanco puro, para que el texto
  no vibre contra el grano.
- **Sobre naranja** (`#180500`): la letra sobre campo naranja, y también el anillo de foco sobre
  campo. Es marrón-negro, no negro puro: es tinta *quemada por el naranja*.
- **Secundario sobre tinta** (`#a79b91`) y **secundario sobre naranja**
  (`rgba(24, 5, 0, 0.7)`): los dos únicos tonos de texto atenuado del sistema. Se atenúa con
  color, no con opacidad.

### Named Rules

**La regla del Naranja Suelo.** El naranja es campo, no filete. Toda pantalla nueva se compone
sobre `.campo-naranja` y los bloques de contenido se punzan encima en `.tinta`. Prueba: correr
`scripts/capturar.mjs`; si la cobertura naranja baja de ~22 %, la pantalla se ha convertido en un
panel oscuro con acento y hay que rehacerla.

**La regla de los Dos Naranjas.** `#e94007` es campo y grafismo; sobre tinta mide 3,6:1 y por eso
**nunca** es letra. Todo texto naranja sobre negro usa `#ff5a1a` (6,1:1). Esta separación es
estructural: no se resuelve subiendo el peso de la letra ni agrandándola.

**La regla del Apagado por Color.** Nada secundario, deshabilitado ni inactivo se rebaja con
`opacity`. Se apaga eligiendo un par de colores planos y midiéndolo: el botón deshabilitado es
tinta quemada sobre `--sobre-naranja` a 5,3:1, y la celda vacía del contador es `#a79b91` sobre
tinta. La única opacidad viva del sistema es la de los ticks del contador y el estado «sin dato»,
que no llevan texto crítico.

## Typography

**Familia única:** Archivo variable (`archivo-latin.woff2` + `archivo-latin-ext.woff2`, peso
400–900, ancho 62 %–125 %), con `system-ui, sans-serif` de reserva. No hay segunda familia, ni
serif, ni mono: la variación de ancho hace todo el trabajo que en otros sistemas hace un
emparejamiento.

**Carácter:** condensada, en versales, con `letter-spacing` positivo generoso en etiquetas y
negativo en display. Es la letra de un rótulo de lata de película: legible de lejos, apretada, sin
elegancia editorial.

### Hierarchy
- **Display** (800, `clamp(32px, 9.5vw, 58px)`, ancho 62 %, interlínea 0.9, tracking −0.03em,
  versales): titulares de pantalla y título del fotograma de portada. Uno por pantalla como máximo.
- **Título de fotograma** (800, `clamp(22px, 6.4vw, 32px)`, ancho 64 %, interlínea 0.95, tracking
  −0.025em, versales): el nombre de la pieza dentro de cualquier fotograma. Sube a display solo
  cuando el fotograma es portada.
- **Interfaz** (400–800, 16px, ancho 74–88 %): el único cuerpo de la interfaz. Botones, marcas,
  apuntes, campos, prosa dentro de ventana. Los campos de entrada son 16px por obligación: menos
  y iOS hace zoom al enfocar.
- **Etiqueta** (700–800, 12px, ancho 74–76 %, tracking 0.09–0.17em, versales): rótulos de sección,
  pie de descarte, celdas del contador, cinta, títulos de panel.

### Named Rules

**La regla de los Tres Tamaños.** Existen `--t-etiqueta` (12px), `--t-interfaz` (16px) y
`--t-display`. Un cuarto escalón está prohibido. Si una cifra parece necesitar más cuerpo, el
mundo dice lo contrario: se le da más ancho de celda.

**La regla del Rango por Celdas.** La importancia se comunica por superficie ocupada y por color de
campo, no por tamaño de letra. La tira de estados de la mesa lo construye literalmente: cada celda
lleva `flex: var(--peso)` proporcional a su número de piezas, de modo que «por hacer 3» es tres
veces más ancha que «en producción 1» y se lee sin leer el número. Prohibido el molde
cifra-grande-sobre-etiqueta-pequeña.

**La regla de la Ventana.** El texto corrido, los volcados de informe, los campos de entrada y
cualquier objeto ajeno viven **solo** dentro de blanco perforado (`.ventana`, `.aviso`, `.campo`,
`.cola`, `.detalle`). Sobre las materias tinta y naranja solo hay rótulos, títulos y datos cortos.

**La regla del Hueco Honesto.** Un dato ausente se escribe «sin dato» en cursiva atenuada, nunca
un cero, nunca un guion. Las cifras llevan `.cifra` con numerales tabulares para que no bailen al
actualizarse.

## Layout

El módulo es el **paso de perforación, `--paso: 13px`**. Todo el ritmo vertical es múltiplo o
fracción declarada de él (`calc(var(--paso) * 0.45 / 0.6 / 0.7 / 0.85 / 0.9)`), incluidos el
espaciado de la banda, el cuerpo de la hoja y el paso de la propia perforación dibujada. La
separación entre piezas contiguas es de **3 px**: el hilo entre fotogramas, no un margen de
tarjetas.

La estructura es una **hoja de altura fija**: `.hoja` a `100dvh` (no `100vh`, porque en iOS la
barra de direcciones retraída deja la última fila bajo el pliegue justo al aparecer el teclado),
con `padding` de `env(safe-area-inset-*)` en los cuatro lados y `overflow: hidden`. Dentro: el riel
arriba a altura fija, el contenido ocupando el resto, y el cesto colgado al fondo.

Dos superficies mayores:

- **La secuencia de Fabián** — una decisión por pantalla, sin scroll. Fotograma que crece
  (`flex: 1 1 auto`), tira de marcas, línea de acciones. Lo que sobra de altura no se estira dentro
  del fotograma: vuelve al cesto, que es donde de verdad cuelga el trabajo apartado.
- **La mesa del jefe** — rejilla de `1fr auto` sobre campo naranja: paneles punzados que **miden
  su contenido** (`max-height: 46vh` en las deudas, lista con scroll interno), la tira de
  contadores, y el cesto quedándose las celdas sobrantes. El sobrante es suelo naranja, nunca
  panel medio vacío.

Dos puntos de ruptura y nada más: **720px** ensancha el margen lateral del cuerpo y del cesto de
18px a 30px; **900px** parte las deudas en dos columnas, abre la lista de la persona a
`1fr / 1.15fr` y hace del POV una rejilla `auto-fit minmax(320px, 1fr)`.

**La regla del Cero Scroll.** `body { overflow: hidden }` es invariante. Solo se desplazan tres
carriles nombrados: el del cesto (`scroll-snap-type: x mandatory`, para que la tira nunca descanse
entre fotogramas), la lista interna de un panel, y el texto del informe. Una pantalla nueva que
necesite scroll de página está mal compuesta.

## Elevation & Depth

El sistema tiene profundidad real —desplazamiento y desenfoque— y solo dos sombras. La distinción
es semántica, no decorativa: si algo está **punzado dentro** de una superficie lleva sombra
interior; si está **posado encima** lleva sombra proyectada. No hay escala de elevación de cinco
niveles porque no hay cinco planos: hay dentro y encima.

### Shadow Vocabulary
- **Punzada** (`box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.55)`): agujeros en el material.
  Fotogramas, botones secundarios, marcas, paneles, fichas, descartes, campos de texto, celdas del
  contador.
- **Alzada** (`box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.7)`): cosas apoyadas sobre el material.
  El riel, las ventanas blancas, los avisos, los detalles y la acción principal.

**La regla del Relieve de Verdad.** Prohibido el halo de color con desplazamiento cero: es
decoración disfrazada de relieve. Una sombra tiene offset y blur, o no existe. Elegir un estado no
añade sombra: quita la punzada (`.marca--elegida`, `.ficha--activa`, celda pulsada) porque lo
elegido deja de ser un agujero y pasa a ser material.

La única otra profundidad del sistema es el POV: velo `rgba(2,2,2,0.86)` con `backdrop-filter:
blur(3px)` y la pantalla de debajo desaturada (`saturate(0.82) brightness(0.86)`) e inerte
(`pointer-events: none`). Es «la luz de la mesa apagada»: se mira, no se toca.

## Shapes

**Radio cero en todo el sistema.** No hay una sola esquina redondeada salvo el pincho de acero del
que cuelga un descarte, que es un círculo de 9 px porque es un objeto físico redondo.

La forma característica es la **perforación**, dibujada siempre con `radial-gradient` mosaicado al
paso de 13px, nunca con imágenes:

- **Riel**: dos hileras horizontales de agujeros de tinta punzados en la banda naranja, 6 px de
  alto, a 3 px del borde superior e inferior.
- **Fotograma y descarte**: dos columnas verticales de 10 px de ancho con agujeros **naranjas**
  —el campo se ve a través de la tinta— a los lados del bloque.
- **Cola del informe**: borde inferior dentado con `mask` de dientes de 9 px, para que el volcado
  parezca un tramo de tira cortado y no una caja.

Los bordes de un píxel no son un recurso de estructura. El único que existe es el separador
`border-top: 1px solid currentColor` entre apuntes consecutivos, y el subrayado de 2px del enlace
del riel y del campo de detalle.

## Components

### Riel (cabecera)
Banda de campo naranja a altura fija, perforada arriba y abajo, con sombra alzada y `z-index: 2`.
Lleva el logo poligonal de DAK a 22px en `currentColor`, la etiqueta «Bitácora», la fecha corta en
numerales tabulares y la salida. No es una barra de navegación: no hay navegación en esta app.

### Fotograma
- **Forma:** rectángulo de tinta con las dos columnas de perforación; sombra punzada.
- **Relleno:** `calc(var(--paso) * 0.9) 22px`.
- **Contenido:** título en versales condensadas, apuntes en rejilla `8.5em / 1fr` separados por
  filete, y una cinta colgando abajo.
- **Estado:** se sella. Nunca cambia de fondo.

### Cinta
Banda de etiqueta pegada **debajo** del título, alineada al inicio del bloque. Naranja sobre campo
tinta (`.cinta--tinta`, en `--naranja-texto`) o tinta sobre campo naranja. Es el sustituto
estructural del rótulo superior: en este sistema el rótulo encima del titular está prohibido sin
excepción.

### Marcas (los cinco desenlaces)
La pieza firma del sistema. Cinco filas de tinta punzadas en el campo naranja, cada una con un
glifo de 38×38 px a trazo 2.6 y su rótulo en versales. Al elegir, la fila pierde la punzada y se
vuelve transparente sobre el campo, y **el mismo gesto se estampa a tamaño de fotograma completo**
sobre la pieza (`SelloDe`, `viewBox 0 0 100 100`, `preserveAspectRatio="none"` con
`vector-effect: non-scaling-stroke` para que estirar no deforme el trazo), en naranja al 95 % con
la animación `estampar` (260ms, entra a escala 1.09 y −1.5°, como una mano un poco torcida).

Los cinco gestos son objetos de moviola, no iconos de interfaz: bandera de cinta doblada
(continúo), cruz de graso (terminé mi parte), colgado de pincho (pausé), esquina perforada
(bloqueado) y tramo de tira en blanco (no trabajé esto).

**La regla de la Marca, no el Tono.** Un desenlace se comunica con un dibujo a dos escalas. Cinco
insignias de color compiten entre sí; cinco marcas distintas se leen sin pensar y funcionan igual
para quien no distingue el naranja del rojo. Ningún estado del sistema se comunica cambiando un
color de fondo.

### Botones
- **Forma:** rectángulo, 56px de alto mínimo, sin radio, sin borde, versales a 0.12em.
- **Secundario (por defecto):** tinta con sombra punzada, es decir un agujero en el material.
- **Principal sobre tinta:** campo naranja con sombra alzada.
- **Principal sobre campo naranja:** **blanco perforado** con sombra alzada. Ni naranja sobre
  naranja (invisible) ni tinta sobre naranja (mismo peso que el secundario): el blanco es el mayor
  contraste de la paleta y además es material del mundo. La acción principal es el agujero por el
  que se pasa.
- **Hover** (solo en `hover: hover`): fondo a negro puro y letra a `--naranja-texto`; el principal
  invierte a `--sobre-naranja` con letra naranja. **Active:** `scale(0.995)`.
- **Deshabilitado:** par plano medido, fondo `--sobre-naranja` y letra `#c8703f` (5,3:1), sin
  sombra. Se lee, porque su rótulo es lo que dice qué falta por hacer.

### Fichas
Botón de etiqueta de 48px para elegir tipo de bloqueo. Inactiva: tinta punzada. Activa: campo
naranja sin punzada. Se envuelven con 3px de hilo entre ellas.

### Campos de texto
Blanco perforado, sin borde, sombra punzada, 16px, `resize: none`, placeholder `#7d736c`. Dentro de
un `.detalle` cambian a `#f0ece7` sin sombra y con un subrayado naranja de 2px: ahí el material
manda que el campo sea una línea sobre la que se escribe. El valor de ayer se muestra **fuera** del
campo, como dato (`.detalle__previo`), nunca como placeholder-sugerencia.

### Cesto
Carril horizontal con `scroll-snap` obligatorio donde cuelga lo apartado. Cada descarte es un
fotograma de 136px (190px en la mesa) con sus columnas de perforación, un pincho de acero de 9px
sobre el borde superior y la animación `colgar` escalonada 55ms por pieza. Es lo único de la
aplicación que se desplaza.

### Contadores
Dos piezas distintas y ambas son tramos de tira, no métricas:
- **Contador de secuencia:** ticks de 7px de alto al paso, tinta al 32 %, opacos cuando están
  hechos, blanco perforado el actual. Con `role="progressbar"`.
- **Tira de estados de la mesa:** celdas de 46px cuyo `flex-grow` es el número de piezas
  (`--peso`), con `min-width: max-content` para que ninguna etiqueta se corte. Pulsada: campo
  naranja sin punzada. Vacía: tinta con letra `--sobre-tinta-2`, no pulsable pero legible.

### Superficies del navegador
Se visten también las que no se dibujan: selección tinta/naranja, `caret-color` y `accent-color`
naranja, barras de desplazamiento finas en naranja hondo sobre tinta, y anillo de foco de 3px con
`outline-offset: -3px` —tinta sobre campo naranja, naranja sobre tinta—.

### Movimiento
**La regla del Único Momento de Autor.** Solo se anima lo siguiente, y nada más:
`enhebrar` (820ms) una sola vez al montar la hoja, con la tira entrando desde arriba desenfocada;
`avanzar` (420ms) por paso de secuencia; `estampar` (260ms) al marcar; `colgar` (620ms) cuando algo
cae al cesto. Todo con `--ease-tira` (`cubic-bezier(.16, 1, .3, 1)`). Las transiciones de estado son
de 130ms y solo de color. Con `prefers-reduced-motion` todo baja a 0.01ms y la información sigue
completa: nada depende de que algo se anime para existir.

### La puerta (`gate/acceso.php`)
La pantalla de acceso se sirve a gente **sin sesión**, así que no comparte el bundle: es CSS
autónomo que reimplementa el mismo mundo con los mismos tokens (campo naranja de fondo, riel
perforado, ventana blanca, mismo `enhebrar` escalonado a 760ms). Su tipografía y su grano viven
bajo `/tipo/`, fuera del muro de autenticación, por una exención estrecha de `.htaccess`; sin ella
la puerta se vería con letra de sistema y sin material.

**La regla de la Puerta en el Mismo Mundo.** Cualquier superficie pre-sesión duplica los tokens a
mano y sirve sus activos desde `/tipo/`. No se hereda del bundle, pero no se permite que se vea
distinta.

## Do's and Don'ts

### Do:
- **Do** componer toda pantalla nueva sobre `.campo-naranja` y punzar el contenido encima en
  `.tinta`, y verificarlo con `scripts/capturar.mjs`: cobertura naranja por encima de ~22 %.
- **Do** usar `#ff5a1a` para cualquier texto naranja sobre negro, y reservar `#e94007` para campo
  y grafismo.
- **Do** medir el ritmo en múltiplos de `--paso` (13px) y separar piezas contiguas con 3px.
- **Do** comunicar el estado con una marca dibujada a dos escalas: glifo de 38px en la fila, sello
  a tamaño de fotograma sobre la pieza.
- **Do** meter todo el texto corrido, los campos y los volcados dentro de blanco perforado.
- **Do** marcar el rango por celdas ocupadas y por color de campo, no por cuerpo de letra.
- **Do** apagar lo secundario e inactivo con un par de colores medido, y auditarlo con
  `scripts/auditar-contraste.mjs`.
- **Do** escribir «sin dato» cuando falta un dato.
- **Do** dejar que un bloque mida su contenido y que el sobrante vuelva a ser suelo naranja.

### Don't:
- **Don't** usar el naranja como filete de un píxel sobre negro. Eso es el panel oscuro genérico
  con acento, que es exactamente lo que este mundo rechaza.
- **Don't** poner el grano como capa por encima del contenido: vive dentro de cada superficie vía
  `background-blend-mode: soft-light`.
- **Don't** añadir un cuarto tamaño de letra ni un radio de esquina.
- **Don't** poner un rótulo en versales pequeñas encima de un titular. La marca y el estado van en
  la cinta, **debajo**.
- **Don't** comunicar un estado cambiando el color de fondo de un control.
- **Don't** rebajar texto con `opacity` para atenuarlo.
- **Don't** usar sombras de color con desplazamiento cero, ni escalas de elevación inventadas más
  allá de punzada y alzada.
- **Don't** componer una columna de tarjetas con scroll, ni el molde
  cifra-grande-sobre-etiqueta-pequeña. La tesis los rechaza expresamente.
- **Don't** dejar que la página haga scroll: solo se desplazan el carril del cesto, la lista de un
  panel y el texto del informe.
- **Don't** estirar un panel a la altura disponible para llenar la pantalla.
