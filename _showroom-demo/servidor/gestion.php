<?php
/*
 * Gestión de accesos del showroom (se ejecuta por SSH, fuera del sitio).
 * Vive en ~/secretos/edificios/ junto a config.php y accesos.log.
 *
 *   php gestion.php iniciar "<clave de presentación>"
 *   php gestion.php nuevo "Inmobiliaria X" [días=7]
 *   php gestion.php lista
 *   php gestion.php revocar <código>
 *   php gestion.php clave "<nueva clave>"
 */
declare(strict_types=1);

const DOMINIO = 'https://edificios.dakagency.net/';
$dir = __DIR__;
$archivo = "$dir/config.php";

function guardar(string $archivo, array $conf): void
{
    $php = "<?php\n// Generado por gestion.php. No subir a ningún repositorio.\nreturn " . var_export($conf, true) . ";\n";
    file_put_contents($archivo, $php, LOCK_EX);
    chmod($archivo, 0600);
}

function cargar(string $archivo): array
{
    if (!is_file($archivo)) {
        fwrite(STDERR, "Falta config.php: corre primero  php gestion.php iniciar \"<clave>\"\n");
        exit(1);
    }
    return require $archivo;
}

function vence(array $inv): int
{
    return strtotime($inv['creado'] . ' 23:59:59') + 86400 * (int)($inv['dias'] ?? 7);
}

$cmd = $argv[1] ?? 'ayuda';
switch ($cmd) {
    case 'iniciar':
        if (is_file($archivo)) { fwrite(STDERR, "config.php ya existe; usa  clave  para cambiar la clave.\n"); exit(1); }
        $clave = $argv[2] ?? '';
        if (strlen($clave) < 6) { fwrite(STDERR, "La clave debe tener al menos 6 caracteres.\n"); exit(1); }
        guardar($archivo, [
            'secreto' => bin2hex(random_bytes(32)),
            'clave_hash' => password_hash($clave, PASSWORD_DEFAULT),
            'whatsapp' => '51906765040',
            'invitaciones' => [],
        ]);
        echo "Listo. Configuración creada.\n";
        break;

    case 'nuevo':
        $conf = cargar($archivo);
        $nombre = trim($argv[2] ?? '');
        $dias = max(1, (int)($argv[3] ?? 7));
        if ($nombre === '') { fwrite(STDERR, "Falta el nombre del prospecto.\n"); exit(1); }
        $base = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $nombre))), '-');
        $codigo = substr($base, 0, 24) . '-' . substr(bin2hex(random_bytes(3)), 0, 5);
        $conf['invitaciones'][$codigo] = ['nombre' => $nombre, 'creado' => date('Y-m-d'), 'dias' => $dias];
        guardar($archivo, $conf);
        echo "Invitación para $nombre (vence " . date('d/m/Y', vence($conf['invitaciones'][$codigo])) . "):\n";
        echo DOMINIO . "?acceso=$codigo\n";
        break;

    case 'lista':
        $conf = cargar($archivo);
        $visitas = [];
        $ultima = [];
        if (is_file("$dir/accesos.log")) {
            foreach (file("$dir/accesos.log", FILE_IGNORE_NEW_LINES) as $l) {
                $e = json_decode($l, true);
                if (!$e) continue;
                if ($e['evento'] === 'visita' || $e['evento'] === 'entrada') {
                    $visitas[$e['quien']] = ($visitas[$e['quien']] ?? 0) + ($e['evento'] === 'visita' ? 1 : 0);
                    $ultima[$e['quien']] = $e['fecha'];
                }
            }
        }
        foreach ($conf['invitaciones'] as $codigo => $inv) {
            $q = "inv:$codigo";
            $estado = vence($inv) > time() ? 'vigente hasta ' . date('d/m', vence($inv)) : 'VENCIDA';
            printf("%-34s %-26s %-22s páginas vistas: %3d  última: %s\n", $codigo, $inv['nombre'], $estado,
                $visitas[$q] ?? 0, isset($ultima[$q]) ? date('d/m H:i', strtotime($ultima[$q])) : '—');
        }
        printf("%-34s %-26s %-22s páginas vistas: %3d\n", '(clave)', 'Reuniones', '', $visitas['clave'] ?? 0);
        break;

    case 'revocar':
        $conf = cargar($archivo);
        $codigo = $argv[2] ?? '';
        if (!isset($conf['invitaciones'][$codigo])) { fwrite(STDERR, "No existe la invitación $codigo\n"); exit(1); }
        unset($conf['invitaciones'][$codigo]);
        guardar($archivo, $conf);
        echo "Revocada: $codigo (los pases que ya dio dejan de valer).\n";
        break;

    case 'clave':
        $conf = cargar($archivo);
        $clave = $argv[2] ?? '';
        if (strlen($clave) < 6) { fwrite(STDERR, "La clave debe tener al menos 6 caracteres.\n"); exit(1); }
        $conf['clave_hash'] = password_hash($clave, PASSWORD_DEFAULT);
        guardar($archivo, $conf);
        echo "Clave de presentación cambiada.\n";
        break;

    default:
        echo "Uso: php gestion.php iniciar|nuevo|lista|revocar|clave ...\n";
}
