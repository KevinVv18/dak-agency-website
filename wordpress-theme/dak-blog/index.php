<?php
/**
 * Respaldo del catálogo: cualquier listado que no tenga plantilla propia.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<main id="contenido">
	<section class="seccion archivo" style="--sec:var(--tinta)">
		<div class="seccion-banda">
			<div class="contenedor">
				<h1><?php echo esc_html( wp_get_document_title() ); ?></h1>
			</div>
		</div>

		<?php if ( have_posts() ) : ?>
			<ul class="seccion-filas">
				<?php
				while ( have_posts() ) {
					the_post();
					get_template_part(
						'template-parts/fila',
						null,
						array(
							'post'            => get_post(),
							'mostrar_seccion' => true,
						)
					);
				}
				?>
			</ul>
		<?php else : ?>
			<div class="archivo-vacio">
				<div class="contenedor"><p>No hay entradas que mostrar.</p></div>
			</div>
		<?php endif; ?>
	</section>

	<?php get_template_part( 'template-parts/paginacion' ); ?>
</main>

<?php get_footer();
