<?php
/**
 * Arranque del tema.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Soporte del tema.
 *
 * Deliberadamente NO se registra ningún add_image_size().
 *
 * El tema anterior declaraba seis recortes duros y las plantillas pedían
 * «large» de todos modos, así que los seis se generaban en cada subida y no
 * los usaba nadie. Peor: un recorte propio obliga a regenerar las miniaturas
 * de las 55 entradas ya publicadas antes de que sirva de algo.
 *
 * Los tamaños por defecto de WordPress (medium, medium_large, large) son
 * proporcionales, comparten proporción con el original y YA existen en el
 * servidor para las 55 entradas. Al pedir «large» con wp_get_attachment_image(),
 * WordPress arma el srcset con todos ellos: imágenes responsive desde el
 * primer minuto y sin regenerar nada. El encuadre lo decide el CSS con
 * object-fit, que es donde debe decidirse.
 */
function dak_blog_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);

	register_nav_menus(
		array(
			'pie' => __( 'Pie: enlaces', 'dak-blog' ),
		)
	);
}
add_action( 'after_setup_theme', 'dak_blog_setup' );

/**
 * Ancho de contenido, en píxeles, para incrustados.
 */
function dak_blog_content_width() {
	$GLOBALS['content_width'] = 720;
}
add_action( 'after_setup_theme', 'dak_blog_content_width', 0 );

/**
 * Fuera la barra de administración en el frente.
 *
 * La barra inyecta su propio CSS y su propia fuente, y este tema declara
 * cero scripts de terceros.
 */
add_filter( 'show_admin_bar', '__return_false' );
