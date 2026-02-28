/**
 * WordPress REST API utility for DAK Panorama Blog
 * Fetches posts, categories, and media from WordPress headless CMS.
 */

// CHANGE THIS to your WordPress site URL
const WP_API_BASE = import.meta.env.WP_API_URL || 'https://blog.dakagency.net/wp-json/wp/v2';

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  yoast_head?: string;
  yoast_head_json?: Record<string, any>;
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

/** Fetch posts with embedded data */
export async function fetchPosts(params: Record<string, string | number> = {}): Promise<WPPost[]> {
  const query = new URLSearchParams({
    _embed: 'true',
    per_page: '10',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const res = await fetch(`${WP_API_BASE}/posts?${query}`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json();
}

/** Fetch a single post by slug */
export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await fetchPosts({ slug, per_page: 1 });
  return posts[0] ?? null;
}

/** Fetch all categories */
export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API_BASE}/categories?per_page=100&orderby=count&order=desc`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json();
}

/** Fetch posts by category slug */
export async function fetchPostsByCategory(categoryId: number, perPage = 4): Promise<WPPost[]> {
  return fetchPosts({ categories: categoryId, per_page: perPage });
}

/** Fetch all post slugs (for getStaticPaths) */
export async function fetchAllSlugs(): Promise<string[]> {
  const allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const posts = await fetchPosts({ per_page: 100, page, _fields: 'slug' });
    allPosts.push(...posts);
    hasMore = posts.length === 100;
    page++;
  }

  return allPosts.map((p) => p.slug);
}

// ── Helpers ──

/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Format a WP date string to "FEB 22, 2026" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Format a WP date string to "FEBRERO 22, 2026" */
export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Get featured image URL from embedded post data */
export function getFeaturedImage(post: WPPost): string {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/assets/blog/placeholder.svg';
}

/** Get featured image alt text */
export function getFeaturedImageAlt(post: WPPost): string {
  return post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ?? stripHtml(post.title.rendered);
}

/** Get author name */
export function getAuthor(post: WPPost): string {
  return post._embedded?.author?.[0]?.name ?? 'DAK Agency';
}

/** Get primary category */
export function getPrimaryCategory(post: WPPost): { name: string; slug: string } {
  const term = post._embedded?.['wp:term']?.[0]?.[0];
  return term ? { name: term.name, slug: term.slug } : { name: 'General', slug: 'general' };
}

/** Map category slug to CSS tag class */
export function getCategoryTagClass(slug: string): string {
  const map: Record<string, string> = {
    marketing: 'tag-marketing',
    'marketing-digital': 'tag-marketing',
    branding: 'tag-branding',
    seo: 'tag-seo',
    'seo-ads': 'tag-seo',
    video: 'tag-video',
    opinion: 'tag-marketing',
    entrevistas: 'tag-branding',
    'diseno-web': 'tag-seo',
    tendencias: 'tag-video',
  };
  return map[slug] ?? 'tag-marketing';
}
