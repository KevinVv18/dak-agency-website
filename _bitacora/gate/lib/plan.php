<?php
/**
 * Plan sugerido y continuidad entre dias.
 *
 * Esto es el producto. Todo lo demas es fontaneria alrededor.
 *
 * Dos principios que no se negocian:
 *
 *  1. El plan es DETERMINISTICO. Mismas entradas, mismo plan, siempre. Nada de
 *     IA decidiendo el orden: la IA aqui limpia texto, no dirige la produccion.
 *     Un plan que cambia de orden sin que haya cambiado nada es un plan en el
 *     que nadie confia.
 *
 *  2. Una tarea NO cambia de estado porque nadie la mencione. Si Fabian no
 *     habla de algo, ese algo sigue exactamente igual y la app pregunta por
 *     ello al dia siguiente. Nunca se cierra sola, nunca se degrada, nunca
 *     desaparece.
 */

require_once __DIR__ . '/bd.php';
require_once __DIR__ . '/estados.php';

/**
 * El orden del plan, en SQL para que sea una sola consulta y reproducible.
 *
 * Criterios, por peso:
 *   1. Cliente urgente primero. La regla operativa del §8: cliente desplaza a
 *      contenido interno. «Urgente» = prioridad 10 o menos.
 *   2. Rango de estado: lo empezado antes que lo no empezado.
 *   3. Prioridad que fijo el admin.
 *   4. Lo tocado mas recientemente, para no romper el hilo mental.
 *   5. Antiguedad, como desempate estable.
 */
const ORDEN_PLAN = "
    CASE WHEN p.marca = 'Cliente' AND p.prioridad <= 10 THEN 0 ELSE 1 END,
    CASE p.estado
      WHEN 'EN_PRODUCCION' THEN 0
      WHEN 'CAMBIOS'       THEN 1
      WHEN 'PROXIMO'       THEN 2
      WHEN 'PAUSADO'       THEN 3
      WHEN 'BACKLOG'       THEN 4
      ELSE 9 END,
    p.prioridad ASC,
    p.actualizada_en DESC,
    p.creada_en ASC,
    p.id ASC
";

/**
 * Genera el plan sugerido: una para continuar y hasta dos para despues.
 *
 * BLOQUEADO y REVISION quedan fuera a proposito. No se sugiere trabajar en algo
 * que no puede avanzar —seria mandar a Fabian contra una pared— ni en algo que
 * esta esperando a otra persona. Siguen siendo visibles en el panel; lo que no
 * hacen es ocupar un hueco del plan.
 */
function generarPlan(int $usuarioId, int $cuantas = 3): array
{
    // El LIMIT va interpolado, no como parametro: con sentencias preparadas
    // reales PDO manda el valor como cadena y MySQL rechaza `LIMIT '3'`. El
    // cast a int es lo que lo hace seguro, y $cuantas nunca viene del cliente.
    $tope = max(1, min(10, $cuantas));

    $candidatas = filas(
        "SELECT p.* FROM piezas p
          WHERE p.asignada_a = ?
            AND p.estado IN ('EN_PRODUCCION','CAMBIOS','PROXIMO','PAUSADO','BACKLOG')
          ORDER BY " . ORDEN_PLAN . "
          LIMIT {$tope}",
        [$usuarioId]
    );

    $plan = [];
    foreach ($candidatas as $i => $p) {
        $plan[] = [
            'pieza'      => $p,
            'orden'      => $i + 1,
            'rol'        => $i === 0 ? 'continuar' : 'despues',
            'nota_plan'  => notaDePlan($p),
        ];
    }
    return $plan;
}

