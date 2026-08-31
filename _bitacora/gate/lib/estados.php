<?php
/**
 * La maquina de estados de una pieza.
 *
 * Este es el unico sitio del sistema donde se decide si un cambio de estado es
 * legal. Ni la interfaz, ni el admin, ni la IA pueden producir un estado
 * imposible, porque todos pasan por aqui.
 *
 * La decision de producto que hace cumplir este archivo:
 *
 *   FABIAN NUNCA CIERRA NADA.
 *
 * Su boton «Terminé mi parte» lleva la pieza a REVISION. Solo un admin —o la
 * socia, que usa el mismo rol— la mueve a TERMINADO aprobandola. El encargo
 * definia TERMINADO como «trabajo aprobado y cerrado» y a la vez le daba el
 * boton a Fabian; asi se resuelve la contradiccion, y ademas hace que la cola
 * de revision pendiente sea visible en el dashboard en vez de evaporarse.
 */

const ESTADOS = [
    'BACKLOG', 'PROXIMO', 'EN_PRODUCCION', 'REVISION',
    'CAMBIOS', 'PAUSADO', 'BLOQUEADO', 'TERMINADO',
];

/** Etiquetas humanas. La interfaz nunca enseña el nombre en mayusculas. */
const ETIQUETAS = [
    'BACKLOG'       => 'Por hacer',
    'PROXIMO'       => 'Próximo',
    'EN_PRODUCCION' => 'En producción',
    'REVISION'      => 'En revisión',
    'CAMBIOS'       => 'Con cambios',
    'PAUSADO'       => 'Pausado',
    'BLOQUEADO'     => 'Bloqueado',
    'TERMINADO'     => 'Terminado',
];

const TRANSICIONES = [
    'BACKLOG'       => ['PROXIMO', 'EN_PRODUCCION', 'PAUSADO', 'BLOQUEADO'],
    'PROXIMO'       => ['EN_PRODUCCION', 'BACKLOG', 'PAUSADO', 'BLOQUEADO'],
    'EN_PRODUCCION' => ['REVISION', 'PAUSADO', 'BLOQUEADO', 'PROXIMO'],
    'REVISION'      => ['CAMBIOS', 'TERMINADO', 'BLOQUEADO'],
    'CAMBIOS'       => ['EN_PRODUCCION', 'REVISION', 'PAUSADO', 'BLOQUEADO'],
    'PAUSADO'       => ['EN_PRODUCCION', 'PROXIMO', 'BLOQUEADO'],
    // Desbloquear devuelve la pieza a donde estaba. Por eso `piezas` guarda
    // estado_previo: sin ese dato habria que adivinar, y adivinar es justo lo
    // que esta aplicacion no hace en ningun sitio.
    'BLOQUEADO'     => ['EN_PRODUCCION', 'PROXIMO', 'PAUSADO', 'CAMBIOS', 'BACKLOG'],
    // Reabrir algo ya aprobado es excepcional, pero pasa. Queda su evento.
    'TERMINADO'     => ['EN_PRODUCCION', 'CAMBIOS'],
];

/**
 * Transiciones que exigen rol admin.
 *
 * Cerrar una pieza y reabrirla son actos de aprobacion, no de produccion.
 */
const SOLO_ADMIN = [
    'REVISION:TERMINADO',
    'TERMINADO:EN_PRODUCCION',
    'TERMINADO:CAMBIOS',
];

/**
 * ¿Se puede pasar de $desde a $hacia con el rol $rol?
 *
 * Devuelve null si se puede, o el motivo en castellano si no. Se devuelve el
 * motivo y no un booleano porque ese texto acaba en la respuesta de la API y
 * en el log: un 422 que no dice por que es un 422 que se depura a ciegas.
 */
function motivoTransicionInvalida(string $desde, string $hacia, string $rol): ?string
{
    if (!in_array($hacia, ESTADOS, true)) {
        return "«{$hacia}» no es un estado válido.";
    }

    // Reafirmar el mismo estado es legal y no hace nada: pasa cada vez que
    // Fabian dice «continúo» sobre una pieza que ya estaba en produccion.
    if ($desde === $hacia) {
        return null;
    }

    if (!in_array($hacia, TRANSICIONES[$desde] ?? [], true)) {
        $de = ETIQUETAS[$desde] ?? $desde;
        $a  = ETIQUETAS[$hacia] ?? $hacia;
        return "No se puede pasar de «{$de}» a «{$a}».";
    }

    if (in_array("{$desde}:{$hacia}", SOLO_ADMIN, true) && $rol !== 'admin') {
        if ($hacia === 'TERMINADO') {
            return 'Solo un administrador puede dar una pieza por terminada. '
                 . 'Envíala a revisión y se cierra al aprobarla.';
        }
        return 'Solo un administrador puede reabrir una pieza terminada.';
    }

    return null;
}

/**
 * El estado al que lleva cada desenlace del cierre.
 *
 * `no_trabaje` no aparece: es el unico desenlace que NO cambia el estado, y esa
 * es la regla de continuidad del §5 del encargo. Si Fabian no trabajo algo, la
 * pieza se queda exactamente como estaba. No se penaliza, no se degrada, no
 * desaparece.
 */
function estadoSegunDesenlace(string $desenlace, string $estadoActual): string
{
    return match ($desenlace) {
        'termine'    => 'REVISION',
        'continuo'   => $estadoActual === 'CAMBIOS' ? 'CAMBIOS' : 'EN_PRODUCCION',
        'pause'      => 'PAUSADO',
        'bloqueado'  => 'BLOQUEADO',
        'no_trabaje' => $estadoActual,
        default      => $estadoActual,
    };
}
