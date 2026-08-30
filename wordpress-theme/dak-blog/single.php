<?php
/**
 * Entrada individual: el registro de canto.
 *
 * ESTRUCTURA (seed 1f94094b, candidato 6 de la lista fundamentada).
 *
 * La entrada hereda el gesto de firma de la portada en vez de inventar uno:
 * las pestañas del canto derecho, que en el índice son las ocho secciones,
 * aquí son LOS APARTADOS DE ESTA ENTRADA. Misma pieza, mismo CSS, contenido
 * distinto — que es como se comporta el pulgar en un catálogo: siempre dice
 * dónde estás, solo cambia respecto a qué.
 *
 * El margen izquierdo es el REGISTRO: el filete vertical con los controles de
 * compartir. Entre los dos, la columna de lectura. Ningún lado queda vacío y
 * ningún componente es nuevo.
 *
 * CIRCUITO — esto funciona sobre las 58 entradas ya publicadas sin tocar
 * _blog-content/: las pestañas se construyen desde los h2, de los que hay
 * mediana 9 y máximo 13 por entrada. Los dos apartados que el generador
 * repite —«Cómo lo hacemos en DAK» (45/58) y «Preguntas frecuentes» (41/58)—
 * se reconocen por su texto y reciben tratamiento propio, tambien sin tocar
 * el contenido.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$dak_post      = get_post();
	$dak_seccion   = dak_seccion_de( $dak_post );
	$dak_slug      = $dak_seccion ? $dak_seccion->slug : '';
	$dak_datos_sec = dak_seccion_datos( $dak_slug );
	$dak_miniatura = get_post_thumbnail_id( $dak_post );
	$dak_url       = get_permalink( $dak_post );
	$dak_titulo    = get_the_title();

	// Controles de compartir: se definen una vez y se usan en el registro
	// (escritorio) y al cierre (móvil, donde no hay márgenes que usar).
	ob_start();
	?>
	<a class="compartir-boton" target="_blank" rel="noopener"
		aria-label="Compartir esta entrada en WhatsApp"
		href="https://api.whatsapp.com/send?text=<?php echo rawurlencode( $dak_titulo . ' ' . $dak_url ); ?>">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
			<path d="M20.5 11.7a8.2 8.2 0 0 1-12.3 7.1L3.5 20.5l1.7-4.6a8.2 8.2 0 1 1 15.3-4.2z"/>
			<path d="M8.9 9.1c0 3.3 2.7 6 6 6"/>
		</svg>
	</a>
	<a class="compartir-boton" target="_blank" rel="noopener"
		aria-label="Compartir esta entrada en Facebook"
		href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( $dak_url ); ?>">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
			<path d="M14.8 3.5h-2.3a3.4 3.4 0 0 0-3.4 3.4v2.4H7v3.2h2.1v8h3.3v-8h2.4l.5-3.2h-2.9V7.2c0-.5.4-.9.9-.9h1.5z"/>
		</svg>
	</a>
	<button class="compartir-boton es-copiar" type="button"
		aria-label="Copiar el enlace de esta entrada"
		data-url="<?php echo esc_url( $dak_url ); ?>">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
			<path d="M10 13.2a4.8 4.8 0 0 0 7.2.5l2.9-2.9A4.8 4.8 0 0 0 13.3 4l-1.6 1.6"/>
			<path d="M14 10.8a4.8 4.8 0 0 0-7.2-.5l-2.9 2.9A4.8 4.8 0 0 0 10.7 20l1.6-1.6"/>
		</svg>
	</button>
	<?php
	$dak_compartir = ob_get_clean();
	?>

	<main id="contenido">
		<article class="articulo" <?php echo dak_var_seccion( $dak_slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>

			<?php // ── Cabecera: el titular vive en la columna de lectura ── ?>
			<div class="articulo-ficha">
				<div class="contenedor">
					<div class="articulo-rejilla">
						<div class="articulo-cabeza">
							<?php if ( $dak_seccion ) : ?>
								<a class="etiqueta-seccion" href="<?php echo esc_url( get_category_link( $dak_seccion->term_id ) ); ?>">
									<?php echo esc_html( $dak_datos_sec['numero'] ); ?> · <?php echo esc_html( $dak_seccion->name ); ?>
								</a>
							<?php endif; ?>

							<h1><?php the_title(); ?></h1>

							<?php
							/*
							 * La entradilla. El circuito ya la escribe para las 59 entradas
							 * publicadas y no es una metadescripción disfrazada: son 187
							 * caracteres de media de prosa editorial, y solo 4 de 59 acaban
							 * en llamada a la acción. Aquí hace dos trabajos: le dice al
							 * lector de qué va esto antes de que decida entrar, y le da a la
							 * columna del titular el cuerpo que le faltaba al lado de la
							 * lámina.
							 */
							$dak_entradilla = dak_extracto( $dak_post, 48 );
							if ( $dak_entradilla ) :
								?>
								<p class="articulo-entradilla"><?php echo esc_html( $dak_entradilla ); ?></p>
							<?php endif; ?>
						</div>

						<?php
						/*
						 * LA LÁMINA. Va en la columna 3 —la misma del canto de
						 * apartados, con la que comparte el filete izquierdo— y a su
						 * proporción real, sin recortar.
						 *
						 * Por qué: el circuito de _blog-content/ no entrega fotografías,
						 * entrega láminas con tipografía impresa dentro (1080×1350 en 50
						 * de las 60). Meterlas en una banda a sangre las decapita. Una
						 * lámina se monta a su medida o no se pone.
						 *
						 * Al pintarse a 340 px en vez de a 1248 deja de ser, además, el
						 * peso muerto del LCP.
						 */
						if ( $dak_miniatura ) :
							?>
							<figure class="articulo-lamina">
								<p class="rotulo lamina-rotulo">Lámina</p>
								<span class="lamina-marco">
									<?php
									echo wp_get_attachment_image(
										$dak_miniatura,
										'medium_large',
										false,
										array(
											'sizes'         => '(min-width: 1181px) 340px, (min-width: 901px) 352px, 92vw',
											'loading'       => 'eager',
											'fetchpriority' => 'high',
											'decoding'      => 'async',
										)
									);
									?>
								</span>
							</figure>
						<?php endif; ?>
					</div>
				</div>
			</div>

			<?php // ── Tira de ficha técnica, a sangre ─────────────────── ?>
			<div class="ficha-tira">
				<div class="contenedor">
					<dl>
						<div><dt>Firma</dt><dd><?php echo esc_html( get_the_author() ); ?></dd></div>
						<div><dt>Publicado</dt><dd><?php echo esc_html( dak_fecha_corta( $dak_post->post_date ) ); ?></dd></div>
						<?php if ( get_post_modified_time( 'U', false, $dak_post ) > get_post_time( 'U', false, $dak_post ) + DAY_IN_SECONDS ) : ?>
							<div><dt>Revisado</dt><dd><?php echo esc_html( dak_fecha_corta( $dak_post->post_modified ) ); ?></dd></div>
						<?php endif; ?>
						<div><dt>Lectura</dt><dd><?php echo esc_html( (string) dak_minutos( $dak_post ) ); ?> min</dd></div>
						<div class="ficha-tira-apartados"><dt>Apartados</dt><dd data-apartados>&mdash;</dd></div>
					</dl>
				</div>
			</div>


			<?php // ── El cuerpo, entre el registro y el canto ─────────── ?>
			<div class="contenedor">
				<div class="articulo-rejilla es-cuerpo">

					<aside class="articulo-registro" aria-label="Compartir esta entrada">
						<div class="registro-pegado">
							<p class="rotulo registro-titulo">Compartir</p>
							<?php echo $dak_compartir; // phpcs:ignore WordPress.Security.EscapeOutput ?>
						</div>
					</aside>

					<div class="articulo-columna">
						<?php // Índice plegado: la contrapartida del canto donde no hay canto ?>
						<details class="indice-plegado">
							<summary><span class="rotulo">Apartados de esta entrada</span></summary>
							<nav aria-label="Índice de la entrada"><ol></ol></nav>
						</details>

						<div class="articulo-cuerpo">
							<?php the_content(); ?>
						</div>

						<div class="articulo-cierre">
							<div class="compartir-fila">
								<p class="rotulo">Compartir</p>
								<?php echo $dak_compartir; // phpcs:ignore WordPress.Security.EscapeOutput ?>
							</div>

							<a class="articulo-volver" href="<?php echo esc_url( home_url( '/' ) ); ?>">
								<span aria-hidden="true">&larr;</span> Volver al catálogo
							</a>
						</div>
					</div>

					<?php
					/*
					 * El canto de la entrada. Va DENTRO de la retícula, no fijo al
					 * viewport: es el canto del pliego, no el borde de la pantalla,
					 * y así el margen derecho lleva contenido en vez de aire.
					 * Lo rellena assets/js/blog.js desde los h2 del cuerpo.
					 */
					?>
					<aside class="articulo-canto" aria-label="Apartados de esta entrada"></aside>

				</div>
			</div>
		</article>

		<?php
		// ── Recirculación: entradas de la misma sección ──────────────
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
						<span class="codigo"><?php echo esc_html( $dak_datos_sec['numero'] ); ?></span>
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
