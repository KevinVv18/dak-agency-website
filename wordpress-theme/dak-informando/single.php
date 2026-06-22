<?php
/**
 * single.php — Página de artículo individual
 * Layout de 2 columnas en desktop (contenido + sidebar sticky):
 *   - Barra de progreso de lectura
 *   - Tabla de contenidos (TOC) auto-generada por JS desde los H2/H3
 *   - Tarjeta CTA sticky (WhatsApp + agendar)
 *   - Posts relacionados al final
 * En mobile colapsa a 1 columna (el sidebar se oculta; el CTA del contenido cubre la conversión).
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

<div class="reading-progress" aria-hidden="true"><span></span></div>

<main>
  <?php dak_breadcrumbs(); ?>
  <article class="article-single">
    <!-- Hero image -->
    <div class="article-single-hero">
      <div class="article-single-hero-bg" style="background-image:url('<?php echo esc_url( $image ); ?>')"></div>
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $imageAlt ); ?>" class="article-single-hero-img" loading="eager">
    </div>

    <div class="article-single-layout">
      <!-- Columna de contenido -->
      <div class="article-single-main">
        <div class="article-single-header">
          <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( strtoupper( $category->name ) ); ?></span>
          <h1 class="article-single-title"><?php echo esc_html( $title ); ?></h1>
          <div class="article-single-meta">
            <span>POR <?php echo esc_html( strtoupper( $author ) ); ?></span>
            <span class="meta-separator">·</span>
            <span><?php echo esc_html( $date ); ?></span>
          </div>
        </div>

        <div class="article-single-body">
          <?php the_content(); ?>
        </div>

        <div class="article-single-footer">
          <a href="<?php echo home_url( '/' ); ?>" class="article-back-link">← Volver al blog</a>
        </div>
      </div>

      <!-- Sidebar (desktop) -->
      <aside class="article-single-sidebar">
        <div class="sidebar-sticky">
          <nav class="toc" aria-label="Tabla de contenidos" hidden>
            <p class="toc-title">En este artículo</p>
            <ul class="toc-list"></ul>
          </nav>

          <div class="sidebar-cta">
            <p class="sidebar-cta-title">¿Te ayudamos con tu marketing?</p>
            <p class="sidebar-cta-text">En DAK Agency hacemos gestión de campañas, SEO y branding profesional para negocios de Chiclayo y Lambayeque.</p>
            <a class="sidebar-cta-btn wa" href="https://wa.me/51906765040" target="_blank" rel="noopener">WhatsApp +51 906 765 040</a>
            <a class="sidebar-cta-btn agendar" href="https://plan.dakagency.net/agendar.html" target="_blank" rel="noopener">Agenda una reunión</a>
            <p class="sidebar-cta-mail">marketing@dakagency.net</p>
          </div>
        </div>
      </aside>
    </div>
  </article>

  <?php
  // ── Posts relacionados (misma categoría; si faltan, completar con recientes) ──
  $cats = wp_get_post_categories( $post_obj->ID );
  $related = new WP_Query( array(
      'post_type'           => 'post',
      'posts_per_page'      => 3,
      'post__not_in'        => array( $post_obj->ID ),
      'category__in'        => ! empty( $cats ) ? $cats : array(),
      'ignore_sticky_posts' => true,
      'orderby'             => 'date',
      'order'               => 'DESC',
  ) );
  if ( $related->post_count < 3 ) {
      $related = new WP_Query( array(
          'post_type'           => 'post',
          'posts_per_page'      => 3,
          'post__not_in'        => array( $post_obj->ID ),
          'ignore_sticky_posts' => true,
          'orderby'             => 'date',
          'order'               => 'DESC',
      ) );
  }
  if ( $related->have_posts() ) : ?>
    <section class="related-posts">
      <div class="related-posts-inner">
        <h2 class="related-posts-title">Sigue leyendo</h2>
        <div class="related-posts-grid">
          <?php while ( $related->have_posts() ) : $related->the_post();
              get_template_part( 'template-parts/article-card', null, array( 'post' => get_post() ) );
          endwhile; ?>
        </div>
      </div>
    </section>
  <?php endif; wp_reset_postdata(); ?>
</main>

<script>
(function () {
  var bar  = document.querySelector('.reading-progress span');
  var body = document.querySelector('.article-single-body');

  // ── Barra de progreso de lectura ──
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = (Math.min(1, Math.max(0, h.scrollTop / max)) * 100) + '%';
  }

  // ── Tabla de contenidos (TOC) ──
  var toc = document.querySelector('.toc');
  var tocList = document.querySelector('.toc-list');
  var links = [];
  if (toc && tocList && body) {
    var heads = body.querySelectorAll('h2, h3');
    var i = 0;
    heads.forEach(function (h) {
      var txt = (h.textContent || '').trim();
      if (!txt) return;
      if (!h.id) {
        h.id = 'sec-' + (i++) + '-' + txt.toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
      }
      var li = document.createElement('li');
      li.className = 'toc-item toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = txt;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(h.id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
      });
      li.appendChild(a);
      tocList.appendChild(li);
      links.push({ id: h.id, a: a });
    });
    if (links.length >= 2) toc.hidden = false;
  }

  // ── Scrollspy (resalta la sección activa) ──
  function onSpy() {
    if (!links.length) return;
    var pos = window.pageYOffset + 130, current = links[0];
    for (var j = 0; j < links.length; j++) {
      var el = document.getElementById(links[j].id);
      if (el && el.offsetTop <= pos) current = links[j];
    }
    links.forEach(function (l) { l.a.classList.toggle('active', l === current); });
  }

  window.addEventListener('scroll', function () { onScroll(); onSpy(); }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll(); onSpy();
})();
</script>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
