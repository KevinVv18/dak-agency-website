# Design — Manual

<!-- impeccable:design 1 -->

> **Alcance:** mundo visual del blog de DAK (tema `dak-informando`).
> Verdad de producto en [PRODUCT.md](PRODUCT.md).

## Tesis

El blog no es un periódico: es el **manual** que acompaña al negocio del lector. Cada artículo es un procedimiento —pasos numerados, advertencias, piezas que encajan— y el sitio adopta esa gramática en lugar de la maqueta de diario con serif de display que publica toda agencia.

Un manual es el documento más serio que existe: nadie adorna las instrucciones de una máquina. Esa seriedad es exactamente lo que el lector necesita ver mientras decide si contratarnos.

## Lo que este mundo NO es

- **No es el periódico anterior**: fuera la crema, la Playfair de display y la portada a cinco columnas con hero central.
- **No es el blog minimalista** de tipografía gigante y aire infinito (el opuesto predecible del periódico).
- **No es un manual de juguete**: nada de páginas celestes ni ilustración amable. El registro es instructivo profesional, no lúdico.
- **No repite el mundo topográfico** del demo inmobiliario (grafito + naranja de señalización + rotulación condensada). Comparten la familia «documento técnico», pero sus recursos nativos son distintos: allá se ocupa una estación y se visa; aquí se ejecuta un procedimiento paso a paso.

## Color — spot único sobre papel

Un manual se imprime a una tinta más el negro. Esa es la regla.

| Rol | Token | Valor | Trabajo |
|---|---|---|---|
| Papel | `--papel` | `#FFFFFF` | Fondo de página. Blanco de manual, no crema nostálgica. |
| Papel 2 | `--papel-2` | `#F4F4F5` | Bandas y cajas de sección. |
| Tinta | `--tinta` | `#141416` | Texto. Negro de impresión, no gris. |
| Tinta 2 | `--tinta-2` | `#42424A` | Prosa larga y secundarios. |
| Tinta 3 | `--tinta-3` | `#63636C` | Metadatos. Mínimo AA sobre papel. |
| **Spot** | `--spot` | `#B024FF` | **La única tinta de color.** Números de paso, llamadas, flechas, reglas de sección, enlaces. Es el púrpura de DAK haciendo un trabajo, no decorando. |
| Aviso | `--aviso` | `#B45309` | Ámbar de advertencia, solo en cajas de precaución. |
| Línea | `--linea` | `#DEDEE3` | Filetes de retícula. |

Regla de contención: el spot nunca es fondo de grandes superficies. Vive en filetes de 2–3px, números y llamadas. En un manual la tinta de color es cara: se usa donde dirige la atención.

## Tipografía

- **Estructura** — `Public Sans`. Cara de documentación (linaje del sistema de diseño del gobierno de EE. UU.): institucional, sin personalidad decorativa. Titulares en peso 800 con tracking cerrado; rótulos en versales con tracking abierto.
- **Prosa** — `Source Serif 4`. Cara de lectura sostenida, hecha para documentación larga. Baja modulación, resistente a pantalla. Es lo contrario de Playfair: no está para lucirse en un título, está para aguantar 2.000 palabras.
- **Cifras** — numeración tabular de Public Sans para pasos, fechas y datos.

Prohibidas por delatar defaults de entrenamiento: Inter, Playfair, Fraunces, Newsreader, Lora, Crimson, Cormorant, Syne, Space Grotesk/Mono, IBM Plex, DM Sans/Serif, Outfit, Plus Jakarta, Instrument Sans, Roboto.

## Composición

- **Retícula visible en los bordes**, no de fondo: filetes que separan secciones y encabezan bloques, como los cuadros de un manual.
- **Numeración estructural**: las secciones de la portada y los pasos de un artículo llevan número. Es el orden del procedimiento, no un adorno de eyebrow.
- **Cajas de aviso** enmarcadas con filete y rótulo (`AVISO`, `OJO`), para los avisos que ya viven en el contenido.
- **Medida de lectura ~75 caracteres** en prosa (heredado del refinamiento, no se revierte).
- **Fichas de artículo como entradas de índice**: número, categoría, título, y una línea de datos tabulados. Sin sombras ni tarjetas flotantes.

## Motivo

La **llamada numerada**: un número dentro de un cuadrado de tinta spot, del que sale un filete hacia el elemento que nombra. Aparece en los pasos del artículo, en la numeración de secciones y en el índice lateral.

## Motion

Uno solo: el **avance**. La barra de progreso de lectura y el subrayado del nav crecen por `transform: scaleX` desde el origen, como una regla que avanza. Sin efectos de hover dispersos, sin apariciones escalonadas.

Respeta `prefers-reduced-motion`.

## Reglas heredadas que no se rompen

- Contraste AA en cuerpo y metadatos; texto funcional ≥11px; interlineado ≥1.3 en titulares multilínea.
- **La arquitectura SEO es intocable**: URLs, jerarquía h1→h2→h3, breadcrumbs, TOC generado por `single.php`, bloque «Servicio relacionado» y enlazado pilar↔cluster.
- Las clases que consulta el JS del tema (`.toc-list`, `.reading-progress span`, `.nav-link`, `.mini-nav-link`) conservan su nombre.
- El contenido llega como HTML de WordPress sin control del tema: `h2`, `h3`, `p`, `ul`, `blockquote`, `img` y tablas deben verse bien sin clases propias.
