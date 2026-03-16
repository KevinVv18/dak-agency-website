<?php
/**
 * template-parts/sidebar-article.php — Article card for hero sidebars
 * Conversion from SidebarArticle.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'sidebar-article' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$category = dak_get_primary_category( $post_obj->ID );
$tagClass = dak_get_category_tag_class( $category->slug );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<article class="visual-article">
  <a href="<?php echo get_permalink( $post_obj ); ?>" class="visual-image-link">
    <div class="visual-image-wrapper">
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" loading="lazy">
    </div>
  </a>
  <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
  <h3 class="visual-title">
    <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
  </h3>
  <p class="visual-excerpt"><?php echo esc_html( $excerpt ); ?></p>
</article>
