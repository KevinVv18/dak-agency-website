<?php
/**
 * wp-config.php — DAK INFORMANDO Blog
 * 
 * TEMPLATE FILE — Copy to scripts/wp-config.php and fill in your values.
 * The actual wp-config.php with credentials is excluded from git.
 */

// ** MySQL settings ** //
define( 'DB_NAME',     '%%DB_NAME%%' );
define( 'DB_USER',     '%%DB_USER%%' );
define( 'DB_PASSWORD', '%%DB_PASSWORD%%' );
define( 'DB_HOST',     'localhost' );
define( 'DB_CHARSET',  'utf8mb4' );
define( 'DB_COLLATE',  '' );

/**
 * Authentication unique keys and salts.
 * Generate new ones at: https://api.wordpress.org/secret-key/1.1/salt/
 */
define( 'AUTH_KEY',         '%%GENERATE_AT_api.wordpress.org/secret-key/1.1/salt%%' );
define( 'SECURE_AUTH_KEY',  '%%GENERATE%%' );
define( 'LOGGED_IN_KEY',    '%%GENERATE%%' );
define( 'NONCE_KEY',        '%%GENERATE%%' );
define( 'AUTH_SALT',        '%%GENERATE%%' );
define( 'SECURE_AUTH_SALT', '%%GENERATE%%' );
define( 'LOGGED_IN_SALT',   '%%GENERATE%%' );
define( 'NONCE_SALT',       '%%GENERATE%%' );

$table_prefix = 'wp_';

define( 'WP_SITEURL', 'https://dakagency.net/blog' );
define( 'WP_HOME',    'https://dakagency.net/blog' );

define( 'WP_DEBUG',     false );
define( 'WP_DEBUG_LOG', false );

define( 'WP_POST_REVISIONS', 5 );
define( 'AUTOSAVE_INTERVAL',  120 );
define( 'DISALLOW_FILE_EDIT', true );

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
