---
version: 1
slug: "analisis-microsite-montana-index-html"
primary_target: "_analisis-microsite/montana/index.html"
related_targets: ["_analisis-microsite/assets/expediente.css"]
---

# Informe de marca — `analisis.dakagency.net/montana/`

**Alcance.** El entregable del circuito de research para Grupo Montaña, y el estreno del
mundo visual «Expediente de pruebas» (`_analisis-microsite/assets/expediente.css`). No
toca los otros dos mundos del micrositio ni la SPA.

**Modo del visitante: Read.** Quien lo abre tiene que *entender un diagnóstico*. Se
proyecta en una reunión, se relee después en el celular y se imprime para firmarlo o
archivarlo. No es una landing: no hay nada que comprar en la página.

## Audiencia y tarea

La gerencia de una empresa de alimentación saludable con seis sedes en el Perú. Nos
escribió por WhatsApp pidiendo cuatro cosas concretas —TikTok/Reels, producción
audiovisual, Meta Ads y campañas geolocalizadas— con un objetivo medible: **que entre
más gente a la tienda**.

**La tarea del documento es incómoda:** decirle que tres de sus cuatro peticiones son
correctas y que una está mal ordenada, porque el problema está aguas arriba de la
publicidad. Eso no se sostiene con diseño; se sostiene con pruebas.

## Acción que buscamos

Aprobar los tres movimientos y agendar la reunión de cierre. El documento se manda como
**enlace**, no como adjunto: el diagnóstico dice «no tienes un lugar propio en internet»
y mandarlo en un `.pptx` contradiría el mensaje.

## Dirección elegida

**Expediente de pruebas.** Cada hallazgo es una *prueba numerada* con su enunciado, su
dato, su fuente fechada y su límite declarado. Es la regla de honestidad de la Fase 6 del
circuito convertida en componente, en vez de quedar como nota al pie.

- Tirada de `concept-seed.mjs --scope surface --mode read`, **seed key `5e445342`**,
  ASSIGNED INDEX 4 sobre la lista propia ordenada por resonancia: (1) el recorrido hasta
  la puerta, (2) el pedido punto por punto, (3) las seis ciudades, **(4) el expediente de
  pruebas**, (5) la línea de tiempo, (6) el inventario de activos, (7) la hoja de
  medición contra rangos.
- Mundo visual **fijo**, no elegido: la paleta y la tipografía de DAK son compromiso de
  marca en `PRODUCT.md`, y el usuario las fijó otra vez en el encargo, junto con la
  petición explícita de textura. Por eso no hubo ronda de direcciones ni comp: es una
  superficie nueva **dentro** de un mundo establecido, no un mundo nuevo.

## Momento memorable

La portada: cuatro carriles de semanas, un bloque por video publicado, con sus tres
cuentas de TikTok y la del competidor sobre el mismo eje. **La cuenta de 2.345 seguidores
tiene el carril vacío; la de 104 es la que publicó.** Se cuenta con el dedo y no hay que
explicarlo en la reunión.

## Restricciones que mandan sobre el gusto

1. **Todo lo que significa algo se pinta con un borde, nunca con un fondo.** El navegador
   no imprime fondos salvo que quien imprime marque la casilla, y esa casilla la marca la
   clienta. Se comprueba capturando la página en medio impresión con todos los fondos
   apagados.
2. **Cero fallos de contraste o no se publica**, contando el alfa y con el umbral correcto
   por tamaño. Con las texturas a peso visible ya no basta el auditor estándar —busca el
   primer ancestro opaco y no ve el trazo—, así que se mide además contra el fondo
   compuesto peor posible.
3. **Nada de dibujo vectorial para los datos.** Cajas de CSS. El trazo SVG se retiró del
   mundo anterior porque se cortaba a ciertos anchos y, sobre todo, porque no se entendía.
4. **Ningún texto funcional bajo 11 px.**
5. **Sin JavaScript la página se lee entera**, gráfico incluido. Lo único que se pierde es
   el riel, el índice y el teclado.
6. **El ancho imprimible son 720 px.** Lo que pase de ahí se corta en el PDF sin avisar.

## Decisiones pendientes

- No hay versión en PDF subida aparte: el botón llama a `window.print()` contra la propia
  hoja de impresión, así que nunca se desincroniza. Si en algún momento se quiere un
  archivo estable para adjuntar, hay que decidir dónde vive.
- El informe no se migra a mundos futuros. Como los ocho anteriores, se queda como se
  presentó.
