#!/usr/bin/env bash
#
# Ejecuta la prueba de continuidad en el servidor.
#
# La prueba NO se despliega con la aplicacion, y es deliberado: escribe en la
# base y no tiene por que vivir en un docroot, ni siquiera detras del muro. Asi
# que este script la sube a /tmp, la ejecuta contra el `lib/` que hay publicado
# —el mismo codigo que sirve la API, no una copia— y borra los restos.
#
# Necesita `sql/` ademas de `pruebas/` porque el test se siembra a si mismo.
#
#   ./pruebas/ejecutar.sh
#
set -euo pipefail

SERVIDOR=${BITACORA_SSH:-"u567580447@89.116.115.11"}
PUERTO=${BITACORA_PUERTO:-65002}
CLAVE=${BITACORA_CLAVE:-"$HOME/.ssh/id_ed25519"}
DOCROOT=/home/u567580447/domains/dakagency.net/public_html/bitacora

cd "$(dirname "$0")/.."

SSH=(ssh -o BatchMode=yes -i "$CLAVE" -p "$PUERTO" "$SERVIDOR")

echo "Subiendo la prueba…"
tar czf - pruebas sql | "${SSH[@]}" 'rm -rf /tmp/bitacora-pruebas && mkdir -p /tmp/bitacora-pruebas && tar xzf - -C /tmp/bitacora-pruebas'

echo "Ejecutando contra $DOCROOT/lib …"
set +e
"${SSH[@]}" "BITACORA_DIR=$DOCROOT /opt/alt/php83/usr/bin/php /tmp/bitacora-pruebas/pruebas/continuidad.php"
codigo=$?
set -e

"${SSH[@]}" 'rm -rf /tmp/bitacora-pruebas'
exit $codigo
