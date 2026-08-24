# Contrato de datos — Fase 0

Derivado de las **cuatro pestañas** de DAK LEADS MASTER (exportadas el 19-ago-2026) y del
inventario del MySQL inbound ([`INVENTARIO-INBOUND.md`](INVENTARIO-INBOUND.md)).

> **Corrección respecto a la primera versión de este documento.** Se escribió con una sola
> pestaña (`Leads`) y concluía que no había ningún prospecto contactable y que no existía capa
> operativa. Ambas cosas son falsas del libro completo: los teléfonos verificados viven en
> `DAK OUTREACH QUEUE` y la capa operativa en `DAK DAILY OUTREACH`. Lo que sigue está escrito
> contra las cuatro.

---

## 1. El sistema real es un embudo de cuatro etapas

Cada pestaña es una etapa, y el paso de una a otra es una decisión. Con los números de hoy:

```
CAMARA REACTIVATION LOG          Leads              DAK OUTREACH QUEUE        DAK DAILY OUTREACH
      109 empresas         →    12 prospectos   →      8 con mensaje      →    3 aprobados
      minadas del padron        investigados          escrito y telefono        listos para enviar
                                                      verificado
      2 pasaron (1.8%)          ↑                     5 esperan aprobacion      0 ENVIADOS
                                └─────────────────────┘                          ↑
                                                                          aqui se para todo
```

### Dónde está el cuello de botella, medido

| Etapa | Filas | Estado |
|---|---|---|
| Investigados | 12 | ✅ Twin lo hace bien |
| Con teléfono verificado y mensaje escrito | 8 | ✅ `Contact Handle` en 8/8, con motivo documentado |
| **Esperando aprobación humana** | **5** | ⏳ `Human Review: PENDING` desde el **15-ago** |
| **Aprobados y sin enviar** | **3** | ⏳ `Send Status: NOT SENT`, `Sent At` vacío |
| Enviados | **0** | ❌ |

**El cuello de botella no es investigar, ni conseguir el contacto. Son las dos puertas humanas:
aprobar y enviar.** Ocho mensajes están escritos, con su enlace `wa.me` armado y su horario
recomendado, y ninguno ha salido. El de mayor `Outreach Readiness Score` de todo el lote —Acuña
Inmobiliaria, 94— es justamente uno de los que nadie ha aprobado.

Las dos son acciones de un clic. No se hacen porque viven en una hoja de 30 columnas donde no se
ven. **Eso es exactamente lo que arregla un panel**, y es lo que tiene que hacer el MVP.

### La reactivación de la Cámara tiene un rendimiento del 1,8 %

De 109 empresas procesadas: **75 REJECTED**, **32 NOT QUALIFIED - LOGGED ONLY**, **2 APPENDED TO
LEADS**. Y `Validated Phone` en **0 de 109** — la reactivación no consiguió un solo teléfono
(solo 8 webs). `Business Active?` sale `UNCERTAIN` en 75.

Es un dato que merece estar en pantalla: dice si vale la pena seguir minando ese padrón. La vista
**Base** existe para responder eso, no para listar 109 empresas rechazadas.

---

## 2. Qué se construye

Navegación: **Hoy · Prospectos · Base · Cómo funciona**

### Hoy — es la vista principal, y hoy tiene 8 filas reales

Dos colas, en este orden:

**a) Por aprobar (5).** Por cada una: la empresa, la señal de compra, el **mensaje completo tal
como se enviaría**, el canal y el horario recomendado, las dos objeciones previstas con su
respuesta, y los dos follow-ups ya redactados. Ordenadas por `Outreach Readiness Score`.
La decisión que se pide es leer y decir sí o no.

**b) Por enviar (3).** Por cada una: el `WhatsApp Link` como botón grande, el mensaje visible
para releerlo antes, el horario recomendado, y el dueño (`Owner`). Un toque abre WhatsApp con el
texto puesto.

**c) Esperando respuesta.** Vacía hoy. Se llena en cuanto algo se marque enviado, y se ordena por
`Next Follow-Up Due`.

> **Ojo con la escritura.** Aprobar y marcar-enviado **son escrituras**, y el MVP es de solo
> lectura. En v1 los botones abren la fila en la hoja y abren `wa.me`; la marca la pone la persona
> en Sheets. Que sea de solo lectura no impide que el panel sea el sitio donde se *decide*: impide
> que sea el sitio donde se *registra*. Ver §5.

