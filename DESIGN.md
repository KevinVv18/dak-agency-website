# Design — Levantamiento

<!-- impeccable:design 1 -->

> **Alcance:** mundo visual del demo inmobiliario (`_inmobiliaria-demo/index.html`).
> En la raíz a propósito: esa carpeta se publica con `rsync --delete`.
> Verdad de producto en [PRODUCT.md](PRODUCT.md).

## Tesis

Una ficha de propiedad es la última página de un expediente que empieza en una libreta de campo. El sitio adopta el lenguaje del oficio del prospecto —estaciones, cotas, cuadros de áreas, bitácora fechada— en lugar del hero fotográfico a sangre con buscador superpuesto y grilla de fichas que publica todo el rubro.

El puente que sostiene todo: **una panorámica 360° es una ocupación de estación.** El topógrafo planta el instrumento en un punto y visa en todas direcciones; el visor hace literalmente eso.

## Lo que este mundo NO es

No es papelería ni cuaderno artesanal. Nada de crema, papel cuadriculado nostálgico ni caligrafía. El referente es el **instrumento y la señalización de campo**: alta visibilidad, escala de señalética, medición tabular. La fotografía se conserva grande porque es la evidencia del producto y el brillo aspiracional que el pitch necesita.

Prohibido reintroducir: negro con un acento neón y bordes brillantes; filetes editoriales con serif itálica de display; crema con serif de alto contraste. Son los tres clusters en los que converge el diseño generado por AI, y el fracaso declarado del proyecto es parecer genérico.

## Color — paleta completa, cuatro roles

El color ocupa regiones, no adorna. Cada rol tiene un trabajo y no se usa fuera de él.

| Rol | Token | Valor | Trabajo |
|---|---|---|---|
| Suelo | `--suelo` | `#15181C` | Fondo de plano. Grafito, nunca negro puro. |
| Suelo elevado | `--suelo-2` | `#1D2126` | Paneles, fichas, superficies que se levantan. |
| Acción / límite | `--cinta` | `#FF5A1F` | Naranja de cinta de señalización. CTAs, filetes de sección, el borde de lo que importa. Es el único color que invita a tocar. |
| Medición | `--prisma` | `#FFC300` | Amarillo de prisma y trípode. Cifras: precios, áreas, cuotas, coordenadas. Nunca en texto corrido. |
| Punto marcado | `--marca` | `#FF2D78` | Rosa fluorescente de marca de pintura. Puntos hallados: favoritos, disponibilidad de 360°, estación activa. |
| Texto | `--texto` / `--texto-2` | `#EEF1F3` / `#A7B0B8` | Blanco de mira y su secundario. |

Regla de contención: en una misma vista, `--cinta` y `--marca` no compiten. La cinta manda en acción; la marca solo señala hallazgos discretos.

## Tipografía

Sin serif. Las libretas de campo se rotulan en versales de ingeniería.

- **Rotulación** — `Archivo` con eje de ancho, expandida y pesada, en versales con tracking abierto. Títulos de sección, nombres de estación, el display del hero. Es señalética, no editorial.
- **Interfaz y texto** — `Archivo` en ancho normal.
- **Medida** — `Spline Sans Mono`, con numeración tabular. Coordenadas, áreas, precios, cuotas, fechas de bitácora. El monoespaciado está ganado: son mediciones reales, no disfraz técnico.

Prohibidas por ser defaults de entrenamiento: Newsreader, Fraunces, Playfair, Cormorant, Lora, Crimson, Syne, Space Grotesk, Space Mono, IBM Plex, Inter como display, DM Sans/Serif, Outfit, Plus Jakarta, Instrument Sans.

## Composición

- **Retícula de coordenadas** en filete finísimo sobre el suelo, presente pero nunca protagonista. Es la hoja de plano.
- **Estaciones**: cada sección se numera `E-01`…`E-08` y abre con el símbolo de punto de control (triángulo sobre punto), rotulación en versales y un filete de cinta naranja a todo el ancho.
- **Cuadros**: los datos van en tabla alineada a la derecha con mono tabular, como un cuadro de áreas. Nunca en prosa.
- **Fotografía a escala grande**, encuadrada por filete, con su rótulo de estación encima. La foto manda; el aparato la enmarca.
- Ritmo: un pasaje denso de datos se gana un pasaje amplio de foto.

## Motivo

El símbolo de punto de control —triángulo sobre punto— es la firma. Aparece como marcador de estación, viñeta y ancla del logotipo. La cinta de señalización es el segundo motivo: filetes naranjas que delimitan.

## Motion

Un solo momento orquestado: la **visada**. Una línea de barrido recorre el elemento al entrar, como el instrumento girando hacia un punto. No hay efectos de hover dispersos.

Respeta `prefers-reduced-motion`: sin barrido, contenido visible por defecto.

## Reglas heredadas que no se rompen

- Texto funcional nunca bajo 11px.
- Sin sombras de color: elevación neutra con desplazamiento y desenfoque.
- Jerarquía de encabezados sin saltos de nivel.
- El JS existente (filtros, modal, 360, simulador, chat, carrusel) y sus ids/clases son intocables; el rediseño es visual.
- Lo ficticio se ve ficticio: la señal de DEMO y el crédito a DAK Agency sobreviven.
