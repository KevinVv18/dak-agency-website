<?php
/**
 * Cabecera: cintillo de identificación, marca, navegación de secciones y las
 * pestañas de canto.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

$dak_secciones_nav = dak_secciones_navegables();
$dak_seccion_activa = ( is_category() ) ? get_queried_object()->slug : '';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="icon" href="<?php echo esc_url( get_template_directory_uri() . '/assets/img/favicon.svg' ); ?>" type="image/svg+xml">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<!--
  DIRECTION CONTRACT — DAK Blog «El Catálogo»
  THESIS: El blog de DAK es el catálogo comercial de su conocimiento, no una
  revista ni un manual. Rechaza la grilla de tarjetas con foto arriba y
  píldoras de categoría que publica toda agencia.
  OWN-WORLD: Papel bond gris #F2F2F0 con filas blancas; ocho vidriados de
  sección a sangre (#7B1FA2…#1B5E20), todos ≥5.9:1 con blanco; tinta de casa
  #B024FF en rellenos y códigos, #8B1CC7 cuando es texto. Archivo con cifras
  tabulares para estructura, Faustina para prosa. Sin sombras, sin radios, sin
  degradados: filete y color plano.
  STORY: El lector entiende en un segundo que esto es un índice con secciones,
  encuentra su duda escrita como título de fila y entra. El cintillo de
  condiciones del pie le da la vía de contacto.
  FIRST VIEWPORT: Tapa de catálogo (rótulo, h1 visible, caja de edición con
  fecha y recuento) → índice de las ocho secciones numeradas → recuadro con la
  entrada más reciente, única imagen con prioridad de carga. Pestañas de canto
  fijas al borde derecho.
  FORM: Catálogo comercial del distribuidor; candidato 4 de la lista
  fundamentada; seed 46e525a2, fijado por el usuario tras dos re-tiradas.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->

<a class="salta-al-contenido" href="#contenido">Saltar al contenido</a>

<header class="cabecera">
	<div class="cabecera-cintillo">
		<div class="contenedor">
			<p class="rotulo">Blog DAK · Chiclayo y Lambayeque</p>
			<p class="rotulo cintillo-opcional">
				<a href="https://dakagency.net/">Ir a dakagency.net &rsaquo;</a>
			</p>
		</div>
	</div>

	<div class="cabecera-principal">
		<div class="contenedor">
			<a class="marca" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<img class="marca-logo"
					src="<?php echo esc_url( get_template_directory_uri() . '/assets/img/logo.svg' ); ?>"
					alt="DAK Agency" width="97" height="28">
				<span class="rotulo marca-rotulo">Catálogo<br>de contenidos</span>
			</a>

			<?php if ( ! empty( $dak_secciones_nav ) ) : ?>
				<nav class="nav-secciones" aria-label="Secciones del catálogo">
					<?php foreach ( $dak_secciones_nav as $dak_sec ) : ?>
						<a href="<?php echo esc_url( get_category_link( $dak_sec['term']->term_id ) ); ?>"
							<?php echo dak_var_seccion( $dak_sec['term']->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
							<?php echo ( $dak_seccion_activa === $dak_sec['term']->slug ) ? 'aria-current="page"' : ''; ?>>
							<?php echo esc_html( $dak_sec['datos']['corto'] ? $dak_sec['datos']['corto'] : $dak_sec['term']->name ); ?>
						</a>
					<?php endforeach; ?>
				</nav>

				<a class="cabecera-menu" href="#indice">Secciones</a>
			<?php endif; ?>
		</div>
	</div>
</header>

<?php
/*
 * El canto derecho es UNA sola cosa por página. En el índice y en los archivos
 * dice en qué sección estás; dentro de una entrada, single.php lo reconstruye
 * con los apartados de esa entrada. Por eso aquí se omite en las entradas: el
 * pulgar no puede señalar dos libros a la vez.
 */
?>
<?php if ( ! empty( $dak_secciones_nav ) && ! is_singular( 'post' ) ) : ?>
	<nav class="canto" aria-label="Índice lateral de secciones">
		<?php foreach ( $dak_secciones_nav as $dak_sec ) : ?>
			<a class="canto-pestana <?php echo ( $dak_seccion_activa === $dak_sec['term']->slug ) ? 'es-activa' : ''; ?>"
				href="<?php echo esc_url( get_category_link( $dak_sec['term']->term_id ) ); ?>"
				<?php echo dak_var_seccion( $dak_sec['term']->slug ); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
				<span class="codigo"><?php echo esc_html( $dak_sec['datos']['numero'] ); ?></span>
				<span class="nombre"><?php echo esc_html( $dak_sec['term']->name ); ?></span>
			</a>
		<?php endforeach; ?>
	</nav>
<?php endif; ?>

<?php dak_migas(); ?>
