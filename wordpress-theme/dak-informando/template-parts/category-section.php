<?php
/**
 * template-parts/category-section.php — Full section for a category (header + 4-column grid)
 * Conversion from CategorySection.astro
 */
$section_id    = $args['section_id'];
$title         = $args['title'];
$category_slug = $args['category_slug'];
$posts         = $args['posts'];
?>

<section class="category-section" id="<?php echo esc_attr( $section_id ); ?>">
  <div class="section-divider-full"></div>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title"><?php echo esc_html( $title ); ?></h2>
      <a href="<?php echo get_category_link( get_category_by_slug( $category_slug ) ); ?>" class="section-link">VER MÁS »</a>
    </div>
    <div class="articles-grid articles-grid-divided">
      <?php foreach ( $posts as $post ) :
        get_template_part( 'template-parts/article-card', null, array( 'post' => $post ) );
      endforeach; ?>
    </div>
  </div>
</section>
