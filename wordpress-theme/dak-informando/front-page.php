<?php
/**
 * front-page.php — Blog Home Page
 * Direct conversion from index.astro
 * Uses dedicated WP_Query per category for proper filtering
 */
get_header();

// ── Hero: Latest 5 posts (1 featured + 4 sidebar) ──
$hero_query = new WP_Query( array(
    'posts_per_page' => 5,
    'post_status'    => 'publish',
) );
$hero_posts    = $hero_query->posts;
$featured      = isset( $hero_posts[0] ) ? $hero_posts[0] : null;
$sidebar_left  = array_slice( $hero_posts, 1, 2 );
$sidebar_right = array_slice( $hero_posts, 3, 2 );

// ── Category: Marketing (dedicated query) ──
$marketing_cat = get_category_by_slug( 'marketing' );
if ( ! $marketing_cat ) {
    $marketing_cat = get_category_by_slug( 'marketing-digital' );
}
$marketing_posts = array();
if ( $marketing_cat ) {
    $mq = new WP_Query( array(
        'posts_per_page' => 4,
        'post_status'    => 'publish',
        'cat'            => $marketing_cat->term_id,
    ) );
    $marketing_posts = $mq->posts;
}

// ── Category: Branding (dedicated query) ──
$branding_cat = get_category_by_slug( 'branding' );
$branding_posts = array();
if ( $branding_cat ) {
    $bq = new WP_Query( array(
        'posts_per_page' => 4,
        'post_status'    => 'publish',
        'cat'            => $branding_cat->term_id,
    ) );
    $branding_posts = $bq->posts;
}

// ── Opinion (dedicated query) ──
$opinion_cat = get_category_by_slug( 'opinion' );
$opinion_post = null;
if ( $opinion_cat ) {
    $oq = new WP_Query( array(
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'cat'            => $opinion_cat->term_id,
    ) );
    if ( $oq->have_posts() ) {
        $opinion_post = $oq->posts[0];
    }
}
// Fallback if no opinion category posts
if ( ! $opinion_post && isset( $hero_posts[4] ) ) {
    $opinion_post = $hero_posts[4];
}

// ── Interviews (dedicated query) ──
$entrevistas_cat = get_category_by_slug( 'entrevistas' );
$interview_post = null;
if ( $entrevistas_cat ) {
    $iq = new WP_Query( array(
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'cat'            => $entrevistas_cat->term_id,
    ) );
    if ( $iq->have_posts() ) {
        $interview_post = $iq->posts[0];
    }
}

// ── Latest (most recent 3) ──
$latest_query = new WP_Query( array(
    'posts_per_page' => 3,
    'post_status'    => 'publish',
) );
$latest_posts = $latest_query->posts;

// ── Most popular (from "Tendencia" category, slug: mas-popular) ──
$tendencia_cat = get_category_by_slug( 'mas-popular' );
if ( ! $tendencia_cat ) {
    $tendencia_cat = get_category_by_slug( 'tendencia' );
}
$popular_post = null;
if ( $tendencia_cat ) {
    $popular_query = new WP_Query( array(
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'cat'            => $tendencia_cat->term_id,
    ) );
    if ( $popular_query->have_posts() ) {
        $popular_post = $popular_query->posts[0];
    }
}
// Fallback: most commented post
if ( ! $popular_post ) {
    $popular_query = new WP_Query( array(
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'orderby'        => 'comment_count',
        'order'          => 'DESC',
    ) );
    $popular_post = $popular_query->have_posts() ? $popular_query->posts[0] : ( isset( $hero_posts[0] ) ? $hero_posts[0] : null );
}
?>

<main>
  <h1 class="screen-reader-text">Blog de Marketing Digital — DAK Agency</h1>
  <!-- ===== HERO SECTION ===== -->
  <section class="hero-blog" id="heroBlog">
    <div class="hero-grid-bg"></div>
    <div class="hero-container">
      <!-- LEFT SIDEBAR -->
      <aside class="hero-sidebar hero-sidebar-left">
        <?php foreach ( $sidebar_left as $i => $post ) :
          setup_postdata( $post );
          get_template_part( 'template-parts/sidebar-article', null, array( 'post' => $post ) );
          if ( $i < count( $sidebar_left ) - 1 ) : ?>
            <hr class="sidebar-separator">
          <?php endif;
        endforeach;
        wp_reset_postdata(); ?>
      </aside>

      <!-- CENTER: Featured article -->
      <?php if ( $featured ) :
        get_template_part( 'template-parts/hero-featured', null, array( 'post' => $featured ) );
      endif; ?>

      <!-- RIGHT SIDEBAR -->
      <aside class="hero-sidebar hero-sidebar-right">
        <?php foreach ( $sidebar_right as $i => $post ) :
          setup_postdata( $post );
          get_template_part( 'template-parts/sidebar-article', null, array( 'post' => $post ) );
          if ( $i < count( $sidebar_right ) - 1 ) : ?>
            <hr class="sidebar-separator">
          <?php endif;
        endforeach;
        wp_reset_postdata(); ?>
      </aside>
    </div>
  </section>

  <!-- ===== CATEGORY SECTIONS ===== -->
  <?php if ( ! empty( $marketing_posts ) ) :
    get_template_part( 'template-parts/category-section', null, array(
      'section_id'    => 'marketing',
      'title'         => 'Marketing',
      'category_slug' => $marketing_cat ? $marketing_cat->slug : 'marketing',
      'posts'         => $marketing_posts,
    ) );
  endif; ?>

  <?php if ( ! empty( $branding_posts ) ) :
    get_template_part( 'template-parts/category-section', null, array(
      'section_id'    => 'branding',
      'title'         => 'Branding',
      'category_slug' => 'branding',
      'posts'         => $branding_posts,
    ) );
  endif; ?>

  <!-- ===== OPINION ===== -->
  <?php if ( $opinion_post ) :
    get_template_part( 'template-parts/opinion-feature', null, array( 'post' => $opinion_post ) );
  endif; ?>

  <!-- ===== ENTREVISTAS ===== -->
  <?php if ( $interview_post ) :
    get_template_part( 'template-parts/interview-hero', null, array( 'post' => $interview_post ) );
  endif; ?>

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
            if ( $i < count( $latest_posts ) - 1 ) : ?>
              <hr class="latest-separator">
            <?php endif;
          endforeach;
          wp_reset_postdata(); ?>
        </div>
        <?php if ( $popular_post ) :
          get_template_part( 'template-parts/latest-sidebar', null, array( 'post' => $popular_post ) );
        endif; ?>
      </div>
    </div>
  </section>
</main>

<?php get_footer(); ?>
