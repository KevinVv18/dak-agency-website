---
name: Showroom de edificios DAK
description: El edificio a pantalla completa es la interfaz; encima flotan tablillas de algarrobo de esquina cortada.
colors:
  acento: "#f2c230"
  acento-tinta: "#23170f"
  acento-oscuro: "#f2c230"
  acento-claro: "#23170f"
  algarrobo: "#23170f"
  algarrobo-2: "#342318"
  algarrobo-3: "#4b3524"
  escena: "#120b06"
  campo-oscuro: "#1a110b"
  arena: "#efe7d6"
  arena-tenue: "#bcae95"
  ceniza: "#dedad0"
  hoja: "#f4f1ea"
  papel: "#e4e0d5"
  tenue: "#625646"
  linea: "#cfc7b6"
  olivo: "#5d6b3a"
  disponible: "#3d6a1e"
  disponible-fondo: "#dfe6c9"
  reservado: "#9a3f17"
  reservado-fondo: "#f1dccb"
  vendido: "#6a6155"
  vendido-fondo: "#e3ded4"
  disponible-sobre-madera: "#b6cf74"
  reservado-sobre-madera: "#f09a6e"
  vendido-sobre-madera: "#a99d8c"
typography:
  display:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.1rem, 6vw, 5.2rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 125"
  numero-unidad:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
    fontVariation: "'wdth' 125"
  precio:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 800
    letterSpacing: "-0.005em"
    fontFeature: "tnum"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 125"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  texto-chico:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 112"
  estado:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 112"
  rotulo-dato:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  interior: "1px"
  pieza: "2px"
spacing:
  junta: "2px"
  xs: "6px"
  sm: "10px"
  md: "14px"
  borde-flotante: "16px"
  tarjeta: "22px"
  dialogo: "26px"
components:
  pildora:
    backgroundColor: "{colors.algarrobo}"
    textColor: "{colors.arena}"
    typography: "{typography.label}"
    rounded: "{rounded.pieza}"
    padding: "0 20px 0 18px"
    height: "44px"
  pildora-hover:
    backgroundColor: "{colors.algarrobo-3}"
  pildora-acento:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.pieza}"
    padding: "0 20px 0 18px"
    height: "44px"
  pildora-grande:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    rounded: "{rounded.pieza}"
    padding: "0 30px 0 26px"
    height: "56px"
  pildora-chica:
    backgroundColor: "{colors.algarrobo}"
    textColor: "{colors.arena}"
    rounded: "{rounded.pieza}"
    padding: "0 14px"
    height: "38px"
  pildora-chica-actual:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
  circulo:
    backgroundColor: "{colors.algarrobo}"
    textColor: "{colors.arena}"
    rounded: "{rounded.pieza}"
    size: "44px"
  flecha:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    rounded: "{rounded.pieza}"
    size: "52px"
  piso-pildora:
    backgroundColor: "{colors.algarrobo-2}"
    textColor: "{colors.arena}"
    rounded: "{rounded.interior}"
    padding: "8px 10px 8px 12px"
  piso-pildora-activo:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
  pin-unidad:
    backgroundColor: "{colors.algarrobo}"
    textColor: "{colors.arena}"
    rounded: "{rounded.pieza}"
    padding: "0 13px 0 10px"
    height: "32px"
  pin-unidad-elegido:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
  estado-disponible:
    backgroundColor: "{colors.disponible-fondo}"
    textColor: "{colors.disponible}"
    typography: "{typography.estado}"
    rounded: "{rounded.pieza}"
    padding: "4px 9px 4px 8px"
  estado-reservado:
    backgroundColor: "{colors.reservado-fondo}"
    textColor: "{colors.reservado}"
    typography: "{typography.estado}"
    rounded: "{rounded.pieza}"
    padding: "4px 9px 4px 8px"
  estado-vendido:
    backgroundColor: "{colors.vendido-fondo}"
    textColor: "{colors.vendido}"
    typography: "{typography.estado}"
    rounded: "{rounded.pieza}"
    padding: "4px 9px 4px 8px"
  tarjeta:
    backgroundColor: "{colors.algarrobo}"
    textColor: "{colors.arena}"
    rounded: "{rounded.pieza}"
    padding: "22px"
    width: "352px"
  campo:
    backgroundColor: "{colors.campo-oscuro}"
    textColor: "{colors.arena}"
    rounded: "{rounded.pieza}"
    padding: "12px 14px"
  aviso-demo:
    backgroundColor: "#150d07"
    textColor: "{colors.arena-tenue}"
    height: "30px"
