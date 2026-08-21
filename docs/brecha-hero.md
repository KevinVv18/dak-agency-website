# La brecha del hero — RESUELTO

**Estado: CERRADO.** No era fluidodinámica. Era `Math.sqrt` de un número
negativo.

## La causa

`difuminar()` es un desenfoque de caja por suma deslizante: suma el valor que
entra por delante y resta el que sale por detrás. Los sumandos son `Float32` y
la resta no deshace exactamente la suma, así que cuando la ventana ya ha dejado
atrás la marca el acumulador no vuelve a cero limpio — se queda en ±1e-17.

`rapidez[]` hace la RAÍZ de esa rampa. `Math.sqrt(-1.2e-17)` es **NaN**.

Medido a 1280×900, antes del arreglo:

- **173 celdas NaN** en `rapidez`, repartidas en **dos columnas de rejilla**:
  u=0,8131 y u=0,8232. Justo donde Kevin veía la barra.
- Toda partícula que muestreaba esas celdas salía con `vel` NaN, y con ella su
  posición. Dejaba de dibujarse y dejaba de contar. **El 6,1% de las partículas
  estaban muertas** en cualquier instante.
- El guardián de renacimiento estaba escrito en negativo
  (`x < -20 || x > ancho + 20 || …`), y **toda comparación contra NaN es falsa**,
  así que la partícula no renacía hasta que se le agotaba la vida: hasta 200
  fotogramas de cadáver.
- En pantalla: una tira de 4-6px donde el lienzo valía exactamente `[3, 1, 6]`
  —el color del fondo, sin un solo trazo encima— y todo lo que quedaba a su
  derecha, hambriento, recuperándose a lo largo de unos 100px.

Eso explica cada síntoma que había: **por qué seguía al viewport** (el lienzo es
`sticky`), **por qué era independiente del cursor**, **por qué estaba dentro del
lienzo y no encima**, **por qué desaparecía al encoger la ventana** (la rejilla
cambia con la proporción y la cancelación deja de cruzar el cero) y **por qué
cambiar el color de fondo la hacía desaparecer**: la tira ES el fondo.

## El arreglo

1. `difuminar()` recorta la salida a cero: `suma > 0 ? suma / n : 0`. Un
   promedio de números no negativos no puede ser negativo; ese signo era ruido
   de redondeo y el cero es la respuesta más próxima a la verdad.
2. El guardián de renacimiento pasa a positivo (`enJuego`), así un NaN cae del
   lado de «fuera de juego» y la partícula renace en el acto.

## Verificado

- `rapidez` NaN = **0** y `rampaAncha` negativos = **0** a 1200, 1280, 1440,
  1600 y 1920. Partículas NaN: **0,00%**.
- El filo, medido como salto de densidad entre bloques contiguos con su racha de
  filas coherentes:

  | ancho | antes | después |
  |---|---|---|
  | 1200 | −57,6% (38 filas) | −0,0% (4) |
  | 1280 | −45,2% (35) | −1,2% (5) |
  | 1366 | −38,2% (32) | +0,2% (5) |
  | 1440 | −28,4% (30) | −0,3% (6) |
  | 1600 | −93,4% (57) | +0,8% (6) |
  | 1920 | −31,8% (20) | +4,3% (6) |

  Rachas de 4-6 filas es el suelo de ruido del detector.
- Coste: sin diferencia medible. Con la CPU 4× más lenta, alternando las dos
  versiones en la misma sesión, las tres tomas del «antes» difieren entre sí
  (6,47 / 5,61 / 5,08 ms por fotograma) más de lo que difieren los dos grupos.
- `npm run auditar:movil` en cero.

## Lo que queda como aviso

El resto de este documento es el historial de la caza y se conserva a propósito:
ocho intentos de arreglo, todos sobre hipótesis de fluidos, todos medidos, y
ninguno tocó la causa. La lección está en su sección «Cómo medirlo»: el mapa de
densidad del lienzo en bloques con realce gamma enseñó la tira de un vistazo, y
leer el ESTADO del motor —contar NaN en el campo y en las partículas— la explicó
en un intento. Los perfiles por columna no la vieron nunca.

