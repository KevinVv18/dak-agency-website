/**
 * Auditoría de contraste WCAG AA sobre el render de verdad.
 *
 *   node scripts/auditar-contraste.mjs [base-url]
 *
 * Umbrales: 3:1 para texto grande (>=24 px, o >=18.66 px en negrita) y 4.5:1
 * para el resto. Sin esa distinción salen falsos positivos en cada titular.
 *
 * Dos cosas que una comprobación ingenua se deja, y que aquí se cuentan:
 *
 *  1. La OPACIDAD heredada. Un texto al 62 % sobre naranja no contrasta como su
 *     color declarado. Medir `getComputedStyle(e).color` a secas da un número
 *     que no existe en pantalla.
 *  2. El fondo EFECTIVO. Hay que subir por los ancestros hasta encontrar un
 *     color real; el elemento casi nunca lo declara.
 *
 * Lo que NO cuenta —y conviene saberlo— es el grano: se mezcla en `soft-light`
 * dentro de cada superficie y desplaza el tono unos pocos puntos. Por eso el
 * criterio de publicación es cero fallos, no «pasa por poco».
 */

import puppeteer from 'puppeteer'

const BASE = process.argv[2] || 'http://localhost:4174'

const RUTAS = [
  { nombre: 'secuencia', url: '/?modo=reconciliar&rol=audiovisual', w: 375, h: 812 },
  { nombre: 'entrada', url: '/?modo=jornada&rol=audiovisual', w: 375, h: 812 },
  { nombre: 'admin + POV', url: '/?rol=admin', w: 1440, h: 900, abrirPov: true },
]

function auditar() {
  const canal = (v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const rgb = (c) => c.match(/[\d.]+/g).map(Number)
  const lum = (c) => {
    const m = rgb(c)
    return 0.2126 * canal(m[0]) + 0.7152 * canal(m[1]) + 0.0722 * canal(m[2])
  }
  const mezclar = (fg, bg, a) => {
    const F = rgb(fg)
    const B = rgb(bg)
    return 'rgb(' + F.slice(0, 3).map((v, i) => Math.round(v * a + B[i] * (1 - a))).join(',') + ')'
  }
  const opacidad = (e) => {
    let a = 1
    let n = e
    while (n && n !== document.documentElement) {
      a *= Number(getComputedStyle(n).opacity)
      n = n.parentElement
    }
    return a
  }
  /*
   * Transparente se decide por el canal ALFA, no por la forma del texto.
   *
   * Esto estuvo como `/,\s*0\)$/`, que acierta en cualquier `rgb()` cuyo canal
   * AZUL sea cero. `rgb(24, 5, 0)` —el negro cálido de la marca, que es el
   * fondo de casi todos los botones— se daba por transparente, y el contraste
   * se medía contra el naranja de detrás: 1.29 en vez de 6.4. La auditoría
   * inventaba fallos justo en los elementos más importantes de la pantalla.
   */
  const fondoDe = (e) => {
    let n = e
    while (n && n !== document.documentElement) {
      const g = getComputedStyle(n).backgroundColor
      const partes = g ? g.match(/[\d.]+/g) : null
      const alfa = partes && partes.length > 3 ? Number(partes[3]) : 1
      if (partes && alfa > 0.02) return g
      n = n.parentElement
    }
    return 'rgb(2, 2, 2)'
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return Number(((x + 0.05) / (y + 0.05)).toFixed(2))
  }

  const fallos = []
  let n = 0
  let peor = { margen: 99 }

  document.querySelectorAll('body *').forEach((e) => {
    const propio = [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())
    if (!propio) return
    const s = getComputedStyle(e)
    if (s.visibility === 'hidden' || s.display === 'none') return
    const a = opacidad(e)
    if (a === 0) return

    const bg = fondoDe(e)
    const color = a < 1 ? mezclar(s.color, bg, a) : s.color
    const px = parseFloat(s.fontSize)
    const negrita = (parseInt(s.fontWeight, 10) || 400) >= 700
    const umbral = px >= 24 || (negrita && px >= 18.66) ? 3 : 4.5
    const r = ratio(color, bg)
    n++

    const margen = Number((r - umbral).toFixed(2))
    if (margen < peor.margen) {
      peor = {
        margen,
        ratio: r,
        umbral,
        px,
        opacidad: Number(a.toFixed(2)),
        clase: String(e.className).slice(0, 28),
        txt: e.textContent.trim().slice(0, 24),
      }
    }
    if (r < umbral) {
      fallos.push({
        txt: e.textContent.trim().slice(0, 26),
        clase: String(e.className).slice(0, 28),
        px,
        opacidad: Number(a.toFixed(2)),
        ratio: r,
        umbral,
      })
    }
  })

  return { revisados: n, fallos: fallos.length, menorMargen: peor, ejemplos: fallos.slice(0, 6) }
}

const navegador = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
let total = 0

for (const r of RUTAS) {
  const pagina = await navegador.newPage()
  await pagina.setViewport({ width: r.w, height: r.h })
  /*
   * Sin animaciones. No es cosmética: la entrada arranca en `opacity: 0`, y si
   * la medición cae a mitad del recorrido calcula el contraste de un color
   * mezclado con su fondo. Da 1.29 en elementos que en reposo pasan de sobra,
   * y manda a arreglar defectos que no existen.
   *
   * Lo que se audita es el estado en reposo, que es el que la gente lee.
   */
  await pagina.evaluateOnNewDocument(() => {
    const s = document.createElement('style')
    s.textContent =
      '*,*::before,*::after{animation:none !important;transition:none !important}'
    document.documentElement.appendChild(s)
  })
  await pagina.goto(BASE + r.url, { waitUntil: 'networkidle0' })
  await new Promise((x) => setTimeout(x, 900))

  if (r.abrirPov) {
    await pagina.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        x.textContent.includes('Ver su pantalla')
      )
      if (b) b.click()
    })
    await new Promise((x) => setTimeout(x, 900))
  }

  const res = await pagina.evaluate(auditar)
  total += res.fallos
  console.log(`${r.nombre}:`, JSON.stringify(res))
  await pagina.close()
}

await navegador.close()
console.log(
  total === 0 ? '\nAA: cero fallos.' : `\n${total} FALLOS de contraste. Cero es el criterio.`
)
process.exit(total === 0 ? 0 : 1)
