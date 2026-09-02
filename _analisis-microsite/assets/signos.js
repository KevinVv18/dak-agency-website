/* ============================================================================
   signos.js — el instrumento del mundo «Signos vitales»

   Un informe nuevo no escribe SVG a mano: declara los datos en el HTML y este
   archivo dibuja el trazo. Todo lo que se ve sale de un atributo `data-*`, así
   que cuando una cifra se corrige, se corrige en un solo sitio.

   <div class="strip-c"
        data-from="2026-06-29" data-to="2026-09-02"
        data-series="2026-06-29:0|2026-07-06:4|…"   ← el trazo de la marca
        data-flat="2026-07-25"                       ← desde aquí, línea plana
        data-flat-label="39 días sin publicar"
        data-ticks="2026-08-31:Mundo Color|…"        ← ráfaga de la categoría
        data-ticks-label="anuncios encendidos"
        data-unit="me gusta">

   Si el JavaScript no carga, la página se lee entera: los trazos son el único
   elemento que desaparece, y cada uno lleva su cifra escrita al lado en texto.
   ========================================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function el(n, a) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]);
    return e;
  }
  function day(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5; }
  function fecha(d) { var t = new Date(d * 864e5); return t.getUTCDate() + ' ' + MES[t.getUTCMonth()]; }

  /* ── Campos de trazo ─────────────────────────────────────────────────── */

  var W = 1000, PL = 36, PR = 14;
  var A_TOP = 18, A_BOT = 96;          // carril de la marca
  var B_TOP = 112, B_BOT = 152;        // carril de la categoría

  function strip(box) {
    var from = day(box.dataset.from), to = day(box.dataset.to);
    var span = Math.max(1, to - from);
    var ticks = (box.dataset.ticks || '').split('|').filter(Boolean).map(function (t) {
      var i = t.indexOf(':');
      return { d: day(t.slice(0, i)), n: t.slice(i + 1) };
    });
    var H = ticks.length ? 168 : 116;
    var pts = (box.dataset.series || '').split('|').filter(Boolean).map(function (p) {
      var s = p.split(':');
      return { d: day(s[0]), v: +s[1] };
    });
    var max = Math.max(1, +(box.dataset.max || 0), pts.reduce(function (m, p) { return Math.max(m, p.v); }, 0));

    var x = function (d) { return PL + (d - from) / span * (W - PL - PR); };
    var y = function (v) { return A_BOT - (v / max) * (A_BOT - A_TOP); };

    /* El SVG se estira libremente para llenar el campo; por eso NINGÚN rótulo
       vive dentro de él: el texto se deformaría. Las etiquetas van en HTML
       encima, colocadas en porcentaje sobre el mismo sistema de coordenadas. */
    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none',
      role: 'img', 'aria-label': box.dataset.alt || ''
    });
    var pc = function (v) { return (v / W * 100) + '%'; };
    var pv = function (v) { return (v / H * 100) + '%'; };
    function tag(cls, txt, left, top, extra) {
      var s = document.createElement('span');
      s.className = 'ov ' + cls;
      s.textContent = txt;
      s.style.left = left; s.style.top = top;
      if (extra) s.style.cssText += extra;
      return s;
    }

    /* Papel milimetrado: existe solo dentro del campo */
    var g = el('g', { 'aria-hidden': 'true' }), i;
    for (i = PL; i <= W - PR; i += 20)
      g.appendChild(el('line', { x1: i, y1: 8, x2: i, y2: H - 18, stroke: 'var(--grid-min)', 'stroke-width': 1 }));
    for (i = PL; i <= W - PR; i += 100)
      g.appendChild(el('line', { x1: i, y1: 8, x2: i, y2: H - 18, stroke: 'var(--grid-maj)', 'stroke-width': 1 }));
    for (i = A_TOP; i <= (ticks.length ? B_BOT : A_BOT); i += 13)
      g.appendChild(el('line', { x1: PL, y1: i, x2: W - PR, y2: i, stroke: 'var(--grid-min)', 'stroke-width': 1 }));
    svg.appendChild(g);

    /* Línea de base */
    svg.appendChild(el('line', { x1: PL, y1: A_BOT, x2: W - PR, y2: A_BOT, class: 'tr-base', stroke: 'currentColor' }));

    /* Banda de silencio */
    var flat = box.dataset.flat ? day(box.dataset.flat) : null;
    if (flat !== null) {
      svg.appendChild(el('rect', { x: x(flat), y: 8, width: Math.max(0, x(to) - x(flat)), height: (ticks.length ? B_BOT : A_BOT) - 8, class: 'band' }));
      svg.appendChild(el('line', { x1: x(flat), y1: 8, x2: x(flat), y2: (ticks.length ? B_BOT : A_BOT), class: 'band-e' }));
    }

    /* Trazo de la marca: latido hasta el corte, plano después */
    var live = pts.filter(function (p) { return flat === null || p.d <= flat; });
    if (live.length) {
      var d = live.map(function (p, k) { return (k ? 'L' : 'M') + x(p.d).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' ');
      var path = el('path', { d: d, class: 'tr tr-subject sweep' });
      svg.appendChild(path);
    }
    if (flat !== null) {
      var fl = el('path', { d: 'M' + x(flat).toFixed(1) + ' ' + A_BOT + ' L' + x(to).toFixed(1) + ' ' + A_BOT, class: 'tr tr-flat sweep' });
      svg.appendChild(fl);
    }

    /* Marcas de publicación: el cero se dibuja hueco, no se esconde */
    live.forEach(function (p) {
      svg.appendChild(el('circle', {
        cx: x(p.d), cy: y(p.v), r: 2.6,
        class: 'fade ' + (p.v ? 'dot' : 'dot-zero')
      }));
    });

    /* Filete de la banda de silencio; su rótulo se añade después, en HTML */
    if (flat !== null && box.dataset.flatLabel) {
      svg.appendChild(el('line', { x1: x(flat), y1: A_TOP - 6, x2: x(to), y2: A_TOP - 6, class: 'band-e', 'stroke-dasharray': '2 2' }));
    }

    /* Carril de la categoría: una marca por anuncio, apiladas por día */
    if (ticks.length) {
      svg.appendChild(el('line', { x1: PL, y1: B_BOT, x2: W - PR, y2: B_BOT, class: 'tr-base', stroke: 'currentColor' }));
      var byDay = {};
      ticks.forEach(function (t) { (byDay[t.d] = byDay[t.d] || []).push(t); });
      Object.keys(byDay).forEach(function (k) {
        byDay[k].forEach(function (t, n) {
          var h = 7 + n * 6.5;
          svg.appendChild(el('line', {
            x1: x(t.d), y1: B_BOT, x2: x(t.d), y2: Math.max(B_TOP, B_BOT - h),
            class: 'tick fade'
          }));
        });
      });
    }

    /* Cursor de medición */
    var cur = el('g', { class: 'cur', 'aria-hidden': 'true' });
    var cl = el('line', { x1: 0, y1: 8, x2: 0, y2: (ticks.length ? B_BOT : A_BOT) });
    cur.appendChild(cl);
    svg.appendChild(cur);

    /* Campo: el SVG llena el espacio, los rótulos flotan encima en HTML */
    var field = document.createElement('div');
    field.className = 'field';
    field.appendChild(svg);
    box.insertBefore(field, box.firstChild);

    /* Escala del eje vertical: sin rótulo, un trazo no se puede leer */
    field.appendChild(tag('ax', String(max), '2px', pv(y(max)), 'transform:translateY(-50%)'));
    field.appendChild(tag('ax', '0', '2px', pv(A_BOT), 'transform:translateY(-50%)'));

    if (flat !== null && box.dataset.flatLabel) {
      field.appendChild(tag('ov-a fade', box.dataset.flatLabel,
        pc((x(flat) + x(to)) / 2), pv(A_TOP - 14), 'transform:translate(-50%,-50%)'));
    }
    if (ticks.length && box.dataset.ticksLabel) {
      /* En el hueco vacío del carril de anuncios, a la izquierda de la ráfaga */
      field.appendChild(tag('fade', box.dataset.ticksLabel, pc(PL), pv(B_BOT),
        'transform:translateY(-135%)'));
    }

    var read = document.createElement('span');
    read.className = 'read';
    field.appendChild(read);

    /* Eje horizontal en meses reales */
    var axis = document.createElement('div');
    axis.className = 'axis';
    var m0 = new Date(from * 864e5), m1 = new Date(to * 864e5), labels = [];
    var cur2 = new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth(), 1));
    while (cur2 <= m1) {
      labels.push(MES[cur2.getUTCMonth()]);
      cur2 = new Date(Date.UTC(cur2.getUTCFullYear(), cur2.getUTCMonth() + 1, 1));
    }
    axis.innerHTML = labels.map(function (l) { return '<span>' + l + '</span>'; }).join('');
    box.appendChild(axis);

    /* Longitud real de cada trazo, para que el barrido dure lo mismo en todos */
    Array.prototype.forEach.call(svg.querySelectorAll('.sweep'), function (p) {
      try { p.style.setProperty('--len', p.getTotalLength() || 1); } catch (e) { }
    });

    /* Medir: puntero, dedo y teclado */
    var idx = -1;
    function place(k) {
      if (!live.length) return;
      idx = Math.max(0, Math.min(live.length - 1, k));
      var p = live[idx], px = x(p.d);
      cl.setAttribute('x1', px); cl.setAttribute('x2', px);
      read.textContent = fecha(p.d) + '  ·  ' + p.v + ' ' + (box.dataset.unit || '');
      read.style.left = ((px / W) * 100) + '%';
      box.classList.add('live');
    }
    function nearest(clientX) {
      var r = svg.getBoundingClientRect();
      var vx = ((clientX - r.left) / r.width) * W;
      var best = 0, bd = Infinity;
      live.forEach(function (p, k) { var dd = Math.abs(x(p.d) - vx); if (dd < bd) { bd = dd; best = k; } });
      return best;
    }
    if (live.length) {
      box.tabIndex = 0;
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', (box.dataset.alt || 'Trazo') + '. Usa las flechas para recorrer los puntos.');
      box.addEventListener('pointermove', function (e) { place(nearest(e.clientX)); });
      box.addEventListener('pointerleave', function () { box.classList.remove('live'); });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { place(idx + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { place(idx < 0 ? live.length - 1 : idx - 1); e.preventDefault(); }
        else if (e.key === 'Escape') { box.classList.remove('live'); }
      });
      box.addEventListener('blur', function () { box.classList.remove('live'); });
    }

    return box;
  }

  var boxes = [].slice.call(document.querySelectorAll('.strip-c[data-from]'));
  boxes.forEach(strip);

  /* El barrido ocurre cuando el campo entra en pantalla, una sola vez */
  if (reduce || !('IntersectionObserver' in window)) {
    boxes.forEach(function (b) { b.classList.add('drawn'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    boxes.forEach(function (b) { io.observe(b); });
  }

  /* ── Riel de derivaciones e índice ───────────────────────────────────── */

  var secs = [].slice.call(document.querySelectorAll('section[data-ch]'));
  var rail = document.querySelector('.deriv');
  var idxw = document.querySelector('.idxw');
  var idxNav = idxw && idxw.querySelector('nav');
  var btns = [];

  secs.forEach(function (s, i) {
    if (!s.id) s.id = 'd' + (i + 1);
    var name = s.dataset.ch;
    if (rail) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', name);
      b.innerHTML = '<span>' + name + '</span>';
      b.addEventListener('click', function () { go(i); });
      rail.appendChild(b);
      btns.push(b);
    }
    if (idxNav) {
      var g = document.createElement('button');
      g.type = 'button'; g.className = 'go';
      g.innerHTML = '<em>' + String(i + 1).padStart(2, '0') + '</em>' + name;
      g.addEventListener('click', function () { closeIdx(); go(i); });
      idxNav.appendChild(g);
    }
  });

  function go(i) {
    var s = secs[Math.max(0, Math.min(secs.length - 1, i))];
    if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function current() {
    var y = window.scrollY + window.innerHeight * 0.32, k = 0;
    secs.forEach(function (s, i) { if (s.offsetTop <= y) k = i; });
    return k;
  }

  var prog = document.getElementById('prog');
  var raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var k = current();
      btns.forEach(function (b, i) { b.setAttribute('aria-current', i === k ? 'true' : 'false'); });
      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  function openIdx() { if (idxw) { idxw.classList.add('on'); document.body.style.overflow = 'hidden'; } }
  function closeIdx() { if (idxw) { idxw.classList.remove('on'); document.body.style.overflow = ''; } }
  var idxBtn = document.getElementById('idxbtn');
  if (idxBtn) idxBtn.addEventListener('click', openIdx);
  if (idxw) idxw.addEventListener('click', function (e) { if (e.target === idxw) closeIdx(); });

  /* Teclado: se comporta como un mando de diapositivas porque se proyecta */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (t && t.classList && t.classList.contains('strip-c')) return;
    switch (e.key) {
      case 'ArrowDown': case 'PageDown': case ' ': go(current() + 1); e.preventDefault(); break;
      case 'ArrowUp': case 'PageUp': go(current() - 1); e.preventDefault(); break;
      case 'Home': go(0); e.preventDefault(); break;
      case 'End': go(secs.length - 1); e.preventDefault(); break;
      case 'Escape': closeIdx(); break;
    }
  });
})();
