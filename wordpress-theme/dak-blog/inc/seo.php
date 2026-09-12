<?php
/**
 * SEO.
 *
 * Principio de este archivo: el tema NUNCA compite con el plugin.
 *
 * El tema anterior emitía su propio Article en el <head> mientras Rank Math
 * emitía un BlogPosting en su @graph: dos entidades de artículo peleándose
 * por la misma URL. Aquí el tema solo emite datos estructurados cuando Rank
 * Math no está, de modo que en producción hay exactamente una fuente y en
 * un WordPress limpio (Playground, staging) la vista previa sigue siendo
 * representativa.
 */

defined( 'ABSPATH' ) || exit;

/**
 * ¿Está Rank Math gestionando la meta de esta instalación?
 *
 * @return bool
 */
function dak_rank_math_activo() {
	return defined( 'RANK_MATH_VERSION' ) || class_exists( 'RankMath' );
}

/**
 * Identidad de la marca. Un solo sitio donde cambiarla.
 *
 * @return array{nombre:string, url:string, sameAs:string[]}
 */
function dak_marca() {
	return array(
		'nombre' => 'DAK Agency',
		'url'    => 'https://dakagency.net/',
		'sameAs' => array(
			'https://www.instagram.com/agency_dak/',
			'https://www.facebook.com/profile.php?id=61577374078273',
		),
	);
}

/* ═══════════════════════════════════════════════════════════════
   1. CONSOLIDACIÓN DE ENTIDAD (cuando Rank Math está activo)

   Rank Math declara hoy la organización del blog como una entidad
   aparte: @id «https://dakagency.net/blog/#organization», nombre
   «DAK Agency Blog». Para un buscador eso son DOS marcas, y la
   autoridad que gana el blog no suma a la del sitio principal.

   Este filtro reapunta la organización al dominio raíz para que
   blog y web sean la misma entidad. El @id del artículo, las URLs
   y el resto del grafo no se tocan.
   ═══════════════════════════════════════════════════════════════ */

/**
 * @param array $data Grafo de Rank Math, indexado por nombre de entidad.
 * @return array
 */
function dak_consolidar_entidad( $data ) {
	if ( ! is_array( $data ) ) {
		return $data;
	}

	$marca = dak_marca();

	foreach ( $data as $clave => $entidad ) {
		if ( ! is_array( $entidad ) || empty( $entidad['@type'] ) ) {
			continue;
		}

		$tipos = (array) $entidad['@type'];

		$es_organizacion = (bool) array_intersect(
			$tipos,
			array( 'Organization', 'OnlineBusiness', 'LocalBusiness', 'ProfessionalService', 'Corporation' )
		);

		if ( ! $es_organizacion ) {
			continue;
		}

		$data[ $clave ]['@id']    = $marca['url'] . '#organization';
		$data[ $clave ]['name']   = $marca['nombre'];
		$data[ $clave ]['url']    = $marca['url'];
		$data[ $clave ]['sameAs'] = array_values(
			array_unique(
				array_merge(
					isset( $entidad['sameAs'] ) ? (array) $entidad['sameAs'] : array(),
					$marca['sameAs']
				)
			)
		);
	}

	// Que publisher y autor apunten a la organización ya reapuntada.
	foreach ( $data as $clave => $entidad ) {
		if ( is_array( $entidad ) && isset( $entidad['publisher']['@id'] ) ) {
			$data[ $clave ]['publisher']['@id'] = $marca['url'] . '#organization';
		}
	}

	return $data;
}
add_filter( 'rank_math/json_ld', 'dak_consolidar_entidad', 20 );

/**
 * og:locale correcto.
 *
 * El arreglo de fondo es poner el idioma del sitio en Español (Perú) en
 * Ajustes → Generales; entonces Rank Math emite es_PE solo. Este filtro es
 * el cinturón por si el ajuste se pierde. Si el hook no existe en una
 * versión futura del plugin, no pasa nada: un filtro sin hook es inocuo.
 */
