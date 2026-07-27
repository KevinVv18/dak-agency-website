/* ─────────────────────────────────────────────────────────────────────────────
   problema.js — página individual de plaga, enfermedad o desorden.

   Es la plantilla más importante del sitio. El orden de las secciones no es
   decorativo, es la lógica que hace fuerte a una página de referencia:

     1. identificar   — el visitante llega con un síntoma, no con un producto
     2. por qué pasa  — entender la causa es lo que evita repetir el error
     3. con qué se confunde — el bloque que de verdad usa un agrónomo
     4. qué hacer     — recién aquí aparece el catálogo, cuando ya ayudamos
     5. en qué cultivos y qué problemas se parecen

   Vender antes de ayudar es lo que hace que una ficha técnica se lea como un
   folleto. Ayudar primero es también lo que la hace posicionar: quien busca
   "hojas amarillas en arándano" es muchísima más gente que quien busca
   "quelato de hierro EDDHA".
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { lamina, migas, bloqueAsesoria, wa, tipoLbl, cultivoN } from './comun.js';

const B = '../../';   // profundidad de /problemas/<slug>/

function render(D, s) {
  const M = D.marca;
  const tipo = tipoLbl(D, s.tipo);

  /* Productos recomendados. Cada uno abre su ficha en el modal, que core.js
     resuelve con el delegado global de [data-ficha] en cualquier página. */
  const acciones = s.prods.map(r => {
    const p = D.productos.find(x => x.id === r.p);
    if (!p) { return '' }
    return `<li class="accion">
        <div class="accion-cab">
          <button type="button" class="accion-n" data-ficha="${esc(p.id)}">
            ${esc(p.n)} ${icono('ficha')}
          </button>
          <span class="accion-dosis">${esc(p.dosis)}</span>
        </div>
        ${r.momento ? `<p class="accion-momento">${esc(r.momento)}</p>` : ''}
        <p class="accion-via"><span>${esc(p.via)}</span><span>${esc(p.carencia)}</span></p>
      </li>`;
  }).join('\n      ');

  const relacionados = (s.relacionados || []).map(id => {
    const r = D.problemas.find(x => x.id === id);
    if (!r) { return '' }
    return `<li><a class="rel-card" href="${B}problemas/${esc(r.slug)}/">
        <span class="rel-tipo">${esc(tipoLbl(D, r.tipo))}</span>
        <b>${esc(r.n)}</b>
        <i>${esc(r.cien)}</i>
        <span class="rel-ir">Ver ficha ${icono('flecha')}</span>
      </a></li>`;
  }).join('\n      ');

  const contenido = `
  <div class="wrap">
    ${migas([
      { t: 'Inicio', href: B },
      { t: 'Problemas', href: B + 'problemas/' },
      { t: s.n }
    ])}
  </div>

  <article class="prob">
    <header class="prob-cab">
      <div class="wrap">
        <span class="rotulo"><b>${esc(tipo)}</b></span>
        <h1>${esc(s.n)}</h1>
        <p class="prob-cien">${esc(s.cien)}</p>
        <p class="lead">${esc(s.resumen)}</p>
      </div>
    </header>

    <div class="wrap prob-grid">
      <div class="prob-cuerpo">

        <section class="prob-sec">
          <h2>Cómo se reconoce en campo</h2>
          <ul class="lista-senal">
            ${s.senal.map(x => `<li>${esc(x)}</li>`).join('\n            ')}
          </ul>
          ${s.img ? lamina({
            src: s.img, n: 'Referencia', alt: s.imgAlt, pie: s.imgPie
          }, 'ancha', B) : ''}
        </section>

        <section class="prob-sec">
          <h2>Por qué ocurre</h2>
          <p>${esc(s.causa)}</p>
        </section>

        ${s.confusion ? `<section class="prob-sec prob-sec--confusion">
          <h2>${icono('alerta')} Con qué se confunde</h2>
          <p>${esc(s.confusion)}</p>
        </section>` : ''}

        ${s.cuando ? `<section class="prob-sec">
          <h2>Cuándo aparece</h2>
          <p>${esc(s.cuando)}</p>
        </section>` : ''}

        <section class="prob-sec">
          <h2>Qué hacer</h2>
          <p class="prob-nota">Del catálogo, para este caso. Las dosis son demostrativas: un
            programa real se ajusta con análisis de suelo, agua y foliar.</p>
          <ul class="acciones">
            ${acciones}
          </ul>
        </section>

        ${bloqueAsesoria(M, {
          icono: 'zona',
          titulo: 'Con una foto y un análisis alcanza para empezar',
          texto: 'Nuestro equipo revisa el caso con el responsable de tu zona y te devuelve un programa ajustado a tu lote, no una lista de productos.',
          msg: `Hola, tengo un caso de ${s.n} en campo y quiero asesoría técnica.`,
          cta: 'Consultar mi caso'
        })}

        <section class="prob-sec">
          <h2>En qué cultivos lo vemos</h2>
          <ul class="chips">
            ${s.cultivos.map(id => {
              const c = D.cultivos.find(x => x.id === id);
              /* Solo enlaza a los cultivos cuyo programa existe; los demás van
                 como etiqueta, sin prometer una página que no está escrita. */
              return c && c.listo
                ? `<li><a class="chip chip--link" href="${B}#programa">${esc(c.n)} ${icono('flecha')}</a></li>`
                : `<li><span class="chip">${esc(cultivoN(D, id))}</span></li>`;
            }).join('\n            ')}
          </ul>
        </section>

      </div>

      <aside class="prob-aside">
        <div class="prob-ficha">
          <div class="prob-ficha-h"><span>Ficha</span><span>${esc(tipo)}</span></div>
          <dl>
            <dt>Agente</dt><dd>${esc(s.cien)}</dd>
            <dt>Aparece en</dt><dd>${esc(s.cultivos.map(id => cultivoN(D, id)).join(', '))}</dd>
            <dt>Del catálogo</dt><dd>${s.prods.length} producto${s.prods.length === 1 ? '' : 's'}</dd>
          </dl>
        </div>
        <a class="btn btn-solid prob-aside-cta" target="_blank" rel="noopener"
           href="${esc(wa(M, `Hola, estoy viendo la ficha de ${s.n} en el sitio de ${M.nombre}. Necesito asesoría para mi lote.`))}">
          Hablar con un asesor
        </a>
        <p class="prob-aside-nota">Respondemos con el responsable de tu zona.</p>
      </aside>
    </div>

    ${relacionados ? `<section class="prob-rel">
      <div class="wrap">
        <div class="sec-h">
          <span class="rotulo">También revisa</span>
          <h2>Problemas que se parecen a este</h2>
          <p class="lead">Si al comparar en campo no te cierra el diagnóstico, empieza por acá.</p>
        </div>
        <ul class="rel-grid">
          ${relacionados}
        </ul>
      </div>
    </section>` : ''}
  </article>`;

  const ruta = '/problemas/' + s.slug + '/';
  const titulo = `${s.n} (${s.cien}) — cómo reconocerlo y qué aplicar · ${M.nombre}`;
  const desc = s.resumen.slice(0, 155);

  return pagina({
    D, base: B, ruta, titulo, desc,
    preloadImg: s.img || null,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${s.n}: cómo reconocerlo y qué aplicar`,
        description: desc,
        about: { '@type': 'Thing', name: s.n, alternateName: s.cien },
        inLanguage: 'es',
        isPartOf: { '@type': 'WebSite', name: M.nombreCompleto + ' (demo)', url: M.dominio + '/' },
        publisher: { '@type': 'Organization', name: 'DAK Agency', url: 'https://dakagency.net' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Problemas', item: M.dominio + '/problemas/' },
          { '@type': 'ListItem', position: 3, name: s.n, item: M.dominio + ruta }
        ]
      }
    ],
    contenido
  });
}

export { render };
