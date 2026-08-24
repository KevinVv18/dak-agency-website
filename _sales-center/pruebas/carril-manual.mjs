import { construir } from '../src/lib/construir.js'

const CAB_LEADS = [
  'Business Name', 'City', 'Industry', 'Phone', 'WhatsApp', 'Email',
  'DAK Opportunity Score', 'Date Found', 'Notes',
  'Panel Status', 'Panel Opener', 'Panel Status At',
]
const fila = (nombre, estado, texto) => [
  nombre, 'Chiclayo', 'Retail', '+51 987654321', '', 'a@b.pe',
  '70', '2026-08-20', '', estado, texto, estado ? '2026-08-24 10:00' : '',
]

const CAB_QUEUE = ['Business Name', 'Human Review', 'Spanish WhatsApp/DM Opener', 'Recommended Channel', 'Outreach Readiness Score']
const CAB_DAILY = ['Business Name', 'Send Status', 'Reply Status', 'Sent At', 'Owner']

const armar = (filasLeads, filasQueue = [], filasDaily = []) => construir({
  leads: { cab: CAB_LEADS, datos: filasLeads },
  queue: { cab: CAB_QUEUE, datos: filasQueue },
  daily: { cab: CAB_DAILY, datos: filasDaily },
  camara: { cab: ['Business Name'], datos: [] },
  inbound: [],
  redactar: false,
})

const casos = []
const comprobar = (titulo, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado)
  casos.push({ ok, titulo, real, esperado })
}

// ── 1. Sin marca del panel: nada cambia ────────────────────────────────────
{
  const d = armar([fila('Sin Marca', '', '')])
  comprobar('sin Panel Status sigue en investigado', d.prospectos[0].etapa, 'investigado')
  comprobar('y no se le inventa mensaje', d.mensajes.length, 0)
}

// ── 2. El ciclo manual entero ──────────────────────────────────────────────
for (const [estado, etapa] of [['DRAFTED', 'por-aprobar'], ['APPROVED', 'por-enviar'], ['SENT', 'enviado'], ['REJECTED', 'descartado']]) {
  const d = armar([fila('Ciclo SA', estado, 'Hola, te escribo desde DAK.')])
  comprobar(`${estado} → ${etapa}`, d.prospectos[0].etapa, etapa)
  comprobar(`${estado} lleva mensaje marcado a mano`, d.mensajes[0]?.aMano, true)
}

// ── 3. REQUESTED no mueve la etapa: es una peticion, no un paso ────────────
{
  const d = armar([fila('Pedida SA', 'REQUESTED', '')])
  comprobar('REQUESTED sigue en investigado', d.prospectos[0].etapa, 'investigado')
  comprobar('REQUESTED no crea mensaje', d.mensajes.length, 0)
}

// ── 4. Estado sin texto: avanza la etapa pero no finge un mensaje ──────────
{
  const d = armar([fila('Vacia SA', 'DRAFTED', '')])
  comprobar('DRAFTED sin texto no inventa mensaje', d.mensajes.length, 0)
}

// ── 5. El enlace de WhatsApp se arma solo ──────────────────────────────────
{
  const d = armar([fila('Enlace SA', 'APPROVED', 'Hola, te escribo desde DAK.')])
  comprobar('enlace de WhatsApp armado', d.mensajes[0].enlaceWhatsApp?.startsWith('https://wa.me/51987654321?text='), true)
}

// ── 6. Twin encola despues: su mensaje sustituye al borrador, no convive ───
{
  const d = armar(
    [fila('Choque SA', 'DRAFTED', 'Borrador escrito a mano.')],
    [['Choque SA', 'PENDING', 'Mensaje de Twin.', 'WhatsApp', '80']],
  )
  comprobar('gana el mensaje de Twin', d.mensajes.map((m) => m.texto), ['Mensaje de Twin.'])
  comprobar('un solo mensaje, no dos', d.mensajes.length, 1)
  comprobar('etapa la manda la QUEUE', d.prospectos[0].etapa, 'por-aprobar')
}

// ── 7. Pero NO retrocede lo que una persona ya aprobó o envió ──────────────
{
  const d = armar(
    [fila('Aprobada SA', 'APPROVED', 'Mensaje mio, ya aprobado.')],
    [['Aprobada SA', 'PENDING', 'Mensaje de Twin.', 'WhatsApp', '80']],
  )
  comprobar('aprobado a mano no vuelve a por-aprobar', d.prospectos[0].etapa, 'por-enviar')
  comprobar('y conserva el mensaje de la persona', d.mensajes[0].texto, 'Mensaje mio, ya aprobado.')
}
{
  const d = armar(
    [fila('Enviada SA', 'SENT', 'Mensaje mio, ya enviado.')],
    [['Enviada SA', 'PENDING', 'Mensaje de Twin.', 'WhatsApp', '80']],
  )
  comprobar('enviado a mano no se deshace', d.prospectos[0].etapa, 'enviado')
}

// ── 8. La via de Twin, intacta ─────────────────────────────────────────────
{
  const d = armar(
    [fila('Solo Twin SA', '', '')],
    [['Solo Twin SA', 'APPROVED', 'Mensaje de Twin.', 'WhatsApp', '80']],
  )
  comprobar('APPROVED de Twin → por-enviar', d.prospectos[0].etapa, 'por-enviar')
  comprobar('el mensaje de Twin no se marca a mano', d.mensajes[0].aMano, undefined)
}
{
  const d = armar(
    [fila('Enviada Twin SA', '', '')],
    [['Enviada Twin SA', 'APPROVED', 'Mensaje de Twin.', 'WhatsApp', '80']],
    [['Enviada Twin SA', 'SENT', 'NO REPLY', '2026-08-23 09:00', 'Kevin']],
  )
  comprobar('SENT en DAILY → enviado', d.prospectos[0].etapa, 'enviado')
}

const fallos = casos.filter((c) => !c.ok)
for (const c of casos) console.log(`${c.ok ? '  ok  ' : ' FALLA'} ${c.titulo}${c.ok ? '' : `  → dio ${JSON.stringify(c.real)}, esperaba ${JSON.stringify(c.esperado)}`}`)
console.log(`\n${casos.length - fallos.length}/${casos.length} comprobaciones en verde`)
process.exit(fallos.length ? 1 : 0)