add_filter(
	'rank_math/opengraph/facebook/locale',
	function () {
		return 'es_PE';
	}
);

/* ═══════════════════════════════════════════════════════════════
   2. RESPALDO (solo cuando Rank Math NO está activo)

   Nunca se ejecuta a la vez que lo de arriba, así que es imposible
   que este tema duplique datos estructurados.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Meta y datos estructurados mínimos para una instalación sin plugin de SEO.
 */
function dak_respaldo_meta() {
	if ( dak_rank_math_activo() ) {
		return;
	}

	$marca = dak_marca();

	echo '<link rel="canonical" href="' . esc_url( dak_url_actual() ) . '">' . "\n";
	echo '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">' . "\n";

	$titulo      = wp_get_document_title();
	$descripcion = dak_descripcion_actual();
	$imagen      = dak_imagen_actual();

	echo '<meta property="og:type" content="' . ( is_singular( 'post' ) ? 'article' : 'website' ) . '">' . "\n";
	echo '<meta property="og:locale" content="es_PE">' . "\n";
	echo '<meta property="og:site_name" content="' . esc_attr( $marca['nombre'] ) . '">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( $titulo ) . '">' . "\n";
	echo '<meta property="og:url" content="' . esc_url( dak_url_actual() ) . '">' . "\n";
	echo '<meta name="twitter:card" content="summary_large_image">' . "\n";

	if ( $descripcion ) {
		echo '<meta name="description" content="' . esc_attr( $descripcion ) . '">' . "\n";
		echo '<meta property="og:description" content="' . esc_attr( $descripcion ) . '">' . "\n";
	}

	if ( $imagen ) {
		echo '<meta property="og:image" content="' . esc_url( $imagen ) . '">' . "\n";
	}

	dak_respaldo_jsonld();
}
add_action( 'wp_head', 'dak_respaldo_meta', 2 );

/**
 * Grafo JSON-LD de respaldo: una sola pieza, con la organización ya
 * consolidada en el dominio raíz.
 */
function dak_respaldo_jsonld() {
	$marca = dak_marca();

	$organizacion = array(
		'@type'  => 'Organization',
		'@id'    => $marca['url'] . '#organization',
		'name'   => $marca['nombre'],
		'url'    => $marca['url'],
		'sameAs' => $marca['sameAs'],
	);

	$grafo = array( $organizacion );

	if ( is_singular( 'post' ) ) {
		$post = get_post();

		$grafo[] = array(
			'@type'            => 'BlogPosting',
			'@id'              => get_permalink( $post ) . '#article',
			'headline'         => wp_strip_all_tags( get_the_title( $post ) ),
			'description'      => dak_descripcion_actual(),
			'image'            => dak_imagen_actual(),
			'datePublished'    => get_the_date( 'c', $post ),
			'dateModified'     => get_the_modified_date( 'c', $post ),
			'author'           => array(
				'@type' => 'Person',
				'name'  => get_the_author_meta( 'display_name', $post->post_author ),
			),
			'publisher'        => array( '@id' => $marca['url'] . '#organization' ),
			'mainEntityOfPage' => array( '@id' => get_permalink( $post ) ),
		);
	}

	$migas = dak_migas_datos();

	if ( count( $migas ) > 1 ) {
		$items = array();

		foreach ( $migas as $i => $miga ) {
			$item = array(
				'@type'    => 'ListItem',
				'position' => $i + 1,
				'name'     => $miga['nombre'],
			);

			if ( ! empty( $miga['url'] ) ) {
				$item['item'] = $miga['url'];
			}

			$items[] = $item;
		}

		$grafo[] = array(
			'@type'           => 'BreadcrumbList',
			'itemListElement' => $items,
		);
	}

	echo '<script type="application/ld+json">'
		. wp_json_encode(
			array(
				'@context' => 'https://schema.org',
				'@graph'   => $grafo,
			),
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		)
		. '</script>' . "\n";
}

