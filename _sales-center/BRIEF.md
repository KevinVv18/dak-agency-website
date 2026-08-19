# DAK Sales Control Center

Brief funcional del panel comercial interno de DAK. Se publica en `ventas.dakagency.net`.

Sustituye al borrador `DAK-SALES-CONTROL-CENTER.md` que vivió sin commitear en el worktree de
análisis de marca. Las decisiones que cambiaron respecto a aquel borrador están marcadas con
**[cambio]** y llevan su motivo: no son preferencias, son cosas que iban a romperse.

---

## 1. Qué es

DAK tiene un sistema comercial automatizado que encuentra prospectos, investiga empresas, detecta
oportunidades, prepara estrategia de contacto y organiza el trabajo comercial. El problema ya no es
conseguir información: es convertirla en algo que una persona pueda leer y actuar.

Este panel es **la capa visual de ese sistema**. No reemplaza Twin. No reemplaza DAK LEADS MASTER.
No cambia la lógica de ningún agente. Lee, normaliza y presenta.

```text
Twin + agentes + DAK LEADS MASTER  ──┐
                                     ├──►  contrato SalesProspect  ──►  ventas.dakagency.net
admin.dakagency.net (MySQL inbound) ─┘         (adaptador)              (Basic Auth + noindex)
```

## 2. Dónde vive **[cambio]**

El borrador lo ponía como ruta `/sales` dentro de la SPA pública. Se descarta:

- El docroot de `dakagency.net` **no tiene ninguna capa de autenticación**. Un panel de prospectos
  ahí está a una URL adivinada de distancia.
- Obliga a meter casos especiales en `scripts/prerender.mjs`, `public/sitemap.xml` y `robots.txt`
  para una ruta que jamás debe rastrearse.
- `noindex` no es privacidad. Es una petición educada.

**Decisión:** micrositio propio, siguiendo el patrón que ya funciona cuatro veces en este repo
(`_analisis-microsite/`, `_inmobiliaria-demo/`, `_guias/`, `_blog-demo/`):

| | |
|---|---|
| Código | `_sales-center/` — app Vite + React con su **propio `package.json`**, aislada de la SPA |
| Publicación | `ventas.dakagency.net` vía `.github/workflows/deploy-ventas.yml` |
| Protección | entrada `ventas/` en `deploy-protect.txt`, mergeada a `main` el mismo día |
| Muro | **Basic Auth (`.htaccess` + `.htpasswd`) desde el primer deploy**, no en la última fase |
| Rastreo | `noindex, nofollow, noarchive` + `robots.txt` con `Disallow: /` |

Va como app React y no como HTML plano —a diferencia de los informes de marca— porque tablas,
filtros, panel de detalle y estados de carga se vuelven inmanejables en vanilla, y esto está hecho
para crecer.

## 3. Las dos mitades del embudo **[cambio]**

El borrador modelaba solo prospectos **outbound** (Cámara, Apollo, Apify, reactivación). DAK
también captura leads **inbound**, y no aparecían por ningún lado:

- `POST /api/lead` en `admin.dakagency.net` (Express + MySQL, dedup por teléfono, fallback por email).
- El chat widget de la SPA y el formulario de contacto.
- `plan.dakagency.net` — al confirmar una reunión dispara un lead con `source: 'agendar-calculadora'`.

Un lead que llegó solo está más caliente que cualquier fila de la Cámara. El panel muestra las dos
mitades y el Inicio las separa explícitamente: **«vinieron solos»** frente a **«los buscamos
nosotros»**.

## 4. Usuarios y tono

Socios que necesitan una vista ejecutiva; equipo comercial que necesita saber a quién contactar, por
qué y con qué mensaje; operaciones, para ver bloqueos.

La interfaz va **en español**, con etiquetas claras: prospecto, prioridad, próxima acción,
responsable, estado comercial, oportunidad detectada, fuente, última actividad, acción sugerida.
Los nombres internos en inglés (Lead Hunter, Outreach Strategist) solo aparecen en «Cómo funciona».

## 5. Navegación **[cambio]**

> ⚠️ **Revisado tras la Fase 0.** La hoja real dice que **0 de 12 prospectos son contactables** y
> que **no existen las columnas de responsable, acción ni fecha**. «Hoy» no tiene de dónde sacar
> una fila, y la vista principal pasa a ser **«Conseguir el contacto»**. El razonamiento completo,
> con los números, está en [`data/CONTRATO.md`](data/CONTRATO.md) §1–2. Léelo antes de construir.

