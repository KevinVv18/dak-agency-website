/* ─────────────────────────────────────────────────────────────────────────────
   marca-excelag.js — skin de presentación para ExcelAg Corp.

   ═══ LEER ANTES DE TOCAR ESTE ARCHIVO ═══

   Esto NO es material público. Es la versión de la propuesta con la marca real
   del prospecto, para mostrarla en la reunión y dejarles un enlace. Vive en una
   ruta con slug no adivinable, con noindex y sin ningún enlace entrante desde
   el sitio público.

   Reglas que este archivo respeta y que no hay que relajar:

   1. TODO dato técnico sale de su propio sitio público (excelag.com). Nada
      inventado. Donde no encontramos el dato, la ficha lo dice: "pendiente de
      su ficha oficial". Poner una composición o una dosis inventada sobre un
      producto REAL de una empresa REAL es mucho más grave que hacerlo sobre una
      marca ficticia — se convierte en una afirmación técnica falsa atribuida a
      ellos.

   2. Sin números de registro. No verificamos ninguno en SENASA, así que no se
      publica ninguno.

   3. Los sellos de certificación solo donde ellos mismos lo declaran. Nemakill
      dice OMRI en su propia página; el resto no lleva sello.

   4. Sin teléfonos de sus representantes. Los nombres y territorios son
      públicos; los celulares no se publican en un archivo que se sube a un
      servidor.

   Colores y tipografía tomados de su sitio (WordPress + Elementor, Montserrat).
   ───────────────────────────────────────────────────────────────────────── */

