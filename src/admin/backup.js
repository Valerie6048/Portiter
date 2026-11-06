import { requireSupabase } from '../blog/supabase';
import { fetchAllRows } from '../blog/pagination';

const BACKUP_VERSION = 1;

export async function exportBlogBackup() {
  const client = requireSupabase();
  const tables = ['portiter_blog_posts', 'portiter_blog_translations', 'portiter_blog_categories', 'portiter_blog_tags', 'portiter_blog_post_categories', 'portiter_blog_post_tags', 'portiter_blog_media_assets', 'portiter_blog_post_revisions'];
  const rows = await Promise.all(tables.map(async (table) => {
    const data = await fetchAllRows(() => {
      const query = client.from(table).select('*').order(table === 'portiter_blog_post_categories' || table === 'portiter_blog_post_tags' ? 'post_id' : 'id');
      return table === 'portiter_blog_post_categories' ? query.order('category_id') : table === 'portiter_blog_post_tags' ? query.order('tag_id') : query;
    }, table);
    return [table, data];
  }));
  return { format: 'portiter-blog-backup', version: BACKUP_VERSION, exported_at: new Date().toISOString(), tables: Object.fromEntries(rows) };
}

export async function importBlogBackup(file) {
  if (file.size > 100 * 1024 * 1024) throw new Error('File backup maksimum 100 MB.');
  let backup;
  try { backup = JSON.parse(await file.text()); }
  catch { throw new Error('File bukan JSON yang valid.'); }
  if (backup?.format !== 'portiter-blog-backup' || backup?.version !== BACKUP_VERSION || !backup.tables) {
    throw new Error('Format backup Portiter tidak didukung.');
  }
  const tableOrder = ['portiter_blog_categories', 'portiter_blog_tags', 'portiter_blog_posts', 'portiter_blog_media_assets', 'portiter_blog_translations', 'portiter_blog_post_categories', 'portiter_blog_post_tags', 'portiter_blog_post_revisions'];
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user) throw new Error('Sesi admin tidak ditemukan. Masuk kembali sebelum memulihkan backup.');
  let restored = 0;
  const media = backup.tables.portiter_blog_media_assets || backup.tables.blog_media_assets || [];
  const mediaUrls = new Map(media.map((asset) => [asset.public_url, client.storage.from('blog-media').getPublicUrl(asset.object_path).data.publicUrl]));
  const rewriteContent = (value) => {
    if (Array.isArray(value)) return value.map(rewriteContent);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'src' && typeof item === 'string' ? (mediaUrls.get(item) || item) : rewriteContent(item)]));
  };
  for (const table of tableOrder) {
    const rows = backup.tables[table] || backup.tables[table.replace(/^portiter_/, '')];
    if (!Array.isArray(rows)) throw new Error(`Backup tidak lengkap: ${table} tidak ditemukan.`);
    for (let start = 0; start < rows.length; start += 100) {
      const batch = rows.slice(start, start + 100).map((row) => {
        const item = ['portiter_blog_posts', 'portiter_blog_media_assets', 'portiter_blog_post_revisions'].includes(table)
          ? { ...row, created_by: authData.user.id } : { ...row };
        if (table === 'portiter_blog_media_assets') item.public_url = mediaUrls.get(row.public_url);
        if (table === 'portiter_blog_translations') item.content_json = rewriteContent(row.content_json);
        if (table === 'portiter_blog_post_revisions') item.snapshot = rewriteContent(row.snapshot);
        return item;
      });
      const { error } = await client.from(table).upsert(batch);
      if (error) throw new Error(`Pemulihan ${table} gagal setelah ${restored} baris: ${error.message}`);
      restored += Math.min(100, rows.length - start);
    }
  }
  return restored;
}
