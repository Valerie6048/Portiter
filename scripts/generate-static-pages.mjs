import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { projectDetails } from '../src/data/projectDetails.js';
import { plainTextFromContent, readTimeMinutes, renderContentHtml, safeJsonLd } from '../src/blog/content.js';
import { fetchAllRows } from '../src/blog/pagination.js';
import { normalizeSupabaseProjectUrl } from '../src/blog/supabase-url.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://www.akhmdnzr.fun';
const buildEnv = loadEnv(process.env.NODE_ENV || 'production', root, '');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const projects = Object.entries(projectDetails.en);
const supabaseUrl = normalizeSupabaseProjectUrl(buildEnv.SUPABASE_URL || buildEnv.VITE_SUPABASE_URL);
const supabaseAnonKey = buildEnv.SUPABASE_ANON_KEY || buildEnv.VITE_SUPABASE_ANON_KEY;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll('&#39;', '&apos;');
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Missing ${label} in built index.html`);
  return html.replace(pattern, () => replacement);
}

function replaceRoot(html, content) {
  return replaceRequired(html, /<div id="root">[\s\S]*<\/div>/, `<div id="root">${content}</div>`, 'root shell');
}

function setMeta(html, pattern, replacement, label) {
  return replaceRequired(html, pattern, replacement, label);
}

function applySeo(html, { title, description, url, image, type = 'website', language = 'en' }) {
  let result = html;
  result = setMeta(result, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, 'title');
  result = setMeta(result, /<meta name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(description)}" />`, 'description');
  result = setMeta(result, /<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`, 'canonical');
  result = setMeta(result, /<meta property="og:type"[^>]*\/>/, `<meta property="og:type" content="${type}" />`, 'og:type');
  result = setMeta(result, /<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`, 'og:title');
  result = setMeta(result, /<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`, 'og:description');
  result = setMeta(result, /<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`, 'og:url');
  result = setMeta(result, /<meta property="og:image"[^>]*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`, 'og:image');
  result = setMeta(result, /<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`, 'twitter:title');
  result = setMeta(result, /<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`, 'twitter:description');
  result = setMeta(result, /<meta name="twitter:image"[^>]*\/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`, 'twitter:image');
  result = result.replace('<html lang="en">', `<html lang="${language}">`);
  return result;
}

function embedBlogData(html, posts) {
  return html.replace('</head>', `<script type="application/json" id="blog-static-data">${safeJsonLd(posts)}</script></head>`);
}

async function fetchBlogData() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.VERCEL === '1') {
      throw new Error('Blog build requires SUPABASE_URL and SUPABASE_ANON_KEY (or their VITE_ variants) in Vercel environment variables.');
    }
    console.warn('Supabase is not configured. Generating empty blog routes for local preview.');
    return { posts: [], categories: [], tags: [], media: [] };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const translations = await fetchAllRows(() => client.from('portiter_blog_translations')
    .select('*').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).order('id'), 'terjemahan blog');
  const postIds = [...new Set(translations.map((item) => item.post_id))];
  if (!postIds.length) return { posts: [], categories: [], tags: [], media: [] };

  const idChunks = Array.from({ length: Math.ceil(postIds.length / 100) }, (_, index) => postIds.slice(index * 100, (index + 1) * 100));
  const [postPages, categoryLinkPages, tagLinkPages, categories, tags, media] = await Promise.all([
    Promise.all(idChunks.map((ids) => fetchAllRows(() => client.from('portiter_blog_posts').select('*').in('id', ids).order('id'), 'artikel'))),
    Promise.all(idChunks.map((ids) => fetchAllRows(() => client.from('portiter_blog_post_categories').select('*').in('post_id', ids).order('post_id').order('category_id'), 'relasi kategori'))),
    Promise.all(idChunks.map((ids) => fetchAllRows(() => client.from('portiter_blog_post_tags').select('*').in('post_id', ids).order('post_id').order('tag_id'), 'relasi tag'))),
    fetchAllRows(() => client.from('portiter_blog_categories').select('*').order('id'), 'kategori'),
    fetchAllRows(() => client.from('portiter_blog_tags').select('*').order('id'), 'tag'),
    fetchAllRows(() => client.from('portiter_blog_media_assets').select('*').order('id'), 'media'),
  ]);
  const posts = postPages.flat();
  const categoryLinks = categoryLinkPages.flat();
  const tagLinks = tagLinkPages.flat();
  const postMap = new Map(posts.map((item) => [item.id, { ...item, translations: [], categories: [], tags: [] }]));
  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const tagMap = new Map(tags.map((item) => [item.id, item]));
  const mediaMap = new Map(media.map((item) => [item.id, item]));
  for (const item of translations) {
    const post = postMap.get(item.post_id);
    if (!post || post.archived_at || post.trashed_at) continue;
    post.translations.push({ ...item, cover: mediaMap.get(item.cover_media_id) || null });
  }
  for (const link of categoryLinks) {
    const row = categoryMap.get(link.category_id);
    const post = postMap.get(link.post_id);
    if (row && post && !post.archived_at && !post.trashed_at) post.categories.push(row);
  }
  for (const link of tagLinks) {
    const row = tagMap.get(link.tag_id);
    const post = postMap.get(link.post_id);
    if (row && post && !post.archived_at && !post.trashed_at) post.tags.push(row);
  }
  return { posts: [...postMap.values()].filter((item) => item.translations.length), categories, tags, media };
}

