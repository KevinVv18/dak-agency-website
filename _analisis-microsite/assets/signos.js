/* ============================================================================
   signos.js — la navegación del mundo «Signos vitales»

   Hace tres cosas y ninguna dibuja datos: construye el riel de derivaciones y
   el índice leyendo las <section data-ch="…">, mueve la barra de avance, y
   deja que el informe se recorra con el teclado como un mando de diapositivas,
   porque se proyecta en reunión.

   Los gráficos NO viven aquí. El 2026-09-02 se retiró el dibujante de trazos en
   SVG que había en este archivo: mezclaba "vector-effect:non-scaling-stroke"
   con un "stroke-dasharray" sacado de getTotalLength() —uno mide en píxeles
   renderizados y el otro en unidades del viewBox—, así que en ciertos anchos la
   línea se cortaba antes de su último punto. Y sobre todo: no se entendía.
   Ahora los datos son cajas de CSS escritas en el propio informe, que no
   dependen de este archivo ni se pueden deformar.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    switch (e.key) {
      case 'ArrowDown': case 'PageDown': case ' ': go(current() + 1); e.preventDefault(); break;
      case 'ArrowUp': case 'PageUp': go(current() - 1); e.preventDefault(); break;
      case 'Home': go(0); e.preventDefault(); break;
      case 'End': go(secs.length - 1); e.preventDefault(); break;
      case 'Escape': closeIdx(); break;
    }
  });
})();
