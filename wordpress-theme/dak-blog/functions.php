<?php
/**
 * DAK Blog — Catálogo.
 *
 * Este archivo solo carga. La lógica vive repartida por responsabilidad en
 * inc/, porque el tema anterior acabó con todo apilado en un functions.php y
 * un style.css de 3.300 líneas con dos rediseños peleándose dentro.
 *
 * @package dak-blog
 */

defined( 'ABSPATH' ) || exit;

require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/setup.php';
require_once get_template_directory() . '/inc/assets.php';
require_once get_template_directory() . '/inc/query.php';
require_once get_template_directory() . '/inc/seo.php';
