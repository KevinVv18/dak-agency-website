<?php
/**
 * wp-create-post.php — Crea un post en WordPress desde un JSON.
 *
 * Se ejecuta EN EL SERVIDOR vía WP-CLI:
 *   wp eval-file wp-create-post.php <ruta-json> [status] [ruta-imagen]
 *
 * - Idempotente: si ya existe un post con ese slug (cualquier estado), no lo recrea.
 * - Setea metadatos de Rank Math (focus keyword, título SEO, meta description).
 * - Asigna categoría(s) y tags.
 * - Inserta el schema FAQ (JSON-LD) al final del contenido si viene en el JSON.
 * - Imagen destacada (opcional): si se pasa <ruta-imagen> (un archivo YA en el
 *   servidor, subido por publish.sh), la importa, la asigna como thumbnail y le
 *   pone el ALT de `featured_image_alt` (o el título).
 *
 * Salida (una línea, parseable por publish.sh):
 *   CREATED <id> <url>     → se creó
 *   EXISTS  <id> <url>     → ya existía (no se tocó)
 *   (error)               → WP_CLI::error, exit != 0
 */

if ( empty( $args[0] ) ) {
	WP_CLI::error( 'Uso: wp eval-file wp-create-post.php <ruta-json> [status]' );
}

$json_path       = $args[0];
$status_override = isset( $args[1] ) ? trim( $args[1] ) : '';

if ( ! file_exists( $json_path ) ) {
	WP_CLI::error( "No se encontró el JSON: $json_path" );
}

$data = json_decode( file_get_contents( $json_path ), true );
if ( ! is_array( $data ) || empty( $data['title'] ) || empty( $data['slug'] ) ) {
	WP_CLI::error( 'JSON inválido: se requieren al menos "title" y "slug".' );
}

$slug = sanitize_title( $data['slug'] );

// ── Idempotencia: ¿ya existe el slug? ──
$existing = get_posts( array(
	'name'        => $slug,
	'post_type'   => 'post',
	'post_status' => 'any',
	'numberposts' => 1,
) );
if ( ! empty( $existing ) ) {
	WP_CLI::log( 'EXISTS ' . $existing[0]->ID . ' ' . get_permalink( $existing[0] ) );
	return;
}

// ── Estado del post ──
$status = $status_override ?: ( isset( $data['status'] ) ? $data['status'] : 'publish' );
$status = in_array( $status, array( 'publish', 'draft', 'future', 'pending', 'private' ), true ) ? $status : 'publish';

// ── Contenido + schema FAQ ──
$content = isset( $data['content'] ) ? $data['content'] : '';
if ( ! empty( $data['faq_jsonld'] ) ) {
	$json_ld  = wp_json_encode( $data['faq_jsonld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	$content .= "\n\n<!-- FAQ schema (DAK auto) -->\n<script type=\"application/ld+json\">" . $json_ld . "</script>\n";
}

$postarr = array(
	'post_title'   => wp_strip_all_tags( $data['title'] ),
	'post_name'    => $slug,
	'post_content' => $content,
	'post_excerpt' => isset( $data['excerpt'] ) ? $data['excerpt'] : '',
	'post_status'  => $status,
	'post_type'    => ! empty( $data['post_type'] ) ? $data['post_type'] : 'post',
	'post_author'  => isset( $data['author'] ) ? intval( $data['author'] ) : 1,
);

// Fecha para posts programados ('future').
if ( 'future' === $status && ! empty( $data['post_date'] ) ) {
	$postarr['post_date']     = $data['post_date'];
	$postarr['post_date_gmt'] = get_gmt_from_date( $data['post_date'] );
}

// ── Categorías ──
$cat_ids = array();
if ( ! empty( $data['category'] ) ) {
	$cat_ids[] = intval( $data['category'] );
}
if ( ! empty( $data['categories'] ) && is_array( $data['categories'] ) ) {
	foreach ( $data['categories'] as $c ) {
		$cat_ids[] = intval( $c );
	}
}
// Categoria por slug (se crea si no existe) — el "circuito": cada post cae en su seccion del home
if ( ! empty( $data['category_slug'] ) ) {
	$cs   = sanitize_title( $data['category_slug'] );
	$term = get_term_by( 'slug', $cs, 'category' );
	if ( ! $term ) {
		$cname = ! empty( $data['category_name'] ) ? $data['category_name'] : ucwords( str_replace( '-', ' ', $cs ) );
		$ins   = wp_insert_term( $cname, 'category', array( 'slug' => $cs ) );
		if ( ! is_wp_error( $ins ) ) { $cat_ids[] = intval( $ins['term_id'] ); }
	} else {
		$cat_ids[] = intval( $term->term_id );
	}
}
if ( $cat_ids ) {
	$postarr['post_category'] = array_values( array_unique( array_filter( $cat_ids ) ) );
}

// wp_slash: WordPress aplica wp_unslash() internamente al guardar; sin esto
// las barras del JSON-LD de FAQ (\") se pierden y el schema queda invalido.
$post_id = wp_insert_post( wp_slash( $postarr ), true );
if ( is_wp_error( $post_id ) ) {
	WP_CLI::error( 'wp_insert_post falló: ' . $post_id->get_error_message() );
}

// ── Rank Math SEO ──
if ( ! empty( $data['rank_math'] ) && is_array( $data['rank_math'] ) ) {
	$rm = $data['rank_math'];
	if ( ! empty( $rm['focus_keyword'] ) ) {
		update_post_meta( $post_id, 'rank_math_focus_keyword', $rm['focus_keyword'] );
	}
	if ( ! empty( $rm['title'] ) ) {
		update_post_meta( $post_id, 'rank_math_title', $rm['title'] );
	}
	if ( ! empty( $rm['description'] ) ) {
		update_post_meta( $post_id, 'rank_math_description', $rm['description'] );
	}
}

// ── Tags (opcional) ──
if ( ! empty( $data['tags'] ) && is_array( $data['tags'] ) ) {
	wp_set_post_tags( $post_id, $data['tags'], false );
}

// ── Imagen destacada (opcional) ──
// $args[2] = ruta a una imagen YA presente en el servidor (la sube publish.sh).
if ( ! empty( $args[2] ) && file_exists( $args[2] ) ) {
	$img_path = $args[2];
	$alt      = ! empty( $data['featured_image_alt'] ) ? $data['featured_image_alt'] : wp_strip_all_tags( $data['title'] );

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$filename = basename( $img_path );
	$upload   = wp_upload_bits( $filename, null, file_get_contents( $img_path ) );
	if ( empty( $upload['error'] ) ) {
		$filetype  = wp_check_filetype( $upload['file'] );
		$attach_id = wp_insert_attachment( array(
			'post_mime_type' => $filetype['type'],
			'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
			'post_status'    => 'inherit',
		), $upload['file'], $post_id );
		if ( ! is_wp_error( $attach_id ) ) {
			wp_update_attachment_metadata( $attach_id, wp_generate_attachment_metadata( $attach_id, $upload['file'] ) );
			set_post_thumbnail( $post_id, $attach_id );
			update_post_meta( $attach_id, '_wp_attachment_image_alt', $alt );
		}
	} else {
		WP_CLI::warning( 'No se pudo subir la imagen destacada: ' . $upload['error'] );
	}
}

WP_CLI::log( 'CREATED ' . $post_id . ' ' . get_permalink( $post_id ) );
