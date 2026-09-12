<?php
/**
 * Formulario de búsqueda.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

/*
 * Un id unico por formulario: get_search_form() puede llamarse mas de una vez
 * en la misma pagina (la busqueda lo pinta arriba y el 404 tambien).
 * Contador global, no `static`: `static` a nivel de archivo es error de
 * sintaxis en PHP. Tampoco se usa wp_unique_id() para no atarse a la version
 * de WordPress que lo introdujo.
 */
global $dak_buscador_n;
$dak_buscador_n = isset( $dak_buscador_n ) ? $dak_buscador_n + 1 : 1;
$dak_id         = 'buscar-' . $dak_buscador_n;
?>
<form class="buscador" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="solo-lectores" for="<?php echo esc_attr( $dak_id ); ?>">Buscar en el catálogo</label>
	<input id="<?php echo esc_attr( $dak_id ); ?>" type="search" name="s"
		value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Busca tu duda…">
	<button type="submit">Buscar</button>
</form>
