/* ─────────────────────────────────────────────────────────────────────────────
   marca.js — identidad, tokens y contenido institucional.

   Esta es LA pieza que se cambia para skin-ear el sitio con otro cliente.
   El resto de los datos (productos, cultivos, problemas) describe el negocio;
   este archivo describe la marca que lo firma.

   ARENAL Agrociencia es una marca FICTICIA de DAK Agency. No existe.
   ───────────────────────────────────────────────────────────────────────── */

export default {
  nombre: 'ARENAL',
  bajada: 'Agrociencia',
  nombreCompleto: 'ARENAL Agrociencia',
  dominio: 'https://agro.dakagency.net',

  claim: 'Ciencia de suelo y planta para el desierto irrigado del norte.',
  intro:
    'Formulamos nutrición sistémica, inducción de defensas y control biológico ' +
    'para los valles del norte peruano. Programas por cultivo y por etapa, no ' +
    'listas de productos.',
  descripcionCorta:
    'Programas de nutrición y protección por cultivo y etapa fenológica para la ' +
    'agroexportación del norte del Perú.',

  ciudad: 'Chiclayo, Lambayeque',
  wa: '51906765040',

  /* Tokens de color y tipografía. Los consume el <style> del <head> que escribe
     el generador; core.css no contiene ni un hex. */
  tokens: {
    '--papel': '#F4F2ED',
    '--papel-2': '#FBFAF8',
    '--papel-3': '#E9E5DC',
    '--tinta': '#14171A',
    '--tinta-2': '#474E54',
    '--tinta-3': '#666E76',
    '--linea': '#DDD8CD',
    '--linea-2': '#C3BCAD',
    '--acento': '#17603A',
    '--acento-hi': '#0F4B2C',
    '--acento-tenue': '#E5EFE8',
    '--ambar': '#A05A00',
    '--ambar-tenue': '#F7E9D2',
    '--alerta': '#A32B1C',
    '--alerta-tenue': '#FAE7E3',
    '--ui': "'Archivo', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    '--mono': "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
  },

  /* Marca gráfica: tres surcos sobre la línea de horizonte. */
  marcaSvg:
    '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<path d="M2 22h28" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/>' +
    '<path d="M6 17h9M11 12h10M17 27h11" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" opacity=".55"/>' +
    '</svg>',

  /* ── Métricas del hero ──────────────────────────────────────────────────
     Deliberadamente sobrias y comprobables contra los propios datos del sitio.
     Nada de "+38% de rendimiento": una cifra de eficacia inventada en un
     mercado regulado no es licencia creativa. Las tres primeras las calcula el
     generador desde los datos reales; solo `zonas` es de contenido. */
  metricas: [
    { icono: 'producto', clave: 'nProductos', sufijo: '', etiqueta: 'Productos formulados' },
    { icono: 'cultivo', clave: 'nCultivos', sufijo: '', etiqueta: 'Cultivos con programa' },
    { icono: 'zona', valor: '3', etiqueta: 'Regiones cubiertas' },
    { icono: 'ciclo', clave: 'nProblemas', sufijo: '', etiqueta: 'Problemas documentados' }
  ],

  /* ── Capacidades ────────────────────────────────────────────────────────
     El equivalente a las "expertises" de Koppert: vuelve concreta y navegable
     una capacidad que de otro modo es una palabra abstracta en un párrafo.
     Cada una enlaza al catálogo filtrado por su línea. */
  capacidades: [
    {
      cat: 'nutricion', icono: 'nutricion', color: '#17603A', n: 'Nutrición',
      d: 'Macro y micronutrientes formulados para que la planta los tome cuando los pide, no cuando conviene aplicarlos.'
    },
    {
      cat: 'bioestimulante', icono: 'bioestimulante', color: '#1D6B6B', n: 'Bioestimulación',
      d: 'Algas y aminoácidos para arranque de raíz y para levantar la planta después de un golpe de calor o de viento.'
    },
    {
      cat: 'defensa', icono: 'defensas', color: '#1E5288', n: 'Inducción de defensas',
      d: 'Fosfitos y silicatos que activan la resistencia de la propia planta antes de que la presión de enfermedad suba.'
    },
    {
      cat: 'biologico', icono: 'biologico', color: '#6A3D7A', n: 'Control biológico',
      d: 'Bacterias y hongos antagonistas para floración y suelo, sin periodo de carencia ni residuo que declarar.'
    },
    {
      cat: 'control', icono: 'control', color: '#A6431E', n: 'Control de plagas',
      d: 'Botánicos y cobre admisibles en producción orgánica, pensados para programas de residuo cero en exportación.'
    },
    {
      cat: 'suelo', icono: 'suelo', color: '#7A5A22', n: 'Suelo y agua',
      d: 'Húmicos, fúlvicos y acidificantes: corregir el agua y la estructura antes de que el problema llegue a la raíz.'
    }
  ],

  /* ── Láminas fotográficas ───────────────────────────────────────────────
     Todas en dominio público (USDA y Wikimedia). Ver CREDITS.md. Al skin-ear se
     reemplazan por fotografía del campo y la planta del cliente, que siempre
     le gana a una foto de banco. */
  laminas: {
    hero: {
      src: 'campo-hileras.webp', n: 'Lámina 01',
      alt: 'Hileras de cultivo a contraluz al atardecer, con equipo de riego al fondo',
      /* Segunda toma que alterna con la primera en un fundido muy lento. Las dos
         son campo abierto con suelo trabajado a propósito: así se lee como el
         mismo lugar en otro momento y no como un carrusel cambiando de tema. */
      src2: 'campo-surcos.webp',
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

  /* Representantes (ficticios). Nunca teléfonos personales en un archivo que
     se sube por rsync: el CTA enruta al WhatsApp de la agencia. */
  reps: [
    { n: 'Representante Lambayeque', zona: 'Lambayeque', detalle: 'Chiclayo, Motupe, Jayanca, Olmos' },
    { n: 'Representante La Libertad', zona: 'La Libertad', detalle: 'Trujillo, Chepén, Virú' },
    { n: 'Representante Piura', zona: 'Piura', detalle: 'Piura, Sullana, Chulucanas' }
  ],

  /* Aviso legal que acompaña a todo el sitio. */
  avisoDemo:
    'ARENAL Agrociencia es una marca ficticia creada por DAK Agency para mostrar ' +
    'cómo funciona un sitio web de agroinsumos. La empresa no existe y los productos ' +
    'no se comercializan. Los nombres comerciales, composiciones, dosis y precios son ' +
    'inventados y de uso demostrativo; los números de registro son ficticios y los ' +
    'sellos de admisibilidad orgánica son propios de esta demostración, sin relación ' +
    'con ninguna entidad certificadora. Las etapas fenológicas y las descripciones de ' +
    'síntomas sí corresponden al conocimiento agronómico habitual, pero no constituyen ' +
    'una recomendación técnica: un programa real se define con análisis de suelo, agua ' +
    'y foliar, y con un ingeniero agrónomo en campo.'
};
