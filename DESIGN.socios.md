---
name: Socios — Afiche de remate a dos tintas
description: Mundo de documento interno de socios; offset peruano de remate de lotes, verde botella y bermellón sobre bond reciclado.
colors:
  tinta: "#123A2A"
  senal: "#D93A14"
  senal-texto: "#A82A0B"
  papel: "#DDD6C4"
  papel-alto: "#EAE4D5"
  calado: "#F1ECDE"
  regla-calada: "#3B6153"
  texto-menor-tinta: "#9FB3A9"
  texto-cuerpo-tinta: "#B9C7BF"
  texto-menor-papel: "#4A5D52"
typography:
  display:
    fontFamily: "'Archivo Black', system-ui, sans-serif"
    fontSize: "clamp(6.8rem, 2rem + 28vw, 27rem)"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "'Archivo Black', system-ui, sans-serif"
    fontSize: "clamp(1.95rem, 1.2rem + 3.1vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.028em"
  cifra:
    fontFamily: "'Archivo Black', system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 1.6rem + 4.6vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  title:
    fontFamily: "'Archivo Narrow', system-ui, sans-serif"
    fontSize: "1.03rem"
    fontWeight: 700
    lineHeight: 1.24
    letterSpacing: "0.09em"
  body:
    fontFamily: "'Archivo', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.09rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  entrada:
    fontFamily: "'Archivo', system-ui, sans-serif"
    fontSize: "clamp(1.09rem, 1.02rem + 0.34vw, 1.32rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "'Archivo Narrow', system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.15em"
rounded:
  none: "0"
spacing:
  xs: "0.55rem"
  sm: "0.9rem"
  md: "1.5rem"
  lg: "2rem"
  plancha: "clamp(3.4rem, 7vw, 6.6rem)"
components:
  bloque-precio:
    backgroundColor: "transparent"
    textColor: "{colors.calado}"
    typography: "{typography.cifra}"
    rounded: "{rounded.none}"
    padding: "1.3rem 1.4rem 1.5rem"
  bloque-precio-gana:
    backgroundColor: "{colors.senal}"
    textColor: "#FFFFFF"
    typography: "{typography.cifra}"
    rounded: "{rounded.none}"
    padding: "1.3rem 1.4rem 1.5rem"
  cinta-cabecera:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.calado}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.52rem clamp(1rem, 4vw, 2rem)"
  sello:
    backgroundColor: "{colors.senal}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.5rem"
  marco-tabla:
    backgroundColor: "{colors.calado}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0"
  tabla-encabezado:
    backgroundColor: "{colors.papel-alto}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.62rem 0.9rem"
  tabla-fila-entintada:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.calado}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.9rem"
  tabla-celda-calada:
    backgroundColor: "{colors.calado}"
    textColor: "{colors.senal-texto}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.9rem"
  instrumento:
    backgroundColor: "transparent"
    textColor: "{colors.calado}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "clamp(1.1rem, 2.5vw, 1.7rem)"
  recomienda:
    backgroundColor: "{colors.calado}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "clamp(1.3rem, 3vw, 2.2rem)"
---

# Design System: Socios — Afiche de remate a dos tintas

<!-- impeccable:design 1 -->

> **Alcance:** el mundo visual de los documentos internos de socios, en
> `_socios-microsite/`. El primero y único construido es el convenio con Grupo
> Inmobiliario JETC (`_socios-microsite/jetc/index.html`, HTML autocontenido).
>
> **No es** la web pública (ver [DESIGN.md](DESIGN.md): negro, morado y Poppins),
> ni el demo inmobiliario (ver [DESIGN.inmobiliaria.md](DESIGN.inmobiliaria.md)).
> Verdad de producto en [PRODUCT.socios.md](PRODUCT.socios.md).
>
> Este documento describe **lo construido**, no lo deseado. Donde hay deuda, se
> dice que es deuda.

## Overview

**Creative North Star: "El afiche de remate de lotes, offset a dos tintas"**

