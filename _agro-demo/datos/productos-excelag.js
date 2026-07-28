/* ─────────────────────────────────────────────────────────────────────────────
   productos-excelag.js — catálogo del skin, con productos REALES de ExcelAg.

   Cada dato de esta lista está tomado de la página pública del producto en
   excelag.com. Nada se completó por analogía ni por criterio propio: cuando el
   dato no figura en su sitio, el campo va como `null` y la ficha lo declara
   pendiente en vez de rellenarlo.

   La razón no es prudencia excesiva. Inventar una composición o una dosis sobre
   un producto real de una empresa real es una afirmación técnica falsa
   atribuida a ellos, en un mercado regulado y delante de la propia empresa que
   lo fabrica. El campo vacío es honesto y además abre la conversación correcta
   en la reunión: "estos datos los cargamos con su equipo".

   Se incluyen solo los cinco productos cuya información pública alcanza para
   una ficha con sustancia. Un catálogo corto y verdadero vale más que uno largo
   lleno de huecos.

   `cat` reusa las claves del sistema para no duplicar lógica:
     nutricion → Nutrición   |   defensa → Inmunización   |   control → Protección
   ───────────────────────────────────────────────────────────────────────── */

export default [
  {
    id: 'evergreen', slug: 'evergreen', n: 'Evergreen™',
    cat: 'nutricion', org: false, form: 'Soluble',
    comp: [
      ['Macronutrientes', '7'],
      ['Micronutrientes', '8'],
      ['Vitaminas', '7'],
      ['Ácido húmico de leonardita', 'Sí'],
      ['Extracto de alga (kelp)', 'Sí']
    ],
    compNota: 'Composición según excelag.com. Los porcentajes de garantía no figuran en su sitio.',
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '0.5 – 1.0 L/ha', via: 'Foliar / fertirriego', carencia: null,
    pres: null, precio: null,
    desc: 'Complejo nutricional sistémico y bioestimulante. Se distribuye por la planta por acción sistémica: mejora el desarrollo radicular, la absorción de nutrientes, la calidad y el peso de cosecha, y adelanta la maduración.',
    nota: 'Su sitio declara una tasa general de 16–32 oz/ac y un rango de 0.5–1.0 L/ha según cultivo. El dato exacto por cultivo lo define su equipo agronómico.',
    fuente: 'https://excelag.com/excel-ag-product/evergreen/'
  },
  {
    id: 'saeta', slug: 'saeta', n: 'Saeta',
    cat: 'defensa', org: false, form: 'WP',
    comp: [
      ['Fósforo (como ión fosfito)', 'Sí'],
      ['Calcio', 'Sí'],
      ['Formulación', 'Polvo humectable soluble']
    ],
    compNota: 'Composición según excelag.com. Las concentraciones exactas de fósforo y calcio no figuran en su sitio.',
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '0.5 – 2.5 L/ha', via: 'Foliar', carencia: null,
    pres: null, precio: null,
    desc: 'Fosfonato de calcio sistémico. Se mueve por el sistema vascular, mejora la producción de masa radicular y el vigor vegetal, y estimula los mecanismos de defensa frente a hongos Oomycete.',
    nota: 'Al ser fosfonato, su lugar en el programa es preventivo: el mecanismo de defensa tarda días en montarse y aplicado con la enfermedad declarada llega tarde.',
    fuente: 'https://excelag.com/excel-ag-product/saeta/'
  },
  {
    id: 'bestk', slug: 'best-k', n: 'Best-K',
    cat: 'defensa', org: false, form: 'Soluble',
    comp: [
      ['Fósforo (como ión fosfito)', 'Sí'],
      ['Potasio', 'Sí']
    ],
    compNota: 'Composición según excelag.com. Las concentraciones exactas no figuran en su sitio.',
    cultivos: ['arandano', 'palto', 'uva'],
    dosis: null, via: 'Foliar', carencia: null,
    pres: null, precio: null,
    desc: 'Fosfonato de potasio foliar con doble acción: fertilizante y fungicida. Alta solubilidad y movilidad dual por xilema y floema, lo que explica su efecto inmediato. Estimula el desarrollo radicular y da consistencia al cultivo en maduración.',
    nota: 'La movilidad dual —xilema y floema— es lo que lo distingue de un fosfito solo sistémico ascendente: llega también a raíz y a fruto.',
    fuente: 'https://excelag.com/excel-ag-product/best-k/'
  },
  {
    id: 'nemakill', slug: 'nemakill', n: 'Nemakill',
    cat: 'control', org: true, form: 'Aceites naturales',
    comp: [
      ['Base', 'Aceites naturales'],
      ['Admisibilidad', 'Certificado OMRI para producción orgánica']
    ],
    compNota: 'Según excelag.com. El ingrediente activo y su concentración no figuran en su sitio.',
    cultivos: ['arandano', 'uva', 'esparrago'],
    dosis: '2 – 4 L / 200 L de agua', via: 'Drench al suelo', carencia: null,
    pres: null, precio: null,
    desc: 'Nematicida para producción orgánica. Actúa por contacto, inhalación y acción translaminar: penetra la membrana del nematodo y provoca parálisis y muerte dentro de las 24 horas.',
    nota: 'Su sitio diferencia la dosis por ciclo de cultivo: 2–4 L/200 L de agua en cultivos de ciclo corto y 3–7 L/200 L en perennes. En arándano establecido corresponde el rango de perenne.',
    fuente: 'https://excelag.com/excel-ag-product/nemakill/'
  },
  {
    id: 'fender', slug: 'fender', n: 'Fender',
    cat: 'control', org: true, form: 'Aceites naturales',
    comp: [
      ['Base', 'Aceites naturales'],
      ['Periodo de carencia (PHI)', 'No requiere'],
      ['Periodo de reingreso (REI)', 'No requiere']
    ],
    compNota: 'Según excelag.com. El ingrediente activo y su concentración no figuran en su sitio.',
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: null, via: 'Drench al suelo', carencia: 'No requiere',
    pres: null, precio: null,
    desc: 'Nematicida de suelo para producción orgánica, de acción directa por contacto. Libera compuestos que afectan la movilidad del nematodo y provocan parálisis y mortalidad, sin toxicidad en la rizósfera. Potencia además la acción de plaguicidas y fertilizantes aplicados en mezcla.',
    nota: 'Que no requiera carencia ni reingreso es lo que lo hace aplicable en plena cosecha, que es cuando un nematicida convencional queda descartado.',
    fuente: 'https://excelag.com/excel-ag-product/fender/'
  }
];
