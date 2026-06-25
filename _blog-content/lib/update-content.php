<?php
/**
 * update-content.php — Actualiza SOLO el post_content (con su FAQ JSON-LD) de un
 * post/página YA existente, identificado por slug. Pensado para corregir contenido
 * sin recrear el post ni tocar categorías, meta ni imagen.
 *
 * Clave: usa wp_slash() porque wp_update_post() aplica wp_unslash() internamente;
 * sin esto las barras del JSON-LD de FAQ (\") se pierden y el schema queda inválido.
 *
 * Uso (en el servidor):
 *   wp eval-file update-content.php <ruta-json>
 *
 * Salida:  UPDATED <id> <slug>   |   (error si el slug no existe)
 */
if ( empty( $args[0] ) ) {
	WP_CLI::error( 'Uso: wp eval-file update-content.php <ruta-json>' );
}
$data = json_decode( file_get_contents( $args[0] ), true );
if ( ! is_array( $data ) || empty( $data['slug'] ) ) {
	WP_CLI::error( 'JSON inválido: falta "slug".' );
}
$slug = sanitize_title( $data['slug'] );
$ex   = get_posts( array(
	'name'        => $slug,
	'post_type'   => 'any',
	'post_status' => 'any',
	'numberposts' => 1,
) );
if ( empty( $ex ) ) {
	WP_CLI::error( "No existe ningún post con slug: $slug" );
}

$content = isset( $data['content'] ) ? $data['content'] : '';
if ( ! empty( $data['faq_jsonld'] ) ) {
	$json_ld  = wp_json_encode( $data['faq_jsonld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	$content .= "\n\n<!-- FAQ schema (DAK auto) -->\n<script type=\"application/ld+json\">" . $json_ld . "</script>\n";
}

$res = wp_update_post( wp_slash( array(
	'ID'           => $ex[0]->ID,
	'post_content' => $content,
) ), true );
if ( is_wp_error( $res ) ) {
	WP_CLI::error( 'wp_update_post falló: ' . $res->get_error_message() );
}
WP_CLI::log( 'UPDATED ' . $ex[0]->ID . ' ' . $slug );
