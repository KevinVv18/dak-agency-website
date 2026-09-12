<?php
/**
 * El unico camino de escritura de estado.
 *
 * Regla estructural de la aplicacion: NADA muta `piezas` sin escribir su fila
 * en `eventos` dentro de la misma transaccion. No hay UPDATE de estado suelto
 * en ningun otro archivo, y no debe haberlo.
 *
 * El motivo no es purismo. El §16 del encargo pide historial de cada cambio, y
 * un historial que se escribe «tambien, cuando toca» acaba con huecos justo en
 * los cambios raros, que son los unicos que alguien va a querer investigar. Si
 * el unico camino para cambiar un estado es el que escribe el evento, el
 * historial no puede quedar incompleto.
 */

require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/estados.php';

class ErrorDeTransicion extends RuntimeException {}

/**
 * Escribe un evento. Append puro: aqui nunca se hace UPDATE ni DELETE.
 */
function registrarEvento(array $e): int
{
    ejecutar(
        'INSERT INTO eventos
           (pieza_id, jornada_id, usuario_id, tipo, estado_anterior, estado_nuevo, nota, datos_json, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            $e['pieza_id']        ?? null,
            $e['jornada_id']      ?? null,
            $e['usuario_id']      ?? null,
            $e['tipo'],
            $e['estado_anterior'] ?? null,
            $e['estado_nuevo']    ?? null,
            $e['nota']            ?? null,
            isset($e['datos']) ? json_encode($e['datos'], JSON_UNESCAPED_UNICODE) : null,
            ahora(),
        ]
    );
    return (int) bd()->lastInsertId();
}

/**
 * Mueve una pieza de estado, con todo lo que eso arrastra.
 *
 * $opciones admite: usuario_id, rol, tipo, nota, ultimo_punto, siguiente_paso,
 * motivo, tipo_bloqueo, jornada_id, datos.
 *
 * Pasar $hacia igual al estado actual es valido y util: es lo que ocurre cuando
 * Fabian dice «continúo» sobre algo que ya estaba en produccion. Se actualizan
 * las notas y se deja el evento, pero no se toca el estado.
 *
 * @throws ErrorDeTransicion si el salto no lo permite la maquina de estados.
 */
