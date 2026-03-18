<?php
/**
 * DAK INFORMANDO Theme — functions.php
 * Registra menús, estilos, fuentes Google, y soporte del tema.
 */

// ── Theme Setup ──
function dak_informando_setup() {
    // Soporte básico del tema
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    add_theme_support( 'automatic-feed-links' );

    // Registrar menús de navegación
    register_nav_menus( array(
        'primary'  => __( 'Navegación Principal', 'dak-informando' ),
        'mini-nav' => __( 'Mini Nav (scroll)', 'dak-informando' ),
        'footer-categories' => __( 'Footer: Categorías', 'dak-informando' ),
        'footer-navigation' => __( 'Footer: Navega', 'dak-informando' ),
    ) );

    // Tamaños de imagen personalizados
    add_image_size( 'hero-featured', 900, 562, true );     // 16:10
    add_image_size( 'article-card', 400, 275, true );       // 16:11
    add_image_size( 'sidebar-article', 280, 192, true );    // 16:11
    add_image_size( 'opinion-image', 600, 750, true );      // 4:5
    add_image_size( 'interview-hero', 1400, 612, true );    // 16:7
    add_image_size( 'latest-sidebar', 400, 533, true );     // 3:4
}
add_action( 'after_setup_theme', 'dak_informando_setup' );

// ── Enqueue Styles & Scripts ──
function dak_informando_assets() {
    // Google Fonts: Playfair Display + Inter
    wp_enqueue_style(
        'dak-google-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap',
        array(),
        null
    );

    // Tema CSS principal
    wp_enqueue_style(
        'dak-informando-style',
        get_stylesheet_uri(),
        array( 'dak-google-fonts' ),
        wp_get_theme()->get( 'Version' )
    );

    // JavaScript del header (cursor grid, hamburger, mini-nav)
    wp_enqueue_script(
        'dak-informando-header',
        get_template_directory_uri() . '/assets/js/header.js',
        array(),
        wp_get_theme()->get( 'Version' ),
        true // Load in footer
    );
}
add_action( 'wp_enqueue_scripts', 'dak_informando_assets' );

// ── Helper: Get category tag CSS class ──
function dak_get_category_tag_class( $slug ) {
    $map = array(
        'marketing'        => 'tag-marketing',
        'marketing-digital'=> 'tag-marketing',
        'branding'         => 'tag-branding',
        'seo'              => 'tag-seo',
        'seo-ads'          => 'tag-seo',
        'video'            => 'tag-video',
        'blog'             => 'tag-blog',
        'blogs'            => 'tag-blog',
        'opinion'          => 'tag-opinion',
        'opiniones'        => 'tag-opinion',
        'entrevistas'      => 'tag-entrevistas',
        'diseno-web'       => 'tag-seo',
        'tendencias'       => 'tag-video',
        'mas-popular'      => 'tag-marketing',
        'sin-categoria'    => 'tag-uncategorized',
        'uncategorized'    => 'tag-uncategorized',
    );
    return isset( $map[ $slug ] ) ? $map[ $slug ] : 'tag-uncategorized';
}

// ── Helper: Format date in Spanish ──
function dak_format_date_short( $date_str ) {
    $months = array( 'ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC' );
    $ts = strtotime( $date_str );
    return $months[ (int) date( 'n', $ts ) - 1 ] . ' ' . date( 'j', $ts ) . ', ' . date( 'Y', $ts );
}

function dak_format_date_long( $date_str ) {
    $months = array( 'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE' );
    $ts = strtotime( $date_str );
    return $months[ (int) date( 'n', $ts ) - 1 ] . ' ' . date( 'j', $ts ) . ', ' . date( 'Y', $ts );
}

