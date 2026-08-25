# Product

<!-- impeccable:product-schema 1 -->

> **Alcance:** los documentos internos de socios, en `_socios-microsite/`. El primero
> es el convenio con Grupo Inmobiliario JETC (`_socios-microsite/jetc/`).
>
> No es la web pública (ver [PRODUCT.md](PRODUCT.md)), ni el demo inmobiliario
> (ver [PRODUCT.inmobiliaria.md](PRODUCT.inmobiliaria.md)), ni el circuito de análisis
> de marca de `_analisis-microsite/`, que sí es material de cliente.

## Platform

web

## Users

**Los socios de DAK Agency, y nadie más.** Dos o tres personas que se sientan a decidir
si comprometen una parte grande de la capacidad de la agencia con un solo cliente.

Llegan por un enlace privado, casi siempre minutos antes de la reunión o durante ella,
en un portátil y pasándose un teléfono. La lectura es adversarial: buscan el número que
decide, y luego buscan dónde está el riesgo escondido.

**Quien NO es usuario: el cliente.** Aquí van los honorarios, los márgenes, la posición
de repliegue en la negociación y el juicio franco sobre su equipo comercial. Que esto
llegue al cliente cuesta la negociación entera.

## Product Purpose

Convertir una oferta verbal en una **decisión con precio, riesgo tasado y un número que
la resuelve**. Éxito = los socios salen de la reunión con un modelo elegido y una lista
de preguntas. Fracaso = salen diciendo «hay que verlo con más calma».

## Positioning

No compite con nada: es papel de trabajo. Su única exigencia es que **se pueda defender
bajo interrogatorio**. Cada cifra lleva su origen, y lo que no se pudo verificar aparece
marcado como pendiente en vez de rellenado con un supuesto.

## Operating Context

- **Se lee en reunión, no en el escritorio.** Tiene que funcionar proyectado, en móvil y
  **en papel**: la ruta de impresión es una superficie de primera clase, no un descarte.
- **Sin garantía de red.** Por eso la página es autocontenida, tipografías incluidas en
  base64. Una voz de display que cae a la sans del sistema es el mundo perdido.
- **Nunca en el mismo subdominio que el material de cliente.** Va detrás de autenticación
  y con `noindex`; ver «Límites estrictos» en [CLAUDE.md](CLAUDE.md).

## Capabilities and Constraints

- **Un solo archivo HTML** por documento, sin build, sin dependencias, sin red.
- Un instrumento interactivo por documento como máximo, y tiene que ser útil **durante**
  la conversación (aquí: el deslizador de ritmo de venta que voltea el modelo ganador).
- Se despliega aparte del build de la SPA, con su carpeta en `deploy-protect.txt`.

## Brand Commitments

Vinculantes para esta superficie, y **deliberadamente distintos de la marca pública**:

- **Paleta a dos tintas:** verde botella `#123A2A` y bermellón `#D93A14`, sobre bond
  reciclado `#DDD6C4`. `--senal-texto:#A82A0B` es la misma tinta oscurecida para poder
  usarse como texto sobre papel. **No hay una tercera tinta.**
- **Tipografía:** familia Archivo (Omnibus-Type), incrustada. Archivo Black para display.
- No se reutiliza el morado `#B024FF` ni el negro `#030106` de la web pública: que un
  documento interno se parezca a un entregable de cliente invita a reenviarlo.

## Evidence on Hand

Todo dato del documento sale de fuentes citables: tablas de financiamiento entregadas por
el cliente, biblioteca pública de anuncios de Meta, su web, y aritmética propia
reproducible. **Los escenarios de honorarios son propuestas, no hechos**, y se presentan
como tales.

## Product Principles

1. **Un documento, un número.** Si no hay una cifra que resuelva la decisión, todavía no
   hay documento.
2. **Separar lo verificable de lo supuesto**, siempre y en la propia página.
3. **Decir lo incómodo en la sección temprana**, no escondido en las conclusiones.
4. **Lo que no se pudo comprobar se marca**, nunca se rellena.
5. **El papel importa**: se imprime y se raya a mano en la mesa.

## Accessibility & Inclusion

Mismo piso que el resto del repo, verificado con auditoría propia que **compone el alfa**
de toda la pila de fondos antes de medir:

- Contraste AA: 4.5:1 normal, 3:1 grande. Cero fallos es el criterio de publicación.
- Texto funcional nunca por debajo de **11px**.
- Un solo `h1`, jerarquía sin saltos.
- `prefers-reduced-motion` detiene el registro de la segunda tinta y las entradas.
- El deslizador es un `input[type=range]` real: teclado y lector de pantalla incluidos.
