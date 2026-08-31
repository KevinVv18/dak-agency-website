# DAK Bitácora

Herramienta interna de producción audiovisual. Vive en **`bitacora.dakagency.net`**, detrás de
Google Sign-In restringido a `@dakagency.net`.

El problema que resuelve no es de control horario: es de **visibilidad operativa**. Hoy el estado
de la producción vive en un informe de WhatsApp en texto libre y los jefes tienen que reconstruir
mentalmente en qué punto quedó cada pieza. Bitácora ya sabe lo que estaba pasando y solo pide
confirmación.

> **Menos escribir. Más confirmar.**
> Abrir la jornada: menos de 20 segundos. Cerrarla: menos de dos minutos.

El plan completo y las decisiones de producto están en
`~/.claude/plans/c-users-kevin-onedrive-desktop-para-fabi-swift-newell.md`.

## Las tres reglas que sostienen todo

1. **Una tarea no cambia de estado porque nadie la mencione.** Si Fabián no habla de algo, ese algo
   sigue exactamente igual y la app pregunta al día siguiente. Nunca se cierra sola, nunca se
   degrada, nunca desaparece.
2. **Nada muta `piezas` sin escribir su fila en `eventos`, en la misma transacción.** El único
   camino es `moverPieza()` en [`gate/lib/eventos.php`](gate/lib/eventos.php). Un historial que se
   escribe «cuando toca» acaba con huecos justo en los cambios raros, que son los únicos que
   alguien va a querer investigar.
3. **Fabián nunca cierra nada.** Su botón «Terminé mi parte» lleva la pieza a `REVISION`. Solo un
   admin la mueve a `TERMINADO` aprobándola. Lo hace cumplir el servidor, en
   [`gate/lib/estados.php`](gate/lib/estados.php).

## Zona horaria: `America/Lima`, y no es un detalle

El servidor corre en UTC. Toda esta aplicación se sostiene sobre «¿de qué día es esto?». Un cierre
a las 20:00 de Lima guardado como 01:00 UTC se registra en el día siguiente, y a partir de ahí el
cierre no cierra la jornada de hoy, la reconciliación cree que ayer quedó abierto, y el informe
sale con la fecha equivocada. **Ninguno de esos fallos se ve en una prueba hecha por la mañana.**

Se fija una sola vez en [`gate/lib/entorno.php`](gate/lib/entorno.php), antes de que nada lea una
fecha, y la conexión MySQL habla en `-05:00`. La fecha de jornada es una columna `DATE` explícita:
nunca se deriva de un timestamp ni se calcula en el cliente.

## Arquitectura

```
bitacora.dakagency.net → /home/u567580447/domains/dakagency.net/public_html/bitacora/
│
├── index.php     ← ÚNICA puerta. Verifica sesión y luego:
│                    /api/*  → despacha al router
│                    resto   → sirve el archivo de app/
├── acceso.php  config.php  .htaccess  robots.txt
├── lib/          ← código del servidor.  BLOQUEADO por .htaccess
└── app/          ← el build de Vite.     BLOQUEADO por .htaccess
```

Una sola entrada significa una sola comprobación de sesión. No es un login pintado en el
navegador: es el servidor negándose a leer los archivos del disco. Sin sesión, `/app/*` y `/lib/*`
dan **403**, las rutas de la app dan **401**, y la API contesta **401 en JSON** para que el
frontend sepa distinguir «caducó la sesión» de «se rompió algo».

## Secretos

Viven en `/home/u567580447/secretos/bitacora.env`, `chmod 600`, **fuera de todo docroot**. No están
en el repo, no viajan en el build, y el `rsync --delete` del deploy no puede llevárselos porque no
están dentro de la carpeta que sincroniza. Los lee `secretos()` en `gate/lib/entorno.php`.

## Trabajar en local

```bash
npm install
npm run dev
```

El frontend solo necesita que la API responda. Para trabajar contra la de verdad hace falta un PHP
local sirviendo `publicar/` en el 8080 (el proxy ya está en `vite.config.js`). Sin él, `npm run dev`
levanta la interfaz igual pero las llamadas fallan.

## Base de datos

`u567580447_bitacora`. Esquema en [`sql/001-esquema.sql`](sql/001-esquema.sql), datos de arranque en
[`sql/002-semilla.sql`](sql/002-semilla.sql).

Los datos de demostración son **feos a propósito** (regla 6 de `AGENTS.md`): hay una pieza sin
«último punto», una bloqueada hace cinco días, una esperando revisión hace tres, una pausada por un
cliente y **una jornada que nadie cerró**. La interfaz se diseña contra eso, no contra un fixture
limpio donde todo cuadra. La jornada sin cerrar está puesta para que la reconciliación se vea
funcionando desde el primer login en vez de tener que provocarla a mano.

## Deploy

`.github/workflows/deploy-bitacora.yml`, al hacer push a `main` tocando `_bitacora/**`.

El workflow **falla cerrado**: comprueba que `bitacora/` sigue en `deploy-protect.txt`, pasa
`php -l` a todo, verifica que el `.htaccess` bloquea `app/` y `lib/`, que el Client ID está puesto,
y después del deploy comprueba **en vivo** que ni la app ni sus assets ni la API se sirven sin
sesión. Si algo de eso se rompe, el deploy se cae en vez de publicar la aplicación desnuda.

> ⚠️ El docroot vive **dentro** de `public_html/` de la SPA, cuyo deploy usa `rsync --delete`. Sin
> la entrada `bitacora/` en `deploy-protect.txt`, el siguiente push a `main` se lo lleva por
> delante. Ya pasó tres veces con otras carpetas.

## Pruebas

[`pruebas/continuidad.php`](pruebas/continuidad.php) recorre el carril entero contra la base de
verdad: no usa dobles, ejecuta el mismo código que la API y deja los mismos eventos. Se siembra a sí
misma antes de empezar, así que se puede repetir todas las veces que haga falta.

```bash
ssh -p 65002 u567580447@89.116.115.11 \
  "cd /home/u567580447/domains/dakagency.net/public_html/bitacora && /opt/alt/php83/usr/bin/php pruebas/continuidad.php"
```

Comprueba lo único que de verdad importa de esta aplicación: que una tarea que nadie menciona no
cambia de estado, que el cierre se niega a completarse a medias, que olvidar un día no pierde
información, y que la hora de negocio va cinco horas por detrás de UTC.

> ⚠️ **Escribe en la base.** Hoy es correcto porque solo hay datos de demo. El día que entren piezas
> reales, hay que apuntarla a una base de pruebas antes de volver a ejecutarla.

## Estado

- **Fase 0 — cimientos: hecha y verificada en vivo.** Subdominio, base, esquema, semilla, puerta,
  workflow. Muro comprobado: cero fugas.
- **Fase 1 — carril vertical: hecha.** Reconciliación de días olvidados, inicio de jornada con plan
  congelado, cierre guiado, plan de mañana, informe copiable y panorama de los jefes con veredicto
  de revisión a un toque. 37 comprobaciones en verde contra la base real.
- **Fase 2:** board/pipeline, alta rápida desde la interfaz, detalle de pieza con historial,
  configuración del umbral de cola.
- **Fase 3:** pasada de `/impeccable`, contraste AA, PWA, limpieza de notas con IA.
