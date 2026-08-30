---
name: DAK Blog — El Catálogo
description: El blog de DAK como catálogo comercial impreso: papel bond gris, filas blancas y ocho vidriados de sección a sangre.
colors:
  papel: "#F2F2F0"
  papel-fila: "#FFFFFF"
  papel-tinte: "#E9E9E5"
  tinta: "#141416"
  tinta-2: "#3F3F47"
  tinta-3: "#5E5E68"
  casa: "#B024FF"
  casa-texto: "#8B1CC7"
  casa-clara: "#D89BFF"
  filete: "#D4D4CE"
  filete-fuerte: "#9A9A93"
  sec-seo-buscadores: "#7B1FA2"
  sec-diseno-web: "#0F4C9C"
  sec-redes-sociales: "#B3123F"
  sec-publicidad: "#AA4400"
  sec-automatizacion: "#00695C"
  sec-branding: "#1F1F26"
  sec-por-rubro: "#4A5D23"
  sec-guias-precios: "#1B5E20"
  sec-defecto: "#3F3F47"
typography:
  display:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  display-entrada:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4.8vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.4rem, 2.4vw, 1.95rem)"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.02em"
  subtitulo:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  banda:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.22
    letterSpacing: "0.01em"
  body:
    fontFamily: "Faustina, Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "normal"
  title:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.32
    letterSpacing: "-0.01em"
  body-corto:
    fontFamily: "Faustina, Georgia, Times New Roman, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  base:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  secundario:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  control:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  fino:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  dato:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.06em"
    fontFeature: "tabular-nums"
  rotulo:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.13em"
    fontFeature: "tabular-nums"
rounded:
  none: "0"
spacing:
  margen: "2rem"
  margen-movil: "1.25rem"
  ancho: "78rem"
  medida: "40rem"
  registro: "3.5rem"
  canto: "18rem"
  lamina-tope: "37.5rem"
  calle: "2.5rem"
components:
  boton-casa:
    backgroundColor: "{colors.casa}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.15rem"
  boton-casa-hover:
    backgroundColor: "{colors.casa-texto}"
    textColor: "#FFFFFF"
  boton-fantasma:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.15rem"
  boton-buscar:
    backgroundColor: "{colors.tinta}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.15rem"
    typography: "{typography.rotulo}"
  campo-busqueda:
    backgroundColor: "{colors.papel-fila}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "0.7rem 0.9rem"
    typography: "{typography.secundario}"
  compartir-boton:
    backgroundColor: "{colors.papel-fila}"
    textColor: "{colors.tinta-2}"
    rounded: "{rounded.none}"
    size: "2.25rem"
  compartir-boton-hover:
    backgroundColor: "{colors.casa-texto}"
    textColor: "#FFFFFF"
  compartir-boton-copiado:
    backgroundColor: "var(--sec)"
    textColor: "#FFFFFF"
  etiqueta-seccion:
    backgroundColor: "var(--sec)"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.22rem 0.55rem"
    typography: "{typography.rotulo}"
  seccion-banda:
    backgroundColor: "var(--sec)"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.8rem 2rem"
  ficha-tira:
    backgroundColor: "{colors.tinta}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.85rem 2rem"
    typography: "{typography.secundario}"
  fila:
    backgroundColor: "{colors.papel-fila}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "1rem 2rem"
  fila-hover:
    backgroundColor: "{colors.papel-tinte}"
  canto-pestana:
    backgroundColor: "var(--sec)"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.7rem 0.5rem 0.6rem"
  canto-pestana-apartado:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-2}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem 0.5rem 0"
    typography: "{typography.fino}"
  canto-pestana-apartado-hover:
    backgroundColor: "{colors.papel-tinte}"
    textColor: "{colors.tinta}"
  apartado-numero:
    backgroundColor: "var(--sec)"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    height: "1.75rem"
    width: "2.5rem"
    typography: "{typography.control}"
  pagina-numero:
    backgroundColor: "{colors.papel-fila}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    height: "2.5rem"
    typography: "{typography.control}"
  pagina-numero-actual:
    backgroundColor: "{colors.casa}"
    textColor: "#FFFFFF"
---

# Design System: DAK Blog — El Catálogo

