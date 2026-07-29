# Vuelo de preventa — briefing previo a generar

> Carpeta **no desplegada** a propósito: `deploy-inmobiliaria.yml` solo sube
> `_inmobiliaria-demo/`. Esto es material interno, no debe quedar público.

Objetivo: revisar y aprobar lo creativo **antes** de gastar los ~$54 de render.
Cuando esto esté aprobado, la entrevista de la skill se responde con este
documento y la generación arranca sin improvisar.

---

## Estado de requisitos

| Requisito | Estado |
|---|---|
| ffmpeg / ffprobe 8.0.1 | ✅ |
| Python 3.14.3 + Pillow 12.1.1 (vía `py`) | ✅ |
| Node v24 | ✅ |
| Skill instalada (`.agents/skills/scroll-world`) | ✅ |
| **Monid CLI + saldo** | ❌ **falta cuenta** |
| **Higgsfield CLI + auth** | ❌ **falta cuenta** |

> Ojo: la skill exige Higgsfield autenticado **incluso usando Monid** (genera las
> imágenes fijas). O sea: **dos cuentas**, no una.

---

## Respuestas a la entrevista de la skill

**1. Sujeto.** Norvia Inmobiliaria — proyecto residencial en preventa en Chiclayo,
Lambayeque. Pitch: *«camina el proyecto antes de que exista»*.

**2. Kit de marca.** Heredado de la dirección **Editorial cálida** (la aspiracional
de las dos que ya están en vivo), para que el selector no parezca tres marcas:

| Rol | Hex |
|---|---|
| Oro | `#C9A86A` |
| Oro claro | `#E4CD9B` |
| Tinta | `#0C0E11` |
| Superficie | `#161A20` |
| Verde disponible | `#46C98D` |

Tono: sobrio, aspiracional, sin euforia de folleto.

**3. Dirección de arte — «Photoreal architectural»**, no el diorama de plastilina.
Es el preámbulo que la propia skill recomienda para inmobiliaria y lujo:

> *Ultra-photorealistic architectural photography of a single cohesive residential
> project, cinematic wide-angle, warm golden-hour light, natural materials,
> restrained designer furnishings, a breathtaking view, editorial magazine quality
> (Architectural Digest), shallow depth of field, no people.*

Implicaciones que trae ese modo:
- Escenas **a sangre**, sin isla flotante y **sin knockout** (nos saltamos ese paso)
- El «dive» entra **por puertas y cristal**, no abriendo el techo
- La cohesión sale del preámbulo idéntico; **no pasar `--image` de referencia**
  (clonaría la misma habitación)
- ⚠️ Los interiores disparan el filtro NSFW de Seedance a menudo → contar con
  re-rolls (la skill ya reserva ~15% de margen)

**4. Cámara.** «Fly through the world» → arquitectura B (dives + conectores).
Es la que permite salir de una escena y volar a la siguiente sin corte.

**5. Móvil.** **Sí** — cadena nativa 9:16. Es obligatorio: el demo se enseña en el
celular durante la reunión. Duplica el coste.

**6. Presupuesto.** Nivel estándar (`seedance_2_0`, 1080p). Ver tabla abajo.

---

## La cadena de escenas

De lo general a lo íntimo: el arco de la preventa.

| # | Escena | Copy en pantalla |
|---|---|---|
| 0 | **Aérea del terreno** — el lote con Chiclayo al fondo, la valla del proyecto, calles aún por trazar | Eyebrow: *Preventa · Etapa 1* — Título: **«Aquí todavía no hay nada. En 18 meses, hay una casa.»** |
| 1 | **Pórtico y calles** — ingreso, veredas, áreas verdes jóvenes, postes | *La urbanización* — **«Calles, veredas y áreas verdes. Con partida registral.»** |
| 2 | **Fachada de la casa modelo** — golden hour, materiales reales | *El modelo* — **«Así se ve la tuya desde la vereda.»** |
| 3 | **Sala-comedor** — el interior que aún no existe, entra por el cristal | *Por dentro* — **«El espacio donde va a pasar todo.»** |
| 4 | **Terraza / patio** — salida al exterior, luz de tarde | *El aire libre* — **«Tu metraje también está afuera.»** |
| 5 | **Cierre** — la llave sobre el plano, o la fachada al anochecer con luz encendida | *Siguiente paso* — **«Sepárala hoy.»** + CTA WhatsApp |

**Por qué esta cadena vende:** es exactamente el guion que hoy no se puede enseñar
cuando el prospecto no tiene piloto ni renders — el problema que `PITCH.md` ya
documenta en su checklist de descubrimiento.

---

## Coste

| Configuración | Escenas | Clips | Estimado |
|---|---|---|---|
| Prueba de calidad | 1 | 1 still + 1 dive | **~$5** |
| Cadena corta + móvil | 4 | 4 stills + 14 vídeos | **~$36** |
| **Cadena completa + móvil** | **6** | 6 stills + 22 vídeos | **~$54** |

Fórmula de la skill: `N stills + (2N−1) vídeos [×2 si móvil] + ~15% de re-rolls`.

**Recomendación: empezar por la prueba de 1 escena (~$5).** Si la calidad
fotorrealista no convence, paramos ahí en vez de descubrirlo con $54 gastados.

---

## Riesgo asumido: peso en el celular

El demo pesa hoy **4.2 MB**. La cadena completa ×2 añade **40–65 MB** de MP4.
En datos móviles, en plena reunión, eso puede atascarse justo en el momento de
lucirse. Mitigaciones acordadas en el plan: precargar solo la escena 0, móvil a
720p, fallback de póster con CTA si el vídeo no carga, y ensayar la carga antes
de entrar a la reunión.

Los MP4 **no van al repo** (50 MB de binario en git es permanente): se suben por
rsync directo y se gitignora `_inmobiliaria-demo/vuelo/media/`.
