<?php
/**
 * template-parts/latest-article.php — Horizontal article card for "Lo Último" section
 * Conversion from LatestArticle.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'article-card' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$category = dak_get_primary_category( $post_obj->ID );
$tagClass = dak_get_category_tag_class( $category->slug );
$date     = dak_format_date_long( $post_obj->post_date );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<article class="latest-article">
  <div class="latest-article-image">
    <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" loading="lazy">
  </div>
  <div class="latest-article-body">
    <h3 class="latest-article-title">
      <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
    </h3>
    <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
    <span class="latest-article-date"><?php echo esc_html( $date ); ?></span>
    <p class="latest-article-excerpt"><?php echo esc_html( $excerpt ); ?></p>
    <a href="<?php echo get_permalink( $post_obj ); ?>" class="opinion-read-more">LEER MÁS</a>
  </div>
</article>
