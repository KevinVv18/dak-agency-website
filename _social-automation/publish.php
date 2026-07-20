<?php
/**
 * publish.php — publica el contenido del calendario que ya toca.
 * Lo ejecuta el cron de hPanel cada hora. Lee la Google Sheet (CSV),
 * busca filas cuya fecha/hora ya pasó y aún no se publicaron, y las postea
 * a Facebook y/o Instagram. Marca lo publicado para no repetir.
 *
 * Cron sugerido (hPanel → Cron Jobs, cada hora):
 *   php /home/uXXXXXXXXX/dak-social/publish.php >> /home/uXXXXXXXXX/dak-social/data/cron.log 2>&1
 */
require __DIR__ . '/config.php';
require __DIR__ . '/lib.php';

try {
    $rows  = load_csv(CALENDAR_CSV_URL);
    $state = load_state();
    $now   = time();
    $done  = 0;

    foreach ($rows as $row) {
        $when = isset($row['fecha_hora']) ? strtotime($row['fecha_hora']) : false;
        $text = isset($row['texto']) ? $row['texto'] : '';
        $img  = isset($row['imagen_url']) ? $row['imagen_url'] : '';
        $red  = strtolower(isset($row['red']) ? $row['red'] : 'ambos');
        if (!$when || $text === '') { continue; }          // fila incompleta
        if ($when > $now) { continue; }                    // aún no toca
        $key = substr(md5($row['fecha_hora'] . '|' . $text), 0, 16);
        if (!empty($state[$key])) { continue; }            // ya publicado

        $ok = [];
        try {
            if (($red === 'fb' || $red === 'ambos')) {
                $id = $img ? fb_publish_photo(FB_PAGE_ID, $img, $text, META_TOKEN)
                           : fb_publish_text(FB_PAGE_ID, $text, '', META_TOKEN);
                $ok[] = 'FB:' . $id;
            }
            if (($red === 'ig' || $red === 'ambos')) {
                if (!$img) { throw new Exception('Instagram requiere imagen_url'); }
                $id = ig_publish_photo(IG_BUSINESS_ID, $img, $text, META_TOKEN);
                $ok[] = 'IG:' . $id;
            }
            $state[$key] = ['at' => date('c'), 'result' => implode(' ', $ok)];
            save_state($state);
            dak_log('PUBLICADO [' . $red . '] "' . mb_substr($text, 0, 40) . '…" → ' . implode(' ', $ok));
            $done++;
        } catch (Exception $e) {
            dak_log('ERROR al publicar "' . mb_substr($text, 0, 40) . '…": ' . $e->getMessage());
        }
    }

    dak_log('publish.php OK — ' . $done . ' publicación(es) esta corrida.');
} catch (Exception $e) {
    dak_log('publish.php FALLÓ: ' . $e->getMessage());
    exit(1);
}
