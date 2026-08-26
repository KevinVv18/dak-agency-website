<?php
/**
 * Ayudantes del tema.
 *
 * Las ocho secciones son el eje de este mundo: dan el número, el color y el
 * orden del catálogo. El mapa vive aquí y no en las plantillas para que
 * portada, archivo, artículo y pestañas de canto lean siempre lo mismo.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Las ocho secciones del catálogo, en su orden de publicación.
 *
 * El orden importa: es el número que se imprime (01…08) y el orden en que
 * salen las bandas en la portada. Una categoría que no esté aquí sigue
 * funcionando — cae en el color por defecto y se ordena al final.
 *
 * @return array<string, array{numero:string, color:string, corto:string}>
 */
function dak_secciones() {
	static $secciones = null;

	if ( null === $secciones ) {
		$secciones = array(
			'seo-buscadores' => array( 'numero' => '01', 'color' => '#7B1FA2', 'corto' => 'SEO' ),
			'diseno-web'     => array( 'numero' => '02', 'color' => '#0F4C9C', 'corto' => 'Web' ),
			'redes-sociales' => array( 'numero' => '03', 'color' => '#B3123F', 'corto' => 'Redes' ),
			'publicidad'     => array( 'numero' => '04', 'color' => '#AA4400', 'corto' => 'Ads' ),
			'automatizacion' => array( 'numero' => '05', 'color' => '#00695C', 'corto' => 'Auto' ),
			'branding'       => array( 'numero' => '06', 'color' => '#1F1F26', 'corto' => 'Marca' ),
			'por-rubro'      => array( 'numero' => '07', 'color' => '#4A5D23', 'corto' => 'Rubro' ),
			'guias-precios'  => array( 'numero' => '08', 'color' => '#1B5E20', 'corto' => 'Guías' ),
		);
	}

	return $secciones;
}

/**
 * Datos de una sección por su slug, con respaldo para categorías nuevas.
 *
 * @param string $slug Slug de la categoría.
 * @return array{numero:string, color:string, corto:string}
 */
function dak_seccion_datos( $slug ) {
	$secciones = dak_secciones();

	if ( isset( $secciones[ $slug ] ) ) {
		return $secciones[ $slug ];
	}

	return array( 'numero' => '—', 'color' => '#3F3F47', 'corto' => '' );
}

/**
 * Categoría principal de una entrada, saltando «sin categoría».
 *
 * @param int|WP_Post|null $post Entrada.
 * @return WP_Term|null
 */
function dak_seccion_de( $post = null ) {
	$categorias = get_the_category( $post ? get_post( $post )->ID : null );

	if ( empty( $categorias ) ) {
		return null;
	}

	foreach ( $categorias as $categoria ) {
		if ( ! in_array( $categoria->slug, array( 'uncategorized', 'sin-categoria' ), true ) ) {
			return $categoria;
		}
	}

	return $categorias[0];
}

/**
 * Declaración inline que fija --sec para un bloque.
 *
 * Todo lo que hay dentro (etiquetas, filetes, bandas, pestañas) hereda esta
 * variable, así que el color de sección se declara UNA vez por bloque.
 *
 * @param string $slug Slug de la categoría.
 * @return string Atributo style listo para imprimir, ya escapado.
 */
function dak_var_seccion( $slug ) {
	$datos = dak_seccion_datos( $slug );

	return 'style="--sec:' . esc_attr( $datos['color'] ) . '"';
}

/*
 * Aquí vivía dak_codigo(), que imprimía el ID de WordPress con relleno a
 * cuatro cifras como código de referencia en cada fila y en la ficha del
 * artículo. Se retiró el 26-ago-2026: para el lector era ruido, porque un
 * ID de base de datos no significa nada fuera de la base de datos. En un
 * catálogo de verdad el código sirve para pedir la referencia; aquí no se
 * pide nada, se entra a leer.
 *
 * La numeración que SÍ se queda es la de las ocho secciones (01…08): esa
 * ordena el catálogo y es la que sostiene el índice, las bandas y las
 * pestañas de canto.
 */

/**
 * Minutos de lectura.
 *
 * str_word_count() cuenta mal el castellano: rompe en cada tilde y en la ñ,
 * así que «posicionamiento orgánico» le salían tres palabras. Aquí se parte
 * por espacios en modo multibyte.
 *
 * @param int|WP_Post|null $post Entrada.
 * @return int Minutos, mínimo 1.
 */
function dak_minutos( $post = null ) {
	$texto    = wp_strip_all_tags( strip_shortcodes( get_post( $post )->post_content ) );
	$palabras = preg_split( '/\s+/u', trim( $texto ), -1, PREG_SPLIT_NO_EMPTY );
	$total    = is_array( $palabras ) ? count( $palabras ) : 0;

	return max( 1, (int) ceil( $total / 200 ) );
}

/**
 * Extracto limpio y recortado por palabras enteras.
 *
 * @param int|WP_Post|null $post     Entrada.
 * @param int              $palabras Tope de palabras.
 * @return string
 */
function dak_extracto( $post = null, $palabras = 26 ) {
	$extracto = wp_strip_all_tags( get_the_excerpt( $post ) );

	return wp_trim_words( $extracto, $palabras, '…' );
}

/**
 * Fecha corta en castellano, con cifras tabulares en mente.
 *
 * date_i18n() depende de la configuración de idioma del WordPress vivo, que
 * se administra a mano y podría no estar en es_PE. Los meses van fijos.
 *
 * @param string $fecha Fecha en formato de WordPress.
 * @return string
 */
function dak_fecha_corta( $fecha ) {
	$meses = array( 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC' );
	$marca = strtotime( $fecha );

	return $meses[ (int) gmdate( 'n', $marca ) - 1 ] . ' ' . gmdate( 'j', $marca ) . ', ' . gmdate( 'Y', $marca );
}

/**
 * Mayúsculas seguras con acentos (ñ → Ñ, ó → Ó).
 *
 * @param string $texto Texto.
 * @return string
 */
function dak_mayus( $texto ) {
	return function_exists( 'mb_strtoupper' ) ? mb_strtoupper( $texto, 'UTF-8' ) : strtoupper( $texto );
}

/**
 * Cifra con su sustantivo concordado.
 *
 * Una sección con una sola entrada decía «1 entradas». En un catálogo, donde
 * la mitad de lo que se lee son cifras, una concordancia mal hecha se nota.
 *
 * @param int    $n        Cantidad.
 * @param string $singular Sustantivo en singular.
 * @param string $plural   Sustantivo en plural.
 * @return string
 */
function dak_cifra( $n, $singular, $plural ) {
	$n = (int) $n;

	return $n . ' ' . ( 1 === $n ? $singular : $plural );
}