---

# Historial de la caza (se conserva)

Escrito cuando el fallo seguía abierto, tras una sesión larga de intentos
fallidos, para que quien lo retomara no repitiera el mismo camino.

---

## El síntoma

Una **barra o rectángulo vertical de borde duro** dentro del área del campo de
partículas del hero (`src/components/CampoDeFlujo.jsx`). Dentro de esa zona el
flujo se ve más apagado que a su alrededor. El filo es recto y limpio, no
orgánico: por eso se lee como una grieta en el lienzo y no como una estela.

Reportado por el cliente sobre capturas propias en varias posiciones de scroll.
Aparece tanto en la zona del hero (bajo la marca) como más abajo, en el remate.

### Lo que dijo el cliente, literal — es lo más valioso de este documento

> «es una barra que sigue mi pantalla, pero se queda solo en el area de
> particulas, si bajo me sigue hasta donde termine el efecto de particulas del
> hero, me persigue»

> «no era la repulsion del puntero, es algo que esta en la pantalla
> indipendiente, no al cursor»

> «comprobe que va de tamanos, cuando reduzco el tamano de la ventana deja de
> aparecer la linea, y si lo agrando en cierto punto aparece la linea»

Es decir: **es independiente del cursor**, **sigue al viewport al desplazarse**,
**vive solo dentro del área del canvas** y **depende del tamaño de la ventana**,
con un umbral por debajo del cual desaparece.

---

## Lo que está descartado, con la prueba

| Hipótesis | Cómo se descartó |
|---|---|
| Es del sistema operativo / la GPU | El cliente abrió una página negra a pantalla completa: **limpia**. Es de la web. |
| Un elemento del DOM encima | `elementsFromPoint` devuelve solo el canvas dentro y fuera de la zona. |
| El widget del chat | Ocultado y comparado píxel a píxel: solo cambia él y su sombra de 24 px. |
| El velo del CTA (`.cta-section::after`) | Desactivado: luminancia idéntica a ambos lados del filo (2,13 vs 2,13). |
| El desenfoque de la nav | Desactivado: sin cambio. |
| Una capa de composición | Volcadas las 72 capas con sus dimensiones: ninguna con esa geometría. |
| Algo compuesto encima del canvas | Lectura del canvas vs captura de pantalla en la misma zona: **coinciden con diferencias de 0,02**. Está dentro del canvas. |
| La repulsión del puntero | Cambiada a remolino (divergencia cero, sin hueco) — **el cliente confirma que la barra sigue**. |

---

## Intentos de arreglo, todos medidos, ninguno resuelve el síntoma reportado

Cada uno con su medición. Varios mejoraron métricas reales sin quitar la barra.

1. **Sembrar partículas «a sotavento» de la marca.** Sin efecto (escalón 23 → 21,8).
2. **Mezcla vertical en estado laminar** (`vy` no exactamente 0, para que el
   material cruce entre bandas). Mejoró de −77% a −49% el déficit medido bajo la
   K. No quitó la barra. *Revertido.*
3. **Censo de ocupación + siembra por torneo** en la zona más pobre. Bajó la
   sombra bajo la K del 76% al 97-99%. No quitó la barra. *Conservado en el código.*
4. **Bajar el factor de sobre-deflexión** de 1.35 a 1.00. Sin efecto. *Revertido.*
5. **Recirculación de estela** (rotacional de la sombra del obstáculo). Sin
   efecto. *Revertido.* Nota: la primera vez se colocó dentro de la rama
   `nm > 0.0006`, que solo se cumple a ~10 celdas de la letra; la bolsa estaba
   mucho más lejos. Corregido y aun así no movió la aguja.
6. **Franja de siembra en campana en vez de en caja.** Quitó un escalón de
   densidad real con bordes rectos (la franja iba del 9% al 79% de la altura con
   cortes duros, y lo de fuera recibía menos de la mitad de siembra). Medido:
   68% → 20%. *Conservado en el código.*
