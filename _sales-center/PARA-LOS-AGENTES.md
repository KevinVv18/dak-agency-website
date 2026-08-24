# Lo que el panel necesita de los agentes

Dos peticiones para quien configura Lead Hunter y Outreach Strategist. Ninguna cambia la lógica de
los agentes: solo lo que escriben en DAK LEADS MASTER.

---

## 1. Escribir en español

**El problema, medido hoy sobre las 20 filas en vivo:**

| Columna | En inglés |
|---|---|
| `Industry` | 0/20 ✅ (lo arregla el glosario del panel) |
| `Primary Opportunity` | 16/20 |
| `Buying Signal` | 10/20 |
| `Why Now` | 16/20 |
| `Recommended First Service` | 17/20 |
| `Sales Angle` | 16/20 |

El panel traduce el **vocabulario cerrado** —rubros, nombres de servicio, prefijos de evidencia— con
un glosario que sí escala. Lo que **no** puede traducir es la prosa libre: cada lote nuevo llega
otra vez en inglés y no hay sustitución que lo arregle.

**Lo que hay que pedirle al agente**, literal:

> Escribe **en español de Perú** el contenido de estas columnas: `Primary Opportunity`,
> `Buying Signal`, `Why Now`, `Recommended First Service`, `Sales Angle`, `Evidence / Sources` y
> `Notes`.
>
> Mantén en inglés **solo** los valores de control que el sistema usa como códigos: `STRONG`,
> `QUALIFIED`, `APPROVED`, `PENDING`, `SENT`, `NOT SENT`, `PRIORITY OUTREACH`, `READY`, `HIGH`,
> `MEDIUM`, `SMALL`, `NOT FOUND`, `UNVERIFIED`.
>
> Los nombres propios de empresa se dejan tal cual.

Y una segunda cosa que ayuda mucho: **el nombre de la empresa, sin coletilla**. Hoy llegan como
`Acuña Inmobiliaria (Lambayeque investment dossier)` o `Sol de Lambayeque II (housing project)`. El
paréntesis está en inglés y se come media columna. Si sirve para desambiguar, que vaya en `Notes`.

---

## 2. Rellenar las redes sociales

Las columnas **ya existen** en la pestaña `Leads` y están **vacías en todas las filas**:
`Instagram`, `Facebook`, `TikTok`, `LinkedIn`.

El panel las pinta solas en cuanto aparezcan — no hay que tocar nada del código. Mientras estén
vacías, la ficha las enseña apagadas con el aviso «Faltan en la hoja», precisamente para que se vea
qué hay que buscar.

> Busca y rellena el perfil público de Instagram, Facebook, TikTok y LinkedIn de cada empresa.
> Pon la URL completa. Si no existe o no se encuentra, deja la celda vacía — **no** escribas
> `NOT FOUND` ni inventes un perfil parecido.

Un perfil inventado es peor que un hueco: el hueco dice «hay que buscarlo», el inventado hace que
alguien escriba al negocio equivocado.

---

## 3. Las cuatro columnas de la estrategia nueva (opcional pero recomendado)

Hoy el panel **deduce** el tipo de oportunidad y lo marca en pantalla como deducido. Deja de
deducir en cuanto la hoja traiga estas columnas en `Leads`:

| Columna | Valores |
|---|---|
| `Opportunity Type` | `FULL AGENCY PROSPECT` / `SPECIALIZED SUPPORT PROSPECT` |
| `Agency Ownership Potential` | 1–5 |
| `Existing Agency Risk` | `LOW` / `MEDIUM` / `HIGH` / `UNKNOWN` |
| `Recommended Entry Angle` | texto, en español |

Si no se puede determinar el riesgo, **`UNKNOWN`, nunca `LOW`**. Que no haya evidencia de agencia
no demuestra que no la tengan, y un `LOW` falso hace que DAK entre a vender agencia completa donde
no toca.

---

## 4. Las tres columnas del panel en `Leads`

Hay tres columnas nuevas en la pestaña **`Leads`**, y **las escribe el panel, no tú**:

| Columna | Valores |
|---|---|
| `Panel Status` | vacío · `REQUESTED` · `DRAFTED` · `APPROVED` · `REJECTED` · `SENT` |
| `Panel Opener` | el texto del mensaje, escrito por una persona |
| `Panel Status At` | fecha y hora, `AAAA-MM-DD HH:MM` |

Existen porque un prospecto en «investigado» no se podía mover sin ti: la etapa
se deduce de en qué hoja vive la fila, así que avanzar exigía que tú le
escribieras el mensaje y le crearas su fila en `DAK OUTREACH QUEUE`. Si tardabas,
no había nada que hacer.

Ahora una persona puede escribir el mensaje desde el panel. **Ese mensaje no
pasa por tu hoja**: vive en `Panel Opener`, y `Panel Status` lleva su recorrido
por el mismo embudo. Tú y el panel no escribís nunca en el mismo sitio.

Lo que necesitamos de ti son dos reglas, y la segunda evita pisar trabajo hecho:

> **1. `REQUESTED` va primero.** En cada corrida, antes de elegir a qué empresas
> les escribes el mensaje, mira `Panel Status` en `Leads`. Las que digan
> `REQUESTED` van por delante de tu criterio de puntuación. Cuando ya le hayas
> creado su fila en `DAK OUTREACH QUEUE`, **vacía su celda `Panel Status`**. Si
> no la vacías, esa empresa sale la primera en cada corrida para siempre.
>
> **2. `APPROVED` y `SENT` no se tocan.** Si `Panel Status` dice `APPROVED` o
> `SENT`, una persona ya aprobó o ya envió ese mensaje. **No le crees fila en la
> QUEUE.** Escribir un mensaje para alguien a quien ya se le escribió es, en el
> mejor caso, trabajo tirado; en el peor, un segundo mensaje al mismo negocio.
>
> Si `Panel Status` dice `DRAFTED`, hay un borrador humano sin aprobar todavía.
> Puedes encolarla, y entonces manda tu mensaje: se entiende que el tuyo mejora
> el borrador. Si el borrador te sirve, **reutiliza el texto de `Panel Opener`**
> en vez de empezar de cero.
>
> No escribas nunca en estas tres columnas para nada más. No son tuyas.

Y una cosa que sí ayuda mucho: **el nombre de la empresa tiene que ser idéntico**
en `Leads` y en la QUEUE. El puente busca por nombre exacto y, si encuentra dos
filas con el mismo nombre, **aborta sin escribir nada** — a propósito: escribir en
la fila equivocada es peor que no escribir.