---

<!--
THESIS: El edificio a pantalla completa es la interfaz, y lo que flota encima son tablillas de algarrobo, no las píldoras blancas y rojas del showroom de plantilla.
OWN-WORLD: Bosque seco de Lambayeque: algarrobo oscuro, ceniza y arena; tablillas de esquina superior derecha cortada; el color del proyecto (flor de faique) solo en la acción y lo elegido; Archivo expandida en mayúsculas para nombres y cifras; estados como rombo + palabra.
STORY: El comprador entra al edificio, elige piso en el tablero de tablillas, toca el marcador de un departamento, ve número, precio y casillas de datos, abre planta o recorrido y consulta sin perder la unidad.
FIRST VIEWPORT: Timelapse día-noche a sangre con el cielo que corre; nombre en grotesca expandida abajo a la izquierda; Ingresar como tablilla amarilla y Ver departamentos como tablilla oscura; aviso de demo arriba.
FORM: Bosque seco, candidato 3 de 7 de la lista propia; seed 8b3884cc.
-->

# Design System: Showroom de edificios DAK

## Overview

**Creative North Star: "Tablillas de algarrobo sobre la lámina"**

El render del edificio ocupa la pantalla entera en la portada, en la vista del edificio y en la planta del piso; encima flotan piezas de madera oscura, como tablillas de algarrobo apoyadas sobre una lámina de arquitecto. Cada tablilla es un rectángulo de esquinas casi rectas con la esquina superior derecha cortada, y su sombra cálida sigue ese corte. Nada enmarca la imagen en las vistas inmersivas: ni cabecera fija, ni barra lateral, ni secciones apiladas.

El mundo es el bosque seco de Lambayeque: algarrobo oscuro para las piezas, ceniza y arena para el papel y el texto claro, olivo para la confirmación. El color del proyecto (en Los Faiques, el amarillo de la flor del faique) no decora: enciende solo la acción y lo elegido. La voz tipográfica es Archivo expandida en mayúsculas para nombres, pisos y cifras, y Archivo normal para leer.

Hay dos registros con el mismo vocabulario. Las **vistas inmersivas** son oscuras y a sangre, con tablillas flotantes. Las **páginas de consulta** (ficha, catálogo, modelos) van sobre ceniza, con láminas de hoja para leer y una barra de algarrobo arriba. Una sola hoja sirve a todas las inmobiliarias: el acento entra por proyecto y todo lo demás es fijo.

Origen de la dirección: Kevin pidió el 4-oct-2026 una identidad propia porque el showroom parecía una copia de Urbania 3D (píldoras blancas y negras, radios grandes) y delegó la elección («elige tú»). «Bosque seco» fue el candidato construido; este documento lo registra tal como quedó en `src/core.css`.

**Key Characteristics:**
- Render a sangre como interfaz; tablillas flotantes que nunca lo enmarcan.
- Tablilla de esquina superior derecha cortada, radio 2px, sombra cálida que sigue la forma.
- Algarrobo, ceniza y arena como neutros; un acento por proyecto solo en acción y selección.
- Archivo variable: expandida al 125% en mayúsculas para la voz, 112% para rótulos chicos, normal para leer.
- Estados como rombo dibujado + palabra, nunca solo color.
- Aviso de demo obligatorio en una franja fina arriba.

## Colors

Neutros cálidos de madera, ceniza y arena, más un único acento inyectado por proyecto y tres estados de disponibilidad con pareja para fondo claro y para madera.

