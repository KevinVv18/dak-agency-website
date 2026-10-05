<?php
/*
 * Portero del showroom (edificios.dakagency.net).
 *
 * Todo pedido pasa por aquí (.htaccess) y solo se entrega con un pase vigente:
 *  - Invitación: ?acceso=<código> abre directo, sin clave, y el navegador queda
 *    autorizado hasta que vence la invitación (7 días). Se puede compartir el
 *    enlace mientras siga vigente.
 *  - Clave de presentación: para reuniones; da un pase de 12 horas.
 * Sin pase: una pantalla «Presentación privada de DAK Agency» con WhatsApp.
 *
 * La configuración (secreto, hash de la clave, invitaciones) y el registro de
 * visitas viven fuera del sitio, en ~/secretos/edificios/ (gestion.php). El
 * repositorio es público: aquí no hay ningún secreto.
 */
declare(strict_types=1);

const RAIZ = __DIR__;
const COOKIE = 'edif_pase';
const HORAS_REUNION = 12;

$privado = dirname(__DIR__, 4) . '/secretos/edificios';
$conf = is_file("$privado/config.php") ? require "$privado/config.php" : null;

function firmar(string $datos, string $secreto): string
{
    return hash_hmac('sha256', $datos, $secreto);
}

function registrar(string $privado, string $evento, string $quien, string $ruta = ''): void
{
    $linea = json_encode([
        'fecha' => date('c'), 'evento' => $evento, 'quien' => $quien, 'ruta' => $ruta,
        'navegador' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 120),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    @file_put_contents("$privado/accesos.log", $linea . "\n", FILE_APPEND | LOCK_EX);
}

function vence_invitacion(array $inv): int
{
    return strtotime($inv['creado'] . ' 23:59:59') + 86400 * (int)($inv['dias'] ?? 7);
}

function pase_vigente(?array $conf): ?string
{
    if (!$conf) return null;
    $partes = explode('|', $_COOKIE[COOKIE] ?? '');
    if (count($partes) !== 3) return null;
    [$quien, $vence, $firma] = $partes;
    if (!hash_equals(firmar("$quien|$vence", $conf['secreto']), $firma)) return null;
    if ((int)$vence < time()) return null;
    // una invitación revocada corta también los pases que ya dio
    if (str_starts_with($quien, 'inv:') && !isset($conf['invitaciones'][substr($quien, 4)])) return null;
    return $quien;
}

function dar_pase(array $conf, string $quien, int $vence): void
{
    $datos = "$quien|$vence";
    setcookie(COOKIE, $datos . '|' . firmar($datos, $conf['secreto']), [
        'expires' => $vence, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax',
    ]);
}

function sin_parametro_acceso(): string
{
    $url = strtok($_SERVER['REQUEST_URI'] ?? '/', '?');
    parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
    unset($q['acceso'], $q['ruta']);
    return $url . ($q ? '?' . http_build_query($q) : '');
}

function pantalla(?array $conf, string $aviso = ''): void
{
    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    $wa = 'https://wa.me/' . ($conf['whatsapp'] ?? '51906765040') . '?text=' .
        rawurlencode('Hola DAK, quisiera acceso al showroom de edificios.');
    $aviso = htmlspecialchars($aviso, ENT_QUOTES);
    echo <<<HTML
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Presentación privada · DAK Agency</title>
<link rel="icon" href="/vendor/flor.svg" type="image/svg+xml">
<style>
@font-face { font-family: 'Archivo'; src: url('/vendor/fonts/archivo-latin-var.woff2') format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; font-display: swap; }
:root { --algarrobo: #23170f; --algarrobo-2: #342318; --algarrobo-3: #4b3524; --arena: #efe7d6; --arena-tenue: #bcae95; --acento: #f2c230; }
* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; display: grid; place-items: center; padding: 24px; background: #150d07; color: var(--arena); font: 16px/1.55 'Archivo', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
main { width: min(420px, 100%); padding: 32px 28px 28px; background: linear-gradient(225deg, transparent 22px, var(--algarrobo) 22.6px); filter: drop-shadow(0 24px 40px rgb(0 0 0 / .45)); }
img { width: 46px; height: 46px; display: block; margin-bottom: 18px; }
h1 { margin: 0; font-size: 1.6rem; line-height: 1.05; font-weight: 800; font-stretch: 125%; text-transform: uppercase; }
p { margin: 12px 0 0; color: var(--arena-tenue); font-size: .94rem; }
.aviso { margin-top: 16px; padding: 10px 12px; background: rgb(240 154 110 / .14); color: #f09a6e; font-size: .88rem; }
a.boton, button { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 48px; margin-top: 20px; border: 0; border-radius: 2px; background: linear-gradient(225deg, transparent 10px, var(--acento) 10.6px); color: var(--algarrobo); font: 700 .8rem 'Archivo', system-ui, sans-serif; font-stretch: 112%; letter-spacing: .08em; text-transform: uppercase; text-decoration: none; cursor: pointer; }
form { margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--algarrobo-3); }
label { display: block; font-size: .68rem; font-weight: 700; font-stretch: 112%; letter-spacing: .1em; text-transform: uppercase; color: var(--arena-tenue); }
input { width: 100%; margin-top: 8px; padding: 12px 14px; border: 1px solid var(--algarrobo-3); border-radius: 2px; background: #1a110b; color: var(--arena); font: inherit; caret-color: var(--acento); }
input:focus { outline: 2px solid var(--acento); border-color: transparent; }
form button { background: linear-gradient(225deg, transparent 10px, var(--algarrobo-3) 10.6px); color: var(--arena); margin-top: 12px; }
:focus-visible { outline: 3px solid var(--arena); outline-offset: 3px; }
small { display: block; margin-top: 22px; color: var(--arena-tenue); font-size: .72rem; opacity: .8; }
</style>
</head>
<body>
<main>
  <img src="/vendor/flor.svg" alt="">
  <h1>Presentación privada</h1>
  <p>Este showroom de edificios es una demo de DAK Agency. El acceso es por invitación.</p>
  {$aviso}
  <a class="boton" href="{$wa}" rel="noopener">Pedir acceso por WhatsApp</a>
  <form method="post">
    <label for="clave">Clave de presentación</label>
    <input id="clave" name="clave" type="password" autocomplete="current-password" required>
    <button type="submit">Entrar</button>
  </form>
  <small>© DAK Agency · Chiclayo, Perú</small>
</main>
</body>
</html>
HTML;
    exit;
}

function servir(string $privado, string $quien): void
{
    $ruta = ltrim(rawurldecode(strtok($_GET['ruta'] ?? '', '?')), '/');
    $real = realpath(RAIZ . '/' . $ruta);
    // nada fuera del sitio, nada oculto, nada ejecutable
    if ($real === false || !str_starts_with($real, RAIZ) || preg_match('#(^|/)\.|\.php$#', $ruta)) {
        http_response_code(404);
        exit('No encontrado');
    }
    if (is_dir($real)) {
        if ($ruta !== '' && !str_ends_with($ruta, '/')) {
            header('Location: /' . $ruta . '/' . (($_SERVER['QUERY_STRING'] ?? '') ? '?' . preg_replace('/(^|&)ruta=[^&]*/', '', $_SERVER['QUERY_STRING']) : ''), true, 301);
            exit;
        }
        $real .= '/index.html';
        if (!is_file($real)) { http_response_code(404); exit('No encontrado'); }
    }
    $tipos = [
        'html' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'js' => 'application/javascript; charset=utf-8',
        'json' => 'application/json', 'webp' => 'image/webp', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
        'svg' => 'image/svg+xml', 'woff2' => 'font/woff2', 'glb' => 'model/gltf-binary', 'txt' => 'text/plain; charset=utf-8',
    ];
    $ext = strtolower(pathinfo($real, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($tipos[$ext] ?? 'application/octet-stream'));
    header('X-Robots-Tag: noindex, nofollow');
    if ($ext === 'html') {
        header('Cache-Control: no-store');
        registrar($privado, 'visita', $quien, '/' . $ruta);
    } else {
        // las imágenes cambian de nombre al cambiar (-vN); CSS, JS y datos llevan ?v=<firma>
        header('Cache-Control: private, max-age=31536000, immutable');
    }
    header('Content-Length: ' . filesize($real));
    readfile($real);
    exit;
}

// ── flujo ──────────────────────────────────────────────────────────────────
if (!$conf) pantalla(null, 'El acceso todavía no está configurado.');

// invitación por enlace
if (isset($_GET['acceso'])) {
    $codigo = preg_replace('/[^a-z0-9-]/', '', strtolower((string)$_GET['acceso']));
    $inv = $conf['invitaciones'][$codigo] ?? null;
    if ($inv && vence_invitacion($inv) > time()) {
        dar_pase($conf, "inv:$codigo", vence_invitacion($inv));
        registrar($privado, 'entrada', "inv:$codigo");
        header('Location: ' . sin_parametro_acceso(), true, 302);
        exit;
    }
    registrar($privado, $inv ? 'vencida' : 'desconocida', "inv:$codigo");
    pantalla($conf, $inv ? 'Tu enlace de acceso venció. Escríbenos y te enviamos uno nuevo al momento.' : 'Ese enlace no es válido.');
}

// clave de presentación
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (password_verify((string)($_POST['clave'] ?? ''), $conf['clave_hash'] ?? '')) {
        dar_pase($conf, 'clave', time() + 3600 * HORAS_REUNION);
        registrar($privado, 'entrada', 'clave');
        header('Location: ' . sin_parametro_acceso(), true, 303);
        exit;
    }
    registrar($privado, 'clave-errada', '-');
    usleep(600000);
    pantalla($conf, 'Clave incorrecta.');
}

$quien = pase_vigente($conf);
if ($quien === null) {
    $ruta = (string)($_GET['ruta'] ?? '');
    $esPagina = $ruta === '' || str_ends_with($ruta, '/') || str_ends_with($ruta, '.html');
    if (!$esPagina) { http_response_code(403); exit('Acceso restringido'); }
    pantalla($conf, isset($_COOKIE[COOKIE]) ? 'Tu acceso venció. Escríbenos y te lo renovamos.' : '');
}
servir($privado, $quien);
