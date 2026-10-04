---
name: Showroom de edificios DAK
description: El edificio a pantalla completa es la interfaz; los controles flotan encima y nunca lo enmarcan.
colors:
  acento: "#a9581f"
  acento-tinta: "#ffffff"
  tinta: "#141414"
  tenue: "#5f6368"
  fondo: "#f4f4f2"
  superficie: "#ffffff"
  gris: "#f1f1ef"
  linea: "#e6e5e1"
  linea-fuerte: "#c9c8c3"
  papel: "#e9e8e4"
  escena: "#0b0c0e"
  disponible: "#1a7f4b"
  disponible-fondo: "#e3f3ea"
  reservado: "#8a5a07"
  reservado-fondo: "#fbefd8"
  vendido: "#575d65"
  vendido-fondo: "#eceef0"
typography:
  display:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.7rem, 7.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  precio:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 700
  estado:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
  cabecera-tabla:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    letterSpacing: "0.06em"
rounded:
  etiqueta: "8px"
  campo: "12px"
  piso: "14px"
  interior: "16px"
  panel: "18px"
  tarjeta: "20px"
  hoja: "22px"
  pildora: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  borde-flotante: "16px"
  tarjeta: "20px"
  lg: "28px"
components:
  pildora:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.pildora}"
    padding: "0 18px"
    height: "44px"
  pildora-acento:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    rounded: "{rounded.pildora}"
    padding: "0 18px"
    height: "44px"
  pildora-grande:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    rounded: "{rounded.pildora}"
    padding: "0 28px"
    height: "56px"
  pildora-oscura:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.pildora}"
    padding: "0 18px"
    height: "44px"
  pildora-chica:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pildora}"
    padding: "0 14px"
    height: "38px"
  pildora-chica-actual:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
  circulo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.pildora}"
    size: "44px"
  circulo-claro:
    backgroundColor: "{colors.gris}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pildora}"
    size: "36px"
  tarjeta:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.tarjeta}"
    padding: "20px"
    width: "348px"
  piso-pildora:
    backgroundColor: "{colors.gris}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.piso}"
    padding: "8px 6px"
  piso-pildora-activo:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
  pin-unidad:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pildora}"
    padding: "0 13px 0 10px"
    height: "34px"
  pin-unidad-elegido:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
  estado-disponible:
    backgroundColor: "{colors.disponible-fondo}"
    textColor: "{colors.disponible}"
    typography: "{typography.estado}"
    rounded: "{rounded.pildora}"
    padding: "3px 10px 3px 8px"
  estado-reservado:
    backgroundColor: "{colors.reservado-fondo}"
    textColor: "{colors.reservado}"
    typography: "{typography.estado}"
    rounded: "{rounded.pildora}"
    padding: "3px 10px 3px 8px"
  estado-vendido:
    backgroundColor: "{colors.vendido-fondo}"
    textColor: "{colors.vendido}"
    typography: "{typography.estado}"
    rounded: "{rounded.pildora}"
    padding: "3px 10px 3px 8px"
  campo:
    backgroundColor: "#f7f7f5"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "12px 14px"
    height: "44px"
  aviso-demo:
    backgroundColor: "{colors.tinta}"
    textColor: "#e8e8e6"
    height: "30px"
---

# Design System: Showroom de edificios DAK

## Overview

**Creative North Star: "El edificio es la pantalla"**

Este es el estándar de la categoría (el showroom de Urbania 3D, con President Tower como vara de acabado) ejecutado a fondo. El render del edificio ocupa la pantalla entera en la portada, en la vista del edificio y en la planta del piso, y los controles flotan encima como piezas blancas y negras con sombra real. Nada enmarca la imagen: no hay cabecera fija, barra lateral ni secciones apiladas en las vistas inmersivas. El carácter propio sale del oficio y del material (renders, plantas, geometría y datos coherentes), no de un mundo excéntrico.

Hay dos registros. Las **vistas inmersivas** (portada, edificio, piso) son oscuras o de papel, a sangre, con piezas flotantes. Las **páginas de consulta** (ficha, catálogo, modelos) son claras, sobre fondo hueso, con tarjetas blancas para leer y comparar. El mismo vocabulario de píldoras, círculos, tarjeta de radio 20 y estados atraviesa ambos.

