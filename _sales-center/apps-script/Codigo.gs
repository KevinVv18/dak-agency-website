/**
 * DAK Sales Control Center — puente de escritura hacia DAK LEADS MASTER.
 *
 * Esto es TODO lo que el panel necesita para dejar de ser de solo lectura:
 * un endpoint que cambia UNA celda de UNA fila. Nada mas. El panel sigue sin
 * ser la fuente de verdad; solo evita que haya que abrir la hoja para marcar
 * algo que ya se decidio.
 *
 * ── Seguridad ──────────────────────────────────────────────────────────────
 * Se publica como "cualquier persona con el enlace", porque un sitio estatico
 * no puede autenticarse con Google. Lo que impide que un desconocido escriba
 * son dos cosas:
 *
 *   1. El TOKEN de abajo, que el panel manda en cada peticion.
 *   2. La LISTA BLANCA de (hoja, columna). Aunque alguien consiguiera el token,
 *      solo podria tocar esas dos columnas. No puede escribir en el telefono de
 *      un prospecto, ni borrar una fila, ni leerse la hoja entera.
 *
 * Riesgo que queda, dicho claro: el token viaja dentro del JavaScript del
 * panel, y el panel esta detras de Basic Auth. Quien tenga la contraseña del
 * panel puede sacar el token y marcar aprobaciones. Para una herramienta
 * interna de tres personas es razonable; si algun dia entra mas gente al panel,
 * esto hay que mover a un backend de verdad.
 *
 * ── Que hace y que NO hace ─────────────────────────────────────────────────
 * Hace: poner APPROVED/REJECTED en Human Review, y SENT en Send Status con su
 * fecha. Devuelve el valor anterior, para que quede rastro de que cambio.
 *
 * No hace: crear filas, borrar, leer la hoja completa, ni tocar ninguna columna
 * que no este en la lista blanca.
 */

// ⚠️ CAMBIA ESTO por una cadena larga tuya antes de publicar.
//    Sirve de contraseña entre el panel y la hoja.
const TOKEN = 'PEGA_AQUI_UN_TOKEN_LARGO';

// La lista blanca. Fuera de aqui, el script no escribe nada.
// clave = como lo pide el panel · valor = donde escribe de verdad.
const PERMITIDO = {
  aprobar: {
    hoja: 'DAK OUTREACH QUEUE',
    columna: 'Human Review',
    valores: ['APPROVED', 'REJECTED', 'PENDING'],
  },
  enviar: {
    hoja: 'DAK DAILY OUTREACH',
    columna: 'Send Status',
    valores: ['SENT', 'NOT SENT'],
    // Al marcar SENT tambien se sella la fecha, que es la columna de al lado.
    tambienFecha: 'Sent At',
    sellarCuando: 'SENT',
  },
  // ── El carril manual, sobre la propia fila de Leads ──────────────────────
  //
  // Twin puede tardar, y mientras tanto un prospecto investigado no se podia
  // mover: la etapa se deduce de en que hoja vive la fila, y crearle una fila en
  // la QUEUE seria falsificar la salida del Outreach Strategist.
  //
  // La salida es no tocar la QUEUE en absoluto. Un mensaje escrito a mano vive
  // en la propia fila de Leads, en columnas que solo escribe el panel, y el
  // embudo se lee igual. Asi las dos vias conviven sin pisarse y siempre se sabe
  // quien escribio que: si esta en `Panel Opener`, lo escribio una persona.
  //
  // `Panel Status` lleva el ciclo entero —pedido, redactado, aprobado, enviado,
  // descartado— en una sola columna, en vez de una columna por gesto.
  estado: {
    hoja: 'Leads',
    columna: 'Panel Status',
    valores: ['', 'REQUESTED', 'DRAFTED', 'APPROVED', 'REJECTED', 'SENT'],
    tambienFecha: 'Panel Status At',
    sellarCuando: '*',
  },
  redactar: {
    hoja: 'Leads',
    columna: 'Panel Opener',
    libre: true,
    maximo: 2000,
  },
  // Editar el texto del mensaje desde el panel.
  //
  // Esta accion no lleva lista de valores permitidos —es texto libre, no puede
  // llevarla— asi que se acota de otra forma: `libre: true` mas un tope de
  // longitud. Sigue sin poder tocar ninguna columna que no sea esta.
  editar: {
    hoja: 'DAK OUTREACH QUEUE',
    columna: 'Spanish WhatsApp/DM Opener',
    libre: true,
    maximo: 2000,
  },
};

// La columna por la que se busca la fila. Es la que comparten las dos pestañas.
const COLUMNA_CLAVE = 'Business Name';

// Las pestañas que el panel puede LEER. Igual que la lista blanca de escritura:
// aunque alguien tuviera el token, no puede pedir una pestaña que no este aqui.
const LEGIBLES = [
  'Leads',
  'DAK OUTREACH QUEUE',
  'DAK DAILY OUTREACH',
  'CAMARA REACTIVATION LOG',
];

