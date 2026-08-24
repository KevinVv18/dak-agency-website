<?php
/**
 * Configuracion de la puerta de acceso.
 *
 * El CLIENT_ID de Google NO es un secreto: viaja en el HTML de cualquier sitio
 * que use Google Sign-In, por diseño. Lo que protege no es que sea privado sino
 * que Google solo emite tokens para el con los origenes autorizados en la
 * consola. Por eso puede vivir en el repo.
 *
 * Lo que si es secreto es la sesion, y esa la genera PHP.
 */

// Se crea en console.cloud.google.com > Credenciales > ID de cliente de OAuth.
// Origen autorizado: https://ventas.dakagency.net
define('GOOGLE_CLIENT_ID', getenv('DAK_GOOGLE_CLIENT_ID') ?: 'PENDIENTE.apps.googleusercontent.com');

// Solo entra quien tenga correo de este dominio. Google lo certifica en el
// campo `hd` del token, que solo rellena para cuentas de Workspace — no se
// puede falsificar poniendo un alias.
define('DOMINIO_PERMITIDO', 'dakagency.net');

// Cuanto dura la sesion sin actividad. Ocho horas: una jornada.
define('DURACION_SESION', 8 * 60 * 60);
