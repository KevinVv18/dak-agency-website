/* ─────────────────────────────────────────────────────────────────────────────
   ARENAL Agrociencia — datos de la versión PÚBLICA del demo.

   ARENAL es una marca FICTICIA creada por DAK Agency para demostrar el producto.
   No existe como empresa. Los productos, dosis y precios son inventados y están
   rotulados como demostrativos en toda la interfaz.

   Lo que SÍ es real y no debe alterarse a la ligera:
     · las etapas fenológicas de cada cultivo
     · la descripción de los síntomas y el nombre científico de cada agente
   Es el conocimiento agronómico correcto lo que hace creíble el demo ante un
   ingeniero agrónomo, que es quien lo va a mirar en la reunión.

   Tres reglas que este archivo respeta a propósito:
     1. Los números de registro son OBVIAMENTE falsos (DEMO-0000-SENASA). Publicar
        un registro de forma plausible para un producto inexistente sería una
        afirmación regulatoria falsa en un mercado regulado.
     2. Los sellos son genéricos y propios ("insumo orgánico — sello
        demostrativo"). No se usan OMRI, KIWA ni FiBL: son marcas registradas y
        pondrían una certificación real sobre productos que no existen.
     3. No hay cifras de eficacia. Ningún "+38% de rendimiento" inventado.

   Este archivo es la ÚNICA pieza que cambia para skin-ear el demo con la marca
   de un cliente. core.css y core.js son compartidos y no contienen marca.
   ───────────────────────────────────────────────────────────────────────────── */
