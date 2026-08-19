# Dirección de diseño — consola, no documento

**Maqueta de referencia: [`maquetas/panorama.html`](maquetas/panorama.html).** Ábrela antes de
leer nada. Este documento explica por qué es así; la maqueta es lo que hay que conseguir.

## 0. El diagnóstico, y por qué la primera versión de este archivo se quedó corta

La Fase 2 salió como un **documento**: titular enorme, párrafos explicativos, scroll para
enterarse de qué pasa. La primera versión de este archivo culpó al movimiento y llenó tres
páginas de curvas de animación. Se equivocaba de capa. **Ninguna curva arregla una arquitectura
de documento.**

Lo que cambia:

| Antes | Ahora |
|---|---|
| Página que hace scroll | **Consola de `100dvh` que no hace scroll.** Lo que no cabe, no está |
| Titular de display + párrafos | **Cifras y etiquetas de una o dos palabras** |
| La explicación siempre visible | La explicación vive en el **hover** |
| Nav horizontal con texto | **Raíl de iconos**; la etiqueta sale al pasar el cursor |
| Entrada directa a «Hoy» | Entrada a **«Panorama»**: un poco de todo de un vistazo |

La regla que lo resume: **si algo se puede entender con una forma, no se escribe.** El embudo de
la maqueta lleva una barra proporcional bajo cada cifra; el estrechamiento de 109 a 0 se ve sin
leer un solo número. Eso es el listón.

## 1. Qué significa «futurista» aquí, y qué no

La trampa: «futurista» casi siempre acaba en neón, halos, rejillas que brillan y puntos que
laten. Ése es el look **barato**, y además es exactamente el repertorio que marca el detector de
`impeccable` — donde el panel hoy tiene **cero hallazgos**, y no se negocia.

La versión cara de ese mismo look es lo contrario: **precisión y vacío**. Hairlines de 1 px,
cifras tabulares en peso 200, muchísimo aire, color con cuentagotas —el morado y el teal aparecen
en un trazo de 2 px, nunca como relleno— y una sola nota ámbar donde el sistema está roto. La
referencia mental no es una interfaz de videojuego: es un panel de instrumentos que alguien
diseñó para que se lea de un vistazo en una sala oscura.

**Sobriedad y sofisticación son lo mismo aquí.** Nada de lo que sigue añade un brillo.

---

## 2. Curvas y duraciones

Una sola curva para casi todo. Es la que da la sensación de «frena suave y no rebota»:

```css
:root {
  --ease-suave:  cubic-bezier(.32, .72, 0, 1);   /* la de siempre */
  --ease-salida: cubic-bezier(.4, 0, 1, 1);      /* algo que se va: arranca rapido */

  --t-micro:  140ms;   /* color, opacidad de un icono */
  --t-corta:  240ms;   /* hover de fila, foco, badge */
  --t-media:  360ms;   /* entrada de tarjeta, panel de detalle */
  --t-vista:  480ms;   /* cambio de vista completa */
}
```

Reglas duras:

- **Nunca `ease`, `linear` ni `ease-in-out` a secas.** Son las curvas por defecto y se notan.
- **Nada por debajo de 120 ms** (se lee como un parpadeo) **ni por encima de 500 ms** (se lee como
  lentitud).
- **Lo que entra usa `--ease-suave`; lo que sale usa `--ease-salida`** y dura un 60 % de lo que
  duró al entrar. Salir siempre es más rápido que entrar.

## 3. Profundidad: por luz, jamás por brillo

Tres planos, y se distinguen por **claridad de superficie y hairlines**, no por sombras de color:

```css
--fondo:      #030106;                      /* el lienzo */
--superficie: #0A0612;                      /* tarjeta en reposo */
--elevada:    #120C1E;                      /* tarjeta enfocada o abierta */

--linea:      rgba(255,255,255,.07);        /* separador */
--linea-viva: rgba(255,255,255,.14);        /* borde de algo activo */

/* Sombras NEUTRAS. Nunca moradas, nunca teal, nunca con offset 0. */
--sombra-reposo:  0 1px 2px rgba(0,0,0,.4);
--sombra-elevada: 0 8px 24px -8px rgba(0,0,0,.6);
```

