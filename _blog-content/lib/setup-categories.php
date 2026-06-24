<?php
/**
 * setup-categories.php — Fase 1 del rediseño del home.
 * Crea las categorías reales (idempotente) y asigna cada post publicado a la suya.
 * AÑADE la categoría nueva SIN quitar la antigua ("Marketing"), para no romper el
 * home actual hasta montar el nuevo (Fase 2). Re-ejecutable.
 * Uso: wp eval-file setup-categories.php
 */

$cats = array(
	'SEO y Buscadores'      => 'seo-buscadores',
	'Diseño Web'            => 'diseno-web',
	'Redes Sociales'        => 'redes-sociales',
	'Publicidad'            => 'publicidad',
	'Automatización'        => 'automatizacion',
	'Branding'              => 'branding',
	'Marketing por Rubro'   => 'por-rubro',
	'Guías y Precios'       => 'guias-precios',
);
$ids = array();
foreach ( $cats as $name => $slug ) {
	$t = get_term_by( 'slug', $slug, 'category' );
	if ( ! $t ) {
		$r = wp_insert_term( $name, 'category', array( 'slug' => $slug ) );
		if ( is_wp_error( $r ) ) { WP_CLI::warning( "no se pudo crear $slug: " . $r->get_error_message() ); continue; }
		$ids[ $slug ] = intval( $r['term_id'] );
		WP_CLI::log( "categoria CREADA: $name ($slug)" );
	} else {
		$ids[ $slug ] = intval( $t->term_id );
		WP_CLI::log( "categoria existe: $name ($slug)" );
	}
}

// post slug => category slug
$map = array(
	'seo-sem-chiclayo-impulsa-tu-negocio-al-exito-digital'      => 'seo-buscadores',
	'google-business-profile-para-empresas-en-chiclayo'         => 'seo-buscadores',
	'marketing-digital-en-jose-leonardo-ortiz'                  => 'seo-buscadores',
	'creacion-de-paginas-web-en-chiclayo'                       => 'diseno-web',
	'cuanto-cuesta-una-pagina-web-en-chiclayo'                  => 'diseno-web',
	'gestion-de-redes-sociales-para-empresas-en-chiclayo'       => 'redes-sociales',
	'fotografia-profesional-para-empresas-en-chiclayo'          => 'redes-sociales',
	'video-marketing-para-empresas-en-chiclayo'                 => 'redes-sociales',
	'publicidad-en-meta-ads-para-empresas-en-chiclayo'          => 'publicidad',
	'cuanto-cuesta-la-publicidad-en-redes-en-chiclayo'          => 'publicidad',
	'automatizacion-de-marketing-para-empresas-en-chiclayo'     => 'automatizacion',
	'whatsapp-business-para-negocios-en-chiclayo'               => 'automatizacion',
	'branding-en-chiclayo-guia-para-potenciar-tu-marca-en-2026' => 'branding',
	'marketing-inmobiliario-en-chiclayo-dak-agency'             => 'por-rubro',
	'marketing-para-clinicas-dentales-en-chiclayo'              => 'por-rubro',
	'marketing-para-restaurantes-en-chiclayo'                   => 'por-rubro',
	'marketing-para-spas-y-estetica-en-chiclayo'                => 'por-rubro',
	'marketing-para-colegios-e-institutos-en-chiclayo'          => 'por-rubro',
	'marketing-para-tiendas-y-retail-en-chiclayo'               => 'por-rubro',
	'como-elegir-agencia-de-marketing-en-chiclayo'              => 'guias-precios',
	'seo-vs-meta-ads-para-negocios-en-chiclayo'                 => 'guias-precios',
);

$done = 0; $pending = 0;
foreach ( $map as $pslug => $cslug ) {
	if ( empty( $ids[ $cslug ] ) ) { continue; }
	$posts = get_posts( array( 'name' => $pslug, 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 1 ) );
	if ( empty( $posts ) ) { WP_CLI::log( "- aún no publicado: $pslug" ); $pending++; continue; }
	$pid = $posts[0]->ID;
	// AÑADIR la categoría nueva sin quitar las existentes (no rompe el home actual)
	$current = wp_get_post_categories( $pid );
	$merged  = array_values( array_unique( array_merge( $current, array( $ids[ $cslug ] ) ) ) );
	wp_set_post_categories( $pid, $merged );
	WP_CLI::log( "$pslug += $cslug" );
	$done++;
}
WP_CLI::log( "== categorias OK | posts reasignados=$done | aun en cola=$pending ==" );
