<?php
/**
 * La puerta de ventas.dakagency.net.
 *
 * Sustituye al Basic Auth. Y sustituye de verdad: no es un login pintado en el
 * navegador, que se salta desde la consola en diez segundos. Aqui NADA se sirve
 * sin sesion valida — ni el HTML, ni el JavaScript, ni un solo asset. El build
 * vive en app/, que el .htaccess bloquea por completo; el unico camino hacia
 * esos archivos pasa por esta comprobacion.
 *
 * Por que PHP y no el Node de admin.dakagency.net: porque un servicio en otro
 * subdominio no puede vigilar los archivos que sirve Apache en este. Podria
 * decirle al navegador «no deberias ver esto», que no es lo mismo que impedirlo.
 *
 * Flujo:
 *   sin sesion            -> pantalla de acceso con Google
 *   POST con id_token     -> se verifica CONTRA GOOGLE y se crea la sesion
 *   con sesion            -> se sirve el archivo pedido de app/
 */

require __DIR__ . '/config.php';

session_set_cookie_params([
    'lifetime' => DURACION_SESION,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_name('dak_ventas');
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
    $resultado = verificarConGoogle($_POST['credential']);

    if ($resultado['ok']) {
        // Identidad nueva, sesion nueva: evita que alguien fije el id de sesion
        // antes de que entres y lo reutilice despues.
        session_regenerate_id(true);
        $_SESSION['correo'] = $resultado['correo'];
        $_SESSION['nombre'] = $resultado['nombre'];
        $_SESSION['foto'] = $resultado['foto'];
        $_SESSION['desde'] = time();
        header('Location: /');
        exit;
    }

    $errorAcceso = $resultado['error'];
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

/* ── Con sesion: se sirve el panel ───────────────────────────────────────── */
servirDeLaApp($_SERVER['REQUEST_URI']);


/* ═══ Funciones ═══════════════════════════════════════════════════════════ */

/**
 * Comprueba el token CONTRA GOOGLE, no por nuestra cuenta.
 *
 * Se usa el endpoint tokeninfo en vez de verificar la firma aqui: para el
 * volumen de este panel (unos pocos accesos al dia) una llamada de red al
 * entrar es irrelevante, y evita depender de una libreria de JWT y de mantener
 * al dia las claves publicas de Google.
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
        return ['ok' => false, 'error' => 'El acceso no se emitió para este panel.'];
    }
    if ((int) ($datos['exp'] ?? 0) < time()) {
        return ['ok' => false, 'error' => 'El acceso caducó. Vuelve a intentarlo.'];
    }
    if (($datos['email_verified'] ?? '') !== 'true' && ($datos['email_verified'] ?? false) !== true) {
        return ['ok' => false, 'error' => 'Ese correo no está verificado.'];
    }
    if (($datos['hd'] ?? '') !== DOMINIO_PERMITIDO) {
        return ['ok' => false, 'error' => 'Este panel es solo para cuentas de ' . DOMINIO_PERMITIDO . '.'];
    }

    return [
        'ok' => true,
        'correo' => $datos['email'] ?? '',
        'nombre' => $datos['name'] ?? ($datos['email'] ?? ''),
        'foto' => $datos['picture'] ?? '',
    ];
}

/**
 * Sirve un archivo del build, que vive fuera del alcance de la web.
 *
 * Lo que no existe se resuelve como index.html, porque las rutas del panel
 * (/inicio, /prospectos) no son archivos.
 */
function servirDeLaApp(string $uri): void
{
    $base = __DIR__ . '/app';
    $ruta = parse_url($uri, PHP_URL_PATH) ?? '/';
    $destino = realpath($base . '/' . ltrim($ruta, '/'));

    // Sin esta comprobacion, un ../../ se saldria de app/ y serviria cualquier
    // cosa del servidor a quien ya tenga sesion.
    $dentroDeApp = $destino !== false
        && is_file($destino)
        && str_starts_with($destino, realpath($base) . DIRECTORY_SEPARATOR);

    if (!$dentroDeApp) {
        $destino = $base . '/index.html';
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
        'txt' => 'text/plain; charset=utf-8',
    ];
    $extension = strtolower(pathinfo($destino, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($tipos[$extension] ?? 'application/octet-stream'));

    // El HTML nunca se cachea: es quien arrastra el hash de los assets. Los
    // assets llevan hash en el nombre, asi que se cachean fuerte — y `private`
    // porque son de una sola persona autenticada.
    if ($extension === 'html') {
        header('Cache-Control: no-store, must-revalidate');
    } else {
        header('Cache-Control: private, max-age=31536000, immutable');
    }
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');

    readfile($destino);
}
