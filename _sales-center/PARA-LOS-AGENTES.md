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

## 4. La cola de peticiones del panel: `Panel Request`

Hay dos columnas nuevas en la pestaña **`Leads`**, y **las escribe el panel, no tú**:

| Columna | Quién escribe | Valores |
|---|---|---|
| `Panel Request` | El panel | `REQUESTED` o vacío |
| `Panel Request At` | El panel | fecha y hora, `AAAA-MM-DD HH:MM` |

Sirven para una sola cosa: que un humano pueda decir «a esta empresa escríbele el
mensaje antes que a las demás» sin tener que crear él la fila en la QUEUE.

> En cada corrida, antes de elegir a qué empresas les escribes el mensaje, mira
> la columna `Panel Request` de la pestaña `Leads`. **Las filas que digan
> `REQUESTED` van primero**, por delante de tu criterio de puntuación.
>
> Cuando ya le hayas escrito el mensaje y creado su fila en `DAK OUTREACH
> QUEUE`, **vacía su celda `Panel Request`**. Si no la vacías, esa empresa
> vuelve a salir la primera en cada corrida para siempre.
>
> No escribas nunca en estas dos columnas para nada más. No son tuyas.

Si una petición lleva días con `REQUESTED` y la empresa sigue sin fila en la
QUEUE, el panel lo enseña: significa que no has corrido o que no le tocó turno.
