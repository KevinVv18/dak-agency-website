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
  headline:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.4rem, 2.4vw, 1.95rem)"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.32
    letterSpacing: "-0.01em"
  banda:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.01em"
  body:
    fontFamily: "Faustina, Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "normal"
  body-corto:
    fontFamily: "Faustina, Georgia, Times New Roman, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  rotulo:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.13em"
    fontFeature: "tabular-nums"
  dato:
    fontFamily: "Archivo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.06em"
    fontFeature: "tabular-nums"
rounded:
  none: "0"
spacing:
  margen: "2rem"
  margen-movil: "1.25rem"
  ancho: "78rem"
  medida: "42rem"
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
  pagina-numero:
    backgroundColor: "{colors.papel-fila}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    height: "2.5rem"
  pagina-numero-actual:
    backgroundColor: "{colors.casa}"
    textColor: "#FFFFFF"
---

# Design System: DAK Blog — El Catálogo

> Recorded from the shipped theme at `wordpress-theme/dak-blog/`, after the build. Every token
> here was read out of `style.css`, `assets/css/*.css` and `inc/helpers.php`, not out of a plan.
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
- One authored motion gesture in the entire site (the edge tab), plus one rule that grows.
- Self-hosted variable fonts, latin subset, zero third-party origins.

## Colors

Two inks on one paper, plus a set of eight section glazes that are deep enough to carry white text
and are never mixed with each other.

### Primary
- **Tinta de la Casa** (`--casa`): DAK's purple, used only as a filled surface — the edition seal
  over the fold, the "Siguiente paso" caption tab, the 2px rule that opens every `h2` in an
  article, list bullets, the current pagination stamp, the rule that grows under a hovered row,
  the text selection, and the caret. It measures 4.12:1 as text on paper, which is why it is
  structurally barred from being a letter.
- **Tinta de la Casa, escrita** (`--casa-texto`): the same purple darkened until it is legible as
  text on paper (6.1:1). This is the link colour inside article prose, the hover of the row footer
  and breadcrumbs, and the pressed state of the purple button — pressing *darkens*, because
  lightening dropped white-on-purple to 3.62:1.
- **Tinta de la Casa, clara** (`--casa-clara`): the same purple opened up until it is legible on
  the dark ink of the footer and the top strip. It is the only purple allowed on `--tinta`.

### Secondary — the eight section glazes
One per section, in publication order, each set once per block by `dak_var_seccion()` and inherited
by everything inside it: `--sec-seo-buscadores` (01), `--sec-diseno-web` (02),
`--sec-redes-sociales` (03), `--sec-publicidad` (04), `--sec-automatizacion` (05),
`--sec-branding` (06), `--sec-por-rubro` (07), `--sec-guias-precios` (08). All eight carry white
text at 5.94:1 or better. A category outside the map falls to `--sec-defecto` and orders last; it
never breaks the layout.

### Neutral
- **Papel bond gris** (`--papel`): the page. Also the fill of blockquotes and table headers, so a
  boxed note reads as paper set into the white sheet.
- **Papel de fila** (`--papel-fila`): the white of every row band, the header, the cover, the
  archive masthead and the article body. Content sits on white; the page around it is grey.
- **Papel entintado** (`--papel-tinte`): hover fill for rows and index cells, and the placeholder
  behind an image that has not loaded.
- **Tinta** (`--tinta`): body text, the footer's whole ground, the 3px cover rules, and the outer
  ring of the focus halo.
- **Tinta 2 / Tinta 3** (`--tinta-2` / `--tinta-3`): long-form prose and secondary metadata
  respectively. Nothing quieter than `--tinta-3` exists as text.
- **Filete / Filete fuerte** (`--filete` / `--filete-fuerte`): the hairline grid and the stronger
  hairline (input borders, scrollbar thumb, breadcrumb separators).

