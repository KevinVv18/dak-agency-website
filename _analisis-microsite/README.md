# `analisis.dakagency.net` — entregables de análisis de marca

Cada análisis del [circuito de research](../../../research/CIRCUITO.md) se publica aquí
como una página propia. El deck en `.pptx` queda como archivo de trabajo; **lo que se
manda al prospecto es el link.**

```
_analisis-microsite/
├─ .htaccess               ← noindex + cabeceras. NO borrar: aquí hay datos reales de prospectos
├─ robots.txt              ← Disallow: /
├─ index.html              ← raíz neutra, no lista clientes
├─ assets/
│  ├─ dak-logo-blanco.svg  ← logotipo compartido
│  ├─ signos.css / .js     ← mundo actual «Signos vitales» (informes nuevos)
│  └─ analisis.css / .js   ← mundo anterior (los seis informes ya entregados)
├─ auditar-contraste.js    ← se pega en la consola. Cero fallos o no se publica
├─ kusiwawita/index.html   ← primer informe del mundo nuevo
├─ ayb/index.html          ← A&B Representaciones (Chiclayo)
└─ server.cjs              ← preview local; el workflow lo excluye del deploy
```

## Dos mundos visuales conviviendo, a propósito

Desde el **2026-09-02** los informes nuevos se construyen con **«Signos vitales»**
(`signos.css` + `signos.js`). Los seis anteriores —`ayb`, `renovacix`, `multisonrisas`,
`gia`, `domexia`, `xoxo`— **se quedan en `analisis.css` y no se tocan**: sus enlaces
están en manos de prospectos y tienen que seguir mostrando lo que se presentó en la
reunión. No hay migración pendiente; es una decisión.

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

## «Signos vitales» — el mundo de los informes nuevos

El informe deja de parecer un deck y pasa a ser **la hoja de monitorización de una
marca**. El problema que resuelve es concreto: en el formato anterior **todo pesaba lo
mismo**, y un dato demoledor ocupaba el mismo espacio visual que uno de relleno. Un trazo
plano no necesita que nadie lo explique.

- **Cada capítulo es una derivación** con su etiqueta en el riel, y el estado se lee en la
  **forma**: bloques apilados = actividad, columnas vacías = silencio, ráfaga = anuncios
  que la competencia tiene encendidos.
- **Toda cifra va con su rango de referencia**, como un análisis de laboratorio: «20
  seguidores» deja de ser una opinión y pasa a ser *fuera de rango, siendo el rango local
  156–787*. El marcador de estado no es solo color: `fuera` lleva filete doble, `atención`
  lleva filete discontinuo, `dentro` lleva filete simple.
- **La portada es un solo gráfico** con el diagnóstico dentro. En Kusiwawita, sus semanas
  y las de su competencia sobre el mismo eje y con la misma unidad.
- **Al imprimir, la pantalla se vuelve papel**, y el logotipo va sobre su propia superficie
  oscura, porque es blanco y si no desaparecería.

### El gráfico se cuenta, no se interpreta

> **Aviso, y viene de haberlo hecho mal.** La primera versión de este mundo dibujaba un
> trazo tipo electrocardiograma en SVG, generado por `signos.js` desde atributos
> `data-series` / `data-ticks`. **Se retiró el mismo día que se estrenó, por dos motivos.**
>
> El técnico: `vector-effect:non-scaling-stroke` mide el `stroke-dasharray` en píxeles
> renderizados, mientras `getTotalLength()` devuelve unidades del `viewBox`. Como el campo
> se estiraba, el guion se quedaba corto y **la línea se cortaba antes de su último
> punto** — solo a ciertos anchos, así que en local se veía bien y en producción no.
>
> El de verdad: **no se entendía.** Un eje de «me gusta por día de publicación» no le dice
> nada a quien tiene que aprobar un presupuesto, y las marcas verticales del carril de la
> competencia se leían como un fallo de dibujo, no como un dato. Un gráfico que hay que
> explicar en una reunión ya perdió.

Lo que hay ahora es un **conteo por semanas escrito en HTML**, sin SVG y sin JavaScript:
cada bloque es una cosa y se cuentan con el dedo. Dos carriles enfrentados sobre el mismo
eje, con la **misma unidad y el mismo alto de bloque**, así que comparar es mirar.

```html
<div class="t-lane up t-row">
  <div class="t-wk" style="--n:3"><span class="t-cnt">3</span><span class="t-bl"></span></div>
  <div class="t-wk z"><span class="t-cnt">0</span><span class="t-bl"></span></div>
</div>
```

`--n` es el número de unidades de esa semana y `.z` marca las vacías. En el carril de
abajo se invierte el orden de los dos `<span>` para que la cifra quede bajo la barra. Todo
lo demás —la altura, los bloques, el corchete de anotación— lo resuelve `signos.css`.

**Cada carril declara en su rótulo qué es un bloque** («cada bloque, una publicación»).
Esa línea es la que evita la pregunta «¿y esas rayas azules?», que es exactamente lo que
hundió a la versión anterior.

### La regla del PDF: lo que significa algo se pinta con un borde

**El navegador no imprime fondos** salvo que quien imprime tenga marcada la casilla de
«gráficos de fondo», y esa casilla no la controlamos: la marca —o no— el dueño del
negocio cuando le da a «Guardar en PDF». Salió un PDF con los números y los corchetes
—que son bordes— y **las barras en blanco**.

