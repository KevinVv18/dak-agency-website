<?php
/**
 * Utilidades compartidas para la automatización de redes de DAK.
 * Corre en el hosting compartido de Hostinger (PHP + cron de hPanel). Sin
 * dependencias externas: solo cURL, que ya viene con PHP.
 */

/** Log simple a data/automation.log (rotado por tamaño). */
function dak_log($msg) {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    $file = $dir . '/automation.log';
    if (file_exists($file) && filesize($file) > 1048576) { // 1 MB → rota
        @rename($file, $file . '.1');
    }
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . "\n";
    @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
    if (php_sapi_name() === 'cli') { fwrite(STDOUT, $line); }
}

/** GET a la Graph API. Devuelve array decodificado o lanza excepción. */
function graph_get($path, $params, $token) {
    $params['access_token'] = $token;
    $url = 'https://graph.facebook.com/' . GRAPH_VERSION . '/' . ltrim($path, '/')
         . '?' . http_build_query($params);
    return graph_request($url, null);
}

/** POST a la Graph API (form-urlencoded). */
function graph_post($path, $params, $token) {
    $params['access_token'] = $token;
    $url = 'https://graph.facebook.com/' . GRAPH_VERSION . '/' . ltrim($path, '/');
    return graph_request($url, $params);
}

function graph_request($url, $postFields) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 45,
        CURLOPT_CONNECTTIMEOUT => 15,
    ]);
    if ($postFields !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    }
    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false) {
        throw new Exception('cURL: ' . $err);
    }
    $data = json_decode($raw, true);
    if ($code >= 400 || isset($data['error'])) {
        $m = isset($data['error']['message']) ? $data['error']['message'] : ('HTTP ' . $code . ' ' . $raw);
        throw new Exception('Graph API: ' . $m);
    }
    return $data;
}

/** Publica una foto con pie en una Página de Facebook. */
function fb_publish_photo($pageId, $imageUrl, $caption, $token) {
    $r = graph_post($pageId . '/photos', [
        'url'     => $imageUrl,
        'caption' => $caption,
    ], $token);
    return isset($r['post_id']) ? $r['post_id'] : (isset($r['id']) ? $r['id'] : null);
}

/** Publica texto (opcionalmente con enlace) en una Página de Facebook. */
function fb_publish_text($pageId, $message, $link, $token) {
    $p = ['message' => $message];
    if ($link) { $p['link'] = $link; }
    $r = graph_post($pageId . '/feed', $p, $token);
    return isset($r['id']) ? $r['id'] : null;
}

/** Publica en Instagram (flujo de 2 pasos: crear contenedor → publicar). */
function ig_publish_photo($igId, $imageUrl, $caption, $token) {
    $c = graph_post($igId . '/media', [
        'image_url' => $imageUrl,
        'caption'   => $caption,
    ], $token);
    if (empty($c['id'])) { throw new Exception('IG: no se creó el contenedor'); }
    // IG puede tardar en procesar la imagen; reintenta la publicación.
    $lastErr = '';
    for ($i = 0; $i < 5; $i++) {
        try {
            $p = graph_post($igId . '/media_publish', ['creation_id' => $c['id']], $token);
            return isset($p['id']) ? $p['id'] : null;
        } catch (Exception $e) {
            $lastErr = $e->getMessage();
            sleep(6);
        }
    }
    throw new Exception('IG publish: ' . $lastErr);
}

/** Descarga y parsea un CSV (por URL o ruta local) a array de filas asociativas. */
function load_csv($src) {
    $raw = @file_get_contents($src);
    if ($raw === false) { throw new Exception('No se pudo leer el CSV: ' . $src); }
    $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw); // quita BOM
    $lines = preg_split('/\r\n|\n|\r/', trim($raw));
    if (!$lines || count($lines) < 2) { return []; }
    $head = str_getcsv(array_shift($lines));
    $head = array_map(function ($h) { return strtolower(trim($h)); }, $head);
    $rows = [];
    foreach ($lines as $ln) {
        if ($ln === '') { continue; }
        $cells = str_getcsv($ln);
        $row = [];
        foreach ($head as $i => $key) {
            $row[$key] = isset($cells[$i]) ? trim($cells[$i]) : '';
        }
        $rows[] = $row;
    }
    return $rows;
}

/** Estado de items ya publicados (evita duplicados), en data/posted.json. */
function load_state() {
    $f = __DIR__ . '/data/posted.json';
    if (!file_exists($f)) { return []; }
    $j = json_decode(@file_get_contents($f), true);
    return is_array($j) ? $j : [];
}
function save_state($state) {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    @file_put_contents($dir . '/posted.json', json_encode($state), LOCK_EX);
}
