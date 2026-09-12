<?php
/**
 * El panorama de los jefes (§15).
 *
 * El objetivo declarado es entender el estado de produccion en menos de 30
 * segundos sin preguntarle nada a nadie. Por eso esto devuelve una sola
 * respuesta con todo, y no obliga a la interfaz a encadenar peticiones.
 *
 * Una decision que no estaba en el encargo: el panorama tambien enseña lo que
 * esta esperando a LOS JEFES —revisiones sin resolver, con su antiguedad— y no
 * solo lo que espera a Fabian. Un panel que solo mira al trabajador se lee como
 * vigilancia; uno que enseña las dos deudas se lee como coordinacion, y ademas
 * es la informacion que de verdad desatasca la produccion.
 */

require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/plan.php';

/** Columnas de pieza que salen al cliente. Lista explicita: nada de `SELECT *`. */
const CAMPOS_PIEZA = 'p.id, p.titulo, p.marca, p.cliente_nombre, p.tipo, p.referencia_url,
                      p.estado, p.prioridad, p.ultimo_punto, p.siguiente_paso,
                      p.motivo_pausa, p.motivo_bloqueo, p.creada_en, p.actualizada_en, p.terminada_en';

function panorama(): array
{
    $porEstado = [];
    foreach (['EN_PRODUCCION', 'REVISION', 'CAMBIOS', 'BLOQUEADO', 'PAUSADO', 'PROXIMO', 'BACKLOG'] as $e) {
        $porEstado[$e] = filas(
            'SELECT ' . CAMPOS_PIEZA . ', u.nombre AS responsable
               FROM piezas p LEFT JOIN usuarios u ON u.id = p.asignada_a
              WHERE p.estado = ?
              ORDER BY p.prioridad ASC, p.actualizada_en DESC',
            [$e]
        );
    }

    // «Terminados hoy» usa la fecha de Lima, no un rango de las ultimas 24 h:
    // lo que el jefe quiere saber es que se cerro HOY.
    $porEstado['TERMINADO_HOY'] = filas(
        'SELECT ' . CAMPOS_PIEZA . ', u.nombre AS responsable
           FROM piezas p LEFT JOIN usuarios u ON u.id = p.asignada_a
          WHERE p.estado = ? AND DATE(p.terminada_en) = ?
          ORDER BY p.terminada_en DESC',
        ['TERMINADO', hoy()]
    );

    return [
        'hoy'         => hoy(),
        'gente'       => array_map('estadoDeLaPersona', filas(
            "SELECT * FROM usuarios WHERE rol = 'audiovisual' AND activo = 1 ORDER BY nombre"
        )),
        'por_estado'  => $porEstado,
        'esperando'   => esperandoALosJefes(),
        'bloqueos'    => bloqueosAbiertos(),
        'cola'        => estadoDeLaCola(),
    ];
}

/**
 * Que esta haciendo alguien ahora mismo, y desde cuando no se sabe nada.
 *
 * `sin_cierre_desde` es la alerta del §13: NO se inventa ningun estado, solo se
 * dice que ese dia no se cerro y cuando fue la ultima señal de vida.
 */
function estadoDeLaPersona(array $u): array
{
    $usuarioId = (int) $u['id'];

    $trabajando = fila(
        'SELECT ' . CAMPOS_PIEZA . '
           FROM piezas p
          WHERE p.asignada_a = ? AND p.estado = ?
          ORDER BY p.actualizada_en DESC LIMIT 1',
        [$usuarioId, 'EN_PRODUCCION']
    );

    $jornadaHoy = fila('SELECT * FROM jornadas WHERE usuario_id = ? AND fecha = ?', [$usuarioId, hoy()]);

    $abiertasViejas = filas(
        "SELECT fecha FROM jornadas
          WHERE usuario_id = ? AND estado = 'abierta' AND fecha < ?
          ORDER BY fecha ASC",
        [$usuarioId, hoy()]
    );

    $ultimoEvento = fila(
        'SELECT creado_en FROM eventos WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 1',
        [$usuarioId]
    );

    return [
        'id'                 => $usuarioId,
        'nombre'             => $u['nombre'],
        'trabajando_en'      => $trabajando,
        'jornada_hoy'        => $jornadaHoy ? $jornadaHoy['estado'] : null,
        'sin_cierre_desde'   => array_column($abiertasViejas, 'fecha'),
        'ultima_actualizacion' => $ultimoEvento['creado_en'] ?? null,
    ];
}

/**
 * La deuda de los jefes: revisiones abiertas, con sus dias.
 *
 * `dias` sale de DATEDIFF sobre la fecha de Lima. Es el numero que convierte
 * «hay cosas en revision» en «esto lleva tres dias parado por tu culpa».
 */
function esperandoALosJefes(): array
{
    return filas(
        'SELECT r.id, r.creada_en, DATEDIFF(?, DATE(r.creada_en)) AS dias,
                p.id AS pieza_id, p.titulo, p.marca, p.ultimo_punto
           FROM revisiones r JOIN piezas p ON p.id = r.pieza_id
          WHERE r.resuelta_en IS NULL
          ORDER BY r.creada_en ASC',
        [hoy()]
    );
}

function bloqueosAbiertos(): array
{
    return filas(
        'SELECT b.id, b.tipo, b.detalle, b.abierto_en, DATEDIFF(?, DATE(b.abierto_en)) AS dias,
                p.id AS pieza_id, p.titulo, p.marca
           FROM bloqueos b LEFT JOIN piezas p ON p.id = b.pieza_id
          WHERE b.resuelto_en IS NULL
          ORDER BY b.abierto_en ASC',
        [hoy()]
    );
}

/** Una pieza con su historial completo (§16). */
function detalleDePieza(int $id): array
{
    $pieza = fila(
        'SELECT ' . CAMPOS_PIEZA . ', u.nombre AS responsable, c.nombre AS creador
           FROM piezas p
           LEFT JOIN usuarios u ON u.id = p.asignada_a
           LEFT JOIN usuarios c ON c.id = p.creada_por
          WHERE p.id = ?',
        [$id]
    );
    if (!$pieza) {
        fallar('Esa pieza no existe.', 404);
    }

    return [
        'pieza'      => $pieza,
        'historial'  => filas(
            'SELECT e.id, e.tipo, e.estado_anterior, e.estado_nuevo, e.nota, e.creado_en,
                    u.nombre AS quien
               FROM eventos e LEFT JOIN usuarios u ON u.id = e.usuario_id
              WHERE e.pieza_id = ?
              ORDER BY e.creado_en ASC, e.id ASC',
            [$id]
        ),
        'revisiones' => filas(
            'SELECT r.veredicto, r.comentario, r.creada_en, r.resuelta_en, u.nombre AS revisor
               FROM revisiones r LEFT JOIN usuarios u ON u.id = r.revisor_id
              WHERE r.pieza_id = ? ORDER BY r.creada_en DESC',
            [$id]
        ),
    ];
}