El documento se decide en un solo número, así que el número **es** la página. El
mundo lo elegido para eso no es una interfaz: es una plancha de imprenta peruana
de remate de lotes, tirada a dos tintas sobre bond reciclado. Verde botella
inundando el plano, bermellón entrando encima, Archivo Black en cajas altas a
escala de cartel, reglas de plancha de 6px, tramas de semitono y bloques de precio
calados. Un afiche no tiene tarjetas ni pestañas: tiene campos entintados, cifras
enormes y filetes que cortan.

La densidad es alta y deliberadamente impresa. Ocho planchas, cada una separada por
una regla de 6px, alternando plancha inundada de tinta y plancha sobre papel. El
ritmo de lectura es de afiche desplegado, no de panel: se llega buscando la cifra,
se encuentra a media pantalla, y todo lo demás la sostiene o la matiza.

El anti-referente está declarado y es duro: **el informe-interno-como-panel**.
Rejilla de tarjetas de indicador, sans neutra de sistema, un acento de color de
gráfico, sombras suaves y esquinas redondeadas. Nada de eso existe aquí, y su
ausencia es el diseño.

**Key Characteristics:**

- Dos tintas y tres valores de papel; ninguna tercera tinta, nunca.
- Radio cero en todas las superficies; el corte es recto porque el papel se corta.
- Sin una sola sombra: `box-shadow` aparece 0 veces en el archivo.
- Un único fuera de registro, un único estallido, un único momento de entrada.
- Tipografía incrustada en el archivo; la voz de display no depende de la red.
- El camino de impresión es superficie de primera clase, no una degradación.

## Colors

Dos tintas de prensa sobre tres valores de bond reciclado. El color no adorna
ningún componente: entinta campos enteros o no aparece.

### Primary

- **Verde botella de plancha** (`{colors.tinta}`): la tinta 1. Inunda planchas
  enteras (`.plancha.flood`), pinta la cinta fija de cabecera, los `<caption>` de
  tabla, las filas de énfasis y todas las reglas estructurales. Sobre papel es
  también el color del texto corrido. Es el suelo del mundo, no un acento.
- **Bermellón de relleno** (`{colors.senal}`): la tinta 2, y **solo para
  rellenos**: el campo sólido del bloque de precio que gana, el estallido, la
  lozenge rotada de la ruta, el pulgar del control deslizante, el borde inferior
  de la cinta, el fantasma fuera de registro y el foco del navegador.
- **Bermellón de texto** (`{colors.senal-texto}`): la misma tinta oscurecida hasta
  ser legible como **texto** sobre cualquiera de los tres papeles (4,83:1 en el
  peor fondo). Cifras destacadas de tabla, índices de hallazgo, rótulos de tramo y
  de cláusula. No es una tercera tinta: es la misma tinta cargada más densa.

### Neutral

- **Bond reciclado** (`{colors.papel}`): el papel base del documento.
- **Bond alto** (`{colors.papel-alto}`): la plancha de la ruta y el fondo de los
  encabezados de tabla; medio paso más claro para separar sin dibujar una caja.
- **Calado** (`{colors.calado}`): el blanco de papel que queda cuando la tinta no
  se imprime. Es el texto sobre plancha inundada, el interior de los marcos de
  tabla y el fondo del bloque de recomendación.
- **Regla calada** (`{colors.regla-calada}`): el único filete que se lee sobre
  campo de tinta; sustituye a `{colors.regla}` dentro de `.flood`.
- **Grises de tinta** (`{colors.texto-cuerpo-tinta}`, `{colors.texto-menor-tinta}`):
  cuerpo secundario y rótulos menores sobre plancha inundada.
- **Gris de papel** (`{colors.texto-menor-papel}`): notas al pie y rótulos de
  ayuda sobre papel.

### Named Rules

**La Regla de las Dos Tintas.** La prensa tiene dos tinteros y no hay un tercero.
Se probó un bermellón claro (`#FF7A50`) para resolver contraste sobre tinta y se
eliminó del archivo: ninguna prensa a dos tintas puede depositar un bermellón más
claro que el propio bermellón. Si un color nuevo parece necesario, el problema es
de composición, no de paleta.

