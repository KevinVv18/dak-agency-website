<?php
/**
 * Paginación del catálogo.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

$dak_enlaces = paginate_links(
	array(
		'type'      => 'array',
		'mid_size'  => 1,
		'prev_text' => '&larr; Anterior',
		'next_text' => 'Siguiente &rarr;',
	)
);

if ( empty( $dak_enlaces ) ) {
	return;
}
?>
<nav class="paginacion" aria-label="Paginación del catálogo">
	<div class="contenedor">
		<?php
		foreach ( $dak_enlaces as $dak_enlace ) {
			echo wp_kses_post( $dak_enlace );
		}
		?>
	</div>
</nav>
