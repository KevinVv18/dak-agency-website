// Motor del showroom. No contiene ningún dato del proyecto: todo sale de
// window.SHOWROOM, que escribe el generador.
//
// Navegación con rutas reales (piso/7/, departamento/701/) y History API: el
// generador emite una página por ruta, así que un enlace o un QR abre directo
// y el botón atrás del navegador funciona sin perder la selección.
//
// Estado de interfaz en la query (vista, modo, departamento elegido, sección,
// filtros): sobrevive a recargar y a compartir el enlace. Nunca datos
// personales en la URL.
//
// Dos registros visuales: las vistas inmersivas (portada, edificio, piso) son
// la imagen a pantalla completa con los controles flotando encima; las de
// consulta (ficha, catálogo, modelos) son páginas claras con barra.

(() => {
  const D = window.SHOWROOM;
  const app = document.getElementById('app');
  // Sin modo demo no hay franja de aviso: las vistas inmersivas suben a tope.
  if (!D.proyecto.modoDemo) document.documentElement.style.setProperty('--aviso-h', '0px');
  const BASE = new URL(document.documentElement.dataset.base || './', location.href);

  // ── Índices ────────────────────────────────────────────────────────────────
  const tipoPorId = Object.fromEntries(D.tipologias.map((t) => [t.id, t]));
  const pisoPorId = Object.fromEntries(D.pisos.map((p) => [p.id, p]));
  const unidadPorId = Object.fromEntries(D.unidades.map((u) => [u.id, u]));
  const unidadesDePiso = (id) => D.unidades.filter((u) => u.piso === id).sort((a, b) => a.posicion.localeCompare(b.posicion));
  const pisosResidenciales = D.pisos.filter((p) => p.plantilla);

  const ESTADO = {
    disponible: { txt: 'Disponible' },
    reservado: { txt: 'Reservado' },
    vendido: { txt: 'Vendido' },
  };

  // ── Íconos ─────────────────────────────────────────────────────────────────
  // Un solo trazo (1,8) sobre una retícula de 24: dibujados, no caracteres.
  const IC = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    izq: 'M15 5l-7 7 7 7',
    der: 'M9 5l7 7-7 7',
    volver: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
    enlace: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
    pantalla: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    pisos: 'M12 3l9 5-9 5-9-5 9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5',
    buscar: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.2-4.2',
    cerrar: 'M6 6l12 12M18 6 6 18',
    area: 'M4 4h16v16H4zM9 4v5H4M15 20v-5h5',
    cama: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 9V6.5h4V9M3 18v2M21 18v2',
    bano: 'M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5zM6.5 12V5.5a2 2 0 0 1 4 0M8 19l-1 2M16 19l1 2',
    brujula: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
    edificio: 'M5 21V4h10v17M15 9h4v12M3 21h18M8 7h1M11 7h1M8 10h1M11 10h1M8 13h1M11 13h1M8 16h4',
    giro: 'M21 12c0 2.2-4 4-9 4s-9-1.8-9-4 4-4 9-4M14 6l2.5 2L14 10',
    plano: 'M4 5h16v14H4zM10 5v6H4M14 19v-5h6M10 14h4',
    chat: 'M4 5h16v11H9l-5 4z',
    sol: 'M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    luna: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
    mas: 'M12 5v14M5 12h14',
    menos: 'M5 12h14',
    imprimir: 'M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z',
  };
  const icono = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;

  // ── Utilidades ─────────────────────────────────────────────────────────────
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Un área desconocida se dice, nunca se convierte en cero.
  const m2 = (n) => (n == null ? 'Por confirmar' : `${n.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m²`);
  const soles = (n) => `S/ ${n.toLocaleString('es-PE')}`;
  const url = (ruta, query = {}) => {
    const u = new URL(ruta, BASE);
    for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined && v !== '') u.searchParams.set(k, v);
    return u.pathname + u.search;
  };
  // Las rutas de recursos en los datos son relativas a la raíz del sitio, no a
  // la página actual: sin esto, una imagen se rompe en departamento/701/.
  const recurso = (ruta) => new URL(ruta, BASE).pathname;
  const query = () => Object.fromEntries(new URLSearchParams(location.search));
  const fijarQuery = (cambios) => {
    const q = { ...query(), ...cambios };
    const ruta = location.pathname.slice(BASE.pathname.length);
    history.replaceState(null, '', url(ruta, q));
  };
  const orientacion = (u) => u.orientacion || D.plantillas[pisoPorId[u.piso].plantilla].posiciones[u.posicion].orientacion;
  const areaTotal = (t) => (t.areaTechada == null ? null : t.areaTechada + (t.areaLibre || 0));
  // Una unidad puede traer excepciones sobre su tipología (p.ej. terraza en
  // azotea): el área libre de la unidad manda sobre la de la tipología.
  const areaLibreDe = (u) => u.areaLibre ?? tipoPorId[u.tipologia].areaLibre ?? 0;
  const areaTotalDe = (u) => {
    const techada = tipoPorId[u.tipologia].areaTechada;
    return techada == null ? null : techada + areaLibreDe(u);
  };
  const plural = (n, s, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;

  // Pantalla parada (celular): si la vista trae versión vertical, se usa esa;
  // el render 16:9 recortaría el edificio o lo dejaría diminuto.
  const vertical = matchMedia('(max-aspect-ratio: 1/1)');
  const imagenVista = (v, modo = 'dia') => (vertical.matches && v.imagen[`${modo}Movil`]) || v.imagen[modo] || v.imagen.dia;

  function precioTexto(u) {
    if (u.estado === 'vendido') return 'Vendido';
    if (u.estado === 'reservado') return 'Reservado';
    return u.precio ? soles(u.precio) : 'Precio a consultar';
  }

  function bono(u) {
    const b = D.proyecto.bonoBuenPagador;
    if (!b || u.estado !== 'disponible' || !u.precio) return null;
    return b.tramos.find((t) => u.precio > t.desde && u.precio <= t.hasta) || null;
  }

  // Estado: punto dibujado + palabra. Nunca solo color.
  const chipEstado = (estado) => `<span class="estado estado--${estado}"><span class="estado__punto" aria-hidden="true"></span>${ESTADO[estado].txt}</span>`;

  // Marcador para cualquier recurso visual que todavía no existe. Dice qué
  // irá ahí, para que la estructura se pueda revisar sin imágenes falsas.
  const marcador = (titulo, detalle = '', clase = '') =>
    `<div class="marcador ${clase}" role="img" aria-label="${esc(titulo)} (pendiente)"><span class="marcador__t">${esc(titulo)}</span>${detalle ? `<span class="marcador__d">${esc(detalle)}</span>` : ''}</div>`;

  const aviso = () => (D.proyecto.modoDemo ? `<div class="aviso-demo" role="note">${esc(D.proyecto.avisoDemo)}</div>` : '');

  // ── Menú y controles flotantes ─────────────────────────────────────────────

  function menu() {
    const p = D.proyecto;
    const ruta = location.pathname.slice(BASE.pathname.length);
    const actual = (pref) => (pref === '' ? ruta === '' : ruta.startsWith(pref)) ? ' aria-current="page"' : '';
    return `
      <div class="menu" id="menu" hidden>
        <div class="menu__panel" role="dialog" aria-modal="true" aria-label="Menú">
          <div class="menu__cabeza">
            <p class="marca marca--linea"><span class="marca__nombre">${esc(p.marca)}</span><span>${esc(p.nombre)}</span></p>
            <button class="circulo circulo--claro" data-menu-cerrar aria-label="Cerrar menú">${icono('cerrar')}</button>
          </div>
          <nav class="menu__nav" aria-label="Secciones">
            <a href="${url('')}"${actual('')}>Inicio</a>
            <a href="${url('edificio/')}"${actual('edificio')}>Edificio</a>
            <a href="${url(`piso/${pisosResidenciales[0]?.id || D.pisos[0].id}/`)}"${actual('piso')}>Pisos</a>
            <a href="${url('departamentos/')}"${actual('departamento')}>Departamentos</a>
            <a href="${url('modelos/')}"${actual('modelos')}>Modelos</a>
          </nav>
          <p class="menu__pie">${esc(p.lema)} · ${p.zona ? `${esc(p.zona)}, ` : ''}${esc(p.ciudad)}</p>
        </div>
      </div>`;
  }

  // Botonera de arriba a la izquierda, igual en todas las vistas inmersivas.
  const controles = (atras) => `
    <div class="flotante flotante--arriba-izq">
      <button class="pildora pildora--acento" data-menu aria-expanded="false" aria-controls="menu">${icono('menu')}<span>Menú</span></button>
      <a class="circulo" href="${atras}" aria-label="Volver">${icono('volver')}</a>
      <button class="circulo" data-compartir aria-label="Copiar enlace de esta vista">${icono('enlace')}</button>
    </div>`;

  // Columna de pisos de arriba hacia abajo, como el tablero de un ascensor.
  function columnaPisos(activo) {
    const filas = [...D.pisos].reverse().map((p) => {
      const disp = p.plantilla ? unidadesDePiso(p.id).filter((u) => u.estado === 'disponible').length : null;
      const etiqueta = p.id === 'azotea' ? 'Azotea' : `${p.id}°`;
      const detalle = disp === null ? (p.id === '1' ? 'Ingreso' : 'Común') : disp ? plural(disp, 'disponible') : 'Agotado';
      const corto = disp === null ? detalle : disp ? `${disp} disp.` : 'Agotado';
      return `<li><a class="piso-pildora${p.id === activo ? ' piso-pildora--activo' : ''}${disp === 0 ? ' piso-pildora--agotado' : ''}" data-piso="${esc(p.id)}" href="${url(`piso/${p.id}/`)}"${p.id === activo ? ' aria-current="page"' : ''} aria-label="${esc(p.etiqueta)}: ${esc(detalle)}"><b>${etiqueta}</b><small><span class="largo">${esc(detalle)}</span><span class="corto" aria-hidden="true">${esc(corto)}</span></small></a></li>`;
    }).join('');
    return `<nav class="columna-pisos" aria-label="Pisos"><ol>${filas}</ol></nav>`;
  }

  // ── Páginas de consulta ────────────────────────────────────────────────────
  // Mismo chrome flotante que las vistas inmersivas: un solo sistema de
  // navegación en todo el showroom (Menú, volver, copiar enlace).

  function pagina(contenido, { atras, atrasTxt } = {}) {
    const destino = atras || url('edificio/');
    return `
      ${aviso()}
      <div class="chrome-pagina">
        <div class="flotante flotante--arriba-izq">
          <button class="pildora pildora--acento" data-menu aria-expanded="false" aria-controls="menu">${icono('menu')}<span>Menú</span></button>
          <a class="circulo" href="${destino}" aria-label="Volver a ${esc(atrasTxt || 'el edificio')}">${icono('volver')}</a>
          <button class="circulo" data-compartir aria-label="Copiar enlace de esta vista">${icono('enlace')}</button>
        </div>
        <p class="etiqueta etiqueta--pagina">${esc(D.proyecto.nombre)}</p>
      </div>
      <main id="principal" class="pagina">
        ${contenido}
      </main>
      ${menu()}`;
  }

  // ── Portada ────────────────────────────────────────────────────────────────

  function vistaPortada() {
    const p = D.proyecto;
    // La portada usa la imagen que el proyecto elija o, si no, la primera vista.
    const dia = (vertical.matches && p.portadaMovil) || p.portada || (D.vistas[0] && imagenVista(D.vistas[0]));
    const noche = D.vistas[0] && D.vistas[0].imagen.noche ? imagenVista(D.vistas[0], 'noche') : null;
    const disp = D.unidades.filter((u) => u.estado === 'disponible');
    const desde = disp.filter((u) => u.precio).map((u) => u.precio).sort((a, b) => a - b)[0];
    return `
      ${aviso()}
      <main class="portada">
        <div class="portada__escena" aria-hidden="true">
          ${dia ? `<img class="portada__img" src="${esc(recurso(dia))}" alt="" fetchpriority="high">` : marcador('Video de portada', 'Fachada al atardecer')}
          ${noche ? `<img class="portada__img portada__img--noche" src="${esc(recurso(noche))}" alt="">` : ''}
        </div>
        <p class="marca marca--portada"><span class="marca__nombre">${esc(p.marca)}</span></p>
        <div class="portada__contenido">
          <h1>${esc(p.nombre)}</h1>
          <p class="portada__lema">${esc(p.lema)} · ${p.zona ? `${esc(p.zona)}, ` : ''}${esc(p.ciudad)}${p.zona && p.zonaReferencial ? ' (ubicación referencial)' : ''}</p>
          <div class="portada__acciones">
            <a class="pildora pildora--acento pildora--grande" href="${url('edificio/')}">Ingresar</a>
            <a class="pildora pildora--grande" href="${url('departamentos/')}">Ver departamentos</a>
          </div>
          ${disp.length ? `<p class="portada__dato">${plural(disp.length, 'departamento disponible', 'departamentos disponibles')}${desde ? ` · desde ${soles(desde)}` : ''}</p>` : ''}
        </div>
      </main>`;
  }

  // ── Edificio ───────────────────────────────────────────────────────────────

  // Franjas de piso calculadas desde la geometría (produccion/mascaras.py).
  // El SVG usa el mismo encuadre que la imagen: «slice» cuando la imagen llena
  // la pantalla y «meet» cuando se muestra entera, así la franja no se corre.
  function franjasSvg(v, img) {
    const movil = img && (img === v.imagen.diaMovil || img === v.imagen.nocheMovil);
    const set = movil ? v.pisosMovil : v.pisos;
    if (!set) return '';
    const [aw, ah] = movil ? [9, 16] : [16, 9];
    const polis = Object.entries(set).filter(([id, poli]) => pisoPorId[id] && poli.length > 2).map(([id, poli]) =>
      `<polygon class="franja" data-franja="${esc(id)}" points="${poli.map(([x, y]) => `${(x * aw).toFixed(3)},${(y * ah).toFixed(3)}`).join(' ')}"/>`).join('');
    return `<svg class="franjas" viewBox="0 0 ${aw} ${ah}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${polis}</svg>`;
  }

  function vistaEdificio() {
    const q = query();
    const i = Math.max(0, D.vistas.findIndex((v) => v.id === q.vista));
    // El conmutador día/noche solo aparece si existe al menos un render nocturno.
    const hayNoche = D.vistas.some((v) => v.imagen.noche);
    const modo = hayNoche && q.modo === 'noche' ? 'noche' : 'dia';
    const v = D.vistas[i];
    const img = imagenVista(v, modo);
    const n = D.vistas.length;
    return `
      ${aviso()}
      <main class="inmersiva inmersiva--edificio" data-vista-actual="${i}">
        <div class="escena">
          ${img ? `<img class="escena__fondo" src="${esc(recurso(img))}" alt="" aria-hidden="true">
          <img class="escena__img" data-escena-img src="${esc(recurso(img))}" alt="${esc(D.proyecto.nombre)}, vista ${esc(v.nombre.toLowerCase())}">
          ${franjasSvg(v, img)}`
            : marcador(`Vista ${v.nombre.toLowerCase()}`, `Parada ${i + 1} de ${n} · render del exterior`)}
        </div>
        <p class="franja-rotulo" data-franja-rotulo hidden></p>
        ${controles(url(''))}
        <h1 class="etiqueta">${esc(D.proyecto.nombre)}</h1>
        <div class="flotante flotante--arriba-der">
          ${hayNoche ? `<div class="segmentado" role="group" aria-label="Iluminación">
            <button data-modo="dia" aria-pressed="${modo === 'dia'}">${icono('sol')}<span>Día</span></button>
            <button data-modo="noche" aria-pressed="${modo === 'noche'}">${icono('luna')}<span>Noche</span></button>
          </div>` : ''}
          <button class="circulo" data-pantalla aria-label="Pantalla completa">${icono('pantalla')}</button>
        </div>
        ${n > 1 ? `
          <button class="flecha flecha--izq" data-paso="-1" aria-label="Vista anterior">${icono('izq')}</button>
          <button class="flecha flecha--der" data-paso="1" aria-label="Vista siguiente">${icono('der')}</button>
          <div class="parada" aria-live="polite">
            <span data-parada-nombre>${esc(v.nombre)}</span>
            <ol class="parada__puntos">${D.vistas.map((x, k) => `<li><button data-ir-vista="${k}" aria-label="${esc(x.nombre)}"${k === i ? ' aria-current="true"' : ''}></button></li>`).join('')}</ol>
          </div>` : ''}
        ${columnaPisos(null)}
        ${menu()}
      </main>`;
  }

  // ── Planta del piso ────────────────────────────────────────────────────────

  function planoPiso(piso, elegida) {
    const pl = D.plantillas[piso.plantilla];
    const W = 1000;
    const H = Math.round(W / pl.aspecto);
    const pts = (poli) => poli.map(([x, y]) => `${(x * W).toFixed(1)},${(y * H).toFixed(1)}`).join(' ');
    const centro = (poli) => {
      const xs = poli.map((p) => p[0]); const ys = poli.map((p) => p[1]);
      return [((Math.min(...xs) + Math.max(...xs)) / 2) * W, ((Math.min(...ys) + Math.max(...ys)) / 2) * H];
    };
    const ctx = pl.contexto;
    const [u0, v0, u1, v1] = ctx ? ctx.marco : [0, 0, 1, 1];
    const caja = [u0 * W, v0 * H, (u1 - u0) * W, (v1 - v0) * H].map((n) => n.toFixed(1)).join(' ');
    const fondo = pl.imagen
      ? `${ctx ? `<image href="${esc(recurso(ctx.imagen))}" x="${(u0 * W).toFixed(1)}" y="${(v0 * H).toFixed(1)}" width="${((u1 - u0) * W).toFixed(1)}" height="${((v1 - v0) * H).toFixed(1)}" preserveAspectRatio="none"/>` : ''}<image href="${esc(recurso(pl.imagen))}" x="0" y="0" width="${W}" height="${H}"/>`
      : `<g class="esquema">
          <polygon points="${pts(pl.esquema.contorno)}" class="esquema__contorno"/>
          <polygon points="${pts(pl.esquema.pasillo)}" class="esquema__comun"/>
          <polygon points="${pts(pl.esquema.nucleo)}" class="esquema__nucleo"/>
          <text x="${centro(pl.esquema.nucleo)[0]}" y="${centro(pl.esquema.nucleo)[1] - 12}" class="esquema__rotulo">Ascensor</text>
          <text x="${centro(pl.esquema.nucleo)[0]}" y="${centro(pl.esquema.nucleo)[1] + 14}" class="esquema__rotulo">escalera</text>
          ${(pl.esquema.areas || []).map((a) => `
            <polygon points="${pts(a.poligono)}" class="esquema__area"/>
            <text x="${centro(a.poligono)[0]}" y="${centro(a.poligono)[1]}" class="esquema__rotulo esquema__rotulo--area">${esc(a.rotulo)}</text>`).join('')}
        </g>`;
    const zonas = unidadesDePiso(piso.id).map((u) => {
      const poli = pl.posiciones[u.posicion].poligono;
      const [cx, cy] = centro(poli);
      return `<g class="zona zona--${u.estado}${u.id === elegida ? ' zona--elegida' : ''}" data-unidad="${u.id}" aria-hidden="true">
          <polygon points="${pts(poli)}"/>
          <circle class="ancla" data-ancla="${u.id}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1"/>
        </g>`;
    }).join('');
    return `
      <svg class="plano${ctx ? ' plano--contexto' : ''}" viewBox="${caja}" preserveAspectRatio="xMidYMid ${ctx ? 'slice' : 'meet'}" role="img" aria-label="Planta del ${esc(piso.etiqueta.toLowerCase())}">
        <defs>
          <pattern id="rayado" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" class="patron-fondo"/><line x1="0" y1="0" x2="0" y2="16" class="patron"/></pattern>
          <pattern id="cruzado" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" class="patron-fondo"/><path d="M0 0L16 16M16 0L0 16" class="patron"/></pattern>
        </defs>
        ${fondo}
        <rect class="limite" data-limite x="0" y="0" width="${W}" height="${H}"/>
        ${zonas}
      </svg>`;
  }

  function tarjetaUnidad(u, idPiso) {
    const t = tipoPorId[u.tipologia];
    const b = bono(u);
    const consultable = u.estado !== 'vendido';
    return `
      <article class="tarjeta tarjeta--flotante" aria-labelledby="t-${u.id}">
        <div class="tarjeta__cabeza">
          <h2 id="t-${u.id}">Dpto. ${u.id}</h2>
          ${chipEstado(u.estado)}
          <a class="circulo circulo--claro circulo--chico" href="${url(`piso/${idPiso}/`)}" data-cerrar-tarjeta aria-label="Cerrar">${icono('cerrar')}</a>
        </div>
        <p class="tarjeta__tipo">${esc(t.nombre)} · ${esc(t.resumen)}</p>
        <p class="tarjeta__precio">${precioTexto(u)}</p>
        ${b ? `<p class="tarjeta__bono">Califica al Bono del Buen Pagador de ${soles(b.monto)} <span>(referencial)</span></p>` : ''}
        ${consultable
          ? `<button class="pildora pildora--acento pildora--ancha" data-consultar="${u.id}" data-seccion="planta-piso">${icono('chat')}<span>${u.precio ? 'Consultar' : 'Consultar precio'}</span></button>`
          : `<a class="pildora pildora--ancha" href="${url('departamentos/', { tipo: u.tipologia, estado: 'disponible' })}">Ver ${esc(t.nombre)} disponibles</a>`}
        <dl class="filas">
          <div>${icono('area')}<dt>Área total</dt><dd>${m2(areaTotalDe(u))}</dd></div>
          <div>${icono('cama')}<dt>Dormitorios</dt><dd>${t.dormitorios}</dd></div>
          <div>${icono('bano')}<dt>Baños</dt><dd>${t.banos}</dd></div>
          <div>${icono('brujula')}<dt>Vista</dt><dd>${esc(orientacion(u))}</dd></div>
        </dl>
        <div class="tarjeta__acciones">
          <a class="pildora pildora--oscura" href="${url(`departamento/${u.id}/`)}">${icono('plano')}<span>Ver ficha</span></a>
          ${t.escenas.length ? `<a class="pildora" href="${url(`departamento/${u.id}/`, { seccion: 'recorrido' })}">${icono('giro')}<span>Recorrido 360°</span></a>` : ''}
        </div>
      </article>`;
  }

  function vistaPiso(id) {
    const piso = pisoPorId[id];
    if (!piso) return vistaNoEncontrada();
    const q = query();
    const elegida = unidadPorId[q.d]?.piso === id ? q.d : null;
    const leyenda = `<ul class="leyenda">${Object.keys(ESTADO).map((e) => `<li>${chipEstado(e)}</li>`).join('')}</ul>`;
    let escena;
    if (piso.plantilla) {
      // Marcadores HTML de tamaño fijo en pantalla: se leen igual con cualquier
      // zoom. Los coloca colocarPines() sobre las anclas del SVG.
      const pines = unidadesDePiso(id).map((u) => `<button class="pin-unidad pin-unidad--${u.estado}${u.id === elegida ? ' pin-unidad--elegido' : ''}" data-unidad="${u.id}" data-pin="${u.id}" aria-pressed="${u.id === elegida}" aria-label="Departamento ${u.id}, ${esc(tipoPorId[u.tipologia].nombre)}, ${ESTADO[u.estado].txt}"><span class="pin-unidad__punto" aria-hidden="true"></span>${u.id}</button>`).join('');
      escena = `<div class="lienzo-plano" data-piso="${esc(id)}">${planoPiso(piso, elegida)}</div><div class="pines">${pines}</div>`;
    } else {
      escena = `<div class="escena__vacia">${marcador(piso.etiqueta, piso.uso)}</div>`;
    }
    const disp = piso.plantilla ? unidadesDePiso(id).filter((u) => u.estado === 'disponible').length : null;
    return `
      ${aviso()}
      <main class="inmersiva inmersiva--piso${elegida ? ' inmersiva--con-tarjeta' : ''}">
        <div class="escena escena--plano">${escena}</div>
        ${controles(url('edificio/'))}
        <div class="insignia">
          <h1>${esc(piso.etiqueta)}</h1>
          <p>${disp === null ? esc(piso.uso) : disp ? plural(disp, 'disponible') : 'Sin disponibles'}</p>
        </div>
        <a class="pildora pildora--buscar" href="${url('departamentos/')}">${icono('buscar')}<span>Buscar departamentos</span></a>
        ${columnaPisos(id)}
        ${piso.plantilla ? `<div class="flotante flotante--abajo-izq">
          <div class="zoom" role="group" aria-label="Acercar o alejar la planta">
            <button class="circulo circulo--blanco" data-zoom="1" aria-label="Acercar">${icono('mas')}</button>
            <button class="circulo circulo--blanco" data-zoom="-1" aria-label="Alejar">${icono('menos')}</button>
          </div>
          ${leyenda}
        </div>` : ''}
        ${elegida ? tarjetaUnidad(unidadPorId[elegida], id) : piso.plantilla ? '<p class="pista">Toca un departamento para ver su precio y su planta</p>' : ''}
        ${menu()}
      </main>`;
  }

  // ── Ficha del departamento ─────────────────────────────────────────────────

  const SECCIONES = [
    { id: 'planta', txt: 'Planta', ic: 'plano' },
    { id: 'recorrido', txt: 'Recorrido 360°', ic: 'giro' },
    { id: 'vistas', txt: 'Vista', ic: 'brujula' },
  ];

  function seccionUnidad(u, sec, q) {
    const t = tipoPorId[u.tipologia];
    if (sec === 'recorrido') {
      const escena = t.escenas.find((e) => e.id === q.escena) || t.escenas[0];
      const visor = escena.panorama
        ? `<div id="visor360" class="visor360" data-tipo="${esc(t.id)}" data-escena="${esc(escena.id)}" role="application" aria-label="Recorrido 360° de ${esc(t.nombre)}: arrastra para mirar alrededor"></div>`
        : marcador(`Recorrido 360° · ${escena.nombre}`, `${t.nombre} · panorama equirectangular`, 'marcador--panorama');
      return `
        ${visor}
        <nav class="ambientes-360" aria-label="Ambientes">
          ${t.escenas.map((e) => `<a class="pildora pildora--chica" data-escena-btn="${esc(e.id)}" href="${url(`departamento/${u.id}/`, { seccion: 'recorrido', escena: e.id })}" aria-current="${e.id === escena.id}">${esc(e.nombre)}</a>`).join('')}
        </nav>
        <p class="nota">Arrastra para mirar alrededor y usa las flechas para pasar de un ambiente a otro. Recorrido de la tipología ${esc(t.nombre)}, con los mismos acabados en todos los pisos.</p>`;
    }
    if (sec === 'vistas') {
      // La fidelidad se declara siempre: una vista proyectada no es una foto.
      const FIDELIDAD = {
        real: 'Foto tomada desde esa altura y orientación.',
        proyectada: 'Vista proyectada: render del entorno a la altura y orientación de este piso. No es una foto.',
        ilustrativa: 'Vista ilustrativa: referencial, no corresponde a la altura exacta.',
      };
      const v = u.vista;
      return v?.imagen
        ? `<figure class="vista-piso"><img src="${esc(recurso(v.imagen))}" alt="Vista desde el piso ${esc(u.piso)}, ${esc(orientacion(u).toLowerCase())}" loading="lazy">
            <figcaption><b>Desde el piso ${esc(u.piso)} · ${esc(orientacion(u))}</b><span>${esc(FIDELIDAD[v.fidelidad] || '')}</span></figcaption></figure>`
        : `${marcador(`Vista desde el piso ${u.piso}`, orientacion(u))}
          <p class="nota">Cada vista se etiqueta como real, proyectada o ilustrativa según cómo se obtuvo.</p>`;
    }
    const modo = q.plano === 'tecnico' ? 'tecnico' : 'amoblada';
    const img = modo === 'tecnico' ? t.planta.plano : t.planta.amoblada;
    return `
      <div class="segmentado segmentado--claro" role="group" aria-label="Tipo de planta">
        <a href="${url(`departamento/${u.id}/`, { seccion: 'planta' })}" aria-pressed="${modo === 'amoblada'}">Amoblada</a>
        <a href="${url(`departamento/${u.id}/`, { seccion: 'planta', plano: 'tecnico' })}" aria-pressed="${modo === 'tecnico'}">Plano técnico</a>
      </div>
      <div class="lamina">${img ? `<img src="${esc(recurso(img))}" alt="Planta ${modo === 'tecnico' ? 'técnica' : 'amoblada'} del ${esc(t.nombre)}">` : marcador(modo === 'tecnico' ? `Plano técnico · ${t.nombre}` : `Planta amoblada · ${t.nombre}`, 'Vista cenital del mismo modelo que los interiores')}</div>`;
  }

  function vistaUnidad(id) {
    const u = unidadPorId[id];
    if (!u) return vistaNoEncontrada();
    const t = tipoPorId[u.tipologia];
    const piso = pisoPorId[u.piso];
    const q = query();
    // Solo las secciones con contenido: sin escenas no hay pestaña de recorrido.
    const secciones = SECCIONES.filter((s) => s.id !== 'recorrido' || t.escenas.length);
    const sec = secciones.some((s) => s.id === q.seccion) ? q.seccion : 'planta';
    const consultable = u.estado !== 'vendido';
    const b = bono(u);
    return pagina(`
      <div class="ficha">
        <section class="ficha__media" aria-label="Contenido del departamento">
          <div class="ficha__titulo">
            <h1>Dpto. ${u.id}</h1>
            <p>${esc(t.nombre)} · ${esc(t.resumen)} · ${esc(piso.etiqueta).replace(' ', '&nbsp;')}</p>
          </div>
          <nav class="pestanas" aria-label="Secciones">
            ${secciones.map((s) => `<a href="${url(`departamento/${u.id}/`, { seccion: s.id })}"${s.id === sec ? ' aria-current="page"' : ''}>${icono(s.ic)}<span>${s.txt}</span></a>`).join('')}
          </nav>
          <div class="ficha__seccion">${seccionUnidad(u, sec, q)}</div>
        </section>
        <aside class="tarjeta ficha__tarjeta">
          <div class="tarjeta__cabeza"><p class="tarjeta__precio">${precioTexto(u)}</p>${chipEstado(u.estado)}</div>
          ${u.estado === 'disponible' && u.precio ? '<p class="nota">Precio de ejemplo.</p>' : ''}
          ${b ? `<p class="tarjeta__bono">Califica al Bono del Buen Pagador de ${soles(b.monto)} <span>(${esc(D.proyecto.bonoBuenPagador.referencia.toLowerCase())}; sujeto a calificación)</span></p>` : ''}
          ${consultable
            ? `<button class="pildora pildora--acento pildora--ancha" data-consultar="${u.id}" data-seccion="${sec}">${icono('chat')}<span>Consultar por este departamento</span></button>`
            : `<a class="pildora pildora--acento pildora--ancha" href="${url('departamentos/', { tipo: u.tipologia, estado: 'disponible' })}">Ver ${esc(t.nombre)} disponibles</a>`}
          <dl class="filas">
            <div>${icono('area')}<dt>Área techada</dt><dd>${m2(t.areaTechada)}</dd></div>
            ${areaLibreDe(u) ? `<div>${icono('area')}<dt>Área libre</dt><dd>${m2(areaLibreDe(u))}</dd></div>` : ''}
            <div>${icono('area')}<dt>Área total</dt><dd>${m2(areaTotalDe(u))}</dd></div>
            <div>${icono('cama')}<dt>Dormitorios</dt><dd>${t.dormitorios}</dd></div>
            <div>${icono('bano')}<dt>Baños</dt><dd>${t.banos}</dd></div>
            <div>${icono('edificio')}<dt>Piso</dt><dd>${esc(piso.etiqueta.replace('Piso ', ''))}</dd></div>
            <div>${icono('brujula')}<dt>Vista</dt><dd>${esc(orientacion(u))}</dd></div>
          </dl>
          <h2 class="tarjeta__sub">Ambientes</h2>
          <ul class="lista-ambientes">${[...t.ambientes, ...(u.extras || [])].map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          <div class="tarjeta__acciones">
            <a class="pildora" href="${url(`piso/${u.piso}/`, { d: u.id })}">${icono('pisos')}<span>Ver en la planta</span></a>
            <button class="pildora" data-compartir>${icono('enlace')}<span>Copiar enlace</span></button>
            <button class="pildora" data-imprimir>${icono('imprimir')}<span>Imprimir ficha</span></button>
          </div>
          <p class="nota">Áreas y precios de ejemplo hasta tener los planos y la lista de precios del proyecto.</p>
        </aside>
      </div>`, { atras: url(`piso/${u.piso}/`, { d: u.id }), atrasTxt: piso.etiqueta });
  }

  // ── Catálogo ───────────────────────────────────────────────────────────────

  function filtrar(q) {
    return D.unidades.filter((u) => {
      const t = tipoPorId[u.tipologia];
      if (q.tipo && u.tipologia !== q.tipo) return false;
      if (q.dorm && String(t.dormitorios) !== q.dorm) return false;
      if (q.estado && u.estado !== q.estado) return false;
      if (q.desde && Number(u.piso) < Number(q.desde)) return false;
      return true;
    });
  }

  function vistaCatalogo() {
    const q = query();
    const res = filtrar(q);
    const opciones = (lista, actual) => lista.map(([v, txt]) => `<option value="${esc(v)}"${String(actual ?? '') === v ? ' selected' : ''}>${esc(txt)}</option>`).join('');
    const dorms = [...new Set(D.tipologias.map((t) => t.dormitorios))].sort();
    const grupos = D.tipologias.map((t) => {
      const filas = res.filter((u) => u.tipologia === t.id);
      if (!filas.length) return '';
      return `
        <section class="grupo">
          <div class="grupo__cabeza">
            ${t.planta.amoblada ? `<img src="${esc(recurso(t.planta.amoblada))}" alt="" loading="lazy">` : ''}
            <div><h2>${esc(t.nombre)}</h2><p>${esc(t.resumen)} · ${m2(areaTotal(t))}</p></div>
          </div>
          <table class="tabla">
            <thead><tr><th scope="col">Dpto.</th><th scope="col">Piso</th><th scope="col">Vista</th><th scope="col">Estado</th><th scope="col">Precio</th></tr></thead>
            <tbody>
              ${filas.map((u) => `<tr>
                <th scope="row"><a href="${url(`departamento/${u.id}/`)}">${u.id}</a></th>
                <td>${esc(pisoPorId[u.piso].etiqueta.replace('Piso ', ''))}</td>
                <td>${esc(orientacion(u))}</td>
                <td>${chipEstado(u.estado)}</td>
                <td>${u.estado === 'disponible' ? `${precioTexto(u)}${bono(u) ? `<small class="bono-mini">Bono ${soles(bono(u).monto)}</small>` : ''}` : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </section>`;
    }).join('');
    const disp = res.filter((u) => u.estado === 'disponible').length;
    return pagina(`
      <div class="encabezado"><h1>Departamentos</h1><p>${plural(res.length, 'departamento')} · ${plural(disp, 'disponible')}</p></div>
      <form class="filtros" aria-label="Filtros">
        <label><span>Tipología</span><select name="tipo"><option value="">Todas</option>${opciones(D.tipologias.map((t) => [t.id, t.nombre]), q.tipo)}</select></label>
        <label><span>Dormitorios</span><select name="dorm"><option value="">Todos</option>${opciones(dorms.map((n) => [String(n), String(n)]), q.dorm)}</select></label>
        <label><span>Estado</span><select name="estado"><option value="">Todos</option>${opciones(Object.entries(ESTADO).map(([k, v]) => [k, v.txt]), q.estado)}</select></label>
        <label><span>Desde el piso</span><select name="desde"><option value="">Cualquiera</option>${opciones(pisosResidenciales.map((p) => [p.id, p.id]), q.desde)}</select></label>
        ${Object.keys(q).length ? `<a class="pildora pildora--chica" href="${url('departamentos/')}">Limpiar filtros</a>` : ''}
      </form>
      ${grupos || (D.unidades.length ? '<p class="vacio">Ningún departamento coincide con esos filtros.</p>' : `<p class="vacio">Inventario por confirmar. Mientras tanto puedes ver los <a href="${url('modelos/')}">modelos de departamento</a>.</p>`)}`);
  }

  // ── Modelos ────────────────────────────────────────────────────────────────
  // Una lámina por tipología con su planta amoblada: la puerta de entrada de
  // quien todavía no sabe en qué piso quiere vivir.

  function vistaModelos() {
    const laminas = D.tipologias.map((t) => {
      const suyas = D.unidades.filter((u) => u.tipologia === t.id);
      const disp = suyas.filter((u) => u.estado === 'disponible').length;
      return `
        <article class="modelo">
          <div class="modelo__lamina">${t.planta.amoblada ? `<img src="${esc(recurso(t.planta.amoblada))}" alt="Planta amoblada del ${esc(t.nombre)}" loading="lazy">` : marcador(`Planta amoblada · ${t.nombre}`)}</div>
          <div class="modelo__texto">
            <h2>${esc(t.nombre)}</h2>
            <p>${esc(t.resumen)}</p>
            <ul class="modelo__datos">
              <li>${icono('area')}${m2(areaTotal(t))}</li>
              <li>${icono('cama')}${plural(t.dormitorios, 'dormitorio')}</li>
              <li>${icono('bano')}${plural(t.banos, 'baño')}</li>
            </ul>
            ${suyas.length ? `<a class="pildora pildora--chica" href="${url('departamentos/', { tipo: t.id })}">${disp ? `Ver ${plural(disp, 'disponible')}` : `Ver los ${suyas.length} departamentos`}</a>` : ''}
          </div>
        </article>`;
    }).join('');
    return pagina(`<div class="encabezado"><h1>Modelos</h1><p>${plural(D.tipologias.length, 'distribución', 'distribuciones')}</p></div><div class="modelos">${laminas}</div>`);
  }

  function vistaNoEncontrada() {
    return pagina(`<div class="encabezado"><h1>No encontramos esa página</h1><p><a href="${url('edificio/')}">Volver al edificio</a></p></div>`);
  }

  // ── Consulta ───────────────────────────────────────────────────────────────
  // En modo demo no se envía nada: se muestra lo que llegaría al asesor, con la
  // unidad y la sección desde donde se consultó.

  function abrirConsulta(id, seccion) {
    const u = unidadPorId[id];
    const t = tipoPorId[u.tipologia];
    const dlg = document.createElement('dialog');
    dlg.className = 'consulta';
    dlg.innerHTML = `
      <form method="dialog" class="consulta__form">
        <h2>Consultar por el Dpto. ${u.id}</h2>
        <p class="consulta__contexto">${esc(t.nombre)} · ${esc(pisoPorId[u.piso].etiqueta)} · ${precioTexto(u)}</p>
        <label>Nombre<input name="nombre" autocomplete="name" required></label>
        <label>Celular<input name="celular" type="tel" autocomplete="tel" inputmode="tel" required></label>
        <label>Mensaje<textarea name="mensaje" rows="3">Hola, me interesa el Dpto. ${u.id} (${t.nombre}, piso ${u.piso}). ¿Me envían más información?</textarea></label>
        ${D.proyecto.contacto.modo === 'demo' ? '<p class="nota">Modo demo: esta consulta no se envía a nadie.</p>' : ''}
        <div class="consulta__acciones">
          <button class="pildora pildora--acento" value="enviar">Enviar consulta</button>
          <button class="pildora" value="cancelar" formnovalidate>Cancelar</button>
        </div>
      </form>`;
    document.body.append(dlg);
    dlg.querySelector('form').addEventListener('submit', (e) => {
      if (e.submitter?.value !== 'enviar') return;
      e.preventDefault();
      const f = new FormData(e.target);
      const resumen = { unidad: u.id, piso: u.piso, tipologia: u.tipologia, seccion, nombre: f.get('nombre'), celular: f.get('celular'), mensaje: f.get('mensaje') };
      dlg.innerHTML = `
        <form method="dialog" class="consulta__form">
          <h2>Consulta registrada (demo)</h2>
          <p>En producción esto le llegaría al asesor con el contexto del departamento:</p>
          <pre>${esc(JSON.stringify(resumen, null, 2))}</pre>
          <div class="consulta__acciones"><button class="pildora pildora--acento">Cerrar</button></div>
        </form>`;
    });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
  }

  // ── Recorrido 360 ─────────────────────────────────────────────────────────
  // Pannellum se carga solo al abrir un recorrido: quien no lo usa no paga
  // sus ~65 KB ni descarga ningún panorama.

  let promesaPannellum = null;
  function cargarPannellum() {
    if (window.pannellum) return Promise.resolve();
    if (!promesaPannellum) {
      promesaPannellum = new Promise((ok, mal) => {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = recurso('vendor/pannellum.css');
        document.head.append(css);
        const js = document.createElement('script');
        js.src = recurso('vendor/pannellum.js');
        js.onload = ok;
        js.onerror = mal;
        document.head.append(js);
      });
    }
    return promesaPannellum;
  }

  let visor360 = null;
  function montarVisor() {
    if (visor360) {
      try { visor360.destroy(); } catch { /* ya no existe */ }
      visor360 = null;
    }
    const el = app.querySelector('#visor360');
    if (!el) return;
    const t = tipoPorId[el.dataset.tipo];
    cargarPannellum().then(() => {
      if (!el.isConnected) return;
      const scenes = {};
      for (const e of t.escenas) {
        scenes[e.id] = {
          title: e.nombre,
          type: 'equirectangular',
          panorama: recurso(e.panorama),
          hfov: 105,
          yaw: e.yaw || 0,
          hotSpots: (e.enlaces || []).map((h) => ({ pitch: h.pitch, yaw: h.yaw, type: 'scene', text: h.texto, sceneId: h.a })),
        };
      }
      visor360 = window.pannellum.viewer(el, {
        default: { firstScene: el.dataset.escena, sceneFadeDuration: 500, autoLoad: true, compass: false, showFullscreenCtrl: true },
        scenes,
      });
      visor360.on('scenechange', (id) => {
        fijarQuery({ escena: id });
        app.querySelectorAll('[data-escena-btn]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.escenaBtn === id)));
      });
    }).catch(() => {
      el.innerHTML = '<p class="nota">No se pudo cargar el recorrido 360°.</p>';
    });
  }

  // ── Paradas del exterior ──────────────────────────────────────────────────
  // Cambiar de parada no rehace la página: la imagen nueva entra con un
  // fundido sobre la anterior, como el corte entre tomas de la referencia.

  function irAVista(k) {
    const cont = app.querySelector('.inmersiva--edificio');
    if (!cont) return;
    const n = D.vistas.length;
    const i = ((k % n) + n) % n;
    const q = query();
    const modo = q.modo === 'noche' ? 'noche' : 'dia';
    const v = D.vistas[i];
    const src = imagenVista(v, modo);
    cont.dataset.vistaActual = i;
    fijarQuery({ vista: v.id });
    cont.querySelector('[data-parada-nombre]').textContent = v.nombre;
    cont.querySelectorAll('[data-ir-vista]').forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
    const actual = cont.querySelector('[data-escena-img]');
    if (!src || !actual) return render({ foco: false });
    const franjasViejas = cont.querySelector('.franjas');
    if (franjasViejas) franjasViejas.outerHTML = franjasSvg(v, src) || '<span hidden class="franjas"></span>';
    const nueva = actual.cloneNode();
    nueva.src = recurso(src);
    nueva.alt = `${D.proyecto.nombre}, vista ${v.nombre.toLowerCase()}`;
    nueva.classList.add('escena__img--entrando');
    const fondo = cont.querySelector('.escena__fondo');
    const listo = () => {
      actual.after(nueva);
      ajustarEncaje(nueva);
      requestAnimationFrame(() => nueva.classList.remove('escena__img--entrando'));
      if (fondo) fondo.src = nueva.src;
      setTimeout(() => actual.remove(), 700);
    };
    if (nueva.complete) listo(); else nueva.addEventListener('load', listo, { once: true });
  }

  // Encuadre según la imagen real: si su proporción se parece a la de la
  // pantalla, la llena; si no (un render vertical en escritorio, uno 16:9 en un
  // celular sin versión vertical), se muestra entera sobre su fondo difuso.
  function ajustarEncaje(img) {
    const aplicar = () => {
      if (!img.naturalWidth) return;
      const r = (img.naturalWidth / img.naturalHeight) / (innerWidth / innerHeight);
      const entera = r < 0.72 || r > 1.45;
      img.classList.toggle('escena__img--entera', entera);
      img.parentElement?.querySelector('.franjas')?.setAttribute('preserveAspectRatio', `xMidYMid ${entera ? 'meet' : 'slice'}`);
    };
    if (img.complete) aplicar(); else img.addEventListener('load', aplicar, { once: true });
  }

  // Precarga las demás paradas para que el fundido no espere a la red.
  function precargarVistas() {
    if (!app.querySelector('.inmersiva--edificio')) return;
    for (const v of D.vistas) { const src = imagenVista(v); if (src) { const im = new Image(); im.src = recurso(src); } }
  }

  // ── Planta: zoom, arrastre y marcadores ───────────────────────────────────
  // El estado del encuadre sobrevive al elegir otra unidad (la vista se vuelve
  // a dibujar) mientras no se cambie de piso.

  let encuadre = null;
  const limitar = (n, a, b) => Math.min(b, Math.max(a, n));

  function aplicarEncuadre() {
    const svg = app.querySelector('.lienzo-plano .plano');
    if (!svg || !encuadre) return;
    svg.style.transform = `translate(${encuadre.x}px, ${encuadre.y}px) scale(${encuadre.s})`;
    colocarPines();
  }

  function colocarPines() {
    const cont = app.querySelector('.inmersiva--piso');
    if (!cont) return;
    const base = cont.getBoundingClientRect();
    cont.querySelectorAll('[data-pin]').forEach((pin) => {
      const ancla = cont.querySelector(`[data-ancla="${pin.dataset.pin}"]`);
      if (!ancla) return;
      const r = ancla.getBoundingClientRect();
      pin.style.transform = `translate(${(r.left + r.width / 2 - base.left).toFixed(1)}px, ${(r.top + r.height / 2 - base.top).toFixed(1)}px) translate(-50%, -50%)`;
    });
  }

  // Zoom alrededor de un punto de pantalla (el cursor, o el centro).
  function zoomEn(factor, px, py) {
    const lienzo = app.querySelector('.lienzo-plano');
    if (!lienzo || !encuadre) return;
    const b = lienzo.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const s2 = limitar(encuadre.s * factor, encuadre.min || 0.5, 4);
    const k = s2 / encuadre.s;
    encuadre.x = (px - cx) - (px - cx - encuadre.x) * k;
    encuadre.y = (py - cy) - (py - cy - encuadre.y) * k;
    encuadre.s = s2;
    aplicarEncuadre();
  }

  // Lleva la unidad elegida a la zona visible: a la derecha de la tarjeta en
  // escritorio, por encima de la hoja inferior en el celular. Nunca encoge.
  function asegurarVisible(id) {
    const cont = app.querySelector('.inmersiva--piso');
    const ancla = cont?.querySelector(`[data-ancla="${id}"]`);
    const tarjeta = cont?.querySelector('.tarjeta--flotante');
    if (!ancla || !tarjeta || !encuadre) return;
    const base = cont.getBoundingClientRect();
    const t = tarjeta.getBoundingClientRect();
    const a = ancla.getBoundingClientRect();
    const px = a.left - base.left;
    const py = a.top - base.top;
    const movil = t.width > base.width * 0.8;
    const zona = movil
      ? { x0: 0, x1: base.width, y0: 110, y1: t.top - base.top - 10 }
      : { x0: t.right - base.left + 20, x1: base.width - (base.width > 900 ? 160 : 20), y0: 90, y1: base.height - 70 };
    const objX = (zona.x0 + zona.x1) / 2;
    const objY = (zona.y0 + zona.y1) / 2;
    if (px < zona.x0 || px > zona.x1) encuadre.x += objX - px;
    if (py < zona.y0 || py > zona.y1) encuadre.y += objY - py;
    aplicarEncuadre();
  }

  // Encuadre inicial: el edificio entero dentro de la zona libre de controles
  // (arriba la botonera, abajo la leyenda, a la derecha la columna de pisos).
  function encuadreInicial(lienzo) {
    const svg = lienzo.querySelector('.plano');
    const limite = svg?.querySelector('[data-limite]');
    if (!limite) return { s: 1, x: 0, y: 0 };
    svg.style.transform = 'none';
    const b = lienzo.getBoundingClientRect();
    const r = limite.getBoundingClientRect();
    const movil = innerWidth <= 760;
    const aSangre = svg.classList.contains('plano--contexto');
    const zona = !aSangre
      ? { x0: b.left, x1: b.right, y0: b.top, y1: b.bottom }
      : movil
        ? { x0: b.left + 12, x1: b.right - 12, y0: b.top + 118, y1: b.bottom - 100 }
        : { x0: b.left + 24, x1: b.right - 156, y0: b.top + 84, y1: b.bottom - 72 };
    const s = Math.min((zona.x1 - zona.x0) / r.width, (zona.y1 - zona.y0) / r.height);
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    // con transform-origin al centro: posición final = c + (p - c)·s + t
    const rcx = r.left + r.width / 2;
    const rcy = r.top + r.height / 2;
    return { s, x: (zona.x0 + zona.x1) / 2 - (cx + (rcx - cx) * s), y: (zona.y0 + zona.y1) / 2 - (cy + (rcy - cy) * s), min: aSangre ? Math.max(1, s * 0.85) : s };
  }

  function montarPlano() {
    const lienzo = app.querySelector('.lienzo-plano');
    if (!lienzo) { encuadre = null; return; }
    if (!encuadre || encuadre.piso !== lienzo.dataset.piso) encuadre = { piso: lienzo.dataset.piso, ...encuadreInicial(lienzo) };
    aplicarEncuadre();
    const elegida = query().d;
    if (elegida) requestAnimationFrame(() => asegurarVisible(elegida));
  }

  // Arrastre con el puntero; un toque sin arrastre sigue siendo un clic.
  let arrastre = null;
  document.addEventListener('pointerdown', (e) => {
    const lienzo = e.target.closest('.lienzo-plano');
    if (!lienzo || !encuadre || e.button !== 0) return;
    arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: encuadre.x, oy: encuadre.y, movido: false };
  });
  document.addEventListener('pointermove', (e) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    const dx = e.clientX - arrastre.x;
    const dy = e.clientY - arrastre.y;
    if (!arrastre.movido && Math.hypot(dx, dy) < 6) return;
    arrastre.movido = true;
    encuadre.x = arrastre.ox + dx;
    encuadre.y = arrastre.oy + dy;
    aplicarEncuadre();
  });
  document.addEventListener('pointerup', (e) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    if (arrastre.movido) {
      // el clic que sigue a un arrastre no debe elegir una unidad
      const bloquear = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      document.addEventListener('click', bloquear, { capture: true, once: true });
      setTimeout(() => document.removeEventListener('click', bloquear, { capture: true }), 50);
    }
    arrastre = null;
  });
  document.addEventListener('wheel', (e) => {
    if (!e.target.closest('.lienzo-plano') || !encuadre) return;
    e.preventDefault();
    zoomEn(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
  }, { passive: false });
  addEventListener('resize', () => colocarPines());

  // ── Fachada: franja ↔ columna de pisos ────────────────────────────────────

  function resaltarPiso(id) {
    const cont = app.querySelector('.inmersiva--edificio');
    if (!cont) return;
    cont.querySelectorAll('.franja').forEach((f) => f.classList.toggle('franja--activa', f.dataset.franja === id));
    cont.querySelectorAll('.piso-pildora').forEach((a) => a.classList.toggle('piso-pildora--resaltado', a.dataset.piso === id));
    const rotulo = cont.querySelector('[data-franja-rotulo]');
    const piso = id && pisoPorId[id];
    if (rotulo) {
      if (piso) {
        const disp = piso.plantilla ? unidadesDePiso(id).filter((u) => u.estado === 'disponible').length : null;
        rotulo.textContent = `${piso.etiqueta}${disp === null ? '' : ` · ${disp ? plural(disp, 'disponible') : 'sin disponibles'}`}`;
        rotulo.hidden = false;
        // Desde la columna no hay cursor sobre la fachada: el rótulo se pega
        // al borde derecho de la franja iluminada.
        const f = cont.querySelector(`.franja[data-franja="${id}"]`);
        if (f && !rotulo.dataset.cursor) {
          const r = f.getBoundingClientRect();
          rotulo.style.transform = `translate(${Math.round(r.right + 12)}px, ${Math.round(r.top + r.height / 2 - 16)}px)`;
        }
      } else rotulo.hidden = true;
    }
  }
  document.addEventListener('pointerover', (e) => {
    const f = e.target.closest?.('.franja, .piso-pildora');
    const rot = app.querySelector('[data-franja-rotulo]');
    if (rot) { if (f?.classList.contains('franja')) rot.dataset.cursor = '1'; else delete rot.dataset.cursor; }
    if (app.querySelector('.inmersiva--edificio')) resaltarPiso(f ? (f.dataset.franja || f.dataset.piso) : null);
  });
  document.addEventListener('focusin', (e) => {
    const f = e.target.closest?.('.piso-pildora');
    if (f && app.querySelector('.inmersiva--edificio')) resaltarPiso(f.dataset.piso);
  });
  document.addEventListener('pointermove', (e) => {
    const rotulo = app.querySelector('[data-franja-rotulo]');
    if (rotulo && !rotulo.hidden && e.target.closest?.('.franja')) {
      rotulo.style.transform = `translate(${e.clientX + 16}px, ${e.clientY - 12}px)`;
    }
  });

  // ── Enrutado ───────────────────────────────────────────────────────────────

  function render({ foco = true } = {}) {
    const partes = location.pathname.slice(BASE.pathname.length).split('/').filter(Boolean);
    let html;
    if (!partes.length) html = vistaPortada();
    else if (partes[0] === 'edificio') html = vistaEdificio();
    else if (partes[0] === 'departamentos') html = vistaCatalogo();
    else if (partes[0] === 'modelos') html = vistaModelos();
    else if (partes[0] === 'piso' && partes[1]) html = vistaPiso(partes[1]);
    else if (partes[0] === 'departamento' && partes[1]) html = vistaUnidad(partes[1]);
    else html = vistaNoEncontrada();
    app.innerHTML = html;
    document.body.dataset.vista = partes[0] || 'portada';
    montarVisor();
    precargarVistas();
    app.querySelectorAll('[data-escena-img]').forEach(ajustarEncaje);
    montarPlano();
    actualizarTitulo(partes);
    // Al cambiar de pantalla, el lector de pantalla arranca por el título nuevo.
    const h1 = app.querySelector('h1');
    if (foco && h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }

  function actualizarTitulo(partes) {
    const p = D.proyecto;
    const piso = partes[0] === 'piso' && pisoPorId[partes[1]];
    const u = partes[0] === 'departamento' && unidadPorId[partes[1]];
    const t = u ? `Dpto. ${u.id} · ${tipoPorId[u.tipologia].nombre}` : piso ? piso.etiqueta : partes[0] === 'edificio' ? 'Edificio' : partes[0] === 'departamentos' ? 'Departamentos' : partes[0] === 'modelos' ? 'Modelos' : null;
    document.title = t ? `${t} · ${p.nombre}` : `${p.nombre} · ${p.marca}`;
  }

  function navegar(destino, { reemplazar = false } = {}) {
    history[reemplazar ? 'replaceState' : 'pushState'](null, '', destino);
    render();
    window.scrollTo({ top: 0 });
  }

  // Rerender sin mover el scroll ni el foco: para cambios de estado dentro de
  // la misma pantalla (modo, departamento elegido, filtros).
  function refrescar(cambios) {
    fijarQuery(cambios);
    const activo = document.activeElement?.dataset?.unidad;
    render({ foco: false });
    if (activo) app.querySelector(`[data-unidad="${activo}"]`)?.focus();
  }

  function abrirMenu(abrir) {
    const m = app.querySelector('#menu');
    const b = app.querySelector('[data-menu]');
    if (!m) return;
    m.hidden = !abrir;
    b?.setAttribute('aria-expanded', String(abrir));
    if (abrir) m.querySelector('a, button')?.focus(); else b?.focus();
  }

  function copiarEnlace(btn) {
    const etiqueta = btn.querySelector('span') || null;
    const original = etiqueta ? etiqueta.textContent : btn.getAttribute('aria-label');
    const avisar = (txt) => {
      if (etiqueta) etiqueta.textContent = txt; else btn.setAttribute('aria-label', txt);
      btn.classList.add('copiado');
      setTimeout(() => { if (etiqueta) etiqueta.textContent = original; else btn.setAttribute('aria-label', original); btn.classList.remove('copiado'); }, 1800);
    };
    navigator.clipboard?.writeText(location.href).then(() => avisar('Enlace copiado'), () => avisar('No se pudo copiar'));
  }

  const esPropio = (a) => a && a.origin === location.origin && a.pathname.startsWith(BASE.pathname) && !a.target && !a.hasAttribute('download');

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-menu]')) return abrirMenu(true);
    if (t.closest('[data-menu-cerrar]') || t.classList?.contains('menu')) return abrirMenu(false);
    const franja = t.closest('[data-franja]');
    if (franja && pisoPorId[franja.dataset.franja]) return navegar(url(`piso/${franja.dataset.franja}/`));
    const zoom = t.closest('[data-zoom]');
    if (zoom) {
      const b = app.querySelector('.lienzo-plano')?.getBoundingClientRect();
      if (b) zoomEn(Number(zoom.dataset.zoom) > 0 ? 1.4 : 1 / 1.4, b.left + b.width / 2, b.top + b.height / 2);
      return;
    }
    const zona = t.closest('[data-unidad]');
    if (zona) return refrescar({ d: zona.dataset.unidad });
    const cerrarTarjeta = t.closest('[data-cerrar-tarjeta]');
    if (cerrarTarjeta) { e.preventDefault(); return refrescar({ d: null }); }
    const btnEscena = t.closest('[data-escena-btn]');
    if (btnEscena && visor360) {
      e.preventDefault();
      visor360.loadScene(btnEscena.dataset.escenaBtn);
      return;
    }
    const paso = t.closest('[data-paso]');
    if (paso) return irAVista(Number(app.querySelector('.inmersiva--edificio').dataset.vistaActual) + Number(paso.dataset.paso));
    const irVista = t.closest('[data-ir-vista]');
    if (irVista) return irAVista(Number(irVista.dataset.irVista));
    const modo = t.closest('[data-modo]');
    if (modo) return refrescar({ modo: modo.dataset.modo === 'dia' ? null : 'noche' });
    if (t.closest('[data-pantalla]')) {
      if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.();
      return;
    }
    const consultar = t.closest('[data-consultar]');
    if (consultar) return abrirConsulta(consultar.dataset.consultar, consultar.dataset.seccion);
    if (t.closest('[data-imprimir]')) return window.print();
    const compartir = t.closest('[data-compartir]');
    if (compartir) return copiarEnlace(compartir);
    const a = t.closest('a[href]');
    if (a && esPropio(a) && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      const mismaRuta = a.pathname === location.pathname;
      navegar(a.pathname + a.search, { reemplazar: mismaRuta });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !app.querySelector('#menu')?.hidden) return abrirMenu(false);
    const zona = e.target.closest?.('[data-unidad]');
    if (zona && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); refrescar({ d: zona.dataset.unidad }); return; }
    // Flechas del teclado recorren las paradas del exterior.
    const ed = app.querySelector('.inmersiva--edificio');
    if (ed && !e.target.closest('input, select, textarea') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      irAVista(Number(ed.dataset.vistaActual) + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // Deslizar con el dedo sobre la escena cambia de parada en el celular.
  let toqueX = null;
  document.addEventListener('touchstart', (e) => { if (e.target.closest('.inmersiva--edificio .escena')) toqueX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    toqueX = null;
    const ed = app.querySelector('.inmersiva--edificio');
    if (ed && Math.abs(dx) > 50) irAVista(Number(ed.dataset.vistaActual) + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('change', (e) => {
    const form = e.target.closest('.filtros');
    if (!form) return;
    const cambios = {};
    for (const [k, v] of new FormData(form)) cambios[k] = v || null;
    refrescar(cambios);
  });

  window.addEventListener('popstate', () => render());
  // Girar el celular cambia qué versión de imagen corresponde.
  addEventListener('resize', () => app.querySelectorAll('[data-escena-img]').forEach(ajustarEncaje));
  vertical.addEventListener('change', () => { if (/^(portada|edificio)$/.test(document.body.dataset.vista)) render({ foco: false }); });
  render({ foco: false });
})();
