<?php
/**
 * single.php — Individual Article Page
 * Direct conversion from [slug].astro
 */
get_header();

if ( have_posts() ) : while ( have_posts() ) : the_post();
    $post_obj = get_post();
    $image    = dak_get_featured_image_url( $post_obj->ID, 'large' );
    $imageAlt = get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true ) ?: get_the_title();
    $author   = get_the_author();
    $category = dak_get_primary_category( $post_obj->ID );
    $tagClass = dak_get_category_tag_class( $category->slug );
    $date     = dak_format_date_long( $post_obj->post_date );
    $title    = get_the_title();
?>

<main>
  <?php dak_breadcrumbs(); ?>
  <article class="article-single">
    <!-- Hero image -->
    <div class="article-single-hero">
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" class="article-single-hero-img" loading="eager">
      <div class="article-single-hero-overlay"></div>
    </div>

    <!-- Article header -->
    <div class="article-single-container">
      <div class="article-single-header">
        <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
        <h1 class="article-single-title"><?php echo esc_html( $title ); ?></h1>
        <div class="article-single-meta">
          <span>POR <?php echo esc_html( strtoupper( $author ) ); ?></span>
          <span class="meta-separator">·</span>
          <span><?php echo esc_html( $date ); ?></span>
        </div>
      </div>

      <!-- Article body -->
      <div class="article-single-body">
        <?php the_content(); ?>
      </div>

      <!-- Back to blog -->
      <div class="article-single-footer">
        <a href="<?php echo home_url( '/' ); ?>" class="article-back-link">← Volver al blog</a>
      </div>
    </div>
  </article>
</main>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
