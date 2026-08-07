/**
 * Prerender de la SPA.
 *
 * El problema que resuelve: `vite build` produce un index.html cuyo <body> es
 * solo `<div id="root"></div>`. Google renderiza JavaScript, pero en una segunda
 * pasada con retraso; GPTBot, ClaudeBot y PerplexityBot no lo ejecutan en
 * absoluto. Para ellos el sitio estaba vacio.
 *
 * Como funciona: levanta `vite preview` sobre dist/, visita cada ruta con un
 * navegador real, espera a que la red se calme y a que terminen las animaciones
 * de entrada, y vuelca el HTML resultante en dist/<ruta>/index.html.
 *
 * En el navegador del visitante, main.jsx usa createRoot y descarta este HTML
 * para renderizar desde cero. No se hidrata a proposito: ver el comentario
 * largo en src/main.jsx. El HTML estatico existe para los rastreadores, y para
 * que el visitante vea contenido pintado antes de que arranque el bundle.
 *
 * Se ejecuta despues de `vite build`, tanto en local como en CI.
 */
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import puppeteer from 'puppeteer'

const DIST = path.resolve('dist')

const SITIO = 'https://dakagency.net'

/**
 * Las rutas de src/App.jsx. Si se anade una <Route>, se anade aqui y en
 * public/sitemap.xml.
 *
 * `descripcion` es opcional y solo se usa donde la pagina merece una propia.
 * Cuando falta se conserva la de index.html. No se inventa copy: los textos de
 * aqui salen de la propia pagina.
 */
const RUTAS = [
  { ruta: '/' },
  {
    ruta: '/gallery',
    descripcion: 'Galería de trabajos de DAK Agency: branding, fotografía comercial, campañas y portadas para marcas de Chiclayo y Lambayeque.',
  },
  { ruta: '/privacidad' },
  { ruta: '/terminos' },
  { ruta: '/eliminacion-de-datos' },
]

/**
 * Quita src, poster, preload y autoplay de los <video> del volcado.
 *
 * El prerender corre en un viewport de escritorio, asi que congela las URLs de
 * Cloudinary a w_1600 (el hero pesa 1,9 MB y el que precarga el carrusel, 4,2 MB;
 * los posters, 36 KB cada uno). Ese HTML lo recibe tambien un movil, que empieza
 * a descargarlos antes de que arranque React — y cuando arranca, React elige las
 * variantes w_900 y los pide otra vez. Descarga doble, y la cara es la que sobra.
 *
 * Quitarlo no cuesta nada: main.jsx usa createRoot y descarta este DOM entero,
 * de modo que React vuelve a poner el src y el poster correctos para el viewport
 * real. Y a los rastreadores un src de video no les aporta nada; el texto sigue
 * intacto.
 */