/* ── Utilidades compartidas por el respaldo y por las migas ─────── */

/**
 * URL canónica de la vista actual.
 *
 * @return string
 */
function dak_url_actual() {
	if ( is_singular() ) {
		return (string) get_permalink();
	}

	if ( is_category() || is_tag() || is_tax() ) {
		$enlace = get_term_link( get_queried_object() );

		return is_wp_error( $enlace ) ? home_url( '/' ) : (string) $enlace;
	}

	return home_url( '/' );
}

/**
 * Descripción de la vista actual.
 *
 * @return string
 */
function dak_descripcion_actual() {
	if ( is_singular() ) {
		return dak_extracto( null, 32 );
	}

	if ( is_category() || is_tag() || is_tax() ) {
		$descripcion = term_description( get_queried_object() );

		return $descripcion ? wp_trim_words( wp_strip_all_tags( $descripcion ), 32, '…' ) : '';
	}

	return (string) get_bloginfo( 'description' );
}

/**
 * Imagen representativa de la vista actual.
 *
 * @return string
 */
function dak_imagen_actual() {
	if ( is_singular() && has_post_thumbnail() ) {
		return (string) get_the_post_thumbnail_url( null, 'large' );
	}

	return '';
}

/* ═══════════════════════════════════════════════════════════════
   3. MIGAS VISIBLES

   El tema anterior emitía microdatos de BreadcrumbList y luego los
   escondía con display:none !important, que es datos estructurados
   sobre contenido oculto. Aquí las migas se ven, y el marcado
   BreadcrumbList lo pone Rank Math (o el respaldo de arriba).
   ═══════════════════════════════════════════════════════════════ */

/**
 * El rastro de la vista actual.
 *
 * @return array<int, array{nombre:string, url:string}>
 */
function dak_migas_datos() {
	$migas = array(
		array( 'nombre' => 'Inicio', 'url' => 'https://dakagency.net/' ),
		array( 'nombre' => 'Blog', 'url' => home_url( '/' ) ),
	);

	if ( is_singular( 'post' ) ) {
		$seccion = dak_seccion_de();

		if ( $seccion ) {
			$enlace = get_category_link( $seccion->term_id );

			$migas[] = array( 'nombre' => $seccion->name, 'url' => is_wp_error( $enlace ) ? '' : (string) $enlace );
		}

		$migas[] = array( 'nombre' => get_the_title(), 'url' => '' );
	} elseif ( is_page() ) {
		$migas[] = array( 'nombre' => get_the_title(), 'url' => '' );
	} elseif ( is_category() ) {
		$migas[] = array( 'nombre' => single_cat_title( '', false ), 'url' => '' );
	} elseif ( is_search() ) {
		$migas[] = array( 'nombre' => 'Búsqueda', 'url' => '' );
	} elseif ( is_404() ) {
		$migas[] = array( 'nombre' => 'Página no encontrada', 'url' => '' );
	}

	return $migas;
}

/**
 * Imprime las migas.
 */
function dak_migas() {
	if ( is_front_page() || is_home() ) {
		return;
	}

	$migas = dak_migas_datos();

	if ( count( $migas ) < 2 ) {
		return;
	}

	echo '<nav class="migas" aria-label="Ruta de navegación"><div class="contenedor"><ol>';

	$ultimo = count( $migas ) - 1;

	foreach ( $migas as $i => $miga ) {
		echo '<li>';

		if ( $i === $ultimo || empty( $miga['url'] ) ) {
			echo '<span aria-current="page">' . esc_html( $miga['nombre'] ) . '</span>';
		} else {
			echo '<a href="' . esc_url( $miga['url'] ) . '">' . esc_html( $miga['nombre'] ) . '</a>';
		}

		echo '</li>';
	}

	echo '</ol></div></nav>';
}
