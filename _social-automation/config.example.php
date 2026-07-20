<?php
/**
 * Copia este archivo a  config.php  EN EL SERVIDOR y complétalo.
 * config.php NO se sube al repo (está en .gitignore). Ahí viven los tokens.
 */

// Versión de la Graph API de Meta.
define('GRAPH_VERSION', 'v21.0');

// Token permanente del Usuario de Sistema (del runbook, Fase 2).
define('META_TOKEN', 'PEGA_AQUI_TU_TOKEN_DE_USUARIO_DE_SISTEMA');

// IDs de tus cuentas (los sacas del runbook / Graph API Explorer).
define('FB_PAGE_ID', 'PEGA_AQUI_EL_ID_DE_TU_PAGINA_DE_FACEBOOK');
define('IG_BUSINESS_ID', 'PEGA_AQUI_EL_ID_DE_TU_CUENTA_INSTAGRAM_BUSINESS');

/**
 * Calendario de contenido: una Google Sheet publicada como CSV.
 *   En la hoja:  Archivo → Compartir → Publicar en la web → (la hoja) → CSV
 *   Pega aquí esa URL .../pub?gid=0&single=true&output=csv
 * Columnas esperadas (fila 1 = encabezados, en minúscula):
 *   fecha_hora | red | texto | imagen_url
 *     fecha_hora: "2026-07-25 09:00" (hora de Perú)
 *     red:        fb | ig | ambos
 *     imagen_url: URL pública de la imagen (obligatoria para Instagram)
 */
define('CALENDAR_CSV_URL', 'PEGA_AQUI_LA_URL_CSV_DE_TU_GOOGLE_SHEET');

// Zona horaria para interpretar las fechas del calendario.
date_default_timezone_set('America/Lima');