### Primary
- **Flor de faique** (acento; Los Faiques usa el valor del frontmatter, VARU usa `#184080` con tinta blanca): no vive en la hoja como decisión, lo escribe `generar.js` desde `datos/proyecto.js → estilo.acento` y `estilo.acentoTinta`. Es **relleno**: acción principal (Ingresar, Buscar departamento, Consultar), piso activo de la columna, marcador elegido, opción pulsada del conmutador, píldora chica actual, flechas de recorrido, muesca actual de la parada, franja de piso sobre el render, zona elegida en la planta, selección de texto.
- **Tinta del acento**: el texto y los íconos sobre el relleno de acento.
- **Acento sobre madera** (`--acento-oscuro`) y **acento sobre ceniza** (`--acento-claro`): el acento usado como **texto, trazo o foco**. Los calcula `generar.js`: si el acento da al menos 3:1 contra el algarrobo, `-oscuro` es el acento; si no, cae a arena. Si da 3:1 contra la ceniza, `-claro` es el acento; si no, cae a algarrobo. Con el amarillo de faique, `-oscuro` es el amarillo y `-claro` es algarrobo; con el azul de VARU, `-oscuro` es arena y `-claro` es el azul. Se usan en el enlace actual del menú y de la barra, el subrayado del piso resaltado, el ícono de la pestaña actual, el foco y el cursor de los campos de la consulta, y el subrayado de los enlaces sobre hoja.

### Neutral
- **Algarrobo** (`--algarrobo`, también `--tinta` en superficies claras): la madera de todas las tablillas, la tarjeta, el menú, la barra, la cabecera de tabla, y el texto principal sobre ceniza.
- **Algarrobo medio** (`--algarrobo-2`): cada piso de la columna; la base de las piezas dentro de una tablilla oscura.
- **Algarrobo claro** (`--algarrobo-3`): hover de toda tablilla, líneas dentro de piezas oscuras, botones secundarios dentro de la tarjeta y la consulta, barra de desplazamiento.
- **Escena**: fondo bajo los renders, la portada y el visor 360 mientras cargan.
- **Campo oscuro**: fondo de los campos y del bloque de texto de la consulta.
- **Arena**: texto principal sobre madera, íconos de los controles del 360.
- **Arena tenue**: texto secundario sobre madera, texto del aviso de demo, cabeceras de tabla.
- **Ceniza**: fondo de las páginas de consulta.
- **Hoja**: láminas, tabla, filtros, vacío, parte clara de las fichas de modelo.
- **Papel**: fondo de la vista del piso cuando no hay cenital del barrio.
- **Tenue**: texto secundario sobre ceniza y hoja.
- **Línea**: separadores, bordes de campos y filas sobre superficies claras.
- **Olivo**: confirmación (la tablilla «copiado»).

### Estados
- **Disponible** (verde de algarrobal), **Reservado** (óxido), **Vendido** (ceniza oscura), cada uno con su fondo claro. Sobre madera cambian a la pareja «sobre madera» (verde lima, salmón, gris piedra) con fondo del mismo color al 14%.

### Named Rules
**La Regla del Acento Prestado.** El color de marca llega del proyecto. Un componente que lo necesite usa `var(--acento)` / `var(--acento-tinta)` para relleno y `var(--acento-oscuro)` / `var(--acento-claro)` para texto, trazo o foco; nunca un hex de marca escrito a mano.

**La Regla del Relleno y el Trazo.** `--acento` solo pinta superficies con su tinta encima. Si el acento va a ser texto, línea o anillo de foco, se usa la variante calculada para el fondo que tenga debajo; el amarillo como texto sobre ceniza es ilegible y el azul como texto sobre madera también.

**La Regla de la Voz Única.** El acento marca la acción y lo elegido, nada más. Con una unidad abierta, la única tablilla amarilla de la vista es Consultar: Buscar departamento vuelve a madera.

**La Regla de la Madera que Redefine.** Toda pieza oscura (tarjeta, menú, consulta, barra, columna de pisos, leyenda, insignia, parada, conmutador, texto de modelo, aviso) redefine `--tinta`, `--tenue`, `--linea`, `--base` y los colores de estado en su propio ámbito. Los componentes de adentro leen esas variables y nunca preguntan sobre qué fondo están.

