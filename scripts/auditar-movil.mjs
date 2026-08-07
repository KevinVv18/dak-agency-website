/**
 * Auditoria movil: area tactil, tamano de texto, contraste y desbordes.
 *
 * Se ejecuta con Chromium propio en vez de con el panel del navegador porque
 * ese panel, cuando no esta a la vista, no compone frames: requestAnimationFrame
 * no corre y las animaciones de framer-motion se quedan congeladas en su estado
 * inicial. Medido ahi, el hero aparecia con opacity 0 y desplazado 50 px, y eso
 * inventaba un scroll horizontal que no existe.
 *
 * Uso:  node scripts/auditar-movil.mjs [url]
 * Por defecto mide http://127.0.0.1:4173/ (npm run preview).
 */
import puppeteer from 'puppeteer'

const URL = process.argv[2] || 'http://127.0.0.1:4173/'
const ANCHO = 375
const PISO_TEXTO = 11
const PISO_TACTIL = 44

const medir = () => {
  const vw = document.documentElement.clientWidth

  // Area tactil real: la del elemento unida a la de su ::after ampliado.
  const areaEfectiva = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el, '::after')
    if (!cs.content || cs.content === 'none') return { w: r.width, h: r.height }
    const w = parseFloat(cs.width), h = parseFloat(cs.height)
    return { w: Math.max(r.width, isNaN(w) ? 0 : w), h: Math.max(r.height, isNaN(h) ? 0 : h) }
  }

  const ruta = (el) => {
    const c = []
    let n = el
    for (let k = 0; k < 3 && n; k++) { c.push(n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : '')); n = n.parentElement }
    return c.join(' < ')
  }

  const tactiles = []
  for (const el of document.querySelectorAll('a, button, [role=button], input, select, textarea')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') continue
    const a = areaEfectiva(el)
    if (a.w < 44 || a.h < 44) tactiles.push({ ruta: ruta(el), visual: Math.round(r.width) + 'x' + Math.round(r.height), tactil: Math.round(a.w) + 'x' + Math.round(a.h), txt: el.textContent.trim().slice(0, 18) })
  }

  const textos = []
  for (const el of document.querySelectorAll('body *')) {
    if (el.children.length || !el.textContent.trim()) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const fs = parseFloat(cs.fontSize)
    if (fs < 11) textos.push({ ruta: ruta(el), px: Math.round(fs * 10) / 10, txt: el.textContent.trim().slice(0, 22) })
  }

  // Contraste: solo se juzgan los casos con fondo solido determinable.
  const rel = ([r, g, b]) => { const s = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }); return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2] }
  const parse = (s) => { const m = String(s).match(/[\d.]+/g); return m ? { rgb: m.slice(0, 3).map(Number), a: m[3] !== undefined ? Number(m[3]) : 1 } : null }
  const mezcla = (fg, a, bg) => fg.map((v, i) => v * a + bg[i] * (1 - a))
  const fondoDe = (el) => {
    let n = el
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null
      const p = parse(cs.backgroundColor)
      if (p && p.a >= 0.95) return p.rgb
      if (p && p.a > 0) return null
      n = n.parentElement
    }
    return [0, 0, 0]
  }
  const contraste = []
  const vistos = new Set()
  for (const el of document.querySelectorAll('p,span,a,li,h1,h2,h3,h4,h5,h6,button,label,small')) {
    if (el.children.length || !el.textContent.trim()) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.5) continue
    if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue
    const fg = parse(cs.color); if (!fg) continue
    const bg = fondoDe(el); if (!bg) continue
    const fs = parseFloat(cs.fontSize)
    const necesita = (fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight) >= 700)) ? 3 : 4.5
    const clave = String(el.className || el.tagName).split(' ')[0] + '|' + Math.round(fs)
    if (vistos.has(clave)) continue
    vistos.add(clave)
    const c = mezcla(fg.rgb, fg.a, bg)          // el alpha del texto cuenta
    const L1 = rel(c), L2 = rel(bg)
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    if (ratio < necesita) contraste.push({ el: clave, ratio: Math.round(ratio * 100) / 100, necesita, txt: el.textContent.trim().slice(0, 20) })
  }

  const desbordes = []
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0) continue
    const cs = getComputedStyle(el)
    if (cs.position === 'fixed' || ['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) continue
    if (r.right > vw + 2 || r.left < -2) desbordes.push(ruta(el) + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']')
  }

  return {
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHorizontal: document.documentElement.scrollWidth > vw + 1,
    tactiles, textos, contraste,
    desbordes: [...new Set(desbordes)],
  }
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: ANCHO, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60_000 })

// Dejar que terminen las animaciones de entrada y las que dependen de scroll.
await page.evaluate(async () => {
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
  await dormir(2500)
  const paso = Math.round(window.innerHeight * 0.8)
  for (let y = 0; y < document.body.scrollHeight; y += paso) { window.scrollTo(0, y); await dormir(240) }
  window.scrollTo(0, 0)
  await dormir(1500)
})

// Comprobar que en este entorno SI corren los frames; si no, la medida no vale.
const framesOk = await page.evaluate(async () => {
  const t0 = performance.now(); let n = 0
  const tick = () => { n++; if (performance.now() - t0 < 500) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
  await new Promise((r) => setTimeout(r, 700))
  return n
})
if (framesOk < 5) { console.error(`ABORTA: requestAnimationFrame no corre (${framesOk} frames). La medida no seria fiable.`); await browser.close(); process.exit(1) }

const r = await page.evaluate(medir)
await browser.close()

const linea = (s) => console.log('  ' + s)
console.log(`\n=== Auditoria movil ${ANCHO}px — ${URL} ===`)
console.log(`(${framesOk} frames en 500 ms: las animaciones corren de verdad)\n`)

console.log(`SCROLL HORIZONTAL: ${r.scrollHorizontal ? 'SI (' + (r.scrollWidth - r.vw) + 'px de exceso)' : 'no'}`)
console.log(`\nAREA TACTIL bajo ${PISO_TACTIL}px: ${r.tactiles.length}`)
r.tactiles.slice(0, 12).forEach((t) => linea(`${t.tactil.padEnd(9)} ${t.ruta}  "${t.txt}"`))
console.log(`\nTEXTO bajo ${PISO_TEXTO}px: ${r.textos.length}`)
r.textos.slice(0, 12).forEach((t) => linea(`${(t.px + 'px').padEnd(8)} ${t.ruta}  "${t.txt}"`))
console.log(`\nCONTRASTE por debajo de AA: ${r.contraste.length}`)
r.contraste.forEach((c) => linea(`${String(c.ratio).padEnd(6)} (necesita ${c.necesita})  ${c.el}  "${c.txt}"`))
console.log(`\nDESBORDES del viewport: ${r.desbordes.length}`)
r.desbordes.slice(0, 10).forEach(linea)
console.log('')

const fallos = r.tactiles.length + r.textos.length + r.contraste.length + (r.scrollHorizontal ? 1 : 0)
process.exit(fallos > 0 ? 2 : 0)
