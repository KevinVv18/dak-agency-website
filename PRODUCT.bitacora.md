# Product — DAK Bitácora

<!-- impeccable:product-schema 1 -->

> **Alcance:** la herramienta interna de producción audiovisual que vive en
> `bitacora.dakagency.net`, con su código en [`_bitacora/`](_bitacora/). El sitio público tiene su
> propio registro en [PRODUCT.md](PRODUCT.md) y el demo inmobiliario el suyo en
> [PRODUCT.inmobiliaria.md](PRODUCT.inmobiliaria.md).

## Platform

web

## Users

**Usuario primario: Fabián**, el audiovisual de DAK. Monta en digital —Premiere, After Effects—
para las marcas propias (DAK, Vault) y para clientes. **La escena real de uso es el final de un
turno: de pie, con el teléfono en una mano, con prisa, a veces en la calle y en 4G.** No está
sentado, no tiene teclado, y no quiere estar aquí.

Abre la aplicación **una vez al día**, al terminar. Marca lo que pasó con cada pieza y se va. Si la
abre por la mañana, mira y no se le pide nada.

**Usuario secundario: los jefes** (`marketing@dakagency.net` y la socia). Escritorio, café de la
mañana. Quieren entender el estado de la producción en menos de treinta segundos sin preguntarle
nada a nadie, aprobar o pedir cambios sobre lo que espera su revisión, y poder mirar exactamente la
pantalla que Fabián tiene delante.

## Product Purpose

El problema **no es de control horario y decirlo importa**, porque cualquier decisión que huela a
vigilancia mata la herramienta: Fabián deja de usarla y no hay producto.

El problema es de **visibilidad operativa**. Hoy el estado de la producción vive en un informe de
WhatsApp en texto libre, y los jefes tienen que reconstruir mentalmente en qué punto quedó cada
pieza. Bitácora ya sabe lo que estaba pasando y solo pide confirmarlo.

Éxito = Fabián tarda menos de dos minutos en cerrar el día, y los jefes no vuelven a preguntar «¿en
qué vas?». Fracaso = una segunda herramienta que actualizar además de WhatsApp y ClickUp.

## Positioning

No compite con Jira, ClickUp ni Notion: compite con **el mensaje de WhatsApp**, y tiene que ser más
rápido que escribirlo. Por eso no hay time tracking, ni porcentajes de progreso, ni tableros que
arrastrar, ni una sola pantalla que pida rellenar un formulario.

> **Menos escribir. Más confirmar.**

## Operating Context

- **Una visita al día.** El «inicio de jornada» desapareció: la primera lectura del día abre la
  jornada y congela el plan. Dos rituales diarios eran uno más que olvidar.
- **Una pieza por pantalla.** Nunca hay más de una decisión a la vista, así que nunca hay scroll en
  la concha de Fabián.
- **WhatsApp sigue existiendo** para conversar y para mandar referencias. La aplicación es la fuente
  oficial del estado, y nada más. El informe se copia y se pega ahí.
- La aprobación de referencias la hace la socia **fuera de la aplicación**. Las piezas guardan
  `origen` para que el registro no finja lo contrario.

## Capabilities and Constraints

- **Vite + React** servido por una puerta **PHP 8.3** con **MySQL**, en el hosting compartido de
  Hostinger. Sin framework de servidor, sin ORM.
- **Todo pasa por una sola entrada.** `app/` (el build) y `lib/` (el código) están bloqueados por
  `.htaccess`; sin sesión no se sirve ni un asset ni una respuesta de la API. Las dos únicas
  excepciones son `robots.txt` y `/tipo/` (la tipografía y el grano de la pantalla de acceso, que
  se sirve precisamente a quien no tiene sesión).
- **Auth: Google Sign-In restringido por el campo `hd`** a `dakagency.net`. Un correo del dominio
  que no esté dado de alta entra como `pendiente` y **no pasa**. El alta es manual, a propósito.
- **`America/Lima` es la única zona horaria del negocio.** El servidor corre en UTC y un cierre a
  las 20:00 se registraría en el día siguiente, desalineando toda la continuidad entre días.
- **Nada muta una pieza sin escribir su evento en la misma transacción.** El historial es el modelo
  de almacenamiento, no una función añadida.
- **Fabián nunca cierra una pieza.** Su «Terminé mi parte» la manda a revisión; solo un admin la
  aprueba. Lo hace cumplir el servidor.
- **El espejo (POV) es de solo lectura y no escribe nada**, ni siquiera abre la jornada de quien se
  mira: un evento que Fabián no hizo destruiría el valor del registro.

## Brand Commitments

Vinculantes para esta superficie:

- **Paleta**: naranja de grano `#E94007` sobre negro tinta `#020202`, blanco perforado `#FDFDFD`.
  El naranja es **campo**, no filete: alrededor de un tercio de cada pantalla, medido en píxeles
  por `_bitacora/scripts/capturar.mjs`.
- **Tipografía**: **Archivo** variable condensada, autoalojada. Poppins queda para el sitio público;
  `PRODUCT.md` se declara de alcance `dakagency.net` y esta es otra superficie.
- **El logotipo DAK se queda.** Es lo único que ata visualmente esta herramienta a la marca, y basta.

## Evidence on Hand

- Datos de demostración **feos a propósito**: una pieza sin «último punto», una bloqueada hace
  cinco días, una esperando revisión hace tres, y una jornada que nadie cerró. La interfaz se
  diseña contra eso, no contra un fixture limpio.
- «Sin dato» es un estado de primera clase. Nunca un cero, nunca un guion ambiguo.
- No hay cifras comerciales ni afirmaciones que inventar: todo lo que muestra sale de la base.
