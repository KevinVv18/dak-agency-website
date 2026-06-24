<?php
/**
 * link-posts.php — Enlaza cada post de blog a su PÁGINA PILAR (cluster SEO).
 * Añade un bloque "Servicio relacionado" al final del post (idempotente).
 * Uso: wp eval-file link-posts.php
 */

// slug del post => [ slug del pilar, nombre visible del pilar, frase de servicio ]
$map = array(
	'seo-sem-chiclayo-impulsa-tu-negocio-al-exito-digital' => array( 'agencia-seo-chiclayo', 'Agencia de SEO en Chiclayo', 'posicionar tu negocio en Google' ),
	'google-business-profile-para-empresas-en-chiclayo'    => array( 'agencia-seo-chiclayo', 'Agencia de SEO en Chiclayo', 'aparecer en Google y en el mapa' ),
	'como-elegir-agencia-de-marketing-en-chiclayo'         => array( 'agencia-seo-chiclayo', 'Agencia de SEO en Chiclayo', 'una agencia de marketing que sí cumpla' ),
	'creacion-de-paginas-web-en-chiclayo'                  => array( 'diseno-web-chiclayo', 'Diseño Web en Chiclayo', 'una página web que venda' ),
	'cuanto-cuesta-una-pagina-web-en-chiclayo'             => array( 'diseno-web-chiclayo', 'Diseño Web en Chiclayo', 'una página web profesional' ),
	'publicidad-en-meta-ads-para-empresas-en-chiclayo'     => array( 'agencia-de-publicidad-en-redes-chiclayo', 'Publicidad en Redes (Meta Ads)', 'campañas que traigan clientes' ),
	'cuanto-cuesta-la-publicidad-en-redes-en-chiclayo'     => array( 'agencia-de-publicidad-en-redes-chiclayo', 'Publicidad en Redes (Meta Ads)', 'gestionar tu publicidad en redes' ),
	'marketing-inmobiliario-en-chiclayo-dak-agency'        => array( 'agencia-de-publicidad-en-redes-chiclayo', 'Publicidad en Redes (Meta Ads)', 'marketing inmobiliario que venda' ),
	'gestion-de-redes-sociales-para-empresas-en-chiclayo'  => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'manejar tus redes con estrategia' ),
	'fotografia-profesional-para-empresas-en-chiclayo'     => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'fotografía y contenido profesional' ),
	'video-marketing-para-empresas-en-chiclayo'            => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'video y reels que venden' ),
	'marketing-para-clinicas-dentales-en-chiclayo'         => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'marketing para tu clínica' ),
	'marketing-para-restaurantes-en-chiclayo'              => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'marketing para tu restaurante' ),
	'marketing-para-spas-y-estetica-en-chiclayo'           => array( 'agencia-de-redes-sociales-chiclayo', 'Agencia de Redes Sociales', 'marketing para tu spa o centro de estética' ),
	'marketing-para-colegios-e-institutos-en-chiclayo'     => array( 'agencia-de-publicidad-en-redes-chiclayo', 'Publicidad en Redes (Meta Ads)', 'campañas de admisión' ),
	'automatizacion-de-marketing-para-empresas-en-chiclayo' => array( 'automatizacion-para-negocios-chiclayo', 'Automatización para Negocios', 'automatizar tu negocio' ),
	'branding-en-chiclayo-guia-para-potenciar-tu-marca-en-2026' => array( 'agencia-de-branding-chiclayo', 'Agencia de Branding', 'construir una marca que enamore' ),
);

$linked = 0; $already = 0; $missing = 0;
foreach ( $map as $slug => $info ) {
	$posts = get_posts( array( 'name' => $slug, 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 1 ) );
	if ( empty( $posts ) ) { WP_CLI::log( "— no publicado aún: $slug" ); $missing++; continue; }
	$p = $posts[0];
	if ( strpos( $p->post_content, 'servicio-relacionado' ) !== false ) { WP_CLI::log( "ya enlazado: $slug" ); $already++; continue; }
	list( $pslug, $pname, $svc ) = $info;
	$box = '<blockquote class="servicio-relacionado"><p><strong>Servicio relacionado:</strong> ¿Necesitas ' . $svc . '? Conoce nuestro servicio de <a href="https://dakagency.net/blog/' . $pslug . '/">' . $pname . '</a> y agenda un diagnóstico gratis.</p></blockquote>';
	$res = wp_update_post( array( 'ID' => $p->ID, 'post_content' => $p->post_content . "\n\n" . $box ), true );
	if ( is_wp_error( $res ) ) { WP_CLI::log( "ERROR $slug: " . $res->get_error_message() ); }
	else { WP_CLI::log( "ENLAZADO: $slug -> $pslug" ); $linked++; }
}
WP_CLI::log( "== enlazados=$linked | ya-estaban=$already | no-publicados=$missing ==" );
