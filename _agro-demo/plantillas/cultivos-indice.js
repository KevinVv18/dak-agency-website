/* ─────────────────────────────────────────────────────────────────────────────
   cultivos-indice.js — índice de cultivos.

   Los cultivos sin programa publicado aparecen igual, rotulados como en
   preparación. Esconderlos daría una impresión más pulida y sería peor: el
   visitante que produce palto necesita saber que está en el mapa, y decirle "en
   preparación" es información; no listarlo lo deja pensando que no trabajamos
   su cultivo.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { migas, bloqueAsesoria, problemasDeCultivo } from './comun.js';

const B = '../';

function render(D) {
  const M = D.marca;

  const tarjeta = c => {
    const nProb = problemasDeCultivo(D, c.id).length;
    return `<li>
        <a class="cult-card${c.listo ? '' : ' cult-card--pendiente'}" href="${B}cultivos/${esc(c.slug)}/">
          <div class="cult-card-h">
            <span class="cult-ico">${icono('cultivo')}</span>
            <div>
              <b>${esc(c.n)}</b>
              <i>${esc(c.cientifico)}</i>
            </div>
          </div>
          <p>${esc(c.resumen)}</p>
          <ul class="cult-datos">
            <li><b>${c.listo ? c.etapas.length : '—'}</b><span>Etapas</span></li>
            <li><b>${nProb}</b><span>Fichas de campo</span></li>
          </ul>
          <span class="rel-ir">${c.listo ? 'Ver el programa' : 'Ver estado'} ${icono('flecha')}</span>
        </a>
      </li>`;
  };

  const contenido = `
  <div class="wrap">
    ${migas([{ t: 'Inicio', href: B }, { t: 'Cultivos' }])}
  </div>

  <section class="indice-cab">
    <div class="wrap">
      <span class="rotulo"><b>Programas</b> · ${D.stats.nCultivos} de ${D.stats.nCultivosTotal} publicados</span>
      <h1>Programa por cultivo y por etapa</h1>
      <p class="lead">No una lista de productos: el ciclo del cultivo con qué se aplica en cada
        etapa fenológica, en qué dosis, con qué frecuencia y por qué vía.</p>
    </div>
  </section>

  <div class="wrap indice-cuerpo">
    <ul class="cult-grid">
      ${D.cultivos.map(tarjeta).join('\n      ')}
    </ul>

    ${bloqueAsesoria(M, {
      nivel: 2,   // primer subtítulo tras el h1: las tarjetas no llevan encabezado
      icono: 'ciclo',
      titulo: 'Tu cultivo no está en la lista',
      texto: 'Dinos cuál es, la zona y la superficie. Si tenemos programa lo compartimos, y si no, lo armamos con nuestro equipo agronómico.',
      msg: 'Hola, quiero consultar por un cultivo que no está en la lista de programas.',
      cta: 'Consultar mi cultivo'
    })}
  </div>`;

  return pagina({
    D, base: B, ruta: '/cultivos/',
    titulo: `Programas de nutrición y protección por cultivo · ${M.nombre}`,
    desc: 'Programas por etapa fenológica para arándano, palto, uva de mesa y espárrago en la costa norte del Perú: qué aplicar, en qué dosis y en qué momento.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Programas por cultivo',
        description: 'Índice de programas de nutrición y protección por cultivo.',
        inLanguage: 'es',
        isPartOf: { '@type': 'WebSite', name: M.nombreCompleto + ' (demo)', url: M.dominio + '/' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Cultivos', item: M.dominio + '/cultivos/' }
        ]
      }
    ],
    contenido
  });
}

export { render };