function translationPath(translation) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(translation.slug)) throw new Error(`Invalid blog slug: ${translation.slug}`);
  return translation.locale === 'id' ? `/id/blog/${translation.slug}` : `/blog/${translation.slug}`;
}

function localizedNames(items, locale, field) {
  return items.map((item) => item[`${field}_${locale}`]).filter(Boolean);
}

function renderBlogCard(post, translation) {
  const locale = translation.locale;
  const href = translationPath(translation);
  const categories = localizedNames(post.categories, locale, 'name').slice(0, 2);
  const excerpt = translation.excerpt || plainTextFromContent(translation.content_json).slice(0, 150);
  const cover = translation.cover?.public_url
    ? `<a class="blog-card-cover" href="${href}"><img src="${escapeHtml(translation.cover.public_url)}" alt="${escapeHtml(translation.cover.alt_text || '')}" /></a>`
    : '<div class="blog-card-cover blog-cover-placeholder"><span>Writing / Notes</span></div>';
  return `<article class="blog-card">${cover}<div class="blog-card-content"><div class="blog-card-meta">${categories.map((item) => `<span class="blog-category-pill">${escapeHtml(item)}</span>`).join('')}<span>${new Date(translation.published_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span><span>·</span><span>${readTimeMinutes(translation.content_json)} min</span></div><h2><a href="${href}">${escapeHtml(translation.title)}</a></h2><p>${escapeHtml(excerpt)}</p><a class="blog-read-link" href="${href}">${locale === 'id' ? 'Baca artikel' : 'Read article'} ↗</a></div></article>`;
}

function renderBlogIndexPage(locale, posts) {
  const indexPath = locale === 'id' ? '/id/blog' : '/blog';
  const localePosts = posts
    .map((post) => ({ post, translation: post.translations.find((item) => item.locale === locale) }))
    .filter(({ translation }) => translation)
    .sort((a, b) => new Date(b.translation.published_at) - new Date(a.translation.published_at));
  const cards = localePosts.slice(0, 9).map(({ post, translation }) => renderBlogCard(post, translation)).join('');
  const fallback = `<main class="blog-index blog-container"><div class="blog-page-intro"><span class="blog-eyebrow">${locale === 'id' ? 'IDEAS, CATATAN, DAN EKSPERIMEN' : 'IDEAS, NOTES, AND EXPERIMENTS'}</span><h1>${locale === 'id' ? 'Tulisan & Catatan' : 'Writing & Notes'}</h1><p>${locale === 'id' ? 'Catatan praktis seputar AI, machine learning, dan sistem data yang dibangun untuk dunia nyata.' : 'Practical notes on AI, machine learning, and data systems built for the real world.'}</p></div>${cards ? `<div class="blog-grid">${cards}</div>` : `<div class="blog-empty"><h2>${locale === 'id' ? 'Belum ada tulisan' : 'No stories yet'}</h2></div>`}<a href="${indexPath}" class="sr-only">${locale === 'id' ? 'Buka daftar artikel' : 'Open article list'}</a></main>`;
  let html = applySeo(template, {
    title: locale === 'id' ? 'Blog — Akhmad Nizar Z.' : 'Blog — Akhmad Nizar Z.',
    description: locale === 'id' ? 'Catatan tentang AI, machine learning, dan membangun sistem data.' : 'Notes on AI, machine learning, and building data systems.',
    url: `${origin}${indexPath}`,
    image: `${origin}/og_image.jpg`,
    language: locale,
  });
  html = replaceRoot(html, fallback);
  html = html.replace('</head>', `<link rel="alternate" hreflang="en" href="${origin}/blog" /><link rel="alternate" hreflang="id" href="${origin}/id/blog" /><link rel="alternate" hreflang="x-default" href="${origin}/blog" /></head>`);
  return embedBlogData(html, posts);
}

