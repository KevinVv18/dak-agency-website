---
name: dakagency.net
description: Oscuro, denso y de alto contraste — y auditable con el inspector abierto.
colors:
  fondo: "#030106"
  superficie-alta: "#0A0612"
  acento: "#B024FF"
  acento-texto: "#B93EFF"
  acento-claro: "#8D1DCC"
  teal: "#00C8C8"
  texto: "#ffffff"
  texto-2: "rgba(255, 255, 255, 0.55)"
  filete: "rgba(255, 255, 255, 0.09)"
  claro: "#F4F1F6"
  plancha-clara: "#E8E3EC"
  tinta-clara-2: "#5F5A66"
  filete-claro: "#DDD6E3"
typography:
  display:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(3rem, 8vw, 8rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  action:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  none: "0"
  sm: "2px"
  md: "4px"
  full: "50%"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
  2xl: "4rem"
  3xl: "6rem"
components:
  boton-primario:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.texto}"
    rounded: "{rounded.none}"
    padding: "0 1.75rem"
    height: "52px"
  boton-marcado:
    backgroundColor: "transparent"
    textColor: "{colors.texto-2}"
    rounded: "{rounded.none}"
    padding: "0 0.75rem"
    height: "44px"
  boton-marcado-activo:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.texto}"
  celda-hoja:
    backgroundColor: "{colors.superficie-alta}"
    rounded: "{rounded.none}"
    padding: "0"
  visor:
    backgroundColor: "{colors.superficie-alta}"
    textColor: "{colors.texto}"
    rounded: "{rounded.none}"
    width: "min(1100px, 100%)"
---

# Design — dakagency.net

<!-- impeccable:design 2 -->

> **Alcance:** el sitio principal. El demo inmobiliario tiene su propio mundo en
> [DESIGN.inmobiliaria.md](DESIGN.inmobiliaria.md).
>
> Este documento describe **lo construido**, no lo deseado. Donde hay deuda, se
> dice que es deuda.

## Tesis

Una agencia que vende posicionamiento, rendimiento y accesibilidad tiene que ser
el primer sitio que los cumple. El argumento no se escribe: se comprueba abriendo
el inspector.

De ahí que el mundo visual sea **oscuro, denso y de alto contraste** —el negocio
es nocturno, de pantalla— pero medido: cada decisión tiene que pasar la auditoría
que la propia agencia le vendería a un cliente.

## Lo que este mundo NO es

Prohibido reintroducir, porque se retiró a propósito el 07-ago-2026:

- **Cuadrícula de filetes tileada** como textura de sección. Estaba en nueve
  secciones con el mismo mosaico de 60px y era la firma más reconocible de UI
  generada. La textura que sí existe hoy —la estela— es de **una sola
  dirección**, casi horizontal, y no dibuja celdas.
- **Texto con degradado** (`background-clip: text`). El énfasis lo dan el peso y
  el tamaño. Además, un degradado recortado al texto hace el contraste
  inmedible.
- **Bordes de acento laterales** por encima de 1px.
- **Rebote elástico** en las transiciones.
- **Animar `width`, `max-height` o `margin`.** No es solo estética: recalcula el
  layout en cada frame.
- **Halos de color sin desplazamiento** haciendo de sombra. La profundidad lleva
  offset y desenfoque. Un resplandor puede pintarse como **fondo** de una banda
  (la costura de `/gallery`); lo prohibido es usarlo como `box-shadow`.

## Color

| Rol | Token | Valor | Trabajo |
|---|---|---|---|
| Fondo | `--color-primary` / `--superficie` | `#030106` | Casi negro, nunca negro puro |
| Fondo levantado | `--superficie-alta` | `#0A0612` | Alterna con el base para que el borde entre secciones se registre. Es también la plancha del fotograma y el cuerpo del visor |
| Acento | `--color-accent` | `#B024FF` | Superficies, bordes, botones |
| Acento en texto | `--color-accent-texto` | `#B93EFF` | **Solo texto.** El morado de marca da 4.49:1 sobre el fondo y falla AA por una centésima; este es el mismo tono con 12% de blanco (5.14:1) |
| Secundario | — | `#00C8C8` | Teal. Píldoras, filetes, la segunda luz |
| Texto | `--color-white` / `--color-texto-2` | `#ffffff` / `rgba(255,255,255,.55)` | El secundario al 0.55 da 6.26:1; por debajo de 0.46 falla AA |
| Filete | — | `rgba(255,255,255,.09)` | El trazo de 1px que separa celdas y bloques |

**Regla dura:** el alpha cuenta para el contraste. Blanco al 0.45 sobre el fondo
da 4.43:1 y no pasa. Antes de bajar una opacidad de texto, se calcula.

**Regla dura:** sobre el morado de marca la tinta es **blanca**, no negra.
Medido: `#030106` sobre `#B024FF` da 4.46:1 y la auditoría lo canta a 4.41; el
blanco da 4.62:1 y pasa. Se cambia la tinta, no el morado.