## Typography

**Display Font:** Archivo variable (peso 100–900, ancho 62–125%), autoalojada en `vendor/fonts/archivo-latin-var.woff2`, con system-ui de respaldo.
**Body Font:** la misma Archivo, a ancho normal.

**Character:** una grotesca de una sola familia que cambia de voz por el eje de ancho. Expandida al 125% y en mayúsculas se lee como rótulo tallado; a 112% en mayúsculas espaciadas, como etiqueta de inventario; a ancho normal, como texto de lectura.

### Hierarchy
- **Display** (800, ancho 125%, clamp de 2.1 a 5.2rem, interlineado 0.94, mayúsculas, máximo 13ch): solo el nombre del edificio en la portada, abajo a la izquierda.
- **Headline** (800, ancho 125%, mayúsculas, clamp de 1.8 a 2.8rem): título de las páginas de consulta; la ficha sube a clamp de 1.9 a 3.1rem.
- **Número de unidad** (800, ancho 125%, 2.4rem, interlineado 0.95, tabular): el número del departamento en la tarjeta (2.2rem en móvil).
- **Precio** (800, ancho 125%, 1.7rem, tabular): el precio en la tarjeta.
- **Title** (800, ancho 125%, mayúsculas, 1.3rem): insignia del piso, grupos del catálogo, fichas de modelo, título de la consulta y enlaces del menú.
- **Texto chico** (500, 0.875rem): textos secundarios, subtítulos, notas, bono, pistas sobre la imagen.
- **Body** (400, 16px, interlineado 1.55): texto corrido; el lema de portada se limita a 46ch.
- **Label** (700, ancho 112%, 0.7–0.8rem, 0.08em, mayúsculas): tablillas, conmutadores, pestañas, barra, volver, rótulos de filtros y de la consulta.
- **Estado** (700, ancho 112%, 0.72rem, 0.08em, mayúsculas): etiqueta de disponibilidad y todos los rótulos chicos en mayúsculas (pestañas, conmutadores, volver, aviso).
- **Rótulo de dato** (600, 0.68rem, 0.08em, mayúsculas): el rótulo chico debajo de la cifra en las casillas de datos; la cabecera de tabla y los rótulos de filtros usan 0.68rem a 700 y 0.1em.

En `core.css` la escala vive como variables: `--t-rotulo`, `--t-estado`, `--t-etiqueta`, `--t-chico`, `--t-cuerpo`, `--t-titulo`. Fuera de ellas solo van display, headline, número de unidad y precio.

### Named Rules
**La Regla de los Tres Anchos.** 125% para lo que se nombra o se cuenta (edificio, piso, unidad, precio, cifra de casilla); 112% para rótulos chicos en mayúsculas; ancho normal para leer. No se inventa un cuarto ancho.

**La Regla de la Cifra Tabular.** Todo número que se compara (pisos, precios, áreas, IDs de unidad, dato de portada) va con `font-variant-numeric: tabular-nums`.

**La Regla de una Familia.** Archivo y nada más; la jerarquía sale del ancho, el peso y la caja, no de una segunda familia.

## Layout

**Vistas inmersivas.** Ocupan `position: fixed` todo el viewport bajo el aviso de demo (30px). La imagen va en `cover`; detrás, una copia desenfocada (28px, brillo 0.58) llena los bordes cuando la imagen se muestra entera. Las tablillas flotan a 16px del borde (12px en móvil): marca y menú arriba a la izquierda, controles arriba a la derecha, zoom y leyenda abajo a la izquierda.

**Portada.** Timelapse día-noche por capas: el cielo es 1.6 veces más ancho que el frente y corre detrás (90s), con un velo de algarrobo que oscurece la mitad inferior para que el nombre, el lema y las dos tablillas de acción se lean abajo a la izquierda.

