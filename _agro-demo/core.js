/* ═════════════════════════════════════════════════════════════════════════════
   core.js — motor del demo de agroinsumos. Compartido por todas las versiones.

   No contiene ni un dato de marca: todo sale de window.AGRO, que define el
   data.*.js que cargue cada cascarón. Para skin-ear el demo con la marca de un
   cliente se cambia ese archivo de datos y el :root del cascarón; este archivo
   no se toca.

   Rutas de assets: window.AGRO_BASE lo declara el cascarón antes de cargar este
   script ('' en la raíz, '../' en una carpeta de cliente).

   Regla de accesibilidad que atraviesa todo el archivo: ningún valor numérico se
   produce por animación. Los números se escriben en el DOM y ahí se quedan, para
   que con prefers-reduced-motion se lean completos y estáticos.
   ═════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.AGRO;
  if (!D) { return }
  var BASE = window.AGRO_BASE || '';
  var API = 'https://admin.dakagency.net';

  /* ── Utilidades ─────────────────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id) }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function soles(n) {
    return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  function prod(id) {
    for (var i = 0; i < D.productos.length; i++) { if (D.productos[i].id === id) return D.productos[i] }
    return null;
  }
  function catLbl(c) { return D.categorias[c] || c }
  function waLink(msg) {
    return 'https://wa.me/' + D.brand.wa + '?text=' + encodeURIComponent(msg);
  }
  /* Lee un rango de dosis por hectárea. Devuelve null para dosis que no son
     por hectárea (coadyuvantes por 100 L de caldo), que quedan fuera de la
     calculadora a propósito en vez de dar un número equivocado. */
  function parseDosis(s) {
    var m = String(s).match(/([\d.]+)\s*[–\-]\s*([\d.]+)\s*(L|kg)\s*\/\s*ha/i);
    if (!m) { return null }
    return { min: parseFloat(m[1]), max: parseFloat(m[2]), u: m[3] };
  }
  var esDemoTexto = 'Valores demostrativos';

  /* Lámina: fotografía acotada, numerada y con pie. El pie admite <b> e <i>
     porque viene de los datos, no de entrada de usuario.
     `forma` = 'ancha' (16:9) | 'alta' (4:3). */
  function lamina(l, forma, clase) {
    if (!l || !l.src) { return '' }
    return '<figure class="lamina lamina--' + (forma || 'ancha') + (clase ? ' ' + clase : '') + '">'
      + '<div class="lamina-img">'
      + (l.n ? '<span class="lamina-n">' + esc(l.n) + '</span>' : '')
      + '<img src="' + BASE + 'assets/img/' + esc(l.src) + '" alt="' + esc(l.alt || '') + '" loading="lazy" decoding="async" />'
      + '</div>'
      + (l.pie ? '<figcaption>' + l.pie + '</figcaption>' : '')
      + '</figure>';
  }

  /* Sello de admisibilidad orgánica / convencional. Mismo acento de marca,
     diferenciado por tratamiento — no hay un tercer color en el sistema. */
  function selloOrg(p) {
    if (p.org) {
      return '<span class="sello"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">'
        + '<path d="M20 6 9 17l-5-5"/></svg>Insumo orgánico</span>';
    }
    return '<span class="sello sello--conv">Convencional</span>';
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     1. PROGRAMA FENOLÓGICO — la interacción principal
     ═══════════════════════════════════════════════════════════════════════════ */
  var progEstado = { cultivo: null, etapa: 0 };

  function pintarCultivos() {
    var cont = $('progCultivos');
    if (!cont) { return }
    cont.innerHTML = D.cultivos.map(function (c) {
      var on = c.id === progEstado.cultivo;
      return '<button type="button" class="cultivo-chip" data-c="' + esc(c.id) + '"'
        + ' aria-pressed="' + (on ? 'true' : 'false') + '"'
        + (c.listo ? '' : ' disabled aria-disabled="true"')
        + '>' + esc(c.n)
        + '<i>' + (c.listo ? esc(c.etapas.length) + ' etapas' : 'en preparación') + '</i>'
        + '</button>';
    }).join('');
  }

  function cultivoActual() {
    for (var i = 0; i < D.cultivos.length; i++) {
      if (D.cultivos[i].id === progEstado.cultivo) { return D.cultivos[i] }
    }
    return null;
  }

  function pintarRiel() {
    var c = cultivoActual(), riel = $('etapaRiel');
    if (!riel || !c) { return }
    riel.innerHTML = c.etapas.map(function (e, i) {
      return '<button type="button" class="etapa-btn" role="tab" data-e="' + i + '"'
        + ' id="tab-' + i + '" aria-controls="etapaPanel"'
        + ' aria-selected="' + (i === progEstado.etapa ? 'true' : 'false') + '"'
        + ' tabindex="' + (i === progEstado.etapa ? '0' : '-1') + '">'
        + '<i>Etapa ' + (i + 1) + '</i>'
        + '<b>' + esc(e.n) + '</b>'
        + (e.sub ? '<span>' + esc(e.sub) + '</span>' : '')
        + '</button>';
    }).join('');
  }

  function pintarEtapa() {
    var c = cultivoActual(), panel = $('etapaPanel');
    if (!panel) { return }

    if (!c || !c.etapas.length) {
      panel.innerHTML = '<div class="vacio"><p>' + esc(c ? c.nota : '') + '</p></div>';
      return;
    }
    var e = c.etapas[progEstado.etapa];
    if (!e) { return }

    var filas = e.apps.map(function (a) {
      var p = prod(a.p);
      if (!p) { return '' }
      return '<tr>'
        + '<td><span class="prod-n">' + esc(p.n) + '</span>'
        + '<span class="prod-cat">' + esc(catLbl(p.cat)) + ' · ' + esc(p.form) + '</span></td>'
        + '<td class="dosis">' + esc(a.d) + '</td>'
        + '<td>' + esc(a.f) + '</td>'
        + '<td>' + esc(p.via) + '</td>'
        + '<td>' + selloOrg(p) + '</td>'
        + '<td><button type="button" class="ver" data-ficha="' + esc(p.id) + '">Ficha</button></td>'
        + '</tr>';
    }).join('');

    panel.innerHTML =
      '<div class="etapa-cab">'
      + '<span class="dur">' + esc(e.dur) + '</span>'
      + '<h3>' + esc(e.n) + (e.sub ? ' · <span style="font-weight:400">' + esc(e.sub) + '</span>' : '') + '</h3>'
      + '<p>' + esc(e.objetivo) + '</p>'
      + '</div>'
      + '<div class="tabla-wrap"><table class="aplic">'
      + '<caption>Aplicaciones sugeridas para esta etapa</caption>'
      + '<thead><tr><th scope="col">Producto</th><th scope="col">Dosis</th><th scope="col">Frecuencia</th>'
      + '<th scope="col">Vía</th><th scope="col">Admisibilidad</th><th scope="col"><span class="sr">Ficha técnica</span></th></tr></thead>'
      + '<tbody>' + filas + '</tbody></table></div>'
      + '<div class="etapa-pie">'
      + '<span class="nota">' + esc(c.nota) + ' Las dosis son demostrativas: un programa real se ajusta con análisis de suelo, agua y foliar.</span>'
      + '<a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'
      + esc(waLink('Hola, vi el programa de ' + c.n + ' (' + e.n + ') en el demo de ' + D.brand.nombre + ' y quiero una web así para mi empresa.'))
      + '">Quiero un programa así</a>'
      + '</div>';
  }

  function initPrograma() {
    var cont = $('progCultivos');
    if (!cont) { return }
    for (var i = 0; i < D.cultivos.length; i++) {
      if (D.cultivos[i].listo) { progEstado.cultivo = D.cultivos[i].id; break }
    }
    pintarCultivos(); pintarRiel(); pintarEtapa();

    cont.addEventListener('click', function (ev) {
      var b = ev.target.closest('.cultivo-chip');
      if (!b || b.disabled) { return }
      progEstado.cultivo = b.dataset.c; progEstado.etapa = 0;
      pintarCultivos(); pintarRiel(); pintarEtapa();
    });

    var riel = $('etapaRiel');
    riel.addEventListener('click', function (ev) {
      var b = ev.target.closest('.etapa-btn');
      if (!b) { return }
      progEstado.etapa = +b.dataset.e;
      pintarRiel(); pintarEtapa();
    });
    /* Navegación con flechas entre etapas, como corresponde a un tablist. */
    riel.addEventListener('keydown', function (ev) {
      var c = cultivoActual();
      if (!c || !c.etapas.length) { return }
      var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1
        : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
      if (!d) { return }
      ev.preventDefault();
      progEstado.etapa = (progEstado.etapa + d + c.etapas.length) % c.etapas.length;
      pintarRiel(); pintarEtapa();
      var nuevo = riel.querySelector('[aria-selected="true"]');
      if (nuevo) { nuevo.focus() }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. CATÁLOGO
     ═══════════════════════════════════════════════════════════════════════════ */
  var filtro = { cultivo: '', cat: '', org: '' };

  function pasa(p) {
    if (filtro.cultivo && p.cultivos.indexOf(filtro.cultivo) === -1) { return false }
    if (filtro.cat && p.cat !== filtro.cat) { return false }
    if (filtro.org === 'si' && !p.org) { return false }
    if (filtro.org === 'no' && p.org) { return false }
    return true;
  }

  function pintarCatalogo() {
    var grid = $('catGrid'), cuenta = $('catCuenta');
    if (!grid) { return }
    var lista = D.productos.filter(pasa);
    if (cuenta) {
      cuenta.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
    }
    if (!lista.length) {
      grid.innerHTML = '<div class="vacio" style="grid-column:1/-1"><p>Ningún producto del catálogo demostrativo cumple esos filtros. Prueba con menos restricciones.</p></div>';
      return;
    }
    grid.innerHTML = lista.map(function (p) {
      return '<button type="button" class="prod-card" data-ficha="' + esc(p.id) + '">'
        + '<div class="cab"><div><span class="cat-lbl">' + esc(catLbl(p.cat)) + '</span>'
        + '<h3>' + esc(p.n) + '</h3></div>'
        + '<span class="form-lbl">' + esc(p.form) + '</span></div>'
        + '<span class="dosis-lbl">' + esc(p.dosis) + '</span>'
        + '<div class="pie">' + selloOrg(p) + '<span class="abrir">Ver ficha →</span></div>'
        + '</button>';
    }).join('');
  }

  function initCatalogo() {
    var grid = $('catGrid');
    if (!grid) { return }

    var selCultivo = $('fCultivo'), selCat = $('fCat'), selOrg = $('fOrg');
    if (selCultivo) {
      selCultivo.innerHTML = '<option value="">Todos</option>' + D.cultivos.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.n) + '</option>';
      }).join('');
    }
    if (selCat) {
      var claves = Object.keys(D.categorias);
      selCat.innerHTML = '<option value="">Todas</option>' + claves.map(function (k) {
        return '<option value="' + esc(k) + '">' + esc(D.categorias[k]) + '</option>';
      }).join('');
    }
    [selCultivo, selCat, selOrg].forEach(function (s) {
      if (!s) { return }
      s.addEventListener('change', function () {
        filtro.cultivo = selCultivo ? selCultivo.value : '';
        filtro.cat = selCat ? selCat.value : '';
        filtro.org = selOrg ? selOrg.value : '';
        pintarCatalogo();
      });
    });
    var limpiar = $('fLimpiar');
    if (limpiar) {
      limpiar.addEventListener('click', function () {
        if (selCultivo) { selCultivo.value = '' }
        if (selCat) { selCat.value = '' }
        if (selOrg) { selOrg.value = '' }
        filtro = { cultivo: '', cat: '', org: '' };
        pintarCatalogo();
      });
    }
    pintarCatalogo();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. FICHA (modal) + captura de lead
     ═══════════════════════════════════════════════════════════════════════════ */
  var ov = $('fichaOv'), caja = $('fichaCaja'), ultimoFoco = null;

  function abrirFicha(p) {
    if (!ov || !caja) { return }
    ultimoFoco = document.activeElement;

    var comp = p.comp.map(function (c) {
      return '<tr><th scope="row">' + esc(c[0]) + '</th><td>' + esc(c[1]) + '</td></tr>';
    }).join('');
    var cultivosTxt = p.cultivos.map(function (id) {
      for (var i = 0; i < D.cultivos.length; i++) { if (D.cultivos[i].id === id) return D.cultivos[i].n }
      return id;
    }).join(' · ');

    caja.innerHTML =
      '<button type="button" class="ficha-cerrar" id="fichaCerrar" aria-label="Cerrar ficha">✕</button>'
      + '<div class="ficha-cab">'
      + '<span class="cat-lbl">' + esc(catLbl(p.cat)) + ' · ' + esc(p.form) + '</span>'
      + '<h3 id="fichaTitulo">' + esc(p.n) + '</h3>'
      + '<div class="ficha-sellos">' + selloOrg(p)
      + (p.carencia && p.carencia !== 'Sin carencia'
        ? '<span class="sello sello--alerta">Carencia ' + esc(p.carencia) + '</span>'
        : '<span class="sello">Sin carencia</span>')
      + '</div></div>'
      + '<div class="ficha-cuerpo">'
      + '<p>' + esc(p.desc) + '</p>'
      + '<table class="ficha-comp"><caption>Composición declarada</caption><tbody>' + comp + '</tbody></table>'
      + '<dl class="ficha-datos">'
      + '<div><dt>Dosis</dt><dd class="med">' + esc(p.dosis) + '</dd></div>'
      + '<div><dt>Vía</dt><dd>' + esc(p.via) + '</dd></div>'
      + '<div><dt>Presentación</dt><dd>' + esc(p.pres) + '</dd></div>'
      + '<div><dt>Cultivos</dt><dd>' + esc(cultivosTxt) + '</dd></div>'
      + '</dl>'
      + '<p class="ficha-registro"><span>Registro ' + esc(D.registro) + '</span>'
      + '<span>·</span><span>' + esDemoTexto + ': producto de demostración, no comercializado</span></p>'
      + '<div class="ficha-ctas">'
      + '<button type="button" class="btn btn-solid" id="fichaLead">Solicitar ficha técnica</button>'
      + '<a class="btn btn-line" target="_blank" rel="noopener" href="'
      + esc(waLink('Hola, estoy viendo la ficha de "' + p.n + '" en el demo de ' + D.brand.nombre + '. Quiero una web así para mi empresa de agroinsumos.'))
      + '">Consultar por WhatsApp</a>'
      + '</div>'
      + '<div id="fichaForm"></div>'
      + '</div>';

    ov.classList.add('open');
    ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var cerrar = $('fichaCerrar');
    if (cerrar) { cerrar.focus(); cerrar.onclick = cerrarFicha }
    var lead = $('fichaLead');
    if (lead) { lead.onclick = function () { pintarFormLead(p) } }
  }

  function cerrarFicha() {
    if (!ov) { return }
    ov.classList.remove('open');
    ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) { ultimoFoco.focus() }
  }

  /* Captura de lead. Postea al mismo endpoint que usa la SPA y, si falla,
     cae a WhatsApp: el contacto no se pierde por un error de red. */
  function pintarFormLead(p) {
    var cont = $('fichaForm');
    if (!cont) { return }
    cont.innerHTML =
      '<form id="leadForm" style="margin-top:1.3rem;border-top:1px solid var(--linea);padding-top:1.2rem">'
      + '<div class="filtros" style="margin:0 0 .9rem;padding:0;border:0;background:none">'
      + '<div class="campo"><label for="leadN">Nombre</label>'
      + '<input id="leadN" name="n" required autocomplete="name" style="border:1px solid var(--linea-2);background:var(--papel);padding:.6rem .7rem;font-size:.88rem" /></div>'
      + '<div class="campo"><label for="leadT">WhatsApp</label>'
      + '<input id="leadT" name="t" required inputmode="tel" autocomplete="tel" style="border:1px solid var(--linea-2);background:var(--papel);padding:.6rem .7rem;font-size:.88rem" /></div>'
      + '</div>'
      + '<button type="submit" class="btn btn-solid btn-sm">Enviar solicitud</button>'
      + '<p class="calc-aviso" id="leadMsg" role="status" aria-live="polite">Es un demo: el envío llega al CRM de DAK Agency, no a una empresa de agroinsumos.</p>'
      + '</form>';

    var f = $('leadForm');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = $('leadMsg');
      var nombre = $('leadN').value.trim(), tel = $('leadT').value.trim();
      if (!nombre || !tel) { return }
      msg.textContent = 'Enviando…';
      var payload = {
        name: nombre, phone: tel, email: '',
        service: 'Demo agroinsumos',
        message: 'Solicitó la ficha técnica de "' + p.n + '" en el demo ' + D.brand.nombre + '.',
        source: 'agro-demo-ficha'
      };
      fetch(API + '/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) { throw new Error('http ' + r.status) }
        msg.textContent = 'Listo, ' + nombre + '. Registrado en el CRM — así de rápido llega un lead con este sistema.';
        f.querySelector('button[type="submit"]').disabled = true;
      })['catch'](function () {
        /* Sin conexión con el CRM: el lead se rescata por WhatsApp. */
        msg.innerHTML = 'No pudimos registrarlo automáticamente. '
          + '<a href="' + esc(waLink('Hola, soy ' + nombre + ' (' + tel + '). Pedí la ficha de "' + p.n + '" en el demo de agroinsumos.'))
          + '" target="_blank" rel="noopener" style="color:var(--acento);text-decoration:underline">Enviarlo por WhatsApp</a>.';
      });
    });
    var n = $('leadN');
    if (n) { n.focus() }
  }

  function initFicha() {
    if (!ov) { return }
    ov.addEventListener('click', function (ev) { if (ev.target === ov) { cerrarFicha() } });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && ov.classList.contains('open')) { cerrarFicha() }
    });
    /* Un solo delegado para todo botón que pida una ficha, venga de la tabla
       de etapas, del catálogo o del diagnóstico. */
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ficha]');
      if (!b) { return }
      var p = prod(b.dataset.ficha);
      if (p) { abrirFicha(p) }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4. CALCULADORA DE DOSIS
     ═══════════════════════════════════════════════════════════════════════════ */
  function initCalc() {
    var sel = $('cProd'), ha = $('cHa'), dos = $('cDos');
    if (!sel || !ha || !dos) { return }

    /* Solo productos con dosis por hectárea: los coadyuvantes se dosifican por
       100 L de caldo y meterlos daría una cifra equivocada. */
    var elegibles = D.productos.filter(function (p) { return !!parseDosis(p.dosis) });
    sel.innerHTML = elegibles.map(function (p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.n) + '</option>';
    }).join('');

    function actual() { return prod(sel.value) || elegibles[0] }

    function sincronizarRango() {
      var r = parseDosis(actual().dosis);
      dos.min = r.min; dos.max = r.max;
      dos.step = (r.max - r.min) > 3 ? 0.5 : 0.1;
      dos.value = ((r.min + r.max) / 2).toFixed(1);
    }

    function recalcular() {
      var p = actual(), r = parseDosis(p.dosis);
      var hect = +ha.value, d = +dos.value;
      var total = d * hect;
      var costoHa = d * p.precio;

      $('cHaOut').textContent = hect + ' ha';
      $('cDosOut').textContent = d.toFixed(1) + ' ' + r.u + '/ha';
      $('cUnid').textContent = total.toFixed(1) + ' ' + r.u;
      $('cCostoHa').textContent = soles(costoHa);
      $('cCostoTotal').textContent = soles(costoHa * hect);
      $('cPres').textContent = p.pres;
    }

    sel.addEventListener('change', function () { sincronizarRango(); recalcular() });
    ha.addEventListener('input', recalcular);
    dos.addEventListener('input', recalcular);
    sincronizarRango(); recalcular();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     5. DIAGNÓSTICO POR SÍNTOMA
     ═══════════════════════════════════════════════════════════════════════════ */
  function initSintomas() {
    var grid = $('sintGrid'), det = $('sintDetalle');
    if (!grid || !det) { return }
    var sel = D.sintomas[0].id;

    function pintar() {
      grid.innerHTML = D.sintomas.map(function (s) {
        return '<button type="button" class="sint-btn" data-s="' + esc(s.id) + '"'
          + ' aria-pressed="' + (s.id === sel ? 'true' : 'false') + '">'
          + '<b>' + esc(s.n) + '</b><i>' + esc(s.cien) + '</i></button>';
      }).join('');

      var s = D.sintomas.filter(function (x) { return x.id === sel })[0];
      if (!s) { return }
      // Solo se parte en dos columnas si este síntoma tiene lámina; si no, el
      // texto ocupa el ancho completo en vez de dejar un hueco.
      det.className = 'sint-detalle' + (s.img ? ' sint-detalle--foto' : '');
      var foto = s.img
        ? lamina({ src: s.img, n: 'Referencia', alt: s.imgAlt, pie: s.imgPie }, 'alta')
        : '';
      det.innerHTML = (foto ? '<div>' : '')
        + '<h3>' + esc(s.n) + '</h3>'
        + '<p class="cien">' + esc(s.cien) + '</p>'
        + '<dl>'
        + '<div><dt>Qué se ve en campo</dt><dd>' + esc(s.senal) + '</dd></div>'
        + '<div><dt>Por qué pasa</dt><dd>' + esc(s.causa) + '</dd></div>'
        + '</dl>'
        + '<dt style="font-family:var(--mono);font-size:var(--fs-min);letter-spacing:.1em;text-transform:uppercase;color:var(--tinta-3);margin-bottom:.6rem">Del catálogo, para este caso</dt>'
        + '<div class="sint-prods">' + s.prods.map(function (id) {
          var p = prod(id);
          if (!p) { return '' }
          return '<button type="button" class="btn btn-line btn-sm" data-ficha="' + esc(p.id) + '">'
            + esc(p.n) + '</button>';
        }).join('') + '</div>'
        + (foto ? '</div>' + foto : '');
    }

    grid.addEventListener('click', function (ev) {
      var b = ev.target.closest('.sint-btn');
      if (!b) { return }
      sel = b.dataset.s; pintar();
    });
    pintar();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     6. ZONAS / REPRESENTANTES
     ═══════════════════════════════════════════════════════════════════════════ */
  function initZonas() {
    var cont = $('zonasGrid');
    if (!cont) { return }
    cont.innerHTML = D.reps.map(function (r) {
      return '<div class="zona">'
        + '<div class="z-n">' + esc(r.zona) + '</div>'
        + '<h3>' + esc(r.n) + '</h3>'
        + '<p>' + esc(r.detalle) + '</p>'
        + '<a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="'
        + esc(waLink('Hola, escribo desde ' + r.zona + '. Vi el demo de ' + D.brand.nombre + ' y quiero una web así para mi empresa.'))
        + '">Escribir</a>'
        + '</div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     7. Cascarón: marca, nav y entrada de secciones
     ═══════════════════════════════════════════════════════════════════════════ */
  function initCascaron() {
    /* Marca gráfica y textos que vienen de los datos, para que el skin no
       tenga que tocar el HTML más de lo necesario. */
    var mark = $('brandMark');
    if (mark) { mark.innerHTML = D.brand.marca }
    document.querySelectorAll('[data-brand="nombre"]').forEach(function (el) { el.textContent = D.brand.nombre });
    document.querySelectorAll('[data-brand="bajada"]').forEach(function (el) { el.textContent = D.brand.bajada });
    document.querySelectorAll('[data-brand="claim"]').forEach(function (el) { el.textContent = D.brand.claim });
    document.querySelectorAll('[data-brand="intro"]').forEach(function (el) { el.textContent = D.brand.intro });
    document.querySelectorAll('[data-brand="ciudad"]').forEach(function (el) { el.textContent = D.brand.ciudad });
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      el.href = waLink(el.dataset.wa || ('Hola, vi el demo de ' + D.brand.nombre + ' y quiero una web así para mi empresa.'));
    });
    /* Láminas de sección: el HTML solo declara el contenedor y qué lámina va
       en él, así el cascarón no repite marcado por cada foto. */
    var L = (D.brand && D.brand.laminas) || {};
    document.querySelectorAll('[data-lamina]').forEach(function (el) {
      var l = L[el.dataset.lamina];
      if (!l) { el.remove(); return }   // sin foto no queda un hueco vacío
      el.innerHTML = lamina(l, el.dataset.forma || 'ancha', el.dataset.clase || '');
    });

    var nProd = $('statProd'), nCult = $('statCult');
    if (nProd) { nProd.textContent = D.productos.length }
    if (nCult) {
      nCult.textContent = D.cultivos.filter(function (c) { return c.listo }).length + ' de ' + D.cultivos.length;
    }

    var burger = $('navBurger'), links = $('navLinks');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var ab = links.classList.toggle('abierto');
        burger.setAttribute('aria-expanded', ab ? 'true' : 'false');
      });
      links.addEventListener('click', function (ev) {
        if (ev.target.tagName === 'A') {
          links.classList.remove('abierto');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* Entrada discreta de secciones. El estado oculto vive bajo .js (ver
       core.css): si este archivo no se ejecuta, no hay nada oculto que revelar. */
    var revs = document.querySelectorAll('.reveal');
    function revelarTodo() { revs.forEach(function (r) { r.classList.add('in') }) }

    if (!('IntersectionObserver' in window)) { revelarTodo(); return }

    var disparo = false;
    var io = new IntersectionObserver(function (entradas) {
      disparo = true;
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    revs.forEach(function (r) { io.observe(r) });

    /* Red de seguridad: si el observer no llegó a correr (pestaña abierta en
       segundo plano, documento oculto, motor que se atraganta), se muestra todo.
       Vale más perder la animación que enseñar una página vacía. */
    setTimeout(function () { if (!disparo) { revelarTodo() } }, 2000);
  }

  /* ── Arranque ───────────────────────────────────────────────────────────── */
  function init() {
    initCascaron();
    initPrograma();
    initCatalogo();
    initFicha();
    initCalc();
    initSintomas();
    initZonas();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init() }
})();
