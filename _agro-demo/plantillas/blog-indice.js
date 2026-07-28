/* ─────────────────────────────────────────────────────────────────────────────
   blog-indice.js — índice del blog.

   El primer artículo va destacado y el resto en lista. No por jerarquía
   editorial sino porque un índice de cuatro entradas todas iguales se lee como
   un archivo muerto; con una entrada dominante se lee como algo vivo.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';
import { migas, bloqueAsesoria } from './comun.js';
import { fechaLarga } from './post.js';

const B = '../';

function render(D, _dato, V) {
  const M = D.marca;
  const posts = D.blog;
  const [destacado, ...resto] = posts;

  const contenido = `
  <div class="wrap">
    ${migas([{ t: 'Inicio', href: B }, { t: 'Blog' }])}
  </div>

  <section class="indice-cab">
    <div class="wrap">
      <span class="rotulo"><b>Blog</b> · ${D.stats.nPosts} artículo${D.stats.nPosts === 1 ? '' : 's'}</span>
      <h1>Notas de campo</h1>
      <p class="lead">Lo que se aprende revisando lotes: cómo leer un análisis, qué no mezclar en
        el tanque, por qué la fruta llega blanda. Escrito para el que decide en campo.</p>
    </div>
  </section>

  <div class="wrap indice-cuerpo">
    ${destacado ? `<a class="post-destacado" href="${B}blog/${esc(destacado.slug)}/">
      <div>
        <span class="rel-tipo">${esc(D.categoriasBlog[destacado.categoria] || destacado.categoria)} · ${esc(fechaLarga(destacado.fecha))}</span>
        <h2>${esc(destacado.title)}</h2>
        <p>${esc(destacado.excerpt)}</p>
        <span class="rel-ir">Leer el artículo ${icono('flecha')}</span>
      </div>
    </a>` : ''}

    ${resto.length ? `<ul class="post-lista">
      ${resto.map(p => `<li>
        <a class="prob-item" href="${B}blog/${esc(p.slug)}/">
          <div class="prob-item-txt">
            <span class="prob-item-cultivos">${esc(D.categoriasBlog[p.categoria] || p.categoria)} · ${esc(fechaLarga(p.fecha))}</span>
            <b>${esc(p.title)}</b>
            <p>${esc(p.excerpt)}</p>
          </div>
          <span class="prob-item-ir">${icono('flecha')}</span>
        </a>
      </li>`).join('\n      ')}
    </ul>` : ''}

    ${bloqueAsesoria(M, {
      nivel: 2,
      icono: 'ficha',
      titulo: 'Hay un tema que te gustaría ver acá',
      texto: 'Estas notas salen de las consultas que más se repiten en campo. Si la tuya no está, dinos cuál es y probablemente sea la próxima.',
      msg: 'Hola, quiero proponer un tema para el blog técnico.',
      cta: 'Proponer un tema'
    })}
  </div>`;

  return pagina({
    D, V, base: B, ruta: '/blog/',
    titulo: `Notas de campo: manejo, diagnóstico y aplicación · ${M.nombre}`,
    desc: 'Artículos técnicos para agricultura de exportación en la costa norte: análisis de agua, compatibilidad de mezclas, diagnóstico de carencias y manejo de poscosecha.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `Notas de campo — ${M.nombreCompleto} (demo)`,
        description: 'Artículos técnicos para agricultura de exportación en la costa norte del Perú.',
        inLanguage: 'es',
        url: M.dominio + '/blog/',
        blogPost: posts.map(p => ({
          '@type': 'BlogPosting',
          headline: p.title,
          datePublished: p.fecha,
          url: M.dominio + '/blog/' + p.slug + '/'
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: M.dominio + '/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: M.dominio + '/blog/' }
        ]
      }
    ],
    contenido
  });
}

export { render };