**Franjas proyectadas.** Las franjas de piso son polígonos SVG con el mismo `viewBox` y el mismo modo `slice`/`meet` que la imagen que cubren.

**Columna de pisos.** El tablero del ascensor a la derecha, centrado en vertical, de ancho `--col-w` (116px). Los controles centrados (parada, pistas, flecha derecha) se corren media columna. En móvil se vuelve una tira horizontal pegada abajo, con etiquetas cortas, y `--col-w` pasa a 0.

**Planta del piso.** A pantalla completa sobre la cenital del barrio con zoom y arrastre; los marcadores de unidad son botones HTML de tamaño fijo (32px, 30px en móvil) que siguen al plano sin escalarse. Con una tarjeta abierta en escritorio, zoom y leyenda pasan a su derecha (384px).

**Páginas de consulta.** Contenedor de 1320px, barra pegajosa de 64px bajo el aviso, relleno lateral clamp de 16 a 32px. La ficha pasa a dos columnas desde 960px (contenido + tarjeta pegajosa de 380px). El catálogo es una tabla que en móvil se vuelve filas en retícula; los modelos, una retícula auto-fill de mínimo 330px.

**Ritmo.** Juntas de 2–3px entre piezas de un mismo tablero (pisos, conmutador, pestañas); 6, 10 y 14px dentro de los componentes; 16px de margen flotante; 22px de relleno de tarjeta; 26px de relleno del diálogo.

**Puntos de corte.** 760px (móvil: columna abajo, tarjeta como hoja inferior, textos de conmutadores ocultos) y 960px (ficha a dos columnas).

### Named Rules
**La Regla del Marco Ausente.** En una vista inmersiva nada ocupa un borde completo salvo el aviso de demo y, en móvil, la tira de pisos y la hoja de la tarjeta.

**La Regla del Mismo Encuadre.** Toda capa dibujada sobre un render comparte el sistema de coordenadas de la imagen y su modo `slice`/`meet`.

## Elevation & Depth

Elevación real y cálida. Las tablillas se separan del render con una sombra de dos capas teñida de marrón, aplicada como `filter: drop-shadow` y no como `box-shadow`, para que siga la esquina cortada en lugar de dibujar un rectángulo. Dentro de la tarjeta, la consulta y las fichas de modelo, las piezas secundarias pierden la sombra porque ya están sobre madera.

### Shadow Vocabulary
- **Tablilla** (`filter: drop-shadow(0 10px 18px rgb(26 14 6 / .34)) drop-shadow(0 2px 4px rgb(26 14 6 / .22))`): tablillas, círculos, flechas, marcadores, columna de pisos, insignia, leyenda, parada, conmutadores, hover de la ficha de modelo.
- **Alta** (`filter: drop-shadow(0 24px 40px rgb(26 14 6 / .42)) drop-shadow(0 6px 12px rgb(26 14 6 / .24))`): tarjeta de unidad flotante, menú lateral, diálogo de consulta.

### Named Rules
**La Regla de la Sombra que Sigue el Corte.** Una pieza de esquina cortada lleva sombra con `drop-shadow`, nunca con `box-shadow`; un `box-shadow` delata el rectángulo que el degradado escondió.

**La Regla de la Madera sobre Madera.** Sobre el render, una tablilla lleva sombra; dentro de otra tablilla, ninguna.

## Shapes

La forma firma es la **tablilla de esquina cortada**: un rectángulo de radio 2px cuyo relleno es `linear-gradient(225deg, transparent var(--corte), color calc(var(--corte) + .6px))`, de modo que la esquina superior derecha queda recortada en diagonal. El corte escala con la pieza: 7px en las chicas, 8px en marcadores y rótulos, 9–10px en las de 44px, 12px en flechas y columna, 14px en la tablilla grande, 16px en la tira móvil, 18px en el texto de modelo, 22px en tarjeta y consulta.

Como los degradados no se animan, el color de cada tablilla vive en `--pieza`, registrada con `@property` como `<color>`; el hover cambia `--pieza` y la transición (0.2s) funde el color sin perder el corte.