window.AGRO = (function () {
  'use strict';

  /* ── Identidad de marca ─────────────────────────────────────────────────── */
  var brand = {
    nombre: 'ARENAL',
    bajada: 'Agrociencia',
    claim: 'Ciencia de suelo y planta para el desierto irrigado del norte.',
    intro:
      'Formulamos nutrición sistémica, inducción de defensas y control biológico ' +
      'para los valles del norte peruano. Programas por cultivo y por etapa, no ' +
      'listas de productos.',
    ciudad: 'Chiclayo, Lambayeque',
    // WhatsApp real de DAK: todo CTA del demo tiene que aterrizar en algún sitio.
    wa: '51906765040',
    waNombre: 'DAK Agency',
    anio: '2026',
    // Láminas fotográficas por sección. Todas en dominio público (USDA y
    // Wikimedia Commons); ver CREDITS.md. Se reemplazan al skin-ear por
    // fotografía propia del cliente, que siempre gana a una foto de banco.
    laminas: {
      hero: {
        src: 'campo-hileras.webp', n: 'Lámina 01',
        alt: 'Hileras de cultivo a contraluz al atardecer, con equipo de riego al fondo',
        pie: '<b>Campaña en curso.</b> Hileras establecidas con riego presurizado. El programa que sigue está construido sobre esta realidad: suelo, agua y etapa.'
      },
      programa: {
        src: 'arandano-fruto.webp', n: 'Lámina 02',
        alt: 'Arbusto de arándano cargado de fruta madura',
        pie: '<b>Arándano en cosecha.</b> <i>Vaccinium corymbosum.</i> Lo que se ve aquí se decidió meses antes, en floración y cuajado.'
      },
      cobertura: {
        src: 'campo-surcos.webp', n: 'Lámina 03',
        alt: 'Surcos de un campo recién establecido, con plantas jóvenes en línea',
        pie: '<b>Campo recién establecido.</b> El acompañamiento técnico arranca aquí, no cuando aparece el problema.'
      }
    },
    // Marca gráfica: tres surcos sobre una línea de horizonte. Se reemplaza
    // entera al skin-ear.
    marca:
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path d="M2 22h28" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/>' +
      '<path d="M6 17h9M11 12h10M17 27h11" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" opacity=".55"/>' +
      '</svg>'
  };

  /* ── Catálogo ───────────────────────────────────────────────────────────────
     cat:  nutricion | bioestimulante | defensa | biologico | control | suelo | coadyuvante
     org:  true = admisible en producción orgánica (sello demostrativo propio)
     comp: composición declarada. Las sumas cierran a propósito: un agrónomo
           revisa eso antes que cualquier otra cosa.
     ───────────────────────────────────────────────────────────────────────── */
  var productos = [
    {
      id: 'raiz12', n: 'ARENAL Raíz 12', cat: 'bioestimulante', org: true, form: 'SL',
      comp: [['Extracto de algas (Ascophyllum nodosum)', '12%'], ['Aminoácidos libres', '4%'], ['Materia orgánica', '18%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '1.5 – 2.5 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 68,
      desc: 'Bioestimulante radicular para arranque de campaña y recuperación de raíz después de un estrés. Se aplica al suelo por fertirriego, no foliar.'
    },
    {
      id: 'nutrik', n: 'ARENAL Nutri-K 0-0-50', cat: 'nutricion', org: false, form: 'SP',
      comp: [['Potasio soluble (K₂O)', '50%'], ['Azufre (SO₃)', '45%'], ['Insolubles', '<1%']],
      cultivos: ['arandano', 'palto', 'uva'],
      dosis: '3 – 5 kg/ha', via: 'Foliar / fertirriego', carencia: '3 días',
      pres: 'Saco 25 kg', precio: 12,
      desc: 'Sulfato de potasio soluble para la etapa de llenado de fruto, donde la demanda de potasio manda sobre todo lo demás. Libre de cloruros.'
    },
    {
      id: 'calfort', n: 'ARENAL Calfort 18', cat: 'nutricion', org: false, form: 'SC',
      comp: [['Calcio (CaO)', '18%'], ['Boro (B)', '0.5%'], ['Aminoácidos como acarreador', '3%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '2 – 3 L/ha', via: 'Foliar', carencia: '3 días',
      pres: 'Bidón 5 L / 20 L', precio: 42,
      desc: 'Calcio complejado con acarreador orgánico para mejorar firmeza y vida de poscosecha. El boro acompaña porque el calcio sin boro se mueve mal en la planta.'
    },
    {
      id: 'fosfit', n: 'ARENAL Fosfit 40-20', cat: 'defensa', org: false, form: 'SL',
      comp: [['Fósforo como fosfito (P₂O₅)', '40%'], ['Potasio (K₂O)', '20%'], ['pH en solución al 1%', '6.2']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '2 – 3 L/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 38,
      desc: 'Fosfito de potasio: induce resistencia sistémica adquirida (SAR) y acompaña los momentos de presión de oomicetos. No sustituye un fungicida en curva alta.'
    },
    {
      id: 'silika', n: 'ARENAL Silika 25', cat: 'defensa', org: true, form: 'SL',
      comp: [['Silicio soluble (SiO₂)', '25%'], ['Potasio (K₂O)', '10%'], ['pH en solución al 1%', '11.2']],
      cultivos: ['arandano', 'uva', 'esparrago'],
      dosis: '1 – 2 L/ha', via: 'Foliar', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 34,
      desc: 'Silicato de potasio para engrosar pared celular y reducir daño por trips y ácaros. pH alcalino: no se mezcla con productos ácidos en el mismo tanque.'
    },
    {
      id: 'micromix', n: 'ARENAL Micromix 6', cat: 'nutricion', org: false, form: 'WG',
      comp: [['Zinc (Zn) EDTA', '3%'], ['Manganeso (Mn) EDTA', '2.5%'], ['Hierro (Fe) EDDHA', '2%'], ['Boro (B)', '1%'], ['Cobre (Cu) EDTA', '0.5%'], ['Molibdeno (Mo)', '0.1%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '0.8 – 1.2 kg/ha', via: 'Foliar', carencia: 'Sin carencia',
      pres: 'Bolsa 5 kg', precio: 96,
      desc: 'Mezcla de micronutrientes quelatados para brotación y precuaja. El hierro va como EDDHA porque el EDTA no aguanta el pH de los suelos calcáreos del norte.'
    },
    {
      id: 'amino80', n: 'ARENAL Amino 80', cat: 'bioestimulante', org: true, form: 'SL',
      comp: [['Aminoácidos libres', '18%'], ['Nitrógeno orgánico (N)', '4.5%'], ['Materia orgánica', '32%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '1 – 2 L/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 52,
      desc: 'Aminoácidos libres de hidrólisis enzimática para recuperar la planta después de un golpe de calor, un viento o una helada. Efecto de arranque, no nutricional.'
    },
    {
      id: 'nematb', n: 'ARENAL Nemat-B', cat: 'control', org: true, form: 'EC',
      comp: [['Extracto de Azadirachta indica', '15%'], ['Extracto de Quenopodium spp.', '8%'], ['Coadyuvantes de formulación', '12%']],
      cultivos: ['arandano', 'uva', 'esparrago'],
      dosis: '4 – 6 L/ha', via: 'Fertirriego (drench)', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 74,
      desc: 'Nematicida botánico para presión de Meloidogyne. Se aplica en drench con suelo húmedo; en suelo seco no llega a la zona de raíz activa y no sirve de nada.'
    },
    {
      id: 'bacsub', n: 'ARENAL Bacillus SUB', cat: 'biologico', org: true, form: 'WP',
      comp: [['Bacillus subtilis (cepa demostrativa)', '1×10⁹ UFC/g'], ['Soporte inerte', '99%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '1 – 1.5 kg/ha', via: 'Foliar / fertirriego', carencia: 'Sin carencia',
      pres: 'Bolsa 1 kg / 5 kg', precio: 128,
      desc: 'Bacteria antagonista para presión de botrytis en floración y poscosecha. No se mezcla con cobre ni con fungicidas de amplio espectro: los mata.'
    },
    {
      id: 'tricho5', n: 'ARENAL Tricho-5', cat: 'biologico', org: true, form: 'WG',
      comp: [['Trichoderma harzianum (cepa demostrativa)', '5×10⁸ UFC/g'], ['Soporte inerte', '99%']],
      cultivos: ['arandano', 'palto', 'esparrago'],
      dosis: '1 – 2 kg/ha', via: 'Fertirriego (drench)', carencia: 'Sin carencia',
      pres: 'Bolsa 1 kg / 5 kg', precio: 112,
      desc: 'Hongo antagonista de patógenos de suelo. Colonizador de rizósfera: se aplica temprano en la campaña, cuando hay raíz nueva que colonizar.'
    },
    {
      id: 'cobreorg', n: 'ARENAL Cobre-Org 25', cat: 'control', org: true, form: 'WG',
      comp: [['Cobre metálico (Cu) de hidróxido', '25%'], ['Coadyuvantes de formulación', '8%']],
      cultivos: ['arandano', 'palto', 'uva'],
      dosis: '1.5 – 2.5 kg/ha', via: 'Foliar', carencia: '7 días',
      pres: 'Bolsa 5 kg', precio: 44,
      desc: 'Fungicida-bactericida de contacto admisible en orgánico. Preventivo: en curva alta de enfermedad ya no alcanza. No aplicar en floración abierta.'
    },
    {
      id: 'suelomejora', n: 'ARENAL Suelo-Mejora', cat: 'suelo', org: true, form: 'SL',
      comp: [['Ácidos húmicos', '15%'], ['Ácidos fúlvicos', '5%'], ['Potasio (K₂O)', '3%'], ['Materia orgánica', '28%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '5 – 10 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
      pres: 'Bidón 20 L / 200 L', precio: 26,
      desc: 'Húmicos y fúlvicos para estructura de suelo y disponibilidad de nutrientes. En suelos arenosos del norte es lo que sostiene la retención.'
    },
    {
      id: 'zerosal', n: 'ARENAL Zero-Sal', cat: 'suelo', org: false, form: 'SL',
      comp: [['Ácidos orgánicos de cadena corta', '22%'], ['Agentes secuestrantes', '9%'], ['pH en solución al 1%', '2.4']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '2 – 4 L/ha', via: 'Fertirriego', carencia: 'Sin carencia',
      pres: 'Bidón 20 L', precio: 30,
      desc: 'Acidificante y secuestrante para agua de riego dura y suelos con sales acumuladas. Corrige el agua antes de que el problema llegue a la raíz.'
    },
    {
      id: 'adherplus', n: 'ARENAL Adher-Plus', cat: 'coadyuvante', org: true, form: 'SL',
      comp: [['Esparcidor no iónico', '40%'], ['Penetrante', '18%'], ['Regulador de pH de caldo', '6%']],
      cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
      dosis: '0.15 – 0.3 L/100 L de agua', via: 'Aditivo de caldo', carencia: 'Sin carencia',
      pres: 'Bidón 5 L / 20 L', precio: 40,
      desc: 'Esparcidor-penetrante para mojar bien hoja cerosa como la del arándano y el palto. Sin coadyuvante, media aplicación foliar se va al suelo.'
    }
  ];

  /* ── Cultivos y programa por etapa ──────────────────────────────────────────
     Las etapas fenológicas son reales. Lo demostrativo es qué producto ARENAL
     se sugiere en cada una.
     ───────────────────────────────────────────────────────────────────────── */
  var cultivos = [
    {
      id: 'arandano', n: 'Arándano', listo: true,
      cientifico: 'Vaccinium corymbosum',
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
      id: 'palto', n: 'Palto', listo: false, cientifico: 'Persea americana',
      nota: 'Programa en preparación con el equipo agronómico.',
      etapas: []
    },
    {
      id: 'uva', n: 'Uva de mesa', listo: false, cientifico: 'Vitis vinifera',
      nota: 'Programa en preparación con el equipo agronómico.',
      etapas: []
    },
    {
      id: 'esparrago', n: 'Espárrago', listo: false, cientifico: 'Asparagus officinalis',
      nota: 'Programa en preparación con el equipo agronómico.',
      etapas: []
    }
  ];

  /* ── Síntomas ───────────────────────────────────────────────────────────────
     Descripciones agronómicas reales; la recomendación de producto es
     demostrativa.
     ───────────────────────────────────────────────────────────────────────── */
  var sintomas = [
    {
      id: 'clorosis', n: 'Clorosis férrica', cien: 'Deficiencia de Fe inducida',
      senal: 'Hojas jóvenes amarillas con las nervaduras todavía verdes. Aparece primero en el brote nuevo, no en la hoja vieja.',
      causa: 'Típica de suelo calcáreo o riego con agua dura: el hierro está en el suelo pero la planta no lo puede tomar.',
      prods: ['micromix', 'zerosal', 'suelomejora'],
      // Foto de referencia real del síntoma. Aquí la imagen no decora: es el
      // dato con el que el agrónomo compara lo que tiene en campo.
      img: 'sintoma-clorosis.webp',
      imgAlt: 'Brote de arándano con hojas amarillas y nervaduras verdes, patrón típico de clorosis férrica',
      imgPie: 'Brote joven de arándano con clorosis intervenal. El amarillo avanza en la lámina mientras la nervadura sigue verde: ese contraste es el que distingue una carencia de hierro de una de nitrógeno, que amarillea la hoja entera y empieza por las viejas.'
    },
    {
      id: 'nematodo', n: 'Nematodo agallador', cien: 'Meloidogyne spp.',
      senal: 'Agallas o nudos en la raíz, plantas enanas en manchones dentro del lote, decaimiento a media mañana aunque el riego esté bien.',
      causa: 'Población establecida en suelo. El daño se ve en la parte aérea cuando la raíz ya está comprometida.',
      prods: ['nematb', 'tricho5', 'raiz12']
    },
    {
      id: 'botrytis', n: 'Moho gris', cien: 'Botrytis cinerea',
      senal: 'Micelio gris polvoriento en flor y fruta, pudrición blanda que avanza desde el cáliz. Se dispara con humedad alta y poca ventilación.',
      causa: 'Presión de inóculo en floración y poscosecha, agravada por exceso de vigor y follaje cerrado.',
      prods: ['bacsub', 'cobreorg', 'silika']
    },
    {
      id: 'oidio', n: 'Oídio', cien: 'Podosphaera / Erysiphe spp.',
      senal: 'Polvo blanco superficial en hoja y brote, que se limpia con el dedo. Deforma la hoja nueva y frena el crecimiento del brote.',
      causa: 'Clima seco con noches frescas y días templados. No necesita agua libre para infectar, a diferencia de otros hongos.',
      prods: ['silika', 'cobreorg', 'fosfit']
    },
    {
      id: 'trips', n: 'Trips', cien: 'Frankliniella spp.',
      senal: 'Plateado en la hoja, cicatrices y deformación en el fruto. Al sacudir la flor sobre papel blanco caen insectos muy pequeños y alargados.',
      causa: 'Migración desde malezas y cultivos vecinos, especialmente en floración.',
      prods: ['silika', 'adherplus', 'micromix']
    },
    {
      id: 'calcio', n: 'Deficiencia de calcio', cien: 'Ca no disponible o mal translocado',
      senal: 'Fruta blanda, vida de poscosecha corta, necrosis en el ápice del brote. La hoja vieja se ve bien: el calcio no se removiliza.',
      causa: 'Calcio insuficiente en la ventana de división celular, o boro ausente, que es el que permite que el calcio se mueva.',
      prods: ['calfort', 'adherplus', 'zerosal']
    },
    {
      id: 'salinidad', n: 'Estrés por sales', cien: 'CE de suelo o agua elevada',
      senal: 'Bordes de hoja quemados de afuera hacia adentro, crecimiento detenido, planta que no responde a más fertilizante.',
      causa: 'Agua de riego dura, drenaje insuficiente o acumulación por lámina de riego corta. Frecuente en suelos arenosos del norte.',
      prods: ['zerosal', 'suelomejora', 'raiz12']
    },
    {
      id: 'phyto', n: 'Pudrición de raíz', cien: 'Phytophthora spp.',
      senal: 'Decaimiento general, hoja pequeña y clorótica, raíz oscura y quebradiza. Peor en las partes bajas del lote donde se encharca.',
      causa: 'Suelo con exceso de humedad y drenaje pobre. El patógeno necesita agua libre para moverse.',
      prods: ['fosfit', 'tricho5', 'suelomejora']
    }
  ];

  /* ── Representantes (ficticios) ─────────────────────────────────────────── */
  var reps = [
    { n: 'Representante Lambayeque', zona: 'Lambayeque', detalle: 'Chiclayo, Motupe, Jayanca, Olmos' },
    { n: 'Representante La Libertad', zona: 'La Libertad', detalle: 'Trujillo, Chepén, Virú' },
    { n: 'Representante Piura', zona: 'Piura', detalle: 'Piura, Sullana, Chulucanas' }
  ];

  /* Etiquetas legibles por categoría. */
  var categorias = {
    nutricion: 'Nutrición',
    bioestimulante: 'Bioestimulante',
    defensa: 'Inducción de defensas',
    biologico: 'Control biológico',
    control: 'Control de plagas',
    suelo: 'Suelo y agua',
    coadyuvante: 'Coadyuvante'
  };

  return {
    brand: brand,
    productos: productos,
    cultivos: cultivos,
    sintomas: sintomas,
    reps: reps,
    categorias: categorias,
    // Rótulo que acompaña todo número de registro y precio del demo.
    registro: 'DEMO-0000-SENASA',
    esDemo: true
  };
})();
