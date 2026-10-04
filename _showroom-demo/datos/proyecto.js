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
    'Edificio residencial de 10 pisos con departamentos de 2 y 3 dormitorios y dos penthouses con terraza.',
  moneda: 'PEN',
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
  creditos: [],
};
