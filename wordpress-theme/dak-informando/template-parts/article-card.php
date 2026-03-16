<?php
/**
 * template-parts/article-card.php — Card for 4-column article grids
 * Conversion from ArticleCard.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'article-card' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$author   = get_the_author_meta( 'display_name', $post_obj->post_author );
$category = dak_get_primary_category( $post_obj->ID );
$tagClass = dak_get_category_tag_class( $category->slug );
$date     = dak_format_date_short( $post_obj->post_date );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
$title    = wp_strip_all_tags( $post_obj->post_title );
?>

<article class="article-card">
  <div class="article-card-image">
    <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" loading="lazy">
  </div>
  <div class="article-card-body">
    <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
    <h3 class="article-card-title">
      <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
    </h3>
    <p class="article-card-excerpt"><?php echo esc_html( $excerpt ); ?></p>
    <div class="article-card-meta">POR <?php echo esc_html( strtoupper( $author ) ); ?> · <?php echo esc_html( $date ); ?></div>
  </div>
</article>
