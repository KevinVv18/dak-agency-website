<?php
/**
 * La puerta de bitacora.dakagency.net.
 *
 * Es la UNICA entrada del sitio. El .htaccess reescribe absolutamente todo aqui,
 * y el build vive en app/, que ese mismo .htaccess bloquea por completo. Por eso
 * no hay ningun camino —ni al HTML, ni al JavaScript, ni a la API, ni a un solo
 * asset— que no pase por la comprobacion de sesion de este archivo.
 *
 * No es un login pintado en el navegador. Es el servidor negandose a leer los
 * archivos del disco.
 *
 * Por que PHP y no un servicio Node aparte: porque un servicio en otro
 * subdominio no puede vigilar los archivos que sirve Apache en este. Podria
 * decirle al navegador «no deberias ver esto», que no es lo mismo que impedirlo.
 *
 * Flujo:
 *   sin sesion            -> pantalla de acceso con Google
 *   POST con credential   -> se verifica CONTRA GOOGLE y se crea la sesion
 *   con sesion + /api/... -> se despacha al router de la API
 *   con sesion + resto    -> se sirve el archivo pedido de app/
 */

require __DIR__ . '/config.php';
require __DIR__ . '/lib/entorno.php';

session_set_cookie_params([
    'lifetime' => INACTIVIDAD_MAXIMA,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_name('dak_bitacora');
session_start();

$ruta = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$esApi = str_starts_with($ruta, '/api/') || $ruta === '/api';

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
        $_SESSION['foto']   = $resultado['foto'];
        $_SESSION['desde']  = time();
        $_SESSION['visto']  = time();
        // Token de escritura. La cookie SameSite=Lax ya impide que un POST
        // desde otro sitio la lleve; esto es la segunda cerradura.
        $_SESSION['token']  = bin2hex(random_bytes(16));
        header('Location: /');
        exit;
    }

    $errorAcceso = $resultado['error'];
}

/* ── Caducidad ───────────────────────────────────────────────────────────────
 *
 * Dos relojes: inactividad (deslizante, se refresca en cada peticion) y un tope
 * absoluto desde el alta. El deslizante es lo que evita que Fabian tenga que
 * re-loguearse cada mañana en el telefono —friccion diaria en la pantalla que
 * tiene que tardar veinte segundos—; el absoluto es lo que evita que una sesion
 * viva para siempre.
 */
$identificado = !empty($_SESSION['correo']);
if ($identificado) {
    $inactivo = time() - ($_SESSION['visto'] ?? 0);
    $antiguo  = time() - ($_SESSION['desde'] ?? 0);

    if ($inactivo > INACTIVIDAD_MAXIMA || $antiguo > DURACION_MAXIMA) {
        $_SESSION = [];
        session_destroy();
        session_start();
        $identificado = false;
    } else {
        $_SESSION['visto'] = time();
    }
}

/* ── Sin sesion ──────────────────────────────────────────────────────────── */
if (!$identificado) {
    // La API contesta JSON, no la pantalla de acceso: si el token caduca con la
    // aplicacion abierta, el frontend recibe un 401 que sabe interpretar en vez
    // de un pedazo de HTML donde esperaba datos.
    if ($esApi) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['error' => 'Sesión caducada.', 'motivo' => 'sin_sesion'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    require __DIR__ . '/acceso.php';
    exit;
}

/* ── Con sesion ──────────────────────────────────────────────────────────── */
if ($esApi) {
    require __DIR__ . '/lib/api.php';
    $sub = substr($ruta, 4);          // quita el prefijo «/api»
    if ($sub === '' || $sub === false) {
        $sub = '/';
    }
    try {
        despacharApi($_SERVER['REQUEST_METHOD'], $sub, $_SESSION);
    } catch (ErrorDeTransicion $e) {
        // 422: la peticion se entendio pero pedia algo que la maquina de
        // estados no permite. El mensaje ya viene en castellano y se enseña.
        fallar($e->getMessage(), 422);
    } catch (Throwable $e) {
        error_log('[bitacora] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
        fallar('Algo se rompió por dentro. Ya quedó anotado en el log.', 500);
    }
}

servirDeLaApp($ruta);


/* ═══ Funciones ═══════════════════════════════════════════════════════════ */

/**
 * Comprueba el token CONTRA GOOGLE, no por nuestra cuenta.
 *
 * Se usa el endpoint tokeninfo en vez de verificar la firma aqui: para el
 * volumen de esta aplicacion (dos personas, unos pocos accesos al dia) una
 * llamada de red al entrar es irrelevante, y evita depender de una libreria de
 * JWT y de mantener al dia las claves publicas de Google.
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
        return ['ok' => false, 'error' => 'El acceso no se emitió para esta aplicación.'];
    }
    if ((int) ($datos['exp'] ?? 0) < time()) {
        return ['ok' => false, 'error' => 'El acceso caducó. Vuelve a intentarlo.'];
    }
    if (($datos['email_verified'] ?? '') !== 'true' && ($datos['email_verified'] ?? false) !== true) {
        return ['ok' => false, 'error' => 'Ese correo no está verificado.'];
    }
    if (($datos['hd'] ?? '') !== DOMINIO_PERMITIDO) {
        return ['ok' => false, 'error' => 'Bitácora es solo para cuentas de ' . DOMINIO_PERMITIDO . '.'];
    }

    return [
        'ok'     => true,
        'correo' => $datos['email'] ?? '',
        'nombre' => $datos['name'] ?? ($datos['email'] ?? ''),
        'foto'   => $datos['picture'] ?? '',
    ];
}

/**
 * Sirve un archivo del build, que vive fuera del alcance de la web.
 *
 * Lo que no existe se resuelve como index.html, porque las rutas de la
 * aplicacion (/hoy, /cierre) no son archivos.
 */
function servirDeLaApp(string $ruta): never
{
    $base = __DIR__ . '/app';
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
        'webmanifest' => 'application/manifest+json; charset=utf-8',
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
    if ($extension === 'html' || $extension === 'webmanifest') {
        header('Cache-Control: no-store, must-revalidate');
    } else {
        header('Cache-Control: private, max-age=31536000, immutable');
    }
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');

    readfile($destino);
    exit;
}