> Recorded from the shipped theme at `wordpress-theme/dak-blog/`, after the build. Every token
> here was read out of `style.css`, `assets/css/*.css`, `assets/js/blog.js` and `inc/helpers.php`,
> not out of a plan. The type ramp below was reconciled against a full literal inventory of the
> stylesheets, so it describes every size that ships rather than the subset that was noticed first.
> Product truth for this blog still lives at `wordpress-theme/dak-informando/PRODUCT.md` — the
> outgoing theme's folder. It was not moved or rewritten as part of this record; treat the path
> as a known misplacement, not as evidence that the outgoing theme is current.

## Overview

**Creative North Star: "El Catálogo del Distribuidor"**

This is a printed trade catalogue rendered in HTML. Not a magazine, not a documentation site, not
the card grid with a photo on top and a category pill that every agency blog ships. The reader is
on a phone, arrived from Google, and is deciding whether to hire DAK; the catalogue answers that by
behaving like an index — sections numbered 01 through 08, each opening with a full-bleed colour
band, each listing entries as rows of a table: reference, description, price. The price is minutes
of reading. That single conceit governs everything below.

The material is paper and ink. Grey bond paper (`#F2F2F0`) carries white rows (`#FFFFFF`); rules
are hairlines (`#D4D4CE`), never gaps. There are no shadows, no radii, no gradients anywhere in the
shipped CSS — one `box-shadow` exists in the whole theme and it is the outer halo of the focus
ring. Depth is entirely tonal and structural: paper behind, white row in front, black or glazed
band as a hard edge. Colour is flat fill and never a tint of a tint.

The eight section glazes are the world's saturation budget, and they are spent in one place at a
time: a band, a numbered chip, an edge tab. The house purple `#B024FF` is a separate voice from
those glazes — it marks DAK itself (the edition seal, the "next step" caption, the article's
section rules, the current page number) and it is a fill, never a letter.

**Key Characteristics:**
- Grey paper with white rows; hairline rules instead of whitespace gaps.
- Eight section glazes propagated through a single inherited `--sec` custom property.
- Zero radius, zero shadow, zero gradient — the flatness is the identity, not a shortcut.
- Archivo with tabular figures for all structure; Faustina for all prose.
- One authored motion gesture, re-pointed rather than duplicated across surfaces.
- Self-hosted variable fonts, latin subset, zero third-party origins.

## Colors

Two inks on one paper, plus a set of eight section glazes that are deep enough to carry white text
and are never mixed with each other.

### Primary
- **Tinta de la Casa** (`--casa`): DAK's purple, used only as a filled surface — the edition seal
  over the fold, the "Siguiente paso" caption tab, the 2px rule that opens every article section,
  list bullets, the current pagination stamp, the rule that grows under a hovered row, the text
  selection, and the caret. It measures 4.12:1 as text on paper, which is why it is structurally
  barred from being a letter.
- **Tinta de la Casa, escrita** (`--casa-texto`): the same purple darkened until it is legible as
  text on paper (6.1:1). This is the link colour inside article prose, the disclosure marker of the
  folded index, the hover of the share control and breadcrumbs, and the pressed state of the purple
  button — pressing *darkens*, because lightening dropped white-on-purple to 3.62:1.
- **Tinta de la Casa, clara** (`--casa-clara`): the same purple opened up until it is legible on
  the dark ink of the footer, the top strip and the entry's data strip. It is the only purple
  allowed on `--tinta`.

### Secondary — the eight section glazes
One per section, in publication order, each set once per block by `dak_var_seccion()` and inherited
by everything inside it: `--sec-seo-buscadores` (01), `--sec-diseno-web` (02),
`--sec-redes-sociales` (03), `--sec-publicidad` (04), `--sec-automatizacion` (05),
`--sec-branding` (06), `--sec-por-rubro` (07), `--sec-guias-precios` (08). All eight carry white
text at 5.94:1 or better. A category outside the map falls to `--sec-defecto` and orders last; it
never breaks the layout. Inside a single entry the glaze narrows to one colour — the entry's own
section — and marks its numbered sections, its active canto tab and its copied-link confirmation.

### Neutral
- **Papel bond gris** (`--papel`): the page. Also the fill of blockquotes and table headers, so a
  boxed note reads as paper set into the white sheet.
- **Papel de fila** (`--papel-fila`): the white of every row band, the header, the cover, the
  archive masthead and the article body. Content sits on white; the page around it is grey.
- **Papel entintado** (`--papel-tinte`): hover fill for rows, index cells and canto tabs, and the
  placeholder behind an image that has not loaded.
