/*
 * El gesto de firma: la pestaña de canto.
 *
 * Al bajar por la portada, la pestaña de la sección en la que estás sale
 * hacia afuera y se tiñe — el pulgar metido en un catálogo grueso.
 *
 * Reglas que se respetan aquí:
 *   · Solo se toca una clase; el desplazamiento lo hace transform en CSS.
 *   · IntersectionObserver, no scroll listeners: cero trabajo por frame.
 *   · Si no hay soporte o el usuario pidió menos movimiento, no pasa nada:
 *     las pestañas siguen siendo enlaces que funcionan.
 */
(function () {
  'use strict';

  var pestanas = document.querySelectorAll('.canto-pestana');
  var secciones = document.querySelectorAll('.seccion[id]');

  if (!pestanas.length || !secciones.length || !('IntersectionObserver' in window)) {
    return;
  }

  // Índice: id de sección -> pestaña que le corresponde.
  var porId = {};

  Array.prototype.forEach.call(pestanas, function (pestana) {
    var href = pestana.getAttribute('href') || '';
    var slug = href.replace(/\/$/, '').split('/').pop();

    if (slug) {
      porId['seccion-' + slug] = pestana;
    }
  });

  var visibles = Object.create(null);

  function repintar() {
    var activa = null;
    var mejor = Infinity;

    Array.prototype.forEach.call(secciones, function (seccion) {
      if (!visibles[seccion.id]) {
        return;
      }

      var arriba = Math.abs(seccion.getBoundingClientRect().top);

      if (arriba < mejor) {
        mejor = arriba;
        activa = porId[seccion.id] || null;
      }
    });

    Array.prototype.forEach.call(pestanas, function (pestana) {
      pestana.classList.toggle('es-activa', pestana === activa);
    });
  }

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        visibles[entrada.target.id] = entrada.isIntersecting;
      });

      repintar();
    },
    { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
  );

  Array.prototype.forEach.call(secciones, function (seccion) {
    observador.observe(seccion);
  });
})();