Las piezas interiores de un tablero (pisos, opciones del conmutador, muescas de la parada) van a radio 1px sin corte. Todo lo demás (estados, campos, tabla, láminas, visor 360) va a radio 2px. Los únicos giros son los rombos: el punto de estado, el marcador del aviso de demo, el indicador del menú y el hotspot de escena del 360 son cuadrados girados 45°.

Los íconos son SVG de trazo en retícula de 24, en `currentColor`, a 20px (17–18px dentro de controles chicos).

## Components

### Tablillas (botones)
Piezas de madera firmes, de mayúsculas expandidas, que flotan sobre la imagen.
- **Shape:** tablilla de esquina cortada, radio 2px, alto mínimo 44px.
- **Base:** algarrobo con texto arena, rótulo a 112% y sombra de tablilla.
- **Acento:** la acción principal de la vista en relleno de acento con su tinta. La grande (56px, corte 14px) solo en la portada.
- **Oscura:** algarrobo fijo, para la acción secundaria fuerte (Ver departamentos en la portada).
- **Chica:** 38px, corte 7px, sin sombra; la actual pasa a acento.
- **Hover / Active:** `--pieza` pasa a algarrobo claro (el acento se aclara un 14% hacia blanco) y sube 1px; al presionar baja y escala a 0.985. Curva `cubic-bezier(.16, 1, .3, 1)`.
- **Confirmación:** al copiar un enlace la tablilla o el círculo pasa a olivo.

### Círculos y flechas
- **Círculo:** a pesar del nombre, es una tablilla cuadrada de 44px con un ícono (menú, cerrar, compartir, zoom), corte 9px. Chico de 36px con corte 7px.
- **Flechas de recorrido:** tablillas cuadradas de 52px en acento, corte 12px, a media altura (44px en móvil).

### Conmutador segmentado
- Una regla de madera (relleno 4px, corte 9px, sombra) con opciones de 36px separadas por juntas de 2px; la pulsada se enciende en acento. En móvil quedan solo los íconos.

### Etiqueta de estado
- Rombo de 7px en `currentColor` + palabra en mayúsculas a 112%, sobre el fondo del estado, radio 2px. Dentro de la madera toma automáticamente la pareja «sobre madera».

### Tarjeta de unidad (componente firma)
- **Corner Style:** tablilla grande con corte de 22px; en móvil, hoja inferior a todo el ancho hasta 60% de alto con el área segura sumada.
- **Background:** algarrobo; redefine sus variables internas.
- **Shadow Strategy:** alta cuando flota; entra con ascenso de 12px y un `clip-path` que se abre (0.5s).
- **Contenido:** número del departamento en grande con su estado, tipo en tenue, precio expandido sobre una línea, bono en bloque de disponible, la acción en acento a todo el ancho, y los datos como un **tablero de casillas**: retícula de dos columnas con juntas de 1px de línea, cifra expandida arriba y rótulo chico abajo. Las acciones secundarias (Planta, Recorrido) son tablillas sin sombra en algarrobo claro.
- **Comportamiento:** abrir planta, recorrido o consulta nunca pierde la unidad; cada unidad tiene URL propia.

### Columna de pisos (componente firma)
- Tablero de ascensor: tablilla de corte 12px con pisos apilados en algarrobo medio, juntas de 3px, número expandido y unidades libres debajo en tenue.
- **Resaltado** (puntero sobre la franja de ese piso): algarrobo claro con subrayado interior de 3px en acento sobre madera. **Activo:** relleno de acento. **Agotado:** texto secundario en vendido.

### Franjas de piso
- Polígono por piso sobre el render con relleno y trazo de acento (2.5px sin escalar), invisibles en reposo; al activarse, relleno al 38% y trazo pleno, con un rótulo-tablilla junto al puntero.

### Marcadores de unidad en la planta
- Tablilla de 32px en algarrobo con rombo de estado de 8px y el ID expandido tabular. El elegido pasa a acento; el vendido baja el texto a arena tenue.
- **Zonas:** trama por estado (reservado rayado, vendido cruzado) además del color; contorno algarrobo al pasar o enfocar; contorno de acento de 10 unidades cuando está elegida.

