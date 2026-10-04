// Capturas del showroom en escritorio y móvil, para revisar el acabado.
//   node _showroom-demo/produccion/capturas.mjs <base-url> <carpeta-salida>
// Usa el Chromium de puppeteer (el panel del navegador no compone frames
// fuera de vista y recorta las capturas de escritorio).

import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4340';
const salida = process.argv[3] || 'capturas';
await mkdir(salida, { recursive: true });

const RUTAS = [
  ['portada', '/'],
  ['edificio', '/edificio/'],
  ['piso', '/piso/5/'],
  ['piso-tarjeta', '/piso/5/?d=502'],
  ['ficha', '/departamento/502/'],
  ['ficha-360', '/departamento/502/?seccion=recorrido'],
  ['catalogo', '/departamentos/'],
  ['modelos', '/modelos/'],
];
const VISTAS = { escritorio: { width: 1440, height: 900, deviceScaleFactor: 1 }, movil: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
for (const [nombreVista, viewport] of Object.entries(VISTAS)) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  for (const [nombre, ruta] of RUTAS) {
    await page.goto(base + ruta, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, nombre.includes('360') ? 3500 : 1600));
    const archivo = join(salida, `${nombreVista}-${nombre}.png`);
    await page.screenshot({ path: archivo });
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`${archivo}${desborde ? '  ⚠ desborde horizontal' : ''}`);
  }
  await page.close();
}
await browser.close();
