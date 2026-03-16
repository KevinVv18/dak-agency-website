<?php
/**
 * template-parts/interview-hero.php — Full-width hero with dark overlay for interviews
 * Conversion from InterviewHero.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'interview-hero' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$category = dak_get_primary_category( $post_obj->ID );
$date     = dak_format_date_long( $post_obj->post_date );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<section class="interview-section" id="entrevistas">
  <div class="section-divider-full"></div>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">Entrevistas</h2>
      <?php $entrevistas_cat = get_category_by_slug( 'entrevistas' ); ?>
      <a href="<?php echo $entrevistas_cat ? get_category_link( $entrevistas_cat ) : '#'; ?>" class="section-link">VER MÁS »</a>
    </div>
  </div>
  <div class="interview-hero">
    <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" class="interview-hero-img" loading="lazy">
    <div class="interview-hero-overlay">
      <h3 class="interview-hero-title"><?php echo esc_html( strtoupper( $title ) ); ?></h3>
      <div class="interview-hero-meta"><?php echo esc_html( strtoupper( $category->name ) . ' · ' . $date ); ?></div>
      <p class="interview-hero-excerpt"><?php echo esc_html( $excerpt ); ?></p>
      <a href="<?php echo get_permalink( $post_obj ); ?>" class="interview-read-more">LEER MÁS</a>
    </div>
  </div>
</section>
