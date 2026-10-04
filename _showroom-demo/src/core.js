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

(() => {
  const D = window.SHOWROOM;
  const app = document.getElementById('app');
  const BASE = new URL(document.documentElement.dataset.base || './', location.href);

  // ── Índices ────────────────────────────────────────────────────────────────
  const tipoPorId = Object.fromEntries(D.tipologias.map((t) => [t.id, t]));
  const pisoPorId = Object.fromEntries(D.pisos.map((p) => [p.id, p]));
  const unidadPorId = Object.fromEntries(D.unidades.map((u) => [u.id, u]));
  const unidadesDePiso = (id) => D.unidades.filter((u) => u.piso === id).sort((a, b) => a.posicion.localeCompare(b.posicion));
  const pisosResidenciales = D.pisos.filter((p) => p.plantilla);

  const ESTADO = {
    disponible: { txt: 'Disponible', icono: '●' },
    reservado: { txt: 'Reservado', icono: '◐' },
    vendido: { txt: 'Vendido', icono: '○' },
  };

  // ── Utilidades ─────────────────────────────────────────────────────────────
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const m2 = (n) => `${n.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m²`;
  const soles = (n) => `S/ ${n.toLocaleString('es-PE')}`;
  const url = (ruta, query = {}) => {
    const u = new URL(ruta, BASE);
    for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined && v !== '') u.searchParams.set(k, v);
    return u.pathname + u.search;
  };
  const query = () => Object.fromEntries(new URLSearchParams(location.search));
  const fijarQuery = (cambios) => {
    const q = { ...query(), ...cambios };
    const ruta = location.pathname.slice(BASE.pathname.length);
    history.replaceState(null, '', url(ruta, q));
  };
  const orientacion = (u) => u.orientacion || D.plantillas[pisoPorId[u.piso].plantilla].posiciones[u.posicion].orientacion;
  const areaTotal = (t) => t.areaTechada + (t.areaLibre || 0);

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

  const chipEstado =(estado) => `<span class="estado estado--${estado}"><span aria-hidden="true">${ESTADO[estado].icono}</span> ${ESTADO[estado].txt}</span>`;

  // Marcador para cualquier recurso visual que todavía no existe. Dice qué
  // irá ahí, para que la estructura se pueda revisar sin imágenes falsas.
  const marcador = (titulo, detalle = '', clase = '') =>
    `<div class="marcador ${clase}" role="img" aria-label="${esc(titulo)} (pendiente)"><span class="marcador__t">${esc(titulo)}</span>${detalle ? `<span class="marcador__d">${esc(detalle)}</span>` : ''}</div>`;

  // ── Marco común ────────────────────────────────────────────────────────────
  function marco(contenido, migas = []) {
    const p = D.proyecto;
    const ruta = location.pathname.slice(BASE.pathname.length);
    // La ficha de un departamento pertenece al recorrido del edificio; solo el
    // catálogo marca «Departamentos».
    const enCatalogo = ruta.startsWith('departamentos/');
    const actual = (si) => (si ? ' aria-current="page"' : '');
    return `
      ${p.modoDemo ? `<div class="aviso-demo">${esc(p.avisoDemo)}</div>` : ''}
      <header class="barra">
        <a class="barra__marca" href="${url('')}"><strong>${esc(p.marca)}</strong><span>${esc(p.nombre)}</span></a>
        <nav class="barra__nav" aria-label="Principal">
          <a href="${url('edificio/')}"${actual(ruta && !enCatalogo)}>Edificio</a>
          <a href="${url('departamentos/')}"${actual(enCatalogo)}>Departamentos</a>
        </nav>
      </header>
      ${migas.length ? `<nav class="migas" aria-label="Estás en"><ol>${migas.map((m, i) => (i === migas.length - 1 ? `<li aria-current="page">${esc(m.txt)}</li>` : `<li><a href="${m.href}">${esc(m.txt)}</a></li>`)).join('')}</ol></nav>` : ''}
      <main id="principal">${contenido}</main>`;
  }

  // ── Vistas ─────────────────────────────────────────────────────────────────

  function vistaPortada() {
    const p = D.proyecto;
    return `
      ${p.modoDemo ? `<div class="aviso-demo">${esc(p.avisoDemo)}</div>` : ''}
      <main class="portada">
        ${marcador('Video de portada', 'Fachada al atardecer, se encienden las luces · se puede saltar', 'portada__fondo')}
        <div class="portada__texto">
          <p class="portada__marca">${esc(p.marca)}</p>
          <h1>${esc(p.nombre)}</h1>
          <p>${esc(p.lema)} · ${esc(p.zona)}, ${esc(p.ciudad)}${p.zonaReferencial ? ' <span class="nota">(ubicación referencial)</span>' : ''}</p>
          <div class="acciones">
            <a class="boton boton--primario" href="${url('edificio/')}">Ingresar</a>
            <a class="boton" href="${url('departamentos/')}">Ver departamentos</a>
          </div>
        </div>
      </main>`;
  }

  function vistaEdificio() {
    const q = query();
    const i = Math.max(0, D.vistas.findIndex((v) => v.id === q.vista));
    const modo = q.modo === 'noche' ? 'noche' : 'dia';
    const v = D.vistas[i];
    const img = v.imagen[modo];
    const listaPisos = [...D.pisos].reverse().map((p) => {
      if (!p.plantilla) return `<li><a class="piso piso--comun" href="${url(`piso/${p.id}/`)}"><span>${esc(p.etiqueta)}</span><small>${esc(p.uso)}</small></a></li>`;
      const disp = unidadesDePiso(p.id).filter((u) => u.estado === 'disponible').length;
      return `<li><a class="piso" href="${url(`piso/${p.id}/`)}"><span>${esc(p.etiqueta)}</span><small>${disp ? `${disp} disponible${disp > 1 ? 's' : ''}` : 'Sin disponibles'}</small></a></li>`;
    }).join('');

    return marco(`
      <div class="edificio">
        <section class="escena" aria-label="Vista exterior">
          <div class="escena__lienzo">
            ${img ? `<img src="${esc(img)}" alt="${esc(D.proyecto.nombre)}, vista ${esc(v.nombre.toLowerCase())}">` : marcador(`Vista ${v.nombre.toLowerCase()} · ${modo === 'dia' ? 'día' : 'noche'}`, `Parada ${i + 1} de ${D.vistas.length} · render del exterior`)}
          </div>
          <div class="escena__controles">
            <button class="boton" data-vista="${(i - 1 + D.vistas.length) % D.vistas.length}" aria-label="Vista anterior">←</button>
            <span class="escena__nombre">${esc(v.nombre)} <small>${i + 1}/${D.vistas.length}</small></span>
            <button class="boton" data-vista="${(i + 1) % D.vistas.length}" aria-label="Vista siguiente">→</button>
            <div class="conmutador" role="group" aria-label="Iluminación">
              <button class="boton" data-modo="dia" aria-pressed="${modo === 'dia'}">Día</button>
              <button class="boton" data-modo="noche" aria-pressed="${modo === 'noche'}">Noche</button>
            </div>
          </div>
        </section>
        <aside class="selector-pisos" aria-label="Pisos">
          <h1>Elige un piso</h1>
          <ol>${listaPisos}</ol>
        </aside>
      </div>`, [{ txt: 'Edificio' }]);
  }

  function planoPiso(piso, elegida) {
    const pl = D.plantillas[piso.plantilla];
    const W = 1000;
    const H = Math.round(W / pl.aspecto);
    const pts = (poli) => poli.map(([x, y]) => `${(x * W).toFixed(1)},${(y * H).toFixed(1)}`).join(' ');
    const centro = (poli) => {
      const xs = poli.map((p) => p[0]); const ys = poli.map((p) => p[1]);
      return [((Math.min(...xs) + Math.max(...xs)) / 2) * W, ((Math.min(...ys) + Math.max(...ys)) / 2) * H];
    };
    const fondo = pl.imagen
      ? `<image href="${esc(pl.imagen)}" x="0" y="0" width="${W}" height="${H}"/>`
      : `<g class="esquema">
          <polygon points="${pts(pl.esquema.contorno)}" class="esquema__contorno"/>
          <polygon points="${pts(pl.esquema.pasillo)}" class="esquema__comun"/>
          <polygon points="${pts(pl.esquema.nucleo)}" class="esquema__nucleo"/>
          <text x="${centro(pl.esquema.nucleo)[0]}" y="${centro(pl.esquema.nucleo)[1]}" class="esquema__rotulo">Ascensor · escalera</text>
        </g>`;
    const zonas = unidadesDePiso(piso.id).map((u) => {
      const poli = pl.posiciones[u.posicion].poligono;
      const [cx, cy] = centro(poli);
      const t = tipoPorId[u.tipologia];
      return `<g class="zona zona--${u.estado}${u.id === elegida ? ' zona--elegida' : ''}" data-unidad="${u.id}" tabindex="0" role="button"
                 aria-pressed="${u.id === elegida}" aria-label="Departamento ${u.id}, ${t.nombre}, ${ESTADO[u.estado].txt}">
          <polygon points="${pts(poli)}"/>
          <text x="${cx}" y="${cy - 6}" class="zona__num">${u.id}</text>
          <text x="${cx}" y="${cy + 34}" class="zona__estado">${ESTADO[u.estado].txt}</text>
        </g>`;
    }).join('');
    return `
      <svg class="plano" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="rayado" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" class="patron"/></pattern>
          <pattern id="cruzado" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 0L14 14M14 0L0 14" class="patron"/></pattern>
        </defs>
        ${fondo}
        ${zonas}
      </svg>
      ${pl.imagen ? '' : '<p class="nota">Esquema de posiciones. La planta amoblada renderizada reemplaza este dibujo.</p>'}`;
  }

  function fichaBreve(u) {
    const t = tipoPorId[u.tipologia];
    const ctaVendido = `<a class="boton" href="${url('departamentos/', { tipo: u.tipologia, estado: 'disponible' })}">Ver ${esc(t.nombre)} disponibles</a>`;
    return `
      <div class="ficha-breve">
        <p class="ficha-breve__titulo"><strong>Dpto. ${u.id}</strong> · ${esc(t.nombre)}</p>
        ${chipEstado(u.estado)}
        <dl class="datos">
          <div><dt>Dormitorios</dt><dd>${t.dormitorios}</dd></div>
          <div><dt>Baños</dt><dd>${t.banos}</dd></div>
          <div><dt>Área total</dt><dd>${m2(areaTotal(t))}</dd></div>
          <div><dt>Orientación</dt><dd>${esc(orientacion(u))}</dd></div>
          <div><dt>Precio</dt><dd>${precioTexto(u)}</dd></div>
        </dl>
        <div class="acciones">
          <a class="boton boton--primario" href="${url(`departamento/${u.id}/`)}">Ver departamento</a>
          ${u.estado === 'vendido' ? ctaVendido : ''}
        </div>
      </div>`;
  }

  function vistaPiso(id) {
    const piso = pisoPorId[id];
    if (!piso) return vistaNoEncontrada();
    const orden = D.pisos.indexOf(piso);
    const abajo = D.pisos[orden - 1];
    const arriba = D.pisos[orden + 1];
    const migas = [{ txt: 'Edificio', href: url('edificio/') }, { txt: piso.etiqueta }];
    const cambioPiso = `
      <div class="cambio-piso">
        ${arriba ? `<a class="boton" href="${url(`piso/${arriba.id}/`)}" aria-label="Subir a ${esc(arriba.etiqueta)}">↑ ${esc(arriba.etiqueta)}</a>` : ''}
        ${abajo ? `<a class="boton" href="${url(`piso/${abajo.id}/`)}" aria-label="Bajar a ${esc(abajo.etiqueta)}">↓ ${esc(abajo.etiqueta)}</a>` : ''}
      </div>`;

    if (!piso.plantilla) {
      return marco(`
        <div class="cabecera"><h1>${esc(piso.etiqueta)}</h1>${cambioPiso}</div>
        <p>${esc(piso.uso)}</p>
        ${marcador(`Áreas comunes · ${piso.etiqueta}`, 'Galería o panorama de amenities')}`, migas);
    }

    const q = query();
    const elegida = unidadPorId[q.d]?.piso === id ? q.d : null;
    return marco(`
      <div class="cabecera"><h1>${esc(piso.etiqueta)}</h1>${cambioPiso}</div>
      <div class="piso-vista">
        <section class="piso-vista__plano" aria-label="Planta del ${esc(piso.etiqueta.toLowerCase())}">
          ${planoPiso(piso, elegida)}
          <ul class="leyenda">${Object.keys(ESTADO).map((e) => `<li>${chipEstado(e)}</li>`).join('')}</ul>
        </section>
        <aside class="piso-vista__panel" aria-live="polite">
          ${elegida ? fichaBreve(unidadPorId[elegida]) : '<p class="nota">Toca un departamento en la planta para ver sus datos.</p>'}
          <h2>En este piso</h2>
          <ul class="lista-unidades">
            ${unidadesDePiso(id).map((u) => `<li><a href="${url(`piso/${id}/`, { d: u.id })}" data-elegir="${u.id}"${u.id === elegida ? ' aria-current="true"' : ''}><span>Dpto. ${u.id} · ${esc(tipoPorId[u.tipologia].nombre)}</span>${chipEstado(u.estado)}</a></li>`).join('')}
          </ul>
        </aside>
      </div>`, migas);
  }

  const SECCIONES = [
    { id: 'planta', txt: 'Planta' },
    { id: 'recorrido', txt: 'Recorrido 360°' },
    { id: 'vistas', txt: 'Vista' },
  ];

  function seccionUnidad(u, sec, q) {
    const t = tipoPorId[u.tipologia];
    if (sec === 'recorrido') {
      const escena = t.escenas.find((e) => e.id === q.escena) || t.escenas[0];
      return `
        ${marcador(`Recorrido 360° · ${escena.nombre}`, `${t.nombre} · panorama equirectangular`, 'marcador--panorama')}
        <nav class="escenas" aria-label="Ambientes">
          ${t.escenas.map((e) => `<a class="boton" href="${url(`departamento/${u.id}/`, { seccion: 'recorrido', escena: e.id })}" aria-current="${e.id === escena.id}">${esc(e.nombre)}</a>`).join('')}
        </nav>
        <p class="nota">El recorrido es de la tipología ${esc(t.nombre)}; acabados iguales en todos los pisos.</p>`;
    }
    if (sec === 'vistas') {
      return `
        ${marcador(`Vista desde el piso ${u.piso}`, orientacion(u))}
        <p class="nota">Cada vista se etiquetará como real, proyectada o ilustrativa según cómo se obtuvo.</p>`;
    }
    const modo = q.plano === 'tecnico' ? 'tecnico' : 'amoblada';
    const img = modo === 'tecnico' ? t.planta.plano : t.planta.amoblada;
    return `
      <div class="conmutador" role="group" aria-label="Tipo de planta">
        <a class="boton" href="${url(`departamento/${u.id}/`, { seccion: 'planta' })}" aria-pressed="${modo === 'amoblada'}">Amoblada</a>
        <a class="boton" href="${url(`departamento/${u.id}/`, { seccion: 'planta', plano: 'tecnico' })}" aria-pressed="${modo === 'tecnico'}">Plano técnico</a>
      </div>
      ${img ? `<img src="${esc(img)}" alt="Planta ${modo} del ${esc(t.nombre)}">` : marcador(modo === 'tecnico' ? `Plano técnico · ${t.nombre}` : `Planta amoblada · ${t.nombre}`, 'Vista cenital del mismo modelo que los interiores')}`;
  }

  function vistaUnidad(id) {
    const u = unidadPorId[id];
    if (!u) return vistaNoEncontrada();
    const t = tipoPorId[u.tipologia];
    const piso = pisoPorId[u.piso];
    const q = query();
    const sec = SECCIONES.some((s) => s.id === q.seccion) ? q.seccion : 'planta';
    const consultable = u.estado !== 'vendido';
    return marco(`
      <div class="cabecera">
        <div>
          <h1>Dpto. ${u.id} <span class="tenue">· ${esc(t.nombre)}</span></h1>
          <p>${esc(t.resumen)} · ${esc(piso.etiqueta)} · ${chipEstado(u.estado)}</p>
        </div>
        <a class="boton" href="${url(`piso/${u.piso}/`, { d: u.id })}">Ver en la planta</a>
      </div>
      <div class="unidad">
        <section class="unidad__contenido">
          <nav class="pestanas" aria-label="Contenido del departamento">
            ${SECCIONES.map((s) => `<a href="${url(`departamento/${u.id}/`, { seccion: s.id })}"${s.id === sec ? ' aria-current="page"' : ''}>${s.txt}</a>`).join('')}
          </nav>
          <div class="unidad__seccion">${seccionUnidad(u, sec, q)}</div>
        </section>
        <aside class="unidad__ficha">
          <p class="precio">${precioTexto(u)}</p>
          ${u.estado === 'disponible' && u.precio ? '<p class="nota">Precio de ejemplo.</p>' : ''}
          ${bono(u) ? `<p class="bono"><strong>Bono del Buen Pagador: ${soles(bono(u).monto)}</strong><span class="nota">${esc(D.proyecto.bonoBuenPagador.referencia)}. Sujeto a calificación.</span></p>` : ''}
          <dl class="datos">
            <div><dt>Área techada</dt><dd>${m2(t.areaTechada)}</dd></div>
            ${t.areaLibre ? `<div><dt>Área libre</dt><dd>${m2(t.areaLibre)}</dd></div>` : ''}
            <div><dt>Área total</dt><dd>${m2(areaTotal(t))}</dd></div>
            <div><dt>Dormitorios</dt><dd>${t.dormitorios}</dd></div>
            <div><dt>Baños</dt><dd>${t.banos}</dd></div>
            <div><dt>Piso</dt><dd>${esc(piso.etiqueta.replace('Piso ', ''))}</dd></div>
            <div><dt>Orientación</dt><dd>${esc(orientacion(u))}</dd></div>
          </dl>
          <h2>Ambientes</h2>
          <ul class="ambientes">${t.ambientes.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          <div class="acciones acciones--columna">
            ${consultable
              ? `<button class="boton boton--primario" data-consultar="${u.id}" data-seccion="${sec}">Consultar por este departamento</button>`
              : `<a class="boton boton--primario" href="${url('departamentos/', { tipo: u.tipologia, estado: 'disponible' })}">Ver ${esc(t.nombre)} disponibles</a>`}
            <button class="boton" data-compartir>Copiar enlace</button>
          </div>
          <p class="nota">Áreas de ejemplo hasta tener los planos del proyecto.</p>
        </aside>
      </div>`, [
      { txt: 'Edificio', href: url('edificio/') },
      { txt: piso.etiqueta, href: url(`piso/${u.piso}/`, { d: u.id }) },
      { txt: `Dpto. ${u.id}` },
    ]);
  }

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
          <h2>${esc(t.nombre)} <span class="tenue">· ${esc(t.resumen)} · ${m2(areaTotal(t))}</span></h2>
          <table class="tabla">
            <thead><tr><th scope="col">Dpto.</th><th scope="col">Piso</th><th scope="col">Orientación</th><th scope="col">Estado</th><th scope="col">Precio</th></tr></thead>
            <tbody>
              ${filas.map((u) => `<tr>
                <th scope="row"><a href="${url(`departamento/${u.id}/`)}">${u.id}</a></th>
                <td>${esc(pisoPorId[u.piso].etiqueta.replace('Piso ', ''))}</td>
                <td>${esc(orientacion(u))}</td>
                <td>${chipEstado(u.estado)}</td>
                <td>${precioTexto(u)}${bono(u) ? `<small class="bono-mini">Bono ${soles(bono(u).monto)}</small>` : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </section>`;
    }).join('');
    const disp = res.filter((u) => u.estado === 'disponible').length;
    return marco(`
      <div class="cabecera"><h1>Departamentos</h1></div>
      <form class="filtros" aria-label="Filtros">
        <label>Tipología<select name="tipo"><option value="">Todas</option>${opciones(D.tipologias.map((t) => [t.id, t.nombre]), q.tipo)}</select></label>
        <label>Dormitorios<select name="dorm"><option value="">Todos</option>${opciones(dorms.map((n) => [String(n), String(n)]), q.dorm)}</select></label>
        <label>Estado<select name="estado"><option value="">Todos</option>${opciones(Object.entries(ESTADO).map(([k, v]) => [k, v.txt]), q.estado)}</select></label>
        <label>Desde el piso<select name="desde"><option value="">Cualquiera</option>${opciones(pisosResidenciales.map((p) => [p.id, p.id]), q.desde)}</select></label>
        ${Object.keys(q).length ? `<a class="boton" href="${url('departamentos/')}">Limpiar</a>` : ''}
      </form>
      <p class="resumen">${res.length} departamento${res.length === 1 ? '' : 's'} · ${disp} disponible${disp === 1 ? '' : 's'}</p>
      ${grupos || '<p>Ningún departamento coincide con esos filtros.</p>'}`, [{ txt: 'Departamentos' }]);
  }

  function vistaNoEncontrada() {
    return marco(`<div class="cabecera"><h1>No encontramos esa página</h1></div><p><a href="${url('edificio/')}">Volver al edificio</a></p>`);
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
        <p class="tenue">${esc(t.nombre)} · ${esc(pisoPorId[u.piso].etiqueta)} · ${ESTADO[u.estado].txt}</p>
        <label>Nombre<input name="nombre" autocomplete="name" required></label>
        <label>Celular<input name="celular" type="tel" autocomplete="tel" inputmode="tel" required></label>
        <label>Mensaje<textarea name="mensaje" rows="3">Hola, me interesa el Dpto. ${u.id} (${t.nombre}, piso ${u.piso}). ¿Me envían más información?</textarea></label>
        ${D.proyecto.contacto.modo === 'demo' ? '<p class="nota">Modo demo: esta consulta no se envía a nadie.</p>' : ''}
        <div class="acciones">
          <button class="boton boton--primario" value="enviar">Enviar consulta</button>
          <button class="boton" value="cancelar" formnovalidate>Cancelar</button>
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
          <p>En producción esto llegaría al asesor con el contexto del departamento:</p>
          <pre>${esc(JSON.stringify(resumen, null, 2))}</pre>
          <button class="boton boton--primario">Cerrar</button>
        </form>`;
    });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
  }

  // ── Enrutado ───────────────────────────────────────────────────────────────

  function render({ foco = true } = {}) {
    const partes = location.pathname.slice(BASE.pathname.length).split('/').filter(Boolean);
    let html;
    if (!partes.length) html = vistaPortada();
    else if (partes[0] === 'edificio') html = vistaEdificio();
    else if (partes[0] === 'departamentos') html = vistaCatalogo();
    else if (partes[0] === 'piso' && partes[1]) html = vistaPiso(partes[1]);
    else if (partes[0] === 'departamento' && partes[1]) html = vistaUnidad(partes[1]);
    else html = vistaNoEncontrada();
    app.innerHTML = html;
    actualizarTitulo(partes);
    // Al cambiar de pantalla, el lector de pantalla arranca por el título nuevo.
    const h1 = app.querySelector('h1');
    if (foco && h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }

  function actualizarTitulo(partes) {
    const p = D.proyecto;
    const piso = partes[0] === 'piso' && pisoPorId[partes[1]];
    const u = partes[0] === 'departamento' && unidadPorId[partes[1]];
    const t = u ? `Dpto. ${u.id} · ${tipoPorId[u.tipologia].nombre}` : piso ? piso.etiqueta : partes[0] === 'edificio' ? 'Edificio' : partes[0] === 'departamentos' ? 'Departamentos' : null;
    document.title = t ? `${t} · ${p.nombre}` : `${p.nombre} · ${p.marca}`;
  }

  function navegar(destino, { reemplazar = false } = {}) {
    history[reemplazar ? 'replaceState' : 'pushState'](null, '', destino);
    render();
    window.scrollTo({ top: 0 });
  }

  // Rerender sin mover el scroll ni el foco: para cambios de estado dentro de
  // la misma pantalla (vista, modo, departamento elegido, filtros).
  function refrescar(cambios) {
    fijarQuery(cambios);
    const activo = document.activeElement?.dataset?.unidad;
    render({ foco: false });
    if (activo) app.querySelector(`[data-unidad="${activo}"]`)?.focus();
  }

  const esPropio = (a) => a && a.origin === location.origin && a.pathname.startsWith(BASE.pathname) && !a.target && !a.hasAttribute('download');

  document.addEventListener('click', (e) => {
    const t = e.target;
    const zona = t.closest('[data-unidad]');
    if (zona) {
      refrescar({ d: zona.dataset.unidad });
      // En móvil el panel queda debajo de la planta: se trae a la vista para
      // que el toque tenga respuesta visible.
      const panel = app.querySelector('.ficha-breve');
      if (panel && panel.getBoundingClientRect().top > innerHeight * 0.8) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const elegir = t.closest('[data-elegir]');
    if (elegir) { e.preventDefault(); return refrescar({ d: elegir.dataset.elegir }); }
    const vista = t.closest('[data-vista]');
    if (vista) return refrescar({ vista: D.vistas[Number(vista.dataset.vista)].id });
    const modo = t.closest('[data-modo]');
    if (modo) return refrescar({ modo: modo.dataset.modo === 'dia' ? null : 'noche' });
    const consultar = t.closest('[data-consultar]');
    if (consultar) return abrirConsulta(consultar.dataset.consultar, consultar.dataset.seccion);
    if (t.closest('[data-compartir]')) {
      const btn = t.closest('[data-compartir]');
      navigator.clipboard?.writeText(location.href).then(() => { btn.textContent = 'Enlace copiado'; }, () => { btn.textContent = 'No se pudo copiar'; });
      return;
    }
    const a = t.closest('a[href]');
    if (a && esPropio(a) && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      const mismaRuta = a.pathname === location.pathname;
      navegar(a.pathname + a.search, { reemplazar: mismaRuta });
    }
  });

  document.addEventListener('keydown', (e) => {
    const zona = e.target.closest?.('[data-unidad]');
    if (zona && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); refrescar({ d: zona.dataset.unidad }); }
  });

  document.addEventListener('change', (e) => {
    const form = e.target.closest('.filtros');
    if (!form) return;
    const cambios = {};
    for (const [k, v] of new FormData(form)) cambios[k] = v || null;
    refrescar(cambios);
  });

  window.addEventListener('popstate', () => render());
  render({ foco: false });
})();
