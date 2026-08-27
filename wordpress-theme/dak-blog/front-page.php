<?php
/**
 * Portada: la tapa del catálogo, el índice de secciones, la entrada más
 * reciente en recuadro y las secciones con sus filas.
 *
 * Toda la página se compone con DOS consultas (ver inc/query.php) y carga
 * UNA sola imagen: la del recuadro.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

get_header();

$dak_catalogo  = dak_catalogo();
$dak_destacada = $dak_catalogo['destacada'];
$dak_ultima    = get_lastpostmodified( 'blog' );
?>

<main id="contenido">

	<?php // ── La tapa ─────────────────────────────────────────── ?>
	<section class="tapa">
		<div class="contenedor">
			<div>
				<h1>Marketing digital explicado para negocios de Chiclayo</h1>

				<p class="tapa-bajada">
					Cada entrada resuelve una duda concreta de un negocio de Lambayeque, con
					precios en soles y ejemplos de aquí. Busca la tuya por sección, o empieza
					por la más reciente.
				</p>
			</div>

			<div class="edicion">
				<p class="rotulo edicion-titulo">Edición vigente</p>
				<dl>
					<?php if ( $dak_ultima ) : ?>
						<dt>Actualizado</dt>
						<dd><?php echo esc_html( dak_fecha_corta( $dak_ultima ) ); ?></dd>
					<?php endif; ?>

					<dt>Entradas</dt>
					<dd><?php echo esc_html( (string) $dak_catalogo['total'] ); ?></dd>

					<dt>Secciones</dt>
					<dd><?php echo esc_html( (string) $dak_catalogo['total_secciones'] ); ?></dd>
				</dl>
			</div>
		</div>
	</section>

	<?php // ── Índice de secciones ─────────────────────────────── ?>
	<?php if ( ! empty( $dak_catalogo['secciones'] ) ) : ?>
		<section class="indice" id="indice" aria-labelledby="indice-titulo">
			<div class="contenedor">
				<div class="indice-titulo">
					<h2 id="indice-titulo">Índice de secciones</h2>
					<span class="cuenta"><?php echo esc_html( dak_cifra( $dak_catalogo['total_secciones'], 'sección', 'secciones' ) ); ?></span>
				</div>

				<div class="indice-rejilla">
					<?php foreach ( $dak_catalogo['secciones'] as $dak_sec ) : ?>
						<a class="indice-item"
							href="#seccion-<?php echo esc_attr( $dak_sec['term']->slug ); ?>"
							<?php echo dak_var_seccion( $dak_sec['term']->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
							<span class="codigo"><?php echo esc_html( $dak_sec['datos']['numero'] ); ?></span>
							<span class="nombre"><?php echo esc_html( $dak_sec['term']->name ); ?></span>
							<span class="cuenta"><?php echo esc_html( dak_cifra( $dak_sec['total'], 'entrada', 'entradas' ) ); ?></span>
						</a>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php // ── La entrada más reciente, en recuadro ────────────── ?>
	<?php
	if ( $dak_destacada ) :
		$dak_sec_dest = dak_seccion_de( $dak_destacada );
		$dak_slug_dest = $dak_sec_dest ? $dak_sec_dest->slug : '';
		$dak_miniatura = get_post_thumbnail_id( $dak_destacada );
		?>
		<section class="destacada" aria-labelledby="destacada-titulo">
			<div class="contenedor">
				<article class="destacada-marco <?php echo $dak_miniatura ? '' : 'sin-imagen'; ?>" <?php echo dak_var_seccion( $dak_slug_dest ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
					<?php if ( $dak_miniatura ) : ?>
						<figure class="destacada-figura">
							<?php
							/*
							 * Se pide «large» para que WordPress arme el srcset con los tamaños
							 * proporcionales que ya existen en el servidor; el encuadre lo
							 * decide object-fit.
							 *
							 * Sin fetchpriority a propósito: este recuadro queda por debajo del
							 * pliegue —seguro en móvil, y también en escritorio con la tapa y el
							 * índice delante—, así que marcarlo como prioritario solo le robaba
							 * ancho de banda a la precarga de Archivo, que sí compone la LCP
							 * real de esta página: el h1. Se queda en «eager» para que no se
							 * difiera, pero sin adelantar a la fuente.
							 */
							echo wp_get_attachment_image(
								$dak_miniatura,
								'large',
								false,
								array(
									'sizes'    => '(min-width: 1000px) 40vw, 100vw',
									'loading'  => 'eager',
									'decoding' => 'async',
								)
							);
							?>
							<p class="rotulo destacada-sello">Lo más reciente</p>
						</figure>
					<?php endif; ?>

					<div class="destacada-cuerpo">
						<div class="destacada-meta">
							<?php if ( $dak_sec_dest ) : ?>
								<span class="etiqueta-seccion"><?php echo esc_html( $dak_sec_dest->name ); ?></span>
							<?php endif; ?>
							<span class="meta-dato">
								<?php echo esc_html( dak_fecha_corta( $dak_destacada->post_date ) ); ?>
								&nbsp;·&nbsp;
								<?php echo esc_html( (string) dak_minutos( $dak_destacada ) ); ?> min
							</span>
						</div>

						<h2 id="destacada-titulo">
							<a href="<?php echo esc_url( get_permalink( $dak_destacada ) ); ?>">
								<?php echo esc_html( get_the_title( $dak_destacada ) ); ?>
							</a>
						</h2>

						<p class="destacada-extracto"><?php echo esc_html( dak_extracto( $dak_destacada, 44 ) ); ?></p>

						<div class="destacada-pie">
							<a class="destacada-leer" href="<?php echo esc_url( get_permalink( $dak_destacada ) ); ?>">
								Leer la entrada <span aria-hidden="true">&rarr;</span>
							</a>
						</div>
					</div>
				</article>
			</div>
		</section>
	<?php endif; ?>

	<?php // ── Las secciones ───────────────────────────────────── ?>
	<?php foreach ( $dak_catalogo['secciones'] as $dak_sec ) : ?>
		<?php
		$dak_termino  = $dak_sec['term'];
		$dak_restante = $dak_sec['total'] - count( $dak_sec['posts'] );
		?>
		<section class="seccion"
			id="seccion-<?php echo esc_attr( $dak_termino->slug ); ?>"
			<?php echo dak_var_seccion( $dak_termino->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			aria-labelledby="titulo-<?php echo esc_attr( $dak_termino->slug ); ?>">

			<div class="seccion-banda">
				<div class="contenedor">
					<span class="codigo"><?php echo esc_html( $dak_sec['datos']['numero'] ); ?></span>
					<h2 id="titulo-<?php echo esc_attr( $dak_termino->slug ); ?>"><?php echo esc_html( $dak_termino->name ); ?></h2>
					<span class="cuenta"><?php echo esc_html( dak_cifra( $dak_sec['total'], 'entrada', 'entradas' ) ); ?></span>

					<a class="seccion-ver" href="<?php echo esc_url( get_category_link( $dak_termino->term_id ) ); ?>">
						Ver sección <span aria-hidden="true">&rarr;</span>
					</a>
				</div>
			</div>

			<?php get_template_part( 'template-parts/columnas' ); ?>

			<ul class="seccion-filas">
				<?php
				foreach ( $dak_sec['posts'] as $dak_entrada ) {
					get_template_part( 'template-parts/fila', null, array( 'post' => $dak_entrada ) );
				}
				?>
			</ul>

			<?php if ( $dak_restante > 0 ) : ?>
				<a class="seccion-resto" href="<?php echo esc_url( get_category_link( $dak_termino->term_id ) ); ?>">
					Ver <?php echo esc_html( dak_cifra( $dak_restante, 'entrada más', 'entradas más' ) ); ?> de <?php echo esc_html( $dak_termino->name ); ?>
					<span aria-hidden="true">&rarr;</span>
				</a>
			<?php endif; ?>
		</section>
	<?php endforeach; ?>

</main>

<?php get_footer(); ?>
