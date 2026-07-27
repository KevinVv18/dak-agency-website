/* ─────────────────────────────────────────────────────────────────────────────
   cultivo.js — página de un cultivo con su programa fenológico completo.

   Diferencia deliberada con la portada: aquí el programa va DESPLEGADO ENTERO,
   no en pestañas. En la portada las pestañas están bien porque compiten con
   siete secciones más y hay que mostrar la idea rápido. En una página dedicada,
   esconder cuatro de cinco etapas detrás de un clic es un error: el contenido
   deja de ser indexable, no se puede imprimir para llevarlo al campo, y quien
   busca "programa de nutrición de arándano" no encuentra el texto que buscaba.

   La navegación de etapas queda como anclas pegajosas: se recorre igual de
   rápido y no se oculta nada.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import {
  lamina, migas, bloqueAsesoria, wa, tipoLbl, selloOrg,
  problemasDeCultivo, productosDeCultivo, producto
} from './comun.js';

const B = '../../';   // profundidad de /cultivos/<slug>/

function render(D, c, V) {
  const M = D.marca;
  const problemas = problemasDeCultivo(D, c.id);
  const productos = productosDeCultivo(D, c);

  /* Riel de anclas a las etapas. */
  const riel = c.etapas.length ? `
      <nav class="etapa-anclas" aria-label="Etapas del programa">
        ${c.etapas.map((e, i) => `<a href="#etapa-${i + 1}">
          <i>Etapa ${i + 1}</i><b>${esc(e.n)}</b>
        </a>`).join('\n        ')}
      </nav>` : '';

  /* Una sección por etapa, con su tabla completa. */
  const etapas = c.etapas.map((e, i) => `
      <section class="etapa-bloque" id="etapa-${i + 1}">
        <div class="etapa-bloque-h">
          <span class="etapa-bloque-n">Etapa ${i + 1} de ${c.etapas.length}</span>
          <h3>${esc(e.n)}${e.sub ? ` · <span>${esc(e.sub)}</span>` : ''}</h3>
          <span class="dur">${esc(e.dur)}</span>
        </div>
        <p class="etapa-objetivo">${esc(e.objetivo)}</p>
        <div class="tabla-wrap">
          <table class="aplic">
            <caption>Aplicaciones sugeridas — ${esc(e.n)}</caption>
            <thead><tr>
              <th scope="col">Producto</th><th scope="col">Dosis</th>
              <th scope="col">Frecuencia</th><th scope="col">Vía</th>
              <th scope="col">Admisibilidad</th>
            </tr></thead>
            <tbody>
              ${e.apps.map(a => {
                const p = producto(D, a.p);
                if (!p) { return '' }
                return `<tr>
                <td><a class="tabla-prod" href="${B}productos/${esc(p.slug)}/">
                  <span class="prod-n">${esc(p.n)}</span>
                  <span class="prod-cat">${esc(D.categorias[p.cat] || p.cat)} · ${esc(p.form)}</span>
                </a></td>
                <td class="dosis">${esc(a.d)}</td>
                <td>${esc(a.f)}</td>
                <td>${esc(p.via)}</td>
                <td>${selloOrg(p)}</td>
              </tr>`;
              }).join('\n              ')}
            </tbody>
          </table>
        </div>
      </section>`).join('\n');

  /* Las etapas van dentro de una sección con su propio h2: los bloques usan h3,
     y sin un h2 que los agrupe el documento salta de h1 a h3. */
  const cuerpo = c.listo ? `
      <section class="prob-sec prob-sec--suelto">
        <h2>El programa, etapa por etapa</h2>
        ${riel}
        <div class="etapas">
          ${etapas}
        </div>
        <p class="prob-nota">${esc(c.nota)} Las dosis son demostrativas: un programa real se
          ajusta con análisis de suelo, agua y foliar, y con un ingeniero agrónomo en campo.</p>
      </section>

      ${bloqueAsesoria(M, {
        icono: 'ciclo',
        titulo: `Ajustamos este programa a tu lote de ${c.n.toLowerCase()}`,
        texto: 'Con tu análisis de suelo y agua, la variedad y la fecha de trasplante, el programa cambia. Lo revisamos con el responsable de tu zona y te lo devolvemos afinado.',
        msg: `Hola, quiero ajustar el programa de ${c.n} a mi lote.`,
        cta: 'Pedir mi programa'
      })}

      <section class="prob-sec">
        <h2>Los ${productos.length} productos de este programa</h2>
        <ul class="prod-mini">
          ${productos.map(p => `<li><a class="prod-mini-item" href="${B}productos/${esc(p.slug)}/">
            <b>${esc(p.n)}</b>
            <span>${esc(D.categorias[p.cat] || p.cat)}</span>
            <em>${esc(p.dosis)}</em>
          </a></li>`).join('\n          ')}
        </ul>
      </section>` : `
      <div class="vacio">
        <p>${esc(c.nota)}</p>
        <p style="margin-top:.8rem">
          <a class="btn btn-line btn-sm" href="${B}cultivos/">Ver los cultivos con programa publicado</a>
        </p>
      </div>`;

  const contenido = `
  <div class="wrap">
    ${migas([
      { t: 'Inicio', href: B },
      { t: 'Cultivos', href: B + 'cultivos/' },
      { t: c.n }
    ])}
  </div>

  <article class="prob">
    <header class="prob-cab">
      <div class="wrap">
        <span class="rotulo"><b>Cultivo</b>${c.listo ? ` · ${c.etapas.length} etapas` : ' · programa en preparación'}</span>
        <h1>${esc(c.n)}</h1>
        <p class="prob-cien">${esc(c.cientifico)}</p>
        <p class="lead">${esc(c.resumen)}</p>
      </div>
    </header>

    <div class="wrap prob-grid">
      <div class="prob-cuerpo">
        ${cuerpo}
      </div>

      <aside class="prob-aside">
        ${lamina(M.laminas.programa, 'alta', B)}
        <a class="btn btn-solid prob-aside-cta" target="_blank" rel="noopener"
           href="${esc(wa(M, `Hola, me interesa el programa de ${c.n} del sitio de ${M.nombre}.`))}">
          Hablar con un asesor
        </a>
        <p class="prob-aside-nota">Respondemos con el responsable de tu zona.</p>
      </aside>
    </div>

    ${problemas.length ? `<section class="prob-rel">
      <div class="wrap">
        <div class="sec-h">
          <span class="rotulo">Diagnóstico</span>
          <h2>Qué se le presenta a este cultivo</h2>
          <p class="lead">Las ${problemas.length} fichas de campo que aplican a ${c.n.toLowerCase()}: cómo
            reconocer cada problema, con qué se confunde y qué aplicar.</p>
        </div>
        <ul class="rel-grid">
          ${problemas.map(p => `<li><a class="rel-card" href="${B}problemas/${esc(p.slug)}/">
            <span class="rel-tipo">${esc(tipoLbl(D, p.tipo))}</span>
            <b>${esc(p.n)}</b>
            <i>${esc(p.cien)}</i>
            <span class="rel-ir">Ver ficha ${icono('flecha')}</span>
          </a></li>`).join('\n          ')}
        </ul>
      </div>
    </section>` : ''}
  </article>`;

  const ruta = '/cultivos/' + c.slug + '/';
  const titulo = c.listo
    ? `Programa de nutrición y protección para ${c.n.toLowerCase()} — etapa por etapa · ${M.nombre}`
    : `${c.n} — programa en preparación · ${M.nombre}`;
  const desc = c.resumen.slice(0, 155);

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: titulo,
      description: desc,
      about: { '@type': 'Thing', name: c.n, alternateName: c.cientifico },
      inLanguage: 'es',
      isPartOf: { '@type': 'WebSite', name: M.nombreCompleto + ' (demo)', url: M.dominio + '/' },
      publisher: { '@type': 'Organization', name: 'DAK Agency', url: 'https://dakagency.net' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
        { '@type': 'ListItem', position: 2, name: 'Cultivos', item: M.dominio + '/cultivos/' },
        { '@type': 'ListItem', position: 3, name: c.n, item: M.dominio + ruta }
      ]
    }
  ];

  /* Las etapas se declaran como HowTo solo cuando el programa existe: un HowTo
     sin pasos sería marcado vacío y es peor que no ponerlo. */
  if (c.listo) {
    jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `Programa por etapa fenológica para ${c.n.toLowerCase()}`,
      description: desc,
      step: c.etapas.map((e, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: e.n,
        text: e.objetivo
      }))
    });
  }

  return pagina({
    D, V, base: B, ruta, titulo, desc, jsonld, contenido });
}

export { render };
