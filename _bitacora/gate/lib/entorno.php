<?php
/**
 * Entorno: zona horaria y secretos.
 *
 * ── La zona horaria es carga estructural, no una preferencia ──────────────
 *
 * El servidor corre en UTC (date.timezone por defecto en el hosting). Toda esta
 * aplicacion se sostiene sobre la pregunta «¿de que dia es esto?»: el plan de
 * hoy, el cierre de hoy, la jornada que quedo abierta ayer. Si un cierre a las
 * 20:00 de Lima se guarda como 01:00 UTC, se registra en el dia SIGUIENTE, y a
 * partir de ahi:
 *
 *   - el cierre no cierra la jornada de hoy sino que abre una de mañana
 *   - la reconciliacion cree que ayer quedo sin cerrar cuando si se cerro
 *   - el informe diario sale con la fecha equivocada
 *
 * Ninguno de esos fallos se ve en una prueba hecha a las 10 de la mañana. Todos
 * aparecen en produccion, de noche, que es justo cuando Fabian usa la app.
 *
 * Por eso: America/Lima se fija aqui, una vez, antes de que nada lea una fecha.
 * Lima es UTC-5 fijo (Peru no aplica horario de verano), asi que no hay saltos
 * de DST que compliquen la aritmetica de dias.
 */

require_once __DIR__ . '/../config.php';

date_default_timezone_set(ZONA_HORARIA);

/** La fecha de negocio de HOY. Es la unica forma valida de preguntarlo. */
function hoy(): string
{
    return date('Y-m-d');
}

/** El instante actual, en hora de Lima y en el formato que guarda MySQL. */
function ahora(): string
{
    return date('Y-m-d H:i:s');
}

/**
 * Lee el archivo de secretos.
 *
 * Vive fuera de todo docroot y con chmod 600. No esta en el repo, no viaja en
 * el build y no lo sirve Apache ni por accidente. El formato es CLAVE=valor,
 * una por linea; las lineas vacias y las que empiezan por # se ignoran.
 */
function secretos(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $cache = [];
    if (!is_readable(RUTA_SECRETOS)) {
        return $cache;
    }

    foreach (file(RUTA_SECRETOS, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linea) {
        $linea = trim($linea);
        if ($linea === '' || $linea[0] === '#' || !str_contains($linea, '=')) {
            continue;
        }
        [$clave, $valor] = explode('=', $linea, 2);
        $cache[trim($clave)] = trim($valor, " \t\"'");
    }

    return $cache;
}

function secreto(string $clave, ?string $porDefecto = null): ?string
{
    return secretos()[$clave] ?? $porDefecto;
}
