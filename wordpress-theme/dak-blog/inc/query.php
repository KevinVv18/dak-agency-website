<?php
/**
 * El catálogo: una sola lectura de la base de datos para toda la portada.
 *
 * El tema anterior lanzaba una WP_Query por sección —ocho— más la del héroe,
 * las de «lo último» y «lo más leído», y encima llamaba a get_category_by_slug()
 * dentro de dos bucles: unas doce consultas y dieciséis búsquedas de término
 * para pintar una portada.
 *
 * Aquí son DOS consultas: una trae las entradas y otra los términos con su
 * recuento real. El agrupado por sección se hace en PHP, que es gratis.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Tope de entradas que se leen para componer la portada.
 *
 * El blog tiene 55 entradas y crece a tres por semana. El tope existe para
 * que la portada no se degrade sola dentro de tres años; cuando se acerque,
 * la portada tendrá que paginar en vez de subir el número.
 */
const DAK_TOPE_CATALOGO = 240;

/**
 * Entradas por sección en la portada.
 */
const DAK_FILAS_POR_SECCION = 5;

/**
 * Arma el catálogo completo.
 *
 * @return array{
 *     destacada: WP_Post|null,
 *     secciones: array<int, array{term: WP_Term, datos: array, posts: WP_Post[], total: int}>,
 *     total: int,
 *     total_secciones: int
 * }
 */
function dak_catalogo() {
	static $catalogo = null;

	if ( null !== $catalogo ) {
		return $catalogo;
	}

	$consulta = new WP_Query(
		array(
			'post_type'              => 'post',
			'post_status'            => 'publish',
			'posts_per_page'         => DAK_TOPE_CATALOGO,
			'orderby'                => 'date',
			'order'                  => 'DESC',
			'ignore_sticky_posts'    => true,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
		)
	);

	$entradas  = $consulta->posts;
	$destacada = ! empty( $entradas ) ? $entradas[0] : null;

	// Recuentos reales de la taxonomía, en una sola consulta.
	$terminos = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => true,
		)
	);

	$por_slug = array();

	if ( ! is_wp_error( $terminos ) ) {
		foreach ( $terminos as $termino ) {
			if ( in_array( $termino->slug, array( 'uncategorized', 'sin-categoria' ), true ) ) {
				continue;
			}

			$por_slug[ $termino->slug ] = array(
				'term'  => $termino,
				'datos' => dak_seccion_datos( $termino->slug ),
				'posts' => array(),
				'total' => (int) $termino->count,
			);
		}
	}

	// Agrupado en PHP. La destacada no se repite en su propia sección.
	foreach ( $entradas as $entrada ) {
		if ( $destacada && $entrada->ID === $destacada->ID ) {
			continue;
		}

		$seccion = dak_seccion_de( $entrada );

		if ( ! $seccion || ! isset( $por_slug[ $seccion->slug ] ) ) {
			continue;
		}

		if ( count( $por_slug[ $seccion->slug ]['posts'] ) < DAK_FILAS_POR_SECCION ) {
			$por_slug[ $seccion->slug ]['posts'][] = $entrada;
		}
	}

	// Orden del catálogo: primero las ocho conocidas, después cualquier otra.
	$ordenadas = array();

	foreach ( array_keys( dak_secciones() ) as $slug ) {
		if ( isset( $por_slug[ $slug ] ) && ! empty( $por_slug[ $slug ]['posts'] ) ) {
			$ordenadas[] = $por_slug[ $slug ];
			unset( $por_slug[ $slug ] );
		}
	}

	foreach ( $por_slug as $seccion ) {
		if ( ! empty( $seccion['posts'] ) ) {
			$ordenadas[] = $seccion;
		}
	}

	$catalogo = array(
		'destacada'       => $destacada,
		'secciones'       => $ordenadas,
		'total'           => count( $entradas ),
		'total_secciones' => count( $ordenadas ),
	);

	return $catalogo;
}

/**
 * Las secciones que se pintan en la navegación y en las pestañas de canto.
 *
 * Deliberadamente NO pasa por dak_catalogo(): la navegación sale en todas las
 * vistas y no puede costar la lectura de 240 entradas en una página de
 * artículo. Aquí solo se leen los términos, que es una consulta y que
 * WordPress suele tener ya en caché de objetos.
 *
 * @return array<int, array{term: WP_Term, datos: array, total: int}>
 */
function dak_secciones_navegables() {
	static $navegables = null;

	if ( null !== $navegables ) {
		return $navegables;
	}

	$terminos = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => true,
		)
	);

	if ( is_wp_error( $terminos ) ) {
		return array();
	}

	$por_slug = array();

	foreach ( $terminos as $termino ) {
		if ( in_array( $termino->slug, array( 'uncategorized', 'sin-categoria' ), true ) ) {
			continue;
		}

		$por_slug[ $termino->slug ] = array(
			'term'  => $termino,
			'datos' => dak_seccion_datos( $termino->slug ),
			'total' => (int) $termino->count,
		);
	}

	// Orden del catálogo: primero las ocho conocidas, después cualquier otra.
	$navegables = array();

	foreach ( array_keys( dak_secciones() ) as $slug ) {
		if ( isset( $por_slug[ $slug ] ) ) {
			$navegables[] = $por_slug[ $slug ];
			unset( $por_slug[ $slug ] );
		}
	}

	foreach ( $por_slug as $seccion ) {
		$navegables[] = $seccion;
	}

	return $navegables;
}
