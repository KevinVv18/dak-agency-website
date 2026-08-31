<?php
/**
 * Respuestas JSON de la API.
 *
 * Todas salen por aqui, para que ninguna se olvide las cabeceras de no-cache y
 * de noindex. Los datos de esta app no deben quedarse en ninguna cache
 * intermedia ni en el indice de nadie.
 */

function responder(array $datos, int $codigo = 200): never
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, must-revalidate');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Error de la API.
 *
 * $mensaje se enseña al usuario tal cual, asi que se escribe en castellano y en
 * lenguaje humano. «No se puede pasar de Por hacer a Terminado» sirve; un
 * «422 Unprocessable Entity» no le dice nada a nadie.
 */
function fallar(string $mensaje, int $codigo = 400, array $extra = []): never
{
    responder(['error' => $mensaje] + $extra, $codigo);
}

/** Lee el cuerpo JSON de la peticion. */
function cuerpo(): array
{
    $crudo = file_get_contents('php://input');
    if ($crudo === false || $crudo === '') {
        return [];
    }
    $datos = json_decode($crudo, true);
    return is_array($datos) ? $datos : [];
}

/** Un campo obligatorio del cuerpo. */
function requerido(array $datos, string $campo): mixed
{
    if (!array_key_exists($campo, $datos) || $datos[$campo] === null || $datos[$campo] === '') {
        fallar("Falta el campo «{$campo}».", 422);
    }
    return $datos[$campo];
}

/**
 * Normaliza texto libre que escribe una persona.
 *
 * Recorta, colapsa espacios y limita longitud. No escapa HTML: eso es trabajo
 * de quien pinta, y hacerlo aqui guardaria `&amp;` dentro de la base de datos,
 * que luego sale mal en el informe que se copia a WhatsApp.
 */
function limpiarTexto(?string $t, int $max = 2000): ?string
{
    if ($t === null) {
        return null;
    }
    $t = trim(preg_replace('/\s+/u', ' ', $t) ?? '');
    if ($t === '') {
        return null;
    }
    return mb_substr($t, 0, $max);
}
