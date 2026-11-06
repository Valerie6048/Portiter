import { makeSlug } from '../blog/content.js';

const EMPTY_CONTENT = { type: 'doc', content: [{ type: 'paragraph' }] };

export function slugCandidate(base, suffix = 1) {
  const ending = suffix === 1 ? '' : `-${suffix}`;
  return `${base.slice(0, 140 - ending.length).replace(/-+$/g, '')}${ending}`;
}

async function availableSlug(client, locale, base) {
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = slugCandidate(base, suffix);
    const { data, error } = await client.from('portiter_blog_translations')
      .select('id').eq('locale', locale).ilike('slug', candidate).limit(1);
    if (error) throw error;
    if (!data?.length) return candidate;
  }
  throw new Error('Tidak dapat menemukan slug URL yang tersedia.');
}

async function removeIncompletePost(client, postId) {
  const { error: trashError } = await client.from('portiter_blog_posts')
    .update({ trashed_at: new Date().toISOString() }).eq('id', postId);
  if (trashError) throw trashError;
  const { error: deleteError } = await client.from('portiter_blog_posts')
    .delete().eq('id', postId).not('trashed_at', 'is', null);
  if (deleteError) throw deleteError;
}

export async function createGeneratedDraft(client, userId, article) {
  if (!article || !['en', 'id'].includes(article.locale) || !article.title || !article.content_json) {
    throw new Error('Hasil generator tidak lengkap.');
  }
  const base = makeSlug(article.slug || article.title);
  if (!base) throw new Error('Judul artikel tidak memiliki slug yang valid.');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await availableSlug(client, article.locale, base);
    const { data: post, error: postError } = await client.from('portiter_blog_posts')
      .insert({ created_by: userId }).select('id').single();
    if (postError) throw postError;
    try {
      const otherLocale = article.locale === 'id' ? 'en' : 'id';
      const otherSlug = `untitled-${otherLocale}-${crypto.randomUUID().slice(0, 12)}`;
      const translations = [
        {
          post_id: post.id, locale: article.locale, slug, title: article.title,
          excerpt: article.excerpt, content_json: article.content_json,
          meta_title: article.meta_title, meta_description: article.meta_description,
          status: 'draft', cover_media_id: null,
        },
        {
          post_id: post.id, locale: otherLocale, slug: otherSlug,
          title: '', excerpt: '', content_json: EMPTY_CONTENT,
          meta_title: '', meta_description: '', status: 'draft', cover_media_id: null,
        },
      ];
      const { error: translationError } = await client.from('portiter_blog_translations').insert(translations);
      if (translationError) throw translationError;
      for (const [table, key, ids] of [
        ['portiter_blog_post_categories', 'category_id', article.category_ids],
        ['portiter_blog_post_tags', 'tag_id', article.tag_ids],
      ]) {
        if (!ids?.length) continue;
        const { error } = await client.from(table).insert(ids.map((id) => ({ post_id: post.id, [key]: id })));
        if (error) throw error;
      }
      return post.id;
    } catch (error) {
      try { await removeIncompletePost(client, post.id); }
      catch (cleanupError) {
        throw new Error(`Draft belum lengkap (ID ${post.id}); periksa daftar artikel. ${cleanupError.message}`, { cause: cleanupError });
      }
      if (error.code === '23505' && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error('Slug URL berubah bersamaan. Coba simpan lagi.');
}
