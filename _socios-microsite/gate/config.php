<?php
/**
 * Configuracion de la puerta de socios.dakagency.net.
 *
 * Mismo mecanismo que la puerta del centro de ventas: sesion de Google
 * restringida al dominio Workspace. Lo que cambia es el color y que aqui
 * detras no hay datos de prospectos sino nuestros propios honorarios,
 * margenes y posicion de repliegue en negociacion.
 *
 * El CLIENT_ID de Google NO es un secreto: viaja en el HTML de cualquier sitio
 * que use Google Sign-In, por diseño. Lo que protege no es que sea privado sino
 * que Google solo emite tokens para el con los origenes autorizados en la
 * consola. Por eso puede vivir en el repo — pero como todavia no existe, se
 * lee de fuera para poder ponerlo sin tocar el repo ni volver a desplegar.
 *
 * Orden de busqueda:
 *   1. variable de entorno DAK_GOOGLE_CLIENT_ID
 *   2. /home/u567580447/dak-secretos/google-client-id.txt  (fuera del docroot)
 *   3. sin configurar -> la puerta se queda cerrada y lo dice
 */

function leerClientId(): string
{
    $delEntorno = getenv('DAK_GOOGLE_CLIENT_ID');
    if (is_string($delEntorno) && trim($delEntorno) !== '') {
        return trim($delEntorno);
    }

    $archivo = '/home/u567580447/dak-secretos/google-client-id.txt';
    if (is_readable($archivo)) {
        $contenido = trim((string) file_get_contents($archivo));
        if ($contenido !== '') {
            return $contenido;
        }
    }

    return '';
}

define('GOOGLE_CLIENT_ID', leerClientId());

// Sin ID no hay verificacion posible. La puerta falla CERRADA: se pinta la
// pantalla explicando que falta, y ningun POST puede crear sesion.
define('PUERTA_CONFIGURADA', GOOGLE_CLIENT_ID !== '');

// Solo entra quien tenga correo de este dominio. Google lo certifica en el
// campo `hd` del token, que solo rellena para cuentas de Workspace — no se
// puede falsificar poniendo un alias.
define('DOMINIO_PERMITIDO', 'dakagency.net');

// Cuanto dura la sesion sin actividad. Ocho horas: una jornada.
define('DURACION_SESION', 8 * 60 * 60);