function dak_format_today_spanish() {
    $months = array( 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre' );
    return 'Hoy: ' . $months[ (int) date( 'n' ) - 1 ] . ' ' . date( 'j' ) . ', ' . date( 'Y' );
}

// ── Helper: Get primary category ──
function dak_get_primary_category( $post_id = null ) {
    $categories = get_the_category( $post_id );
    if ( ! empty( $categories ) ) {
        // Skip "Uncategorized"
        foreach ( $categories as $cat ) {
            if ( $cat->slug !== 'uncategorized' && $cat->slug !== 'sin-categoria' ) {
                return $cat;
            }
        }
        return $categories[0];
    }
    return (object) array( 'name' => 'General', 'slug' => 'general' );
}

// ── Helper: Get featured image or placeholder ──
function dak_get_featured_image_url( $post_id = null, $size = 'large' ) {
    if ( has_post_thumbnail( $post_id ) ) {
        return get_the_post_thumbnail_url( $post_id, $size );
    }
    return get_template_directory_uri() . '/assets/img/placeholder.svg';
}

// ── Helper: Get excerpt without HTML ──
function dak_get_clean_excerpt( $post = null, $length = 0 ) {
    $excerpt = get_the_excerpt( $post );
    $excerpt = wp_strip_all_tags( $excerpt );
    if ( $length > 0 ) {
        $excerpt = wp_trim_words( $excerpt, $length, '…' );
    }
    return $excerpt;
}

// ── Helper: Breadcrumbs (SEO) ──
function dak_breadcrumbs() {
    if ( is_front_page() ) return;

    echo '<nav class="breadcrumbs" aria-label="Breadcrumb">';
    echo '<ol class="breadcrumbs-list" itemscope itemtype="https://schema.org/BreadcrumbList">';

    // Home
    echo '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
    echo '<a itemprop="item" href="https://dakagency.net/"><span itemprop="name">Inicio</span></a>';
    echo '<meta itemprop="position" content="1" />';
    echo '</li>';

    // Blog
    echo '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
    echo '<a itemprop="item" href="' . esc_url( home_url( '/' ) ) . '"><span itemprop="name">Blog</span></a>';
    echo '<meta itemprop="position" content="2" />';
    echo '</li>';

    // Category
    if ( is_single() ) {
        $cat = dak_get_primary_category();
        echo '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
        echo '<a itemprop="item" href="' . esc_url( get_category_link( $cat->term_id ?? 0 ) ) . '"><span itemprop="name">' . esc_html( $cat->name ) . '</span></a>';
        echo '<meta itemprop="position" content="3" />';
        echo '</li>';

        // Current post
        echo '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
        echo '<span itemprop="name">' . esc_html( get_the_title() ) . '</span>';
        echo '<meta itemprop="position" content="4" />';
        echo '</li>';
    }

    echo '</ol>';
    echo '</nav>';
}

// ── Helper: Article Schema JSON-LD ──
function dak_article_schema() {
    if ( ! is_single() ) return;

    $post    = get_post();
    $image   = dak_get_featured_image_url( $post->ID, 'large' );
    $author  = get_the_author();
    $excerpt = dak_get_clean_excerpt( $post, 30 );

    $schema = array(
        '@context'      => 'https://schema.org',
        '@type'         => 'Article',
        'headline'      => get_the_title(),
        'description'   => $excerpt,
        'image'         => $image,
        'datePublished' => get_the_date( 'c' ),
        'dateModified'  => get_the_modified_date( 'c' ),
        'author'        => array(
            '@type' => 'Person',
            'name'  => $author,
        ),
        'publisher'     => array(
            '@type' => 'Organization',
            'name'  => 'DAK Agency',
            'url'   => 'https://dakagency.net',
        ),
        'mainEntityOfPage' => array(
            '@type' => 'WebPage',
            '@id'   => get_permalink(),
        ),
    );

    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

// ── Disable WordPress admin bar on frontend (for design purity) ──
add_filter( 'show_admin_bar', '__return_false' );


// ── Add excerpt support for pages ──
add_post_type_support( 'page', 'excerpt' );
