<?php
/**
 * Alta, edicion y revision de piezas.
 */

require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/eventos.php';
require_once __DIR__ . '/respuesta.php';

const MARCAS = ['DAK', 'Vault', 'Cliente'];

/**
 * Alta rapida: «Nueva pieza aprobada» (§2).
 *
 * Cuatro campos y ya. Todo lo que no sea imprescindible para empezar a
 * trabajar se deja fuera a proposito: esto tiene que tardar 15-30 segundos o
 * nadie lo usa y las piezas se quedan en WhatsApp.
 *
 * `origen` se guarda como 'whatsapp' porque ahi es donde la socia aprueba de
 * verdad. El registro dice donde paso, en vez de fingir que la aprobacion
 * ocurrio en la aplicacion.
 */
function crearPieza(array $u, array $d): array
{
    $titulo = limpiarTexto(requerido($d, 'titulo'), 200);
    $marca  = (string) requerido($d, 'marca');

    if (!in_array($marca, MARCAS, true)) {
        fallar('Marca no válida. Debe ser DAK, Vault o Cliente.', 422);
    }
    if ($marca === 'Cliente' && empty(trim((string) ($d['cliente_nombre'] ?? '')))) {
        fallar('Si la pieza es de cliente, hace falta el nombre del cliente.', 422);
    }

    $url = trim((string) ($d['referencia_url'] ?? ''));
    if ($url !== '' && !filter_var($url, FILTER_VALIDATE_URL)) {
        fallar('Ese enlace de referencia no parece una URL válida.', 422);
    }

    // Sin responsable explicito, va a Fabian: es el unico que produce. Cuando
    // haya mas gente, esto pasa a ser un campo del formulario.
    $responsable = $d['asignada_a'] ?? fila(
        "SELECT id FROM usuarios WHERE rol = 'audiovisual' AND activo = 1 ORDER BY id LIMIT 1"
    )['id'] ?? null;

    bd()->beginTransaction();
    try {
        ejecutar(
            'INSERT INTO piezas
               (titulo, marca, cliente_nombre, tipo, referencia_url, estado, prioridad,
                asignada_a, origen, creada_por, creada_en, actualizada_en)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $titulo,
                $marca,
                limpiarTexto($d['cliente_nombre'] ?? null, 120),
                limpiarTexto($d['tipo'] ?? null, 60),
                $url !== '' ? $url : null,
                in_array($d['estado'] ?? '', ESTADOS, true) ? $d['estado'] : 'BACKLOG',
                (int) ($d['prioridad'] ?? 100),
                $responsable,
                $marca === 'Cliente' ? 'cliente' : 'whatsapp',
                (int) $u['id'],
                ahora(),
                ahora(),
            ]
        );
        $id = (int) bd()->lastInsertId();

        registrarEvento([
            'pieza_id'     => $id,
            'usuario_id'   => (int) $u['id'],
            'tipo'         => 'creada',
            'estado_nuevo' => 'BACKLOG',
            'nota'         => 'Aprobada fuera de la app y dada de alta aquí.',
            'datos'        => ['marca' => $marca, 'referencia_url' => $url ?: null],
        ]);

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    return fila('SELECT * FROM piezas WHERE id = ?', [$id]);
}

/**
 * Edicion de admin: prioridad, titulo, tipo, y cambio de estado a mano.
 *
 * El cambio de estado NO se escribe aqui directamente: se delega en
 * moverPieza(), que valida contra la maquina de estados y deja el evento. Si
 * este endpoint pudiera escribir `estado` con un UPDATE, seria un agujero por
 * el que se colarian estados imposibles sin historial.
 */
