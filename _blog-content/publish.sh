#!/usr/bin/env bash
# ============================================================
#  DAK Agency — Auto-publicador de blog (SSH + WP-CLI)
#
#  Toma el SIGUIENTE post en la cola (_blog-content/queue/*.json,
#  ordenado por nombre) y lo crea en WordPress vía WP-CLI por SSH.
#  Publica UNO por corrida (= "drip"). Idempotente por slug.
#
#  Uso local:
#     bash _blog-content/publish.sh                 # publica en vivo
#     POST_STATUS=draft bash _blog-content/publish.sh   # crea como borrador (prueba)
#
#  En GitHub Actions lo invoca .github/workflows/blog-autopublish.yml
# ============================================================
set -euo pipefail

SSH_HOST="${SSH_HOST:-89.116.115.11}"
SSH_PORT="${SSH_PORT:-65002}"
SSH_USER="${SSH_USER:-u567580447}"
WP_PATH="${WP_PATH:-/home/u567580447/domains/dakagency.net/public_html/blog}"
POST_STATUS="${POST_STATUS:-publish}"   # publish | draft | future

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUEUE_DIR="$SCRIPT_DIR/queue"
PUBLISHED_DIR="$SCRIPT_DIR/published"
PHP_LIB="$SCRIPT_DIR/lib/wp-create-post.php"
REMOTE_TMP="/tmp/dak-autopost"

SSH_OPTS="-o BatchMode=yes -o ConnectTimeout=30 -o ConnectionAttempts=4 -o ServerAliveInterval=15 -o ServerAliveCountMax=4 -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR"
SSH="ssh $SSH_OPTS -p $SSH_PORT $SSH_USER@$SSH_HOST"
SCP="scp $SSH_OPTS -P $SSH_PORT"

mkdir -p "$PUBLISHED_DIR"

# ── Sube el runner PHP una sola vez ──
$SSH "mkdir -p $REMOTE_TMP"
$SCP "$PHP_LIB" "$SSH_USER@$SSH_HOST:$REMOTE_TMP/wp-create-post.php" >/dev/null

shopt -s nullglob
queue_files=( "$QUEUE_DIR"/*.json )
if [ ${#queue_files[@]} -eq 0 ]; then
	echo "[INFO] Cola vacía. Nada que publicar."
	exit 0
fi

for f in "${queue_files[@]}"; do
	base="$(basename "$f")"
	base_noext="${base%.json}"
	echo "[*] Procesando: $base"
	$SCP "$f" "$SSH_USER@$SSH_HOST:$REMOTE_TMP/post.json" >/dev/null

	# Imagen destacada opcional: _blog-content/assets/<base_noext>.<ext>
	remote_img=""
	for ext in webp jpg jpeg png; do
		local_img="$SCRIPT_DIR/assets/$base_noext.$ext"
		if [ -f "$local_img" ]; then
			$SCP "$local_img" "$SSH_USER@$SSH_HOST:$REMOTE_TMP/featured.$ext" >/dev/null
			remote_img="$REMOTE_TMP/featured.$ext"
			echo "    [img] imagen destacada: assets/$base_noext.$ext"
			break
		fi
	done

	out="$($SSH "cd $WP_PATH && wp eval-file $REMOTE_TMP/wp-create-post.php $REMOTE_TMP/post.json $POST_STATUS $remote_img 2>&1")"

	if echo "$out" | grep -q '^CREATED'; then
		echo "[OK] $out"
		mv "$f" "$PUBLISHED_DIR/$base"
		echo "$out" > "$PUBLISHED_DIR/${base%.json}.result.txt"
		echo "[DONE] 1 post publicado ($POST_STATUS). Cola: $(( ${#queue_files[@]} - 1 )) restantes (incl. ya-existentes)."
		exit 0
	elif echo "$out" | grep -q '^EXISTS'; then
		echo "[SKIP] Ya existe en el blog → muevo a published/ sin recrear. ($out)"
		mv "$f" "$PUBLISHED_DIR/$base"
		# continúa con el siguiente archivo de la cola
	else
		echo "[ERROR] Falló la creación de $base:"
		echo "$out"
		exit 1
	fi
done

echo "[INFO] Todos los posts de la cola ya existían en el blog. Nada nuevo publicado."
