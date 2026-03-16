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
})();
