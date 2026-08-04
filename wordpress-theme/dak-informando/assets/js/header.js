/**
 * DAK INFORMANDO — Header JavaScript
 * Cursor grid reveal, hamburger menu, and fixed mini-nav on scroll.
 * Direct conversion from BlogHeader.astro <script> block.
 */

(function () {
  'use strict';

  // ── Cursor grid reveal ──
  var grid = document.getElementById('cursorGrid');
  if (grid) {
    window.addEventListener('mousemove', function (e) {
      grid.style.setProperty('--mx', e.clientX + 'px');
      grid.style.setProperty('--my', e.clientY + 'px');
      grid.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () {
      grid.style.opacity = '0';
    });
  }

  // ── Hamburger menu ──
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
  }

  // ── Fixed mini-nav ──
  var miniNav = document.getElementById('miniNav');
  var headerEl = document.getElementById('header');
  var miniNavVisible = false;

  function updateMiniNav() {
    if (!headerEl || !miniNav) return;
    var headerBottom = headerEl.getBoundingClientRect().bottom;
    if (headerBottom < 0 && !miniNavVisible) {
      miniNav.classList.add('visible');
      miniNavVisible = true;
    } else if (headerBottom >= 0 && miniNavVisible) {
      miniNav.classList.remove('visible');
      miniNavVisible = false;
    }
  }

  window.addEventListener('scroll', updateMiniNav, { passive: true });

  // ── Nav que sigue la sección en pantalla (solo en la portada) ──
  // En la portada, PHP marca TODOS y ahí se quedaba aunque bajaras por las
  // secciones de categoría. Estas secciones llevan id = slug de la categoría
  // y los enlaces del nav apuntan a /category/<slug>/, así que se emparejan
  // por slug. En archivos de categoría y en posts no hay .cat-section, así
  // que este bloque no corre y respeta lo que marcó PHP.
  var spySections = [].slice.call(document.querySelectorAll('.cat-section[id]'));

  if (spySections.length) {
    var navLinks = [].slice.call(document.querySelectorAll('.mini-nav-link, .nav-link'));

    function slugOf(link) {
      var m = (link.getAttribute('href') || '').match(/\/category\/([^\/?#]+)/);
      return m ? m[1] : null;
    }

    function setActive(slug) {
      navLinks.forEach(function (link) {
        var on = slug ? slugOf(link) === slug : slugOf(link) === null;
        link.classList.toggle('active', on);
        if (on) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    var currentSlug = null;

    function updateSpy() {
      // Línea de lectura: la sección que la cruza es la que se está mirando.
      var line = window.innerHeight * 0.35;
      var found = null;

      for (var i = 0; i < spySections.length; i++) {
        var r = spySections[i].getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          found = spySections[i].id;
          break;
        }
      }

      // Solo tocamos el DOM cuando cambia de sección.
      if (found !== currentSlug) {
        currentSlug = found;
        setActive(found);
      }
    }

    window.addEventListener('scroll', updateSpy, { passive: true });
    window.addEventListener('resize', updateSpy);
    updateSpy();
  }
})();
