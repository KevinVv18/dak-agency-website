# Encargo para Codex — panel de ventas

Este archivo es el punto de entrada. Kevin te lo señala y tú empiezas por aquí.

> **Estado: Fases 1 y 2 hechas y verificadas.** Compila, `impeccable detect` devuelve cero
> hallazgos (comprobado contra un control que sí reporta 64), no desborda a 375 px y respeta el
> contrato. Lo que falta es la **Fase 3: la pasada de diseño**.
>
> **Fase 3 — de documento a consola.** Abre primero
> **[`maquetas/panorama.html`](maquetas/panorama.html)** en el navegador; es la referencia, y
> explica más en diez segundos que cualquier párrafo. Luego lee [`DISENO.md`](DISENO.md).
>
> El problema de las fases 1 y 2 no es el movimiento: es que están construidas como **documento**
> —titular de display, párrafos, scroll— cuando esto tiene que ser un **panel**. Los cuatro
> cambios: consola de `100dvh` sin scroll de página; cifras y etiquetas de una o dos palabras en
> vez de prosa; la explicación en el **hover**; raíl de iconos en vez de nav con texto.
>
> Y una vista nueva, **«Panorama»**, que pasa a ser la entrada tras el login: un poco de todo de
> un vistazo. La maqueta es exactamente esa vista.
>
> El listón: **cero hallazgos de `impeccable`**. La maqueta los tiene, y por el camino enseñó dos
> cosas que van al listón — nada de texto funcional por debajo de **11 px**, y la escala
> tipográfica se queda en **11 px (micro en mayúsculas) / 14 px (cuerpo)** más las cifras grandes
> por `clamp()`. Cuatro tamaños pegados entre sí no son jerarquía.

## Lee, en este orden

1. **`_sales-center/data/CONTRATO.md`** — lo más importante. Qué es el sistema realmente (un
   embudo de cuatro etapas, no una tabla), dónde está el cuello de botella medido, y el contrato
   de datos exacto. Si solo puedes leer uno, es este.
2. **`_sales-center/BRIEF.md`** — producto, dónde vive, por qué no es una ruta de la SPA.
3. **`AGENTS.md`** (raíz) — reglas del repo. En especial **«Reglas de datos»** y **«Reparto de
   trabajo»**.
4. `_sales-center/data/INVENTARIO-INBOUND.md` — solo si vas a tocar la mitad inbound.

No hace falta que leas el resto del repo. La SPA principal no se toca.

## Los datos ya están

`_sales-center/data/mock.json`. Generado de la hoja real, con los teléfonos redactados. Estructura:

```js
{
  meta: { esMock: true, embudo: {...}, totales: {...} },
  prospectos: [...],   // 15 — 12 outbound, 3 inbound
  mensajes:   [...],   // 8 — el opener, objeciones y 2 follow-ups de cada uno
  fuentes:    [...]    // salud por fuente (la Camara rindio 2 de 109)
}
```

Los tipos están en `CONTRATO.md` §3. **No inventes campos ni los renombres**: si necesitas un dato
que no está, dilo en vez de derivarlo.

Si Kevin re-exporta la hoja, se regenera con `node _sales-center/data/normalizar.mjs`. Ese script
es de Claude — si el mapeo necesita cambiar, pídelo.

## Lo que hay que construir

App **Vite + React** en `_sales-center/`, con su **propio `package.json`**, aislada de la SPA de la
raíz. Cuatro vistas: **Hoy · Prospectos · Base · Cómo funciona**.

### Hoy — la vista principal. Empieza por aquí y que se vea bien antes de tocar las otras.

Hoy tiene 8 filas reales y son la razón de existir del panel.

**Por aprobar (5).** Alguien tiene que leer un mensaje y decir sí o no. Enseña: la empresa, la
señal de compra que justifica el mensaje, **el texto completo tal como se enviaría** (no un
resumen, no truncado), el canal y el horario recomendado, las dos objeciones con su respuesta, y
los dos follow-ups ya redactados. Ordenadas por `readiness` descendente.

**Por enviar (3).** Ya están aprobadas. Enseña el mensaje para releerlo y el `enlaceWhatsApp` como
**botón grande**: un toque abre WhatsApp con el texto puesto. Más el horario y el `responsable`.

**Esperando respuesta.** Hoy sale vacía. Diséñala igual —con su estado vacío bien resuelto— porque
se llena en cuanto algo se marque enviado.

### Prospectos
Tabla y detalle. El `score` se enseña **descompuesto en sus cinco componentes** (`scoreDetalle`):
suman exacto, así que se puede mostrar *por qué* puntúa lo que puntúa. El detalle es un resumen
humano —qué sabemos, por qué importa, qué ofrecer, cómo contactarlo—, no un volcado de campos.

### Base
Rendimiento por fuente, del array `fuentes`. Hoy: la Cámara procesó 109, aceptó 2, validó 0
teléfonos. La vista responde *«¿vale la pena seguir minando esto?»*. No es una lista de 109.

### Cómo funciona
El diagrama de las cuatro etapas y qué pasa en cada una. En español, sin nombres internos en
inglés salvo aquí.

## Reglas que no se negocian

- **En español.** Herramienta interna, no landing.
- **El panel nunca inventa un número.** Si un campo es `null`, se muestra «sin dato». Nunca un
  cero, nunca un guion ambiguo, nunca un valor derivado sin etiquetar. (`AGENTS.md`, Reglas de datos.)
- **Se ve en pantalla que son datos de ejemplo.** `meta.esMock` es `true`.
- **Diseñado contra los huecos.** Casi todo el contrato es nullable porque casi todo llega nulo:
  hay prospectos sin ciudad, sin teléfono, sin score, y tres inbound que no tienen empresa sino
  persona. Si la UI solo se ve bien con la fila completa, está mal.
- **Tres filas tienen que verse bien.** La mitad inbound son tres y no van a ser más pronto. Un
  Inicio diseñado para volumen se ve roto con datos reales.
- **Nada de escritura.** Aprobar y marcar-enviado se hacen abriendo la hoja; enviar se hace con el
  enlace `wa.me`. El panel no escribe en la Fase 1.
- **Identidad DAK**: fondo `#030106`, superficie `#0A0612`, morado `#B024FF` (`#B93EFF` para texto
  pequeño), teal `#00C8C8`, Poppins, contraste AA, `prefers-reduced-motion`.

## Lo que NO tocas

`.github/workflows/**`, `deploy-protect.txt`, `.htaccess`, `_sales-center/data/**`, y la SPA de la
raíz (`src/`, `index.html`, `package.json` de la raíz). Todo eso es de Claude. Si necesitas un
cambio ahí, pídelo — no es desconfianza, es que esas reglas son cicatrices y el porqué no cabe en
un diff.

## Cuándo has terminado la Fase 1

- `npm run dev` dentro de `_sales-center/` levanta las cuatro vistas con los datos del mock.
- Un mensaje pendiente se puede leer entero sin salir de «Hoy».
- El botón de WhatsApp abre el chat con el texto puesto.
- Se ve bien a 375 px.
- El `npm run build` de la **raíz** sigue funcionando y `dist/` no incorpora nada de aquí.