export default {
  nombre: 'ExcelAg',
  bajada: 'Corp.',
  nombreCompleto: 'ExcelAg Corp.',
  dominio: 'https://agro.dakagency.net/p-2026-10-excelag',

  claim: 'Nutrición, inmunización y protección para la agroexportación del norte.',
  intro:
    'El programa NIP aplicado al calendario de la costa peruana: qué entra en ' +
    'cada etapa del cultivo, en qué dosis y por qué vía. Formulado en Estados ' +
    'Unidos, disponible en Lambayeque, La Libertad y Piura.',
  descripcionCorta:
    'Programa NIP —nutrición, inmunización y protección— por cultivo y etapa ' +
    'fenológica para la agroexportación del norte del Perú.',

  ciudad: 'Chiclayo, Lambayeque',
  wa: '51906765040',

  /* Paleta tomada del CSS de excelag.com. Su verde corporativo es #2ca25f; los
     oscuros #2e753e y #003c37 salen del mismo sitio. Se mantiene la base clara
     del sistema porque es lo que da legibilidad a las tablas de dosis, que es
     el argumento central de la propuesta. */
  tokens: {
    '--papel': '#F4F6F4',
    '--papel-2': '#FFFFFF',
    '--papel-3': '#E6EFE9',
    '--tinta': '#0F1A15',
    '--tinta-2': '#3F4F46',
    '--tinta-3': '#63736A',
    '--linea': '#D8E3DB',
    '--linea-2': '#B6C7BC',
    '--acento': '#2E753E',
    '--acento-hi': '#003C37',
    '--acento-tenue': '#E4F1E9',
    '--ambar': '#8A6100',
    '--ambar-tenue': '#FBEFD6',
    '--alerta': '#A32B1C',
    '--alerta-tenue': '#FAE7E3',
    '--ui': "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    '--mono': "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
  },

  /* Su logotipo real, servido desde nuestro propio host. Se declara con `img`
     en vez de SVG inline porque es un PNG; base.js resuelve las dos formas. */
  logoImg: { src: 'excelag-logo.png', alt: 'ExcelAg Corp.', w: 275, h: 105 },
  marcaSvg: '',

  /* Solo se precargan las familias que este sitio usa: Archivo no se descarga
     aquí porque su manual de marca especifica Montserrat. */
  fuentes: ['montserrat-var-latin.woff2', 'jetbrainsmono-var-latin.woff2'],

  /* Etiquetas de línea con SU vocabulario. Las claves internas se mantienen
     (`defensa`, `control`) para no duplicar lógica, pero lo que lee el visitante
     son los tres pilares del programa NIP, no nuestros nombres genéricos. */
  categorias: {
    nutricion: 'Nutrición',
    defensa: 'Inmunización',
    control: 'Protección'
  },

  metricas: [
    { icono: 'producto', clave: 'nProductos', etiqueta: 'Productos en el programa' },
    { icono: 'cultivo', clave: 'nCultivos', etiqueta: 'Cultivos con programa' },
    { icono: 'zona', valor: '3', etiqueta: 'Regiones cubiertas' },
    { icono: 'ciclo', valor: '25', etiqueta: 'Años formulando' }
  ],

  /* ── NIP ────────────────────────────────────────────────────────────────
     Los tres pilares son los suyos, no una invención nuestra: ExcelAg
     estructura su oferta como Nutrition · Immunization · Protection y lo
     presenta así en excelag.com/nip-program/. El skin adopta su marco en vez
     de imponerle otro, que es justo lo que hace que la propuesta se lea como
     suya y no como ajena. */
  capacidades: [
    {
      cat: 'nutricion', icono: 'nutricion', color: '#2CA25F', n: 'Nutrición',
      d: 'Complejos nutricionales sistémicos con macro, micro y bioestimulación, para que la planta tome el nutriente cuando lo pide.'
    },
    {
      cat: 'defensa', icono: 'defensas', color: '#003C37', n: 'Inmunización',
      d: 'Tecnología de fosfonatos sistémicos que activa el mecanismo de defensa de la propia planta antes de que suba la presión.'
    },
    {
      cat: 'control', icono: 'control', color: '#A6562B', n: 'Protección',
      d: 'Plaguicidas orgánicos de acción rápida y múltiples modos de acción, admisibles en programas de residuo cero.'
    }
  ],

  laminas: {
    hero: {
      src: 'campo-hileras.webp', n: 'Referencia',
      alt: 'Hileras de cultivo a contraluz al atardecer, con equipo de riego al fondo',
      src2: 'campo-surcos.webp',
      pie: '<b>Imagen de referencia.</b> En el sitio final va fotografía de sus propios campos y de la planta en Chiclayo, que siempre le gana a una foto de banco.'
    },
    programa: {
      src: 'arandano-fruto.webp', n: 'Referencia',
      alt: 'Arbusto de arándano cargado de fruta madura',
      pie: '<b>Imagen de referencia.</b> Aquí va fotografía propia de campo tomada en la zona.'
    },
    cobertura: {
      src: 'campo-surcos.webp', n: 'Referencia',
      alt: 'Surcos de un campo recién establecido, con plantas jóvenes en línea',
      pie: '<b>Imagen de referencia.</b> Reemplazable por fotografía de sus lotes de trabajo.'
    }
  },

  /* Representantes reales en Perú, tomados de excelag.com/peru/. Nombre,
     territorio y rol; sin teléfonos. */
  reps: [
    { n: 'Hermer Cruz', zona: 'Lambayeque', detalle: 'Representante comercial · Chiclayo, Motupe, Jayanca, Olmos' },
    { n: 'Manuel Gavidia Córdova', zona: 'La Libertad', detalle: 'Representante comercial · Trujillo, Chepén, Virú' },
    { n: 'David García', zona: 'Piura', detalle: 'Representante comercial · Piura, Sullana, Chulucanas' }
  ],

  avisoDemo:
    'Esta es una MAQUETA DE PROPUESTA preparada por DAK Agency para ExcelAg Corp. ' +
    'No es un sitio publicado ni está indexado. Los nombres de producto, sus ' +
    'descripciones y sus dosis se tomaron de excelag.com y se reproducen aquí solo ' +
    'para mostrar cómo se verían en esta estructura; donde el dato no figura en su ' +
    'sitio, la ficha lo indica en lugar de completarlo. No se publica ningún número ' +
    'de registro SENASA porque ninguno fue verificado, y los sellos de certificación ' +
    'aparecen únicamente donde la propia empresa los declara. Los programas por etapa ' +
    'son una propuesta de estructura, no una recomendación técnica: los contenidos ' +
    'definitivos los valida el equipo agronómico de ExcelAg.'
};