**La barra superior es translúcida.** Es la firma más reconocible de la interfaz de Apple y aquí
además tiene función: al hacer scroll, el contenido pasa por debajo y se sigue viendo dónde estás.

```css
.app-header {
  position: sticky; top: 0;
  background: rgba(3,1,6,.72);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--linea);
}
```

Radios: **12 px** en tarjetas, **10 px** en botones, **8 px** en badges. Los 6 px actuales se leen
como panel de administración de 2014.

## 4. Movimiento, uno por uno

### Entrada de contenido
Al montar una vista, sus hijos directos entran **desde 10 px abajo con opacidad 0**, escalonados
**45 ms** entre hermanos, `--t-media` con `--ease-suave`. Se corta a los 8 elementos: a partir de
ahí entran todos juntos, o la última fila tarda un segundo en aparecer.

### Cambio de vista (Hoy → Prospectos → …)
La saliente se va con opacidad 0 y **−6 px** en `--t-corta`. La entrante llega con opacidad 0 y
**+10 px** en `--t-vista`. No se solapan del todo: la entrante arranca a los 80 ms.

El subrayado del nav **se desplaza** entre pestañas, no aparece y desaparece. Hoy hace
`scaleX(.4) → scaleX(1)`, que es un fundido disfrazado.

### Fila y tarjeta bajo el cursor
Solo en `hover:hover`. Sube el fondo un plano y el borde pasa a `--linea-viva`, en `--t-corta`.
**Sin `transform` en filas de tabla** — mover una fila arrastra la vista de al lado.

### Pulsación
Cualquier botón: `transform: scale(.98)` en `:active`, `--t-micro`. Es el detalle que más
«producto terminado» aporta por línea de CSS escrita.

### El botón de WhatsApp
Es la única acción primaria del panel y se puede permitir algo más: al pasar el cursor, la flecha
se desplaza **2 px** en x. Nada más. Sin glow, sin pulso, sin gradiente animado.

### Copiar
Hoy cambia el texto a «Copiado». Que además el icono haga una **transición de copia a check** con
un fundido cruzado de `--t-corta`. Es la confirmación más barata que existe y se siente cara.

### Panel de detalle del prospecto
Entra desde la derecha, **+16 px**, `--t-media`. Sale con `--ease-salida` en el 60 % del tiempo.

### Números
Los contadores (`5 filas`, el score, el rendimiento de fuente) **no cuentan hacia arriba**. Es el
efecto favorito de todo el mundo y aquí es ruido: son cantidades de trabajo pendiente, no logros.

## 5. Lo que sigue prohibido

- Sombras de color, halos, `box-shadow` con offset 0 y color de marca.
- Puntos que laten, «skeletons» que brillan, gradientes animados.
- Fondos que se mueven, partículas, paralaje.
- Cualquier `transform` en un elemento que contenga texto largo mientras se lee.
- Animar `width`, `height`, `top` o `left`. Solo `opacity`, `transform`, `background-color`,
  `border-color` y `backdrop-filter`.

## 6. Accesibilidad, sin excepciones

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ya está puesto y se queda. **Con el movimiento desactivado la interfaz tiene que seguir siendo
legible y completa**: ninguna información puede depender de que algo se anime para aparecer.

## 7. Cómo se comprueba que está bien

- `npx impeccable detect _sales-center` sigue devolviendo **cero hallazgos**.
- El contraste sigue AA en las cuatro vistas.
- A 375 px no hay desbordamiento horizontal.
- Con `prefers-reduced-motion` activo, todo el contenido se ve igual de completo.
- Y la prueba de verdad: **cambiar de pestaña tres veces seguidas no molesta**. Si molesta, la
  duración es larga o la curva es la equivocada.
