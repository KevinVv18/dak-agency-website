// Comportamiento compartido de los entregables de análisis de marca.
//
// Se construye TODO leyendo el DOM: los capítulos salen de las <section> y sus
// títulos de los <h1>/<h2>. Un informe nuevo no necesita añadir ni una marca
// extra — se copia la plantilla, se escriben las secciones y esto funciona solo.
//
// El ocultado inicial lo activa la clase .js que pone el <head>; sin JS la
// página se ve completa a propósito: va a un cliente, no puede quedar en blanco.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function revelarTodo() {
    document.querySelectorAll('.rv').forEach(function (e) { e.classList.add('in'); });
    document.querySelectorAll('.bfill').forEach(function (b) { b.style.width = b.dataset.pct + '%'; });
    document.querySelectorAll('[data-num]').forEach(function (e) { e.textContent = e.dataset.num; });
  }

  try {
    var secciones = [].slice.call(document.querySelectorAll('section'));
    var btnMenu = null;

    // ---- Barra de progreso -------------------------------------------------
    var prog = document.getElementById('prog');
    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Título de cada capítulo, sacado del propio contenido --------------
    // Algunas secciones son solo una tesis, sin titular. En esas el kicker
    // ("El diagnóstico", "El riesgo número uno") es el mejor nombre posible;
    // "Sección 2" no le sirve a nadie en una reunión.
    function tituloDe(sec, i) {
      var h = sec.querySelector('h1, h2') || sec.querySelector('.kick');
      var t = h ? h.textContent.replace(/\s+/g, ' ').trim() : 'Sección ' + (i + 1);
      t = t.replace(/^\d{2}\s*/, '');            // el número lo pone el propio índice
      return t.length > 46 ? t.slice(0, 44).replace(/\s+$/, '') + '…' : t;
    }
    secciones.forEach(function (s, i) { if (!s.id) s.id = 'cap-' + (i + 1); });

    // ---- Riel de capítulos (escritorio) + índice desplegable (móvil) -------
    var rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Capítulos del informe');

    var idx = document.createElement('div');
    idx.className = 'idx';
    idx.innerHTML = '<h4>Contenido del informe</h4><ol></ol>';
    var lista = idx.querySelector('ol');

    secciones.forEach(function (s, i) {
      var t = tituloDe(s, i);

      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="tick"></span><span class="lbl"></span>';
      b.lastChild.textContent = (i + 1 < 10 ? '0' : '') + (i + 1) + '  ' + t;
      b.title = t;
      b.addEventListener('click', function () { irA(i); });
      rail.appendChild(b);

      var li = document.createElement('li');
      var b2 = document.createElement('button');
      b2.type = 'button';
      b2.textContent = t;
      b2.addEventListener('click', function () { cerrarIndice(); irA(i); });
      li.appendChild(b2);
      lista.appendChild(li);
    });
    document.body.appendChild(rail);
    document.body.appendChild(idx);

    var botones = [].slice.call(rail.children);

    function abrirIndice() { idx.classList.add('open'); if (btnMenu) btnMenu.setAttribute('aria-expanded', 'true'); }
    function cerrarIndice() { idx.classList.remove('open'); if (btnMenu) btnMenu.setAttribute('aria-expanded', 'false'); }
    idx.addEventListener('click', function (e) { if (e.target === idx) cerrarIndice(); });

    // Botón de índice en la barra fija, justo antes del de PDF
    var bar = document.querySelector('.bar');
    if (bar) {
      btnMenu = document.createElement('button');
      btnMenu.type = 'button';
      btnMenu.className = 'menu';
      btnMenu.textContent = 'Índice';
      btnMenu.setAttribute('aria-expanded', 'false');
      btnMenu.addEventListener('click', function () {
        idx.classList.contains('open') ? cerrarIndice() : abrirIndice();
      });
      var pdf = bar.querySelector('.pdf');
      pdf ? bar.insertBefore(btnMenu, pdf) : bar.appendChild(btnMenu);
    }

    // ---- Navegación: en reunión esto tiene que comportarse como un deck ----
    var actual = 0;
    function irA(i) {
      i = Math.max(0, Math.min(secciones.length - 1, i));
      actual = i;
      secciones[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { cerrarIndice(); return; }
      var k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); irA(actual + 1); }
      else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); irA(actual - 1); }
      else if (k === 'Home') { e.preventDefault(); irA(0); }
      else if (k === 'End') { e.preventDefault(); irA(secciones.length - 1); }
    });

    // ---- Cifras que suben --------------------------------------------------
    // Solo la primera cifra del texto; se conserva prefijo y sufijo tal cual
    // ("~99", "0.12 %", "4.5★"). En un rango como "S/ 1,200 – 2,000" anima el
    // primer número y deja el resto intacto.
    function prepararConteo(el) {
      var m = el.textContent.match(/^(\D*?)([\d.,]+)([\s\S]*)$/);
      if (!m) return null;
      var crudo = m[2];
      var milesConComa = crudo.indexOf(',') > -1 && crudo.indexOf('.') === -1;
      var limpio = milesConComa ? crudo.replace(/,/g, '') : crudo;
      var valor = parseFloat(limpio);
      if (!isFinite(valor) || valor === 0) return null;
      var dec = (limpio.split('.')[1] || '').length;
      el.dataset.num = el.textContent;
      return { el: el, pre: m[1], post: m[3], valor: valor, dec: dec, milesConComa: milesConComa };
    }
    function formatea(n, c) {
      var s = c.dec ? n.toFixed(c.dec) : String(Math.round(n));
      if (c.milesConComa) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return c.pre + s + c.post;
    }
    function contar(c) {
      if (reduce) { c.el.textContent = c.el.dataset.num; return; }
      var t0 = null, dur = 900;
      function paso(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);          // salida suave, sin rebote
        c.el.textContent = formatea(c.valor * e, c);
        if (p < 1) requestAnimationFrame(paso); else c.el.textContent = c.el.dataset.num;
      }
      requestAnimationFrame(paso);
    }
    var conteos = new Map();
    if (!reduce) {
      document.querySelectorAll('.stat, .bval').forEach(function (el) {
        var c = prepararConteo(el);
        if (c) { conteos.set(el, c); el.textContent = formatea(0, c); }
      });
    }

    // ---- Reveal, barras y conteo al entrar en pantalla ---------------------
    if (!('IntersectionObserver' in window) || reduce) return revelarTodo();

    function dispararConteos(raiz) {
      var els = [].slice.call(raiz.querySelectorAll('.stat, .bval'));
      if (raiz.matches && raiz.matches('.stat, .bval')) els.unshift(raiz);
      els.forEach(function (el) {
        if (conteos.has(el)) { contar(conteos.get(el)); conteos.delete(el); }
      });
    }

    var ioRespondio = false;
    var io = new IntersectionObserver(function (es) {
      ioRespondio = true;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.parentElement) e.target.parentElement.classList.add('in');
        e.target.querySelectorAll('.bfill').forEach(function (b, i) {
          setTimeout(function () { b.style.width = b.dataset.pct + '%'; }, 120 * i);
        });
        dispararConteos(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    document.querySelectorAll('.rv').forEach(function (e) { io.observe(e); });

    // Cifras que no cuelgan de un .rv
    var ioNum = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (conteos.has(e.target)) { contar(conteos.get(e.target)); conteos.delete(e.target); }
        ioNum.unobserve(e.target);
      });
    }, { threshold: .5 });
    conteos.forEach(function (_, el) { ioNum.observe(el); });

    // ---- Capítulo activo: pinta el riel y fija el punto de partida ---------
    var ioSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secciones.indexOf(e.target);
        if (i < 0) return;
        actual = i;
        botones.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
        document.body.classList.toggle('dark-view', e.target.classList.contains('dark'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    secciones.forEach(function (s) { ioSec.observe(s); });

    // Red de seguridad: el observer siempre emite una primera devolución por
    // cada elemento observado. Si a los 1,2 s no emitió NINGUNA, está roto y se
    // muestra todo. (Comprobar `.rv.in` en su lugar sería un falso positivo:
    // arriba del todo no hay nada que revelar todavía.)
    setTimeout(function () { if (!ioRespondio) revelarTodo(); }, 1200);
  } catch (err) {
    revelarTodo();
  }
})();
