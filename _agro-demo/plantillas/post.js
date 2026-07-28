/* ─────────────────────────────────────────────────────────────────────────────
   post.js — artículo del blog.

   El campo `content` del JSON guarda HTML con enlaces ABSOLUTOS
   (`/problemas/oidio/`), que es la forma en que los entendería WordPress si el
   cliente decide migrar. Como este sitio se sirve con rutas relativas —para que
   funcione igual en la raíz de un dominio o dentro de una subcarpeta— el
   generador los reescribe al vuelo. Así el mismo archivo sirve para los dos
   destinos y nadie tiene que mantener dos versiones del texto.

   La fecha se muestra pero NO se inventa una de actualización: un "actualizado
   hoy" automático en un artículo que nadie tocó es exactamente el tipo de señal
   falsa que este sitio evita en todo lo demás.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { migas, bloqueAsesoria, wa, tipoLbl } from './comun.js';

const B = '../../';   // profundidad de /blog/<slug>/

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** '2026-06-12' → '12 de junio de 2026'. Se parte la cadena en vez de usar
 *  `new Date`, que interpretaría la fecha en UTC y podría restar un día. */
export function fechaLarga(iso) {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) { return String(iso) }
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Reescribe los enlaces internos absolutos del contenido a rutas relativas. */
function relativizar(html, base) {
  return html.replace(/href="\/([^"]*)"/g, (_, resto) => `href="${base}${resto}"`);
}

/** Minutos de lectura, redondeados hacia arriba sobre el texto sin etiquetas. */
function minutos(html) {
  const palabras = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

function render(D, post, V) {
  const M = D.marca;
  const cat = D.categoriasBlog[post.categoria] || post.categoria;
  const rel = post.relacionados || {};

  /* Bloque de relacionados: se arma desde los ids declarados en el JSON, así que
     si un problema cambia de slug el enlace lo sigue y no queda roto. */
  const grupos = [];
  if (rel.problemas && rel.problemas.length) {
    grupos.push({
      t: 'Fichas de campo',
      items: rel.problemas.map(id => {
        const x = D.problemas.find(p => p.id === id);
        return x && { href: `${B}problemas/${x.slug}/`, n: x.n, sub: tipoLbl(D, x.tipo) };
      }).filter(Boolean)
    });
  }
  if (rel.cultivos && rel.cultivos.length) {
    grupos.push({
      t: 'Programas',
      items: rel.cultivos.map(id => {
        const x = D.cultivos.find(c => c.id === id);
        return x && { href: `${B}cultivos/${x.slug}/`, n: x.n, sub: x.cientifico };
      }).filter(Boolean)
    });
  }
  if (rel.productos && rel.productos.length) {
    grupos.push({
      t: 'Del catálogo',
      items: rel.productos.map(id => {
        const x = D.productos.find(p => p.id === id);
        return x && { href: `${B}productos/${x.slug}/`, n: x.n, sub: D.categorias[x.cat] || x.cat };
      }).filter(Boolean)
    });
  }

  /* Otros posts, para que el artículo no sea un callejón sin salida. */
  const otros = D.blog.filter(p => p.slug !== post.slug).slice(0, 3);

  const contenido = `
  <div class="wrap">
    ${migas([
      { t: 'Inicio', href: B },
      { t: 'Blog', href: B + 'blog/' },
      { t: post.title }
    ])}
  </div>

  <article class="prob post">
    <header class="prob-cab">
      <div class="wrap post-cab">
        <span class="rotulo"><b>${esc(cat)}</b></span>
        <h1>${esc(post.title)}</h1>
        <p class="lead">${esc(post.excerpt)}</p>
        <p class="post-meta">
          <time datetime="${esc(post.fecha)}">${esc(fechaLarga(post.fecha))}</time>
          <span>·</span>
          <span>${minutos(post.content)} min de lectura</span>
        </p>
      </div>
    </header>

    <div class="wrap prob-grid">
      <div class="prob-cuerpo post-cuerpo">
        ${relativizar(post.content, B)}

        <ul class="post-tags">
          ${(post.tags || []).map(t => `<li>${esc(t)}</li>`).join('\n          ')}
        </ul>

        ${bloqueAsesoria(M, {
          icono: 'zona',
          titulo: 'Esto aplicado a tu lote',
          texto: 'El artículo es general por necesidad. Tu suelo, tu agua y tu etapa no lo son: mándanos los datos y lo revisamos con el responsable de tu zona.',
          msg: `Hola, leí "${post.title}" y quiero aplicarlo a mi caso.`,
          cta: 'Consultar mi caso'
        })}
      </div>

      <aside class="prob-aside">
        ${grupos.map(g => `<div class="prob-ficha">
          <div class="prob-ficha-h"><span>${esc(g.t)}</span></div>
          <ul class="aside-lista">
            ${g.items.map(i => `<li><a href="${esc(i.href)}">
              <b>${esc(i.n)}</b><span>${esc(i.sub)}</span>
            </a></li>`).join('\n            ')}
          </ul>
        </div>`).join('\n        ')}
        <a class="btn btn-solid prob-aside-cta" target="_blank" rel="noopener"
           href="${esc(wa(M, `Hola, leí "${post.title}" en el blog de ${M.nombre}.`))}">
          Hablar con un asesor
        </a>
      </aside>
    </div>

    ${otros.length ? `<section class="prob-rel">
      <div class="wrap">
        <div class="sec-h">
          <span class="rotulo">Seguir leyendo</span>
          <h2>Otros artículos</h2>
        </div>
        <ul class="rel-grid">
          ${otros.map(p => `<li><a class="rel-card" href="${B}blog/${esc(p.slug)}/">
            <span class="rel-tipo">${esc(D.categoriasBlog[p.categoria] || p.categoria)}</span>
            <b>${esc(p.title)}</b>
            <i>${esc(fechaLarga(p.fecha))}</i>
            <span class="rel-ir">Leer ${icono('flecha')}</span>
          </a></li>`).join('\n          ')}
        </ul>
      </div>
    </section>` : ''}
  </article>`;

  const ruta = '/blog/' + post.slug + '/';
  const rm = post.rank_math || {};
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: rm.description || post.excerpt,
      datePublished: post.fecha,
      keywords: (post.tags || []).join(', '),
      inLanguage: 'es',
      articleSection: cat,
      isPartOf: { '@type': 'Blog', name: `Blog de ${M.nombreCompleto} (demo)`, url: M.dominio + '/blog/' },
      publisher: { '@type': 'Organization', name: 'DAK Agency', url: 'https://dakagency.net' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: M.dominio + '/blog/' },
        { '@type': 'ListItem', position: 3, name: post.title, item: M.dominio + ruta }
      ]
    }
  ];
  /* El FAQPage viene escrito en el propio JSON del post, igual que en el
     pipeline de WordPress: se emite tal cual, sin volver a construirlo. */
  if (post.faq_jsonld) { jsonld.push(post.faq_jsonld) }

  return pagina({
    D, V, base: B, ruta,
    titulo: (rm.title || post.title) + ' · ' + M.nombre,
    desc: rm.description || post.excerpt,
    jsonld,
    contenido
  });
}

export { render };
