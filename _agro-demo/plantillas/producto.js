/* ─────────────────────────────────────────────────────────────────────────────
   producto.js — ficha individual de producto.

   El valor de esta página no está en repetir la etiqueta: está en responder las
   dos preguntas que el catálogo no puede contestar — **dónde se usa** y **para
   qué sirve**. Las dos salen de recorrer los datos al revés: los programas de
   cultivo dicen en qué etapa entra este producto, y las fichas de problema
   dicen para qué caso se recomienda. Nadie mantiene esas listas a mano, así que
   no pueden quedar desactualizadas.

   La `nota` de cada producto es el campo que más valor aporta: la advertencia
   práctica que normalmente vive en la cabeza del asesor y no en la etiqueta
   (que Bacillus muere si va con cobre, que el fosfito llega tarde si la
   enfermedad ya está declarada, que un hierro EDTA se bloquea en suelo
   calcáreo).
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import {
  migas, bloqueAsesoria, wa, selloOrg, tipoLbl,
  usosDeProducto, problemasDeProducto, hermanosDeProducto
} from './comun.js';

const B = '../../';   // profundidad de /productos/<slug>/

/* Icono por línea de producto, tomado de las capacidades para no inventar un
   segundo mapeo que se desincronice del de la portada. */
function iconoDeLinea(M, cat) {
  const c = M.capacidades.find(x => x.cat === cat);
  return c ? c.icono : 'producto';
}