function quitarFuentesDeVideo(html) {
  return html.replace(/<video\b[^>]*>/gi, (tag) =>
    tag
      .replace(/\ssrc="[^"]*"/gi, '')
      .replace(/\sposter="[^"]*"/gi, '')
      .replace(/\spreload="[^"]*"/gi, '')
      .replace(/\sautoplay(="[^"]*")?/gi, ''),
  )
}

/**
 * Corrige los metadatos que en una SPA son unicos para todo el sitio.
 *
 * index.html trae un solo canonical, og:url y twitter:url apuntando a la home,
 * y ese mismo archivo sirve todas las rutas. Antes del prerender apenas
 * importaba; ahora cada ruta es un HTML propio con contenido real, y dejar el
 * canonical de la home le estaria diciendo a Google que /gallery y las legales
 * son duplicados suyos, es decir, que no las indexe.
 */
function corregirMetadatos(html, { ruta, descripcion }) {
  const url = ruta === '/' ? `${SITIO}/` : `${SITIO}${ruta}`
  let out = html
    .replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${url}$2`)
    .replace(/(<meta property="twitter:url" content=")[^"]*(")/i, `$1${url}$2`)

  // El title lo fija la propia pagina cuando le importa (LegalPage lo hace).
  // Se sincroniza og:title y twitter:title con el que quedo en el documento.
  const title = out.match(/<title>([^<]*)<\/title>/i)?.[1]
  if (title) {
    out = out
      .replace(/(<meta property="og:title" content=")[^"]*(")/i, `$1${title}$2`)
      .replace(/(<meta property="twitter:title" content=")[^"]*(")/i, `$1${title}$2`)
  }

  if (descripcion) {
    out = out
      .replace(/(<meta name="description" content=")[^"]*(")/i, `$1${descripcion}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/i, `$1${descripcion}$2`)
      .replace(/(<meta property="twitter:description" content=")[^"]*(")/i, `$1${descripcion}$2`)
  }
  return out
}

const log = (...a) => console.log('[prerender]', ...a)
const fallar = (msg) => { console.error('[prerender] ERROR:', msg); process.exit(1) }

/** Pide al sistema un puerto libre, para no chocar con nada que ya escuche. */
function puertoLibre() {
  return new Promise((resolve, reject) => {
    const s = net.createServer()
    s.once('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })
}

/**
 * Mata el arbol de procesos completo.
 *
 * proc.kill() no basta: en Windows el hijo real es vite bajo un cmd.exe
 * intermedio y solo muere el intermedio, dejando el puerto ocupado para la
 * siguiente ejecucion. En Linux pasa lo mismo con el grupo de procesos.
 */
function matarArbol(proc) {
  if (!proc || proc.killed) return
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-proc.pid, 'SIGTERM')
    }
  } catch { /* ya estaba muerto */ }
}

/** Levanta `vite preview` en un puerto libre y espera a que responda. */
async function levantarServidor() {
  const port = await puertoLibre()
  const base = `http://127.0.0.1:${port}`
  const esWin = process.platform === 'win32'
  // --host 127.0.0.1 explicito: por defecto vite escucha en "localhost", que en
  // Windows puede resolverse solo a ::1, y entonces el sondeo por IPv4 nunca
  // encuentra el servidor y el arranque parece colgado.
  const proc = spawn(
    esWin ? 'npx.cmd' : 'npx',
    ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: esWin,
      detached: !esWin, // en POSIX crea grupo propio para poder matar el arbol
    },
  )
  let salida = ''
  proc.stdout.on('data', (d) => { salida += String(d) })
  proc.stderr.on('data', (d) => {
    const s = String(d)
    salida += s
    if (/error/i.test(s)) console.error('[vite preview]', s.trim())
  })

  const limite = Date.now() + 30_000
  while (Date.now() < limite) {
    if (proc.exitCode !== null) {
      fallar(`vite preview murio al arrancar:\n${salida.trim() || '(sin salida)'}`)
    }
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(2000) })
      if (r.ok) { log(`vite preview escuchando en ${base}`); return { proc, base } }
    } catch { /* aun arrancando */ }
    await new Promise((r) => setTimeout(r, 400))
  }
  matarArbol(proc)
  fallar(`vite preview no respondio en 30 s. Salida:\n${salida.trim() || '(vacia)'}`)
}

/**
 * Recorre la pagina entera para disparar las animaciones que dependen de
 * useInView, y luego vuelve arriba. Sin esto, todo lo que esta below-the-fold
 * se queda en su estado inicial (opacity: 0).
 */
async function recorrerPagina(page) {
  await page.evaluate(async () => {
    const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
    const paso = Math.round(window.innerHeight * 0.8)
    for (let y = 0; y < document.body.scrollHeight; y += paso) {
      window.scrollTo(0, y)
      await dormir(220)
    }
    window.scrollTo(0, document.body.scrollHeight)
    await dormir(700)
    window.scrollTo(0, 0)
    await dormir(500)
  })
}

/**
 * Diagnostico: que queda invisible tras las animaciones. No modifica nada;
 * solo informa para decidir con datos.
 */
