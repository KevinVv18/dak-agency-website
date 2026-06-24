<?php
/**
 * cleanup-marketing-cat.php — Fase 4: quita la categoría vieja "Marketing"
 * (marketing-digital, id 8) de los posts, dejando solo su categoría real.
 * Así cada tarjeta muestra su categoría correcta (no el tag redundante "MARKETING").
 * Seguro: si un post quedara sin categoría, NO se toca. Idempotente.
 * Uso: wp eval-file cleanup-marketing-cat.php
 */
$mk = get_term_by( 'slug', 'marketing-digital', 'category' );
if ( ! $mk ) { $mk = get_term_by( 'slug', 'marketing', 'category' ); }
if ( ! $mk ) { WP_CLI::error( 'No existe la categoría Marketing.' ); }
$mkid = intval( $mk->term_id );

$posts = get_posts( array( 'post_type' => 'post', 'post_status' => 'any', 'numberposts' => -1, 'cat' => $mkid ) );
$changed = 0; $skipped = 0;
foreach ( $posts as $p ) {
	$cats = wp_get_post_categories( $p->ID );
	$new  = array_values( array_diff( $cats, array( $mkid ) ) );
	if ( empty( $new ) ) { WP_CLI::log( "SKIP (quedaría sin categoría): " . $p->post_name ); $skipped++; continue; }
	wp_set_post_categories( $p->ID, $new );
	WP_CLI::log( "quitado Marketing de: " . $p->post_name );
	$changed++;
}
WP_CLI::log( "== Marketing quitado de $changed posts | saltados=$skipped ==" );
