#!/bin/bash
# ============================================================
#  DAK Agency — Hostinger Post-Build Script
#  Copies WordPress from external dir into dist/blog/ so
#  Hostinger's auto-deploy includes it in public_html.
#
#  NOTE: Hostinger LiteSpeed does NOT follow symlinks, so we
#  must physically copy WordPress files into dist/blog/.
# ============================================================

set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  DAK Agency — Post-Build Deploy"
echo "═══════════════════════════════════════════"

WP_EXTERNAL="/home/u567580447/wordpress_blog"
PUBLIC_HTML="/home/u567580447/domains/dakagency.net/public_html"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Copy WordPress into dist/blog/ ──
# Priority: external dir > current public_html/blog
rm -rf dist/blog

if [ -d "$WP_EXTERNAL" ]; then
    echo "[*] Copying WordPress from $WP_EXTERNAL ..."
    cp -a "$WP_EXTERNAL" dist/blog
    echo "[OK] WordPress copied from external dir ($(du -sh dist/blog/ | cut -f1))"
elif [ -d "$PUBLIC_HTML/blog" ] && [ -f "$PUBLIC_HTML/blog/wp-login.php" ]; then
    echo "[*] External dir not found, copying from public_html/blog ..."
    cp -a "$PUBLIC_HTML/blog" dist/blog
    echo "[OK] WordPress copied from public_html/blog ($(du -sh dist/blog/ | cut -f1))"
else
    echo "[WARN] No WordPress installation found anywhere!"
    echo "[WARN] Blog will NOT be available at /blog/"
fi

# ── Update WordPress theme from repo ──
THEME_SRC="$SCRIPT_DIR/../wordpress-theme/dak-informando"

if [ -d "$THEME_SRC" ] && [ -d "dist/blog/wp-content/themes" ]; then
    THEME_DST="dist/blog/wp-content/themes/dak-informando"
    rm -rf "$THEME_DST"
    cp -r "$THEME_SRC" "$THEME_DST"
    echo "[OK] Theme dak-informando deployed"

    # Also update the external copy so it stays in sync
    if [ -d "$WP_EXTERNAL/wp-content/themes" ]; then
        rm -rf "$WP_EXTERNAL/wp-content/themes/dak-informando"
        cp -r "$THEME_SRC" "$WP_EXTERNAL/wp-content/themes/dak-informando"
        echo "[OK] Theme also updated in external dir"
    fi
fi

# ── Sync back: keep external dir up to date ──
# After deploy, save a fresh copy externally so next deploy has it
if [ -d "dist/blog" ] && [ -f "dist/blog/wp-login.php" ]; then
    mkdir -p "$WP_EXTERNAL"
    rsync -a --delete \
        --exclude='wp-content/uploads/' \
        --exclude='wp-content/debug.log' \
        --exclude='wp-config.php' \
        dist/blog/ "$WP_EXTERNAL/"
    echo "[OK] External backup synced (excluding uploads, wp-config, debug.log)"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  Post-Build Complete"
echo "═══════════════════════════════════════════"
echo ""
