<?php
/**
 * metrics.php — recolecta métricas diarias de Instagram y Facebook y las
 * guarda en un CSV (data/metrics.csv) que puedes descargar o abrir en Excel.
 * Lo ejecuta el cron de hPanel una vez al día.
 *
 * Cron sugerido (una vez al día, p. ej. 23:30 Perú → 04:30 UTC):
 *   php /home/uXXXXXXXXX/dak-social/metrics.php >> /home/uXXXXXXXXX/dak-social/data/cron.log 2>&1
 */
require __DIR__ . '/config.php';
require __DIR__ . '/lib.php';

function safe($fn, $default = '') {
    try { return $fn(); } catch (Exception $e) { dak_log('métrica n/d: ' . $e->getMessage()); return $default; }
}

try {
    $row = ['fecha' => date('Y-m-d')];

    // Instagram: seguidores, publicaciones y alcance del día.
    $row['ig_seguidores'] = safe(function () {
        $r = graph_get(IG_BUSINESS_ID, ['fields' => 'followers_count,media_count'], META_TOKEN);
        return isset($r['followers_count']) ? $r['followers_count'] : '';
    });
    $row['ig_publicaciones'] = safe(function () {
        $r = graph_get(IG_BUSINESS_ID, ['fields' => 'media_count'], META_TOKEN);
        return isset($r['media_count']) ? $r['media_count'] : '';
    });
    $row['ig_alcance_dia'] = safe(function () {
        $r = graph_get(IG_BUSINESS_ID . '/insights', ['metric' => 'reach', 'period' => 'day'], META_TOKEN);
        return isset($r['data'][0]['values'][0]['value']) ? $r['data'][0]['values'][0]['value'] : '';
    });

    // Facebook: fans de la Página e impresiones del día.
    $row['fb_fans'] = safe(function () {
        $r = graph_get(FB_PAGE_ID, ['fields' => 'fan_count,followers_count'], META_TOKEN);
        return isset($r['fan_count']) ? $r['fan_count'] : (isset($r['followers_count']) ? $r['followers_count'] : '');
    });
    $row['fb_impresiones_dia'] = safe(function () {
        $r = graph_get(FB_PAGE_ID . '/insights', ['metric' => 'page_impressions', 'period' => 'day'], META_TOKEN);
        return isset($r['data'][0]['values'][0]['value']) ? $r['data'][0]['values'][0]['value'] : '';
    });

    // Escribe/actualiza data/metrics.csv (encabezados la primera vez).
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    $file    = $dir . '/metrics.csv';
    $headers = array_keys($row);
    $new     = !file_exists($file);
    $fh      = fopen($file, 'a');
    if ($new) { fputcsv($fh, $headers); }
    fputcsv($fh, array_values($row));
    fclose($fh);

    dak_log('metrics.php OK — ' . json_encode($row, JSON_UNESCAPED_UNICODE));
} catch (Exception $e) {
    dak_log('metrics.php FALLÓ: ' . $e->getMessage());
    exit(1);
}
