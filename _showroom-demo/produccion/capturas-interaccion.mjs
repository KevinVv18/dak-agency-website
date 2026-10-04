// Capturas de estados interactivos que una captura estática no muestra:
// hover en la columna de pisos, cursor sobre una franja de la fachada,
// flecha del recorrido 360 en cuadro y menú abierto.
//   node _showroom-demo/produccion/capturas-interaccion.mjs <base-url> <carpeta>

import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4340';
const salida = process.argv[3] || 'capturas';
await mkdir(salida, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// 1. hover sobre «4°» en la columna: se ilumina su franja en la fachada
await page.goto(`${base}/edificio/`, { waitUntil: 'networkidle0' });
await espera(1500);
await page.hover('.piso-pildora[data-piso="4"]');
await espera(600);
await page.screenshot({ path: join(salida, 'escritorio-edificio-hover-columna.png') });

// 2. cursor sobre la franja del piso 5 (rótulo que sigue al cursor)
const centro = await page.evaluate(() => {
  const r = document.querySelector('.franja[data-franja="5"]').getBoundingClientRect();
  return { x: r.left + r.width * 0.3, y: r.top + r.height / 2 };
});
await page.mouse.move(centro.x, centro.y);
await espera(600);
await page.screenshot({ path: join(salida, 'escritorio-edificio-hover-franja.png') });

// 3. de noche, misma vista
await page.click('[data-modo="noche"]');
await espera(1500);
await page.screenshot({ path: join(salida, 'escritorio-edificio-noche.png') });

// 4. recorrido 360 girado hasta que una flecha entra en cuadro
await page.goto(`${base}/departamento/502/?seccion=recorrido`, { waitUntil: 'networkidle0' });
await espera(3500);
const visor = await page.evaluate(() => {
  const r = document.querySelector('#visor360').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
for (let k = 0; k < 8; k++) {
  const visible = await page.evaluate(() => [...document.querySelectorAll('.pnlm-hotspot-base.pnlm-scene')].some((h) => h.style.visibility !== 'hidden' && h.getBoundingClientRect().width > 0 && h.getBoundingClientRect().left > 0));
  if (visible) break;
  await page.mouse.move(visor.x, visor.y);
  await page.mouse.down();
  await page.mouse.move(visor.x + 260, visor.y, { steps: 12 });
  await page.mouse.up();
  await espera(700);
}
await page.screenshot({ path: join(salida, 'escritorio-ficha-360-flecha.png') });

// 5. menú abierto
await page.goto(`${base}/piso/5/`, { waitUntil: 'networkidle0' });
await espera(1200);
await page.click('[data-menu]');
await espera(700);
await page.screenshot({ path: join(salida, 'escritorio-menu-abierto.png') });

// 6. móvil: vista desde el piso y menú
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`${base}/departamento/502/?seccion=vistas`, { waitUntil: 'networkidle0' });
await espera(1500);
await page.screenshot({ path: join(salida, 'movil-ficha-vista.png') });
await page.goto(`${base}/edificio/`, { waitUntil: 'networkidle0' });
await espera(1200);
await page.click('[data-menu]');
await espera(700);
await page.screenshot({ path: join(salida, 'movil-menu-abierto.png') });

await browser.close();
console.log('capturas de interacción listas en', salida);
