/* ─────────────────────────────────────────────────────────────────────────────
   cultivos.js — programa fenológico por cultivo.

   Las etapas fenológicas son REALES: es el conocimiento agronómico correcto lo
   que hace creíble el sitio ante el ingeniero que lo va a leer. Lo demostrativo
   es qué producto ARENAL se sugiere en cada una.

   `listo: false` marca los cultivos cuyo programa todavía no está redactado.
   Se muestran rotulados como en preparación en vez de fingir que existen.
   ───────────────────────────────────────────────────────────────────────── */

export default [
  {
    id: 'arandano', slug: 'arandano', n: 'Arándano', listo: true,
    cientifico: 'Vaccinium corymbosum',
    resumen:
      'Segunda región productora del país después de La Libertad, con ventana de ' +
      'exportación que premia la fruta temprana. El programa se juega en dos ' +
      'frentes: raíz en sustrato o suelo modificado, y firmeza de fruta para que ' +
      'aguante el viaje.',
    nota: 'Programa de referencia para variedades de bajo requerimiento de frío en costa norte, con manejo en sustrato o suelo modificado.',
    etapas: [
      {
        n: 'Establecimiento', sub: 'Desarrollo radicular',
        dur: 'Semanas 1 – 8 desde trasplante',
        objetivo: 'Construir volumen de raíz antes de pedirle producción a la planta. Todo lo que no se logre aquí se paga en la primera cosecha.',
        apps: [
          { p: 'raiz12', d: '2 L/ha', f: 'Cada 15 días, 4 aplicaciones' },
          { p: 'tricho5', d: '1.5 kg/ha', f: 'Al trasplante y a los 30 días' },
          { p: 'suelomejora', d: '8 L/ha', f: 'Mensual' }
        ]
      },
      {
        n: 'Brotación', sub: 'Desarrollo vegetativo',
        dur: 'Semanas 9 – 16',
        objetivo: 'Sacar brote sano y uniforme, con micronutrientes disponibles antes de que arranque la diferenciación floral.',
        apps: [
          { p: 'micromix', d: '1 kg/ha', f: 'Cada 12 días, 3 aplicaciones' },
          { p: 'amino80', d: '1.5 L/ha', f: 'Mezclado con el micromix' },
          { p: 'suelomejora', d: '6 L/ha', f: 'Mensual' }
        ]
      },
      {
        n: 'Floración',
        dur: 'Semanas 17 – 21',
        objetivo: 'Cuajar sin perder flor. Es la etapa de mayor riesgo de botrytis y donde el boro y el calcio deciden el cuaje.',
        apps: [
          { p: 'calfort', d: '2 L/ha', f: 'Al 10% y al 60% de flor abierta' },
          { p: 'bacsub', d: '1.2 kg/ha', f: 'Cada 7 días durante floración' },
          { p: 'adherplus', d: '0.2 L/100 L', f: 'En cada caldo foliar' }
        ]
      },
      {
        n: 'Cuajado y llenado', sub: 'Fruto en crecimiento',
        dur: 'Semanas 22 – 30',
        objetivo: 'Calibre y firmeza. El potasio manda, pero sin calcio la fruta llega blanda al packing y se cae en poscosecha.',
        apps: [
          { p: 'nutrik', d: '4 kg/ha', f: 'Semanal en fertirriego' },
          { p: 'calfort', d: '2.5 L/ha', f: 'Cada 10 días, foliar' },
          { p: 'silika', d: '1.5 L/ha', f: 'Cada 14 días' },
          { p: 'fosfit', d: '2 L/ha', f: 'Cada 21 días' }
        ]
      },
      {
        n: 'Poscosecha', sub: 'Recuperación',
        dur: 'Después de la última pasada de cosecha',
        objetivo: 'Reponer reservas y sanear raíz para la campaña siguiente. La campaña próxima se define en esta ventana, no en la brotación.',
        apps: [
          { p: 'amino80', d: '2 L/ha', f: 'Dos aplicaciones, cada 10 días' },
          { p: 'raiz12', d: '2.5 L/ha', f: 'Fertirriego, cada 15 días' },
          { p: 'nematb', d: '5 L/ha', f: 'Drench, suelo húmedo' },
          { p: 'zerosal', d: '3 L/ha', f: 'Según análisis de agua' }
        ]
      }
    ]
  },
  {
    id: 'palto', slug: 'palto', n: 'Palto', listo: false,
    cientifico: 'Persea americana',
    resumen: 'Columna de la agroexportación peruana. Programa en preparación con el equipo agronómico.',
    nota: 'Programa en preparación con el equipo agronómico.',
    etapas: []
  },
  {
    id: 'uva', slug: 'uva-de-mesa', n: 'Uva de mesa', listo: false,
    cientifico: 'Vitis vinifera',
    resumen: 'Programa en preparación con el equipo agronómico.',
    nota: 'Programa en preparación con el equipo agronómico.',
    etapas: []
  },
  {
    id: 'esparrago', slug: 'esparrago', n: 'Espárrago', listo: false,
    cientifico: 'Asparagus officinalis',
    resumen: 'Programa en preparación con el equipo agronómico.',
    nota: 'Programa en preparación con el equipo agronómico.',
    etapas: []
  }
];