function articleHtml(post, translation) {
  const locale = translation.locale;
  const route = translationPath(translation);
  const title = translation.meta_title || translation.title;
  const description = translation.meta_description || translation.excerpt || plainTextFromContent(translation.content_json).slice(0, 160);
  const coverUrl = translation.cover?.public_url || `${origin}/og_image.jpg`;
  const relatedTranslations = post.translations.filter((item) => item.locale !== locale);
  const hreflang = post.translations.map((item) => `<link rel="alternate" hreflang="${item.locale}" href="${origin}${translationPath(item)}" />`).join('');
  const english = post.translations.find((item) => item.locale === 'en');
  const xDefault = english ? `<link rel="alternate" hreflang="x-default" href="${origin}${translationPath(english)}" />` : '';
  const categoryNames = localizedNames(post.categories, locale, 'name');
  const cover = translation.cover?.public_url
    ? `<figure class="blog-article-cover"><img src="${escapeHtml(translation.cover.public_url)}" alt="${escapeHtml(translation.cover.alt_text || '')}" /></figure>`
    : '';
  const fallback = `<main class="blog-article-container"><nav class="blog-breadcrumbs" aria-label="Breadcrumb"><a href="${locale === 'id' ? '/id/blog' : '/blog'}">Blog</a><span>/</span><span>${escapeHtml(translation.title)}</span></nav><article><header class="blog-article-header"><div class="blog-article-kicker">${categoryNames.map((item) => `<span class="blog-category-pill">${escapeHtml(item)}</span>`).join('')}</div><h1>${escapeHtml(translation.title)}</h1><p class="blog-article-excerpt">${escapeHtml(translation.excerpt)}</p><div class="blog-article-meta"><span>${new Date(translation.published_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span><span>·</span><span>${readTimeMinutes(translation.content_json)} min ${locale === 'id' ? 'baca' : 'read'}</span></div></header>${cover}<div class="blog-article-body">${renderContentHtml(translation.content_json)}</div></article></main>`;
  const structuredData = safeJsonLd({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: translation.title,
    description, image: coverUrl, datePublished: translation.published_at,
    dateModified: translation.updated_at, inLanguage: locale,
    mainEntityOfPage: `${origin}${route}`,
    author: { '@type': 'Person', name: 'Akhmad Nizar Zakaria', url: origin },
    publisher: { '@type': 'Person', name: 'Akhmad Nizar Zakaria', url: origin },
  });
  let html = applySeo(template, { title: `${title} — Akhmad Nizar Z.`, description, url: `${origin}${route}`, image: coverUrl, type: 'article', language: locale });
  html = replaceRoot(html, fallback);
  html = html.replace('</head>', `${hreflang}${xDefault}<script type="application/ld+json">${structuredData}</script></head>`);
  return { html, route, title: translation.title, description, coverUrl, alternateLocale: relatedTranslations[0]?.locale || null };
}