- **Tinta** (`--tinta`): body text, the footer's whole ground, the entry's data strip, the cover
  rules, and the outer ring of the focus halo.
- **Tinta 2 / Tinta 3** (`--tinta-2` / `--tinta-3`): long-form prose and secondary metadata
  respectively. Nothing quieter than `--tinta-3` exists as text.
- **Filete / Filete fuerte** (`--filete` / `--filete-fuerte`): the hairline grid and the stronger
  hairline (input borders, scrollbar thumb, breadcrumb separators, the resting canto number).

### Named Rules
**The Fill-Only Rule.** `--casa` is a surface, never a letter. Any purple that has to be read as
text is `--casa-texto` on paper or `--casa-clara` on ink. There is no third option.

**The One Glaze Per Block Rule.** A section colour is declared exactly once, on the outermost
element of its block, as `--sec`. Bands, chips, edge tabs, row labels, index numbers and numbered
article sections all read that same variable. Never hard-code a section hex into a component.

**The Darkening Press Rule.** Interactive purple gets *darker* on hover, never lighter. Lightening
`#B024FF` puts white text below 4.5:1; `--casa-texto` holds 6.80:1.

## Typography

**Display / structure font:** Archivo (variable, 400–700, self-hosted, latin subset)
**Body font:** Faustina (variable, 400–600, roman and italic, self-hosted, latin subset)

**Character:** Archivo is the catalogue's printing: tight, tabular, uppercase where it counts, and
it does every number in the system. Faustina is the salesman's paragraph — warm, high x-height
serif, used only where someone is actually reading sentences. The split is functional, not
decorative: if it is a label, a figure, a heading or a column, it is Archivo; if it is prose, it is
Faustina. A step in the ramp is a *size*, not a face — `secundario` and `body-corto` share
1.0625rem-and-under territory in both faces, and the Two-Job Rule decides which one is set.

Both faces are self-hosted with a latin `unicode-range` and `font-display: swap`. Only Archivo is
preloaded — it composes the entire first viewport and the LCP is the `h1` text, so Faustina, which
first appears in excerpts further down, needs no priority.

### Hierarchy

Large type is fluid and set with `clamp()`; everything from the base down is a fixed step, because
labels, figures and controls have to align across columns rather than scale independently.

- **Display** (700, `clamp(2rem, 4.6vw, 3.4rem)`, 1.06, `-0.03em`): the front-page cover `h1` and,
  in near-identical variants, the archive masthead (`clamp(1.9rem, 4.4vw, 3rem)`) and the 404
  (`clamp(1.8rem, 4vw, 2.6rem)`). Capped at 20–21ch with `text-wrap: balance`.
- **Display · entrada** (700, `clamp(2rem, 4.8vw, 3.4rem)`, 1.05, `-0.035em`): the article `h1`.
  Tracked marginally tighter and steeper than the cover because it sits in the 40rem reading
  column rather than across the container; the 3.4rem-against-1.125rem step is deliberate and must
  read at a glance.
- **Headline** (700, `clamp(1.4rem, 2.4vw, 1.95rem)`, 1.16–1.22, `-0.02em`): the featured entry's
  title on the cover **and** the numbered `h2` section heading inside an article. One clamp serves
  both, and it covers mobile on its own — an article heading needs no size override at any
  breakpoint.
- **Subtítulo** (700, 1.2rem, 1.22, `-0.02em`): the prose `h3`, the rung between a numbered
  section and a labelled paragraph group. `h4` drops to the Banda step (1.05rem).
- **Banda** (700, 1.05rem, `0.01em`): the section code and name inside a glazed band, and the prose
  `h4`. The section-code step: any figure printed at the scale of a band code uses it.
- **Standfirst** (400, 1.2rem, 1.55, Faustina, `--tinta-2`): the entry's excerpt under the `h1`,
  capped at 34rem so it never rivals the title's measure. Shares the Subtítulo size step at a
  different weight and family — same rung, different job. Steps down to Body size below 900px.
- **Body** (400, 1.125rem, 1.72, Faustina): article prose, in a 40rem column (~70 characters).
  Drops to 1.0625rem under 900px.
- **Title** (600, 1.0625rem, 1.32, `-0.01em`): the row title — the reader's own question, written
  out. The single most repeated piece of type in the system. At the same size, **Body corto**
  (Faustina, 1.62) sets excerpts, the cover subhead, archive intros and 404 copy.
