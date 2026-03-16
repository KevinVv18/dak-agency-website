#!/bin/bash
# ============================================================
#  DAK Agency — Hostinger Deployment Script
#  Builds main site (Vite) + sets up WordPress at /blog
# ============================================================

echo ""
echo "═══════════════════════════════════════════"
echo "  DAK Agency — Deploy"
echo "═══════════════════════════════════════════"

# ── Step 1: Build main React site ──
echo ""
echo "🔨 Building main site (Vite)..."
npm install
npm run build

# ── Step 2: Deploy main site WITHOUT overwriting /blog ──
echo ""
echo "📁 Deploying main site to public_html..."
# Use rsync to skip the blog directory (WordPress lives there)
if command -v rsync &> /dev/null; then
    rsync -av --exclude='blog' dist/ /home/u567580447/public_html/
else
    # Fallback: copy files manually, preserving blog dir
    find dist/ -maxdepth 1 -not -name 'blog' -not -name 'dist' -exec cp -r {} /home/u567580447/public_html/ \;
fi
echo "✅ Main site deployed"

# ── Step 3: Setup WordPress + update theme ──
echo ""
bash scripts/setup-wordpress.sh

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ FULL DEPLOY COMPLETE!"
echo "═══════════════════════════════════════════"
echo "  Main site: https://dakagency.net/"
echo "  Blog:      https://dakagency.net/blog/"
echo ""
