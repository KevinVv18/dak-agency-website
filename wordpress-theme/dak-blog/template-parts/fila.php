<?php
/**
 * La fila de catálogo: referencia · descripción · precio.
 *
 * Es la unidad de todo este mundo y la reutilizan la portada, el archivo de
 * sección, la búsqueda y la recirculación del artículo.
 *
 * La miniatura va en «thumbnail» (150×150, ~7 KB) y se pinta a 72 px, así que
 * en pantalla de 2× sigue nítida. Va SIEMPRE en lazy: la única imagen que
 * carga con prioridad en toda la portada es la del recuadro destacado, de modo
 * que las miniaturas no pueden tocar el LCP. Con width y height explícitos no
 * hay salto de layout.
 *
 * La columna derecha es el precio de la fila: lo que le cuesta al lector, que
 * son minutos.
 *
 * @package dak-blog
 *
 * @var array $args {
 *     @type WP_Post $post            La entrada.
 *     @type bool    $mostrar_seccion Si se pinta el rótulo de sección.
 * }
 */

defined( 'ABSPATH' ) || exit;

$dak_args = ( isset( $args ) && is_array( $args ) ) ? $args : array();
$dak_post = isset( $dak_args['post'] ) ? $dak_args['post'] : get_post();

if ( ! $dak_post ) {
	return;
}

$dak_seccion         = dak_seccion_de( $dak_post );
$dak_slug            = $dak_seccion ? $dak_seccion->slug : '';
$dak_datos           = dak_seccion_datos( $dak_slug );
$dak_mostrar_seccion = ! empty( $dak_args['mostrar_seccion'] );
$dak_miniatura       = get_post_thumbnail_id( $dak_post );
?>
<li class="fila" <?php echo dak_var_seccion( $dak_slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
	<a href="<?php echo esc_url( get_permalink( $dak_post ) ); ?>">
		<span class="fila-figura">
			<?php
			if ( $dak_miniatura ) {
				echo wp_get_attachment_image(
					$dak_miniatura,
					'thumbnail',
					false,
					array(
						'loading'  => 'lazy',
						'decoding' => 'async',
						'alt'      => '',
					)
				);
			} else {
				// Sin miniatura, la referencia la da el número de sección:
				// un hueco blanco rompería la retícula del catálogo.
				echo '<span class="fila-sin-imagen" aria-hidden="true">' . esc_html( $dak_datos['numero'] ) . '</span>';
			}
			?>
		</span>

		<div class="fila-descripcion">
			<p class="fila-meta">
				<?php if ( $dak_mostrar_seccion && $dak_seccion ) : ?>
					<span class="fila-rotulo"><?php echo esc_html( dak_mayus( $dak_seccion->name ) ); ?></span>
				<?php endif; ?>
				<span><?php echo esc_html( dak_fecha_corta( $dak_post->post_date ) ); ?></span>
			</p>

			<h3><?php echo esc_html( get_the_title( $dak_post ) ); ?></h3>

			<p class="fila-extracto"><?php echo esc_html( dak_extracto( $dak_post, 26 ) ); ?></p>
		</div>

		<span class="dato"><?php echo esc_html( (string) dak_minutos( $dak_post ) ); ?> min</span>
	</a>
</li>