/**
 * El texto que explica POR QUE esta pieza esta aqui.
 *
 * Es lo que convierte una lista en un plan. «Retomar desde la escena 4» dice
 * algo; «Reel complejo #1» no dice nada.
 *
 * La nota se calcula para CUALQUIER posicion, no solo la primera. Estuvo
 * limitada a la primera y se veia el fallo en cuanto habia una pieza pausada
 * mas abajo: el §8 pide que al terminar el trabajo de cliente la app sugiera
 * «retomar X desde donde iba», y una pieza pausada casi nunca llega al primer
 * puesto —el orden pone antes lo que ya esta en marcha—, asi que esa sugerencia
 * no aparecia nunca.
 */
function notaDePlan(array $p): ?string
{
    if ($p['estado'] === 'PAUSADO') {
        $desde = trim((string) $p['ultimo_punto']);
        return $desde !== '' ? "Retomar desde: {$desde}" : 'Retomar donde se dejó';
    }

    if ($p['estado'] === 'CAMBIOS') {
        return 'Tiene cambios pedidos en revisión';
    }

    // EN_PRODUCCION no lleva nota: el «último punto» ya se muestra aparte y
    // repetirlo solo añade ruido a la pantalla que tiene que leerse de un golpe.
    return null;
}

/**
 * ¿Hay algo sin resolver de dias anteriores?
 *
 * Devuelve las jornadas abiertas de dias pasados y las piezas por las que hay
 * que preguntar. Si esto viene con contenido, Fabian NO ve el plan de hoy hasta
 * resolverlo: es el §13 del encargo, y es lo que hace que olvidar un cierre no
 * rompa la continuidad.
 *
 * Que se pregunta —la definicion que faltaba en el encargo—: una pieza entra en
 * la lista si estaba en el plan de una jornada sin cerrar, O si su estado es
 * EN_PRODUCCION o CAMBIOS. Nada mas. Preguntar tambien por los doce items del
 * backlog convertiria el cierre de dos minutos en un interrogatorio, y la
 * herramienta se dejaria de usar en una semana.
 */
function pendientesDeReconciliar(int $usuarioId): array
{
    $jornadasAbiertas = filas(
        "SELECT * FROM jornadas
          WHERE usuario_id = ? AND estado = 'abierta' AND fecha < ?
          ORDER BY fecha ASC",
        [$usuarioId, hoy()]
    );

    if (!$jornadasAbiertas) {
        return ['jornadas' => [], 'piezas' => []];
    }

    $ids = array_column($jornadasAbiertas, 'id');
    $hue = implode(',', array_fill(0, count($ids), '?'));

    // Union de dos conjuntos: lo que estaba planificado en esos dias y lo que
    // sigue abierto hoy aunque no estuviera en ningun plan. El segundo conjunto
    // importa porque una pieza puede haber entrado en produccion sin pasar por
    // un plan (la creo el admin y Fabian se puso con ella).
    $piezas = filas(
        "SELECT DISTINCT p.* FROM piezas p
          WHERE p.asignada_a = ?
            AND (
              p.id IN (SELECT jp.pieza_id FROM jornada_piezas jp
                        WHERE jp.jornada_id IN ({$hue}) AND jp.desenlace IS NULL)
              OR p.estado IN ('EN_PRODUCCION','CAMBIOS')
            )
          ORDER BY " . ORDEN_PLAN,
        array_merge([$usuarioId], $ids)
    );

    return ['jornadas' => $jornadasAbiertas, 'piezas' => $piezas];
}

/**
 * Estado de la cola de produccion.
 *
 * Accionable = lo que Fabian podria empezar sin que nadie haga nada antes.
 * Cuando esto baja del umbral, toca otra ronda de referencias con la socia
 * (§18). El umbral es configurable porque el ritmo real de DAK lo dira mejor
 * que un numero elegido hoy.
 */
function estadoDeLaCola(): array
{
    $umbral = (int) ajuste('umbral_cola', '3');
    $n = (int) (fila(
        "SELECT COUNT(*) AS n FROM piezas WHERE estado IN ('BACKLOG','PROXIMO')"
    )['n'] ?? 0);

    return [
        'accionables' => $n,
        'umbral'      => $umbral,
        'baja'        => $n <= $umbral,
    ];
}