Una sola hoja sirve a todas las inmobiliarias: el color de marca entra por proyecto como variable CSS, y todo lo demás (neutros, estados, formas, sombras) es fijo. Se rechaza la web inmobiliaria de plantilla, el lujo exagerado y esconder precio o disponibilidad.

**Key Characteristics:**
- Imagen a sangre como interfaz; controles flotantes que nunca la enmarcan.
- Piezas blancas y negras con sombra real de dos capas; un único acento por proyecto.
- Tarjeta blanca de radio 20; píldoras y círculos totalmente redondos.
- Manrope de peso 800 para todo lo que se lee como dato o título; cifras tabulares.
- Estados de disponibilidad siempre como punto dibujado + palabra (y trama en la planta), nunca solo color.
- Aviso de demo obligatorio en una franja fina fija arriba.

## Colors

Neutros cálidos casi acromáticos más un único acento de marca inyectado por proyecto; los únicos otros colores son los tres estados de disponibilidad.

### Primary
- **Acento del proyecto** (por defecto Terracota Faique; el cliente privado usa Azul Varu `#184080`): no vive en la hoja, lo escribe `generar.js` desde `datos/proyecto.js → estilo.acento` y `estilo.acentoTinta` como `<style>:root{--acento;--acento-tinta}</style>`. Se usa en la acción principal (Ingresar, Buscar departamento, Consultar), la franja de piso activa, el piso activo de la columna, el pin elegido, las flechas de recorrido, el punto actual de la parada, el anillo de foco, la selección de texto y el hotspot del 360.
- **Tinta del acento**: el texto sobre el acento. Hoy blanco en ambos proyectos; cada proyecto nuevo debe elegir un acento que dé al menos 4.5:1 contra su tinta.

### Neutral
- **Tinta**: texto principal, píldora oscura, círculo por defecto, aviso de demo, rótulo de franja, opción activa de los conmutadores y las pestañas.
- **Gris tenue**: texto secundario, etiquetas de filas, navegación inactiva, íconos de datos.
- **Hueso** (fondo): fondo de las páginas de consulta.
- **Blanco superficie**: tarjetas, píldoras, columna de pisos, pines, insignia.
- **Gris píldora**: fondo de cada piso en la columna y del círculo claro.
- **Línea**: separadores de filas, bordes de píldoras chicas, campos y pestañas.
- **Línea fuerte**: borde al pasar el puntero, punto inactivo de la parada, barra de desplazamiento.
- **Papel**: fondo de la vista del piso cuando no hay cenital del barrio.
- **Negro escena**: fondo bajo los renders y el visor 360 mientras cargan.

### Estados
- **Disponible** (verde sobre verde muy claro), **Reservado** (ocre sobre crema), **Vendido** (gris pizarra sobre gris claro). Pareja texto/fondo para la etiqueta de estado; el verde de disponible también tiñe el bloque de bono y la píldora «copiado».

### Named Rules
**La Regla del Acento Prestado.** El acento nunca se escribe en la hoja ni en un componente: llega del proyecto. Un componente que necesite color de marca usa `var(--acento)` y `var(--acento-tinta)`, sin excepción.

**La Regla de la Voz Única.** El acento marca la acción y la selección actual, nada más. Un viewport inmersivo lleva a lo sumo la acción principal, la selección actual y la navegación de recorrido en acento; el resto es blanco y negro.

## Typography

**Display Font:** Manrope variable (400–800), autoalojada en `vendor/fonts/`, con system-ui de respaldo.
**Body Font:** la misma Manrope.

**Character:** una sola familia geométrica y humanista, cargada a peso 800 para títulos, precios y datos, y a 400 para el texto corrido. La jerarquía sale del peso y el tamaño, no de una segunda familia.

### Hierarchy
- **Display** (800, clamp de 2.7 a 6rem, interlineado 0.98, -0.035em, máximo 12ch): solo el nombre del edificio en la portada, abajo a la izquierda sobre el degradado.
- **Headline** (800, clamp de 1.9 a 2.75rem, -0.025em): título de las páginas de consulta; la ficha sube a clamp de 2 a 3rem.
- **Precio** (800, 1.85rem, -0.02em, cifras tabulares): el precio en la tarjeta de unidad.
- **Title** (800, 1.3–1.5rem): nombre de la unidad en la tarjeta, grupos del catálogo, modelos, insignia del piso.
- **Body** (400, 16px, interlineado 1.55): texto corrido; el lema de portada se limita a 42ch.
- **Label** (700, 0.88–0.94rem): píldoras, pestañas, navegación, conmutadores.
- **Estado** (800, 0.78rem): etiqueta de disponibilidad.
- **Cabecera de tabla** (800, 0.72rem, 0.06em, mayúsculas): solo cabeceras de columna de la tabla y rótulos de los filtros.

