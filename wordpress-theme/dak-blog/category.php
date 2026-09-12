<?php
/**
 * Archivo de sección: una sección del catálogo, abierta.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

$dak_termino     = get_queried_object();
$dak_datos       = dak_seccion_datos( $dak_termino->slug );
$dak_descripcion = term_description( $dak_termino );
?>

<main id="contenido">
	<section class="seccion archivo" <?php echo dak_var_seccion( $dak_termino->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
		<div class="seccion-banda">
			<div class="contenedor">
				<span class="codigo"><?php echo esc_html( $dak_datos['numero'] ); ?></span>
				<p class="banda-nombre"><?php echo esc_html( $dak_termino->name ); ?></p>
				<span class="cuenta"><?php echo esc_html( dak_cifra( $dak_termino->count, 'entrada', 'entradas' ) ); ?></span>
			</div>
		</div>

		<div class="archivo-portada">
			<div class="contenedor">
				<h1><?php echo esc_html( $dak_termino->name ); ?></h1>
			</div>
		</div>

		<?php if ( $dak_descripcion ) : ?>
			<div class="archivo-intro">
				<div class="contenedor"><?php echo wp_kses_post( $dak_descripcion ); ?></div>
			</div>
		<?php endif; ?>

		<?php if ( have_posts() ) : ?>
			<?php get_template_part( 'template-parts/columnas' ); ?>

			<ul class="seccion-filas">
				<?php
				while ( have_posts() ) {
					the_post();
					get_template_part( 'template-parts/fila', null, array( 'post' => get_post() ) );
				}
				?>
			</ul>
		<?php else : ?>
			<div class="archivo-vacio">
				<div class="contenedor"><p>Todavía no hay entradas en esta sección.</p></div>
			</div>
		<?php endif; ?>
	</section>

	<?php get_template_part( 'template-parts/paginacion' ); ?>
</main>

<?php get_footer();
