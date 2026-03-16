<?php
/**
 * index.php — Fallback template (required by WordPress)
 * Redirects to front-page or shows basic post list.
 */
get_header();
?>

<main>
  <section class="latest-section" id="all-posts">
    <div class="section-divider-full"></div>
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Todos los Artículos</h2>
      </div>
      <div class="articles-grid articles-grid-divided">
        <?php if ( have_posts() ) : while ( have_posts() ) : the_post();
          get_template_part( 'template-parts/article-card', null, array( 'post' => get_post() ) );
        endwhile; endif; ?>
      </div>
      <div style="text-align:center; padding: 2rem 0 4rem;">
        <?php the_posts_pagination( array(
          'prev_text' => '← Anterior',
          'next_text' => 'Siguiente →',
        ) ); ?>
      </div>
    </div>
  </section>
</main>

<?php get_footer(); ?>
