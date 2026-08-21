# CLAUDE.md

Contexto para agentes al trabajar en este repositorio.

**Las reglas maestras están en [`AGENTS.md`](AGENTS.md).** Léelo antes de cambiar nada. Este
archivo solo añade el objetivo en curso y los atajos de orientación.

## Lo que hay que saber en 30 segundos

- `dakagency.net` es una SPA de Vite + React que se despliega con **`rsync --delete`**. Todo lo
  que viva en `public_html/` y no salga de `npm run build` desaparece en el siguiente push a
  `main`, salvo que esté en `deploy-protect.txt`. Ya se perdieron tres carpetas así.
- Dentro de ese mismo docroot vive el **blog de WordPress**, administrado en vivo y **sin repo**.
  Si desaparece, no hay recuperación automática.
- Los paneles y entregables que no son la web pública **no van como rutas de la SPA**: van como
  micrositio con carpeta propia, workflow propio y subdominio propio. Ver «Cómo se añade una
  superficie que no es la SPA» en `AGENTS.md`.

## Objetivo actual

Construir el **DAK Sales Control Center**: la capa visual del sistema comercial de DAK.

- Brief y decisiones de producto: [`_sales-center/BRIEF.md`](_sales-center/BRIEF.md).
- Vive en `_sales-center/`, se publica en `ventas.dakagency.net` detrás de Basic Auth.
- MVP de solo lectura sobre datos mockeados, con el adaptador preparado para cambiar por dentro
  cuando lleguen los datos reales.

## Fuente de verdad comercial

La fuente de verdad **no es el dashboard**. Es:

- Twin.
- DAK LEADS MASTER en Google Sheets.
- El MySQL de `admin.dakagency.net` (leads entrantes del chat, el formulario y la calculadora).
- Las automatizaciones comerciales existentes.

El dashboard solo lee, normaliza, prioriza y traduce esa información para humanos. Las **reglas de
datos** que hacen que sus cifras nunca discrepen de Twin están en `AGENTS.md`.

## Límites estrictos

No modificar la lógica ni los flujos de Lead Hunter, Database Reactivation, Outreach Strategist ni
Operations Manager.

No conectar datos reales ni publicar información comercial sin el muro de autenticación puesto y
verificado.

## Reparto de trabajo

Codex es dueño de `_sales-center/src/**`. Claude es dueño del contrato de datos, los workflows,
`deploy-protect.txt`, la autenticación y todo lo que toque Hostinger. La tabla completa está en
`AGENTS.md`.

## Documentos de referencia del repo

- [`DESIGN.md`](DESIGN.md) y [`PRODUCT.md`](PRODUCT.md) — identidad y producto de la web principal.
- [`ROLLBACK.md`](ROLLBACK.md) — cómo deshacer un deploy.
- [`deploy-protect.txt`](deploy-protect.txt) — la lista que impide que el deploy borre medio servidor.
- [`_analisis-microsite/README.md`](_analisis-microsite/README.md) — el circuito de micrositios
  explicado con el caso de los informes de marca. Es el patrón que sigue `_sales-center/`.