async function auditarInvisibles(page) {
  return page.evaluate(() => {
    const invisibles = []
    for (const el of document.querySelectorAll('#root *')) {
      const inline = el.getAttribute('style') || ''
      const texto = (el.textContent || '').trim()
      if (!texto) continue
      const mOpacity = inline.match(/(?:^|;)\s*opacity:\s*([\d.]+)/)
      if (mOpacity && parseFloat(mOpacity[1]) < 0.1) {
        invisibles.push({
          tag: el.tagName,
          clase: String(el.className || '').slice(0, 45),
          opacity: mOpacity[1],
          texto: texto.slice(0, 55),
          ariaHidden: el.closest('[aria-hidden="true"]') ? 'si' : 'no',
          enDialogo: el.closest('[role="dialog"], .lightbox, .modal') ? 'si' : 'no',
        })
      }
    }
    return invisibles
  })
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    fallar('no existe dist/index.html — ejecuta `npm run build` antes')
  }

  const { proc: servidor, base: BASE } = await levantarServidor()
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const informe = []
  try {
    for (const entrada of RUTAS) {
      const { ruta } = entrada
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 900 })

      // Vigilar la llamada al REST de WordPress: si falla, la seccion de blog
      // quedaria congelada vacia en el HTML estatico.
      let blogOk = null
      page.on('response', (res) => {
        if (res.url().includes('/wp-json/wp/v2/posts')) blogOk = res.ok()
      })
      const erroresConsola = []
      page.on('pageerror', (e) => erroresConsola.push(String(e).slice(0, 160)))

      await page.goto(BASE + ruta, { waitUntil: 'networkidle2', timeout: 60_000 })
      await recorrerPagina(page)
      await new Promise((r) => setTimeout(r, 800))

      const invisibles = await auditarInvisibles(page)
      const html = quitarFuentesDeVideo(corregirMetadatos(await page.content(), entrada))
      const texto = await page.evaluate(() => document.body.innerText.trim().length)

      informe.push({ ruta, palabras: texto, invisibles, blogOk, erroresConsola, html })
      log(`${ruta.padEnd(24)} ${String(texto).padStart(6)} caracteres de texto · ${invisibles.length} elementos invisibles`)

      await page.close()
    }
  } finally {
    await browser.close()
    matarArbol(servidor)
  }

  // Los volcados se escriben AL FINAL, nunca durante el recorrido.
  //
  // Escribirlos sobre la marcha contamina las rutas siguientes: vite preview
  // resuelve /gallery por el fallback de SPA sirviendo dist/index.html, que
  // para entonces ya seria la instantanea de la home. React encuentra #root con
  // contenido, intenta hidratar el arbol de la home con el componente de
  // galeria y revienta con errores de hidratacion (#418, #423).
  for (const r of informe) {
    const destino = r.ruta === '/' ? DIST : path.join(DIST, r.ruta)
    await mkdir(destino, { recursive: true })
    await writeFile(path.join(destino, 'index.html'), r.html, 'utf8')
  }
  log(`escritos ${informe.length} volcados`)

  // ── Informe de diagnostico ────────────────────────────────────────────────
  console.log('\n[prerender] ── diagnostico ──')
  for (const r of informe) {
    console.log(`\n  ${r.ruta}`)
    console.log(`    texto: ${r.palabras} caracteres`)
    if (r.ruta === '/') console.log(`    fetch del blog: ${r.blogOk === null ? 'no se observo' : r.blogOk ? 'ok' : 'FALLO'}`)
    if (r.erroresConsola.length) console.log(`    errores JS: ${r.erroresConsola.join(' | ')}`)
    if (r.invisibles.length) {
      console.log(`    invisibles (${r.invisibles.length}):`)
      for (const i of r.invisibles.slice(0, 12)) {
        console.log(`      ${i.tag}.${i.clase} opacity=${i.opacity} dialogo=${i.enDialogo} — "${i.texto}"`)
      }
      if (r.invisibles.length > 12) console.log(`      ... y ${r.invisibles.length - 12} mas`)
    }
  }

  // ── Comprobaciones que detienen el build ──────────────────────────────────
  const home = informe.find((r) => r.ruta === '/')
  if (home.blogOk === false) {
    fallar('el REST de WordPress fallo durante el prerender: la seccion de blog quedaria congelada vacia en el HTML estatico')
  }
  for (const r of informe) {
    if (r.palabras < 500) fallar(`${r.ruta} solo tiene ${r.palabras} caracteres de texto: el volcado no capturo la pagina`)
    if (r.erroresConsola.length) fallar(`${r.ruta} lanzo errores de JavaScript durante el prerender`)
  }
  log('\nlisto.')
}

main().catch((e) => fallar(e.stack || String(e)))