### Named Rules
**The Fill-Only Rule.** `--casa` is a surface, never a letter. Any purple that has to be read as
text is `--casa-texto` on paper or `--casa-clara` on ink. There is no third option.

**The One Glaze Per Block Rule.** A section colour is declared exactly once, on the outermost
element of its block, as `--sec`. Bands, chips, edge tabs, row labels and index numbers all read
that same variable. Never hard-code a section hex into a component.

**The Darkening Press Rule.** Interactive purple gets *darker* on hover, never lighter. Lightening
`#B024FF` puts white text below 4.5:1; `--casa-texto` holds 6.80:1.

## Typography

**Display / structure font:** Archivo (variable, 400–700, self-hosted, latin subset)
**Body font:** Faustina (variable, 400–600, roman and italic, self-hosted, latin subset)

**Character:** Archivo is the catalogue's printing: tight, tabular, uppercase where it counts, and
it does every number in the system. Faustina is the salesman's paragraph — warm, high x-height
serif, used only where someone is actually reading sentences. The split is functional, not
decorative: if it is a label, a figure, a heading or a column, it is Archivo; if it is prose, it is
Faustina.

Both faces are self-hosted with a latin `unicode-range` and `font-display: swap`. Only Archivo is
preloaded — it composes the entire first viewport and the LCP is the `h1` text, so Faustina, which
first appears in excerpts further down, needs no priority.

### Hierarchy
- **Display** (700, `clamp(2rem, 4.6vw, 3.4rem)`, 1.06, `-0.03em`): the cover `h1` on the front
  page, the archive masthead `h1`, and the article `h1` (`clamp(1.85rem, 4.4vw, 3rem)`). Capped at
  21–22ch with `text-wrap: balance`. Exactly one per template.
- **Headline** (700, `clamp(1.4rem, 2.4vw, 1.95rem)`, 1.16, `-0.02em`): the featured entry's title
  and the footer's closing statement (`clamp(1.5rem, 3vw, 2.15rem)`).
- **Banda** (700, 1.05rem, `0.01em`): the section number and name inside a glazed band. Section
  code and name share a size so the band reads as one line of type.
- **Title** (600, 1.0625rem, 1.32, `-0.01em`): the row title — the reader's own question, written
  out. This is the single most repeated piece of type in the system.
- **Body** (400, 1.125rem, 1.72, Faustina): article prose, capped at 42rem (~68 characters).
  Drops to 1.0625rem under 900px. Excerpts and intros run at 1.0625rem/1.62.
- **Rótulo** (700, 0.6875rem = 11px, `0.13em`, uppercase): the catalogue small-cap. Column headers,
  box captions, the identification strip, the image stamp, the footer's band titles. 11px is the
  floor for functional text in this system and nothing goes below it.
- **Dato** (700, 0.75rem, `0.06em`, uppercase, tabular): the price column — minutes — plus dates,
  counts and the article's metadata line.

### Named Rules
**The Two-Job Rule.** Archivo for structure, Faustina for prose. A heading inside article prose
switches back to Archivo; an excerpt inside a structural row switches to Faustina. The face
announces which job the text is doing.

**The Tabular Figures Rule.** Every number in the catalogue — codes, counts, dates, minutes, page
numbers, table cells — runs `font-variant-numeric: tabular-nums`. Columns of figures that do not
align are not a catalogue.

**The Air-Above Rule.** In article prose, headings take more space above than below
(`h2` 2.4em top, 0.7em to the next element). One rhythm, whole page.

## Layout

The container is a single centred column, `78rem` maximum, with a `2rem` gutter that collapses to
`1.25rem` below 900px by redefining `--margen` at `:root`. Colour bands and row bands run
full-bleed; only their inner container is constrained, so a section band touches both edges of the
viewport while its type stays on the grid.