**La Regla del Calado.** Cuando una cifra bermellón tiene que vivir dentro de una
fila inundada de tinta, **la celda se cala a papel** y encima se imprime en
`{colors.senal-texto}`. Es el recurso de la prensa —quitar tinta—, nunca aclarar
la tinta. Ver `tr.subraya td.destaca`.

**La Regla de Relleno y Texto.** `{colors.senal}` rellena; `{colors.senal-texto}`
escribe. Un texto en `{colors.senal}` sobre papel es un error de plancha.

## Typography

**Display:** Archivo Black (Omnibus-Type), en cajas altas siempre.
**Body:** Archivo.
**Rótulos y versalitas:** Archivo Narrow, 700, en cajas altas con tracking abierto.

Las tres son la misma superfamilia. Las cinco caras (`Archivo` 400/700,
`Archivo Black` 400, `Archivo Narrow` 400/700) van **incrustadas en base64 como
woff2 de subconjunto latino dentro del propio HTML**.

**Character:** una sola familia de grotesca industrial, estirada a sus extremos: el
negro apretado a `-0.055em` funciona como plancha de cartel, la estrecha en cajas
altas con `0.15em` funciona como rótulo de imprenta, y la regular sostiene párrafos
largos a 1.62 de interlínea. La tensión del mundo no viene de mezclar familias,
viene de la distancia entre la cifra de 27rem y el rótulo de 0.72rem.

### Hierarchy

- **Display** (Archivo Black 400, `clamp(6.8rem, 2rem + 28vw, 27rem)`, `line-height:.8`,
  `letter-spacing:-.055em`): el numeral de afiche. **Uno por documento.** La
  interlínea recortada es intencional: deja que la coma pinte por debajo de la caja.
- **Headline** (Archivo Black 400, `clamp(1.95rem, 1.2rem + 3.1vw, 3.6rem)`, `.94`,
  máx. 19ch, `text-wrap:balance`): el título de cada plancha.
- **Cifra** (Archivo Black 400, `clamp(2.7rem, 1.6rem + 4.6vw, 4.6rem)`, `-.04em`):
  el precio dentro de un bloque calado. El símbolo de moneda va en `<sup>` a
  `.3em` en Archivo Narrow, no en la cara negra.
- **Title** (Archivo Narrow 700, `1.03rem`, `.09em`, cajas altas): todos los `h3`.
  Nunca en Archivo Black: la cara negra está reservada a cifras y a `h1`/`h2`.
- **Body** (Archivo 400, `clamp(1rem, .96rem + .2vw, 1.09rem)`, `1.62`, medida
  `68ch`; `46ch` en columna par, `60ch` en cláusula, `58ch` en pregunta).
- **Entrada** (Archivo 400, `clamp(1.09rem, 1.02rem + .34vw, 1.32rem)`, `1.5`,
  máx. 56ch): el párrafo de arranque de cada plancha.
- **Label** (Archivo Narrow 700, `.72rem`–`.86rem`, tracking `.04em`–`.19em`, cajas
  altas): cinta, sello, `<th>`, `<caption>`, rótulos de tramo, orden de cláusula,
  escala del instrumento, firma. **Nada por debajo de 11px.**

Todo el documento corre con `font-variant-numeric: tabular-nums` desde `body`, y
las columnas numéricas suman `text-align:right` y `white-space:nowrap`.

### Named Rules

**La Regla de la Fuente Incrustada.** Las caras de Archivo viajan en base64 dentro
del archivo. Esto es regla, no comodidad: la pieza se abre en reuniones sin red
garantizada, y una voz de display que cae a la sans del sistema pierde el mundo
entero. Cualquier documento nuevo de socios incrusta sus caras o no se publica.

**La Regla de la Cifra Única.** El tamaño de display existe para **un** número por
documento: el que decide. Un segundo numeral a esa escala destruye el argumento de
que hay un solo número.