- **Base** (400, 1rem, 1.5–1.6): the document's own `font-size`, inherited by anything that does
  not opt out, and the Faustina step text of the footer's ordering procedure.
- **Secundario** (600, 0.9375rem): the secondary reading register — row excerpts, index entry
  names, the values in every data record (`.edicion`, `.ficha-tira`), the folded index, the search
  field and prose tables. Whatever is read after the heading but before the fine print.
- **Control** (600–700, 0.875rem, tabular): compact controls and stamps — footer buttons and
  record values, pagination numbers, the index code chip, the numbered-section counter.
- **Fino** (400–600, 0.8125rem): fine print — footer conditions and imprint, figure captions, the
  empty-archive notice, the canto tab's section name, and the "read entry" affordance.
- **Dato** (700, 0.75rem, `0.06em`, uppercase, tabular): the price column — minutes — plus dates,
  counts and the back link.
- **Rótulo** (700, 0.6875rem = 11px, `0.13em`, uppercase): the catalogue small-cap. Column headers,
  box captions, the identification strip, the data strip's field names, the image stamp, the
  footer's band titles. 11px is the floor for functional text and nothing goes below it.

### Named Rules
**The Two-Job Rule.** Archivo for structure, Faustina for prose. A heading inside article prose
switches back to Archivo; an excerpt inside a structural row switches to Faustina. The face
announces which job the text is doing.

**The Tabular Figures Rule.** Every number in the catalogue — codes, counts, dates, minutes, page
numbers, table cells, the numbered-section counter — runs `font-variant-numeric: tabular-nums`.
Columns of figures that do not align are not a catalogue.

**The Air-Above Rule.** In article prose, headings take more space above than below (`h2` 2.5em
top, 0.7em to the next element). One rhythm, whole page.

**The Twelve-Step Rule.** The ramp above is closed. A new surface picks the nearest existing step;
it does not introduce a thirteenth literal. Two rungs carry two roles each on purpose (Headline
serves the cover's featured title and the article's numbered section; Title and Body corto share
1.0625rem across the two faces) — that reuse is what keeps the ramp short.

## Layout

The container is a single centred column, `78rem` maximum, with a `2rem` gutter that collapses to
`1.25rem` below 900px by redefining `--margen` at `:root`. Colour bands and row bands run
full-bleed; only their inner container is constrained, so a section band touches both edges of the
viewport while its type stays on the grid.

**The catalogue row** is the index grid unit: `4.5rem | minmax(0, 1fr) | 4.25rem` — thumbnail,
description, minutes — with a `1.35rem` column gap. A `.seccion-columnas` header sits once per
section on the same track definition, which is what makes a list of links read as a table. Below
620px the header is removed and the row reflows to two columns (`3.5rem | 1fr`), with the minutes
figure moving up onto the metadata line rather than being squeezed against the title.

**The entry grid** is the reading unit: `3.5rem | minmax(0, 40rem) | 18rem` with `2.5rem` gutters,
centred by `justify-content` — the register strip, the reading column, the right rail. It totals
66.5rem inside a 78rem container, so the block occupies real width instead of leaving two dead
margins. The title header uses the same grid and sits in column 2, so the `h1` starts exactly where
the body starts rather than being thrown against the container edge. Both side columns are
`position: sticky` at `top: 1.5rem`; the register carries a vertical hairline on its right.

The third column is 18rem rather than 15 because it holds **two** pieces stacked, not one: the
plate at the top of the entry and the canto of sections below it, sharing a left edge so the rail
reads as a single column — LÁMINA, the image, APARTADOS, the index. The reading column gives up
2rem for it and settles at 640px, about 70 characters, which is still good measure.

The title column carries three things, not two — section chip, `h1`, **standfirst** — because two
were not enough to stand beside a plate. With only the chip and the title the header left a void
in its top-left quadrant, which is where the eye enters. The standfirst is the excerpt the circuit
already writes for every entry: 187 characters of editorial prose on average, and only 4 of 59 end
in a call to action. Below 1180px the plate loses the rail and stacks under the standfirst, where
its frame spans the full column and the plate is **centred on the mount** — otherwise the leftover
paper piles up on one side and the header reads crooked.

The front page's index of sections is a four-column grid separated by 1px hairline gutters
(`gap: 1px` over a `--filete` background, so the gaps *are* the rules). It steps to two columns at
1000px and one at 420px. The footer index behaves the same way, stepping at 1000px and 520px.

