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
// Cada servicio lleva un pictograma de trazo (4º campo): da vida a la franja
// sin romper el registro de manual. Trazo fino y mismo grosor en todos.
$servicios = array(
  array( 'Agencia de SEO',          'Posiciona en Google',          home_url( '/agencia-seo-chiclayo/' ),
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M10.5 7.5v6M7.5 10.5h6"/>' ),
  array( 'Diseño Web',              'Webs que venden',              home_url( '/diseno-web-chiclayo/' ),
    '<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 8h18"/><path d="M6 6h.01M8.5 6h.01"/><path d="M9 21h6"/>' ),
  array( 'Publicidad / Meta Ads',   'Clientes desde redes',         home_url( '/agencia-de-publicidad-en-redes-chiclayo/' ),
    '<path d="M4 9v6h3l6 4V5L7 9z"/><path d="M17 9.5a4 4 0 0 1 0 5"/><path d="M19.5 7a7.5 7.5 0 0 1 0 10"/>' ),
  array( 'Redes Sociales',          'Contenido que conecta',        home_url( '/agencia-de-redes-sociales-chiclayo/' ),
    '<circle cx="17" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="18.5" r="2.5"/><path d="M8.3 10.8l6.4-3.7M8.3 13.2l6.4 3.7"/>' ),
  array( 'Automatización',          'Vende 24/7',                   home_url( '/automatizacion-para-negocios-chiclayo/' ),
    '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>' ),
  array( 'Branding',                'Marca que enamora',            home_url( '/agencia-de-branding-chiclayo/' ),
    '<path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8L6.7 20l1-6L3.4 9.9l6-.9z"/>' ),
);

// ── Secciones por categoría (orden) ──
$sections = array(
  'seo-buscadores' => 'SEO y Buscadores',
  'diseno-web'     => 'Diseño Web',
  'redes-sociales' => 'Redes Sociales',
  'publicidad'     => 'Publicidad',
  'automatizacion' => 'Automatización',
  'branding'       => 'Branding',
  'por-rubro'      => 'Marketing',
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
    <?php /* Encabezado de sección para el lector de pantalla y el esquema del
             documento: sin él la portada saltaba de h1 a h3. No cambia el diseño. */ ?>
    <h2 class="visually-hidden">Artículos destacados</h2>
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
            <?php if ( ! empty( $s[3] ) ) : ?>
              <span class="servicio-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><?php echo $s[3]; // SVG fijo del tema, no entrada de usuario ?></svg>
              </span>
            <?php endif; ?>
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