## Layout

Ocho **planchas** apiladas (`.plancha`), cada una con `border-top: 6px solid` de
tinta y relleno vertical `clamp(3.4rem, 7vw, 6.6rem)`. La primera no lleva regla
superior: el borde del papel ya es el corte. Las planchas alternan campo inundado
de tinta (`.flood`) y campo de papel; una sola usa `{colors.papel-alto}`.

La caja de contenido es `min(1180px, 92vw)` centrada. No hay rejilla global: cada
figura declara la suya con `auto-fit` y un mínimo propio —bloques de precio a
`minmax(255px, 1fr)`, columnas de lectura a `minmax(290px, 1fr)`—, de modo que el
colapso a una columna ocurre por contenido y no por punto de ruptura.

La portada es la excepción compuesta: por encima de 900px el titular y su entrada
ocupan `.95fr / 1.05fr` a la derecha del golpe de cifra; por debajo, apilan. A
760px el estallido sale de posición absoluta y **entra en el flujo** por encima de
la cifra con `order:-1`, porque en columna estrecha pisaba la glosa.

Ritmo vertical observado: `.55rem` para separar rótulo de dato, `.9rem`–`1.1rem`
dentro de una figura, `1.5rem` bajo un `h2`, `2rem`–`2.2rem` entre figuras de una
misma plancha. Las tablas desbordan horizontalmente dentro de su marco
(`overflow-x:auto`, `min-width:520px`) con un rótulo «Desliza la tabla →» que
desaparece por encima de 860px. Sin desbordamiento horizontal a 390 / 820 / 1440.

Las superficies del navegador son parte de la composición y están entintadas:
`::selection` (bermellón sobre calado), `:focus-visible` (contorno bermellón de 3px
con desplazamiento de 3px), `scrollbar-color` y `::-webkit-scrollbar` de 13px con
pulgar de tinta sobre pista de bond alto, y los enlaces con
`text-underline-offset:.22em` y `text-decoration-thickness:.09em`.

### Named Rules

**La Regla de la Plancha.** La jerarquía la marcan reglas horizontales gruesas y el
cambio de campo entintado, no cajas. Una sección nueva es una plancha con su regla
de 6px, no una tarjeta con su sombra.

## Elevation & Depth

**Este sistema no tiene sombras.** `box-shadow` aparece cero veces en el archivo, y
eso es doctrina: una hoja de prensa apoyada en la mesa no proyecta nada. La
profundidad se construye con **materiales de impresión**:

- **Trama de semitono** (`.trama::before`): puntos de `radial-gradient` a `.9px`
  sobre rejilla de `7px`, opacidad `.10` sobre papel y `.14` sobre campo inundado.
  Toma `currentColor`, así que la trama es siempre de la tinta del campo.
- **Grano de prensa** (`.grano::after`): `feTurbulence` (`fractalNoise`,
  `baseFrequency .85`, 3 octavas) desaturado, aplicado con
  `mix-blend-mode: multiply` a opacidad `.5`. Envejece el papel; no oscurece texto.
- **Fuera de registro** (`.numFantasma`): una segunda capa real de tinta bermellón
  bajo el numeral. Anima **una sola vez** de `translate(11px, 9px)` a `(3px, 3px)`
  en `1.15s` con `cubic-bezier(.16, 1, .3, 1)` y **queda permanentemente fuera de
  registro**. No vuelve a cero: un afiche mal registrado sigue mal registrado.
- **Capas de tinta plana**: campo inundado, campo de papel, campo calado. Tres
  planos y ninguno más.

### Named Rules

**La Regla de la Prensa Sin Sombra.** Ninguna sombra, de ningún color, en ninguna
superficie. Si algo necesita separarse, se entinta, se cala o se le pone una regla.

**La Regla del Único Fuera de Registro.** Hay exactamente un fallo de registro en
toda la pieza y es el numeral de portada. El error de imprenta es efectivo porque
es uno; repetido se convierte en estilo y deja de ser error.

