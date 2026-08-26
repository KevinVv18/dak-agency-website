<?php
/**
 * Formulario de búsqueda.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

$dak_id = 'buscar-' . wp_unique_id();
?>
<form class="buscador" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="solo-lectores" for="<?php echo esc_attr( $dak_id ); ?>">Buscar en el catálogo</label>
	<input id="<?php echo esc_attr( $dak_id ); ?>" type="search" name="s"
		value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Busca tu duda…">
	<button type="submit">Buscar</button>
</form>
