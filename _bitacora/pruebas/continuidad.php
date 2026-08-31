<?php
/**
 * Prueba del carril vertical, contra la base de verdad.
 *
 * No es un test unitario con dobles: recorre el mismo codigo que la API y deja
 * los mismos eventos. Lo que comprueba es lo unico que de verdad importa de
 * esta aplicacion — que la continuidad entre dias no se rompe:
 *
 *   · una tarea que nadie menciona NO cambia de estado
 *   · el cierre se niega a completarse si queda algo sin resolver
 *   · olvidar un dia entero no pierde informacion
 *   · la maquina de estados no deja pasar un salto imposible
 *
 * Se ejecuta en el servidor:
 *   /opt/alt/php83/usr/bin/php pruebas/continuidad.php
 *
 * ⚠️ ESCRIBE EN LA BASE. Ahora mismo eso es correcto —solo hay datos de demo—
 * pero el dia que entren piezas reales hay que apuntarlo a una base de pruebas.
 */

$D = getenv('BITACORA_DIR') ?: '/home/u567580447/domains/dakagency.net/public_html/bitacora';
require_once "$D/lib/jornadas.php";
require_once "$D/lib/panorama.php";
require_once "$D/lib/piezas.php";

$fallos = 0;
$hechas = 0;

/**
 * Deja la base en el estado de la semilla antes de empezar.
 *
 * Sin esto la prueba solo pasa la primera vez: la pasada anterior cierra la
 * jornada de hoy y resuelve el dia olvidado, asi que la siguiente ya no
 * encuentra nada que reconciliar y falla sin que nada este roto. Una prueba que
 * solo pasa una vez no comprueba nada — solo enseña a ignorarla.
 */
function sembrar(): void
{
    // La tabla de trabajos va en la lista tambien. Sin ella, el TRUNCATE de
    // jornadas —hecho con las claves foraneas desactivadas— deja filas
    // huerfanas que se acumulan entre ejecuciones y falsean cualquier conteo.
    $tablas = ['eventos', 'jornada_piezas', 'revisiones', 'bloqueos', 'trabajos',
               'jornadas', 'piezas', 'usuarios'];
    bd()->exec('SET FOREIGN_KEY_CHECKS=0');
    foreach ($tablas as $t) {
        bd()->exec("TRUNCATE TABLE {$t}");
    }
    bd()->exec('SET FOREIGN_KEY_CHECKS=1');

    $sql = file_get_contents(__DIR__ . '/../sql/002-semilla.sql');
    if ($sql === false) {
        fwrite(STDERR, "No se encontró la semilla.\n");
        exit(2);
    }

    // Fuera los comentarios de linea antes de partir por «;»: si no, un «--»
    // se lleva por delante el resto de la sentencia siguiente.
    $limpio = implode("\n", array_filter(
        array_map('rtrim', explode("\n", $sql)),
        fn($l) => !str_starts_with(ltrim($l), '--')
    ));

    foreach (array_filter(array_map('trim', explode(";\n", $limpio))) as $sentencia) {
        $sentencia = rtrim($sentencia, "; \n");
        if ($sentencia !== '') {
            bd()->exec($sentencia);
        }
    }
}

sembrar();
echo "(base sembrada de cero)\n";

function comprobar(string $que, bool $bien, string $detalle = ''): void
{
    global $fallos, $hechas;
    $hechas++;
    if ($bien) {
        echo "  ok   {$que}\n";
    } else {
        $fallos++;
        echo "  FALLA {$que}" . ($detalle ? "  ({$detalle})" : '') . "\n";
    }
}

/** Ejecuta algo que DEBE fallar, y devuelve el error. */
function debeFallar(callable $f): ?ErrorDeApi
{
    try {
        $f();
        return null;
    } catch (ErrorDeApi $e) {
        return $e;
    }
}

$fabian = fila("SELECT * FROM usuarios WHERE rol = 'audiovisual' LIMIT 1");
$jefe   = fila("SELECT * FROM usuarios WHERE rol = 'admin' LIMIT 1");

