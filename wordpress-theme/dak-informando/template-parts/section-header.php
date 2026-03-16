<?php
/**
 * template-parts/section-header.php — Reusable section header
 * Conversion from SectionHeader.astro
 */
$title     = isset( $args['title'] ) ? $args['title'] : 'Sección';
$link_href = isset( $args['link_href'] ) ? $args['link_href'] : '#';
$link_text = isset( $args['link_text'] ) ? $args['link_text'] : 'VER MÁS »';
?>

<div class="section-divider-full"></div>
<div class="section-container">
  <div class="section-header">
    <h2 class="section-title"><?php echo esc_html( $title ); ?></h2>
    <a href="<?php echo esc_url( $link_href ); ?>" class="section-link"><?php echo esc_html( $link_text ); ?></a>
  </div>
</div>