**Inicio · Contacto · Prospectos · Base · Cómo funciona**

(«Hoy» vuelve en cuanto la hoja tenga las cuatro columnas operativas de `CONTRATO.md` §4.)

«Base Cámara» era una pestaña de primer nivel dedicada a **una** de cinco fuentes; envejece mal en
cuanto Apollo, Apify e inbound tengan volumen. Se convierte en **«Base»**, agnóstica de la fuente,
que responde una sola pregunta: *¿qué parte de nuestra base está lista para vender y qué parte
todavía no?* — con la fuente como filtro.

### Inicio
Prospectos totales · de alta prioridad · acciones pendientes hoy · nuevos · sin responsable ·
embudo por estado · últimos movimientos · alertas (datos incompletos, acción vencida, contacto sin
seguimiento). Separado en inbound / outbound.

### Contacto **[nueva, y es la principal]**
Cola de enriquecimiento, ordenada por **cuánto valor se desbloquea al conseguir el dato** — es
decir, por los otros cuatro componentes del score, ignorando la contactabilidad. Por prospecto: qué
falta (teléfono · decisor · redes · email), dónde buscarlo (`Website` y `Google Maps URL`, las dos
únicas pistas que la hoja sí trae), el teléfono histórico **extraído de la prosa y etiquetado como
sin verificar** en vez de escondido, y «abrir en la hoja» para escribir el dato donde toca.

### Hoy — **pospuesta**
La cola diaria (acciones vencidas, responsable, canal) no se construye todavía: ninguna de sus
columnas existe en ninguna fuente. Vuelve cuando la hoja tenga las cuatro de `CONTRATO.md` §4.

### Prospectos
Tabla principal y detalle. El detalle **no** es un volcado de columnas: es un resumen humano.

- Qué sabemos.
- Por qué importa.
- Qué ofrecer.
- Cómo contactarlo.
- Riesgos o dudas.

### Base
Empresas detectadas, segmentación por rubro y ciudad, nivel de enriquecimiento, si ya pasaron por
investigación, si tienen datos suficientes para outreach, qué falta. Separa base cruda de base
vendible.

### Cómo funciona
Explica en español que Twin coordina, que DAK LEADS MASTER es la fuente de verdad operativa, qué
hace cada agente, y que este panel solo visualiza. Con diagrama del flujo y nota de alcance.

## 6. Solo lectura, pero no callejón sin salida **[cambio]**

El MVP **no escribe**. Pero si el trabajo real (marcar contactado, asignar responsable) solo se
puede registrar en la hoja, el equipo abre el panel una vez y vuelve a Sheets para siempre.

Tres acciones de coste cero que mantienen a la persona en un solo sitio:

- **«Abrir en la hoja»** — deep-link a la fila exacta de DAK LEADS MASTER (`#gid=…&range=A17`).
- **«Copiar mensaje»** — el ángulo de outreach al portapapeles, listo para WhatsApp.
- **«Copiar ficha»** — el resumen humano del prospecto en texto plano.

Canal de escritura futuro, nombrado ahora para no cerrarse la puerta: un Apps Script publicado con
un endpoint que actualiza una sola celda. Nada más.

## 7. Contrato de datos

> **Estado: borrador.** Se congela en la Fase 0, derivándolo de una exportación real de DAK LEADS
> MASTER. **[cambio]** El borrador anterior inventaba el modelo; si la UI se diseña contra un modelo
> inventado, el «mapper» de la fase de integración no es un mapper, es reescribir los componentes.

```ts
type SalesProspect = {
  id: string
  empresa: string
  rubro: string | null
  ciudad: string | null
  origen: 'inbound' | 'outbound'
  fuente: 'Camara' | 'Apollo' | 'Apify' | 'Reactivacion' | 'Manual'
        | 'Web' | 'Chat' | 'Calculadora' | 'WhatsApp'
  prioridad: 'Alta' | 'Media' | 'Baja' | null
  score: number | null
  estado: 'Nuevo' | 'Investigado' | 'Listo para contactar' | 'Contactado'
        | 'En seguimiento' | 'Descartado'
  responsable: string | null
  proximaAccion: string | null
  fechaAccion: string | null
  canalSugerido: 'WhatsApp' | 'Email' | 'Llamada' | 'LinkedIn' | 'Revision interna' | null
  oportunidadDetectada: string | null
  dolorProbable: string | null
  servicioSugerido: string | null
  resumenResearch: string | null
  ultimaActividad: string | null
  enlaceFuente: string | null   // fila en la hoja o registro de origen
  origenTecnico?: string
}
```