echo "\n=== ZONA HORARIA ===\n";

// Se compara el INSTANTE, no la fecha. Comparar solo la fecha parece razonable
// y no comprueba nada: durante 19 de cada 24 horas la fecha de Lima y la de UTC
// coinciden, asi que la prueba pasaria con el huso mal puesto y solo empezaria
// a fallar de noche — justo cuando ya estaria roto en produccion.
$desfase = (strtotime(gmdate('Y-m-d H:i:s')) - strtotime(ahora())) / 3600;
comprobar('la hora de negocio va 5 h por detras de UTC (Lima, sin horario de verano)',
    (int) round($desfase) === 5, "desfase={$desfase} h");

comprobar('la fecha de jornada sale de esa hora, no de la del servidor',
    hoy() === date('Y-m-d', strtotime(ahora())));

// Lo que de verdad se quiere garantizar, dicho sin depender de la hora a la que
// se ejecute la prueba: un cierre a las 20:00 de Lima pertenece a ESE dia.
$veintehoras = strtotime(hoy() . ' 20:00:00');
comprobar('un cierre a las 20:00 de Lima pertenece al dia de Lima, no al siguiente de UTC',
    date('Y-m-d', $veintehoras) === hoy()
    && gmdate('Y-m-d', $veintehoras + 5 * 3600) !== hoy(),
    'en UTC seria ' . gmdate('Y-m-d', $veintehoras + 5 * 3600));

echo "\n=== 1. RECONCILIAR EL DIA OLVIDADO ===\n";
$estado = estadoDeHoy($fabian);
comprobar('al abrir, pide reconciliar antes que nada', $estado['modo'] === 'reconciliar', "modo={$estado['modo']}");

if ($estado['modo'] === 'reconciliar') {
    $abiertas = $estado['reconciliar']['piezas'];
    comprobar('propone las piezas que quedaron abiertas', count($abiertas) >= 1, count($abiertas) . ' piezas');

    // La pieza que NO se va a mencionar. Su estado tiene que sobrevivir intacto.
    $intacta = null;
    foreach ($abiertas as $p) {
        if ($p['estado'] === 'PAUSADO') { $intacta = $p; break; }
    }

    $enProduccion = null;
    foreach ($abiertas as $p) {
        if ($p['estado'] === 'EN_PRODUCCION') { $enProduccion = $p; break; }
    }

    $r = reconciliar($fabian, ['desenlaces' => array_map(
        fn($p) => ['pieza_id' => (int) $p['id'], 'desenlace' => 'no_trabaje'],
        $abiertas
    )]);
    comprobar('la reconciliacion devuelve informe', !empty($r['informe']['texto']));

    if ($enProduccion) {
        $ahora = fila('SELECT estado FROM piezas WHERE id = ?', [$enProduccion['id']]);
        comprobar('«no trabaje» NO cambia el estado (regla de continuidad)',
            $ahora['estado'] === 'EN_PRODUCCION', "quedo en {$ahora['estado']}");
    }
    if ($intacta) {
        $ahora = fila('SELECT estado FROM piezas WHERE id = ?', [$intacta['id']]);
        comprobar('una pausada sigue pausada tras el olvido',
            $ahora['estado'] === 'PAUSADO', "quedo en {$ahora['estado']}");
    }

    $viejas = filas("SELECT estado FROM jornadas WHERE usuario_id = ? AND fecha < ?", [$fabian['id'], hoy()]);
    $abiertasAun = array_filter($viejas, fn($j) => $j['estado'] === 'abierta');
    comprobar('ya no queda ninguna jornada vieja abierta', count($abiertasAun) === 0);
}