### Named Rules
**La Regla de la Cifra Tabular.** Todo número que se compara (pisos, precios, áreas, conteos, IDs de unidad) va con `font-variant-numeric: tabular-nums`.

**La Regla de una Familia.** Manrope y nada más. No se introduce una segunda familia de display.

## Layout

**Vistas inmersivas.** Ocupan `position: fixed` todo el viewport bajo el aviso de demo. La imagen es `object-fit: cover`; detrás, una copia desenfocada (28px, brillo 0.62) llena los bordes cuando la imagen se muestra entera (`contain`). Las piezas flotan en esquinas a 16px del borde (12px en móvil): marca y menú arriba a la izquierda, controles arriba a la derecha, zoom y conmutadores abajo.

**Franjas proyectadas.** Las franjas de piso son polígonos SVG calculados desde la geometría del edificio y dibujados sobre el render con el mismo `viewBox` del tamaño de la imagen y el mismo encuadre que ella: `xMidYMid slice` cuando la imagen está en `cover`, `meet` cuando está entera. Si el encuadre de la imagen cambia, el del SVG cambia con él.

**Columna de pisos.** Un tablero de ascensor fijo a la derecha, centrado en vertical, de ancho `--col-w` (116px). Los controles centrados (parada, pista, flecha derecha) se desplazan media columna para quedar centrados en el área libre. En móvil la columna se vuelve una tira horizontal pegada abajo con las etiquetas cortas y `--col-w` pasa a 0.

**Planta del piso.** A pantalla completa sobre una cenital del barrio, con zoom y arrastre (`cursor: grab`, `touch-action: none`). Los marcadores de unidad son botones HTML en una capa aparte, de tamaño fijo (34px de alto, 30px en móvil), que siguen la transformación del plano sin escalarse. Sin cenital, la planta se dibuja con márgenes que respetan la columna y una sombra de lámina.

**Páginas de consulta.** Contenedor de 1320px, barra pegajosa de 64px bajo el aviso, relleno lateral clamp de 16 a 32px. La ficha pasa a dos columnas a partir de 960px (contenido + tarjeta pegajosa de 380px). El catálogo es una tabla que en móvil se vuelve filas en retícula; los modelos, una retícula auto-fill de mínimo 330px.

**Ritmo.** Pasos de 6, 8, 12, 16, 20 y 28px; 16px es el margen de todo lo flotante y 20px el relleno de la tarjeta.

**Puntos de corte.** 760px (móvil: columna abajo, tarjeta como hoja inferior, textos de conmutadores ocultos) y 960px (ficha a dos columnas).

### Named Rules
**La Regla del Marco Ausente.** En una vista inmersiva nada ocupa un borde completo de la pantalla salvo el aviso de demo y, en móvil, la columna de pisos y la hoja de la tarjeta. Todo lo demás es una pieza flotante con aire alrededor.

**La Regla del Mismo Encuadre.** Cualquier capa dibujada sobre un render (franjas, polígonos, marcadores) comparte el sistema de coordenadas de la imagen y su modo `slice`/`meet`. Una capa que no lo comparte se desalinea en cuanto cambia la proporción de la pantalla.

## Elevation & Depth

Sistema con elevación real: las piezas flotantes se separan de la imagen con una sombra difusa de dos capas, no con bordes. Dentro de las tarjetas y en las páginas claras, las piezas secundarias pierden la sombra y toman un borde de línea, porque ya están sobre blanco.

### Shadow Vocabulary
- **Flotante** (`0 8px 24px rgb(0 0 0 / .16), 0 2px 6px rgb(0 0 0 / .08)`): píldoras, círculos, columna de pisos, pines, insignia, leyenda, parada, conmutadores.
- **Alta** (`0 22px 48px rgb(0 0 0 / .22), 0 6px 14px rgb(0 0 0 / .1)`): tarjeta de unidad flotante, menú lateral, diálogo de consulta, y el estado hover de la píldora.