function moverPieza(int $piezaId, string $hacia, array $opciones = []): array
{
    $rol       = $opciones['rol'] ?? 'audiovisual';
    $usuarioId = $opciones['usuario_id'] ?? null;

    $propia = !bd()->inTransaction();
    if ($propia) {
        bd()->beginTransaction();
    }

    try {
        // FOR UPDATE: si el admin cambia la prioridad mientras Fabian cierra su
        // jornada, uno de los dos espera al otro en vez de pisarlo a ciegas.
        $pieza = fila('SELECT * FROM piezas WHERE id = ? FOR UPDATE', [$piezaId]);
        if (!$pieza) {
            throw new ErrorDeTransicion("La pieza {$piezaId} no existe.");
        }

        $desde = $pieza['estado'];
        if ($motivo = motivoTransicionInvalida($desde, $hacia, $rol)) {
            throw new ErrorDeTransicion($motivo);
        }

        $campos = ['estado = ?', 'actualizada_en = ?'];
        $vals   = [$hacia, ahora()];

        // Las notas solo se sobrescriben si vienen. Un cierre en el que Fabian
        // pulsa «sin cambios» no debe borrar el ultimo punto que ya habia.
        if (array_key_exists('ultimo_punto', $opciones) && $opciones['ultimo_punto'] !== null) {
            $campos[] = 'ultimo_punto = ?';
            $vals[]   = $opciones['ultimo_punto'];
        }
        if (array_key_exists('siguiente_paso', $opciones) && $opciones['siguiente_paso'] !== null) {
            $campos[] = 'siguiente_paso = ?';
            $vals[]   = $opciones['siguiente_paso'];
        }

        // Al salir de produccion hacia una parada, se recuerda de donde venia
        // para poder devolverla exactamente ahi al reanudar.
        if (in_array($hacia, ['PAUSADO', 'BLOQUEADO'], true) && !in_array($desde, ['PAUSADO', 'BLOQUEADO'], true)) {
            $campos[] = 'estado_previo = ?';
            $vals[]   = $desde;
        }

        if ($hacia === 'PAUSADO') {
            $campos[] = 'motivo_pausa = ?';
            $vals[]   = $opciones['motivo'] ?? null;
        }
        if ($hacia === 'BLOQUEADO') {
            $campos[] = 'motivo_bloqueo = ?';
            $vals[]   = $opciones['motivo'] ?? null;
        }

        // Al reanudar se limpia el motivo: dejarlo puesto haria que el panel
        // siguiera enseñando «pausado por prioridad cliente» sobre algo que ya
        // esta corriendo otra vez.
        if ($desde === 'PAUSADO' && $hacia !== 'PAUSADO') {
            $campos[] = 'motivo_pausa = NULL';
        }
        if ($desde === 'BLOQUEADO' && $hacia !== 'BLOQUEADO') {
            $campos[] = 'motivo_bloqueo = NULL';
            $campos[] = 'estado_previo = NULL';
            ejecutar(
                'UPDATE bloqueos SET resuelto_en = ? WHERE pieza_id = ? AND resuelto_en IS NULL',
                [ahora(), $piezaId]
            );
        }

        if ($hacia === 'EN_PRODUCCION' && $pieza['iniciada_en'] === null) {
            $campos[] = 'iniciada_en = ?';
            $vals[]   = ahora();
        }
        if ($hacia === 'TERMINADO') {
            $campos[] = 'terminada_en = ?';
            $vals[]   = ahora();
        }

        $vals[] = $piezaId;
        ejecutar('UPDATE piezas SET ' . implode(', ', $campos) . ' WHERE id = ?', $vals);

        // Entrar en revision abre el reloj que hace visible lo que espera a los
        // jefes. Salir de revision lo cierra.
        if ($hacia === 'REVISION' && $desde !== 'REVISION') {
            ejecutar('INSERT INTO revisiones (pieza_id, creada_en) VALUES (?, ?)', [$piezaId, ahora()]);
        }
        if ($desde === 'REVISION' && $hacia !== 'REVISION') {
            ejecutar(
                'UPDATE revisiones
                    SET resuelta_en = ?, revisor_id = COALESCE(revisor_id, ?), veredicto = COALESCE(veredicto, ?)
                  WHERE pieza_id = ? AND resuelta_en IS NULL',
                [ahora(), $usuarioId, $hacia === 'TERMINADO' ? 'aprobado' : 'cambios', $piezaId]
            );
        }

        if ($hacia === 'BLOQUEADO' && $desde !== 'BLOQUEADO') {
            ejecutar(
                'INSERT INTO bloqueos (pieza_id, jornada_id, tipo, detalle, abierto_en) VALUES (?, ?, ?, ?, ?)',
                [
                    $piezaId,
                    $opciones['jornada_id'] ?? null,
                    $opciones['tipo_bloqueo'] ?? 'otro',
                    $opciones['motivo'] ?? null,
                    ahora(),
                ]
            );
        }

        registrarEvento([
            'pieza_id'        => $piezaId,
            'jornada_id'      => $opciones['jornada_id'] ?? null,
            'usuario_id'      => $usuarioId,
            'tipo'            => $opciones['tipo'] ?? 'cambio_estado',
            'estado_anterior' => $desde,
            'estado_nuevo'    => $hacia,
            'nota'            => $opciones['nota'] ?? null,
            'datos'           => $opciones['datos'] ?? null,
        ]);

        $actualizada = fila('SELECT * FROM piezas WHERE id = ?', [$piezaId]);

        if ($propia) {
            bd()->commit();
        }
        return $actualizada;
    } catch (Throwable $e) {
        if ($propia && bd()->inTransaction()) {
            bd()->rollBack();
        }
        throw $e;
    }
}