The catalogue row is the system's grid unit: `4.5rem | minmax(0, 1fr) | 4.25rem` —
thumbnail, description, minutes — with a `1.35rem` column gap. A `.seccion-columnas` header sits
once per section on the same track definition, which is what makes a list of links read as a table.
Below 620px the header is removed and the row reflows to two columns (`3.5rem | 1fr`), with the
minutes figure moving up onto the metadata line rather than being squeezed against the title.

The front page's index of sections is a four-column grid separated by 1px hairline gutters
(`gap: 1px` over a `--filete` background, so the gaps *are* the rules). It steps to two columns at
1000px and one at 420px. The footer index behaves the same way, stepping at 1000px and 520px.

Article measure is fixed at `42rem` — roughly 68 characters in Faustina — and prose flows on an
em-relative rhythm (`> * + * { margin-top: 1.15em }`) so spacing scales with the type size rather
than with a pixel scale.

Breakpoints, as actually declared: 1240px (edge tabs give way to a sticky band), 1000px (index and
featured box collapse), 900px (gutter shrinks, header nav becomes a link, article type steps down),
620px (row reflows, column header removed, wide tables scroll), 560px and 520px and 420px for the
strip, the footer index and the section index.

### Named Rules
**The Full-Bleed Band Rule.** Section colour reaches the edges of the viewport; the type inside it
does not. Never box a section colour inside the container.

**The Hairline Gutter Rule.** Grid gaps in index surfaces are 1px of `--filete` showing through,
not empty space. The catalogue is ruled, not spaced.

## Elevation & Depth

There are no shadows in this system. `border-radius`, `box-shadow` on any surface, and
`linear-gradient` do not appear anywhere in the shipped stylesheets. The single `box-shadow`
declaration in the theme is the outer halo of the focus ring, and it is a solid ring, not a
shadow.

Depth is done three ways, all of them flat: tonal layering (grey paper behind, white row in front,
darker ink tint on hover), hairline rules (`--filete` between rows, `--filete-fuerte` on inputs),
and weight rules (a 3px `--tinta` rule closes the cover, the archive masthead and the article
record; a 2px `--casa` rule opens each article heading). Emphasis escalates by making a rule
heavier or a surface darker — never by lifting something off the page.

### Named Rules
**The Flat-Ink Rule.** No shadow, no radius, no gradient, no blur. If something needs to separate
from what is behind it, it gets a rule or a change of paper tone.

**The Two-Tone Focus Rule.** Focus is a white 2px outline with a `--tinta` 5px halo outside it. A
single-tone ring in the house purple measured 1.70:1 against the green section band — below the
3:1 that WCAG 1.4.11 requires for non-text — so the ring carries both a light and a dark tone and
survives all thirteen real backgrounds in the build: paper, white row, eight glazes, dark footer
and dark strip.

## Shapes

Every corner is square. Radius is not a scale in this system; it is zero, everywhere, including
buttons, inputs, chips, thumbnails, pagination stamps and the edge tabs.

The recurring silhouettes are three: the **band** (full-bleed rectangle of section glaze), the
**boxed record** (a 1px or 3px `--tinta` outline around a definition list — the cover's edition
box on the front page and the house record in the footer are the same object, so the page opens
and closes with the same piece), and the **row** (a hairline-separated horizontal band on a
1fr-dominant three-column grid).

Thumbnails are square (`aspect-ratio: 1`) and small on purpose: 72px painted from WordPress's
`thumbnail` crop, lazily loaded, desaturated to 0.92 and returning to full saturation on row
hover. They illustrate the reference; they do not compete with the featured box, which is the only
prioritised image on the page. Full-width article and featured images run 16:9.

### Named Rules
**The No-Side-Rule Rule.** An accent rule on the left or right edge of a block is banned in this
project. Callouts get a full 1px box with a 2px `--casa` rule across the top. The left accent bar
is the most recognisable tell of a generated interface and this world does not use it.

## Components

