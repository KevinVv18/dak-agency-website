<?php
/**
 * Entrada individual.
 *
 * Cimientos del mundo aplicados a la lectura. El rediseño editorial a fondo
 * (índice lateral, progreso, ficha de autoría) es la Fase 2 y va junto con el
 * contrato de contenido de _blog-content/.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$dak_post     = get_post();
	$dak_seccion  = dak_seccion_de( $dak_post );
	$dak_slug     = $dak_seccion ? $dak_seccion->slug : '';
	$dak_miniatura = get_post_thumbnail_id( $dak_post );
	?>

	<main id="contenido">
		<article class="articulo" <?php echo dak_var_seccion( $dak_slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>

			<div class="articulo-ficha">
				<div class="contenedor">
					<div class="articulo-meta">
						<?php if ( $dak_seccion ) : ?>
							<a class="etiqueta-seccion" href="<?php echo esc_url( get_category_link( $dak_seccion->term_id ) ); ?>">
								<?php echo esc_html( $dak_seccion->name ); ?>
							</a>
						<?php endif; ?>
					</div>

					<h1><?php the_title(); ?></h1>

					<div class="articulo-datos">
						<span>Por <b><?php echo esc_html( get_the_author() ); ?></b></span>
						<span><?php echo esc_html( dak_fecha_corta( $dak_post->post_date ) ); ?></span>
						<span><?php echo esc_html( (string) dak_minutos( $dak_post ) ); ?> min de lectura</span>
					</div>
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
							'sizes'         => '(min-width: 1280px) 1248px, 100vw',
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

		<?php
		// ── Recirculación: entradas de la misma sección ──────────────
		// Sin sección, category__in vacío devolvería la consulta entera: mejor
		// caer en «lo más reciente del catálogo» de forma explícita.
		$dak_args_rel = array(
			'post_type'              => 'post',
			'posts_per_page'         => 4,
			'post__not_in'           => array( $dak_post->ID ),
			'ignore_sticky_posts'    => true,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
		);

		if ( $dak_seccion ) {
			$dak_args_rel['category__in'] = array( $dak_seccion->term_id );
		}

		$dak_relacionadas = new WP_Query( $dak_args_rel );

		if ( $dak_relacionadas->have_posts() ) :
			?>
			<section class="seccion" <?php echo dak_var_seccion( $dak_slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?> aria-labelledby="sigue-leyendo">
				<div class="seccion-banda">
					<div class="contenedor">
						<span class="codigo"><?php echo esc_html( dak_seccion_datos( $dak_slug )['numero'] ); ?></span>
						<h2 id="sigue-leyendo">Más de <?php echo esc_html( $dak_seccion ? $dak_seccion->name : 'el catálogo' ); ?></h2>

						<?php if ( $dak_seccion ) : ?>
							<a class="seccion-ver" href="<?php echo esc_url( get_category_link( $dak_seccion->term_id ) ); ?>">
								Ver sección <span aria-hidden="true">&rarr;</span>
							</a>
						<?php endif; ?>
					</div>
				</div>

				<?php get_template_part( 'template-parts/columnas' ); ?>

				<ul class="seccion-filas">
					<?php
					foreach ( $dak_relacionadas->posts as $dak_relacionada ) {
						get_template_part( 'template-parts/fila', null, array( 'post' => $dak_relacionada ) );
					}
					?>
				</ul>
			</section>
			<?php
		endif;

		wp_reset_postdata();
		?>
	</main>

	<?php
endwhile;

get_footer();