Casi todo es nullable a propósito: los datos reales vienen incompletos y la UI tiene que saberlo
desde el tipo. Las **reglas de datos** que gobiernan qué se muestra cuando un campo falta están en
[`../AGENTS.md`](../AGENTS.md) — resumen: nunca un cero inventado, siempre «sin dato».

## 8. Capa de datos

```text
_sales-center/
  data/
    muestra.csv        ← exportación real (anonimizada). No se versiona si trae datos de terceros.
    mock.json          ← derivado de muestra.csv, con las filas feas añadidas
    salesAdapter.js
```

`salesAdapter.js` expone funciones estables y es lo único que cambia cuando lleguen los datos reales:

- `getSalesOverview()`
- `getTodayActions()`
- `getProspects(filtros)`
- `getProspectById(id)`
- `getBaseHealth()`

Primera versión: lee `mock.json`, simula latencia ligera para poder probar estados de carga, no
llama a ninguna API.

Versión futura: se cambia el interior por un proxy en `admin.dakagency.net` (que ya tiene `.env`
server-side y autenticación) o un Apps Script publicado. **La llave de Google nunca va al
navegador.** Los componentes no se enteran.

## 9. El mock es feo a propósito **[cambio]**

Los dashboards no mueren con datos limpios, mueren con los reales. `mock.json` incluye,
obligatoriamente:

- prospectos sin responsable y sin teléfono;
- una acción vencida hace tres semanas;
- una empresa duplicada con dos grafías distintas;
- una fila que solo tiene nombre (la típica de la Cámara sin enriquecer);
- un campo de score vacío.

Si la UI se ve bien con esas cinco dentro, se verá bien en producción.

## 10. Fases

| Fase | Qué | Quién |
|---|---|---|
| **0 — Contrato** | Exportar DAK LEADS MASTER, inventariar los campos del MySQL inbound, congelar `SalesProspect`, generar `mock.json` con las filas feas | Claude |
| **1 — Estructura visual** | App Vite+React, adaptador mock, las cinco vistas, métricas, tablas, panel de detalle | Codex |
| **2 — UX operativa** | Filtros, búsqueda, estados vacío/carga/error, las tres acciones de coste cero, responsive móvil | Codex |
| **3 — Publicación privada** | Subdominio, `.htpasswd`, `deploy-ventas.yml`, `deploy-protect.txt` a `main` | Claude |
| **4 — Datos reales** | Proxy o Apps Script, cambio interno del adaptador, prueba de los 60 segundos | Claude |

## 11. Criterio de éxito **[cambio]**

«Un socio responde en menos de un minuto» era el instinto correcto sin forma de verificarlo. Se
convierte en una prueba que se puede correr, cronometrada, con alguien que **no** construyó el panel:

1. ¿A quién hay que contactar hoy? *(sin hacer scroll)*
2. ¿Por qué ese y no otro?
3. ¿Qué le digo?
4. ¿Cuántas empresas de la base todavía no sirven para vender?
5. ¿De dónde salió este dato?

Cinco respuestas correctas en menos de 60 segundos = MVP aprobado. Menos, se rediseña la vista que
falló.

## 12. Verificación antes de publicar

- **Guarda de deploy:** con `ventas/` en `deploy-protect.txt`, lanzar el deploy de la SPA y
  comprobar en el log del paso «Guarda anti-borrado» que `ventas` sale en *protegidas* y que nada
  queda en peligro.
- **Muro real:** `curl -I https://ventas.dakagency.net/` devuelve **401**, no 200.
- **No indexable:** `robots.txt` con `Disallow: /` y cabecera `X-Robots-Tag: noindex`.
- **SPA intacta:** `npm run build` en la raíz y comprobar que `dist/` no incorpora nada de aquí.
- **Contraste:** `_analisis-microsite/auditar-contraste.js` sobre cada vista. Cero fallos es el
  criterio de publicación, igual que en los informes de marca.
- **Móvil:** revisar a 375 px. `npm run auditar:movil` cubre la SPA, no este micrositio.