### Parada
- Una regla de madera con muescas: cada toma es una muesca corta en algarrobo claro; la actual es la muesca larga en acento.

### Campos
- Dentro de la consulta: campo oscuro, borde algarrobo claro, radio 2px, texto arena a peso 500. Foco: contorno de 2px en acento sobre madera y cursor del mismo color. Rótulos a 112% en mayúsculas.
- Selects del catálogo: fondo casi blanco, borde de línea, chevrón dibujado; hover a borde algarrobo.

### Navegación
- **Menú:** panel de algarrobo de hasta 400px que entra desde la izquierda; enlaces expandidos a 1.3rem separados por línea; el actual en acento sobre madera y un rombo que crece al pasar.
- **Barra de páginas:** algarrobo, pegajosa; enlaces a 112% en tenue; el actual en tinta con subrayado interior de 3px en acento sobre madera.
- **Pestañas de la ficha:** regla de rótulos sobre una línea de 2px de algarrobo; la actual es una tablilla oscura con el ícono en acento sobre madera.
- **Marca:** el nombre de la inmobiliaria expandido y muy espaciado (0.3em) sobre el nombre del proyecto, como bloque de logotipo arriba a la izquierda. Es un sustituto de logotipo, no un estilo de rótulo reutilizable.

### Aviso de demo
- Franja de 30px casi negra con texto arena tenue a 0.74rem, precedido por un rombo. Fija arriba en las vistas inmersivas y pegajosa en las páginas. Obligatoria mientras el proyecto esté en modo demo.

### Visor 360
- Pannellum tematizado: controles en tablillas de algarrobo con íconos arena; hotspots de escena como rombos de algarrobo con halo de 3px en acento.

## Do's and Don'ts

### Do:
- **Do** llevar el render a sangre (`object-fit: cover`) en portada, edificio y piso, con las tablillas flotando a 16px de los bordes.
- **Do** construir cada control nuevo como tablilla: radio 2px, esquina superior derecha cortada con el degradado de 225° y color en `--pieza`.
- **Do** dar sombra con `filter: drop-shadow` (tokens tablilla y alta) para que siga el corte.
- **Do** usar `--acento` solo como relleno con `--acento-tinta` encima, y `--acento-oscuro` / `--acento-claro` para texto, trazo y foco.
- **Do** declarar una pieza oscura nueva en la lista que redefine `--tinta`, `--tenue`, `--linea`, `--base` y los estados, en vez de escribir colores claros a mano dentro de ella.
- **Do** poner nombres, pisos, precios y cifras en Archivo expandida (125%, 800) y los rótulos chicos a 112% en mayúsculas espaciadas.
- **Do** mostrar el estado como rombo dibujado + palabra, y en la planta añadir trama.
- **Do** mostrar el aviso de demo en toda vista mientras el proyecto esté en modo demo.
- **Do** guardar cada imagen reemplazada con un nombre nuevo (`-v2`, `-v3`…); el servidor cachea por nombre.

### Don't:
- **Don't** volver a píldoras redondas, círculos verdaderos ni tarjetas de radio grande: es el showroom de plantilla que esta identidad reemplazó.
- **Don't** usar `box-shadow` en una pieza de esquina cortada.
- **Don't** escribir un hex de marca en `core.css` ni en un componente; el acento llega del proyecto.
- **Don't** usar `--acento` como color de texto o de foco: sin la variante calculada, falla el contraste en uno de los dos fondos.
- **Don't** encender en acento más que la acción y lo elegido; con una unidad abierta, solo Consultar es amarilla.
- **Don't** comunicar disponibilidad solo con color.
- **Don't** esconder el precio o la disponibilidad detrás de una consulta.
- **Don't** introducir una segunda familia tipográfica ni íconos de fuente o glifos.
- **Don't** poner un rótulo chico en mayúsculas encima de un título como antetítulo; el bloque espaciado de la marca es el único caso y no se reutiliza.