**La Regla de la Entrada Única.** Un solo momento de movimiento: `.ap.dentro`,
desplazamiento de 20px con desvanecido en `.72s`, disparado por
`IntersectionObserver` con red de seguridad a 1200ms y camino sin JS que muestra
todo. Los tres primeros elementos de la portada quedan excluidos: lo que decide el
documento no se hace esperar. `prefers-reduced-motion` apaga la entrada y planta el
fantasma en registro.

## Shapes

**Radio cero, sin excepción.** La única declaración de `border-radius` en el archivo
es un `0` explícito para neutralizar el pulgar nativo de Firefox. Todo se corta a
escuadra.

Los bordes son de plancha, no de contorno de interfaz: `6px` para la regla que
separa planchas y para la firma, `5px` para el marco de la recomendación, `4px`
para los bloques de precio, el instrumento y los marcos de tabla, `3px` para las
divisiones internas y el borde inferior de la cinta, `2px` para las reglas menores
y las divisiones bajo rótulo, `1px` solo para el filete entre filas de tabla.

Dos siluetas firman el mundo:

- **El estallido** (`.estallido`): la estrella de 24 puntas dibujada en SVG,
  `clamp(92px, 11vw, 138px)`, con su rótulo en cajas altas centrado dentro.
  **Aparece una vez en toda la pieza**, sobre la cifra que decide.
- **La lozenge** (`.tramo::before`): cuadrado de 17px rotado 45°, montado a caballo
  sobre la regla horizontal de cada tramo de la ruta. Sustituyó a un filete
  vertical de 4px que era el mismo dibujo que el rail lateral de tarjeta con el que
  se delata una interfaz generada.

La **regla doble** (`.reglaDoble`: 6px arriba, 2px abajo, 11px de alto) cierra la
cabecera; es el gesto tipográfico de un afiche, no un separador de interfaz.

## Components

### Bloques de precio

Dos bloques enfrentados, y la tinta dice cuál gana.

- **Forma:** rectángulo a escuadra, borde de 4px, relleno `1.3rem 1.4rem 1.5rem`.
- **En reposo:** fondo transparente sobre el campo inundado, borde y texto calados.
- **Ganador (`.gana`):** campo sólido de bermellón con la cifra calada en blanco.
  **No hay pestaña, insignia ni etiqueta de «recomendado»**: el bloque que gana está
  entintado, y eso basta. La clase la conmuta el instrumento en vivo.
- **Interior:** rótulo en Archivo Narrow con división de 2px de `currentColor`, la
  cifra en Archivo Black con la moneda en `<sup>` a `.3em`, y el desglose en
  Archivo Narrow por debajo.

### Tablas

Cuadro de imprenta, no rejilla de datos.

- **Marco:** borde de 4px, fondo calado, desbordamiento horizontal propio.
- **Título:** `<caption>` arriba, campo sólido de tinta con texto calado en cajas altas.
- **Encabezado:** fondo de bond alto, rótulos en Archivo Narrow con `.12em`,
  división inferior de 3px, alineado al pie de la celda.
- **Cuerpo:** filete de 1px al 26% de tinta, cebra al 4,5%, última fila sin filete.
- **Fila de énfasis (`tr.subraya`):** campo inundado de tinta con texto calado.
- **Celda destacada dentro de fila entintada:** calada a papel, impresa en
  `{colors.senal-texto}`. Ver la Regla del Calado.

### El instrumento (componente firma)

El único control interactivo de la pieza: un deslizante que mueve el ritmo de venta
y reentinta los dos bloques de precio en vivo.

- **Pista:** 14px de alto, verde muy oscuro con marcas verticales repetidas cada
  5px, borde calado de 2px. Es una regla graduada impresa.
- **Pulgar:** rectángulo de 20×34 en bermellón con borde calado de 3px, radio cero.
  Cursor `ew-resize`.
