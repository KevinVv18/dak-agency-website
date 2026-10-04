# Product

<!-- impeccable:product-schema 1 -->

> **Alcance:** el showroom de edificios de `_showroom-demo/` (motor + vitrina
> pública «Residencial Los Faiques» + showrooms privados de clientes en
> `privado/`). No cubre dakagency.net ni los otros demos. Este archivo no se
> publica: el deploy solo sube `dist/`.

## Platform

web

Escritorio casi principal, pero **el móvil no puede fallar** (Kevin, 3-oct-2026).

## Users

**Usuario primario: el comprador de un departamento en preventa** en Chiclayo y
el norte del Perú. Recorre el edificio desde la computadora o el celular, elige
piso y departamento, mira planta, recorrido y precio, y consulta por esa unidad.

**Usuario secundario: el dueño o director comercial de una inmobiliaria**, al que
DAK le vende el showroom. Lo ve en una reunión, funcionando con un edificio que
reconoce como suyo o parecido al suyo. Compara contra webs locales de plantilla
y contra los showrooms de Lima.

## Product Purpose

Que el comprador entienda un edificio que todavía no existe y consulte por una
unidad concreta, sin perder el contexto entre fachada, piso, departamento,
planta, recorrido y consulta. Para DAK es una línea de producto vendible a
varias inmobiliarias con el mismo motor.

Éxito = consultas con la unidad identificada. Fracaso = que se vea como una web
inmobiliaria más.

## Positioning

- En el norte del Perú **ninguna inmobiliaria tiene selector de pisos y
  departamentos con disponibilidad** (investigación del 3-oct-2026). En Lima, de
  735 proyectos, uno solo. El diferenciador es la disponibilidad sobre la
  planta, no el tour 360 (que ya cuesta desde S/ 600).
- Referencia de experiencia: president-tower.urbania3d.app. Su «3D» son
  imágenes fijas + clips de transición + polígonos SVG + tour embebido.
- Competencia que publica precio: Web3D, US$ 3.000–5.000 + US$ 900/año, sin
  renders.

## Operating Context

- Se muestra en reuniones (laptop o celular) y se comparte por WhatsApp: cada
  departamento tiene URL propia.
- 4G en Chiclayo: la primera pantalla tiene que cargar rápido; panoramas y
  visor 360 se cargan solo al pedirlos.
- El material visual lo produce DAK en Blender (edificio procedural, interiores
  desde el layout) o lo entrega el cliente (renders, plantas).

## Capabilities and Constraints

- Sitio estático generado (`node generar.js [carpeta]`), una página por ruta,
  sin servidor. Un motor, varios proyectos: cada proyecto es una carpeta con
  `datos/` y `assets/`.
- La consulta está en modo demo: no se envía nada.
- El repo es público: el material de clientes reales vive en `privado/` y no se
  versiona.

## Brand Commitments

- El showroom tiene **carácter propio fuerte** (Kevin, 3-oct-2026): se reconoce
  como producto de DAK aunque cambie el cliente. Cada proyecto aporta su acento
  de marca y su nombre.
- Primera pantalla **como el video de referencia de President Tower**: el
  edificio protagonista a pantalla completa y entrar a recorrerlo.
- Evitar: plantilla genérica, lujo exagerado (no es una torre de Miami) y
  esconder precios o disponibilidad.
- **Estándar de la categoría, ejecutado a fondo** (Kevin eligió el canon en la
  ronda de dirección, 3-oct-2026): showroom oscuro con el render a sangre, como
  Urbania 3D. Vara de acabado: **President Tower**
  (president-tower.urbania3d.app). El carácter propio sale del oficio y del
  material (renders, plantas, datos coherentes), no de un mundo excéntrico.

## Evidence on Hand

- Vitrina «Residencial Los Faiques» (marca de demo NORVIA, solo el nombre):
  4 renders exteriores, planta de piso amoblada, plantas y planos por tipología,
  5 panoramas 360. Todo producido por DAK y etiquetado como conceptual.
- Showroom privado de VARU I (Inmobiliaria Domaria): sus renders y sus 8 plantas
  reales; distribución, inventario y precios de ejemplo, marcados en pantalla.

**No es dato duro:** precios, estados e inventario de ambas demos son de
ejemplo. El Bono del Buen Pagador se muestra como referencial.

## Product Principles

1. La coherencia entre fachada, planta, ficha, recorrido y consulta vale más que
   cualquier efecto.
2. La disponibilidad y el precio se ven, no se esconden.
3. Lo que falta se dice («por confirmar»), nunca se inventa un cero.
4. Ningún dato de ejemplo puede confundirse con inventario real.

## Accessibility & Inclusion

Contraste AA, objetivos táctiles de 44 px, estados que no dependen solo del
color (texto y trama), navegación por teclado en la planta,
`prefers-reduced-motion` respetado.