### Buttons
- **Shape:** square (0 radius), no border on the filled variant.
- **House button** (`.pie-boton`): filled `--casa`, white text, 0.875rem/600,
  `0.75rem 1.15rem` padding. Hover darkens to `--casa-texto`. Below 900px it goes full-width.
- **Ghost button** (`.pie-boton.es-secundario`): transparent over the dark footer with a
  `rgba(255,255,255,0.32)` hairline; hover fills to 10% white and brightens the border.
- **Search button:** filled `--tinta`, uppercase rótulo type, hover fills to `--casa` — the only
  place a control turns fully house-purple.
- **Focus:** the two-tone ring, inherited globally from `:focus-visible`.

### Chips
- **Section chip** (`.etiqueta-seccion`): inline block filled with the inherited `--sec`, white
  uppercase rótulo at `0.1em`, `0.22rem 0.55rem` padding. Never outlined, never pill-shaped.
- **Numbered stamp** (`.paso-num`, `.indice-item .codigo`, `.canto-pestana .codigo`): a filled
  rectangle carrying the section or step number in tabular figures. `--casa` when it belongs to
  DAK's own procedure; `--sec` when it belongs to a section.

### Cards / Containers
- **Corner style:** square throughout.
- **Featured box** (`.destacada-marco`): a 3px `--tinta` outline around a two-column split (image
  1.05fr, body 1fr), on white. With no featured image it drops to a single column rather than
  leaving half the box empty. Carries the only eager, prioritised image on the front page (asked at
  `large` so WordPress builds a real `srcset`) and a `--casa` stamp pinned to the image's top-left.
- **Record box** (`.edicion` / `.ficha-casa`): a 1px outline around a two-column definition list;
  each pair separated by a hairline, the last pair's rule removed. Title bar filled — `--casa` on
  the cover, 10% white in the footer. Internal padding `0.55rem 0.85rem` per cell.
- **Callout** (`blockquote`): 1px `--filete` box, 2px `--casa` top rule, `--papel` fill,
  `1.15rem 1.35rem` padding. The content-authored `.servicio-relacionado` variant swaps to a
  `--tinta` box with a full-width `--casa` caption tab reading "Siguiente paso" bled to the box
  edges. That class name comes from the content pipeline and must not be renamed.
- **Shadow strategy:** none. See Elevation & Depth.

### Inputs / Fields
- **Style:** 1px `--tinta` border, white fill, square, `0.7rem 0.9rem` padding, 0.9375rem type.
  The search field and its button are welded (`gap: 0`, right border removed on the field) so the
  pair reads as one object, capped at 32rem.
- **Placeholder:** `--tinta-3`.
- **Focus:** the two-tone ring; the field itself does not change colour.

### Navigation
- **Header section nav:** uppercase rótulo in `--tinta-2`, each item preceded by a 0.6rem square
  of its own `--sec`, with a 2px transparent bottom border that fills with `--sec` on hover and on
  `aria-current="page"`. Hidden below 900px, replaced by a bordered "Secciones" link that jumps to
  the on-page index.
- **Breadcrumbs:** always visible, never `display:none` — structured data is never attached to
  hidden content. Underlined in `--filete-fuerte`, hover moves to `--casa-texto` with the
  underline taking `currentColor`.
- **Pagination:** square 2.5rem stamps with a `--filete-fuerte` hairline, tabular figures; hover
  darkens the border to `--tinta` and tints the fill; the current page fills `--casa`; ellipsis
  stamps lose their border entirely.

### Edge tabs (signature component)
Eight fixed tabs stacked at the right edge of the viewport, vertically centred, each filled with
its own `--sec`. At rest they sit `translateX(calc(100% - 1.9rem))` at 0.5 opacity — only the
number shows. The tab for the section you are currently reading protrudes further
(`calc(100% - 3.6rem)`) and goes to full opacity while its neighbours stay dimmed: a thumb pushed
into a thick catalogue. Hover or focus pulls the tab fully out. This is the only authored motion
gesture in the site.

