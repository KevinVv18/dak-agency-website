/* ─────────────────────────────────────────────────────────────────────────────
   problemas-indice.js — índice de plagas, enfermedades y desórdenes.

   Se agrupa por tipo, no en una grilla plana alfabética. Un índice agrupado se
   lee como obra de referencia y le dice al visitante algo que la lista suelta no:
   que un amarillamiento por carencia y un amarillamiento por hongo son problemas
   de naturaleza distinta y no se resuelven igual.

   El orden de los grupos va de lo más frecuente a lo menos en la costa norte,
   no alfabético.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { migas, bloqueAsesoria, tipoLbl, cultivoN } from './comun.js';

const B = '../';   // profundidad de /problemas/

/* Iconografía por tipo, para que el grupo se reconozca de un vistazo. */
const ICONO_TIPO = {
  carencia: 'nutricion',
  enfermedad: 'defensas',
  plaga: 'control',
  abiotico: 'suelo'
};

/* Orden por frecuencia real en la costa norte peruana. */
const ORDEN = ['carencia', 'enfermedad', 'plaga', 'abiotico'];

function render(D, _dato, V) {
  const M = D.marca;

  const grupos = ORDEN
    .map(tipo => ({ tipo, items: D.problemas.filter(p => p.tipo === tipo) }))
    .filter(g => g.items.length);

  const secciones = grupos.map(g => `
      <section class="grupo">
        <div class="grupo-h">
          <span class="grupo-ico">${icono(ICONO_TIPO[g.tipo] || 'ficha')}</span>
          <h2>${esc(tipoLbl(D, g.tipo, true))}</h2>
          <span class="grupo-n">${g.items.length}</span>
        </div>
        <ul class="prob-lista">
          ${g.items.map(p => `<li>
            <a class="prob-item" href="${B}problemas/${esc(p.slug)}/">
              <div class="prob-item-txt">
                <b>${esc(p.n)}</b>
                <i>${esc(p.cien)}</i>
                <p>${esc(p.resumen)}</p>
                <span class="prob-item-cultivos">${esc(p.cultivos.map(id => cultivoN(D, id)).join(' · '))}</span>
              </div>
              <span class="prob-item-ir">${icono('flecha')}</span>
            </a>
          </li>`).join('\n          ')}
        </ul>
      </section>`).join('\n');

  const contenido = `
  <div class="wrap">
    ${migas([{ t: 'Inicio', href: B }, { t: 'Problemas' }])}
  </div>

  <section class="indice-cab">
    <div class="wrap">
      <span class="rotulo"><b>Diagnóstico</b> · ${D.stats.nProblemas} fichas</span>
      <h1>Qué le pasa a mi cultivo</h1>
      <p class="lead">Fichas de campo para reconocer lo que tienes delante: qué se ve, por qué
        ocurre, con qué se confunde y qué aplicar. Escritas para comparar contra la planta,
        no para memorizar.</p>
    </div>
  </section>

  <div class="wrap indice-cuerpo">
    ${secciones}

    ${bloqueAsesoria(M, {
      icono: 'zona',
      titulo: 'No encuentras lo que ves en tu campo',
      texto: 'Manda una foto del síntoma y en qué etapa está el cultivo. El responsable de tu zona lo revisa y te dice qué es antes de venderte nada.',
      msg: 'Hola, tengo un problema en campo que no logro identificar y quiero asesoría.',
      cta: 'Mandar una foto'
    })}
  </div>`;

  return pagina({
    D, V, base: B, ruta: '/problemas/',
    titulo: `Plagas, enfermedades y carencias en cultivos del norte · ${M.nombre}`,
    desc: 'Fichas de campo para reconocer plagas, enfermedades y carencias nutricionales en arándano, palto, uva y espárrago: qué se ve, por qué ocurre y qué aplicar.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Plagas, enfermedades y carencias',
        description: 'Índice de fichas de diagnóstico para cultivos de la costa norte del Perú.',
        inLanguage: 'es',
        isPartOf: { '@type': 'WebSite', name: M.nombreCompleto + ' (demo)', url: M.dominio + '/' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Problemas', item: M.dominio + '/problemas/' }
        ]
      }
    ],
    contenido
  });
}

export { render };