Prose flows on an em-relative rhythm (`> * + * { margin-top: 1.15em }`) so spacing scales with the
type size rather than with a pixel scale.

Breakpoints, as actually declared: 1240px (front-page edge tabs give way to a sticky band), 1180px
(the entry's canto gives way to a folded index above the body), 1000px (cover index and featured
box collapse), 900px (gutter shrinks, header nav becomes a link, the entry's register drops and its
share controls move to the close, the data strip becomes two columns, article type steps down),
620px (row reflows, column header removed, wide tables scroll), 560px / 520px / 480px / 420px for
the strip, the footer index, the data strip and the section index.

### Named Rules
**The Full-Bleed Band Rule.** Section colour reaches the edges of the viewport; the type inside it
does not. Never box a section colour inside the container.

**The Hairline Gutter Rule.** Grid gaps in index surfaces are 1px of `--filete` showing through,
not empty space. The catalogue is ruled, not spaced.

**The No-Empty-Margin Rule.** A reading column is centred by giving both margins work, not by
letting them go blank. On the entry that is the register on the left and the canto on the right;
when a breakpoint takes one away, its content relocates into the flow (the canto becomes a folded
index above the body, the register becomes a share row at the close) rather than evaporating.

## Elevation & Depth

There are no shadows in this system. `border-radius`, `box-shadow` on any surface, and
`linear-gradient` do not appear anywhere in the shipped stylesheets. The single `box-shadow`
declaration in the theme is the outer halo of the focus ring, and it is a solid ring, not a
shadow.

Depth is done three ways, all of them flat: tonal layering (grey paper behind, white row in front,
darker ink tint on hover), hairline rules (`--filete` between rows and canto tabs,
`--filete-fuerte` on inputs), and weight rules (a 3px `--tinta` rule closes the cover and the
archive masthead; a 2px `--casa` rule opens each numbered article section). Emphasis escalates by
making a rule heavier or a surface darker — never by lifting something off the page. Stickiness is
used the same way: a sticky column or band stays flush and flat, and never grows a shadow to prove
it is fixed.

### Named Rules
**The Flat-Ink Rule.** No shadow, no radius, no gradient, no blur. If something needs to separate
from what is behind it, it gets a rule or a change of paper tone. A sticky element is not an
exception.

**The Two-Tone Focus Rule.** Focus is a white 2px outline with a `--tinta` 5px halo outside it. A
single-tone ring in the house purple measured 1.70:1 against the green section band — below the
3:1 that WCAG 1.4.11 requires for non-text — so the ring carries both a light and a dark tone and
survives all thirteen real backgrounds in the build: paper, white row, eight glazes, dark footer
and dark strip.

## Shapes

Every corner is square. Radius is not a scale in this system; it is zero, everywhere, including
buttons, inputs, chips, thumbnails, pagination stamps, share controls and both kinds of canto tab.

The recurring silhouettes are four: the **band** (full-bleed rectangle of section glaze or ink),
the **boxed record** (an outlined two-column definition list), the **row** (a hairline-separated
horizontal band on a 1fr-dominant grid), and the **numbered stamp** (a filled rectangle carrying a
figure in tabular numerals — section codes, procedure steps, pagination, article sections).

Thumbnails are square (`aspect-ratio: 1`) and small on purpose: 72px painted from WordPress's
`thumbnail` crop, lazily loaded, desaturated to 0.92 and returning to full saturation on row
hover. They illustrate the reference; they do not compete with the featured box. Full-width article
and featured images run 16:9.

### Named Rules
**The No-Side-Rule Rule.** An accent rule on the left or right edge of a *block* is banned in this
project. Callouts get a full 1px box with a 2px `--casa` rule across the top. The left accent bar
is the most recognisable tell of a generated interface and this world does not use it. Structural
column dividers — the register's vertical hairline, the data strip's field separators — are grid
rules, not accents: they are `--filete` or 18% white, never `--casa` or a section glaze.

**The Third-Appearance Rule.** The bordered data object appears three times and always means the
same thing — a record of the thing you are looking at, printed as label/value pairs in tabular
figures. `.edicion` opens the front page, `.ficha-tira` opens the entry, `.ficha-casa` closes the
back cover. A fourth data surface uses this object; it does not invent one.

## Components

