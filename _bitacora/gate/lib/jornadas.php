<?php
/**
 * La jornada: abrir, reconciliar, cerrar.
 *
 * Aqui vive el carril completo de Fabian. Todo lo que escribe pasa por
 * moverPieza(), asi que ningun cambio de estado puede saltarse la maquina de
 * estados ni quedarse sin evento.
 */

require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/plan.php';
require_once __DIR__ . '/eventos.php';
require_once __DIR__ . '/respuesta.php';
require_once __DIR__ . '/piezas.php';

const DESENLACES = ['termine', 'continuo', 'pause', 'bloqueado', 'no_trabaje'];

const TIPOS_BLOQUEO = [
    'falta_material', 'esperando_aprobacion', 'esperando_cliente',
    'falta_recurso', 'problema_tecnico', 'otro',
];

/**
 * Los tipos de trabajo suelto, con las palabras que usa Fabian.
 *
 * Salen de sus informes reales, no de una taxonomia inventada: «edite»,
 * «cree promnt», «generar videos con ia», «carrusel», «videos cortos»,
 * «animacion de after efects», «investigue temas», «cree imagenes de ia».
 */
const TIPOS_TRABAJO = [
    'edicion', 'prompts', 'generacion_ia', 'carrusel', 'video_corto',
    'animacion', 'imagenes', 'investigacion', 'otro',
];

const ETIQUETAS_TRABAJO = [
    'edicion'       => 'Edición',
    'prompts'       => 'Prompts',
    'generacion_ia' => 'Generación con IA',
    'carrusel'      => 'Carrusel',
    'video_corto'   => 'Video corto',
    'animacion'     => 'Animación',
    'imagenes'      => 'Imágenes',
    'investigacion' => 'Investigación',
    'otro'          => 'Otro',
];

/** Etiquetas humanas de los bloqueos, para el informe. */
const ETIQUETAS_BLOQUEO = [
    'falta_material'       => 'Falta material',
    'esperando_aprobacion' => 'Esperando aprobación',
    'esperando_cliente'    => 'Esperando cliente',
    'falta_recurso'        => 'Falta recurso',
    'problema_tecnico'     => 'Problema técnico',
    'otro'                 => 'Otro',
];

