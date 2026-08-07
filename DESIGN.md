# Design — dakagency.net

<!-- impeccable:design 1 -->

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
  generada. Sobrevive **solo** en `.cursor-grid-reveal`, que no es fondo sino un
  gesto que sigue al ratón.
- **Texto con degradado** (`background-clip: text`). El énfasis lo dan el peso y
  el tamaño. Además, un degradado recortado al texto hace el contraste
  inmedible.
- **Bordes de acento laterales** por encima de 1px.
- **Rebote elástico** en las transiciones.
- **Animar `width`, `max-height` o `margin`.** No es solo estética: recalcula el
  layout en cada frame.
- **Halos de color sin desplazamiento** haciendo de sombra. La profundidad lleva
  offset y desenfoque.

## Color

| Rol | Token | Valor | Trabajo |
|---|---|---|---|
| Fondo | `--color-primary` | `#030106` | Casi negro, nunca negro puro |
| Acento | `--color-accent` | `#B024FF` | Superficies, bordes, botones |
| Acento en texto | `--color-accent-texto` | `#B93EFF` | **Solo texto.** El morado de marca da 4.49:1 sobre el fondo y falla AA por una centésima; este es el mismo tono con 12% de blanco (5.14:1) |
| Secundario | — | `#00C8C8` | Teal. Píldoras, filetes, la segunda luz |
| Texto | `--color-white` / `--color-texto-2` | `#ffffff` / `rgba(255,255,255,.55)` | El secundario al 0.55 da 6.26:1; por debajo de 0.46 falla AA |

**Regla dura:** el alpha cuenta para el contraste. Blanco al 0.45 sobre el fondo
da 4.43:1 y no pasa. Antes de bajar una opacidad de texto, se calcula.

Los siete servicios tienen color propio. Dos se corrigieron para poder usarse
como texto: `#B024FF → #B738FF` (Branding) y `#9B59B6 → #A163BA`
(Automatización).

## Tipografía

**Poppins**, autoalojada, en 600/700/800. Sin serif, sin segunda familia de
display.

- Encabezados: `h1` `clamp(3rem, 8vw, 8rem)` peso 900; la escala baja hasta `h4`.
- Piso de texto funcional: `--texto-minimo: 11px`. No hay excepciones.
- Tracking negativo en display (`-0.02em` a `-0.04em`).

## Composición

- **Secciones a pantalla completa** con su propia luz de fondo.
- **Luz de sección** (`--luz-seccion`, variante `--luz-seccion-teal`): un solo
  degradado radial suave anclado en un punto **distinto en cada sección** vía
  `--luz-x` / `--luz-y`. Sustituyó a la cuadrícula. Su razón de ser es que dos
  secciones no se lean nunca igual.
- **Divisor de sección**: filete horizontal de 1px que se desvanece por los
  extremos, con un punto luminoso centrado. Está en `.services::before`,
  `.photo-gallery::before` y `.about`. Es el recurso estructural del sitio.
- Rejillas de tarjetas para servicios, demos y clientes.

## Motion

- **Entrada**: fade + desplazamiento con `framer-motion`, disparado por
  `useInView`. Es correcto pero **repetido en todas las secciones**: no hay un
  momento orquestado. Deuda declarada.
- **Easing**: `--ease-out-expo` `cubic-bezier(0.19, 1, 0.22, 1)`. Único.
- **Gesto propio**: `.cursor-grid-reveal`, una rejilla que solo existe donde pasa
  el cursor. Es lo más cercano a una firma interactiva que tiene el sitio.
- `prefers-reduced-motion` detiene las animaciones decorativas.

## Reglas que no se rompen

- Un solo `h1` por ruta; jerarquía sin saltos.
- Texto funcional nunca bajo 11px.
- Contraste AA contando el alpha.
- Área táctil de 44×44 donde el espaciado lo permita; nunca bajo 24×24.
- El HTML se prerenderiza y debe seguir siendo legible sin JavaScript.
- La media pesada va a Cloudinary, no al repo.
- `npm run auditar:movil` en verde antes de mergear.

## Deuda declarada

Lo que está mal y todavía no se ha corregido, dicho sin adornos:

1. **Eyebrow, número de sección y monoespaciada.** Cada sección abre con
   `[ 01 ] SERVICIOS` en mono: son tres recursos que el suelo de calidad de
   impeccable desaconseja expresamente, y están juntos.
2. **Demos y trabajo de clientes comparten sección** y se leen como lo mismo,
   siendo cosas distintas.
3. **La sección de fotografía enseña trabajo personal** (familia, recién nacido)
   cuando la cartera real es comercial B2B.
4. **Una sola entrada animada para todo.** Ver Motion.
5. **`.photo-gallery::before`** lo marca el detector como acento lateral. Se
   considera falso positivo —es un divisor horizontal, no un borde de tarjeta—
   pero está sin resolver formalmente.
