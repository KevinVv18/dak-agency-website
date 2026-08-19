# AGENTS.md

Reglas maestras para trabajar en este repositorio con Codex, Claude u otros agentes.

Este archivo es el contrato compartido. Si una regla de aquí choca con lo que parece más
cómodo en el momento, gana la regla: casi todas están escritas después de romper algo.

## Contexto del repo

Este repositorio contiene la web principal de DAK Agency (`dakagency.net`) y varios micrositios
o entregables relacionados.

El stack principal es:

- Vite 5 + React 18.
- `react-router-dom` para rutas de la SPA.
- CSS por componente y variables globales en `src/index.css`.
- Prerender obligatorio con `scripts/prerender.mjs`.
- Deploy a Hostinger mediante GitHub Actions y `rsync --delete`.

No hay servidor de aplicación propio en la SPA principal. Cualquier integración que requiera
secretos debe vivir fuera del frontend público.

## Producción y deploy

- No ejecutar deploys, pushes a `main`, cambios en GitHub Actions o cambios de configuración de
  Hostinger sin aprobación explícita.
- El deploy principal (`.github/workflows/deploy.yml`) usa **`rsync --delete` sobre
  `public_html/`**. Todo lo que viva ahí y no salga de `npm run build` desaparece en el siguiente
  push a `main`.
- Los `--exclude` de ese rsync **no se escriben a mano en el YAML**: se generan leyendo
  `deploy-protect.txt`, y un paso de guarda compara el contenido real del servidor contra esa
  lista antes de desplegar. Si aparece una carpeta sin proteger, el deploy **falla** en vez de
  borrarla. Ese es el punto.
- Por eso `deploy-protect.txt` no se toca salvo que el cambio trate exactamente de protección de
  deploy, y por eso una carpeta nueva se añade ahí **y se mergea a `main` el mismo día**. La regla
  existe porque ya se perdieron tres carpetas por saltársela: el demo inmobiliario, el micrositio
  de análisis y —detectado a tiempo— el demo de agroinsumos.
- Carpetas protegidas hoy: `blog/`, `blog-demo/`, `inmobiliaria/`, `analisis/`, `guias/`, `agro/`,
  `.builds/`, `application_backups/`. Ninguna se quita.
- Si se agrega una ruta pública real a la SPA, revisar también `scripts/prerender.mjs`,
  `public/sitemap.xml` y la estrategia de robots/canonical.

## Cómo se añade una superficie que no es la SPA

Es un patrón resuelto, no una decisión abierta. Ya funciona cuatro veces (`_analisis-microsite/`,
`_inmobiliaria-demo/`, `_guias/`, `_blog-demo/`). Cualquier panel, demo o entregable nuevo lo sigue:

1. Carpeta propia en la raíz del repo, con prefijo `_`.
2. Workflow propio `.github/workflows/deploy-<nombre>.yml`, que despliega **solo** su carpeta a
   **su** docroot.
3. Subdominio propio creado en hPanel (Hostinger lo coloca dentro de
   `domains/dakagency.net/public_html/<nombre>/`).
4. Entrada en `deploy-protect.txt`, mergeada a `main` de inmediato.
5. Si contiene datos reales de terceros: `noindex, nofollow` **y** un muro real (Basic Auth con
   `.htaccess` + `.htpasswd`). `noindex` por sí solo no es privacidad, es una petición educada.

**No se meten paneles internos como rutas de la SPA pública.** El docroot de `dakagency.net` no
tiene ninguna capa de autenticación y todo lo que vive ahí es alcanzable adivinando una URL.

## Alcance del DAK Sales Control Center

Nueva capa visual interna para el sistema comercial de DAK. Vive en `_sales-center/` y se publica
en `ventas.dakagency.net`. El brief completo está en `_sales-center/BRIEF.md`.

Fuente de verdad comercial:

- Twin.
- DAK LEADS MASTER en Google Sheets.
- Automatizaciones existentes conectadas a Apify, Apollo y otros flujos internos.
- **El MySQL de `admin.dakagency.net`**, que ya recibe los leads entrantes del chat widget, del
  formulario de contacto y de la calculadora de `plan.dakagency.net`.

