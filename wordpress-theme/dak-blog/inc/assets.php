<?php
/**
 * Hojas de estilo, fuentes y limpieza de la cola de assets.
 *
 * Regla del proyecto: cero orígenes de terceros en la ruta crítica. Las dos
 * familias son variables, autoalojadas y con subconjunto latino; entre las
 * tres suman menos que la petición a Google Fonts que había antes.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Versión de un archivo del tema a partir de su fecha de modificación.
 *
 * Con una versión fija («1.0.0») el navegador se queda con el CSS viejo para
 * siempre. filemtime rompe la caché sola en cada despliegue.
 *
 * @param string $rel Ruta relativa dentro del tema.
 * @return string|false
 */
function dak_ver( $rel ) {
	$ruta = get_template_directory() . '/' . ltrim( $rel, '/' );

	return file_exists( $ruta ) ? (string) filemtime( $ruta ) : false;
}

/**
 * Encola la base siempre y lo específico de cada plantilla solo donde toca.
 */
function dak_blog_assets() {
	wp_enqueue_style( 'dak-base', get_stylesheet_uri(), array(), dak_ver( 'style.css' ) );

	if ( is_front_page() || is_home() ) {
		wp_enqueue_style( 'dak-portada', get_template_directory_uri() . '/assets/css/portada.css', array( 'dak-base' ), dak_ver( 'assets/css/portada.css' ) );
	}

	if ( is_singular() ) {
		wp_enqueue_style( 'dak-articulo', get_template_directory_uri() . '/assets/css/articulo.css', array( 'dak-base' ), dak_ver( 'assets/css/articulo.css' ) );
	}

	if ( is_archive() || is_search() || is_404() ) {
		wp_enqueue_style( 'dak-seccion', get_template_directory_uri() . '/assets/css/seccion.css', array( 'dak-base' ), dak_ver( 'assets/css/seccion.css' ) );
	}

	wp_enqueue_script( 'dak-blog', get_template_directory_uri() . '/assets/js/blog.js', array(), dak_ver( 'assets/js/blog.js' ), true );
}
add_action( 'wp_enqueue_scripts', 'dak_blog_assets' );

/**
 * Precarga la cara que se usa por encima del pliegue.
 *
 * Solo Archivo: es la que compone la tapa, el índice y las bandas. Faustina
 * entra en los extractos y en la prosa, más abajo, y le basta con swap.
 */
function dak_blog_precargas() {
	printf(
		'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
		esc_url( get_template_directory_uri() . '/assets/fonts/archivo-latin-var.woff2' )
	);
}
add_action( 'wp_head', 'dak_blog_precargas', 1 );

/**
 * Limpieza de la cola.
 *
 * Este es un tema clásico y las 55 entradas del circuito llegan como HTML
 * semántico sin bloques (0 apariciones de «<!-- wp:» en todo el corpus), así
 * que la hoja del editor de bloques y sus estilos globales son ~90 KB que
 * bloquean el render sin pintar un solo píxel.
 *
 * Si algún día se edita una entrada con bloques de Gutenberg, hay que
 * revisar esta función: es una decisión consciente, no un descuido.
 */
function dak_blog_limpiar_cola() {
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'classic-theme-styles' );
}
add_action( 'wp_enqueue_scripts', 'dak_blog_limpiar_cola', 100 );

/**
 * Fuera los estilos globales de theme.json.
 *
 * wp_dequeue_style('global-styles') NO basta —comprobado en WordPress 7.1—
 * porque wp_enqueue_global_styles está enganchada por partida doble, a
 * wp_enqueue_scripts y a wp_footer. Son ~4 KB de variables --wp--preset--*
 * que un tema clásico sin theme.json no usa para nada.
 */
function dak_blog_sin_estilos_globales() {
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
	remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
	remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
	remove_action( 'in_admin_header', 'wp_global_styles_render_svg_filters' );
}
add_action( 'init', 'dak_blog_sin_estilos_globales' );

/**
 * Fuera el script de emojis: dos peticiones y un detector de compatibilidad
 * para sustituir caracteres que ya pinta el sistema operativo.
 */
function dak_blog_sin_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'dak_blog_sin_emojis' );