Los siete servicios tienen color propio. Dos se corrigieron para poder usarse
como texto: `#B024FF → #B738FF` (Branding) y `#9B59B6 → #A163BA`
(Automatización).

### El tramo claro

El sitio tiene **un solo** tramo claro por sección de fotografía, porque la
fotografía de DAK está hecha sobre fondos claros. Sus tokens están medidos sobre
`#F4F1F6` y son los únicos válidos ahí:

| Rol | Valor | Contraste sobre `#F4F1F6` |
|---|---|---|
| Fondo claro | `#F4F1F6` | — |
| Plancha | `#E8E3EC` | — |
| Tinta | `#030106` | 18.56:1 |
| Tinta secundaria | `#5F5A66` | 5.97:1 |
| Acento claro | `#8D1DCC` | 5.90:1 |
| Filete claro | `#DDD6E3` | — |

Los declara cada superficie que los necesita (`Estudio.css` para la portada,
`.tramo-claro` en `Galeria.css` para `/gallery`). **No se importan entre sí:**
tocar `Estudio.css` cambiaría la home sin que el diff de la otra ruta lo
insinuara.

## Tipografía

**Poppins**, autoalojada, en 600/700/800. Sin serif, sin segunda familia de
display.

- Encabezados: `h1` `clamp(3rem, 8vw, 8rem)` peso 900; la escala baja hasta `h4`.
- Piso de texto funcional: `--texto-minimo: 11px`. No hay excepciones.
- Tracking negativo en display (`-0.02em` a `-0.04em`).
- Una ruta puede tener **un solo** tipo de display. En `/gallery` es el rótulo
  de la hoja (`clamp(2.5rem, 7vw, 5.5rem)`, peso 800); todo lo demás baja a
  13px o a 11px. Cuando dos archivos comparten página van al **mismo rango de
  rótulo**: la escala dice cuál manda, y no puede decir lo contrario que la
  tesis.

## Composición

- **Secciones a pantalla completa**, cada una con su propia textura de fondo.
- **La estela** (`--estela-fuerte` / `--estela-media` / `--estela-tenue`): trazos
  casi horizontales, estáticos, que pierden fuerza conforme se baja. Es el
  sistema de fondos vigente y sí está consumido: Servicios la fuerte, Demos la
  media, y Taller, Nosotros, Blog, Contacto y `/gallery` la tenue. El Estudio es
  el ancla clara y no lleva ninguna. El pie es la única sección sin textura.
  *(El comentario de `index.css` que dice «hoy ninguna sección los consume» está
  obsoleto: lo escribió el commit que los definió.)*
- **Luz de sección** (`--luz-seccion`, variante `--luz-seccion-teal`): un
  degradado radial suave. **Su anclaje por sección no funciona y hay que dejar
  de contarlo como sistema:** la variable se declara en `:root`, así que los
  `var(--luz-x)` / `var(--luz-y)` de dentro se sustituyen allí y redeclararlos
  en el consumidor no mueve nada — el degradado se queda en `50% 0%`.
  `Navigation.css` lo hace y silenciosamente no tiene efecto. Hoy solo lo
  consumen `Navigation.css` y `Legal.css`. Es lenguaje del mundo anterior: se
  retira de cada superficie cuando le llega el rediseño.
- **El divisor de sección** —filete de 1px degradado con un punto luminoso— se
  retiró de Nosotros, Blog y Contacto; queda el rastro documentado en la cabecera
  de esos CSS. Ya no es «el recurso estructural del sitio»; lo estructural hoy es
  el **filete plano de 1px** (`--filete`), sin degradado y sin punto.
- Rejillas de tarjetas para servicios, demos y clientes.

## Motion

- **Entrada**: fade + desplazamiento con `framer-motion`, disparado por
  `useInView`. En la home sigue siendo el mismo gesto en todas las secciones:
  deuda declarada, ver abajo.
- **Un momento animado por ruta.** `/gallery` es la primera que lo cumple: seis
  entradas idénticas pasaron a una sola, la costura. Es la forma que tiene que
  seguir el resto.
- **Easing**: `--ease-out-expo` `cubic-bezier(0.19, 1, 0.22, 1)`. Único.
- Solo se anima `transform` y `opacity`.
- `prefers-reduced-motion` detiene las animaciones decorativas. Cada hoja de
  estilos nueva declara su propio bloque; no se hereda de nadie.

## Reglas que no se rompen

- Un solo `h1` por ruta; jerarquía sin saltos.
- Texto funcional nunca bajo 11px.
- Contraste AA contando el alpha.
- Área táctil de 44×44 donde el espaciado lo permita; nunca bajo 24×24. **El
  control declara su propio `min-height`/`min-width`.** La lista de
  pseudo-elementos de `index.css` solo ampliaba el **alto**, y por eso la
  auditoría cantaba controles de 33×44; los controles nuevos no entran en esa
  lista.