La interfaz debe tratar esas fuentes como backend comercial y fuente de verdad. El dashboard no
reemplaza Google Sheets ni Twin; solo traduce sus datos a vistas más claras, priorizadas y
accionables.

## Límites sobre agentes comerciales existentes

No modificar, reescribir ni mover la lógica de estos agentes o flujos sin aprobación explícita:

- Lead Hunter.
- Database Reactivation.
- Outreach Strategist.
- Operations Manager.

Para el MVP se trabaja sobre una capa visual y un data adapter mockeado. Cualquier integración
futura con Google Sheets API debe aislarse detrás de un adaptador y **no debe exponer claves
privadas en el navegador**. El sitio donde pueden vivir esos secretos es `admin.dakagency.net`,
que ya tiene `.env` server-side y autenticación.

## Reglas de datos (aplican a cualquier panel que muestre datos comerciales)

Estas reglas existen para que las cifras del panel nunca discrepen de Twin. Un dashboard cuyas
cifras no cuadran con la hoja se deja de usar en una semana.

1. **El panel nunca inventa un número.** Todo dato mostrado viene de la fuente.
2. **Si un dato falta, se muestra «sin dato».** Nunca un cero, nunca un guion ambiguo, nunca un
   valor estimado. Un cero inventado es peor que un hueco honesto.
3. **Si el panel deriva algo** (un conteo, un orden, un agrupado), se etiqueta visiblemente como
   vista derivada y se puede rastrear hasta las filas que lo componen.
4. **Todo prospecto ofrece «de dónde salió esto»**: enlace a su fila en DAK LEADS MASTER o a su
   registro de origen.
5. **En modo mock, el panel lo dice en pantalla.** Sin ambigüedad posible.
6. **Los datos de prueba son feos a propósito**: filas sin responsable, sin teléfono, acciones
   vencidas, empresas duplicadas con dos grafías, campos de score vacíos. La UI se diseña contra
   la realidad, no contra un fixture limpio.

## Reglas de producto para el panel de ventas

- La interfaz debe estar en español.
- Debe sentirse como herramienta interna de operaciones comerciales, no como landing page.
- Reutilizar identidad DAK: fondo oscuro, morado, teal, Poppins, contraste AA y componentes
  responsivos.
- Priorizar lectura, acciones del día, filtros y estados por encima de animaciones o decoración.
- No mostrar información sensible de prospectos sin el muro de autenticación puesto.

## Reparto de trabajo entre agentes

La frontera es una **ruta de archivo**, no un tipo de tarea: así se puede comprobar mirando el
diff y dos agentes no se pisan.

| Superficie | Dueño |
|---|---|
| `_sales-center/src/**`, su CSS, vistas, filtros, estados, responsive | **Codex** |
| `_sales-center/data/**` y el contrato `SalesProspect` | **Claude** |
| `.github/workflows/**`, `deploy-protect.txt`, `.htaccess`, `.htpasswd`, subdominios, Hostinger | **Claude** |
| `AGENTS.md`, `CLAUDE.md` | **Claude escribe, todos obedecen** |

**Codex no toca workflows ni `deploy-protect.txt`.** Si necesita un cambio ahí, lo pide. No es
desconfianza: es que las reglas de esos archivos son cicatrices y el contexto de por qué existen
no cabe en un diff.

## Calidad antes de finalizar

- Mantener cambios pequeños y enfocados.
- Antes de implementar código funcional, presentar plan y esperar aprobación cuando el usuario lo pida.
- Para cambios visuales, revisar responsive móvil y escritorio.
- Antes de mergear cambios de la SPA principal, ejecutar como mínimo `npm run build` y, si aplica,
  `npm run auditar:movil`.
- Para cualquier superficie con fondo oscuro y tablas claras dentro, pasar
  `_analisis-microsite/auditar-contraste.js`. Cero fallos es el criterio de publicación.
