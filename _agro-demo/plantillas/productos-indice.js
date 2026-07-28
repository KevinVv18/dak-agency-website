/* ─────────────────────────────────────────────────────────────────────────────
   productos-indice.js — catálogo completo.

   A diferencia de la sección de la portada, aquí las tarjetas se escriben en el
   HTML: los catorce productos están en el documento aunque el JS no corra, y
   cada uno enlaza a su página. Los filtros son una capa encima que oculta y
   muestra lo que ya está — no lo que lo genera. Un catálogo que solo existe
   cuando corre JavaScript no lo puede leer un buscador ni un lector de pantalla.

   Los filtros aceptan preselección por hash (`/productos/#l-biologico`), que es
   lo que permite a las tarjetas de capacidad de la portada llegar aquí con su
   línea ya elegida, sin necesitar un backend ni query strings.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { migas, bloqueAsesoria, selloOrg } from './comun.js';

const B = '../';

function render(D, _dato, V) {
  const M = D.marca;

  /* Orden por línea, siguiendo el de las capacidades de la portada, para que el
     catálogo se lea igual que se presentó la empresa. */
  const orden = M.capacidades.map(c => c.cat);
  const productos = [...D.productos].sort((a, b) => {
    const d = orden.indexOf(a.cat) - orden.indexOf(b.cat);
    return d !== 0 ? d : a.n.localeCompare(b.n, 'es');
  });

  /* Color por línea, tomado de las capacidades para no mantener un segundo
     mapeo que se desincronice del de la portada. */
  const colorDe = cat => (M.capacidades.find(c => c.cat === cat) || {}).color;

  const tarjetas = productos.map(p => `<li class="prod-li"
        data-cat="${esc(p.cat)}" data-org="${p.org ? 'si' : 'no'}"
        data-cultivos="${esc(p.cultivos.join(' '))}"${colorDe(p.cat) ? ` style="--linea-color:${colorDe(p.cat)}"` : ''}>
        <a class="prod-card prod-card--link" href="${B}productos/${esc(p.slug)}/">
          <div class="cab">
            <div>
              <span class="cat-lbl">${esc(D.categorias[p.cat] || p.cat)}</span>
              <h2>${esc(p.n)}</h2>
            </div>
            <span class="form-lbl">${esc(p.form)}</span>
          </div>
          <span class="dosis-lbl">${esc(p.dosis)}</span>
          <p class="prod-card-desc">${esc(p.desc)}</p>
          <div class="pie">${selloOrg(p)}<span class="abrir">Ver ficha ${icono('flecha')}</span></div>
        </a>
      </li>`).join('\n      ');

  const contenido = `
  <div class="wrap">
    ${migas([{ t: 'Inicio', href: B }, { t: 'Catálogo' }])}
  </div>

  <section class="indice-cab">
    <div class="wrap">
      <span class="rotulo"><b>Catálogo</b> · ${D.stats.nProductos} productos · ${D.stats.nOrganicos} admisibles en orgánico</span>
      <h1>Catálogo técnico</h1>
      <p class="lead">Filtra por cultivo, por línea o por admisibilidad orgánica. Cada ficha trae
        composición declarada, dosis, vía de aplicación, carencia y en qué etapa del programa entra.</p>
    </div>
  </section>

  <div class="wrap indice-cuerpo">
    <div class="filtros" id="catFiltros">
      <div class="campo"><label for="fCultivo">Cultivo</label><select id="fCultivo"></select></div>
      <div class="campo"><label for="fCat">Línea</label><select id="fCat"></select></div>
      <div class="campo"><label for="fOrg">Admisibilidad</label>
        <select id="fOrg">
          <option value="">Toda</option>
          <option value="si">Orgánica</option>
          <option value="no">Convencional</option>
        </select>
      </div>
      <div class="filtros-info">
        <span class="cuenta" id="catCuenta" role="status" aria-live="polite">${D.stats.nProductos} productos</span>
        <button class="btn btn-line btn-sm" type="button" id="fLimpiar">Limpiar</button>
      </div>
    </div>

    <ul class="cat-grid" id="catLista">
      ${tarjetas}
    </ul>
    <div class="vacio" id="catVacio" hidden>
      <p>Ningún producto del catálogo cumple esos filtros. Prueba con menos restricciones.</p>
    </div>

    ${bloqueAsesoria(M, {
      icono: 'producto',
      titulo: 'No sabes cuál te toca',
      texto: 'Dinos el cultivo, la etapa y qué estás viendo en campo. Es más rápido que revisar catorce fichas, y la recomendación sale del responsable de tu zona.',
      msg: 'Hola, quiero una recomendación de producto para mi cultivo.',
      cta: 'Pedir recomendación'
    })}
  </div>`;

  return pagina({
    D, V, base: B, ruta: '/productos/',
    titulo: `Catálogo de agroinsumos: nutrición, bioestimulantes y control · ${M.nombre}`,
    desc: `${D.stats.nProductos} productos formulados para la agroexportación del norte del Perú: nutrición, bioestimulación, inducción de defensas, control biológico y corrección de suelo y agua.`,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Catálogo técnico',
        description: 'Catálogo de agroinsumos por línea, cultivo y admisibilidad orgánica.',
        inLanguage: 'es',
        isPartOf: { '@type': 'WebSite', name: M.nombreCompleto + ' (demo)', url: M.dominio + '/' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: productos.length,
          itemListElement: productos.map((p, i) => ({
            '@type': 'ListItem', position: i + 1, name: p.n,
            url: M.dominio + '/productos/' + p.slug + '/'
          }))
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: M.dominio + '/productos/' }
        ]
      }
    ],
    contenido
  });
}

export { render };
