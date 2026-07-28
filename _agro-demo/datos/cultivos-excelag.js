/* ─────────────────────────────────────────────────────────────────────────────
   cultivos-excelag.js — programa propuesto con productos reales de ExcelAg.

   Qué es real y qué es propuesta, para que quede claro en la reunión:

   · REAL  — los productos, sus descripciones y sus dosis publicadas, tomados de
             excelag.com. Y las etapas fenológicas del arándano, que son
             conocimiento agronómico estándar.
   · PROPUESTA — en qué etapa entra cada producto y con qué frecuencia. Es una
             estructura de ejemplo construida a partir de lo que cada producto
             declara hacer; NO es una recomendación técnica y así lo dice el
             aviso legal del sitio. El calendario definitivo lo firma el equipo
             agronómico de ExcelAg.

   Donde su sitio no publica la dosis, la celda lo dice en lugar de inventar un
   número. Un hueco declarado es información; un número inventado sobre un
   producto real de una empresa real es una afirmación falsa atribuida a ellos.
   ───────────────────────────────────────────────────────────────────────── */

export default [
  {
    id: 'arandano', slug: 'arandano', n: 'Arándano', listo: true,
    cientifico: 'Vaccinium corymbosum',
    resumen:
      'Segunda región productora del país después de La Libertad, con ventana de ' +
      'exportación que premia la fruta temprana. El programa NIP se reparte entre ' +
      'los tres frentes: nutrición sistémica para construir raíz, fosfonatos para ' +
      'sostener la defensa en floración, y protección de suelo en poscosecha.',
    nota: 'Estructura propuesta por DAK Agency a partir de lo que declara cada producto en excelag.com. El calendario definitivo lo valida el equipo agronómico de ExcelAg.',
    etapas: [
      {
        n: 'Establecimiento', sub: 'Desarrollo radicular',
        dur: 'Semanas 1 – 8 desde trasplante',
        objetivo: 'Construir volumen de raíz antes de pedirle producción a la planta. Todo lo que no se logre aquí se paga en la primera cosecha.',
        apps: [
          { p: 'evergreen', d: '1.0 L/ha', f: 'Cada 15 días, 4 aplicaciones' },
          { p: 'fender', d: 'Según ficha técnica', f: 'Al trasplante, en drench' }
        ]
      },
      {
        n: 'Brotación', sub: 'Desarrollo vegetativo',
        dur: 'Semanas 9 – 16',
        objetivo: 'Sacar brote sano y uniforme, con el complejo nutricional disponible antes de que arranque la diferenciación floral.',
        apps: [
          { p: 'evergreen', d: '0.8 L/ha', f: 'Cada 12 días, 3 aplicaciones' },
          { p: 'saeta', d: '1.5 L/ha', f: 'Cada 21 días' }
        ]
      },
      {
        n: 'Floración',
        dur: 'Semanas 17 – 21',
        objetivo: 'Cuajar sin perder flor. Es la ventana donde el fosfonato sostiene el mecanismo de defensa antes de que suba la presión de enfermedad.',
        apps: [
          { p: 'saeta', d: '2.0 L/ha', f: 'Al 10% y al 60% de flor abierta' },
          { p: 'bestk', d: 'Según ficha técnica', f: 'Cada 14 días' }
        ]
      },
      {
        n: 'Cuajado y llenado', sub: 'Fruto en crecimiento',
        dur: 'Semanas 22 – 30',
        objetivo: 'Calibre y consistencia. Aquí pesa la movilidad dual del fosfonato de potasio, que llega también a fruto, junto con el aporte nutricional sostenido.',
        apps: [
          { p: 'bestk', d: 'Según ficha técnica', f: 'Cada 14 días' },
          { p: 'evergreen', d: '1.0 L/ha', f: 'Cada 15 días' }
        ]
      },
      {
        n: 'Poscosecha', sub: 'Recuperación',
        dur: 'Después de la última pasada de cosecha',
        objetivo: 'Sanear suelo y reponer reservas para la campaña siguiente. La ventana de manejo de nematodo es esta, cuando se puede tratar sin fruta en la planta.',
        apps: [
          { p: 'nemakill', d: '3 – 7 L / 200 L de agua', f: 'Drench, suelo húmedo' },
          { p: 'evergreen', d: '1.0 L/ha', f: 'Dos aplicaciones, cada 15 días' }
        ]
      }
    ]
  },
  {
    id: 'palto', slug: 'palto', n: 'Palto', listo: false,
    cientifico: 'Persea americana',
    resumen:
      'La columna de la agroexportación peruana. El programa se arma sobre la ' +
      'misma estructura de tres pilares, ajustada a la ventana entre floración y ' +
      'llenado de aceite.',
    nota: 'Programa por definir con el equipo agronómico de ExcelAg.',
    etapas: []
  },
  {
    id: 'uva', slug: 'uva-de-mesa', n: 'Uva de mesa', listo: false,
    cientifico: 'Vitis vinifera',
    resumen:
      'Ventana temprana de exportación con exigencia de calibre, color y condición ' +
      'de llegada, donde el residuo cero no es opcional y la línea orgánica pesa.',
    nota: 'Programa por definir con el equipo agronómico de ExcelAg.',
    etapas: []
  },
  {
    id: 'esparrago', slug: 'esparrago', n: 'Espárrago', listo: false,
    cientifico: 'Asparagus officinalis',
    resumen:
      'Perenne con cosechas sucesivas: lo que se aplica después del chapodo define ' +
      'el brote siguiente, y el manejo de nematodo de suelo es determinante.',
    nota: 'Programa por definir con el equipo agronómico de ExcelAg.',
    etapas: []
  }
];
