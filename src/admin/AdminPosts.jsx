import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAdminPosts, fetchAdminTaxonomy } from '../blog/data';
import { requireSupabase } from '../blog/supabase';

function primaryTitle(post) {
  return post.translations.find((item) => item.locale === 'en')?.title || post.translations.find((item) => item.locale === 'id')?.title || 'Artikel tanpa judul';
}
function statusFor(post) {
  if (post.trashed_at) return 'trash';
  if (post.archived_at) return 'archived';
  if (post.translations.some((item) => item.status === 'published' && new Date(item.published_at) <= new Date())) return 'published';
  if (post.translations.some((item) => item.status === 'scheduled')) return 'scheduled';
  return 'draft';
}

export default function AdminPosts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], tags: [] });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [locale, setLocale] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = () => Promise.all([fetchAdminPosts(), fetchAdminTaxonomy()]).then(([items, terms]) => {
    setPosts(items);
    setTaxonomy(terms);
  }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);
  useEffect(() => { setSearchParams(status === 'all' ? {} : { status }, { replace: true }); }, [status, setSearchParams]);

  const filtered = useMemo(() => posts.filter((post) => {
    const matchesStatus = status === 'all' || statusFor(post) === status;
    const translations = locale === 'all' ? post.translations : post.translations.filter((item) => item.locale === locale);
    const text = `${primaryTitle(post)} ${translations.map((item) => `${item.title} ${item.excerpt} ${item.slug}`).join(' ')} ${post.categories.map((item) => item.name_en).join(' ')}`.toLowerCase();
    return matchesStatus && translations.length > 0 && text.includes(query.toLowerCase().trim());
  }), [posts, status, locale, query]);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const bulkChange = async (action) => {
    if (!selected.length) return;
    const client = requireSupabase();
    setBusy(true);
    setError('');
    try {
      if (action === 'archive') {
        const eligible = posts.filter((post) => selected.includes(post.id) && !post.trashed_at && !post.archived_at);
        for (const post of eligible) {
          const archivedStatuses = Object.fromEntries(post.translations.map((item) => [item.id, { status: item.status, scheduled_at: item.scheduled_at, published_at: item.published_at }]));
          const { error: updateError } = await client.from('portiter_blog_posts').update({ archived_at: new Date().toISOString(), archived_statuses: archivedStatuses }).eq('id', post.id);
          if (updateError) throw updateError;
        }
      } else if (action === 'trash') {
        const eligible = posts.filter((post) => selected.includes(post.id) && !post.trashed_at);
        for (const post of eligible) {
          const { error: updateError } = await client.from('portiter_blog_posts').update({ trashed_at: new Date().toISOString(), archived_at: null }).eq('id', post.id);
          if (updateError) throw updateError;
        }
      } else if (action === 'restore-trash') {
        const eligible = posts.filter((post) => selected.includes(post.id) && post.trashed_at);
        for (const post of eligible) {
          const { error: resetError } = await client.from('portiter_blog_translations').update({ status: 'draft', scheduled_at: null, published_at: null }).eq('post_id', post.id);
          if (resetError) throw resetError;
          const { error: restoreError } = await client.from('portiter_blog_posts').update({ trashed_at: null, archived_at: null, archived_statuses: null }).eq('id', post.id);
          if (restoreError) throw restoreError;
        }
      } else if (action === 'restore-archive') {
        const eligible = posts.filter((post) => selected.includes(post.id) && post.archived_at);
        if (eligible.some((post) => post.translations.some((item) => item.status === 'published'))) {
          if (!window.confirm('Artikel yang sebelumnya tayang akan kembali dipublikasikan. Lanjutkan?')) return;
        }
        for (const post of eligible) {
          const { error: restoreError } = await client.from('portiter_blog_posts').update({ archived_at: null, archived_statuses: null }).eq('id', post.id);
          if (restoreError) throw restoreError;
        }
      }
      setSelected([]);
      await refresh();
    } catch (actionError) { setError(actionError.message); }
    finally { setBusy(false); }
  };

  const hardDelete = async (post) => {
    const confirmation = window.prompt(`Hapus permanen “${primaryTitle(post)}”? Artikel tidak dapat dipulihkan. Ketik DELETE untuk melanjutkan.`);
    if (confirmation !== 'DELETE') return;
    setBusy(true);
    const { error: deleteError } = await requireSupabase().from('portiter_blog_posts').delete().eq('id', post.id).not('trashed_at', 'is', null);
    if (deleteError) setError(deleteError.message);
    setBusy(false);
    refresh();
  };

  const archiveSingle = async (post) => {
    const archivedStatuses = Object.fromEntries(post.translations.map((item) => [item.id, { status: item.status, scheduled_at: item.scheduled_at, published_at: item.published_at }]));
    setBusy(true);
    const { error: archiveError } = await requireSupabase().from('portiter_blog_posts').update({ archived_at: new Date().toISOString(), archived_statuses: archivedStatuses }).eq('id', post.id);
    if (archiveError) setError(archiveError.message);
    setBusy(false);
    refresh();
  };

  const allSelected = visible.length > 0 && visible.every((post) => selected.includes(post.id));
  const setAllSelected = () => setSelected(allSelected ? selected.filter((id) => !visible.some((post) => post.id === id)) : [...new Set([...selected, ...visible.map((post) => post.id)])]);
  const options = [['all', 'Semua'], ['draft', 'Draft'], ['scheduled', 'Terjadwal'], ['published', 'Published'], ['archived', 'Archived'], ['trash', 'Trash']];

  return (
    <>
      <div className="admin-page-title"><div><span className="admin-eyebrow">CONTENT LIBRARY</span><h1>Artikel</h1><p>Kelola semua tulisan dan terjemahan dalam satu tempat.</p></div><div className="admin-title-actions"><Link className="admin-outline-button" to="/admin/posts/generate">✦ Generate artikel</Link><Link className="admin-primary" to="/admin/posts/new">＋ Artikel baru</Link></div></div>
      {error && <div className="admin-banner-error" role="alert">{error}</div>}
      <div className="admin-list-controls"><input className="admin-search-input" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari judul, slug, kategori…" aria-label="Cari artikel"/><select value={locale} onChange={(event) => { setLocale(event.target.value); setPage(1); }} aria-label="Filter bahasa"><option value="all">Semua bahasa</option><option value="en">English</option><option value="id">Bahasa Indonesia</option></select></div>
      <div className="admin-status-tabs">{options.map(([value, label]) => <button type="button" key={value} className={status === value ? 'active' : ''} onClick={() => { setStatus(value); setPage(1); }}>{label}<span>{value === 'all' ? posts.length : posts.filter((post) => statusFor(post) === value).length}</span></button>)}</div>
      {selected.length > 0 && <div className="admin-bulkbar"><strong>{selected.length} dipilih</strong>{status === 'trash' ? <><button type="button" disabled={busy} onClick={() => bulkChange('restore-trash')}>Pulihkan sebagai draft</button><span>Hapus permanen melalui menu tiap baris</span></> : status === 'archived' ? <button type="button" disabled={busy} onClick={() => bulkChange('restore-archive')}>Pulihkan arsip</button> : <><button type="button" disabled={busy} onClick={() => bulkChange('archive')}>Arsipkan</button><button type="button" disabled={busy} onClick={() => bulkChange('trash')}>Pindahkan ke Trash</button></>}<button type="button" onClick={() => setSelected([])}>Batal</button></div>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="Pilih semua artikel" checked={allSelected} onChange={setAllSelected}/></th><th>Judul</th><th>Bahasa</th><th>Status</th><th>Terakhir diubah</th><th><span className="sr-only">Aksi</span></th></tr></thead>
        <tbody>{visible.map((post) => <tr key={post.id}><td><input type="checkbox" aria-label={`Pilih ${primaryTitle(post)}`} checked={selected.includes(post.id)} onChange={() => toggleSelected(post.id)}/></td><td><div className="admin-table-title">{primaryTitle(post)}{post.is_featured && <span className="admin-featured-pill">Featured</span>}<small>{post.translations.map((item) => `${item.locale.toUpperCase()}: ${item.title || 'Belum ditulis'}`).join(' · ')}</small></div></td><td>{post.translations.map((item) => <span key={item.id} className="admin-locale-pill">{item.locale.toUpperCase()}</span>)}</td><td><span className={`admin-status-pill ${statusFor(post)}`}>{statusFor(post)}</span></td><td>{new Date(post.updated_at).toLocaleDateString('id-ID')}</td><td><div className="admin-row-actions">{post.trashed_at ? <button type="button" className="danger" disabled={busy} onClick={() => hardDelete(post)}>Hapus permanen</button> : <><Link to={`/admin/posts/${post.id}`}>Edit</Link>{!post.archived_at && <button type="button" disabled={busy} onClick={() => archiveSingle(post)}>Arsipkan</button>}</>}</div></td></tr>)}
          {!loading && filtered.length === 0 && <tr><td colSpan="6" className="admin-table-empty">Tidak ada artikel yang cocok dengan filter ini.</td></tr>}
          {loading && <tr><td colSpan="6" className="admin-table-empty">Memuat artikel…</td></tr>}
        </tbody></table></div>
      <p className="admin-table-foot">Menampilkan {filtered.length} dari {posts.length} artikel · Kategori tersedia: {taxonomy.categories.length} · Tag: {taxonomy.tags.length}</p>
      {pageCount > 1 && <nav className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Sebelumnya</button><span>Halaman {page} dari {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Berikutnya</button></nav>}
    </>
  );
}