### Buttons
- **Shape:** square (0 radius), no border on the filled variant.
- **House button** (`.pie-boton`): filled `--casa`, white text, Control step, `0.75rem 1.15rem`
  padding. Hover darkens to `--casa-texto`. Below 900px it goes full-width.
- **Ghost button** (`.pie-boton.es-secundario`): transparent over the dark footer with a
  `rgba(255,255,255,0.32)` hairline; hover fills to 10% white and brightens the border.
- **Search button:** filled `--tinta`, uppercase Rótulo, hover fills to `--casa` — the only place a
  control turns fully house-purple.
- **Share control** (`.compartir-boton`): a 2.25rem square with a `--filete` hairline on white,
  holding a 1.05rem inline SVG stroked in `currentColor` at 1.75 weight. Hover inverts to a filled
  `--casa-texto`; the copy-link variant confirms by filling with the entry's own `--sec` for 1.6s
  (`.es-copiado`). It hides itself entirely when `navigator.clipboard` is absent rather than
  offering a control that cannot work.
- **Focus:** the two-tone ring, inherited globally from `:focus-visible`.

### Chips
- **Section chip** (`.etiqueta-seccion`): inline block filled with the inherited `--sec`, white
  uppercase Rótulo, `0.22rem 0.55rem` padding. Never outlined, never pill-shaped. On an entry it
  carries `NN · Section name` and links to the archive — it is a taxonomy control and a route out,
  which is why it may sit above the `h1`. That placement is not licence for a decorative label
  above a heading; see Don'ts.
- **Numbered stamp** (`.paso-num`, `.indice-item .codigo`, `.canto-pestana .codigo`,
  `.articulo-cuerpo h2::before`): a filled rectangle carrying a figure in tabular numerals.
  `--casa` when it belongs to DAK's own procedure; `--sec` when it belongs to a section or to a
  section of the entry you are reading.

### Cards / Containers
- **Corner style:** square throughout.
- **Featured box** (`.destacada-marco`): a 3px `--tinta` outline around a two-column split (image
  1.05fr, body 1fr), on white. With no featured image it drops to a single column rather than
  leaving half the box empty. Carries the only eager, prioritised image on the front page (asked at
  `large` so WordPress builds a real `srcset`) and a `--casa` stamp pinned to the image's top-left.
- **Boxed record** (`.edicion` / `.ficha-casa`): a 1px outline around a two-column definition list;
  each pair separated by a hairline, the last pair's rule removed. Title bar filled — `--casa` on
  the cover, 10% white in the footer.
- **Data strip** (`.ficha-tira`): the third appearance of the same object, flattened. A full-bleed
  `--tinta` band directly under the entry's title, carrying Firma / Publicado / Revisado / Lectura
  / Apartados as a flex row of label-over-value pairs, field names in Rótulo `--casa-clara` and
  values in white Secundario with tabular figures, separated by 18%-white vertical hairlines with
  the last separator removed. "Revisado" only appears when the post was modified more than a day
  after publication, so the strip never prints a redundant date. "Apartados" is filled in by script
  from the count of sections found in the body. At 900px it becomes a two-column grid and drops the
  separators; at 480px, one column.
- **Callout** (`blockquote`): 1px `--filete` box, 2px `--casa` top rule, `--papel` fill,
  `1.15rem 1.35rem` padding. The content-authored `.servicio-relacionado` variant swaps to a
  `--tinta` box with a full-width `--casa` caption tab reading "Siguiente paso" bled to the box
  edges. That class name comes from the content pipeline and must not be renamed.
- **Shadow strategy:** none. See Elevation & Depth.

### Inputs / Fields
- **Style:** 1px `--tinta` border, white fill, square, `0.7rem 0.9rem` padding, Secundario step.
  The search field and its button are welded (`gap: 0`, right border removed on the field) so the
  pair reads as one object, capped at 32rem.
- **Placeholder:** `--tinta-3`.
- **Focus:** the two-tone ring; the field itself does not change colour.

### Navigation
- **Header section nav:** uppercase Rótulo in `--tinta-2`, each item preceded by a 0.6rem square of
  its own `--sec`, with a 2px transparent bottom border that fills with `--sec` on hover and on
  `aria-current="page"`. Hidden below 900px, replaced by a bordered "Secciones" link that jumps to
  the on-page index.