- **Lectura:** cifra en Archivo Black con su unidad en Archivo Narrow al `.42em`.
- **Veredicto:** párrafo bajo división de 2px, vinculado por `aria-describedby`.
- **Escala:** los cinco topes rotulados bajo la pista.
- **Sin cromo de progreso:** ni barra rellena, ni porcentaje, ni anillo.

### Cinta de cabecera

Barra fija de tinta con borde inferior bermellón de 3px, en cajas altas a `.78rem`
con `.15em`. Lleva el sello «Interno» en campo bermellón sólido y la advertencia de
no circular alineada al final, que se oculta por debajo de 640px.

### Recomendación

Bloque de papel calado con borde de 5px, una manecilla SVG en bermellón de
`clamp(46px, 7vw, 74px)` a la izquierda del `h2`. Apila a una columna bajo 560px.

## Do's and Don'ts

### Do:

- **Do** incrustar las caras de Archivo en base64 dentro del archivo; la pieza se
  lee sin red garantizada.
- **Do** usar `{colors.senal}` para rellenar y `{colors.senal-texto}` para escribir.
- **Do** calar la celda a papel cuando una cifra bermellón caiga dentro de un campo
  de tinta.
- **Do** separar secciones con planchas y reglas horizontales de 6px.
- **Do** dejar el fantasma permanentemente fuera de registro a `(3px, 3px)`.
- **Do** mantener el radio en cero en toda superficie.
- **Do** entintar las superficies del navegador (`::selection`, `:focus-visible`,
  barra de desplazamiento, subrayado de enlace) con la paleta del mundo.
- **Do** llevar `print-color-adjust: exact` en **todo** campo entintado. El camino
  de impresión reentinta a verde sobre blanco, conserva el bermellón y conserva el
  fantasma; sin esa declaración el bloque ganador sale en blanco sobre blanco y se
  van con él todos sus calados.
- **Do** revisar, al reentintar para impresión, que ningún `<b>` herede el blanco de
  un calado: en esta pieza eran justo las dos cifras del punto de equilibrio.
- **Do** mantener el texto funcional por encima de 11px.

### Don't:

- **Don't** añadir una tercera tinta. Ni un bermellón claro, ni un verde de apoyo,
  ni un color de estado.
- **Don't** poner sombras. Ninguna, y menos una sombra negra neutra: una hoja de
  prensa no proyecta.
- **Don't** poner un antetítulo, kicker o rótulo suelto encima de un `h2`. El
  titular arranca en el titular.
- **Don't** usar rieles verticales de acento a la izquierda de una figura. La ruta
  usa reglas horizontales con la lozenge rotada montada encima, y esa es la forma.
- **Don't** añadir cromo de progreso: barras rellenas, porcentajes, anillos, pasos
  numerados con indicador.
- **Don't** marcar la opción recomendada con una pestaña o insignia; se entinta.
- **Don't** repetir el estallido, el fuera de registro ni la animación de entrada.
  Cada uno es único por documento.
- **Don't** redondear esquinas ni suavizar bordes.
- **Don't** tratar la impresión como degradación: es una superficie de primera clase
  con su propio entintado.

## Deuda declarada

Después de la primera plancha, **las siete siguientes repiten una sola figura**:
titular, un párrafo de entrada, y o una tabla o una lista. La portada tiene golpe de
cifra, bloques enfrentados e instrumento; el resto del documento no vuelve a
inventar una figura. La revisión de acabado lo señaló como el trabajo pendiente de
mayor valor y lo clasificó como **techo, no piso**: la pieza es correcta y legible
tal como está, y lo que falta es variedad compositiva en las planchas 2 a 8.

Se registra como deuda, no como decisión. Un documento de socios nuevo no debe
heredar «una figura por plancha» como si fuera la regla de la casa.

## Estado verificado

Al momento de escribir este documento, sobre el artefacto construido:

- Auditoría de contraste propia con composición alfa completa sobre 281 elementos:
  **0 fallos**, margen más ajustado `+0.10`.
- Ningún texto por debajo de 11px.
- `detect.mjs` devuelve `[]`.
- Sin desbordamiento horizontal a 390 / 820 / 1440.
