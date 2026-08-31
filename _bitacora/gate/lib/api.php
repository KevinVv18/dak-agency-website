<?php
/**
 * El router de la API.
 *
 * Lo invoca index.php DESPUES de haber comprobado la sesion, asi que aqui
 * dentro ya se puede dar por hecho que hay una persona identificada del dominio.
 * Lo que aqui se decide es que puede hacer.
 *
 * Las rutas son una lista fija. No hay despacho dinamico a nombres de archivo:
 * un router que compone una ruta con algo que viene de la URL es un include
 * arbitrario esperando a que alguien lo encuentre.
 */

require_once __DIR__ . '/entorno.php';
require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/respuesta.php';
require_once __DIR__ . '/estados.php';
require_once __DIR__ . '/eventos.php';
require_once __DIR__ . '/plan.php';
require_once __DIR__ . '/jornadas.php';
require_once __DIR__ . '/piezas.php';
require_once __DIR__ . '/panorama.php';

/**
 * Resuelve la fila de `usuarios` a partir del correo de la sesion de Google.
 *
 * Un correo del dominio que no este dado de alta se registra como 'pendiente' y
 * NO pasa. Es deliberado: haber demostrado que tienes un correo de la empresa
 * no es lo mismo que estar autorizado a ver la produccion. El alta la hace un
 * admin a mano, que son dos personas y ocurre una vez.
 */
function usuarioActual(array $sesion): array
{
    $correo = strtolower(trim($sesion['correo'] ?? ''));
    if ($correo === '') {
        fallar('Sesión sin correo.', 401);
    }

    $u = fila('SELECT * FROM usuarios WHERE correo = ?', [$correo]);

    if (!$u) {
        ejecutar(
            'INSERT INTO usuarios (correo, nombre, rol, creado_en, visto_en) VALUES (?, ?, ?, ?, ?)',
            [$correo, $sesion['nombre'] ?: $correo, 'pendiente', ahora(), ahora()]
        );
        $u = fila('SELECT * FROM usuarios WHERE correo = ?', [$correo]);
    } else {
        ejecutar('UPDATE usuarios SET visto_en = ? WHERE id = ?', [ahora(), $u['id']]);
    }

    return $u;
}

function exigirAlta(array $u): void
{
    if ($u['rol'] === 'pendiente' || !$u['activo']) {
        fallar(
            'Tu cuenta todavía no tiene acceso a Bitácora. Pídele a un administrador que te dé de alta.',
            403,
            ['motivo' => 'sin_alta']
        );
    }
}

function exigirAdmin(array $u): void
{
    if ($u['rol'] !== 'admin') {
        fallar('Esta acción es solo para administradores.', 403);
    }
}

/**
 * Comprobacion CSRF de las escrituras.
 *
 * La cookie ya es SameSite=Lax, que por si sola impide que un POST desde otro
 * sitio lleve la sesion. Esto es la segunda cerradura: un token de sesion que
 * el navegador solo puede conocer si de verdad cargo la aplicacion.
 */
function exigirToken(array $sesion): void
{
    $enviado = $_SERVER['HTTP_X_DAK_TOKEN'] ?? '';
    $esperado = $sesion['token'] ?? '';
    if ($esperado === '' || !hash_equals($esperado, $enviado)) {
        fallar('Petición sin token válido. Recarga la página.', 419);
    }
}

/**
 * Punto de entrada. $ruta llega ya sin el prefijo /api.
 */
function despacharApi(string $metodo, string $ruta, array $sesion): never
{
    // Salud no toca la base ni exige alta: sirve para comprobar desde el
    // workflow que la puerta y PHP responden, sin depender de MySQL.
    if ($ruta === '/salud') {
        responder([
            'ok'      => true,
            'app'     => 'bitacora',
            'hora'    => ahora(),
            'zona'    => ZONA_HORARIA,
            'usuario' => $sesion['correo'] ?? null,
        ]);
    }

    $u = usuarioActual($sesion);

    // Sesion responde aunque no haya alta: la interfaz necesita poder enseñar
    // la pantalla de «pídele acceso a un administrador» en vez de un error seco.
    if ($ruta === '/sesion' && $metodo === 'GET') {
        responder([
            'correo'  => $u['correo'],
            'nombre'  => $u['nombre'],
            'rol'     => $u['rol'],
            'activo'  => (bool) $u['activo'],
            'token'   => $sesion['token'] ?? '',
            'hoy'     => hoy(),
        ]);
    }

    exigirAlta($u);

    if ($metodo !== 'GET') {
        exigirToken($sesion);
    }

    $cuerpo = $metodo === 'GET' ? [] : cuerpo();

    // ── El carril de Fabián ────────────────────────────────────────────────

    if ($ruta === '/hoy' && $metodo === 'GET') {
        responder(estadoDeHoy($u));
    }

    if ($ruta === '/jornada/abrir' && $metodo === 'POST') {
        responder(abrirJornada($u, $cuerpo['piezas'] ?? []));
    }

    if ($ruta === '/jornada/cerrar' && $metodo === 'POST') {
        responder(cerrarJornada($u, $cuerpo));
    }

    if ($ruta === '/jornada/reconciliar' && $metodo === 'POST') {
        responder(reconciliar($u, $cuerpo));
    }

    // ── Piezas ─────────────────────────────────────────────────────────────

    if ($ruta === '/piezas' && $metodo === 'POST') {
        responder(crearPieza($u, $cuerpo), 201);
    }

    // El id se saca con una expresion regular anclada, no partiendo la cadena:
    // asi «/piezas/12/../otra» no puede llegar a ninguna parte.
    if (preg_match('#^/piezas/(\d+)$#', $ruta, $m)) {
        $id = (int) $m[1];
        if ($metodo === 'GET') {
            responder(detalleDePieza($id));
        }
        if ($metodo === 'PATCH') {
            exigirAdmin($u);
            responder(editarPieza($u, $id, $cuerpo));
        }
    }

    if (preg_match('#^/piezas/(\d+)/revision$#', $ruta, $m) && $metodo === 'POST') {
        exigirAdmin($u);
        responder(revisarPieza($u, (int) $m[1], $cuerpo));
    }

    // ── El panorama de los jefes ───────────────────────────────────────────

    if ($ruta === '/panorama' && $metodo === 'GET') {
        exigirAdmin($u);
        responder(panorama());
    }

    fallar("Ruta desconocida: {$metodo} {$ruta}", 404);
}