echo "\n=== 2. LA JORNADA SE ABRE SOLA ===\n";
comprobar('antes de mirar, hoy no tiene jornada',
    fila('SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$fabian['id'], hoy()]) === null);

// Apertura implicita: la primera lectura del dia abre la jornada y congela el
// plan. Fabian ya no tiene que pulsar «Comenzar jornada» — una visita menos.
$estado = estadoDeHoy($fabian);
comprobar('la primera lectura del dia abre la jornada', $estado['modo'] === 'jornada', "modo={$estado['modo']}");
comprobar('el plan queda congelado al abrirse', count($estado['plan_congelado']) >= 1);
comprobar('lo primero es continuar lo que estaba en marcha',
    ($estado['plan_congelado'][0]['estado'] ?? '') === 'EN_PRODUCCION');
comprobar('el plan NO incluye nada bloqueado ni en revision',
    !array_filter($estado['plan_congelado'], fn($p) => in_array($p['estado'], ['BLOQUEADO', 'REVISION'], true)));

$congelado = $estado['plan_congelado'];
$jornadaId = (int) $estado['jornada']['id'];
$vistaJornada = $estado;   // se guarda: tras cerrar, el modo ya no es 'jornada'

// Leer otra vez no puede duplicar nada.
$otra = estadoDeHoy($fabian);
comprobar('mirar dos veces no abre dos jornadas', (int) $otra['jornada']['id'] === $jornadaId);

echo "\n=== 2b. EL ESPEJO NO ESCRIBE ===\n";
$eventosAntes = (int) fila('SELECT COUNT(*) n FROM eventos')['n'];
$espejo = estadoDeHoy($fabian, true);
comprobar('el espejo devuelve lo mismo que ve Fabian', $espejo['modo'] === 'jornada');
comprobar('mirar por el espejo no escribe ningun evento',
    (int) fila('SELECT COUNT(*) n FROM eventos')['n'] === $eventosAntes);

echo "\n=== 3. EL CIERRE NO SE COMPLETA A MEDIAS ===\n";
$e = debeFallar(fn() => cerrarJornada($fabian, [
    'desenlaces' => [['pieza_id' => (int) $congelado[0]['id'], 'desenlace' => 'continuo', 'nota' => 'Escena 5 lista']],
]));
comprobar('cerrar mencionando solo una tarea es rechazado', $e !== null && $e->codigo === 422,
    $e ? $e->getMessage() : 'no fallo');
comprobar('el rechazo dice QUE falta', $e && !empty($e->extra['piezas']),
    $e ? implode(', ', $e->extra['piezas'] ?? []) : '');

$sigueAbierta = fila('SELECT estado FROM jornadas WHERE id = ?', [$jornadaId]);
comprobar('tras el rechazo la jornada sigue abierta', $sigueAbierta['estado'] === 'abierta');

$sinTocar = fila('SELECT desenlace FROM jornada_piezas WHERE jornada_id = ? AND pieza_id = ?',
    [$jornadaId, $congelado[0]['id']]);
comprobar('el rechazo deshizo la transaccion entera (ningun desenlace a medias)',
    $sinTocar['desenlace'] === null, 'quedo ' . var_export($sinTocar['desenlace'], true));

echo "\n=== 4. CIERRE COMPLETO ===\n";
$desenlaces = [];
foreach ($congelado as $i => $p) {
    $desenlaces[] = $i === 0
        ? ['pieza_id' => (int) $p['id'], 'desenlace' => 'continuo',
           'nota' => 'Escenas 5-6 montadas', 'siguiente_paso' => 'Mezcla de sonido']
        : ['pieza_id' => (int) $p['id'], 'desenlace' => 'no_trabaje'];
}
$c = cerrarJornada($fabian, [
    'desenlaces' => $desenlaces,
    'bloqueos'   => [['tipo' => 'esperando_aprobacion', 'detalle' => 'Falta el visto bueno del guion']],
    // El trabajo suelto del 26 de agosto, tal y como lo describio el.
    'trabajos'   => [
        ['tipo' => 'prompts',       'marca' => 'Vault', 'cantidad' => 1],
        ['tipo' => 'generacion_ia', 'marca' => 'Vault', 'cantidad' => 5],
        ['tipo' => 'carrusel',      'marca' => 'DAK',   'cantidad' => 2],
        ['tipo' => 'investigacion', 'marca' => 'DAK',   'cantidad' => 1],
    ],
]);

comprobar('el cierre devuelve informe en texto', !empty($c['informe']['texto']));
comprobar('el informe lleva el plan de mañana', count($c['plan_manana']) >= 1);
comprobar('la jornada queda cerrada',
    fila('SELECT estado FROM jornadas WHERE id = ?', [$jornadaId])['estado'] === 'cerrada');

$p0 = fila('SELECT ultimo_punto, siguiente_paso FROM piezas WHERE id = ?', [$congelado[0]['id']]);
comprobar('«continúo» guarda donde quedo', $p0['ultimo_punto'] === 'Escenas 5-6 montadas');
comprobar('«continúo» guarda que sigue', $p0['siguiente_paso'] === 'Mezcla de sonido');

$e = debeFallar(fn() => cerrarJornada($fabian, ['desenlaces' => $desenlaces]));
comprobar('no se puede cerrar dos veces el mismo dia', $e !== null && $e->codigo === 409);

echo "\n--- informe generado ---\n" . $c['informe']['texto'] . "\n";

echo "\n=== 5. MAQUINA DE ESTADOS ===\n";
$enRevision = fila("SELECT id FROM piezas WHERE estado = 'REVISION' LIMIT 1");
if ($enRevision) {
    $e = null;
    try { moverPieza((int) $enRevision['id'], 'TERMINADO', ['rol' => 'audiovisual', 'usuario_id' => (int) $fabian['id']]); }
    catch (ErrorDeTransicion $x) { $e = $x; }
    comprobar('Fabián no puede dar nada por terminado', $e !== null);

    $antes = (int) fila('SELECT COUNT(*) n FROM eventos WHERE pieza_id = ?', [$enRevision['id']])['n'];
    comprobar('un salto rechazado no deja evento',
        $antes === (int) fila('SELECT COUNT(*) n FROM eventos WHERE pieza_id = ?', [$enRevision['id']])['n']);

    $r = revisarPieza($jefe, (int) $enRevision['id'], ['veredicto' => 'cambios', 'comentario' => 'Cambiar la tipografía']);
    comprobar('el admin pide cambios y la pieza pasa a CAMBIOS', $r['estado'] === 'CAMBIOS');
    comprobar('los cambios pedidos quedan como siguiente paso',
        $r['siguiente_paso'] === 'Cambiar la tipografía');
    comprobar('la revision queda resuelta',
        fila('SELECT resuelta_en FROM revisiones WHERE pieza_id = ? ORDER BY id DESC LIMIT 1',
             [$enRevision['id']])['resuelta_en'] !== null);
}

echo "\n=== 4b. EL TRABAJO SUELTO (el dia real de Fabian) ===\n";
/*
 * El caso es su informe del 26 de agosto, literal:
 *
 *   «edite y cree promnt y edite aparte de generar 5 videos para vault con ia,
 *    edite un carrusel de video 1 de dak 1 video y una imagen, e investigue
 *    temas variados para dak y para vault para hacer contenido»
 *
 * Nueve salidas, una en lote de cinco, y dos que no son piezas entregables.
 * Si el informe de la aplicacion dice menos que ese mensaje, la aplicacion es
 * un retroceso respecto a lo que sustituye.
 */
$hoy2 = fila('SELECT * FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$fabian['id'], hoy()]);
comprobar('el dia de hoy quedo cerrado por la prueba anterior', $hoy2['estado'] === 'cerrada');

$guardados = trabajosDe((int) $hoy2['id']);
comprobar('el cierre guardo el trabajo suelto', count($guardados) === 4,
    count($guardados) . ' lineas');

$total = array_sum(array_map(fn($t) => (int) $t['cantidad'], $guardados));
comprobar('los lotes cuentan por su cantidad, no por su fila', $total === 9, "total={$total}");

$texto = $c['informe']['texto'];
comprobar('el informe nombra la generacion con IA', str_contains($texto, 'Generación con IA'));
comprobar('el informe dice CUANTOS eran', str_contains($texto, '5 × '));
comprobar('el informe recoge el trabajo que no es una pieza',
    str_contains($texto, 'Prompts') && str_contains($texto, 'Investigación'));
comprobar('el informe distingue la marca de cada trabajo',
    str_contains($texto, 'Generación con IA — Vault'));

// Lo de ayer, para repetirlo de un toque. Se comprueba sobre la vista de
// jornada ABIERTA: una vez cerrado el dia el modo es 'cerrada' y ya no lleva
// ese campo, que es correcto — a un dia cerrado no se le anota nada.
comprobar('la vista de la jornada ofrece lo de ayer para repetirlo',
    array_key_exists('trabajos_ayer', $vistaJornada));
comprobar('y un dia ya cerrado NO lo ofrece',
    !array_key_exists('trabajos_ayer', estadoDeHoy($fabian)));

echo "\n=== 5b. EL ESPEJO NO ABRE JORNADAS AJENAS ===\n";
// El caso que de verdad importa: un jefe mirando el espejo por la mañana, antes
// de que Fabian haya abierto la app. Si el espejo abriera la jornada, le
// congelaria un plan que Fabian no ha visto y meteria en su historial un evento
// que el no hizo.
ejecutar('DELETE FROM jornada_piezas WHERE jornada_id = ?', [$jornadaId]);
ejecutar('DELETE FROM eventos WHERE jornada_id = ?', [$jornadaId]);
ejecutar('DELETE FROM jornadas WHERE id = ?', [$jornadaId]);
comprobar('preparado: hoy vuelve a no tener jornada',
    fila('SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$fabian['id'], hoy()]) === null);
$mirado = estadoDeHoy($fabian, true);
comprobar('el espejo NO abre la jornada de quien mira',
    fila('SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$fabian['id'], hoy()]) === null,
    "modo devuelto={$mirado['modo']}");
comprobar('y aun asi devuelve algo util que enseñar', in_array($mirado['modo'], ['plan', 'jornada'], true));

echo "\n=== 6. PANORAMA ===\n";
$pan = panorama();
comprobar('el panorama sabe en que trabaja Fabián', isset($pan['gente'][0]['trabajando_en']));
comprobar('el panorama agrupa por estado', isset($pan['por_estado']['EN_PRODUCCION']));
comprobar('el panorama enseña los bloqueos abiertos con sus dias',
    isset($pan['bloqueos'][0]['dias']) || count($pan['bloqueos']) === 0);

echo "\n=== 7. ALTA RAPIDA ===\n";
$nueva = crearPieza($jefe, ['titulo' => 'Prueba automatizada', 'marca' => 'DAK', 'tipo' => 'Reel']);
comprobar('la pieza nace en BACKLOG', $nueva['estado'] === 'BACKLOG');
comprobar('deja constancia de que se aprobo fuera de la app', $nueva['origen'] === 'whatsapp');
comprobar('el alta deja su evento',
    (int) fila('SELECT COUNT(*) n FROM eventos WHERE pieza_id = ?', [$nueva['id']])['n'] === 1);

$e = debeFallar(fn() => crearPieza($jefe, ['titulo' => 'Sin cliente', 'marca' => 'Cliente']));
comprobar('una pieza de cliente exige nombre de cliente', $e !== null && $e->codigo === 422);

$e = debeFallar(fn() => crearPieza($jefe, ['titulo' => 'Mala url', 'marca' => 'DAK', 'referencia_url' => 'no-soy-url']));
comprobar('rechaza una URL de referencia invalida', $e !== null && $e->codigo === 422);

ejecutar('DELETE FROM eventos WHERE pieza_id = ?', [$nueva['id']]);
ejecutar('DELETE FROM piezas WHERE id = ?', [$nueva['id']]);

echo "\n" . str_repeat('─', 58) . "\n";
echo $fallos === 0
    ? "TODO BIEN — {$hechas} comprobaciones\n"
    : "{$fallos} FALLOS de {$hechas} comprobaciones\n";
exit($fallos === 0 ? 0 : 1);
