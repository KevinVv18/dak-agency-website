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
        'opinion'          => 'tag-marketing',
        'entrevistas'      => 'tag-branding',
        'diseno-web'       => 'tag-seo',
        'tendencias'       => 'tag-video',
    );
    return isset( $map[ $slug ] ) ? $map[ $slug ] : 'tag-marketing';
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
        $excerpt = mb_substr( $excerpt, 0, $length );
    }
    return $excerpt;
}

// ── Disable WordPress admin bar on frontend (optional, for design purity) ──
// add_filter( 'show_admin_bar', '__return_false' );

// ── Add excerpt support for pages ──
add_post_type_support( 'page', 'excerpt' );
