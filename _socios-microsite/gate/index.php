<?php
/**
 * La puerta de socios.dakagency.net.
 *
 * Copia del mecanismo que ya se escribio para ventas.dakagency.net, con dos
 * diferencias: la pantalla va en la paleta a dos tintas de estos documentos, y
 * la puerta FALLA CERRADA si todavia no hay CLIENT_ID configurado.
 *
 * No es un login pintado en el navegador, que se salta desde la consola en diez
 * segundos. Aqui NADA se sirve sin sesion valida — ni el HTML, ni las fuentes
 * incrustadas, ni un solo asset. Los documentos viven en app/, que el .htaccess
 * bloquea por completo; el unico camino hacia esos archivos pasa por esta
 * comprobacion.
 *
 * Flujo:
 *   sin sesion            -> pantalla de acceso con Google
 *   POST con credential   -> se verifica CONTRA GOOGLE y se crea la sesion
 *   con sesion            -> se sirve el documento pedido de app/
 */

require __DIR__ . '/config.php';

session_set_cookie_params([
    'lifetime' => DURACION_SESION,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_name('dak_socios');
session_start();

/* ── Cerrar sesion ───────────────────────────────────────────────────────── */
if (isset($_GET['salir'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: /');
    exit;
}

/* ── Alta de sesion ──────────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['credential'])) {
    if (!PUERTA_CONFIGURADA) {
        // Sin CLIENT_ID no se puede comprobar el `aud` del token, asi que
        // cualquier verificacion seria teatro. Se rechaza y punto.
        $errorAcceso = 'La puerta todavia no tiene identificador de Google configurado.';
    } else {
        $resultado = verificarConGoogle($_POST['credential']);

        if ($resultado['ok']) {
            // Identidad nueva, sesion nueva: evita que alguien fije el id de
            // sesion antes de que entres y lo reutilice despues.
            session_regenerate_id(true);
            $_SESSION['correo'] = $resultado['correo'];
            $_SESSION['nombre'] = $resultado['nombre'];
            $_SESSION['desde'] = time();
            header('Location: /');
            exit;
        }

        $errorAcceso = $resultado['error'];
    }
}

/* ── Caducidad ───────────────────────────────────────────────────────────── */
if (isset($_SESSION['desde']) && time() - $_SESSION['desde'] > DURACION_SESION) {
    $_SESSION = [];
    session_destroy();
    session_start();
}

$identificado = !empty($_SESSION['correo']);

/* ── Sin sesion: la pantalla de acceso ───────────────────────────────────── */
if (!$identificado) {
    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    require __DIR__ . '/acceso.php';
    exit;
}

/* ── Con sesion: se sirve el documento ───────────────────────────────────── */
servirDeLaApp($_SERVER['REQUEST_URI']);


/* ═══ Funciones ═══════════════════════════════════════════════════════════ */

/**
 * Comprueba el token CONTRA GOOGLE, no por nuestra cuenta.
 *
 * Se comprueban cuatro cosas, y las cuatro hacen falta:
 *   aud  — que el token se emitiera para NUESTRA aplicacion y no para otra
 *   exp  — que no haya caducado
 *   hd   — que sea una cuenta del dominio (Google solo rellena esto en
 *          Workspace, asi que no se puede falsificar con un alias)
 *   email_verified
 */
function verificarConGoogle(string $token): array
{
    $contexto = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
    $crudo = @file_get_contents(
        'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token),
        false,
        $contexto
    );

    if ($crudo === false) {
        return ['ok' => false, 'error' => 'No se pudo contactar con Google. Reintenta.'];
    }

    $datos = json_decode($crudo, true);
    if (!is_array($datos) || isset($datos['error'])) {
        return ['ok' => false, 'error' => 'Google no reconoció el acceso.'];
    }
    if (($datos['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
        return ['ok' => false, 'error' => 'El acceso no se emitió para esta puerta.'];
    }
    if ((int) ($datos['exp'] ?? 0) < time()) {
        return ['ok' => false, 'error' => 'El acceso caducó. Vuelve a intentarlo.'];
    }
    if (($datos['email_verified'] ?? '') !== 'true' && ($datos['email_verified'] ?? false) !== true) {
        return ['ok' => false, 'error' => 'Ese correo no está verificado.'];
    }
    if (($datos['hd'] ?? '') !== DOMINIO_PERMITIDO) {
        return ['ok' => false, 'error' => 'Esta puerta es solo para cuentas de ' . DOMINIO_PERMITIDO . '.'];
    }

    return [
        'ok' => true,
        'correo' => $datos['email'] ?? '',
        'nombre' => $datos['name'] ?? ($datos['email'] ?? ''),
    ];
}

/**
 * Sirve un archivo de app/, que vive fuera del alcance de la web.
 *
 * A diferencia del panel de ventas, aqui los documentos son carpetas con su
 * index.html (/jetc/), asi que una ruta que resuelve a directorio se completa
 * con index.html antes de rendirse.
 */
function servirDeLaApp(string $uri): void
{
    $base = realpath(__DIR__ . '/app');
    if ($base === false) {
        http_response_code(500);
        exit('Sin documentos publicados.');
    }

    $ruta = parse_url($uri, PHP_URL_PATH) ?? '/';
    $candidato = $base . '/' . ltrim($ruta, '/');

    if (is_dir($candidato)) {
        $candidato = rtrim($candidato, '/') . '/index.html';
    }
    $destino = realpath($candidato);

    // Sin esta comprobacion, un ../../ se saldria de app/ y serviria cualquier
    // cosa del servidor a quien ya tenga sesion.
    $dentroDeApp = $destino !== false
        && is_file($destino)
        && str_starts_with($destino, $base . DIRECTORY_SEPARATOR);

    if (!$dentroDeApp) {
        $destino = $base . '/index.html';
        if (!is_file($destino)) {
            http_response_code(404);
            exit('No encontrado.');
        }
    }

    $tipos = [
        'html' => 'text/html; charset=utf-8',
        'js' => 'text/javascript; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'svg' => 'image/svg+xml',
        'woff2' => 'font/woff2',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
        'pdf' => 'application/pdf',
        'txt' => 'text/plain; charset=utf-8',
    ];
    $extension = strtolower(pathinfo($destino, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($tipos[$extension] ?? 'application/octet-stream'));

    // Estos documentos se corrigen entre reuniones y son de una sola persona
    // autenticada: nunca se cachean en ningun sitio.
    header('Cache-Control: no-store, private, must-revalidate');
    header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');

    readfile($destino);
}
