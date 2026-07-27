/* ─────────────────────────────────────────────────────────────────────────────
   productos.js — catálogo.

   cat:  nutricion | bioestimulante | defensa | biologico | control | suelo | coadyuvante
   org:  true = admisible en producción orgánica (sello demostrativo propio)
   comp: composición declarada. Las sumas cierran a propósito: es lo primero que
         revisa un agrónomo.
   slug: define la URL /productos/<slug>/

   Los números de registro NO viven aquí: son un valor único y obviamente falso
   definido en index.js, porque publicar un registro de forma plausible para un
   producto inexistente sería una afirmación regulatoria falsa.
   ───────────────────────────────────────────────────────────────────────── */

export default [
  {
    id: 'raiz12', slug: 'arenal-raiz-12', n: 'ARENAL Raíz 12',
    cat: 'bioestimulante', org: true, form: 'SL',
    comp: [['Extracto de algas (Ascophyllum nodosum)', '12%'], ['Aminoácidos libres', '4%'], ['Materia orgánica', '18%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '1.5 – 2.5 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 68,
    desc: 'Bioestimulante radicular para arranque de campaña y recuperación de raíz después de un estrés. Se aplica al suelo por fertirriego, no foliar.',
    nota: 'En suelos arenosos conviene fraccionar la dosis en dos aplicaciones más cercanas antes que dar una sola cargada: lo que no toma la raíz, se lava.'
  },
  {
    id: 'nutrik', slug: 'arenal-nutri-k', n: 'ARENAL Nutri-K 0-0-50',
    cat: 'nutricion', org: false, form: 'SP',
    comp: [['Potasio soluble (K₂O)', '50%'], ['Azufre (SO₃)', '45%'], ['Insolubles', '<1%']],
    cultivos: ['arandano', 'palto', 'uva'],
    dosis: '3 – 5 kg/ha', via: 'Foliar / fertirriego', carencia: '3 días',
    pres: 'Saco 25 kg', precio: 12,
    desc: 'Sulfato de potasio soluble para la etapa de llenado de fruto, donde la demanda de potasio manda sobre todo lo demás. Libre de cloruros.',
    nota: 'Libre de cloruros: es lo que permite usarlo en arándano, que es sensible, sin acumular sales en la zona de raíz.'
  },
  {
    id: 'calfort', slug: 'arenal-calfort-18', n: 'ARENAL Calfort 18',
    cat: 'nutricion', org: false, form: 'SC',
    comp: [['Calcio (CaO)', '18%'], ['Boro (B)', '0.5%'], ['Aminoácidos como acarreador', '3%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '2 – 3 L/ha', via: 'Foliar', carencia: '3 días',
    pres: 'Bidón 5 L / 20 L', precio: 42,
    desc: 'Calcio complejado con acarreador orgánico para mejorar firmeza y vida de poscosecha. El boro acompaña porque el calcio sin boro se mueve mal en la planta.',
    nota: 'El calcio no se removiliza: lo que no entró en la ventana de división celular no se recupera después con más dosis.'
  },
  {
    id: 'fosfit', slug: 'arenal-fosfit-40-20', n: 'ARENAL Fosfit 40-20',
    cat: 'defensa', org: false, form: 'SL',
    comp: [['Fósforo como fosfito (P₂O₅)', '40%'], ['Potasio (K₂O)', '20%'], ['pH en solución al 1%', '6.2']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '2 – 3 L/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 38,
    desc: 'Fosfito de potasio: induce resistencia sistémica adquirida (SAR) y acompaña los momentos de presión de oomicetos. No sustituye un fungicida en curva alta.',
    nota: 'Es preventivo y sistémico. Aplicado con la enfermedad ya declarada llega tarde: el mecanismo tarda días en montarse.'
  },
  {
    id: 'silika', slug: 'arenal-silika-25', n: 'ARENAL Silika 25',
    cat: 'defensa', org: true, form: 'SL',
    comp: [['Silicio soluble (SiO₂)', '25%'], ['Potasio (K₂O)', '10%'], ['pH en solución al 1%', '11.2']],
    cultivos: ['arandano', 'uva', 'esparrago'],
    dosis: '1 – 2 L/ha', via: 'Foliar', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 34,
    desc: 'Silicato de potasio para engrosar pared celular y reducir daño por trips y ácaros. pH alcalino: no se mezcla con productos ácidos en el mismo tanque.',
    nota: 'pH 11.2. Mezclarlo con un producto ácido en el mismo caldo precipita los dos. Va solo o con compatibles alcalinos.'
  },
  {
    id: 'micromix', slug: 'arenal-micromix-6', n: 'ARENAL Micromix 6',
    cat: 'nutricion', org: false, form: 'WG',
    comp: [['Zinc (Zn) EDTA', '3%'], ['Manganeso (Mn) EDTA', '2.5%'], ['Hierro (Fe) EDDHA', '2%'], ['Boro (B)', '1%'], ['Cobre (Cu) EDTA', '0.5%'], ['Molibdeno (Mo)', '0.1%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '0.8 – 1.2 kg/ha', via: 'Foliar', carencia: 'Sin carencia',
    pres: 'Bolsa 5 kg', precio: 96,
    desc: 'Mezcla de micronutrientes quelatados para brotación y precuaja. El hierro va como EDDHA porque el EDTA no aguanta el pH de los suelos calcáreos del norte.',
    nota: 'El quelato importa más que el porcentaje: un hierro EDTA en suelo calcáreo se bloquea y la planta sigue clorótica aunque la etiqueta diga que lo aplicaste.'
  },
  {
    id: 'amino80', slug: 'arenal-amino-80', n: 'ARENAL Amino 80',
    cat: 'bioestimulante', org: true, form: 'SL',
    comp: [['Aminoácidos libres', '18%'], ['Nitrógeno orgánico (N)', '4.5%'], ['Materia orgánica', '32%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '1 – 2 L/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 52,
    desc: 'Aminoácidos libres de hidrólisis enzimática para recuperar la planta después de un golpe de calor, un viento o una helada. Efecto de arranque, no nutricional.',
    nota: 'Se aplica apenas pasa el estrés, no durante. Con la planta cerrada por calor no hay absorción foliar que valga.'
  },
  {
    id: 'nematb', slug: 'arenal-nemat-b', n: 'ARENAL Nemat-B',
    cat: 'control', org: true, form: 'EC',
    comp: [['Extracto de Azadirachta indica', '15%'], ['Extracto de Quenopodium spp.', '8%'], ['Coadyuvantes de formulación', '12%']],
    cultivos: ['arandano', 'uva', 'esparrago'],
    dosis: '4 – 6 L/ha', via: 'Fertirriego (drench)', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 74,
    desc: 'Nematicida botánico para presión de Meloidogyne. Se aplica en drench con suelo húmedo; en suelo seco no llega a la zona de raíz activa y no sirve de nada.',
    nota: 'Suelo húmedo antes y riego corto después. Sin eso el producto se queda en los primeros centímetros y el nematodo está más abajo.'
  },
  {
    id: 'bacsub', slug: 'arenal-bacillus-sub', n: 'ARENAL Bacillus SUB',
    cat: 'biologico', org: true, form: 'WP',
    comp: [['Bacillus subtilis (cepa demostrativa)', '1×10⁹ UFC/g'], ['Soporte inerte', '99%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '1 – 1.5 kg/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
    pres: 'Bolsa 1 kg / 5 kg', precio: 128,
    desc: 'Bacteria antagonista para presión de botrytis en floración y poscosecha. No se mezcla con cobre ni con fungicidas de amplio espectro: los mata.',
    nota: 'Es un organismo vivo. Cobre, fungicidas de amplio espectro y agua de caldo a más de 30 °C lo inactivan.'
  },
  {
    id: 'tricho5', slug: 'arenal-tricho-5', n: 'ARENAL Tricho-5',
    cat: 'biologico', org: true, form: 'WG',
    comp: [['Trichoderma harzianum (cepa demostrativa)', '5×10⁸ UFC/g'], ['Soporte inerte', '99%']],
    cultivos: ['arandano', 'palto', 'esparrago'],
    dosis: '1 – 2 kg/ha', via: 'Fertirriego (drench)', carencia: 'Sin carencia',
    pres: 'Bolsa 1 kg / 5 kg', precio: 112,
    desc: 'Hongo antagonista de patógenos de suelo. Colonizador de rizósfera: se aplica temprano en la campaña, cuando hay raíz nueva que colonizar.',
    nota: 'Coloniza raíz nueva. Aplicarlo sobre una planta ya decaída es llegar tarde: hay poca raíz activa que ocupar.'
  },
  {
    id: 'cobreorg', slug: 'arenal-cobre-org-25', n: 'ARENAL Cobre-Org 25',
    cat: 'control', org: true, form: 'WG',
    comp: [['Cobre metálico (Cu) de hidróxido', '25%'], ['Coadyuvantes de formulación', '8%']],
    cultivos: ['arandano', 'palto', 'uva'],
    dosis: '1.5 – 2.5 kg/ha', via: 'Foliar', carencia: '7 días',
    pres: 'Bolsa 5 kg', precio: 44,
    desc: 'Fungicida-bactericida de contacto admisible en orgánico. Preventivo: en curva alta de enfermedad ya no alcanza. No aplicar en floración abierta.',
    nota: 'En floración abierta puede afectar el cuaje. Y es incompatible con los biológicos: si va cobre, ese día no van bacterias ni hongos antagonistas.'
  },
  {
    id: 'suelomejora', slug: 'arenal-suelo-mejora', n: 'ARENAL Suelo-Mejora',
    cat: 'suelo', org: true, form: 'SL',
    comp: [['Ácidos húmicos', '15%'], ['Ácidos fúlvicos', '5%'], ['Potasio (K₂O)', '3%'], ['Materia orgánica', '28%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '5 – 10 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
    pres: 'Bidón 20 L / 200 L', precio: 26,
    desc: 'Húmicos y fúlvicos para estructura de suelo y disponibilidad de nutrientes. En suelos arenosos del norte es lo que sostiene la retención.',
    nota: 'Es el producto más rentable del programa en suelo arenoso: mejora la retención, así que todo lo demás que apliques rinde más.'
  },
  {
    id: 'zerosal', slug: 'arenal-zero-sal', n: 'ARENAL Zero-Sal',
    cat: 'suelo', org: false, form: 'SL',
    comp: [['Ácidos orgánicos de cadena corta', '22%'], ['Agentes secuestrantes', '9%'], ['pH en solución al 1%', '2.4']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '2 – 4 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
    pres: 'Bidón 20 L', precio: 30,
    desc: 'Acidificante y secuestrante para agua de riego dura y suelos con sales acumuladas. Corrige el agua antes de que el problema llegue a la raíz.',
    nota: 'La dosis sale del análisis de agua, no de la etiqueta. Sin conocer la dureza y la CE, cualquier número es un tiro al aire.'
  },
  {
    id: 'adherplus', slug: 'arenal-adher-plus', n: 'ARENAL Adher-Plus',
    cat: 'coadyuvante', org: true, form: 'SL',
    comp: [['Esparcidor no iónico', '40%'], ['Penetrante', '18%'], ['Regulador de pH de caldo', '6%']],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    dosis: '0.15 – 0.3 L/100 L de agua', via: 'Aditivo de caldo', carencia: 'Sin carencia',
    pres: 'Bidón 5 L / 20 L', precio: 40,
    desc: 'Esparcidor-penetrante para mojar bien hoja cerosa como la del arándano y el palto. Sin coadyuvante, media aplicación foliar se va al suelo.',
    nota: 'Se dosifica por volumen de caldo, no por hectárea. Por eso queda fuera de la calculadora: mezclarlo ahí daría una cifra equivocada.'
  }
];
