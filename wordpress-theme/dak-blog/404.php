<?php
/**
 * Referencia no encontrada.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<main id="contenido">
	<section class="error-404">
		<div class="contenedor">
			<p class="codigo">Error 404 · Referencia no encontrada</p>
			<h1>Esa entrada no está en el catálogo</h1>
			<p>
				Puede que el enlace esté mal escrito o que la entrada haya cambiado de sitio.
				Busca por palabra, o baja al índice de secciones.
			</p>
			<?php get_search_form(); ?>
		</div>
	</section>

	<?php
	$dak_recientes = new WP_Query(
		array(
			'post_type'              => 'post',
			'posts_per_page'         => 6,
			'ignore_sticky_posts'    => true,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
		)
	);

	if ( $dak_recientes->have_posts() ) :
		?>
		<section class="seccion" style="--sec:var(--tinta)" aria-labelledby="recientes-404">
			<div class="seccion-banda">
				<div class="contenedor">
					<h2 id="recientes-404">Lo más reciente del catálogo</h2>
				</div>
			</div>

			<ul class="seccion-filas">
				<?php
				foreach ( $dak_recientes->posts as $dak_entrada ) {
					get_template_part(
						'template-parts/fila',
						null,
						array(
							'post'            => $dak_entrada,
							'mostrar_seccion' => true,
						)
					);
				}
				?>
			</ul>
		</section>
		<?php
	endif;

	wp_reset_postdata();
	?>
</main>

<?php get_footer();
