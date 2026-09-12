/*
 * El gesto de firma del catálogo: la pestaña de canto.
 *
 * En el índice y en los archivos, las pestañas son las ocho secciones y las
 * pinta PHP. Dentro de una entrada, son los apartados de esa entrada y las
 * construye este archivo desde los h2 del cuerpo — sin pedirle nada al
 * generador de contenido, que hoy emite mediana 9 y máximo 13 h2 por entrada.
 *
 * Reglas que se respetan aquí:
 *   · Se toca una clase; el desplazamiento lo hace transform en CSS.
 *   · IntersectionObserver, no listeners de scroll: cero trabajo por frame.
 *   · Sin soporte, las pestañas siguen siendo enlaces que funcionan, y el
 *     índice plegado del cuerpo cubre la navegación igual.
 */
(function () {
  'use strict';

  // ── 1. Apartados de la entrada ────────────────────────────────────
  // Se construye ANTES del observador para que el índice exista igual
  // aunque el navegador no soporte IntersectionObserver.
  var cuerpo = document.querySelector('.articulo-cuerpo');
  var articulo = document.querySelector('.articulo');

  if (cuerpo && articulo) {
    var apartados = [].slice.call(cuerpo.querySelectorAll('h2'));

    if (apartados.length) {
      // El canto de la entrada vive DENTRO de la retícula, en su columna.
      // Si el hueco no existe (plantilla vieja en caché), no se pinta nada:
      // el índice plegado del cuerpo ya cubre la navegación.
      var hueco = document.querySelector('.articulo-canto');
      if (!hueco) return;

      var rail = document.createElement('div');
      rail.className = 'canto-pegado';

      var titulo = document.createElement('p');
      titulo.className = 'rotulo canto-titulo';
      titulo.textContent = 'Apartados';
      rail.appendChild(titulo);

      var plegado = document.querySelector('.indice-plegado ol');

      apartados.forEach(function (h, i) {
        var texto = (h.textContent || '').trim();
        if (!texto) return;

        if (!h.id) {
          h.id =
            'apartado-' +
            (i + 1) +
            '-' +
            texto
              .toLowerCase()
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 40);
        }

        var num = (i + 1 < 10 ? '0' : '') + (i + 1);

        var tab = document.createElement('a');
        tab.className = 'canto-pestana';
        tab.href = '#' + h.id;
        tab.innerHTML =
          '<span class="codigo"></span><span class="nombre"></span>';
        tab.firstChild.textContent = num;
        tab.lastChild.textContent = texto;
        rail.appendChild(tab);

        if (plegado) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.innerHTML = '<span class="codigo"></span><span></span>';
          a.firstChild.textContent = num;
          a.lastChild.textContent = texto;
          li.appendChild(a);
          plegado.appendChild(li);
        }
      });

      // Un titulo solo no es un indice: hacen falta pestanas.
      if (rail.children.length > 1) {
        hueco.appendChild(rail);
      }

      var cuenta = document.querySelector('[data-apartados]');
      if (cuenta) cuenta.textContent = String(apartados.length);
    }
  }

  // ── 2. Copiar el enlace ───────────────────────────────────────────
  [].forEach.call(document.querySelectorAll('.compartir-boton.es-copiar'), function (b) {
    if (!navigator.clipboard) {
      b.hidden = true;
      return;
    }
    b.addEventListener('click', function () {
      navigator.clipboard
        .writeText(b.getAttribute('data-url') || window.location.href)
        .then(function () {
          b.classList.add('es-copiado');
          window.setTimeout(function () {
            b.classList.remove('es-copiado');
          }, 1600);
        });
    });
  });

  // ── 3. La pestaña que sigue al lector ─────────────────────────────
  var pestanas = document.querySelectorAll('.canto-pestana');
  var hitos = document.querySelectorAll('.seccion[id], .articulo-cuerpo h2[id]');

  if (!pestanas.length || !hitos.length || !('IntersectionObserver' in window)) {
    return;
  }

  // Índice: id del hito -> pestaña que le corresponde.
  var porId = {};

  [].forEach.call(pestanas, function (pestana) {
    var href = pestana.getAttribute('href') || '';

    if (href.charAt(0) === '#') {
      porId[href.slice(1)] = pestana; // apartado de la entrada
      return;
    }

    var slug = href.replace(/\/$/, '').split('/').pop();
    if (slug) porId['seccion-' + slug] = pestana; // sección del catálogo
  });

  var visibles = Object.create(null);

  function repintar() {
    var activa = null;
    var mejor = Infinity;

    [].forEach.call(hitos, function (hito) {
      if (!visibles[hito.id]) return;

      var arriba = Math.abs(hito.getBoundingClientRect().top);

      if (arriba < mejor) {
        mejor = arriba;
        activa = porId[hito.id] || null;
      }
    });

    [].forEach.call(pestanas, function (p) {
      p.classList.toggle('es-activa', p === activa);
    });
  }

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (e) {
        visibles[e.target.id] = e.isIntersecting;
      });
      repintar();
    },
    { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
  );

  [].forEach.call(hitos, function (h) {
    observador.observe(h);
  });
})();