function render(D, p, V) {
  const M = D.marca;
  const linea = D.categorias[p.cat] || p.cat;
  const usos = usosDeProducto(D, p.id);
  const problemas = problemasDeProducto(D, p.id);
  const hermanos = hermanosDeProducto(D, p);
  const conCarencia = p.carencia && p.carencia !== 'Sin carencia';

  const contenido = `
  <div class="wrap">
    ${migas([
      { t: 'Inicio', href: B },
      { t: 'Catálogo', href: B + 'productos/' },
      { t: p.n }
    ])}
  </div>

  <article class="prob">
    <header class="prob-cab">
      <div class="wrap prod-cab">
        <div>
          <span class="rotulo"><b>${esc(linea)}</b> · ${esc(p.form)}</span>
          <h1>${esc(p.n)}</h1>
          <p class="lead">${esc(p.desc)}</p>
          <div class="ficha-sellos">
            ${selloOrg(p)}
            ${conCarencia
              ? `<span class="sello sello--alerta">Carencia ${esc(p.carencia)}</span>`
              : '<span class="sello">Sin carencia</span>'}
          </div>
        </div>
        <span class="prod-ico">${icono(iconoDeLinea(M, p.cat))}</span>
      </div>
    </header>

    <div class="wrap prob-grid">
      <div class="prob-cuerpo">

        <section class="prob-sec">
          <h2>Composición declarada</h2>
          <div class="tabla-wrap">
            <table class="comp">
              <tbody>
                ${p.comp.map(c => `<tr><th scope="row">${esc(c[0])}</th><td>${esc(c[1])}</td></tr>`).join('\n                ')}
              </tbody>
            </table>
          </div>
        </section>

        ${p.nota ? `<section class="prob-sec prob-sec--confusion">
          <h2>${icono('alerta')} Lo que hay que saber antes de aplicarlo</h2>
          <p>${esc(p.nota)}</p>
        </section>` : ''}

        ${usos.length ? `<section class="prob-sec">
          <h2>En qué etapas se usa</h2>
          <p class="prob-nota">Tomado de los programas publicados. Si tu cultivo no aparece, el
            producto puede usarse igual: el programa todavía no está redactado.</p>
          <div class="tabla-wrap">
            <table class="aplic">
              <caption>Uso de ${esc(p.n)} en los programas</caption>
              <thead><tr>
                <th scope="col">Cultivo</th><th scope="col">Etapa</th>
                <th scope="col">Dosis</th><th scope="col">Frecuencia</th>
              </tr></thead>
              <tbody>
                ${usos.map(u => `<tr>
                  <td><a class="tabla-prod" href="${B}cultivos/${esc(u.cultivo.slug)}/">
                    <span class="prod-n">${esc(u.cultivo.n)}</span></a></td>
                  <td>${esc(u.etapa.n)}${u.etapa.sub ? ` <span class="prod-cat">${esc(u.etapa.sub)}</span>` : ''}</td>
                  <td class="dosis">${esc(u.d)}</td>
                  <td>${esc(u.f)}</td>
                </tr>`).join('\n                ')}
              </tbody>
            </table>
          </div>
        </section>` : ''}

        ${problemas.length ? `<section class="prob-sec">
          <h2>Para qué problemas se recomienda</h2>
          <ul class="chips">
            ${problemas.map(x => `<li><a class="chip chip--link" href="${B}problemas/${esc(x.slug)}/">
              ${esc(x.n)} ${icono('flecha')}</a></li>`).join('\n            ')}
          </ul>
        </section>` : ''}

        ${bloqueAsesoria(M, {
          icono: 'producto',
          titulo: 'Pide la ficha técnica y la hoja de seguridad',
          texto: 'Te las enviamos junto con la recomendación de uso para tu cultivo y tu etapa, y con la lista de compatibilidades de mezcla.',
          msg: `Hola, quiero la ficha técnica de ${p.n}.`,
          cta: 'Solicitar la ficha'
        })}

      </div>

      <aside class="prob-aside">
        <div class="prob-ficha">
          <div class="prob-ficha-h"><span>Datos</span><span>${esc(p.form)}</span></div>
          <dl>
            <dt>Dosis</dt><dd class="med">${esc(p.dosis)}</dd>
            <dt>Vía de aplicación</dt><dd>${esc(p.via)}</dd>
            <dt>Presentación</dt><dd>${esc(p.pres)}</dd>
            <dt>Carencia</dt><dd>${esc(p.carencia)}</dd>
            <dt>Registro</dt><dd class="mono-sm">${esc(D.registro)}</dd>
          </dl>
        </div>
        <p class="prob-aside-nota">Producto de demostración, no comercializado.</p>
        <a class="btn btn-solid prob-aside-cta" target="_blank" rel="noopener"
           href="${esc(wa(M, `Hola, me interesa ${p.n} del sitio de ${M.nombre}.`))}">
          Consultar por este producto
        </a>
      </aside>
    </div>

    ${hermanos.length ? `<section class="prob-rel">
      <div class="wrap">
        <div class="sec-h">
          <span class="rotulo">Misma línea</span>
          <h2>Otros productos de ${esc(linea).toLowerCase()}</h2>
        </div>
        <ul class="rel-grid">
          ${hermanos.map(h => `<li><a class="rel-card" href="${B}productos/${esc(h.slug)}/">
            <span class="rel-tipo">${esc(h.form)}</span>
            <b>${esc(h.n)}</b>
            <i>${esc(h.dosis)}</i>
            <span class="rel-ir">Ver ficha ${icono('flecha')}</span>
          </a></li>`).join('\n          ')}
        </ul>
      </div>
    </section>` : ''}
  </article>`;

  const ruta = '/productos/' + p.slug + '/';
  const titulo = `${p.n} — ${linea.toLowerCase()} ${p.form}, dosis y uso · ${M.nombre}`;
  const desc = p.desc.slice(0, 155);

  return pagina({
    D, V, base: B, ruta, titulo, desc,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.n,
        description: p.desc,
        category: linea,
        /* Sin `offers`: no hay precio real ni producto que comprar, y declarar
           una oferta inexistente sería marcado falso. */
        additionalProperty: p.comp.map(c => ({
          '@type': 'PropertyValue', name: c[0], value: c[1]
        })),
        brand: { '@type': 'Brand', name: M.nombre },
        manufacturer: { '@type': 'Organization', name: M.nombreCompleto + ' (demo)' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: M.dominio + '/productos/' },
          { '@type': 'ListItem', position: 3, name: p.n, item: M.dominio + ruta }
        ]
      }
    ],
    contenido
  });
}

export { render };
