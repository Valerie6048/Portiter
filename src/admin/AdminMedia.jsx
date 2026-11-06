import { useEffect, useMemo, useState } from 'react';
import { fetchAdminMedia, fetchAdminPosts } from '../blog/data';
import { requireSupabase } from '../blog/supabase';
import { useAdminAuth } from './AuthContext';

function extractMediaIds(node, output = new Set()) {
  if (!node || typeof node !== 'object') return output;
  if (node.attrs?.mediaId) output.add(node.attrs.mediaId);
  (node.content || []).forEach((child) => extractMediaIds(child, output));
  return output;
}

export default function AdminMedia() {
  const { user } = useAdminAuth();
  const [media, setMedia] = useState([]);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = () => Promise.all([fetchAdminMedia(), fetchAdminPosts()]).then(([assets, articles]) => { setMedia(assets); setPosts(articles); }).catch((loadError) => setError(loadError.message));
  useEffect(() => { refresh(); }, []);
  const usedIds = useMemo(() => {
    const ids = new Set();
    posts.forEach((post) => post.translations.forEach((translation) => {
      if (translation.cover_media_id) ids.add(translation.cover_media_id);
      extractMediaIds(translation.content_json, ids);
    }));
    return ids;
  }, [posts]);
  const visible = media.filter((asset) => asset.filename.toLowerCase().includes(query.toLowerCase().trim()));

  const upload = async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) throw new Error(`${file.name}: format gambar tidak didukung.`);
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: ukuran maksimum 10 MB.`);
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
        const objectPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const client = requireSupabase();
        const { error: uploadError } = await client.storage.from('blog-media').upload(objectPath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = client.storage.from('blog-media').getPublicUrl(objectPath);
        const { error: rowError } = await client.from('portiter_blog_media_assets').insert({ object_path: objectPath, public_url: publicUrl, filename: file.name, mime_type: file.type, size_bytes: file.size, created_by: user.id });
        if (rowError) { await client.storage.from('blog-media').remove([objectPath]); throw rowError; }
      }
      await refresh();
    } catch (uploadError) { setError(uploadError.message); }
    finally { setBusy(false); }
  };

  const remove = async (asset) => {
    if (usedIds.has(asset.id)) return;
    if (!window.confirm(`Hapus ${asset.filename} dari media library?`)) return;
    setBusy(true);
    const client = requireSupabase();
    const { error: storageError } = await client.storage.from('blog-media').remove([asset.object_path]);
    if (!storageError) {
      const { error: rowError } = await client.from('portiter_blog_media_assets').delete().eq('id', asset.id);
      if (rowError) setError(rowError.message);
    } else setError(storageError.message);
    setBusy(false);
    refresh();
  };

  return <>
    <div className="admin-page-title"><div><span className="admin-eyebrow">ASSET MANAGER</span><h1>Media library</h1><p>Unggah dan gunakan ulang gambar cover maupun ilustrasi artikel.</p></div><label className={`admin-primary upload-media-button ${busy ? 'disabled' : ''}`}>＋ Unggah gambar<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden disabled={busy} onChange={upload}/></label></div>
    <div className="admin-list-controls"><input className="admin-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama file…" aria-label="Cari media"/><span className="media-count">{media.length} aset · JPEG, PNG, WebP, GIF, AVIF · maks. 10 MB</span></div>
    {error && <div className="admin-banner-error" role="alert">{error}</div>}
    <div className="admin-media-grid">{visible.map((asset) => <article className="admin-media-card" key={asset.id}><img src={asset.public_url} alt={asset.alt_text || asset.filename} loading="lazy"/><div><b title={asset.filename}>{asset.filename}</b><small>{(asset.size_bytes / 1024).toFixed(0)} KB · {usedIds.has(asset.id) ? 'Dipakai artikel' : 'Belum dipakai'}</small><div className="admin-media-actions"><button type="button" onClick={() => navigator.clipboard.writeText(asset.public_url).catch(() => setError('Tidak dapat menyalin URL.'))}>Salin URL</button><button type="button" className="danger" disabled={busy || usedIds.has(asset.id)} onClick={() => remove(asset)}>Hapus</button></div></div></article>)}</div>
    {media.length === 0 && <div className="admin-empty-card"><span>▧</span><h2>Belum ada media</h2><p>Unggah gambar pertama untuk cover atau isi artikel.</p></div>}
  </>;
}
