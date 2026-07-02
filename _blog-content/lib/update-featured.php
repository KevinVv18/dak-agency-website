<?php
/**
 * update-featured.php — Reemplaza la imagen destacada de un post existente.
 *
 * Uso (en el servidor):
 *   wp eval-file update-featured.php <slug> <ruta-imagen> [alt]
 *
 * - Busca el post por slug (cualquier estado).
 * - Importa la imagen (conserva el nombre de archivo → súbela con nombre
 *   descriptivo, es mejor para SEO de imagen).
 * - La asigna como thumbnail y setea el ALT.
 * - No borra el attachment anterior (evita 404 en cachés de og:image).
 *
 * Salida: REPLACED <post_id> <permalink> old=<id> new=<id>
 */

if ( empty( $args[0] ) || empty( $args[1] ) ) {
	WP_CLI::error( 'Uso: wp eval-file update-featured.php <slug> <ruta-imagen> [alt]' );
}

$slug = sanitize_title( $args[0] );
$img  = $args[1];
$alt  = isset( $args[2] ) ? $args[2] : '';

$posts = get_posts( array( 'name' => $slug, 'post_type' => 'post', 'post_status' => 'any', 'numberposts' => 1 ) );
if ( empty( $posts ) ) {
	WP_CLI::error( "No existe post con slug: $slug" );
}
$pid = $posts[0]->ID;

if ( ! file_exists( $img ) ) {
	WP_CLI::error( "No se encontró la imagen: $img" );
}
if ( '' === $alt ) {
	$alt = get_the_title( $pid );
}

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$upload = wp_upload_bits( basename( $img ), null, file_get_contents( $img ) );
if ( ! empty( $upload['error'] ) ) {
	WP_CLI::error( 'No se pudo subir: ' . $upload['error'] );
}
$ft  = wp_check_filetype( $upload['file'] );
$aid = wp_insert_attachment( array(
	'post_mime_type' => $ft['type'],
	'post_title'     => sanitize_file_name( pathinfo( $upload['file'], PATHINFO_FILENAME ) ),
	'post_status'    => 'inherit',
), $upload['file'], $pid );
if ( is_wp_error( $aid ) ) {
	WP_CLI::error( 'wp_insert_attachment falló: ' . $aid->get_error_message() );
}
wp_update_attachment_metadata( $aid, wp_generate_attachment_metadata( $aid, $upload['file'] ) );

$old = get_post_thumbnail_id( $pid );
set_post_thumbnail( $pid, $aid );
update_post_meta( $aid, '_wp_attachment_image_alt', $alt );

WP_CLI::log( 'REPLACED ' . $pid . ' ' . get_permalink( $pid ) . ' old=' . $old . ' new=' . $aid );
