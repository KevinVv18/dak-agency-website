<?php
/**
 * template-parts/hero-featured.php — Central featured article in the hero section
 * Conversion from HeroFeatured.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'hero-featured' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$author   = get_the_author_meta( 'display_name', $post_obj->post_author );
$category = dak_get_primary_category( $post_obj->ID );
$tagClass = dak_get_category_tag_class( $category->slug );
$date     = dak_format_date_long( $post_obj->post_date );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<article class="hero-featured">
  <a href="<?php echo get_permalink( $post_obj ); ?>" class="featured-image-link">
    <div class="featured-image-wrapper">
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" class="featured-image" loading="eager">
      <div class="featured-image-overlay"></div>
    </div>
  </a>
  <div class="featured-content">
    <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
    <h2 class="featured-title">
      <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
    </h2>
    <p class="featured-excerpt"><?php echo esc_html( $excerpt ); ?></p>
    <div class="featured-meta">
      <span>POR <?php echo esc_html( strtoupper( $author ) ); ?></span>
      <span class="meta-separator">·</span>
      <span><?php echo esc_html( $date ); ?></span>
    </div>
  </div>
</article>