function editarPieza(array $u, int $id, array $d): array
{
    $pieza = fila('SELECT * FROM piezas WHERE id = ?', [$id]);
    if (!$pieza) {
        fallar('Esa pieza no existe.', 404);
    }

    $campos = [];
    $vals   = [];
    $mapa   = [
        'titulo'         => 200,
        'tipo'           => 60,
        'cliente_nombre' => 120,
        'ultimo_punto'   => 2000,
        'siguiente_paso' => 2000,
    ];

    foreach ($mapa as $campo => $max) {
        if (array_key_exists($campo, $d)) {
            $campos[] = "{$campo} = ?";
            $vals[]   = limpiarTexto((string) $d[$campo], $max);
        }
    }
    if (array_key_exists('prioridad', $d)) {
        $campos[] = 'prioridad = ?';
        $vals[]   = (int) $d['prioridad'];
    }
    if (array_key_exists('referencia_url', $d)) {
        $url = trim((string) $d['referencia_url']);
        if ($url !== '' && !filter_var($url, FILTER_VALIDATE_URL)) {
            fallar('Ese enlace de referencia no parece una URL válida.', 422);
        }
        $campos[] = 'referencia_url = ?';
        $vals[]   = $url !== '' ? $url : null;
    }

    bd()->beginTransaction();
    try {
        if ($campos) {
            $campos[] = 'actualizada_en = ?';
            $vals[]   = ahora();
            $vals[]   = $id;
            ejecutar('UPDATE piezas SET ' . implode(', ', $campos) . ' WHERE id = ?', $vals);
            registrarEvento([
                'pieza_id'   => $id,
                'usuario_id' => (int) $u['id'],
                'tipo'       => 'editada',
                'datos'      => array_intersect_key($d, $mapa + ['prioridad' => 0, 'referencia_url' => 0]),
            ]);
        }

        if (!empty($d['estado']) && $d['estado'] !== $pieza['estado']) {
            moverPieza($id, (string) $d['estado'], [
                'usuario_id' => (int) $u['id'],
                'rol'        => $u['rol'],
                'tipo'       => 'cambio_estado',
                'nota'       => limpiarTexto($d['nota'] ?? null),
                'motivo'     => limpiarTexto($d['motivo'] ?? null, 200),
            ]);
        }

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    return fila('SELECT * FROM piezas WHERE id = ?', [$id]);
}

/**
 * El veredicto de una revision.
 *
 * Es el unico camino por el que una pieza llega a TERMINADO, y solo lo puede
 * recorrer un admin. moverPieza() cierra la fila de `revisiones` abierta y le
 * pone el veredicto.
 */
function revisarPieza(array $u, int $id, array $d): array
{
    $veredicto = (string) requerido($d, 'veredicto');
    if (!in_array($veredicto, ['aprobado', 'cambios'], true)) {
        fallar('El veredicto solo puede ser «aprobado» o «cambios».', 422);
    }

    $pieza = fila('SELECT * FROM piezas WHERE id = ?', [$id]);
    if (!$pieza) {
        fallar('Esa pieza no existe.', 404);
    }
    if ($pieza['estado'] !== 'REVISION') {
        fallar('Esa pieza no está esperando revisión.', 409);
    }

    $comentario = limpiarTexto($d['comentario'] ?? null);
    if ($veredicto === 'cambios' && $comentario === null) {
        fallar('Si pides cambios, hace falta decir cuáles.', 422);
    }

    bd()->beginTransaction();
    try {
        // Se escribe el comentario ANTES de mover, porque moverPieza() cierra la
        // revision abierta y despues ya no habria fila que rellenar.
        ejecutar(
            'UPDATE revisiones SET comentario = ? WHERE pieza_id = ? AND resuelta_en IS NULL',
            [$comentario, $id]
        );

        moverPieza($id, $veredicto === 'aprobado' ? 'TERMINADO' : 'CAMBIOS', [
            'usuario_id' => (int) $u['id'],
            'rol'        => $u['rol'],
            'tipo'       => $veredicto === 'aprobado' ? 'aprobada' : 'cambios_pedidos',
            'nota'       => $comentario,
            // Los cambios pedidos son lo siguiente que hay que hacer: se
            // escriben en `siguiente_paso` para que aparezcan en el plan de
            // Fabian sin que nadie los copie a mano.
            'siguiente_paso' => $veredicto === 'cambios' ? $comentario : null,
        ]);

        bd()->commit();
    } catch (Throwable $e) {
        if (bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }

    return fila('SELECT * FROM piezas WHERE id = ?', [$id]);
}
