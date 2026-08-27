<?php
/**
 * Encabezado de columnas de una sección.
 *
 * Va una vez por banda, justo encima de las filas. Es lo que hace que las
 * entradas se lean como la tabla de un catálogo y no como una lista con
 * estilo: las filas ya se comportaban como columnas, pero nunca lo decían.
 *
 * aria-hidden a propósito: las filas son una lista (<ul>/<li>), no una tabla,
 * así que estos rótulos son ayuda visual y no deben anunciarse como
 * encabezados de algo que no lo es.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="seccion-columnas" aria-hidden="true">
	<span>Ref.</span>
	<span>Descripción</span>
	<span class="col-dato">Min</span>
</div>
