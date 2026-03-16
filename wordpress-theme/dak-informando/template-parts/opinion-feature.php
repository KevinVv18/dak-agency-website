<?php
/**
 * template-parts/opinion-feature.php — 2-column opinion section
 * Conversion from OpinionFeature.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'opinion-image' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$author   = get_the_author_meta( 'display_name', $post_obj->post_author );
$category = dak_get_primary_category( $post_obj->ID );
$tagClass = dak_get_category_tag_class( $category->slug );
$date     = dak_format_date_long( $post_obj->post_date );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<section class="opinion-section" id="opinion">
  <div class="section-divider-full"></div>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">Opinión</h2>
      <?php $opinion_cat = get_category_by_slug( 'opinion' ); ?>
      <a href="<?php echo $opinion_cat ? get_category_link( $opinion_cat ) : '#'; ?>" class="section-link">VER MÁS »</a>
    </div>
    <div class="opinion-layout">
      <div class="opinion-image-col">
        <a href="<?php echo get_permalink( $post_obj ); ?>">
          <div class="opinion-image-wrapper">
            <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" loading="lazy">
          </div>
        </a>
      </div>
      <div class="opinion-content-col">
        <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
        <h2 class="opinion-title">
          <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
        </h2>
        <p class="opinion-excerpt"><?php echo esc_html( $excerpt ); ?></p>
        <div class="opinion-meta">
          <span><?php echo esc_html( $date ); ?></span>
          <span class="meta-separator">·</span>
          <span>POR <?php echo esc_html( strtoupper( $author ) ); ?></span>
        </div>
        <a href="<?php echo get_permalink( $post_obj ); ?>" class="opinion-read-more">LEER MÁS</a>
      </div>
    </div>
  </div>
</section>