- **La escala de z-index es la de `index.css` y ya no se parchea a mano.**
  `--z-navigation: 1000`, `--z-modal: 9995`, `--z-tooltip: 9998`. El 9995 no es
  capricho: la burbuja del chat vive en 9990 por su cuenta, así que cualquier
  velo por debajo la dejaba flotando sobre el diálogo. Los dos diálogos del
  sitio usan el token.
- Un diálogo es un diálogo: `createPortal` al `body`, `role="dialog"`,
  `aria-modal`, `inert` + `aria-hidden` sobre `#root`, foco al abrir y devuelto
  al elemento exacto al cerrar, y `Escape`. El patrón canónico está en
  `Projects.jsx` y lo repite `VisorObra.jsx`.
- Todo disparador es un `<button>`, no un `div` con `onClick`.
- Los iconos van como SVG en línea. Nunca un glifo tipográfico.
- El HTML se prerenderiza y debe seguir siendo legible sin JavaScript.
- La media pesada va a Cloudinary, no al repo. Lo que sí vive en el repo se
  sirve con variantes: `npm run taller:variantes` escribe un `-xs` de 360px y un
  `-sm` de 700px junto a cada asset gráfico, y el `srcset` las usa. Medido en
  `/gallery` a 375px: 42 peticiones locales, 479 KB, la mayor de 37 KB.
- `npm run auditar:movil` en verde antes de mergear.

## `/gallery` — la hoja de contactos

Una superficie **dentro** de este mundo, no un mundo nuevo: mismo `#030106`,
mismo morado, misma Poppins, misma nav y mismo pie. Lo que aporta es una
materialidad reutilizable —la hoja— y unas cuantas reglas que valen fuera de
ella. El contrato de dirección va como comentario en el HTML emitido:
`grep "mesa-de-luz" dist/gallery/index.html`.

- **La hoja.** Retícula estricta de 3 / 5 / 7 columnas (2 / 4 para el formato
  panorámico), canal de 2px, tope de 1400px. El mismo componente de celda sirve
  a los tres archivos: 21 piezas del Taller, 4 portadas panorámicas y 26
  sesiones del Estudio, 51 obras en total.
- **La cantidad es el argumento.** Sin hero y sin párrafo de bienvenida: la
  retícula ya está poblada en el primer viewport.
- **`contain` para lo diseñado, `cover` para lo fotografiado.** Una pieza
  gráfica *es* sus bordes y recortarla le corta el titular o el teléfono; el
  positivo de una foto se recorta sin daño porque el fotograma entero está a un
  clic.
- **Marcar, no filtrar.** La fila de categorías apaga lo no marcado (opacidad
  0.28) y lo deja visible, pulsable y en el tabulador. Esconderlo haría el
  archivo más pequeño de lo que es.
- **La placa opaca.** Toda etiqueta sobre una imagen va sobre placa de color
  sólido, nunca directamente sobre el píxel: encima de una foto el contraste es
  incalculable y la auditoría se salta —sin avisar— lo que no puede medir.
- **El foco va por dentro.** El anillo global de 3px con 3px de separación se
  come a los vecinos en un canal de 2px: aquí `outline-offset: -3px`.
- **La costura.** La banda donde la mesa se enciende y el archivo pasa de
  negativo a positivo. Es el único momento animado de la ruta y el resplandor lo
  pone el fondo de la banda, no una sombra.
- **El pie de hoja.** Las cifras van en una línea a tamaño de dato, selladas por
  un filete, y la acción principal ocupa el ancho de la hoja. No tres tarjetas de
  número grande sobre etiqueta pequeña.

## Deuda declarada

Lo que está mal y todavía no se ha corregido, dicho sin adornos:

1. **Monoespaciada decorativa.** El eyebrow `[ 0N ]` y `.section-tag`
   desaparecieron del JSX, pero `var(--font-mono)` sigue vivo como recurso
   decorativo en Nosotros, el pie y el índice de página, y `.section-tag` sigue
   declarada como CSS muerta en `Services.css`. Queda limpiar.
2. **Demos y trabajo de clientes comparten sección** en la home y se leen como lo
   mismo, siendo cosas distintas. Sin resolver ahí. En `/gallery` sí se separó:
   las cinco piezas de autopromoción de DAK salieron del archivo porque son
   muestras propias, no trabajo de cliente (los ficheros siguen en
   `src/assets/dak/`, sin importar).
3. **La fotografía todavía enseña trabajo personal** (familia, recién nacido)
   junto a la cartera comercial. El peso ya está invertido —comercial primero,
   familiar como línea menor— pero la línea familiar sigue publicada.
4. **Una sola entrada animada para todo.** Sigue en la home, sección por sección.
   `/gallery` ya está fuera: una sola animación en toda la ruta.
5. ~~`.photo-gallery::before` marcado como acento lateral.~~ Resuelto: el
   selector ya no existe; el divisor degradado se retiró del sitio.
6. **`--luz-seccion` es un token roto que sigue en pie.** Ver Composición.
   `Navigation.css` lo usa creyendo que lo ancla y no lo ancla. Hay que retirarlo
   o reescribirlo como clase, no dejarlo como sistema aparente.
