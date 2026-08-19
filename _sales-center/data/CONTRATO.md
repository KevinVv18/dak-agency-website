# Contrato de datos — Fase 0 cerrada

Derivado de la exportación real de **DAK LEADS MASTER** (31 columnas, 12 filas, todas del
15-ago-2026) y del inventario del MySQL inbound ([`INVENTARIO-INBOUND.md`](INVENTARIO-INBOUND.md)).

---

## 1. Lo que dice la hoja real, y por qué cambia el MVP

El brief partía de una premisa: *«el problema ya no es conseguir información, es priorizarla»*.
Con la hoja delante, esa premisa **no describe el estado actual**. Tres hechos medidos:

### Ningún prospecto es contactable hoy. Cero de doce.

| Columna | Filas con dato usable |
|---|---|
| Phone | **0 / 12** (las 12 dicen `UNVERIFIED`) |
| WhatsApp | **0 / 12** |
| Email | **0 / 12** (vacías) |
| Instagram · Facebook · TikTok · LinkedIn | **0 / 12** (vacías) |
| Decision Maker | 2 / 12, y ambos marcados `UNVERIFIED LEGACY CONTACT` |
| Decision Maker Position | **0 / 12** |

Los únicos dos teléfonos que existen en todo el archivo están **enterrados en prosa dentro de la
columna `Notes`** —`900814819`, `986495932`— vienen del archivo histórico de la Cámara y están
declarados sin verificar.

La investigación es buenísima: Charles Sutton con su primera subasta desierta, la sucursal nueva de
Delcrosa, la planta de Westfalia arrancando. Ángulos de venta concretos y fechados. Y no hay a quién
llamar en ninguno.

**El cuello de botella de DAK no es priorizar. Es contactar.** El propio sistema ya lo está midiendo
sin que nadie lo mire: `Contactability Score` va de **2 a 8**, y es el más bajo de los cinco
componentes en casi todas las filas.

### La hoja no tiene capa operativa. Ninguna.

No existen las columnas `Responsable`, `Próxima acción`, `Fecha de acción` ni `Última actividad`.
No están vacías: **no existen**.

DAK LEADS MASTER es un **informe de investigación**, no un CRM. Y eso significa que la vista
«Acciones de hoy» del brief —la que iba a ser el corazón del panel— **no tiene de dónde sacar una
sola fila**. No es un problema de datos incompletos: es que ese modelo no está en ningún sitio.

### El score es transparente, y eso es un regalo

`DAK Opportunity Score` = suma exacta de sus cinco componentes en **12 de 12 filas**:

```
Business Potential + Buying Signal + Marketing Opportunity + DAK Fit + Contactability
        20        +      21       +          16           +   16    +      4          = 77
```

No hay que confiar en el número: se puede **descomponer y enseñar por qué**. El panel muestra el
score como cinco barras, y ahí se ve de un vistazo que lo que hunde a los prospectos es siempre la
misma barra.

### Detalles menores del formato

- `Lead Temperature` y `Status` son **la misma columna duplicada** (idénticas en 12/12). Se lee una.
- Dos formas de fila conviven: **10 de señal pública** (en inglés, sin contacto histórico) y
  **2 de la Cámara de Comercio** (con notas en español y el teléfono viejo en `Notes`).
- Las 12 filas son del mismo día. Es un lote, no un flujo.

---

## 2. Qué se construye entonces

La navegación del brief se mantiene, pero **cambia cuál es la vista principal**.

| Brief original | Fase 0 dice | Resultado |
|---|---|---|
| «Acciones de hoy» como corazón | No hay responsable, ni acción, ni fecha en ninguna fuente | Se pospone hasta que existan esas columnas |
| «Prospectos» como tabla | Sí existe, y es rica | Se mantiene, con el score descompuesto |
| «Base Cámara» | Solo 2 de 12 filas | Ya estaba previsto: pasa a «Base», agnóstica |
| — | **0/12 contactables** | **Nueva vista principal: «Conseguir el contacto»** |

### La vista nueva: «Conseguir el contacto»

Cola de trabajo de enriquecimiento, ordenada por *cuánto valor se desbloquea al conseguir el dato*
—es decir, por los otros cuatro componentes del score, ignorando la contactabilidad. Por prospecto:

- **Qué falta**: teléfono · decisor · redes · email.
- **Dónde buscarlo**: los enlaces que la hoja **sí** tiene — `Website` (7/12) y `Google Maps URL`
  (9/12) son las dos pistas reales para conseguir un teléfono.
- **Qué hay de dudoso**: si existe un teléfono histórico en `Notes`, se muestra **extraído y
  etiquetado como sin verificar**, no escondido en un párrafo.
