<?php
/**
 * Respaldo del catálogo: cualquier listado que no tenga plantilla propia.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

/*
 * Sin tag.php, author.php ni date.php en el tema, TODOS los archivos de
 * etiqueta, autor y fecha caen aqui, y son URLs rastreables. Asi que esta
 * plantilla necesita un h1 de verdad que diga de que archivo se trata.
 */
$dak_titulo = get_the_archive_title();

if ( ! $dak_titulo ) {
	$dak_titulo = 'Catálogo';
}
?>

<main id="contenido">
	<section class="seccion archivo" style="--sec:var(--tinta)">
		<div class="seccion-banda">
			<div class="contenedor">
				<p class="banda-nombre">Catálogo</p>
			</div>
		</div>

		<div class="archivo-portada">
			<div class="contenedor">
				<h1><?php echo wp_kses_post( $dak_titulo ); ?></h1>
			</div>
		</div>

		<?php if ( have_posts() ) : ?>
			<?php get_template_part( 'template-parts/columnas' ); ?>

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