No se arregla forzando `print-color-adjust:exact`, porque eso solo funciona si la casilla
está puesta. Se arregla cambiando la pintura: **cada bloque es un elemento con
`border-top`**, y un borde se imprime siempre. Misma pintura en pantalla y en papel, sin
dos caminos que se puedan desincronizar.

Se aplicó a todo lo que carga información, no solo al gráfico de portada: las barras del
censo, los rombos de la leyenda, las patas de los corchetes, las viñetas de las listas y
los filetes de los rótulos. Los fondos quedan **solo para lo que puede desaparecer sin
que se pierda un dato**: el tinte de las semanas de silencio, el realce de la fila de la
marca y el color del papel.

Para comprobarlo sin imprimir, con la página abierta en la consola:

```js
for (const s of document.styleSheets) for (const x of s.cssRules)
  if (x.type === 4 && (x.conditionText||'').includes('print')) x.media.mediaText = 'screen';
document.head.insertAdjacentHTML('beforeend',
  '<style>*,*::before,*::after{background-image:none!important;background-color:transparent!important}</style>');
```

Eso deja la página exactamente como sale del diálogo de impresión con los fondos
apagados. **Si desaparece un dato, está mal pintado.**

Reglas duras del componente:

- **Nombres de clase con prefijo `t-` y anidados bajo `.tally-g`.** La primera versión usó
  `.v`, `.row` y `.k`, y `.v` ya era la fila de las constantes, con dos columnas de 7,5 y
  8,5 rem: cada número heredó ese ancho, reventó la rejilla y las barras salieron una
  columna corridas respecto a su fecha. En una hoja compartida por varios componentes, un
  nombre genérico es una bomba de relojería.
- **El tramo que abarca cada corchete va en CSS, no en un `style=`** del informe: en un
  teléfono el de la ráfaga necesita más columnas o su texto se parte en cuatro líneas.
- **El `aria-label` del contenedor cuenta la historia completa en palabras.** Es un
  `role="img"`: quien no lo ve tiene que quedarse con lo mismo.

El riel de derivaciones y el índice se construyen leyendo las `<section data-ch="…">`, así
que **un capítulo nuevo no añade marcado extra**. El teclado (↓ ↑ espacio RePág AvPág
Inicio Fin, `Esc`) viene gratis. Es lo único que hace `signos.js`: **no dibuja datos.**

Reglas que hay que mantener al añadir una marca:

- `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`.
- Cada afirmación con su fuente y su fecha al pie de sección (`.src`), y el **límite
  honesto** de esa fuente escrito al lado.
- **Ningún texto funcional por debajo de 11 px** (`.69rem`). La primera versión tenía los
  rótulos de eje a 9,6 px y a 2,57:1 de contraste.
- **Nada de dibujo vectorial para los datos.** Cajas de CSS, que no se deforman ni se
  cortan.
- El gráfico **dibuja el dato y no lo exagera**: misma unidad y mismo alto de bloque en
  todos los carriles y en todos los informes. Una marca sana debe verse sana.
- **Sin JavaScript la página se lee entera y el gráfico también.** Lo único que se pierde
  es el riel, el índice y el teclado.

---

## Diseño del mundo anterior (`analisis.css`): las reglas que lo sostienen

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

### Contraste: la regla dura

**Todo componente de fondo claro declara su propio color de texto.** Si no lo hace, dentro
de una `section.dark` hereda el blanco de `.dark` y queda **blanco sobre blanco**. Pasó
con las tablas de los capítulos de riesgo —que son justamente secciones oscuras con una
tabla clara dentro— en tres de los cuatro informes a la vez.

No se arregla caso por caso. Está resuelto por construcción en la hoja:

- `.tw`, `td`, `td b` fijan `color:var(--tx)`; `tr.me td` fija `#fff`.
- `.dark .tier`, `.dark .step`, `.dark .vs .col` fijan su color por si un informe futuro
  mueve esos bloques a una sección oscura.
- **Los colores semánticos se redefinen dentro de `.dark`** (`--red`, `--green`, `--amber`,
  `--purpd`). Así los `style="color:var(--red)"` que ya hay repartidos por los informes se
  corrigen solos, sin tocar HTML — ni ahora ni en los que vengan. Dentro de `.tw` se
  restauran los originales, porque la tabla es una isla clara.

Verificar **antes de publicar** con `auditar-contraste.js`: se pega en la consola con la
página abierta y devuelve los fallos. **Cero fallos es el criterio de publicación.**
Aplica el umbral correcto por tamaño (3:1 para texto grande, 4,5:1 para el resto), así que
no hay que perseguir falsos positivos en los titulares.

La primera pasada encontró 8 fallos que nadie había visto a ojo, incluidos los pies de
fuente a 3,33:1 — que son justamente lo que sostiene la credibilidad del informe.

> **2026-09-02 — el auditor perdió su lista de selectores.** Iba con una lista fija de
> clases que había que mantener a mano, y envejecía con cada rediseño: el día que llegó
> «Signos vitales» habría seguido cantando «cero fallos» sin encontrar una sola de sus
> clases. Ahora recorre **todo elemento con texto propio y visible**, cuenta el alpha del
> color y busca el primer ancestro con fondo opaco. Funciona igual en cualquier plantilla
> futura. En Kusiwawita revisó 323 elementos: 2 fallos, corregidos, y cerró en cero.

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
