<?php
/**
 * Conexion a MySQL.
 *
 * Una sola conexion por peticion, en modo excepcion. Sin ORM y sin capa de
 * abstraccion: son ocho tablas y las consultas se leen mejor en SQL plano que
 * envueltas en un constructor de queries.
 */

require_once __DIR__ . '/entorno.php';

function bd(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host   = secreto('DB_HOST', 'localhost');
    $nombre = secreto('DB_NAME');
    $user   = secreto('DB_USER');
    $pass   = secreto('DB_PASS');

    if (!$nombre || !$user) {
        throw new RuntimeException('Faltan las credenciales de base de datos en ' . RUTA_SECRETOS);
    }

    $pdo = new PDO(
        "mysql:host={$host};dbname={$nombre};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Sentencias preparadas de verdad, no emuladas: es lo que hace que
            // un parametro no pueda convertirse nunca en SQL.
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    // La conexion habla en hora de Lima. Asi NOW() dentro de una consulta y
    // ahora() dentro de PHP dan lo mismo, y no hay forma de mezclar husos por
    // descuido. -05:00 en vez de un nombre de zona porque las tablas de zonas
    // horarias de MySQL no siempre estan cargadas en hosting compartido.
    $pdo->exec("SET time_zone = '-05:00'");

    return $pdo;
}

/** Atajo: ejecuta y devuelve todas las filas. */
function filas(string $sql, array $params = []): array
{
    $st = bd()->prepare($sql);
    $st->execute($params);
    return $st->fetchAll();
}

/** Atajo: ejecuta y devuelve la primera fila, o null. */
function fila(string $sql, array $params = []): ?array
{
    $st = bd()->prepare($sql);
    $st->execute($params);
    $r = $st->fetch();
    return $r === false ? null : $r;
}

/** Atajo: ejecuta una escritura y devuelve el numero de filas afectadas. */
function ejecutar(string $sql, array $params = []): int
{
    $st = bd()->prepare($sql);
    $st->execute($params);
    return $st->rowCount();
}

/** Lee un ajuste de la tabla `ajustes`. */
function ajuste(string $clave, string $porDefecto = ''): string
{
    $r = fila('SELECT valor FROM ajustes WHERE clave = ?', [$clave]);
    return $r['valor'] ?? $porDefecto;
}