### Named Rules
**La Regla de la Sombra Real.** Sobre imagen, una pieza flotante lleva sombra; sobre blanco, borde de 1px de línea y ninguna sombra. Nunca las dos a la vez, nunca ninguna sobre imagen.

## Shapes

Todo lo que se toca y es pequeño es completamente redondo: píldoras, círculos, etiquetas de estado, pines, conmutadores, pestañas (999px). Los contenedores son rectángulos de esquina amplia: tarjeta, lámina, visor 360 y modelos a 20px; filtros, tabla y vacío a 18px; insignia y marcador de imagen faltante a 16px; piso de la columna a 14px; campos a 12px; rótulo de vista sobre la imagen a 8px. La hoja inferior móvil (tarjeta y columna) redondea solo las esquinas superiores a 22px.

Los íconos son SVG dibujados a mano en retícula de 24, trazo de 1.8, puntas y uniones redondeadas, en `currentColor`, a 20px (17–18px dentro de controles chicos).

## Components

### Píldoras
Piezas táctiles y seguras, blancas o negras, que flotan sobre la imagen.
- **Shape:** totalmente redondas (999px), alto mínimo de 44px.
- **Primaria:** blanca con texto tinta, peso 700 y sombra flotante.
- **Acento:** la acción principal de cada vista (Ingresar, Buscar departamento, Consultar). La grande (56px) solo en la portada.
- **Oscura:** acción secundaria fuerte sobre fondo claro.
- **Chica:** 38px, sin sombra, borde de línea; la opción actual se vuelve tinta con texto blanco.
- **Hover / Active:** sube 1px y pasa a sombra alta; al presionar baja y escala a 0.98. Transiciones de 0.25s con la curva `cubic-bezier(.16, 1, .3, 1)`.
- **Confirmación:** al copiar un enlace la píldora o el círculo se vuelve verde disponible.

### Círculos
- 44px, tinta con ícono blanco y sombra flotante (menú, cerrar, compartir). Variante clara (gris píldora, sin sombra) dentro de la tarjeta, variante blanca para el zoom, chica de 36px.
- **Flechas de recorrido:** círculos de 52px en acento a media altura, para pasar de una vista del edificio a la siguiente (44px en móvil).

### Conmutador segmentado
- Cápsula blanca translúcida (0.94) con sombra; las opciones son píldoras de 36px y la elegida se vuelve tinta. En páginas claras, la cápsula es papel sin sombra y la elegida es blanca.
- **Día/Noche** solo existe si el proyecto tiene al menos un render nocturno; si no, el control no se dibuja.

### Etiqueta de estado
- Cápsula con fondo del estado, texto del estado a peso 800, un punto de 8px en `currentColor` y la palabra (Disponible, Reservado, Vendido). Se usa en la tarjeta, la leyenda y el catálogo.

### Tarjeta de unidad (componente firma)
- **Corner Style:** 20px; en móvil, hoja inferior de esquinas superiores a 22px y hasta 58% de alto, con el área segura sumada abajo.
- **Background:** blanco superficie.
- **Shadow Strategy:** sombra alta cuando flota; en la ficha va con borde de línea y pegajosa.
- **Contenido:** cabecera con nombre de unidad y círculo de cerrar, tipo en tenue, precio en display de datos, bono en un bloque verde disponible de radio 12, filas de datos con ícono + término + valor tabular separadas por línea, y acciones (Planta, Recorrido, Consultar) como píldoras sin sombra. Aparece con un leve ascenso y escala (0.45s).
- **Comportamiento:** abrir planta, recorrido o consulta nunca pierde la unidad elegida; cada unidad tiene URL propia.

### Columna de pisos (componente firma)
- Tablero de ascensor: cápsula blanca de radio 20 con sombra, lista de pisos como bloques gris píldora de radio 14 con el número a 800 tabular y las unidades libres debajo en tenue.
- **Resaltado** (el puntero está sobre la franja de ese piso): anillo interior de 2px en acento. **Activo:** fondo acento con tinta del acento. **Agotado:** el texto secundario pasa a gris vendido.

