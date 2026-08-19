# Inventario de la mitad inbound

Fase 0, primera mitad. Campos reales de la base de leads entrantes de
`admin.dakagency.net` (MySQL `u567580447_dakagency_db`), inspeccionada en solo lectura el
**19-ago-2026**.

La otra mitad de la Fase 0 —la exportación de DAK LEADS MASTER— sigue pendiente. El contrato
`SalesProspect` **no se congela hasta tener las dos**.

## Tablas

`leads` · `conversations` (96 filas) · `quotes` · `services` · `extras`

Solo `leads` alimenta el panel en el MVP. `conversations` y `quotes` quedan para la vista de
detalle en una fase posterior.

## Campos de `leads`

| Campo | Tipo | Nota para el mapeo |
|---|---|---|
| `id` | int PK | |
| `phone` | varchar(20) **UNIQUE** | La identidad del lead es el teléfono. Sin teléfono no hay fila: el endpoint web fabrica un pseudo-teléfono `e`+sha1(email) |
| `name` | varchar(100) null | Persona, no empresa |
| `email` | varchar(150) null | |
| `channel` | enum `whatsapp,facebook,instagram,web` | |
| `industry`, `city` | varchar null | Se corresponden con `rubro` y `ciudad` |
| `objective` | text null | Lo más parecido a `oportunidadDetectada`, dicho por el propio lead |
| `budget` | enum `bajo,medio,alto,enterprise` | No existe en outbound |
| `client_profile` | enum `bajo,medio,alto` | |
| `lead_score` | int, default 0 | **Ojo: ver «los dos scores»** |
| `step` | enum de 11 pasos del bot | Embudo **conversacional**, no comercial |
| `status` | enum `new,active,qualified,converted,lost` | Lo más cercano a `estado` |
| `source` | varchar(50) null | Solo lo rellena el canal web |
| `services_interested` | longtext (JSON) | |
| `notes` | text null | |
| `followup_count` | int | |
| `last_message_at`, `created_at`, `updated_at` | datetime | `last_message_at` → `ultimaActividad` |

## Lo que esto cambia en el contrato

**1. Las dos mitades no identifican lo mismo.** Outbound es **centrado en empresa** (la fila es
una empresa de la Cámara). Inbound es **centrado en persona**: `phone` es la clave única y **no
existe ningún campo de empresa**. El contrato necesita `empresa: string | null` y una regla de
visualización explícita — cuando no hay empresa se muestra la persona, nunca un hueco ni un
«(sin nombre)».

**2. Hay dos sistemas de score y no se pueden sumar.** `lead_score` lo calcula el bot con su propia
escala (valores vistos: 0, 65, 70). Twin calcula lo suyo para outbound con otra. Meterlos en una
sola columna `score` hace que el contador de «alta prioridad» del Inicio no signifique nada.
**Se guardan separados y la prioridad se muestra por mitad, nunca mezclada.**

**3. `step` no es `estado`.** `step` es dónde se quedó la conversación con el bot
(`ASK_INDUSTRY`, `OFFER_CALL`…). `status` es el estado comercial. El panel mapea desde `status`;
`step` sirve para explicar *por qué* un lead está frío («se fue a mitad de la conversación»), que
es justo el tipo de dato que hace útil la vista de Hoy.

**4. `source` es NULL en todo lo que no sea web.** WhatsApp, Facebook e Instagram no lo rellenan.
El mapeo de `fuente` cae a `channel` cuando `source` es null.

## Estado real de los datos (19-ago-2026)

**14 leads en total.** No es un error de lectura: la mitad inbound está casi vacía.

| Canal | Estado | Filas |
|---|---|---|
| whatsapp | lost | 9 |
| web | new | 2 |
| whatsapp | new | 1 |
| facebook | lost | 1 |
| instagram | lost | 1 |

Los 11 `lost` son los leads de prueba que se cerraron a mano en julio al apagar el cron de
follow-ups. Lo que queda vivo son tres filas:

- **id 28** — WhatsApp, **17-ago-2026**, se quedó en `ASK_INDUSTRY` y ahí sigue. Nadie le ha
  escrito: los follow-ups están apagados (`FOLLOWUPS_ENABLED=false`) desde julio. Es un lead real
  de hace dos días esperando en una base que nadie mira. **Es exactamente el caso de uso que
  justifica este panel.**
- **id 22 y 23** — julio, `source: demo-inmobiliaria-chat`. Llegaron por el **demo inmobiliario**,
  no por la web principal.

Rango completo: del 06-mar-2026 al 17-ago-2026.

### El hook de la calculadora está intacto

`plan.dakagency.net/js/agendar.js` conserva la llamada a `/api/lead` con
`source: 'agendar-calculadora'` (archivo sin tocar desde el 4-jul). **Cero leads con esa fuente**
en la base. Eso significa una de dos cosas, y desde fuera no se distinguen: o nadie ha confirmado
una reunión por la calculadora desde el 3 de julio, o la llamada falla en silencio (es
fire-and-forget: si falla, no se entera nadie). Comprobarlo cuesta una reunión de prueba; queda
anotado, no diagnosticado.

## Lo que esto añade al mock

A las cinco filas feas del brief se suma una sexta condición, que resultó ser la realidad:

**la mitad inbound del panel tiene que verse bien con tres filas.** Un Inicio diseñado para
volumen se ve roto cuando el dato real son tres leads, y ese es el estado de hoy. La vista tiene
que hacer que tres leads parezcan tres leads que importan, no un dashboard vacío.

## Cómo se leyó esto

Solo lectura, sin escrituras ni cambios en el servidor. Credenciales tomadas del `.env` del
servidor en tiempo de ejecución (nunca copiadas aquí ni al repo):

```bash
ssh -p 65002 u567580447@89.116.115.11
# g() extrae una variable del .env sin imprimirla
mysql -h "$H" -u "$U" -p"$P" "$D" -e "DESCRIBE leads;"
```
