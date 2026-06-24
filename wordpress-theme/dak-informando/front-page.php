<?php
/**
 * front-page.php — Home del blog (rediseño Fase 2)
 * Estructura: Hero → Franja de Servicios (pilares) → Secciones por categoría
 * (carrusel) → Lo Último. Usa las categorías reales (circuito).
 */
get_header();

// ── Hero: últimos 5 posts (1 destacado + 4 en sidebars) ──
$hero_query    = new WP_Query( array( 'posts_per_page' => 5, 'post_status' => 'publish' ) );
$hero_posts    = $hero_query->posts;
$featured      = isset( $hero_posts[0] ) ? $hero_posts[0] : null;
$sidebar_left  = array_slice( $hero_posts, 1, 2 );
$sidebar_right = array_slice( $hero_posts, 3, 2 );

// ── Páginas pilar (servicios) ──
$servicios = array(
  array( 'Agencia de SEO',          'Posiciona en Google',          home_url( '/agencia-seo-chiclayo/' ) ),
  array( 'Diseño Web',              'Webs que venden',              home_url( '/diseno-web-chiclayo/' ) ),
  array( 'Publicidad / Meta Ads',   'Clientes desde redes',         home_url( '/agencia-de-publicidad-en-redes-chiclayo/' ) ),
  array( 'Redes Sociales',          'Contenido que conecta',        home_url( '/agencia-de-redes-sociales-chiclayo/' ) ),
  array( 'Automatización',          'Vende 24/7',                   home_url( '/automatizacion-para-negocios-chiclayo/' ) ),
  array( 'Branding',                'Marca que enamora',            home_url( '/agencia-de-branding-chiclayo/' ) ),
);

// ── Secciones por categoría (orden) ──
$sections = array(
  'seo-buscadores' => 'SEO y Buscadores',
  'diseno-web'     => 'Diseño Web',
  'redes-sociales' => 'Redes Sociales',
  'publicidad'     => 'Publicidad',
  'automatizacion' => 'Automatización',
  'branding'       => 'Branding',
  'por-rubro'      => 'Marketing por Rubro',
  'guias-precios'  => 'Guías y Precios',
);

// ── Lo Último (últimos 3) ──
$latest_query = new WP_Query( array( 'posts_per_page' => 3, 'post_status' => 'publish' ) );
$latest_posts = $latest_query->posts;
$popular_query = new WP_Query( array( 'posts_per_page' => 1, 'post_status' => 'publish', 'orderby' => 'comment_count', 'order' => 'DESC' ) );
$popular_post  = $popular_query->have_posts() ? $popular_query->posts[0] : ( isset( $hero_posts[0] ) ? $hero_posts[0] : null );
?>

<main>
  <h1 class="screen-reader-text">Blog de Marketing Digital — DAK Agency</h1>

  <!-- ===== HERO ===== -->
  <section class="hero-blog" id="heroBlog">
    <div class="hero-grid-bg"></div>
    <div class="hero-container">
      <aside class="hero-sidebar hero-sidebar-left">
        <?php foreach ( $sidebar_left as $i => $post ) :
          setup_postdata( $post );
          get_template_part( 'template-parts/sidebar-article', null, array( 'post' => $post ) );
          if ( $i < count( $sidebar_left ) - 1 ) : ?><hr class="sidebar-separator"><?php endif;
        endforeach; wp_reset_postdata(); ?>
      </aside>
      <?php if ( $featured ) : get_template_part( 'template-parts/hero-featured', null, array( 'post' => $featured ) ); endif; ?>
      <aside class="hero-sidebar hero-sidebar-right">
        <?php foreach ( $sidebar_right as $i => $post ) :
          setup_postdata( $post );
          get_template_part( 'template-parts/sidebar-article', null, array( 'post' => $post ) );
          if ( $i < count( $sidebar_right ) - 1 ) : ?><hr class="sidebar-separator"><?php endif;
        endforeach; wp_reset_postdata(); ?>
      </aside>
    </div>
  </section>

  <!-- ===== FRANJA DE SERVICIOS ===== -->
  <section class="servicios-strip" id="servicios">
    <div class="section-divider-full"></div>
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Nuestros Servicios</h2>
        <a href="https://dakagency.net/#services" class="section-link">CONTÁCTANOS »</a>
      </div>
      <div class="servicios-grid">
        <?php foreach ( $servicios as $s ) : ?>
          <a class="servicio-card" href="<?php echo esc_url( $s[2] ); ?>">
            <span class="servicio-card-name"><?php echo esc_html( $s[0] ); ?></span>
            <span class="servicio-card-desc"><?php echo esc_html( $s[1] ); ?></span>
            <span class="servicio-card-arrow" aria-hidden="true">→</span>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ===== SECCIONES POR CATEGORÍA (carrusel) ===== -->
  <?php foreach ( $sections as $slug => $title ) :
    $cat = get_category_by_slug( $slug );
    if ( ! $cat ) { continue; }
    $cq = new WP_Query( array( 'posts_per_page' => 10, 'post_status' => 'publish', 'cat' => $cat->term_id ) );
    if ( ! $cq->have_posts() ) { continue; }
  ?>
    <section class="cat-section" id="<?php echo esc_attr( $slug ); ?>">
      <div class="section-divider-full"></div>
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title"><?php echo esc_html( $title ); ?></h2>
          <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>" class="section-link">VER MÁS »</a>
        </div>
        <div class="cat-carousel">
          <?php while ( $cq->have_posts() ) : $cq->the_post();
            get_template_part( 'template-parts/article-card', null, array( 'post' => get_post() ) );
          endwhile; wp_reset_postdata(); ?>
        </div>
      </div>
    </section>
  <?php endforeach; ?>

  <!-- ===== LO ÚLTIMO ===== -->
  <section class="latest-section" id="lo-ultimo">
    <div class="section-divider-full"></div>
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Lo Último</h2>
        <a href="<?php echo home_url( '/' ); ?>" class="section-link">VER MÁS »</a>
      </div>
      <div class="latest-layout">
        <div class="latest-main">
          <?php foreach ( $latest_posts as $i => $post ) :
            setup_postdata( $post );
            get_template_part( 'template-parts/latest-article', null, array( 'post' => $post ) );
            if ( $i < count( $latest_posts ) - 1 ) : ?><hr class="latest-separator"><?php endif;
          endforeach; wp_reset_postdata(); ?>
        </div>
        <?php if ( $popular_post ) : get_template_part( 'template-parts/latest-sidebar', null, array( 'post' => $popular_post ) ); endif; ?>
      </div>
    </div>
  </section>
</main>

<?php get_footer(); ?>