- **Abrir en la hoja**, para escribir el dato donde toca.

Esto convierte al panel en lo que DAK necesita este mes: no un tablero de prioridades sobre doce
filas que se leen de un vistazo, sino **la máquina de cerrar la brecha entre investigación y
llamada**.

---

## 3. El contrato

Congelado. Los componentes visuales solo conocen esto.

```ts
type SalesProspect = {
  id: string
  origen: 'inbound' | 'outbound'

  // Identidad. Outbound identifica empresa; inbound identifica persona.
  // Nunca son ambas. La UI muestra la que haya, jamas un hueco.
  empresa: string | null
  persona: string | null

  rubro: string | null
  ciudad: string | null
  fuente: 'Senal publica' | 'Camara' | 'Apollo' | 'Apify' | 'Reactivacion' | 'Manual'
        | 'Web' | 'Chat' | 'Calculadora' | 'WhatsApp' | 'Facebook' | 'Instagram'

  // --- Puntuacion. Las dos escalas NO se mezclan: ver regla 2 de AGENTS.md ---
  score: number | null              // outbound: DAK Opportunity Score (0-100)
  scoreDetalle: {                   // outbound: los cinco componentes, que suman `score`
    potencial: number
    senal: number
    oportunidad: number
    encaje: number
    contactabilidad: number
  } | null
  scoreBot: number | null           // inbound: lead_score del bot. Otra escala. No comparar.
  temperatura: 'STRONG' | 'QUALIFIED' | 'WARM' | null

  // --- Contactabilidad: el eje que resulto ser el cuello de botella ---
  contacto: {
    telefono: string | null
    whatsapp: string | null
    email: string | null
    decisor: string | null
    cargo: string | null
    redes: { instagram?: string, facebook?: string, tiktok?: string, linkedin?: string }
    verificado: boolean             // false = dato historico sin confirmar
    faltantes: Array<'telefono' | 'email' | 'decisor' | 'redes'>   // derivado, se etiqueta
  }

  // --- Investigacion: lo que Twin ya hace bien ---
  oportunidad: string | null        // Primary Opportunity
  senalCompra: string | null        // Buying Signal
  porQueAhora: string | null        // Why Now
  servicioSugerido: string | null   // Recommended First Service
  anguloVenta: string | null        // Sales Angle
  evidencia: string | null          // Evidence / Sources
  notas: string | null

  // --- Pistas para conseguir contacto ---
  web: string | null
  mapsUrl: string | null

  // --- Capa operativa. HOY NO EXISTE EN NINGUNA FUENTE. ---
  // Se declara para que la UI se disene con ella, pero llega null en todas las filas
  // hasta que la hoja tenga las columnas. Ver seccion 4.
  estado: 'Nuevo' | 'Investigado' | 'Listo para contactar' | 'Contactado'
        | 'En seguimiento' | 'Descartado' | null
  responsable: string | null
  proximaAccion: string | null
  fechaAccion: string | null
  ultimaActividad: string | null

  enlaceFuente: string | null       // fila en la hoja o registro de origen
  fechaDeteccion: string | null     // Date Found / created_at
}
```

Casi todo es `null`able porque casi todo llega nulo. **La UI se diseña contra los huecos, no contra
un caso ideal que no existe en ninguna de las dos fuentes.**

---

## 4. Lo que la hoja necesita para que el panel sirva de verdad

Cuatro columnas nuevas en DAK LEADS MASTER. Sin ellas, la capa operativa del panel llega vacía y
«Acciones de hoy» no se puede construir nunca:

| Columna | Valores | Para qué |
|---|---|---|
| `Owner` | nombre o vacío | Quién lo tiene. Sin esto no hay «sin responsable» |
| `Next Action` | texto libre | Qué toca hacer |
| `Next Action Date` | `YYYY-MM-DD` | Lo que hace posible «hoy» y «vencido» |
| `Last Activity` | `YYYY-MM-DD` | Detectar prospectos abandonados |

Se añaden **en la hoja**, no en el panel. El panel las lee. Si el panel las gestionara, habría dos
fuentes de verdad y la regla que sostiene todo esto se rompe.

---

## 5. Ficheros

```
_sales-center/data/
  muestra.csv               ← exportacion real. NO SE VERSIONA (.gitignore): telefonos privados
  normalizar.mjs            ← muestra.csv + inbound → mock.json
  mock.json                 ← lo que consume el adaptador. Telefonos redactados
  CONTRATO.md               ← este archivo
  INVENTARIO-INBOUND.md
```
