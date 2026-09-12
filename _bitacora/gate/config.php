<?php
/**
 * Configuracion de la puerta de bitacora.dakagency.net.
 *
 * El CLIENT_ID de Google NO es un secreto: viaja en el HTML de cualquier sitio
 * que use Google Sign-In, por diseño. Lo que protege no es que sea privado sino
 * que Google solo emite tokens para el desde los origenes autorizados en la
 * consola. Por eso puede vivir en el repo.
 *
 * Lo que si es secreto —credenciales de MySQL, clave de IA— no esta aqui: vive
 * en un archivo fuera de todo docroot. Ver lib/entorno.php.
 */

// Se crea en console.cloud.google.com > Credenciales > ID de cliente de OAuth.
// Origen autorizado: https://bitacora.dakagency.net
define('GOOGLE_CLIENT_ID', getenv('DAK_GOOGLE_CLIENT_ID') ?: 'PENDIENTE.apps.googleusercontent.com');

// Solo entra quien tenga correo de este dominio. Google lo certifica en el
// campo `hd` del token, que solo rellena para cuentas de Workspace — no se
// puede falsificar poniendo un alias.
define('DOMINIO_PERMITIDO', 'dakagency.net');

// A donde manda Google el token al identificarse.
//
// Absoluta y escrita a mano, no derivada de $_SERVER['HTTP_HOST']: ese valor lo
// controla quien hace la peticion, y aqui es donde acaba una credencial. Ademas
// Google avisa en consola de que una `login_uri` relativa —lo que habia antes—
// «puede considerarse invalida en el futuro».
define('URL_ACCESO', 'https://bitacora.dakagency.net/');

/**
 * Caducidad de sesion.
 *
 * Aqui el criterio es distinto al del panel de ventas, y a proposito.
 *
 * Ventas dura 8 horas porque se abre desde un escritorio y contiene telefonos de
 * prospectos. Esto se abre desde el telefono de Fabian todas las mañanas, y lo
 * que contiene son notas de tareas internas. Obligarle a re-loguear cada dia es
 * friccion diaria en la unica pantalla que tiene que tardar veinte segundos: es
 * la clase de detalle que hace que una herramienta interna se deje de usar en
 * dos semanas.
 *
 * Asi que: 30 dias de INACTIVIDAD (se refresca en cada peticion) con un tope
 * absoluto de 90 dias, tras el cual hay que volver a identificarse si o si.
 */
define('INACTIVIDAD_MAXIMA', 30 * 24 * 60 * 60);
define('DURACION_MAXIMA',    90 * 24 * 60 * 60);

// Zona horaria del negocio. Una sola, y no se discute — ver lib/entorno.php.
define('ZONA_HORARIA', 'America/Lima');

// Donde viven los secretos: fuera de public_html, chmod 600.
define('RUTA_SECRETOS', '/home/u567580447/secretos/bitacora.env');
