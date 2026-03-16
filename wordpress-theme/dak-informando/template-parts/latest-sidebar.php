<?php
/**
 * template-parts/latest-sidebar.php — "Más Popular" sidebar for Lo Último section
 * Conversion from LatestSidebar.astro
 */
$post_obj = $args['post'];
$image    = dak_get_featured_image_url( $post_obj->ID, 'latest-sidebar' );
$imageAlt = get_post_meta( get_post_thumbnail_id( $post_obj->ID ), '_wp_attachment_image_alt', true ) ?: wp_strip_all_tags( $post_obj->post_title );
$title    = wp_strip_all_tags( $post_obj->post_title );
$excerpt  = wp_strip_all_tags( get_the_excerpt( $post_obj ) );
?>

<aside class="latest-sidebar">
  <div class="latest-sidebar-header">MÁS POPULAR</div>
  <div class="latest-sidebar-img">
    <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" loading="lazy" style="aspect-ratio:3/4; border-radius:0.25rem; width:100%; height:100%; object-fit:cover;">
  </div>
  <h4 class="latest-sidebar-title">
    <a href="<?php echo get_permalink( $post_obj ); ?>"><?php echo esc_html( $title ); ?></a>
  </h4>
  <p class="latest-sidebar-excerpt"><?php echo esc_html( $excerpt ); ?></p>
</aside>