- **Breadcrumbs:** always visible, never `display:none` — structured data is never attached to
  hidden content. Underlined in `--filete-fuerte`, hover moves to `--casa-texto` with the underline
  taking `currentColor`.
- **Pagination:** square 2.5rem stamps with a `--filete-fuerte` hairline, Control step in tabular
  figures; hover darkens the border to `--tinta` and tints the fill; the current page fills
  `--casa`; ellipsis stamps lose their border entirely.
- **Folded index** (`.indice-plegado`): the canto's counterpart where there is no canto. A
  `<details>` whose summary is a Rótulo between a `--tinta` top rule and a `--filete` bottom rule,
  with a `--casa-texto` `+`/`−` disclosure marker; open, it lists the entry's sections as
  hairline-separated rows of `2rem | 1fr` — Rótulo code in `--casa-texto`, name in Secundario.
  Hidden above 1180px, shown below it.

### The canto (signature component, two pointings)
One component, two things it can point at. **This is the relationship that matters and a future
edit must not fork it:** the entry did not get an index of its own, it got the front page's thumb
aimed at a different set of milestones.

- **Section rail** (`.canto`, front page and archives): eight tabs fixed to the right edge of the
  viewport, vertically centred, each filled with its own `--sec`. At rest they sit
  `translateX(calc(100% - 1.9rem))` at 0.5 opacity — only the number shows. The tab for the section
  you are reading protrudes further (`calc(100% - 3.6rem)`) at full opacity while its neighbours
  stay dimmed: a thumb pushed into a thick catalogue. Hover or focus pulls a tab fully out. Removed
  below 1240px, where the section band becomes `position: sticky` instead.
- **Entry canto** (`.articulo-canto` / `.canto-pegado`, single posts): the same `.canto-pestana`
  element, restyled for a column instead of an edge. It lives *inside* the grid, sticky at
  `top: 1.5rem` under a Rótulo header ruled in `--tinta` — the edge of the sheet, not the edge of
  the screen. Tabs become `1.75rem | 1fr` rows on `--filete` hairlines: the number is a stamp that
  is `--filete-fuerte` at rest and takes the entry's `--sec` when active, the name is Fino clamped
  to two lines, and the row tints `--papel-tinte` on hover. No translation and no dimming here;
  the same active/resting distinction is carried by fill and ink weight instead, because a column
  has no edge to protrude from. Removed below 1180px in favour of the folded index.
- **Shared machinery:** one `IntersectionObserver` and one `es-activa` class serve both. Tabs whose
  `href` starts with `#` map to article sections; the rest map to `seccion-<slug>` blocks. Only one
  canto renders per page — `header.php` suppresses the section rail on `is_singular('post')` — so
  exactly one thumb points at a time. Displacement is `transform` only, never `width` or `margin`.
  `prefers-reduced-motion: reduce` collapses every transition to 0.01ms and turns off smooth
  scrolling; every tab remains a working link, and if the script or `IntersectionObserver` is
  unavailable the folded index still covers navigation.

### Numbered article section
Each `h2` in article prose is a `2.5rem | 1fr` grid opened by a 2px `--casa` top rule, with a CSS
counter (`counter-reset` on the body, `decimal-leading-zero`) printing `01`, `02` … into a
`--sec`-filled 1.75rem stamp in the left track. The figure is generated, not authored: only 9 of
the 501 `h2` across the 58-post corpus carry their own "N." prefix (2%), so the counter does not
collide with existing content and the numbering appears on every already-published entry without
touching the generator. Below 900px the number track narrows to 2.15rem.

### Register (`.articulo-registro` / `.registro-pegado`)
The entry's left margin, made to work: a sticky column holding a vertically-set Rótulo ("Compartir",
`writing-mode: vertical-rl`) above a stack of square share controls, closed by a vertical `--filete`
hairline on its right. Below 900px the whole column is removed and the identical control set — the
markup is buffered once in PHP and printed twice — reappears as `.compartir-fila`, a horizontal row
ruled top and bottom at the close of the entry.

### Catalogue row (signature component)
The system's atom, shared verbatim by the front page, the section archive, search results and the
entry's recirculation block. Square thumbnail, then the description column (uppercase section label
in `--sec`, date, the title, a two-line clamped Faustina excerpt), then the minutes figure
right-aligned. Hover tints the row to `--papel-tinte`, returns the thumbnail to full saturation,
and grows a 2px `--casa` rule across the bottom by `scaleX` from the left — a straightedge
advancing under the line you are reading. The same rule appears on `:focus-visible`. A row with no
thumbnail fills the square with its section colour and prints the section number instead of leaving
a hole in the grid.

