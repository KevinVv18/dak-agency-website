<?php
/**
 * La contraportada.
 *
 * En un catálogo comercial la contraportada es la superficie de venta más
 * fuerte que hay: dice cómo se pide, quién lo vende y en qué condiciones.
 * Por eso este pie no es una rejilla de enlaces, sino cuatro bandas:
 * el cierre con su procedimiento, el índice repetido, las condiciones y
 * el pie de imprenta.
 *
 * La ficha de LA CASA es deliberadamente el mismo objeto que la caja de
 * «Edición vigente» de la tapa: abre y cierra la página con la misma pieza.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

$dak_secciones_pie = dak_secciones_navegables();
$dak_ultima        = get_lastpostmodified( 'blog' );
?>

<footer class="pie">

	<?php // ── Banda 1: el cierre ──────────────────────────────── ?>
	<section class="pie-cierre" aria-labelledby="pie-cierre-titulo">
		<div class="contenedor">
			<div class="pie-cierre-rejilla">
				<div class="pie-cierre-texto">
					<h2 id="pie-cierre-titulo">
						Este catálogo existe para que puedas hacerlo tú.
						<em>Si prefieres que lo hagamos nosotros, se pide así.</em>
					</h2>

					<ol class="pie-pasos">
						<li>
							<span class="paso-num">01</span>
							<span class="paso-texto">
								<b>Elige la sección</b> que se parece a tu problema y lee la entrada.
								Ahí está el precio de referencia y qué incluye.
							</span>
						</li>
						<li>
							<span class="paso-num">02</span>
							<span class="paso-texto">
								<b>Escríbenos por WhatsApp</b> con lo que leíste. No hace falta que
								sepas qué servicio pedir: para eso es la conversación.
							</span>
						</li>
						<li>
							<span class="paso-num">03</span>
							<span class="paso-texto">
								<b>Te mandamos una propuesta</b> con alcance y precio cerrado.
								Si no encaja, no pasa nada y el catálogo sigue aquí.
							</span>
						</li>
					</ol>

					<div class="pie-acciones">
						<a class="pie-boton" href="https://wa.me/51906765040" target="_blank" rel="noopener">
							WhatsApp +51 906 765 040
						</a>
						<a class="pie-boton es-secundario" href="https://plan.dakagency.net/agendar.html" target="_blank" rel="noopener">
							Agenda una reunión
						</a>
						<a class="pie-boton es-secundario" href="https://plan.dakagency.net/" target="_blank" rel="noopener">
							Calcula tu presupuesto
						</a>
					</div>
				</div>

				<div class="ficha-casa">
					<p class="rotulo ficha-casa-titulo">La casa</p>
					<dl>
						<dt>Quién</dt>
						<dd>DAK Agency</dd>

						<dt>Dónde</dt>
						<dd>Chiclayo, Lambayeque</dd>

						<dt>WhatsApp</dt>
						<dd><a href="https://wa.me/51906765040" target="_blank" rel="noopener">+51 906 765 040</a></dd>

						<dt>Correo</dt>
						<dd><a href="mailto:marketing@dakagency.net">marketing@dakagency.net</a></dd>

						<dt>Web</dt>
						<dd><a href="https://dakagency.net/">dakagency.net</a></dd>

						<dt>Redes</dt>
						<dd>
							<a href="https://www.instagram.com/agency_dak/" target="_blank" rel="noopener">Instagram</a> ·
							<a href="https://www.facebook.com/profile.php?id=61577374078273" target="_blank" rel="noopener">Facebook</a>
						</dd>
					</dl>
				</div>
			</div>
		</div>
	</section>

	<?php // ── Banda 2: el índice, repetido al cierre ──────────── ?>
	<?php if ( ! empty( $dak_secciones_pie ) ) : ?>
		<nav class="pie-indice" aria-label="Índice de secciones">
			<div class="contenedor">
				<p class="rotulo pie-indice-titulo">Índice</p>

				<ul>
					<?php foreach ( $dak_secciones_pie as $dak_sec ) : ?>
						<li <?php echo dak_var_seccion( $dak_sec['term']->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
							<a href="<?php echo esc_url( get_category_link( $dak_sec['term']->term_id ) ); ?>">
								<span class="codigo"><?php echo esc_html( $dak_sec['datos']['numero'] ); ?></span>
								<span class="nombre"><?php echo esc_html( $dak_sec['term']->name ); ?></span>
								<span class="cuenta"><?php echo esc_html( (string) $dak_sec['total'] ); ?></span>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</nav>
	<?php endif; ?>

	<?php // ── Banda 3: condiciones ────────────────────────────── ?>
	<div class="pie-condiciones">
		<div class="contenedor">
			<p class="rotulo">Condiciones</p>
			<ul>
				<li>Los precios de referencia se publican dentro de cada guía y están en soles.</li>
				<li>Una cotización cerrada depende del alcance; la referencia es punto de partida, no tarifa.</li>
				<?php if ( $dak_ultima ) : ?>
					<li>Catálogo actualizado el <?php echo esc_html( dak_fecha_corta( $dak_ultima ) ); ?>. Se publica lunes, miércoles y viernes.</li>
				<?php endif; ?>
				<li>Tipografías autoalojadas: este blog no pide fuentes a terceros.</li>
			</ul>
		</div>
	</div>

	<?php // ── Banda 4: pie de imprenta ────────────────────────── ?>
	<div class="pie-legal">
		<div class="contenedor">
			<a class="pie-marca" href="https://dakagency.net/">
				<img class="pie-logo"
					src="<?php echo esc_url( get_template_directory_uri() . '/assets/img/logo-blanco.svg' ); ?>"
					alt="DAK Agency" width="76" height="22" loading="lazy">
			</a>

			<p>&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> DAK Agency &mdash; Chiclayo, Perú.</p>

			<p class="pie-volver"><a href="#contenido">Volver arriba &uarr;</a></p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