### Franjas de piso
- Polígono por piso sobre el render, relleno acento y trazo blanco de 2px sin escalar, ambos invisibles en reposo. Al activarse: relleno al 42% y trazo al 90%, con un rótulo flotante tinta junto al puntero. Transición de 0.3s.

### Marcadores de unidad en la planta
- Píldora blanca de 34px con punto de estado de 10px y el ID de la unidad a 800 tabular, sombra flotante. La elegida se vuelve acento con punto y texto en tinta del acento; la vendida baja el texto a gris vendido.
- **Zonas:** el polígono de cada unidad lleva trama por estado (reservado rayado a 45°, vendido cruzado) además del color, contorno tinta al pasar el puntero o enfocar, y contorno acento de 10 unidades cuando está elegida.

### Campos
- 44px, fondo casi blanco, borde de línea, radio 12, peso 600. Foco: contorno de 2px en acento y fondo blanco. Los selects llevan su chevrón dibujado con el mismo trazo de los íconos.

### Navegación
- **Menú:** panel blanco de hasta 392px que entra desde la izquierda sobre un velo oscuro; enlaces a 1.35rem peso 800 separados por línea; el actual en acento.
- **Barra de páginas:** blanca, pegajosa, con enlaces como píldoras tenues y el actual sobre gris píldora.
- **Pestañas de la ficha:** píldoras de 42px con borde de línea; la actual en tinta.
- **Marca:** el nombre de la inmobiliaria en versalitas espaciadas en acento sobre el nombre del proyecto, como bloque de logotipo arriba a la izquierda. Es un sustituto de logotipo, no un estilo de rótulo.

### Aviso de demo
- Franja de 30px en tinta con texto claro a 0.74rem peso 600, fija arriba y por encima de todo. Obligatoria mientras `modoDemo` esté activo; sin modo demo, `--aviso-h` pasa a 0 y las vistas suben hasta arriba.

### Visor 360
- Pannellum 2.5.7 tematizado: radio 20 sobre negro escena, controles blancos con sombra flotante e íconos con el mismo trazo, zoom como cápsula de 40×80, hotspots de escena como círculos de 44px en acento con halo blanco. Se carga solo cuando se pide.

## Do's and Don'ts

### Do:
- **Do** llevar el render a sangre (`object-fit: cover`) en portada, edificio y piso, con las piezas flotando a 16px de los bordes.
- **Do** tomar el color de marca solo de `var(--acento)` / `var(--acento-tinta)`, inyectados por `generar.js` desde `estilo.acento` del proyecto.
- **Do** dibujar franjas y polígonos con el mismo `viewBox` y el mismo modo `slice`/`meet` que la imagen que cubren.
- **Do** mostrar el estado como punto dibujado + palabra, y en la planta añadir trama (rayado para reservado, cruzado para vendido).
- **Do** mantener los marcadores de la planta como HTML de tamaño fijo que siguen al plano sin escalarse.
- **Do** dar sombra flotante a lo que va sobre imagen y borde de línea sin sombra a lo que va sobre blanco.
- **Do** guardar cada imagen reemplazada con un nombre nuevo (`-v2`, `-v3`…) y actualizar la referencia en `datos/`; el servidor cachea por nombre.
- **Do** mostrar el aviso de demo en toda vista mientras el proyecto esté en modo demo.
- **Do** dibujar el conmutador Día/Noche solo cuando el proyecto tenga renders nocturnos.
- **Do** convertir la tarjeta de unidad en hoja inferior y la columna de pisos en tira horizontal por debajo de 760px.

### Don't:
- **Don't** enmarcar las vistas inmersivas con cabeceras, barras laterales o secciones apiladas; rechazar la web inmobiliaria de secciones apiladas es la tesis.
- **Don't** escribir un color de marca fijo en `core.css` ni en un componente.
- **Don't** comunicar disponibilidad solo con color.
- **Don't** sobrescribir una imagen publicada con el mismo nombre de archivo.
- **Don't** esconder el precio o la disponibilidad detrás de una consulta.
- **Don't** introducir una segunda familia tipográfica ni íconos de fuente o glifos; los íconos son SVG de trazo 1.8 en retícula 24.
- **Don't** usar texto pequeño espaciado en mayúsculas como rótulo encima de un título; las mayúsculas espaciadas quedan para las cabeceras de tabla y filtros, y las versalitas en acento solo para el bloque de marca.