function renderRss(locale, posts) {
  const items = posts.flatMap((post) => post.translations.filter((item) => item.locale === locale).map((translation) => {
    const url = `${origin}${translationPath(translation)}`;
    const description = translation.excerpt || plainTextFromContent(translation.content_json).slice(0, 240);
    return `<item><title>${escapeXml(translation.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><description>${escapeXml(description)}</description><pubDate>${new Date(translation.published_at).toUTCString()}</pubDate></item>`;
  })).join('');
  const feedTitle = locale === 'id' ? 'Tulisan Akhmad Nizar' : 'Writing by Akhmad Nizar';
  const feedPath = locale === 'id' ? '/id/blog/feed.xml' : '/blog/feed.xml';
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(feedTitle)}</title><link>${origin}${locale === 'id' ? '/id/blog' : '/blog'}</link><description>${escapeXml(feedTitle)}</description><language>${locale}</language><atom:link href="${origin}${feedPath}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>${items}</channel></rss>`;
}

function renderProject(id, project) {
  const url = `${origin}/project/${id}`;
  const title = `${project.title} — Akhmad Nizar Z.`;
  const description = `${project.subtitle} — ${project.title}. Portfolio project by Akhmad Nizar Zakaria.`;
  const fallback = `<main class="seo-fallback"><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.subtitle)}</p><p>${escapeHtml(project.usecase.content)}</p><a href="/">Back to portfolio</a></main>`;
  let html = template;
  html = replaceRequired(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(description)}" />`, 'description');
  html = replaceRequired(html, /<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${url}" />`, 'canonical');
  html = replaceRequired(html, /<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`, 'og:description');
  html = replaceRequired(html, /<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${url}" />`, 'og:url');
  html = replaceRequired(html, /<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`, 'twitter:description');
  return replaceRoot(html, fallback);
}

async function main() {
  const blog = await fetchBlogData();
  for (const [id, project] of projects) {
    const folder = path.join(dist, 'project', id);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'index.html'), renderProject(id, project));
  }

  for (const locale of ['en', 'id']) {
    const indexDir = locale === 'id' ? path.join(dist, 'id', 'blog') : path.join(dist, 'blog');
    await mkdir(indexDir, { recursive: true });
    await writeFile(path.join(indexDir, 'index.html'), renderBlogIndexPage(locale, blog.posts));
    await writeFile(path.join(indexDir, 'feed.xml'), renderRss(locale, blog.posts));
  }

  const sitemapPaths = ['/', ...projects.map(([id]) => `/project/${id}`), '/blog', '/id/blog'];
  const englishPosts = blog.posts.flatMap((post) => post.translations.filter((item) => item.locale === 'en').map((translation) => ({ post, translation })));
  const indonesianPosts = blog.posts.flatMap((post) => post.translations.filter((item) => item.locale === 'id').map((translation) => ({ post, translation })));
  for (const { post, translation } of [...englishPosts, ...indonesianPosts]) {
    const { html, route } = articleHtml(post, translation);
    const folder = path.resolve(dist, `.${route}`);
    if (!folder.startsWith(dist)) throw new Error(`Refusing to write blog route outside dist: ${route}`);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'index.html'), embedBlogData(html, blog.posts));
    sitemapPaths.push(route);
  }

  const homeStories = englishPosts.sort((a, b) => new Date(b.translation.published_at) - new Date(a.translation.published_at)).slice(0, 3);
  {
    const section = `<section class="seo-home-blog"><h2>Latest writing</h2><div>${homeStories.map(({ post, translation }) => `<article><a href="${translationPath(translation)}"><strong>${escapeHtml(translation.title)}</strong></a><p>${escapeHtml(translation.excerpt)}</p></article>`).join('')}</div><a href="/blog">Explore all writing ↗</a></section>`;
    const homePath = path.join(dist, 'index.html');
    let html = await readFile(homePath, 'utf8');
    if (homeStories.length) {
      const fallback = /(<main class="seo-fallback">[\s\S]*?)(<\/main>)/;
      if (!fallback.test(html)) throw new Error('Missing home SEO fallback in built index.html');
      html = html.replace(fallback, (_, opening, closing) => `${opening}${section}${closing}`);
    }
    await writeFile(homePath, embedBlogData(html, blog.posts));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemapPaths)].map((url) => `  <url>\n    <loc>${origin}${url}</loc>\n  </url>`).join('\n')}\n</urlset>\n`;
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
}

await main();
