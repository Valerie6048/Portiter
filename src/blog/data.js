import { requireSupabase } from './supabase';
import { fetchAllRows } from './pagination';

function throwIfError(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data || [];
}

async function enrichPosts(client, posts, translations) {
  const ids = posts.map((post) => post.id);
  if (!ids.length) return [];
  const chunks = Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, (index + 1) * 100));
  const [categoryLinks, tagLinks, categoryRows, tagRows, mediaRows] = await Promise.all([
    Promise.all(chunks.map((chunk) => fetchAllRows(() => client.from('portiter_blog_post_categories').select('post_id,category_id').in('post_id', chunk).order('post_id').order('category_id'), 'relasi kategori'))).then((pages) => pages.flat()),
    Promise.all(chunks.map((chunk) => fetchAllRows(() => client.from('portiter_blog_post_tags').select('post_id,tag_id').in('post_id', chunk).order('post_id').order('tag_id'), 'relasi tag'))).then((pages) => pages.flat()),
    fetchAllRows(() => client.from('portiter_blog_categories').select('*').order('name_en').order('id'), 'kategori'),
    fetchAllRows(() => client.from('portiter_blog_tags').select('*').order('name_en').order('id'), 'tag'),
    fetchAllRows(() => client.from('portiter_blog_media_assets').select('*').order('id'), 'media'),
  ]);
  const byId = (rows) => new Map(rows.map((row) => [row.id, row]));
  const categoryMap = byId(categoryRows);
  const tagMap = byId(tagRows);
  const mediaMap = byId(mediaRows);
  const categoriesByPost = new Map();
  const tagsByPost = new Map();
  for (const link of categoryLinks) {
    categoriesByPost.set(link.post_id, [...(categoriesByPost.get(link.post_id) || []), categoryMap.get(link.category_id)].filter(Boolean));
  }
  for (const link of tagLinks) {
    tagsByPost.set(link.post_id, [...(tagsByPost.get(link.post_id) || []), tagMap.get(link.tag_id)].filter(Boolean));
  }
  const translationsByPost = new Map();
  for (const translation of translations) {
    translationsByPost.set(translation.post_id, [...(translationsByPost.get(translation.post_id) || []), {
      ...translation,
      cover: mediaMap.get(translation.cover_media_id) || null,
    }]);
  }
  return posts.map((post) => ({
    ...post,
    translations: translationsByPost.get(post.id) || [],
    categories: categoriesByPost.get(post.id) || [],
    tags: tagsByPost.get(post.id) || [],
  }));
}

export async function fetchPublicPosts(locale = 'en') {
  const staticPayload = document.getElementById('blog-static-data');
  if (staticPayload) {
    const posts = JSON.parse(staticPayload.textContent);
    return posts.map((post) => ({ ...post, translations: post.translations.filter((item) => item.locale === locale) }))
      .filter((post) => post.translations.length)
      .sort((a, b) => new Date(b.translations[0].published_at) - new Date(a.translations[0].published_at));
  }
  const client = requireSupabase();
  const translations = await fetchAllRows(() => client.from('portiter_blog_translations')
    .select('*').eq('locale', locale).eq('status', 'published')
    .lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).order('id'), 'artikel publik');
  if (!translations.length) return [];
  const postIds = [...new Set(translations.map((row) => row.post_id))];
  const posts = (await Promise.all(Array.from({ length: Math.ceil(postIds.length / 100) }, (_, i) =>
    fetchAllRows(() => client.from('portiter_blog_posts').select('*').in('id', postIds.slice(i * 100, (i + 1) * 100)), 'artikel')))).flat();
  const allowedPostIds = new Set(posts.map((post) => post.id));
  return enrichPosts(client, posts, translations.filter((row) => allowedPostIds.has(row.post_id)));
}

export async function fetchAdminPosts() {
  const client = requireSupabase();
  const [postsResult, translationsResult] = await Promise.all([
    fetchAllRows(() => client.from('portiter_blog_posts').select('*').order('updated_at', { ascending: false }).order('id'), 'artikel admin'),
    fetchAllRows(() => client.from('portiter_blog_translations').select('*').order('updated_at', { ascending: false }).order('id'), 'terjemahan admin'),
  ]);
  const posts = postsResult;
  const translations = translationsResult;
  return enrichPosts(client, posts, translations);
}

export async function fetchAdminPost(postId) {
  const client = requireSupabase();
  const [postResult, translationsResult, categoryLinks, tagLinks] = await Promise.all([
    client.from('portiter_blog_posts').select('*').eq('id', postId).single(),
    client.from('portiter_blog_translations').select('*').eq('post_id', postId).order('locale'),
    client.from('portiter_blog_post_categories').select('category_id').eq('post_id', postId),
    client.from('portiter_blog_post_tags').select('tag_id').eq('post_id', postId),
  ]);
  const post = postResult.data;
  if (postResult.error) throw new Error(postResult.error.message);
  const translations = throwIfError(translationsResult);
  const [{ categories, tags }, media] = await Promise.all([fetchAdminTaxonomy(), fetchAdminMedia()]);
  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const tagMap = new Map(tags.map((item) => [item.id, item]));
  const mediaMap = new Map(media.map((item) => [item.id, item]));
  return {
    ...post,
    translations: translations.map((translation) => ({ ...translation, cover: mediaMap.get(translation.cover_media_id) || null })),
    categories: throwIfError(categoryLinks).map((link) => categoryMap.get(link.category_id)).filter(Boolean),
    tags: throwIfError(tagLinks).map((link) => tagMap.get(link.tag_id)).filter(Boolean),
    media,
  };
}

export async function fetchAdminTaxonomy() {
  const client = requireSupabase();
  const [categories, tags] = await Promise.all([
    fetchAllRows(() => client.from('portiter_blog_categories').select('*').order('name_en').order('id'), 'kategori'),
    fetchAllRows(() => client.from('portiter_blog_tags').select('*').order('name_en').order('id'), 'tag'),
  ]);
  return { categories, tags };
}

export async function fetchAdminMedia() {
  const client = requireSupabase();
  return fetchAllRows(() => client.from('portiter_blog_media_assets').select('*').order('created_at', { ascending: false }).order('id'), 'media');
}
