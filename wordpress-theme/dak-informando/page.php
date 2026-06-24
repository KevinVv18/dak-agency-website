<?php
/**
 * page.php — Páginas de servicio / pilar (landing comercial).
 * Layout: hero + contenido + sidebar CTA sticky (reutiliza los estilos de single.php).
 * Sin fecha/autor/relacionados (no es un post de blog).
 */
get_header();

if ( have_posts() ) : while ( have_posts() ) : the_post();
    $post_obj = get_post();
    $image    = dak_get_featured_image_url( $post_obj->ID, 'large' );
    $imageAlt = get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true ) ?: get_the_title();
    $title    = get_the_title();
?>

<div class="reading-progress" aria-hidden="true"><span></span></div>

<main>
  <?php dak_breadcrumbs(); ?>
  <article class="article-single">
    <!-- Hero -->
    <div class="article-single-hero">
      <div class="article-single-hero-bg" style="background-image:url('<?php echo esc_url( $image ); ?>')"></div>
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" class="article-single-hero-img" loading="eager">
    </div>

    <div class="article-single-layout">
      <!-- Contenido -->
      <div class="article-single-main">
        <div class="article-single-header">
          <span class="category-tag tag-marketing">SERVICIO</span>
          <h1 class="article-single-title"><?php echo esc_html( $title ); ?></h1>
        </div>

        <div class="article-single-body">
          <?php the_content(); ?>
        </div>
      </div>

      <!-- Sidebar CTA (conversión) -->
      <aside class="article-single-sidebar">
        <div class="sidebar-sticky">
          <div class="sidebar-cta">
            <p class="sidebar-cta-title">¿Listo para empezar?</p>
            <p class="sidebar-cta-text">Cuéntanos tu caso y te damos un diagnóstico gratis. Marketing que vende para negocios de Chiclayo y Lambayeque.</p>
            <a class="sidebar-cta-btn wa" href="https://wa.me/51906765040" target="_blank" rel="noopener">WhatsApp +51 906 765 040</a>
            <a class="sidebar-cta-btn agendar" href="https://plan.dakagency.net/agendar.html" target="_blank" rel="noopener">Agenda una reunión</a>
            <p class="sidebar-cta-mail">marketing@dakagency.net</p>
          </div>
        </div>
      </aside>
    </div>
  </article>
</main>

<script>
(function () {
  var bar = document.querySelector('.reading-progress span');
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = (Math.min(1, Math.max(0, h.scrollTop / max)) * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
