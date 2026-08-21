// Auditoría de contraste WCAG AA sobre un informe ya renderizado.
//
// Se pega en la consola del navegador con la página abierta. Devuelve JSON con
// los fallos. Cero fallos es el criterio de publicación: estos informes se
// proyectan en sala y se leen en el celular.
//
// Aplica el umbral correcto según el tamaño: 3:1 para texto grande (>=24 px, o
// >=18,66 px en negrita) y 4,5:1 para el resto. Sin esa distinción salen falsos
// positivos en cada titular y uno acaba oscureciendo cosas que estaban bien.
(function () {
  function rgb(s) { var m = s.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).map(Number) : null; }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * a[0] + .7152 * a[1] + .0722 * a[2];
  }
  function fondo(el) {                       // primer ancestro con fondo pintado
    for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
      var b = getComputedStyle(e).backgroundColor, c = rgb(b);
      if (c && !/rgba\([^)]*,\s*0\)/.test(b)) return c;
    }
    return [255, 255, 255];
  }
  function ratio(el) {
    var f = rgb(getComputedStyle(el).color), b = fondo(el);
    if (!f) return null;
    var l1 = lum(f), l2 = lum(b);
    return +((Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05)).toFixed(2);
  }
  function umbral(el) {
    var s = getComputedStyle(el), px = parseFloat(s.fontSize);
    var negrita = (parseInt(s.fontWeight, 10) || 400) >= 700;
    return (px >= 24 || (negrita && px >= 18.66)) ? 3 : 4.5;
  }

  // El selector tiene que llegar al texto en LINEA (.card p b, .lede b, .thesis b):
  // ahi es donde viven los style='color:var(--algo)' escritos a mano, que son
  // justo los que fallan. Con el selector estrecho, DOMEXIA publico durante dias
  // un parrafo invisible (1,02:1) sin que la auditoria lo viera.
  var SEL = 'td,td b,th,.tnote,.tier p,.tier .per,.tier h3,.tier .amt,.step p,.step .when,' +
            '.vs li,.vs li b,.card p,.card p b,.card h3,.lede,.lede b,.lede em,.src,' +
            '.stat-l,.stat,.dl span,.dl b,.bval,.brow span,.attrib,.quote,.thesis,' +
            '.thesis b,.thesis em,.lab,.kick,h1,h2,h3,.foot small,.foot .soc a,.pill,' +
            '.hero .meta,.hero .date,.badge';

  var fallos = [], peor = { margen: 99 }, n = 0;
  document.querySelectorAll(SEL).forEach(function (e) {
    if (!e.textContent.trim()) return;
    n++;
    var r = ratio(e); if (r === null) return;
    var u = umbral(e), margen = +(r - u).toFixed(2);
    if (margen < peor.margen) peor = { margen: margen, ratio: r, umbral: u, txt: e.textContent.trim().slice(0, 30) };
    if (r < u) fallos.push({
      sel: e.tagName + '.' + String(e.className).slice(0, 16),
      ratio: r, umbral: u, txt: e.textContent.trim().slice(0, 32)
    });
  });
  return JSON.stringify({
    pagina: document.title.split('·')[0].trim(),
    revisados: n, fallos: fallos.length, menorMargen: peor, ejemplos: fallos.slice(0, 6)
  }, null, 1);
})()
