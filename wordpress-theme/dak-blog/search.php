<?php
/**
 * Búsqueda dentro del catálogo.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

$dak_busqueda = get_search_query();
$dak_total    = (int) $GLOBALS['wp_query']->found_posts;
?>

<main id="contenido">
	<section class="seccion archivo" style="--sec:var(--tinta)">
		<div class="seccion-banda">
			<div class="contenedor">
				<h1>Búsqueda en el catálogo</h1>
				<span class="cuenta"><?php echo esc_html( dak_cifra( $dak_total, 'resultado', 'resultados' ) ); ?></span>
			</div>
		</div>

		<div class="archivo-intro">
			<div class="contenedor">
				<?php if ( $dak_busqueda ) : ?>
					<p>Resultados para <b>&laquo;<?php echo esc_html( $dak_busqueda ); ?>&raquo;</b>.</p>
				<?php endif; ?>
				<?php get_search_form(); ?>
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
				<div class="contenedor"><p>Ninguna entrada coincide con esa búsqueda. Prueba con una palabra más corta.</p></div>
			</div>
		<?php endif; ?>
	</section>

	<?php get_template_part( 'template-parts/paginacion' ); ?>
</main>

<?php get_footer();
