#!/bin/bash
# ============================================================
#  DAK Agency — Hostinger Post-Build Script
#
#  Flow:
#    1. SAVE: sync live public_html/blog → wordpress_blog/
#       (preserves plugins, uploads, settings, everything)
#    2. COPY: wordpress_blog/ → dist/blog/
#       (so Hostinger includes it in the new public_html)
#    3. THEME: update dak-informando from repo
#
#  This way plugins, uploads, and wp-config NEVER get lost.
# ============================================================

set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  DAK Agency — Post-Build Deploy"
echo "═══════════════════════════════════════════"

WP_EXTERNAL="/home/u567580447/wordpress_blog"
PUBLIC_HTML="/home/u567580447/domains/dakagency.net/public_html"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Step 1: SAVE live WordPress to external dir ──
# This captures any plugins, uploads, settings installed via wp-admin
if [ -d "$PUBLIC_HTML/blog" ] && [ -f "$PUBLIC_HTML/blog/wp-login.php" ]; then
    echo "[*] Saving live WordPress from public_html/blog ..."
    mkdir -p "$WP_EXTERNAL"
    rsync -a \
        --exclude='.builds' \
        --exclude='debug.log' \
        "$PUBLIC_HTML/blog/" "$WP_EXTERNAL/"
    echo "[OK] Live WordPress saved to $WP_EXTERNAL ($(du -sh "$WP_EXTERNAL" | cut -f1))"
else
    echo "[INFO] No live WordPress in public_html/blog (first deploy or manual setup)"
fi

# ── Step 2: COPY external dir into dist/blog/ ──
rm -rf dist/blog

if [ -d "$WP_EXTERNAL" ] && [ -f "$WP_EXTERNAL/wp-login.php" ]; then
    echo "[*] Copying WordPress into dist/blog/ ..."
    cp -a "$WP_EXTERNAL" dist/blog
    echo "[OK] WordPress ready in dist/blog/ ($(du -sh dist/blog/ | cut -f1))"
else
    echo "[WARN] No WordPress found! Blog will NOT be available."
    echo "[WARN] Install WordPress manually in $WP_EXTERNAL first."
fi

# ── Step 3: Update theme from repo ──
THEME_SRC="$SCRIPT_DIR/../wordpress-theme/dak-informando"

if [ -d "$THEME_SRC" ] && [ -d "dist/blog/wp-content/themes" ]; then
    rm -rf "dist/blog/wp-content/themes/dak-informando"
    cp -r "$THEME_SRC" "dist/blog/wp-content/themes/dak-informando"
    echo "[OK] Theme dak-informando updated from repo"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  Post-Build Complete"
echo "═══════════════════════════════════════════"
echo ""