### Prospectos
Tabla y detalle, con el score descompuesto en sus cinco componentes (suman exacto en 12/12) y la
etapa del embudo en la que está cada uno.

### Base
Rendimiento de las fuentes. Hoy: la Cámara rindió 2 de 109. Eso es la vista, no una lista.

### Cómo funciona
El diagrama de las cuatro etapas y qué agente actúa en cada una.

---

## 3. El contrato

Dos entidades, porque son dos cosas distintas: la empresa y el intento de contactarla.

```ts
type SalesProspect = {
  id: string
  origen: 'inbound' | 'outbound'
  etapa: 'investigado' | 'con-mensaje' | 'por-aprobar' | 'por-enviar'
       | 'enviado' | 'respondido' | 'descartado'

  empresa: string | null        // outbound identifica empresa...
  persona: string | null        // ...inbound identifica persona. Nunca ambas.
  rubro: string | null
  ciudad: string | null
  fuente: 'Senal publica' | 'Camara' | 'Apollo' | 'Apify' | 'Reactivacion' | 'Manual'
        | 'Web' | 'Chat' | 'Calculadora' | 'WhatsApp' | 'Facebook' | 'Instagram'

  // Puntuacion. Tres escalas distintas que NO se mezclan (regla 2 de AGENTS.md).
  score: number | null              // DAK Opportunity Score (0-100)
  scoreDetalle: { potencial: number, senal: number, oportunidad: number,
                  encaje: number, contactabilidad: number } | null   // suma = score
  readiness: number | null          // Outreach Readiness Score: listo para CONTACTAR
  readinessBand: 'PRIORITY OUTREACH' | 'READY' | null
  scoreBot: number | null           // inbound: lead_score del bot. Otra escala.
  temperatura: 'STRONG' | 'QUALIFIED' | null
  potencialNegocio: 'HIGH' | 'MEDIUM' | 'SMALL' | null   // Deal Potential

  contacto: {
    handle: string | null           // Contact Handle, ya verificado
    motivoCanal: string | null      // por que ese canal, en palabras
    canal: 'WHATSAPP' | 'EMAIL' | 'LLAMADA' | 'LINKEDIN' | null
    mejorMomento: string | null     // Best Timing
    verificado: boolean
  }

  // Investigacion (pestaña Leads)
  oportunidad: string | null
  senalCompra: string | null
  porQueAhora: string | null
  servicioSugerido: string | null
  anguloVenta: string | null
  evidencia: string | null
  web: string | null
  mapsUrl: string | null

  // Capa operativa (pestaña DAK DAILY OUTREACH)
  responsable: string | null        // Owner
  proximaAccion: string | null      // Next Action
  fechaSeguimiento: string | null   // Next Follow-Up Due
  enviadoEn: string | null          // Sent At
  estadoEnvio: 'NOT SENT' | 'SENT' | null
  estadoRespuesta: 'NO REPLY' | 'REPLIED' | null
  resumenRespuesta: string | null

  enlaceFuente: string | null
  fechaDeteccion: string | null
  dedupKey: string | null           // ya existe en la hoja: EMPRESA|telefono
}

// El intento de contacto. Vive aparte porque un prospecto puede tener varios
// a lo largo del tiempo, y porque es lo que se aprueba y se envia.
type OutreachMessage = {
  prospectoId: string
  estadoRevision: 'PENDING' | 'APPROVED' | 'REJECTED'
  etapa: 'OPENER' | 'FOLLOWUP_1' | 'FOLLOWUP_2'
  canal: 'WHATSAPP' | 'EMAIL'
  enlaceWhatsApp: string | null     // wa.me ya armado con el texto
  texto: string                     // el mensaje tal como se enviaria
  asuntoEmail: string | null
  cuerpoEmail: string | null
  ganchoValor: string | null        // Value Hook
  primeraOferta: string | null      // Suggested First Offer
  formaRelacion: 'PROYECTO + RETAINER' | 'RETAINER' | 'PROYECTO' | null
  ideaVenta: string | null
  objeciones: Array<{ objecion: string, respuesta: string }>
  seguimientos: Array<{ orden: 1 | 2, mensaje: string, angulo: string, plazo: string }>
}
```

## 4. Rendimiento de fuentes (pestaña Base)

```ts
type FuenteSalud = {
  fuente: string
  procesadas: number
  aceptadas: number
  rendimiento: number          // aceptadas / procesadas
  contactosValidados: number
  notas: string | null
}
```

