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
    $read_min  = max( 1, (int) ceil( str_word_count( wp_strip_all_tags( $post_obj->post_content ) ) / 200 ) );
    $share_url = get_permalink( $post_obj );

    // Botones de compartir (se definen una vez y se reutilizan: barra flotante + sidebar)
    ob_start(); ?>
      <a class="share-btn wa" target="_blank" rel="noopener" aria-label="Compartir en WhatsApp"
         href="https://api.whatsapp.com/send?text=<?php echo rawurlencode( $title . ' ' . $share_url ); ?>">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.13c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.35c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>
      </a>
      <a class="share-btn fb" target="_blank" rel="noopener" aria-label="Compartir en Facebook"
         href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( $share_url ); ?>">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
      </a>
      <button class="share-btn copy" type="button" aria-label="Copiar enlace" data-url="<?php echo esc_url( $share_url ); ?>">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
    <?php $share_buttons = ob_get_clean();
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

    <!-- Barra de compartir flotante: borde izquierdo, aparece tras la imagen y sigue el scroll -->
    <div class="share-float" aria-label="Compartir artículo">
      <span class="share-float-label">Compartir</span>
      <?php echo $share_buttons; ?>
    </div>

    <div class="article-single-layout">
      <!-- Columna de contenido -->
      <div class="article-single-main">
        <div class="article-single-header">
          <span class="category-tag <?php echo esc_attr( $tagClass ); ?>"><?php echo esc_html( dak_upper( $category->name ) ); ?></span>
          <h1 class="article-single-title"><?php echo esc_html( $title ); ?></h1>
          <div class="article-single-meta">
            <span>POR <?php echo esc_html( dak_upper( $author ) ); ?></span>
            <span class="meta-separator">·</span>
            <span><?php echo esc_html( $date ); ?></span>
            <span class="meta-separator">·</span>
            <span>⏱️ <?php echo (int) $read_min; ?> MIN</span>
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
            <div class="sidebar-cta-share"><span>Compartir:</span><?php echo $share_buttons; ?></div>
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

  // ── Copiar enlace (puede haber 2 botones: flotante + sidebar) ──
  document.querySelectorAll('.share-btn.copy').forEach(function (copyBtn) {
    if (!navigator.clipboard) return;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.getAttribute('data-url') || window.location.href).then(function () {
        copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.classList.remove('copied'); }, 1500);
      });
    });
  });

  // ── Barra de compartir flotante: aparece al pasar la imagen y sigue el scroll ──
  var floatBar = document.querySelector('.share-float');
  var heroEl = document.querySelector('.article-single-hero');
  function onShareVis() {
    if (!floatBar || !heroEl) return;
    floatBar.classList.toggle('visible', window.pageYOffset > (heroEl.offsetTop + heroEl.offsetHeight - 80));
  }

  window.addEventListener('scroll', function () { onScroll(); onSpy(); onShareVis(); }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll(); onSpy(); onShareVis();
})();
</script>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
