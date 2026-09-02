// Auditoría de contraste WCAG AA sobre un informe ya renderizado.
//
// Se pega en la consola del navegador con la página abierta. Devuelve JSON con
// los fallos. Cero fallos es el criterio de publicación: estos informes se
// proyectan en sala y se leen en el celular.
//
// Aplica el umbral correcto según el tamaño: 3:1 para texto grande (>=24 px, o
// >=18,66 px en negrita) y 4,5:1 para el resto. Sin esa distinción salen falsos
// positivos en cada titular y uno acaba oscureciendo cosas que estaban bien.
//
// 2026-09-02 — dejó de ir con una lista de selectores. Esa lista había que
// mantenerla a mano y envejecía con cada rediseño: el día que el informe cambió
// de mundo visual, el auditor siguió dando «cero fallos» porque ya no encontraba
// ninguna de sus clases. Ahora recorre TODO elemento que tenga texto propio y
// esté visible, así que funciona igual en cualquier plantilla futura.
(function () {
  function rgb(s) { var m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; }
  function alpha(s) { var m = s.match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * a[0] + .7152 * a[1] + .0722 * a[2];
  }
  function mezcla(f, b, a) { return f.map(function (v, i) { return v * a + b[i] * (1 - a); }); }

  function fondo(el) {                       // primer ancestro con fondo opaco
    for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
      var s = getComputedStyle(e).backgroundColor, c = rgb(s);
      if (c && alpha(s) > .92) return c;
    }
    var b = rgb(getComputedStyle(document.body).backgroundColor);
    return b || [255, 255, 255];
  }
  function ratio(el) {
    var s = getComputedStyle(el), f = rgb(s.color);
    if (!f) return null;
    var b = fondo(el);
    f = mezcla(f, b, alpha(s.color));        // el alpha del texto cuenta
    var l1 = lum(f), l2 = lum(b);
    return +((Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05)).toFixed(2);
  }
  function umbral(el) {
    var s = getComputedStyle(el), px = parseFloat(s.fontSize);
    var negrita = (parseInt(s.fontWeight, 10) || 400) >= 700;
    return (px >= 24 || (negrita && px >= 18.66)) ? 3 : 4.5;
  }
  function visible(el) {
    var s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function textoPropio(el) {                 // solo el texto directo, no el de los hijos
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    }
    return false;
  }

  var IGN = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TITLE: 1, HEAD: 1, svg: 1 };
  var fallos = [], peor = { margen: 99 }, n = 0;

  document.querySelectorAll('body *').forEach(function (e) {
    if (IGN[e.tagName] || e.closest('svg')) return;
    if (!textoPropio(e) || !visible(e)) return;
    n++;
    var r = ratio(e); if (r === null) return;
    var u = umbral(e), margen = +(r - u).toFixed(2);
    if (margen < peor.margen) peor = { margen: margen, ratio: r, umbral: u, txt: e.textContent.trim().slice(0, 34) };
    if (r < u) fallos.push({
      sel: e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).trim().split(/\s+/).join('.').slice(0, 28) : ''),
      ratio: r, umbral: u, px: parseFloat(getComputedStyle(e).fontSize),
      txt: e.textContent.trim().slice(0, 40)
    });
  });

  return JSON.stringify({
    pagina: document.title.split('·')[0].trim(),
    revisados: n, fallos: fallos.length, menorMargen: peor, ejemplos: fallos.slice(0, 10)
  }, null, 1);
})()
