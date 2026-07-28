/* ─────────────────────────────────────────────────────────────────────────────
   home.js — portada.

   Orden de lectura, tomado de la lógica de Koppert y traducido a nuestro mundo:
   promesa → prueba en cifras → capacidades navegables → herramientas.
   La diferencia con ellos es que nuestras "capacidades" no terminan en una
   página de catálogo: terminan en herramientas que el agrónomo usa (programa,
   diagnóstico, calculadora). Eso es lo que hace que vuelva.
   ───────────────────────────────────────────────────────────────────────── */

import { pagina, esc } from './base.js';
import { icono } from '../datos/iconos.js';

function lamina(l, forma, clase) {
  if (!l || !l.src) { return '' }
  return '<figure class="lamina lamina--' + (forma || 'ancha') + (clase ? ' ' + clase : '') + '">'
    + '<div class="lamina-img">'
    + (l.n ? '<span class="lamina-n">' + esc(l.n) + '</span>' : '')
    + '<img src="assets/img/' + esc(l.src) + '" alt="' + esc(l.alt || '') + '" loading="lazy" decoding="async" />'
    + '</div>'
    + (l.pie ? '<figcaption>' + l.pie + '</figcaption>' : '')
    + '</figure>';
}

function render(D, _dato, V) {
  const M = D.marca;
  const S = D.stats;
  const hero = M.laminas.hero;

  /* ── Hero asimétrico ──────────────────────────────────────────────────────
     La foto no se centra ni llena el ancho: se desplaza del eje y un marco
     desfasado la acompaña, creando dos planos. La tarjeta de datos monta sobre
     la esquina inferior. Es lo que rompe la monotonía rectangular sin recurrir
     a una foto a sangre, que con un original de 1024 px se vería blanda.
     El <div class="hero-foto"> es intercambiable por un <video> sin tocar nada
     más del diseño. */
  const heroHtml = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-txt">
        <span class="rotulo"><b>Norte del Perú</b> · Campaña 2026</span>
        <h1>${esc(M.claim)}</h1>
        <p class="lead">${esc(M.intro)}</p>
        <div class="hero-ctas">
          <a class="btn btn-solid" href="#programa">Ver programa por cultivo ${icono('flecha')}</a>
          ${D.problemas.length
            ? '<a class="btn btn-line" href="#diagnostico">Tengo un problema en campo</a>'
            : '<a class="btn btn-line" href="#catalogo">Ver el catálogo</a>'}
        </div>
      </div>

      <div class="hero-media">
        <div class="hero-marco" aria-hidden="true"></div>
        <figure class="hero-foto">
          <img class="hero-img" src="assets/img/${esc(hero.src)}" alt="${esc(hero.alt)}" fetchpriority="high" decoding="async" />${
          hero.src2 ? `
          <!-- Segunda toma del fundido. Va con alt vacío y aria-hidden: es la
               misma información visual que la primera, y anunciarla dos veces a
               un lector de pantalla sería ruido. -->
          <img class="hero-img hero-img--b" src="assets/img/${esc(hero.src2)}" alt="" aria-hidden="true" loading="lazy" decoding="async" />` : ''}
          <span class="lamina-n">${esc(hero.n)}</span>
        </figure>
        <aside class="hero-tarjeta">
          <div class="hero-tarjeta-h">
            <span>Ficha de identidad</span><span>Demo</span>
          </div>
          <dl>
            <dt>Sede</dt><dd>${esc(M.ciudad)}</dd>
            <dt>Producción</dt><dd>Formulación local</dd>
            <dt>Admisibilidad</dt><dd>Orgánica y convencional</dd>
          </dl>
        </aside>
      </div>
    </div>
  </section>`;

  /* ── Métricas ─────────────────────────────────────────────────────────────
     Las cifras salen de los datos, no de la imaginación: si mañana se agrega un
     producto, el número sube solo. Nada de porcentajes de eficacia inventados. */
  const metricasHtml = `
  <section class="metricas-sec reveal" aria-label="La empresa en cifras">
    <div class="wrap">
      <ul class="metricas">
        ${M.metricas.map((m, i) => {
          const v = m.clave ? S[m.clave] : m.valor;
          /* --i escalona la entrada. La cifra va envuelta en un <span> porque
             se anima subiendo tras una máscara: el número siempre está en el
             DOM, lo que se mueve es su envoltorio. */
          return `<li class="metrica" style="--i:${i}">
          <span class="metrica-ico">${icono(m.icono)}</span>
          <b class="metrica-n"><span>${esc(String(v))}${esc(m.sufijo || '')}</span></b>
          <span class="metrica-t">${esc(m.etiqueta)}</span>
        </li>`;
        }).join('\n        ')}
      </ul>
    </div>
  </section>`;

  /* ── Capacidades ──────────────────────────────────────────────────────────
     Vuelve navegable y concreta una capacidad que de otro modo es una palabra
     abstracta en un párrafo. Cada tarjeta lleva al catálogo ya filtrado. */
  const capacidadesHtml = `
  <section id="capacidades" class="reveal">
    <div class="wrap">
      <div class="sec-h">
        <span class="rotulo">Qué formulamos</span>
        <h2>Seis líneas, un solo programa</h2>
        <p class="lead">No vendemos productos sueltos: cada línea cubre un frente distinto del
          cultivo y se cruza con las demás en el calendario de la campaña.</p>
      </div>
      <ul class="cap-grid">
        ${M.capacidades.map(c => `<li class="cap"${c.color ? ` style="--linea-color:${c.color}"` : ''}>
          <span class="cap-ico">${icono(c.icono)}</span>
          <h3>${esc(c.n)}</h3>
          <p>${esc(c.d)}</p>
          <a class="cap-link" href="productos/#l-${esc(c.cat)}">
            Ver productos ${icono('flecha')}
          </a>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>`;

  /* ── Secciones interactivas ───────────────────────────────────────────────
     Solo declaran contenedores: los llena core.js, que ya arranca cada sección
     con una guarda, así que estas mismas secciones funcionan en cualquier
     página que incluya un subconjunto de ellas. */
  const programaHtml = `
  <section id="programa" class="reveal">
    <div class="wrap">
      <div class="sec-h sec-h--foto">
        <div>
          <span class="rotulo">01 · Programa</span>
          <h2>El programa completo, etapa por etapa</h2>
          <p class="lead">Elige el cultivo y recorre su ciclo. En cada etapa fenológica: qué se aplica,
            en qué dosis, con qué frecuencia y por qué vía. No es una lista de productos, es un programa.</p>
          <p><a class="btn btn-line btn-sm" href="cultivos/">Ver los programas completos ${icono('flecha')}</a></p>
        </div>
        ${lamina(M.laminas.programa, 'alta')}
      </div>
      <div class="prog-cultivos" id="progCultivos" role="group" aria-label="Elegir cultivo"></div>
      <div class="etapa-riel" id="etapaRiel" role="tablist" aria-label="Etapas del cultivo"></div>
      <div class="etapa-panel" id="etapaPanel" role="tabpanel" tabindex="0"></div>
    </div>
  </section>`;

  /* El diagnóstico solo aparece si el sitio tiene fichas. Una maqueta de
     cliente que excluye esa sección no puede mostrar el selector vacío ni
     enlazar a un índice que no se generó. */
  const diagnosticoHtml = !D.problemas.length ? '' : `
  <section id="diagnostico" class="reveal">
    <div class="wrap">
      <div class="sec-h">
        <span class="rotulo">02 · Diagnóstico</span>
        <h2>Qué estoy viendo en campo</h2>
        <p class="lead">El agricultor no busca un producto, busca resolver lo que ve. Elige el problema
          y el sitio explica qué es, con qué se confunde, por qué ocurre y qué del catálogo aplica.</p>
        <p><a class="btn btn-line btn-sm" href="problemas/">Ver las ${D.stats.nProblemas} fichas de diagnóstico ${icono('flecha')}</a></p>
      </div>
      <div class="sint-grid" id="sintGrid" role="group" aria-label="Elegir problema"></div>
      <div class="sint-detalle" id="sintDetalle" role="status" aria-live="polite"></div>
    </div>
  </section>`;

  const catalogoHtml = `
  <section id="catalogo" class="reveal">
    <div class="wrap">
      <div class="sec-h">
        <span class="rotulo">03 · Catálogo</span>
        <h2>Catálogo técnico con filtros reales</h2>
        <p class="lead">Filtra por cultivo, por línea o por admisibilidad orgánica. Cada producto abre su
          ficha con composición declarada, dosis, vía de aplicación y periodo de carencia.</p>
        <p><a class="btn btn-line btn-sm" href="productos/">Ver el catálogo completo de ${D.stats.nProductos} productos ${icono('flecha')}</a></p>
      </div>
      <div class="filtros">
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
          <span class="cuenta" id="catCuenta" role="status" aria-live="polite">—</span>
          <button class="btn btn-line btn-sm" type="button" id="fLimpiar">Limpiar</button>
        </div>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>
  </section>`;

  const calculadoraHtml = `
  <section id="calculadora" class="reveal">
    <div class="wrap">
      <div class="sec-h">
        <span class="rotulo">04 · Calculadora</span>
        <h2>Cuánto necesito y cuánto cuesta</h2>
        <p class="lead">La herramienta que hace que un agrónomo vuelva a la web: mueve las hectáreas y la
          dosis, y sale el volumen y el costo de la aplicación.</p>
      </div>
      <div class="calc">
        <div class="calc-panel">
          <h3>Parámetros</h3>
          <div class="calc-fila">
            <label for="cProd">Producto</label>
            <select id="cProd" class="calc-select"></select>
          </div>
          <div class="calc-fila">
            <label for="cHa">Superficie <output id="cHaOut" for="cHa">—</output></label>
            <input type="range" id="cHa" min="1" max="200" step="1" value="20" />
          </div>
          <div class="calc-fila">
            <label for="cDos">Dosis <output id="cDosOut" for="cDos">—</output></label>
            <input type="range" id="cDos" min="0" max="10" step="0.1" value="2" />
          </div>
          <p class="calc-aviso">El rango de la dosis se ajusta al del producto elegido: no deja
            configurar una dosis fuera de etiqueta.</p>
        </div>
        <div class="calc-panel">
          <h3>Resultado</h3>
          <dl class="calc-res">
            <div><dt>Producto a comprar</dt><dd id="cUnid">—</dd></div>
            <div><dt>Presentación</dt><dd id="cPres">—</dd></div>
            <div><dt>Costo por hectárea</dt><dd id="cCostoHa">—</dd></div>
            <div class="total"><dt>Costo de la aplicación</dt><dd id="cCostoTotal">—</dd></div>
          </dl>
          <p class="calc-aviso">Precios referenciales de demostración, sin IGV ni flete. Un sitio real
            toma la lista de precios vigente y la zona del cliente.</p>
          <p style="margin-top:1rem">
            <a class="btn btn-solid btn-sm" data-wa="Hola DAK, probé la calculadora de dosis del demo de agroinsumos. Quiero una herramienta así en mi web." target="_blank" rel="noopener" href="#">Quiero esta herramienta</a>
          </p>
        </div>
      </div>
    </div>
  </section>`;

  const coberturaHtml = `
  <section id="cobertura" class="reveal">
    <div class="wrap">
      <div class="sec-h sec-h--foto">
        <div>
          <span class="rotulo">05 · Cobertura</span>
          <h2>Cada zona, con su responsable</h2>
          <p class="lead">El visitante elige su zona y la consulta llega al representante correcto. En un
            sitio real esto se conecta al CRM y queda registrado con su origen.</p>
        </div>
        ${lamina(M.laminas.cobertura, 'ancha')}
      </div>
      <div class="zonas" id="zonasGrid"></div>
    </div>
  </section>`;

  /* Últimas notas. Va al final a propósito: el blog no es lo que trae al
     visitante a la portada, pero sí lo que lo hace volver. */
  const blogHtml = (D.blog.length && (!D.secciones || D.secciones.includes('blog'))) ? `
  <section id="notas" class="reveal">
    <div class="wrap">
      <div class="sec-h">
        <span class="rotulo">06 · Notas de campo</span>
        <h2>Lo que se aprende revisando lotes</h2>
        <p class="lead">Artículos técnicos escritos para el que decide en campo, no para posicionar
          palabras sueltas. Cada uno enlaza con las fichas y los programas que le corresponden.</p>
        <p><a class="btn btn-line btn-sm" href="blog/">Ver las ${D.stats.nPosts} notas ${icono('flecha')}</a></p>
      </div>
      <ul class="rel-grid">
        ${D.blog.slice(0, 3).map(p => `<li><a class="rel-card" href="blog/${esc(p.slug)}/">
          <span class="rel-tipo">${esc(D.categoriasBlog[p.categoria] || p.categoria)}</span>
          <b>${esc(p.title)}</b>
          <i>${esc(p.excerpt.slice(0, 90))}…</i>
          <span class="rel-ir">Leer ${icono('flecha')}</span>
        </a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>` : '';

  const contenido = [
    heroHtml, metricasHtml, capacidadesHtml,
    programaHtml, diagnosticoHtml, catalogoHtml, calculadoraHtml, coberturaHtml,
    blogHtml
  ].join('\n');

  return pagina({
    D, V,
    base: '',
    ruta: '/',
    titulo: `${M.nombreCompleto} · Agroinsumos para el norte del Perú — Demo por DAK Agency`,
    desc: M.descripcionCorta + ' Demo de web para empresas de agroinsumos, desarrollado por DAK Agency.',
    preloadImg: hero.src,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: M.nombreCompleto + ' (demo)',
        description: 'Marca ficticia de demostración creada por DAK Agency para el nicho de agroinsumos. No es una empresa real.',
        areaServed: 'Lambayeque, La Libertad, Piura, Perú',
        url: M.dominio + '/',
        parentOrganization: { '@type': 'Organization', name: 'DAK Agency', url: 'https://dakagency.net' }
      },
      /* La portada es la única página sin BreadcrumbList —es la raíz, no tiene
         de dónde venir—, así que declara el sitio en su lugar. Sin esto queda
         como la única URL con un solo bloque de datos estructurados. */
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: M.nombreCompleto + ' (demo)',
        alternateName: M.nombre,
        description: M.descripcionCorta,
        inLanguage: 'es',
        url: M.dominio + '/',
        publisher: { '@type': 'Organization', name: 'DAK Agency', url: 'https://dakagency.net' }
      }
    ],
    contenido
  });
}

export { render };
