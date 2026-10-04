// Identidad del proyecto. NORVIA es solo el nombre de la marca de demo: ni su
// estilo visual ni sus imágenes vienen del demo inmobiliario.
//
// El nombre del edificio es de trabajo. El faique es el árbol nativo de
// Lambayeque: un guiño local para que el comprador de Chiclayo lo sienta suyo.

export default {
  id: 'los-faiques',
  marca: 'NORVIA',
  nombre: 'Residencial Los Faiques',
  ciudad: 'Chiclayo',
  zona: 'Santa Victoria',
  zonaReferencial: true,
  lema: 'Departamentos en preventa',
  descripcion:
    'Edificio boutique de 6 pisos con departamentos de 2 y 3 dormitorios, cocheras y terraza en azotea.',
  moneda: 'PEN',
  // Acento de marca de la demo: cobre, por la tierra del bosque seco.
  // Texto blanco sobre el acento: contraste 5,1 (AA).
  estilo: { acento: '#a9581f', acentoTinta: '#ffffff' },
  // Portada: timelapse de cámara fija del día a la noche (edificio.py --vista
  // portada --timelapse), con pase de realismo. Se funden en bucle.
  timelapse: ['dia', 'atardecer', 'crepusculo', 'noche'].map((e) => ({
    id: e,
    imagen: `assets/portada/${e}-v1.webp`,
    imagenMovil: `assets/portada/${e}-movil-v1.webp`,
  })),
  modoDemo: true,
  avisoDemo: 'Proyecto conceptual · inventario, precios y vistas de ejemplo',
  // Bono del Buen Pagador (Crédito Mivivienda), tramos vigentes desde junio
  // de 2026 según RPP. Es el gancho que más vende en Chiclayo. El tramo entre
  // S/ 99.600 y S/ 149.200 no está confirmado: sin tramo, la ficha no muestra
  // bono en vez de inventarlo. Verificar con Fondo Mivivienda antes de publicar.
  bonoBuenPagador: {
    referencia: 'Referencial, tramos vigentes desde junio de 2026',
    tramos: [
      { desde: 0, hasta: 99600, monto: 27800 },
      { desde: 149200, hasta: 248300, monto: 21200 },
      { desde: 248300, hasta: 367600, monto: 7900 },
    ],
  },
  contacto: {
    // 'demo' no envía nada: muestra lo que se habría enviado.
    modo: 'demo',
  },
  // Modelos de terceros con licencia CC BY 4.0 (la atribución es obligatoria);
  // texturas y cielos de Poly Haven, CC0.
  creditos: [
    'Modelos 3D (CC BY 4.0): 2020 Toyota GR Yaris, supercarmodels',
    'Generic passenger car pack, comrade1280',
    'MotoTaxi, aramburustephano',
    'Realistic Palm Tree, NextSpring',
    'Date Palm, evolveduk',
    'Chinese Banyan (Ficus microcarpa), Valery.Li',
    'Personas: Renderpeople',
    'Texturas y cielos: Poly Haven (CC0)',
  ],
};
