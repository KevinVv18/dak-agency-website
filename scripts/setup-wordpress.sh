#!/bin/bash
# ============================================================
#  DAK Agency — WordPress Setup Script
#  Installs WordPress core at /blog and deploys dak-informando theme
# ============================================================

WP_DIR="/home/u567580447/public_html/blog"
THEME_SRC="./wordpress-theme/dak-informando"
THEME_DST="$WP_DIR/wp-content/themes/dak-informando"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "═══════════════════════════════════════════"
echo "  WordPress Setup — dakagency.net/blog"
echo "═══════════════════════════════════════════"

# ── Step 1: Ensure blog directory exists ──
mkdir -p "$WP_DIR"

# ── Step 2: Install WordPress core if not present ──
if [ ! -f "$WP_DIR/wp-login.php" ]; then
    echo ""
    echo "📦 WordPress core not found. Downloading..."
    cd /tmp
    curl -sO https://wordpress.org/latest.tar.gz
    
    if [ ! -f latest.tar.gz ]; then
        echo "❌ ERROR: Failed to download WordPress"
        exit 1
    fi
    
    tar -xzf latest.tar.gz
    cp -r wordpress/* "$WP_DIR/"
    rm -rf wordpress latest.tar.gz
    
    echo "✅ WordPress core installed at $WP_DIR"
    
    # Copy pre-configured wp-config.php
    if [ -f "$SCRIPT_DIR/wp-config.php" ]; then
        cp "$SCRIPT_DIR/wp-config.php" "$WP_DIR/wp-config.php"
        echo "✅ wp-config.php configured"
    elif [ -f "$WP_DIR/wp-config.php" ]; then
        echo "✅ wp-config.php already exists on server"
    else
        echo "⚠️  WARNING: No wp-config.php found!"
        echo "   Create scripts/wp-config.php from scripts/wp-config.template.php"
        echo "   Or upload wp-config.php to $WP_DIR/ via Hostinger File Manager"
    fi
    
    # Create .htaccess for pretty permalinks
    cat > "$WP_DIR/.htaccess" << 'HTACCESS'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /blog/
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /blog/index.php [L]
</IfModule>
# END WordPress

# Security
<Files wp-config.php>
    Order allow,deny
    Deny from all
</Files>

<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>
HTACCESS
    echo "✅ .htaccess created with permalink rules"
    
    # Create uploads directory with correct permissions
    mkdir -p "$WP_DIR/wp-content/uploads"
    chmod 755 "$WP_DIR/wp-content/uploads"
    echo "✅ Uploads directory created"
    
    echo ""
    echo "══════════════════════════════════════════════════════"
    echo "  🎉 FIRST-TIME INSTALL COMPLETE!"
    echo "  → Go to: https://dakagency.net/blog/wp-admin/install.php"
    echo "  → Complete the WordPress setup wizard"
    echo "══════════════════════════════════════════════════════"
else
    echo "✅ WordPress core already installed, skipping download"
fi

# ── Step 3: Always update the theme ──
echo ""
echo "🎨 Updating dak-informando theme..."

if [ -d "$THEME_SRC" ]; then
    # Remove old theme version
    rm -rf "$THEME_DST"
    # Copy fresh theme
    cp -r "$THEME_SRC" "$THEME_DST"
    echo "✅ Theme dak-informando updated at $THEME_DST"
else
    echo "⚠️  WARNING: Theme source not found at $THEME_SRC"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ WordPress setup complete!"
echo "═══════════════════════════════════════════"
echo ""
