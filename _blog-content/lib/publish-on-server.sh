#!/usr/bin/env bash
# ============================================================
#  DAK Agency — Publicador que corre EN EL SERVIDOR (Hostinger)
#
#  Lo invoca el cron de GitHub Actions vía appleboy/ssh-action.
#  El contenido (_blog-content/) se sube antes a un dir de staging
#  con rsync (burnett01). Este script publica el SIGUIENTE post de
#  la cola que aún NO exista en el blog (idempotente por slug) y se
#  detiene (1 por corrida = drip). No necesita commit-back.
#
#  Uso:  bash publish-on-server.sh <STAGE_DIR>
#        POST_STATUS=publish|draft|future (env, def. publish)
# ============================================================
set -euo pipefail

STAGE="${1:-$HOME/dak-autopost}"
WP_PATH="/home/u567580447/domains/dakagency.net/public_html/blog"
PHP_LIB="$STAGE/lib/wp-create-post.php"
STATUS="${POST_STATUS:-publish}"
# Ruta completa de wp: en el entorno de cron el PATH suele venir vacío.
WP="$(command -v wp 2>/dev/null || echo /usr/local/bin/wp)"

cd "$WP_PATH"
echo "[*] Blog: $("$WP" option get blogname 2>/dev/null || echo '??') | posts publicados: $("$WP" post list --post_type=post --post_status=publish --format=count 2>/dev/null || echo '??')"

if [ ! -f "$PHP_LIB" ]; then
	echo "[ERROR] No se encontró el runner PHP en $PHP_LIB (¿falló el rsync?)."
	exit 1
fi

shopt -s nullglob
files=( "$STAGE"/queue/*.json )
if [ ${#files[@]} -eq 0 ]; then
	echo "[INFO] Cola vacía. Nada que publicar."
	exit 0
fi

for f in "${files[@]}"; do
	base="$(basename "$f" .json)"
	img=""
	for ext in webp jpg jpeg png; do
		if [ -f "$STAGE/assets/$base.$ext" ]; then img="$STAGE/assets/$base.$ext"; break; fi
	done
	echo "[*] Intentando: $base ${img:+(con imagen)}"
	out="$("$WP" eval-file "$PHP_LIB" "$f" "$STATUS" $img 2>&1)"
	echo "$out"
	if echo "$out" | grep -q '^CREATED'; then
		echo "[DONE] Publicado ($STATUS): $base"
		exit 0
	elif echo "$out" | grep -q '^EXISTS'; then
		continue
	else
		echo "[ERROR] Falló la creación de $base"
		exit 1
	fi
done

echo "[INFO] Todos los posts de la cola ya existían en el blog. Nada nuevo."