The active state is driven by an `IntersectionObserver` (never a scroll listener) toggling one
class; all displacement is `transform` in CSS, never `width` or `margin`. Below 1240px there is no
edge to hook a thumb into, so the tabs are removed and the section band becomes `position: sticky`
at the top instead — the same fact (which section you are in) delivered by the device that fits a
phone. `prefers-reduced-motion: reduce` collapses every transition and animation to 0.01ms and
turns off smooth scrolling; the tabs remain working links.

### Catalogue row (signature component)
The system's atom, shared verbatim by the front page, the section archive, search results and
article recirculation. Square thumbnail, then the description column (uppercase section label in
`--sec`, date, the title, a two-line clamped Faustina excerpt), then the minutes figure right-
aligned. Hover tints the row to `--papel-tinte`, returns the thumbnail to full saturation, and
grows a 2px `--casa` rule across the bottom by `scaleX` from the left — a straightedge advancing
under the line you are reading. The same rule appears on `:focus-visible`. A row with no thumbnail
fills the square with its section colour and prints the section number instead of leaving a hole in
the grid.

## Do's and Don'ts

### Do:
- **Do** set the section colour once per block as `--sec` (via `dak_var_seccion()`) and let every
  child inherit it.
- **Do** use `--casa` (`#B024FF`) as fill only, `--casa-texto` (`#8B1CC7`) for purple text on
  paper, `--casa-clara` (`#D89BFF`) for purple text on ink.
- **Do** keep the two-tone focus ring exactly as it is: white 2px outline plus a `--tinta` 5px
  halo. It is the only ring that clears 3:1 on all thirteen real backgrounds.
- **Do** run tabular figures on every number: codes, counts, dates, minutes, page numbers, tables.
- **Do** use Archivo for structure and Faustina for prose, switching face whenever the job changes.
- **Do** separate with hairlines and paper-tone changes; escalate emphasis by making a rule heavier
  (1px → 2px → 3px), not by adding depth.
- **Do** keep 0.6875rem (11px) as the floor for functional text.
- **Do** keep prose at 42rem and use `text-wrap: balance` with a ch cap on every large heading.
- **Do** keep exactly one `h1` per template with no heading-level skips.
- **Do** self-host fonts, latin subset, and preload only the face that composes the first viewport.
- **Do** move motion through `transform` and `opacity`, honour `prefers-reduced-motion`, and drive
  scroll state with `IntersectionObserver`.
- **Do** give a missing image a filled section-coloured square with its number, not an empty cell.

### Don't:
- **Don't** add a `border-radius`, a `box-shadow` on a surface, or a gradient. The one shadow in
  the theme is the focus halo.
- **Don't** put an accent rule on the left or right edge of a block. Callouts are boxed with a top
  rule.
- **Don't** write text in `#B024FF` on paper — it measures 4.12:1.
- **Don't** lighten purple on hover; darken it.
- **Don't** put a small uppercase label above a heading. No eyebrows, no kickers anywhere; the
  rótulo style exists for box captions, column headers and the image stamp only.
- **Don't** ship the card grid with a photo on top and a category pill. Entries are rows in a table.
- **Don't** let a row thumbnail compete with the featured box: thumbnails are `thumbnail`-size,
  lazy and desaturated at rest; exactly one image per page loads eagerly.
- **Don't** hide breadcrumbs or any element that carries structured data.
- **Don't** hard-code a section hex into a component; read `--sec`.
- **Don't** register `add_image_size()`. WordPress's proportional defaults already exist on the
  server for all 55 live posts and give a real `srcset` immediately; a custom crop would force a
  full thumbnail regeneration on a live install that has no repository.
- **Don't** reintroduce a per-entry catalogue code. The 01–08 section numbering is the ordering
  device; a database ID printed on a row was noise and was removed at the user's request.
- **Don't** animate `width` or `margin`, and don't add a second authored motion gesture — the edge
  tab is the site's one flourish.