7. **Retirar la tobera de salida.** Con ella apagada, los laterales quedan al
   102% y 97% del centro — uniforme. **Pero el cliente confirmó que la barra
   seguía igualmente.** *Restaurada a petición suya.*
8. **Puntero: de empuje radial a remolino.** El empuje radial es una fuente y
   deja la zona del cursor al 67% de su entorno; el remolino la deja al 139%
   (sin hueco). No era la barra. *Revertido al original.*

### Sí resuelto por el camino (no era la barra, pero era real)

- **`.cursor-grid-reveal`** en `src/index.css` + `src/App.jsx`: una rejilla
  morada de 60×60 px revelada en un círculo de 180 px alrededor del cursor,
  fija a pantalla completa con `z-index: 9999`. Dibujaba líneas rectas moradas
  sobre el campo y repintaba una capa enmascarada del tamaño de la ventana en
  cada `mousemove`. **Retirada.** Si se quiere de vuelta está en el historial.

---

## Cómo medirlo (esto es lo que costó encontrar)

**No sirven los perfiles por columna.** Por construcción no pueden ver un
rectángulo, y fueron la causa de que se diera por bueno un arreglo parcial. Lo
que sí funciona:

1. **Mapa de densidad del canvas solo**, en bloques de 8 px, con realce gamma.
   Ahí el rectángulo salta a la vista de inmediato.
2. **Canvas vs captura de pantalla** en la misma región: distingue «está en el
   lienzo» de «hay algo compuesto encima». Ojo con incluir la burbuja del chat
   en la muestra: es morada y brillante y falsea la media (dio un +217% falso).
3. **Ablación con diff visual**: ocultar un elemento, capturar, y renderizar la
   diferencia como imagen. La caja delimitadora sola engaña — hay que ver el
   diff.

Todos estos arneses se escribieron ad hoc con Puppeteer contra
`http://127.0.0.1:4173` (`npm run build` y luego el servidor de vista previa).

---

## La sospecha estructural, para quien lo retome

El campo de velocidad **no tiene divergencia cero**. Cada celda se normaliza a
longitud unidad (`campoX[i] = fx / mag` en `construirCampo`), y esa
normalización destruye justamente la propiedad que garantiza que la densidad de
partículas se conserva.

Consecuencia: **cualquier** convergencia o deflexión del campo crea gradientes de
densidad, y esos gradientes heredan la forma de lo que los creó — incluidos
bordes rectos. Eso explica por qué cada parche arregla un estado y el siguiente
estado revela otro artefacto.

**El arreglo definitivo probablemente sea reescribir el campo como el rotacional
de una función de corriente ψ:**

```
v = ( ∂ψ/∂y , −∂ψ/∂x )
```

Un campo así tiene divergencia cero *por construcción*, así que la densidad se
conserva exactamente y no puede formarse ningún hueco, en ningún estado. Y trae
un extra: la variación de velocidad sale sola —rápido donde las líneas se
estrechan—, que es exactamente lo que hoy simula a mano el array `rapidez`.

No se llegó a intentar por falta de margen en la sesión.

---

## Pistas sin explorar

- El síntoma **depende del tamaño de ventana con un umbral** (~1300 px). Nada de
  lo investigado explica un umbral. La rejilla del campo (`CELDAS = 110000`) y el
  tope de partículas (`4200`) son los dos únicos parámetros con un salto; el tope
  se alcanza alrededor de 1,87 megapíxeles.
- Todas las pruebas se hicieron en **Chrome sin GPU** (renderizado por software).
  Un artefacto de composición de tarjeta gráfica no aparecería en ninguna de
  ellas. El cliente ve el fallo en Chrome con GPU real.
- El cliente dice que **le sigue al desplazarse**. El canvas es `position: sticky`,
  así que cualquier cosa fija en coordenadas del canvas parece seguir al viewport.
  No se comprobó si la barra está anclada a coordenadas del canvas o de la página.