function doPost(e) {
  try {
    const peticion = JSON.parse(e.postData.contents);

    if (peticion.token !== TOKEN) {
      return responder(403, { ok: false, error: 'Token invalido.' });
    }

    // ── Lectura en vivo ──────────────────────────────────────────────────────
    // Devuelve las filas EN CRUDO, sin interpretar. Es deliberado: toda la
    // normalizacion vive en el panel (src/lib/construir.js), asi que cambiar
    // como se leen los datos no obliga a volver a publicar este script. Y
    // publicar este script es la parte cara: hay que hacerla a mano.
    if (peticion.accion === 'leer') {
      const libro = SpreadsheetApp.getActiveSpreadsheet();
      const salida = {};
      // Nombres propios y `let`, no `var`. La primera version usaba
      // `var hoja` aqui dentro, y como `var` es de ambito de FUNCION y no de
      // bloque, chocaba con el `const hoja` que hay mas abajo en este mismo
      // doPost: el script entero dejaba de compilar.
      for (const nombrePestana of LEGIBLES) {
        const pestana = libro.getSheetByName(nombrePestana);
        salida[nombrePestana] = pestana ? pestana.getDataRange().getDisplayValues() : [];
      }
      return responder(200, {
        ok: true,
        leidoEn: Utilities.formatDate(new Date(), 'America/Lima', "yyyy-MM-dd'T'HH:mm"),
        pestanas: salida,
      });
    }

    const regla = PERMITIDO[peticion.accion];
    if (!regla) {
      return responder(400, { ok: false, error: 'Accion no permitida: ' + peticion.accion });
    }
    if (regla.libre) {
      // Texto libre, pero acotado: ni vacio ni desmesurado. Guardar un mensaje
      // en blanco por accidente borraria el trabajo del Outreach Strategist.
      if (typeof peticion.valor !== 'string' || peticion.valor.trim().length < 10) {
        return responder(400, { ok: false, error: 'El mensaje es demasiado corto.' });
      }
      if (peticion.valor.length > regla.maximo) {
        return responder(400, { ok: false, error: 'El mensaje supera los ' + regla.maximo + ' caracteres.' });
      }
    } else if (regla.valores.indexOf(peticion.valor) === -1) {
      return responder(400, { ok: false, error: 'Valor no permitido: ' + peticion.valor });
    }

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(regla.hoja);
    if (!hoja) {
      return responder(500, { ok: false, error: 'No existe la pestaña ' + regla.hoja });
    }

    const datos = hoja.getDataRange().getValues();
    const cabecera = datos[0];
    const colClave = cabecera.indexOf(COLUMNA_CLAVE);
    const colDestino = cabecera.indexOf(regla.columna);

    if (colClave === -1 || colDestino === -1) {
      return responder(500, {
        ok: false,
        error: 'Faltan columnas. Revisa que existan "' + COLUMNA_CLAVE + '" y "' + regla.columna + '".',
      });
    }

    // Se busca por nombre exacto. Si un dia hay dos filas con el mismo nombre,
    // se aborta en vez de escribir en la primera que aparezca: escribir en la
    // fila equivocada es peor que no escribir.
    const coincidencias = [];
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][colClave]).trim() === String(peticion.empresa).trim()) {
        coincidencias.push(i);
      }
    }
    if (coincidencias.length === 0) {
      return responder(404, { ok: false, error: 'No se encontro: ' + peticion.empresa });
    }
    if (coincidencias.length > 1) {
      return responder(409, {
        ok: false,
        error: 'Hay ' + coincidencias.length + ' filas con ese nombre. No se escribe nada.',
      });
    }

    const fila = coincidencias[0];
    const anterior = datos[fila][colDestino];
    hoja.getRange(fila + 1, colDestino + 1).setValue(peticion.valor);

    let fechaSellada = null;
    const tocaSellar = regla.sellarCuando === '*'
      ? Boolean(peticion.valor)
      : peticion.valor === regla.sellarCuando;
    if (regla.tambienFecha && tocaSellar) {
      const colFecha = cabecera.indexOf(regla.tambienFecha);
      if (colFecha !== -1) {
        fechaSellada = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm');
        hoja.getRange(fila + 1, colFecha + 1).setValue(fechaSellada);
      }
    }

    return responder(200, {
      ok: true,
      empresa: peticion.empresa,
      columna: regla.columna,
      anterior: anterior,
      nuevo: peticion.valor,
      fecha: fechaSellada,
    });
  } catch (error) {
    return responder(500, { ok: false, error: String(error) });
  }
}

/** Prueba de vida: abre la URL /exec en el navegador y deberia decir que vive. */
function doGet() {
  return responder(200, { ok: true, mensaje: 'Puente de escritura de DAK activo.' });
}

function responder(_codigo, cuerpo) {
  return ContentService
    .createTextOutput(JSON.stringify(cuerpo))
    .setMimeType(ContentService.MimeType.JSON);
}