Hoy la Cámara sale: `procesadas: 109, aceptadas: 2, rendimiento: 0.018, contactosValidados: 0`.

## 5. La escritura, y por qué se pospone bien

Aprobar y marcar-enviado son las dos acciones que desatascan el sistema, y las dos son escrituras.
El MVP no escribe. Eso **no** lo convierte en un callejón sin salida, porque las dos se pueden
hacer desde el panel sin que el panel escriba:

- **Enviar** ya es un enlace: `WhatsApp Link` abre WhatsApp con el texto puesto. El panel no
  necesita permisos para eso.
- **Aprobar** abre la fila en la hoja, en la celda `Human Review`.

Cuando toque escribir de verdad (Fase 4), es **un solo endpoint**: actualizar una celda
(`Human Review` o `Send Status`) por fila. Nada más. Un Apps Script publicado o una ruta en
`admin.dakagency.net`.

## 6. Ficheros

```
_sales-center/data/
  muestra-*.csv            ← las cuatro pestañas. NO SE VERSIONAN (.gitignore)
  normalizar.mjs           ← las cuatro + inbound → mock.json. Aborta si escapa un telefono
  mock.json                ← lo que consume el adaptador. Redactado
  CONTRATO.md · INVENTARIO-INBOUND.md
```

---

## 7. Agencia completa frente a soporte especializado (24-ago)

El sistema comercial cambió: ya no busca «buenos leads» sin más. Ahora distingue entre empresas
donde DAK puede ser **la** agencia y empresas donde solo puede entrar por **una pieza concreta**.
Son dos conversaciones distintas y dos mensajes distintos.

```ts
tipoOportunidad: 'Agencia completa' | 'Soporte especializado' | null
potencialLiderazgo: 1 | 2 | 3 | 4 | 5 | null   // cuánto puede DAK liderar el crecimiento
riesgoAgenciaExistente: 'Alto' | 'Medio' | 'Sin confirmar' | null
anguloEntrada: string | null
clasificacionDerivada: boolean                  // true = lo dedujo el panel, no la hoja
```

### ⚠️ Hoy esto se DEDUCE, y el panel lo dice

La hoja **todavía no tiene estas columnas**. Mientras no las tenga, el panel las deriva y las
marca en pantalla como «deducida por el panel». Eso no es una formalidad: si el equipo las toma
por dato de Twin y luego resulta que las dedujo el panel, la próxima vez no se creerá nada de lo
que ve.

La regla no sale de la nada. Se apoya en una señal que **los agentes ya escriben**: cuando el
Outreach Strategist redacta la objeción «Ya tenemos agencia o equipo que nos maneja las redes»,
está diciendo que detectó una estructura de marketing existente.

- menciona *corporativo* → riesgo **Alto**
- menciona *agencia / equipo que nos maneja* → riesgo **Medio**
- no menciona nada → **Sin confirmar**, nunca «Bajo». Que no aparezca la objeción no demuestra que
  no tengan agencia. Ausencia de prueba no es prueba de ausencia.

`potencialLiderazgo` combina ese riesgo con `Deal Potential`, y a partir de 4 la clasificación es
«Agencia completa».

### Lo que dice el resultado

**11 de 12 salen «Soporte especializado». Solo ARKANA es «Agencia completa».**

No es un fallo de la regla: es el retrato del pipeline actual. Está lleno de inmobiliarias grandes
y corporativos que ya tienen marketing — justo lo que la estrategia nueva dice de despriorizar. El
panel está enseñando que el Lead Hunter todavía caza con el criterio viejo.

### Para que deje de deducirse

Cuatro columnas en la pestaña `Leads` de DAK LEADS MASTER:

| Columna | Valores |
|---|---|
| `Opportunity Type` | `FULL AGENCY PROSPECT` / `SPECIALIZED SUPPORT PROSPECT` |
| `Agency Ownership Potential` | 1–5 |
| `Existing Agency Risk` | `LOW` / `MEDIUM` / `HIGH` / `UNKNOWN` |
| `Recommended Entry Angle` | texto |

En cuanto existan, se borra `clasificar()` de `normalizar.mjs` y se leen tal cual.

## 8. El idioma

Los agentes escriben `Buying Signal` y `Why Now` **en inglés** — las 12 filas. El panel es en
español, así que `traducciones.json` traduce las que ya existen.

**Es un parche y no escala:** cada lote nuevo del Lead Hunter llegará otra vez en inglés. El
arreglo de verdad es que el agente escriba en español desde el principio.