## Do's and Don'ts

### Do:
- **Do** set the section colour once per block as `--sec` (via `dak_var_seccion()`) and let every
  child inherit it.
- **Do** use `--casa` (`#B024FF`) as fill only, `--casa-texto` (`#8B1CC7`) for purple text on
  paper, `--casa-clara` (`#D89BFF`) for purple text on ink.
- **Do** keep the two-tone focus ring exactly as it is: white 2px outline plus a `--tinta` 5px
  halo. It is the only ring that clears 3:1 on all thirteen real backgrounds.
- **Do** pick a size from the twelve recorded steps. If a new surface seems to need a thirteenth,
  the nearest step is the answer.
- **Do** run tabular figures on every number: codes, counts, dates, minutes, page numbers, tables,
  generated section numbers.
- **Do** use Archivo for structure and Faustina for prose, switching face whenever the job changes.
- **Do** separate with hairlines and paper-tone changes; escalate emphasis by making a rule heavier
  (1px → 2px → 3px), not by adding depth.
- **Do** keep 0.6875rem (11px) as the floor for functional text.
- **Do** keep prose at 40rem and use `text-wrap: balance` on every large heading.
- **Do** mount a circuit image at its own proportion and never crop it. What `_blog-content/`
  emits is not photography — it is plates with type printed inside them, 1080×1350 in 50 of the
  60 — so a band crop cuts the words in half. The box fits the plate; the plate never fits the box.
  The only concession is a 30rem height ceiling with `object-fit: contain`, sized so it can never
  bite a 4:5, and two strips of paper are always preferable to one severed word.
- **Do** give both margins of a reading column something to do, and relocate that content into the
  flow when the breakpoint takes the margin away.
- **Do** re-point the canto rather than build a second index component; one canto per page, and
  `header.php` enforces it.
- **Do** keep exactly one `h1` per template with no heading-level skips.
- **Do** self-host fonts, latin subset, and preload only the face that composes the first viewport.
- **Do** move motion through `transform` and `opacity`, honour `prefers-reduced-motion`, and drive
  scroll state with `IntersectionObserver`.
- **Do** derive structure from what the corpus already publishes (sections from `h2`, counts from
  the DOM) and verify the frequency before relying on it, as the 2%-collision check did.
- **Do** hide a control that cannot function (the copy button with no Clipboard API) rather than
  ship a dead affordance.
- **Do** give a missing image a filled section-coloured square with its number, not an empty cell.

### Don't:
- **Don't** add a `border-radius`, a `box-shadow` on a surface, or a gradient. The one shadow in
  the theme is the focus halo, and a sticky element is not an exception.
- **Don't** put an accent rule on the left or right edge of a block. Callouts are boxed with a top
  rule. Structural column hairlines are `--filete` or a white tint, never an accent colour.
- **Don't** write text in `#B024FF` on paper — it measures 4.12:1.
- **Don't** lighten purple on hover; darken it.
- **Don't** put a decorative label above a heading. No eyebrows, no kickers anywhere. The Rótulo
  style is for box captions, column headers, data-strip field names and the image stamp; the
  section chip may precede an `h1` only because it is a working link to that section's archive.
- **Don't** ship the card grid with a photo on top and a category pill. Entries are rows in a table.
- **Don't** let a row thumbnail compete with the featured box: thumbnails are `thumbnail`-size,
  lazy and desaturated at rest; exactly one image per page loads eagerly.
- **Don't** hide breadcrumbs or any element that carries structured data.
- **Don't** hard-code a section hex into a component; read `--sec`.
- **Don't** add a per-heading size override at a breakpoint when the heading is already set with a
  `clamp()` — the clamp is the mobile behaviour.
- **Don't** register `add_image_size()`. WordPress's proportional defaults already exist on the
  server for all live posts and give a real `srcset` immediately; a custom crop would force a full
  thumbnail regeneration on a live install that has no repository.
- **Don't** reintroduce a per-entry catalogue code. The 01–08 section numbering and the generated
  article-section counter are the ordering devices; a database ID printed on a row was noise and
  was removed at the user's request.
- **Don't** animate `width` or `margin`, and don't add a second authored motion gesture — the canto
  is the site's one flourish, in both of its pointings.