function jornadaDeHoy(int $usuarioId): ?array
{
    return fila('SELECT * FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$usuarioId, hoy()]);
}

/**
 * El estado completo de «hoy» para Fabian.
 *
 * Devuelve un `modo` que decide que pantalla se enseña. El orden importa:
 * reconciliar va PRIMERO, antes que el plan. Es el §13 del encargo — si quedo
 * un dia sin cerrar, no se ve el plan de hoy hasta resolverlo, porque el plan
 * de hoy se calcula a partir de unos estados que todavia no son de fiar.
 */
function estadoDeHoy(array $u, bool $soloLectura = false): array
{
    $usuarioId = (int) $u['id'];

    $base = [
        'hoy'     => hoy(),
        'usuario' => ['id' => $usuarioId, 'nombre' => $u['nombre'], 'rol' => $u['rol']],
        'cola'    => estadoDeLaCola(),
    ];

    $pendientes = pendientesDeReconciliar($usuarioId);
    if ($pendientes['jornadas']) {
        return $base + ['modo' => 'reconciliar', 'reconciliar' => $pendientes];
    }

    $jornada = jornadaDeHoy($usuarioId);

    // Apertura implicita: la primera lectura del dia ABRE la jornada y congela
    // el plan. Antes hacia falta pulsar «Comenzar jornada», y eso eran dos
    // visitas diarias en vez de una — un ritual mas que olvidar, y si se
    // olvidaba, el cierre de esa tarde no tenia plan congelado por el que
    // preguntar.
    //
    // `abierta_en` pasa a significar «cuando abrio la aplicacion», que ademas es
    // un dato mas honesto que «cuando pulso un boton».
    //
    // Solo se abre para quien produce, y nunca desde un espejo de solo lectura:
    // que un jefe mire la pantalla de Fabian no puede crearle la jornada.
    if (!$jornada) {
        if ($soloLectura || $u['rol'] !== 'audiovisual') {
            return $base + ['modo' => 'plan', 'plan' => generarPlan($usuarioId)];
        }
        $abierta = abrirJornada($u);
        return $base + [
            'modo'           => 'jornada',
            'jornada'        => $abierta['jornada'],
            'plan_congelado' => $abierta['plan_congelado'],
            'trabajos_ayer'  => trabajosDeAyer($usuarioId),
        ];
    }

    if ($jornada['estado'] === 'cerrada' || $jornada['estado'] === 'sin_cierre') {
        return $base + [
            'modo'    => 'cerrada',
            'jornada' => $jornada,
            'resumen' => $jornada['resumen_json'] ? json_decode($jornada['resumen_json'], true) : null,
        ];
    }

    return $base + [
        'modo'            => 'jornada',
        'jornada'         => $jornada,
        'plan_congelado'  => planCongelado((int) $jornada['id']),
        // Lo de ayer, para poder repetirlo de un toque: sus días se parecen
        // muchísimo entre sí y recomponer la misma lista cada tarde es
        // exactamente el trabajo que esta aplicación existe para quitar.
        'trabajos_ayer'   => trabajosDeAyer($usuarioId),
    ];
}

/** El plan tal y como se guardo al abrir la jornada, con el estado actual de cada pieza. */
function planCongelado(int $jornadaId): array
{
    return filas(
        'SELECT jp.orden, jp.rol, jp.desenlace, jp.nota, jp.siguiente_paso AS siguiente_plan,
                p.*
           FROM jornada_piezas jp
           JOIN piezas p ON p.id = jp.pieza_id
          WHERE jp.jornada_id = ?
          ORDER BY jp.orden',
        [$jornadaId]
    );
}

/**
 * Abre la jornada de hoy y CONGELA el plan.
 *
 * Congelarlo es lo que permite que el cierre pregunte por lo que de verdad se
 * planifico. Si se recalculara al cerrar, un cambio de prioridad hecho por el
 * admin a media tarde haria que la app preguntara por piezas que Fabian nunca
 * vio esa mañana.
 *
 * $piezasElegidas permite que Fabian modifique el plan sugerido. Si viene
 * vacio, se congela el sugerido tal cual.
 */
function abrirJornada(array $u, array $piezasElegidas = []): array
{
    $usuarioId = (int) $u['id'];

    if (pendientesDeReconciliar($usuarioId)['jornadas']) {
        fallar('Antes de empezar hoy hay que resolver los días que quedaron sin cerrar.', 409,
               ['motivo' => 'hay_pendientes']);
    }

    if ($ya = jornadaDeHoy($usuarioId)) {
        if ($ya['estado'] === 'abierta') {
            return ['jornada' => $ya, 'plan_congelado' => planCongelado((int) $ya['id'])];
        }
        fallar('La jornada de hoy ya está cerrada.', 409, ['motivo' => 'ya_cerrada']);
    }

    bd()->beginTransaction();
    try {
        ejecutar(
            "INSERT INTO jornadas (usuario_id, fecha, abierta_en, estado) VALUES (?, ?, ?, 'abierta')",
            [$usuarioId, hoy(), ahora()]
        );
        $jornadaId = (int) bd()->lastInsertId();

        if ($piezasElegidas) {
            $lineas = [];
            foreach ($piezasElegidas as $i => $pid) {
                $lineas[] = ['pieza_id' => (int) $pid, 'orden' => $i + 1, 'rol' => $i === 0 ? 'continuar' : 'despues'];
            }
        } else {
            $lineas = array_map(
                fn($l) => ['pieza_id' => (int) $l['pieza']['id'], 'orden' => $l['orden'], 'rol' => $l['rol']],
                generarPlan($usuarioId)
            );
        }

        foreach ($lineas as $l) {
            ejecutar(
                'INSERT INTO jornada_piezas (jornada_id, pieza_id, orden, rol) VALUES (?, ?, ?, ?)',
                [$jornadaId, $l['pieza_id'], $l['orden'], $l['rol']]
            );
        }

        registrarEvento([
            'jornada_id' => $jornadaId,
            'usuario_id' => $usuarioId,
            'tipo'       => 'jornada_abierta',
            'datos'      => ['fecha' => hoy(), 'piezas' => array_column($lineas, 'pieza_id')],
        ]);

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    $jornada = fila('SELECT * FROM jornadas WHERE id = ?', [$jornadaId]);
    return ['jornada' => $jornada, 'plan_congelado' => planCongelado($jornadaId)];
}

/**
 * Aplica un desenlace a una pieza.
 *
 * El corazon de la regla de continuidad: `no_trabaje` NO cambia el estado. La
 * pieza se queda exactamente como estaba, sin penalizacion y sin degradarse.
 * Solo queda constancia de que ese dia no se toco.
 */
function aplicarDesenlace(array $u, int $jornadaId, array $d): void
{
    $piezaId   = (int) requerido($d, 'pieza_id');
    $desenlace = (string) requerido($d, 'desenlace');

    if (!in_array($desenlace, DESENLACES, true)) {
        fallar("«{$desenlace}» no es un desenlace válido.", 422);
    }

    $pieza = fila('SELECT * FROM piezas WHERE id = ?', [$piezaId]);
    if (!$pieza) {
        fallar("La pieza {$piezaId} no existe.", 404);
    }

    $nota    = limpiarTexto($d['nota'] ?? null);
    $paso    = limpiarTexto($d['siguiente_paso'] ?? null);
    $motivo  = limpiarTexto($d['motivo'] ?? null, 200);
    $destino = estadoSegunDesenlace($desenlace, $pieza['estado']);

    // La linea del plan puede no existir: una pieza puede haber entrado en
    // produccion durante el dia sin estar en el plan de la mañana.
    $existe = fila(
        'SELECT id FROM jornada_piezas WHERE jornada_id = ? AND pieza_id = ?',
        [$jornadaId, $piezaId]
    );
    if ($existe) {
        ejecutar(
            'UPDATE jornada_piezas SET desenlace = ?, nota = ?, siguiente_paso = ? WHERE id = ?',
            [$desenlace, $nota, $paso, $existe['id']]
        );
    } else {
        $siguiente = (int) (fila(
            'SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM jornada_piezas WHERE jornada_id = ?',
            [$jornadaId]
        )['n'] ?? 1);
        ejecutar(
            'INSERT INTO jornada_piezas (jornada_id, pieza_id, orden, rol, desenlace, nota, siguiente_paso)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$jornadaId, $piezaId, $siguiente, 'despues', $desenlace, $nota, $paso]
        );
    }

    moverPieza($piezaId, $destino, [
        'usuario_id'     => (int) $u['id'],
        'rol'            => $u['rol'],
        'jornada_id'     => $jornadaId,
        'tipo'           => 'cierre',
        'nota'           => $nota,
        'ultimo_punto'   => $nota,
        'siguiente_paso' => $paso,
        'motivo'         => $motivo,
        'tipo_bloqueo'   => $d['tipo_bloqueo'] ?? 'otro',
        'datos'          => ['desenlace' => $desenlace],
    ]);
}

/**
 * Cierra la jornada de hoy.
 *
 * No se completa el cierre si queda alguna pieza del plan sin resolver: es el
 * §5 del encargo. Una tarea abierta que nadie menciono no puede desaparecer en
 * silencio, asi que el servidor se niega a cerrar el dia sin ella.
 */
function cerrarJornada(array $u, array $cuerpo): array
{
    $usuarioId = (int) $u['id'];
    $jornada   = jornadaDeHoy($usuarioId);

    if (!$jornada) {
        fallar('Hoy no hay ninguna jornada abierta que cerrar.', 409, ['motivo' => 'sin_jornada']);
    }
    if ($jornada['estado'] !== 'abierta') {
        fallar('La jornada de hoy ya estaba cerrada.', 409, ['motivo' => 'ya_cerrada']);
    }

    $jornadaId  = (int) $jornada['id'];
    $desenlaces = $cuerpo['desenlaces'] ?? [];
    if (!is_array($desenlaces) || !$desenlaces) {
        fallar('El cierre necesita al menos un desenlace.', 422);
    }

    bd()->beginTransaction();
    try {
        foreach ($desenlaces as $d) {
            aplicarDesenlace($u, $jornadaId, (array) $d);
        }

        // La comprobacion que hace que el §5 sea real y no una intencion.
        $sinResolver = filas(
            'SELECT p.titulo FROM jornada_piezas jp JOIN piezas p ON p.id = jp.pieza_id
              WHERE jp.jornada_id = ? AND jp.desenlace IS NULL',
            [$jornadaId]
        );
        if ($sinResolver) {
            // Sin rollBack() explicito: fallar() lanza, y el catch de abajo
            // deshace la transaccion donde se abrio.
            fallar(
                'Faltan tareas por resolver: ' . implode(', ', array_column($sinResolver, 'titulo')) . '.',
                422,
                ['motivo' => 'faltan_desenlaces', 'piezas' => array_column($sinResolver, 'titulo')]
            );
        }

        guardarTrabajos($u, $jornadaId, $cuerpo['trabajos'] ?? []);

        foreach (($cuerpo['bloqueos'] ?? []) as $b) {
            $tipo = $b['tipo'] ?? 'otro';
            if (!in_array($tipo, TIPOS_BLOQUEO, true)) {
                $tipo = 'otro';
            }
            ejecutar(
                'INSERT INTO bloqueos (pieza_id, jornada_id, tipo, detalle, abierto_en) VALUES (?, ?, ?, ?, ?)',
                [$b['pieza_id'] ?? null, $jornadaId, $tipo, limpiarTexto($b['detalle'] ?? null, 400), ahora()]
            );
        }

        $informe = componerInforme($u, $jornadaId, $jornada['fecha']);

        ejecutar(
            "UPDATE jornadas SET estado = 'cerrada', cerrada_en = ?, resumen_json = ? WHERE id = ?",
            [ahora(), json_encode($informe, JSON_UNESCAPED_UNICODE), $jornadaId]
        );

        registrarEvento([
            'jornada_id' => $jornadaId,
            'usuario_id' => $usuarioId,
            'tipo'       => 'jornada_cerrada',
            'datos'      => ['fecha' => $jornada['fecha']],
        ]);

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    return ['informe' => $informe, 'plan_manana' => generarPlan($usuarioId)];
}

/**
 * Resuelve los dias que quedaron sin cerrar.
 *
 * Una sola pasada, no un asistente por dia olvidado. Si Fabian se salto cuatro
 * jornadas, se le pregunta UNA vez por lo que sigue abierto hoy; los dias
 * intermedios quedan marcados 'sin_cierre' sin inventarles contenido, porque
 * nadie va a reconstruir de memoria lo que paso el martes.
 *
 * La jornada mas reciente es la que recibe los desenlaces y queda 'cerrada' con
 * cerrada_tarde = 1. El historial dice la verdad: se cerro, y se cerro tarde.
 */
function reconciliar(array $u, array $cuerpo): array
{
    $usuarioId  = (int) $u['id'];
    $pendientes = pendientesDeReconciliar($usuarioId);

    if (!$pendientes['jornadas']) {
        fallar('No hay nada que reconciliar.', 409, ['motivo' => 'nada_pendiente']);
    }

    $desenlaces = $cuerpo['desenlaces'] ?? [];
    if (!is_array($desenlaces) || !$desenlaces) {
        fallar('Hay que decir qué pasó con cada tarea abierta.', 422);
    }

    $jornadas   = $pendientes['jornadas'];
    $ultima     = end($jornadas);            // la mas reciente: ordenadas por fecha ASC
    $ultimaId   = (int) $ultima['id'];
    $anteriores = array_slice($jornadas, 0, -1);

    bd()->beginTransaction();
    try {
        foreach ($desenlaces as $d) {
            aplicarDesenlace($u, $ultimaId, (array) $d);
        }

        $informe = componerInforme($u, $ultimaId, $ultima['fecha']);

        ejecutar(
            "UPDATE jornadas SET estado = 'cerrada', cerrada_en = ?, cerrada_tarde = 1, resumen_json = ?
              WHERE id = ?",
            [ahora(), json_encode($informe, JSON_UNESCAPED_UNICODE), $ultimaId]
        );

        foreach ($anteriores as $j) {
            ejecutar("UPDATE jornadas SET estado = 'sin_cierre' WHERE id = ?", [$j['id']]);
            registrarEvento([
                'jornada_id' => (int) $j['id'],
                'usuario_id' => $usuarioId,
                'tipo'       => 'jornada_sin_cierre',
                'nota'       => 'El día pasó sin cierre. No se reconstruyó su contenido.',
                'datos'      => ['fecha' => $j['fecha']],
            ]);
        }

        registrarEvento([
            'jornada_id' => $ultimaId,
            'usuario_id' => $usuarioId,
            'tipo'       => 'jornada_reconciliada',
            'datos'      => ['fecha' => $ultima['fecha'], 'dias_sin_cierre' => count($anteriores)],
        ]);

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    return [
        'informe'         => $informe,
        'dias_sin_cierre' => count($anteriores),
        'plan'            => generarPlan($usuarioId),
    ];
}

/**
 * Guarda el trabajo suelto de una jornada.
 *
 * Un trabajo suelto no tiene estado ni continuidad: es una linea de actividad
 * del dia. Lo que se arrastra entre jornadas son las piezas, y eso no cambia.
 * Por eso esto no pasa por moverPieza() — no hay pieza que mover.
 *
 * Aun asi deja su evento, porque el §16 quiere el historial completo y porque
 * mas adelante estas lineas son las que dicen cuanto se produce de verdad.
 */
function guardarTrabajos(array $u, int $jornadaId, array $trabajos): void
{
    foreach ($trabajos as $t) {
        $tipo  = $t['tipo'] ?? 'otro';
        $marca = $t['marca'] ?? 'DAK';

        if (!in_array($tipo, TIPOS_TRABAJO, true)) {
            $tipo = 'otro';
        }
        if (!in_array($marca, MARCAS, true)) {
            $marca = 'DAK';
        }
        // Tope alto pero real: nadie edita ochenta piezas en una tarde, y un
        // numero disparado suele ser un dedo, no un dia productivo.
        $cantidad = max(1, min(50, (int) ($t['cantidad'] ?? 1)));

        ejecutar(
            'INSERT INTO trabajos (jornada_id, usuario_id, tipo, marca, cantidad, nota, creado_en)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$jornadaId, (int) $u['id'], $tipo, $marca, $cantidad, limpiarTexto($t['nota'] ?? null, 300), ahora()]
        );
    }

    if ($trabajos) {
        registrarEvento([
            'jornada_id' => $jornadaId,
            'usuario_id' => (int) $u['id'],
            'tipo'       => 'trabajo_suelto',
            'datos'      => ['lineas' => count($trabajos)],
        ]);
    }
}

/** Lo que se registro en una jornada, para el informe y para repetirlo. */
function trabajosDe(int $jornadaId): array
{
    return filas(
        'SELECT tipo, marca, cantidad, nota FROM trabajos WHERE jornada_id = ? ORDER BY id',
        [$jornadaId]
    );
}

/**
 * El trabajo suelto de la ultima jornada cerrada.
 *
 * Es la pieza clave de «menos escribir, mas confirmar» aplicada a lo que de
 * verdad hace: sus dias se parecen muchisimo entre si —prompts, generar videos
 * para Vault con IA, un carrusel de DAK— asi que lo de ayer se ofrece para
 * repetirlo de un toque en vez de recomponerlo cada tarde.
 */
function trabajosDeAyer(int $usuarioId): array
{
    $ultima = fila(
        "SELECT id FROM jornadas
          WHERE usuario_id = ? AND estado = 'cerrada' AND fecha < ?
          ORDER BY fecha DESC LIMIT 1",
        [$usuarioId, hoy()]
    );
    return $ultima ? trabajosDe((int) $ultima['id']) : [];
}

/**
 * El informe del §14.
 *
 * Se compone en el servidor —no en el navegador— para que el texto que se copia
 * a WhatsApp sea identico venga de donde venga, y para poder guardarlo tal cual
 * en el historial.
 */
function componerInforme(array $u, int $jornadaId, string $fecha): array
{
    $lineas = filas(
        'SELECT jp.desenlace, jp.nota, p.titulo, p.marca, p.estado, p.ultimo_punto, p.siguiente_paso
           FROM jornada_piezas jp JOIN piezas p ON p.id = jp.pieza_id
          WHERE jp.jornada_id = ? ORDER BY jp.orden',
        [$jornadaId]
    );

    $grupos = ['termine' => [], 'continuo' => [], 'pause' => [], 'bloqueado' => [], 'no_trabaje' => []];
    foreach ($lineas as $l) {
        if ($l['desenlace']) {
            $grupos[$l['desenlace']][] = $l;
        }
    }

    $bloqueos = filas(
        'SELECT tipo, detalle FROM bloqueos WHERE jornada_id = ? AND resuelto_en IS NULL',
        [$jornadaId]
    );

    $manana = array_map(fn($l) => [
        'titulo' => $l['pieza']['titulo'],
        'marca'  => $l['pieza']['marca'],
        'rol'    => $l['rol'],
        'nota'   => $l['nota_plan'],
    ], generarPlan((int) $u['id']));

    $informe = [
        'fecha'    => $fecha,
        'usuario'  => $u['nombre'],
        'grupos'   => $grupos,
        'trabajos' => trabajosDe($jornadaId),
        'bloqueos' => $bloqueos,
        'manana'   => $manana,
    ];
    $informe['texto'] = informeEnTexto($informe);

    return $informe;
}

/** La version para pegar en WhatsApp. */
function informeEnTexto(array $i): string
{
    $fecha = strftime_es($i['fecha']);
    $t = 'CIERRE ' . mb_strtoupper($i['usuario']) . ' — ' . $fecha . "\n";

    $bloque = function (string $titulo, array $items, bool $conDetalle = false) {
        if (!$items) {
            return '';
        }
        $s = "\n" . $titulo . "\n";
        foreach ($items as $x) {
            $s .= '· ' . $x['marca'] . ' — ' . $x['titulo'] . "\n";
            if ($conDetalle) {
                if (!empty($x['ultimo_punto']))   $s .= '  Último punto: ' . $x['ultimo_punto'] . "\n";
                if (!empty($x['siguiente_paso'])) $s .= '  Siguiente: ' . $x['siguiente_paso'] . "\n";
            }
        }
        return $s;
    };

    $t .= $bloque('✅ Terminado (a revisión):', $i['grupos']['termine']);
    $t .= $bloque('▶️ En proceso:', $i['grupos']['continuo'], true);
    $t .= $bloque('⏸ Pausado:', $i['grupos']['pause']);
    $t .= $bloque('🚫 Bloqueado:', $i['grupos']['bloqueado']);
    $t .= $bloque('↪ No se trabajó hoy:', $i['grupos']['no_trabaje']);

    /*
     * El trabajo suelto va DENTRO del informe, y no como apendice.
     *
     * Sin esto el mensaje que se pega en WhatsApp diria menos que el que Fabian
     * escribe hoy a mano —«cree promnt, generé 5 videos para vault con ia,
     * edite un carrusel de dak»— y la aplicacion seria un retroceso respecto a
     * lo que sustituye.
     */
    if (!empty($i['trabajos'])) {
        $t .= "\n🎬 Además:\n";
        foreach ($i['trabajos'] as $x) {
            $etiqueta = ETIQUETAS_TRABAJO[$x['tipo']] ?? $x['tipo'];
            $cuantos = (int) $x['cantidad'] > 1 ? $x['cantidad'] . ' × ' : '';
            $t .= '· ' . $cuantos . $etiqueta . ' — ' . $x['marca']
                . ($x['nota'] ? ' (' . $x['nota'] . ')' : '') . "\n";
        }
    }

    if ($i['manana']) {
        $t .= "\n➡️ Mañana:\n";
        foreach ($i['manana'] as $n => $m) {
            $t .= ($n + 1) . '. ' . ($m['rol'] === 'continuar' ? 'Continuar ' : '')
                . $m['marca'] . ' — ' . $m['titulo'] . "\n";
        }
    }

    $t .= "\n🚫 Bloqueos:\n";
    if ($i['bloqueos']) {
        foreach ($i['bloqueos'] as $b) {
            $t .= '· ' . (ETIQUETAS_BLOQUEO[$b['tipo']] ?? $b['tipo'])
                . ($b['detalle'] ? ' — ' . $b['detalle'] : '') . "\n";
        }
    } else {
        $t .= "Ninguno\n";
    }

    return rtrim($t);
}

/** «2026-08-31» → «31 AGO». strftime esta obsoleto en PHP 8.1+, asi que a mano. */
function strftime_es(string $fecha): string
{
    $meses = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    $t = strtotime($fecha);
    return (int) date('j', $t) . ' ' . $meses[(int) date('n', $t)];
}
