<?php
/**
 * category.php — Archivo de categoría (página de sección).
 * Grilla de tarjetas + paginación, con el estilo del tema.
 */
get_header();
?>

<main>
  <?php dak_breadcrumbs(); ?>
  <section class="cat-archive">
    <div class="section-divider-full"></div>
    <div class="section-container">
      <header class="cat-archive-header">
        <span class="cat-archive-eyebrow">Sección</span>
        <h1 class="cat-archive-title"><?php single_cat_title(); ?></h1>
        <?php $desc = category_description(); if ( $desc ) : ?>
          <div class="cat-archive-desc"><?php echo wp_kses_post( $desc ); ?></div>
        <?php endif; ?>
      </header>

      <?php if ( have_posts() ) : ?>
        <div class="cat-archive-grid">
          <?php while ( have_posts() ) : the_post();
            get_template_part( 'template-parts/article-card', null, array( 'post' => get_post() ) );
          endwhile; ?>
        </div>
        <div class="cat-archive-pagination">
          <?php the_posts_pagination( array(
            'mid_size'  => 2,
            'prev_text' => '« Anterior',
            'next_text' => 'Siguiente »',
          ) ); ?>
        </div>
      <?php else : ?>
        <p class="cat-archive-empty">Pronto publicaremos más contenido en esta sección. Mientras tanto, <a href="<?php echo home_url( '/' ); ?>">vuelve al blog</a>.</p>
      <?php endif; ?>
    </div>
  </section>
</main>

<?php get_footer(); ?>
