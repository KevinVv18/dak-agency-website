<?php
/**
 * Página: las seis páginas pilar de servicio viven aquí.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$dak_miniatura = get_post_thumbnail_id();
	?>

	<main id="contenido">
		<article class="articulo">
			<div class="articulo-ficha">
				<div class="contenedor">
					<div class="articulo-meta">
						<span class="etiqueta-seccion" style="--sec:var(--casa)">Servicio</span>
					</div>

					<h1><?php the_title(); ?></h1>
				</div>
			</div>

			<?php if ( $dak_miniatura ) : ?>
				<figure class="articulo-figura">
					<?php
					echo wp_get_attachment_image(
						$dak_miniatura,
						'large',
						false,
						array(
							// La banda ya no recorta a 16:9: la imagen se monta a su
							// proporción con tope de 30rem de alto, así que ni la más
							// apaisada llega a pedir el ancho entero del contenedor.
							'sizes'         => '(min-width: 900px) 900px, 100vw',
							'loading'       => 'eager',
							'fetchpriority' => 'high',
							'decoding'      => 'async',
						)
					);
					?>
				</figure>
			<?php endif; ?>

			<div class="articulo-cuerpo">
				<?php the_content(); ?>
			</div>

			<div class="articulo-cierre">
				<a class="articulo-volver" href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<span aria-hidden="true">&larr;</span> Volver al catálogo
				</a>
			</div>
		</article>
	</main>

	<?php
endwhile;

get_footer();
