import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiSave } from 'react-icons/fi';
import BlogEditor from './BlogEditor';
import { fetchAdminPost, fetchAdminTaxonomy } from '../blog/data';
import { makeSlug, plainTextFromContent, readTimeMinutes } from '../blog/content';
import { requireSupabase } from '../blog/supabase';
import { useAdminAuth } from './AuthContext';
import { requestBlogDeploy } from './blog-deploy';

const EMPTY_CONTENT = { type: 'doc', content: [{ type: 'paragraph' }] };
const LOCALES = ['en', 'id'];
const localeLabel = (locale) => locale === 'id' ? 'Bahasa Indonesia' : 'English';

function dateTimeLocalInJakarta(value) {
  if (!value) return '';
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const part = (name) => parts.find((item) => item.type === name)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

function jakartaLocalToUtc(value) {
  if (!value) return '';
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  const assumed = new Date(desired);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(assumed);
  const part = (name) => Number(parts.find((item) => item.type === name)?.value || 0);
  const represented = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
  return new Date(desired - (represented - desired)).toISOString();
}

function slugFallback(locale) {
  return `untitled-${locale}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminPostEditor() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedLocale = searchParams.get('locale');
  const { user } = useAdminAuth();
  const [post, setPost] = useState(null);
  const [form, setForm] = useState(null);
  const [locale, setLocale] = useState('en');
  const [taxonomy, setTaxonomy] = useState({ categories: [], tags: [] });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState('');
  const [newing, setNewing] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const saveRef = useRef(null);
  const initialized = useRef(false);
  const editCount = useRef(0);

  const activeTranslation = useMemo(() => post?.translations?.find((item) => item.locale === locale), [post, locale]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      setError('');
      if (postId === 'new') {
        if (initialized.current) return;
        initialized.current = true;
        setNewing(true);
        const client = requireSupabase();
        const { data: created, error: createError } = await client.from('portiter_blog_posts').insert({ created_by: user.id }).select('*').single();
        if (createError) throw createError;
        const translations = LOCALES.map((entry) => ({ post_id: created.id, locale: entry, slug: slugFallback(entry), content_json: EMPTY_CONTENT, status: 'draft' }));
        const { error: translationError } = await client.from('portiter_blog_translations').insert(translations);
        if (translationError) {
          await client.from('portiter_blog_posts').update({ trashed_at: new Date().toISOString() }).eq('id', created.id);
          await client.from('portiter_blog_posts').delete().eq('id', created.id);
          throw translationError;
        }
        navigate(`/admin/posts/${created.id}`, { replace: true });
        return;
      }
      const [data, terms] = await Promise.all([fetchAdminPost(postId), fetchAdminTaxonomy()]);
      if (!active) return;
      setPost(data);
      setTaxonomy(terms);
      setSelectedCategories(data.categories.map((item) => item.id));
      setSelectedTags(data.tags.map((item) => item.id));
      setMedia(data.media);
      const first = data.translations.find((item) => item.locale === requestedLocale)
        || data.translations.find((item) => item.locale === 'en') || data.translations[0];
      if (first) {
        setLocale(first.locale);
        setForm({ ...first, content_json: first.content_json || EMPTY_CONTENT, scheduledLocal: dateTimeLocalInJakarta(first.scheduled_at) });
        const { data: history, error: historyError } = await requireSupabase().from('portiter_blog_post_revisions').select('*').eq('translation_id', first.id).order('created_at', { ascending: false }).limit(20);
        if (historyError) throw historyError;
        setRevisions(history || []);
      }
    };
    initialize().catch((loadError) => active && setError(loadError.message)).finally(() => active && setNewing(false));
    return () => { active = false; };
  }, [postId, navigate, user.id, requestedLocale]);

  const syncRelations = async (postUuid) => {
    const client = requireSupabase();
    for (const [table, key, existingItems, selectedIds] of [
      ['portiter_blog_post_categories', 'category_id', post.categories, selectedCategories],
      ['portiter_blog_post_tags', 'tag_id', post.tags, selectedTags],
    ]) {
      const currentIds = existingItems.map((item) => item.id);
      const removed = currentIds.filter((id) => !selectedIds.includes(id));
      const added = selectedIds.filter((id) => !currentIds.includes(id));
      if (removed.length) {
        const { error: removeError } = await client.from(table).delete().eq('post_id', postUuid).in(key, removed);
        if (removeError) throw removeError;
      }
      if (added.length) {
        const { error: addError } = await client.from(table).insert(added.map((id) => ({ post_id: postUuid, [key]: id })));
        if (addError) throw addError;
      }
    }
  };

  const persist = async (mode = 'autosave') => {
    if (!form || !activeTranslation || saving) return false;
    const versionAtStart = editCount.current;
    const client = requireSupabase();
    setSaving(true);
    if (mode !== 'autosave') setError('');
    try {
      const status = mode === 'publish' ? 'published' : mode === 'schedule' ? 'scheduled' : mode === 'draft' ? 'draft' : form.status;
      const slug = makeSlug(form.slug) || makeSlug(form.title) || slugFallback(locale);
      if (mode !== 'autosave' && !form.title.trim()) throw new Error('Tambahkan judul sebelum menyimpan atau menerbitkan.');
      if (mode !== 'autosave' && !slug) throw new Error('Slug URL belum valid.');
      if (mode === 'publish' && !plainTextFromContent(form.content_json).trim()) throw new Error('Isi artikel masih kosong.');
      if (mode === 'schedule' && !form.scheduledLocal) throw new Error('Pilih tanggal dan waktu publikasi.');
      const scheduledAt = status === 'scheduled' && form.scheduledLocal
        ? jakartaLocalToUtc(form.scheduledLocal)
        : (mode === 'schedule' ? jakartaLocalToUtc(form.scheduledLocal) : null);
      if (mode === 'schedule' && new Date(scheduledAt) <= new Date()) throw new Error('Jadwal harus berada di waktu mendatang.');
      const publishedAt = status === 'published'
        ? (form.status === 'published' && form.published_at ? form.published_at : new Date().toISOString())
        : null;
      const snapshot = {
        locale, slug, title: form.title, excerpt: form.excerpt, content_json: form.content_json,
        cover_media_id: form.cover_media_id, status, scheduled_at: scheduledAt, published_at: publishedAt,
        meta_title: form.meta_title, meta_description: form.meta_description,
      };
      if (mode === 'publish' || mode === 'schedule') {
        const { error: revisionError } = await client.from('portiter_blog_post_revisions').insert({ translation_id: activeTranslation.id, snapshot, created_by: user.id });
        if (revisionError) throw revisionError;
      }
      const { data: updatedTranslation, error: updateError } = await client.from('portiter_blog_translations').update({
        slug, title: form.title.trim(), excerpt: form.excerpt.trim(), content_json: form.content_json || EMPTY_CONTENT,
        cover_media_id: form.cover_media_id || null, status, scheduled_at: scheduledAt, published_at: publishedAt,
        meta_title: form.meta_title.trim(), meta_description: form.meta_description.trim(),
      }).eq('id', activeTranslation.id).select('*').single();
      if (updateError) throw updateError;
      const { error: postError } = await client.from('portiter_blog_posts').update({ is_featured: Boolean(post.is_featured) }).eq('id', post.id);
      if (postError) throw postError;
      await syncRelations(post.id);
      if (editCount.current === versionAtStart) {
        setForm({ ...form, ...updatedTranslation, scheduledLocal: dateTimeLocalInJakarta(updatedTranslation.scheduled_at) });
        setDirty(false);
      }
      setPost({
        ...post,
        categories: taxonomy.categories.filter((item) => selectedCategories.includes(item.id)),
        tags: taxonomy.tags.filter((item) => selectedTags.includes(item.id)),
        translations: post.translations.map((item) => item.id === updatedTranslation.id ? updatedTranslation : item),
      });
      setSavedAt(new Date());
      if (mode === 'publish' || (mode === 'draft' && form.status === 'published')) {
        try {
          const deployment = await requestBlogDeploy();
          setError(deployment.deployment === 'triggered'
            ? (mode === 'publish' ? 'Artikel diterbitkan. Build website sudah dipicu; tautan publik aktif setelah deployment selesai.' : 'Publikasi ditarik. Build website sudah dipicu.')
            : 'Perubahan tersimpan, tetapi tidak ada job build. Periksa sinkronisasi di dashboard.');
        } catch (deployError) {
          setError(`Perubahan tersimpan, tetapi build website belum dipicu: ${deployError.message}. Coba Sinkronkan website di dashboard.`);
        }
      }
      if (mode === 'schedule') setError('Jadwal tersimpan. Artikel akan terbit otomatis pada waktu yang dipilih.');
      if (mode === 'draft' && form.status !== 'published') setError('Draft tersimpan.');
      const { data: history } = await client.from('portiter_blog_post_revisions').select('*').eq('translation_id', activeTranslation.id).order('created_at', { ascending: false }).limit(20);
      if (history) setRevisions(history);
      return true;
    } catch (saveError) {
      if (mode === 'autosave') setError(`Autosave gagal: ${saveError.message}`);
      else setError(saveError.message);
      return false;
    } finally { setSaving(false); }
  };

  useEffect(() => { saveRef.current = persist; });
  useEffect(() => {
    if (!dirty || !form || saving) return undefined;
    const timer = window.setTimeout(() => saveRef.current?.('autosave'), 1100);
    return () => window.clearTimeout(timer);
  }, [dirty, form, selectedCategories, selectedTags, post?.is_featured, saving]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warnBeforeUnload = (event) => { event.preventDefault(); event.returnValue = ''; };
    const saveBeforeInternalNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      if (saving) {
        setError('Perubahan sedang disimpan. Tunggu sampai selesai lalu pilih tautan lagi.');
        return;
      }
      saveRef.current?.('autosave').then((saved) => {
        if (saved) navigate(`${destination.pathname}${destination.search}${destination.hash}`);
      });
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    document.addEventListener('click', saveBeforeInternalNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
      document.removeEventListener('click', saveBeforeInternalNavigation, true);
    };
  }, [dirty, saving, navigate]);

  const updateForm = (key, value) => {
    editCount.current += 1;
    setForm((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      if (key === 'title' && current.slug.startsWith('untitled-') && !current.slug_locked_at) next.slug = makeSlug(value) || current.slug;
      return next;
    });
    setDirty(true);
  };

  const changeLocale = async (nextLocale) => {
    if (nextLocale === locale || !post || saving) return;
    if (dirty && !(await persist('autosave'))) return;
    const target = post.translations.find((item) => item.locale === nextLocale);
    if (!target) return;
    setLocale(nextLocale);
    setSearchParams({ locale: nextLocale }, { replace: true });
    setForm({ ...target, content_json: target.content_json || EMPTY_CONTENT, scheduledLocal: dateTimeLocalInJakarta(target.scheduled_at) });
    editCount.current += 1;
    setDirty(false);
    const { data: history } = await requireSupabase().from('portiter_blog_post_revisions').select('*').eq('translation_id', target.id).order('created_at', { ascending: false }).limit(20);
    setRevisions(history || []);
  };

  const uploadImage = async (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) throw new Error('Gunakan JPEG, PNG, WebP, GIF, atau AVIF.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran gambar maksimum 10 MB.');
    const client = requireSupabase();
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    const objectPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await client.storage.from('blog-media').upload(objectPath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = client.storage.from('blog-media').getPublicUrl(objectPath);
    const { data: asset, error: assetError } = await client.from('portiter_blog_media_assets').insert({ object_path: objectPath, public_url: publicUrl, filename: file.name, mime_type: file.type, size_bytes: file.size, created_by: user.id }).select('*').single();
    if (assetError) {
      await client.storage.from('blog-media').remove([objectPath]);
      throw assetError;
    }
    setMedia((current) => [asset, ...current]);
    return asset;
  };

  const restoreRevision = (revision) => {
    if (!window.confirm('Ganti isi editor dengan versi ini? Autosave akan menyimpan perubahan sebagai draft.')) return;
    const snapshot = revision.snapshot;
    setForm((current) => ({ ...current, ...snapshot, slug: current.slug_locked_at ? current.slug : snapshot.slug,
      status: 'draft', scheduled_at: null, scheduledLocal: '', published_at: null }));
    editCount.current += 1;
    setDirty(true);
  };

  const openPreview = async () => {
    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) return;
    previewWindow.opener = null;
    if (dirty && !(await saveRef.current?.('autosave'))) {
      previewWindow.close();
      return;
    }
    previewWindow.location.replace(`/admin/preview/${post.id}/${locale}`);
  };

  if (error && !post) return <div className="admin-loading" role="alert">Gagal membuka editor: {error}</div>;
  if (newing || !form || !post) return <div className="admin-loading">Membuka editor…</div>;
  const plainText = plainTextFromContent(form.content_json);
  const selectedMedia = media.find((item) => item.id === form.cover_media_id);
  const showPublicLink = form.status === 'published' && form.published_at && new Date(form.published_at) <= new Date() && !post.archived_at && !post.trashed_at;
  const currentPath = locale === 'id' ? `/id/blog/${form.slug}` : `/blog/${form.slug}`;

  return (
    <>
      <div className="editor-page-top"><Link to="/admin/posts" className="admin-back-link"><FiArrowLeft/> Semua artikel</Link><div><span className={`editor-save-status ${saving ? 'saving' : dirty ? 'dirty' : ''}`}>{saving ? 'Menyimpan…' : dirty ? 'Perubahan belum tersimpan' : savedAt ? `Tersimpan ${savedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Tersimpan'}</span>{showPublicLink && <a href={currentPath} target="_blank" rel="noopener noreferrer" className="admin-outline-button"><FiEye/> Lihat artikel</a>}<button type="button" className="admin-outline-button" disabled={saving || !form.title} onClick={openPreview}><FiEye/> Preview</button><button type="button" className="admin-primary" disabled={saving} onClick={() => persist(form.status === 'draft' ? 'draft' : 'autosave')}><FiSave/> {form.status === 'draft' ? 'Simpan draft' : 'Simpan perubahan'}</button></div></div>
      {error && <div className={error.startsWith('Autosave gagal') ? 'admin-banner-error' : 'admin-banner-success'} role="status">{error}</div>}
      <div className="editor-locale-tabs">{LOCALES.map((entry) => <button key={entry} type="button" disabled={saving} className={locale === entry ? 'active' : ''} onClick={() => changeLocale(entry)}>{localeLabel(entry)}<span>{post.translations.find((item) => item.locale === entry)?.status || 'draft'}</span></button>)}</div>
      <div className="editor-layout">
        <section className="editor-main-column">
          <label className="editor-title-field"><span>Judul artikel</span><textarea rows={2} maxLength={180} value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder={locale === 'id' ? 'Judul yang jelas dan menarik…' : 'A clear, useful headline…'} /></label>
          <div className="editor-slug-row"><span>URL</span><code>{locale === 'id' ? '/id/blog/' : '/blog/'}{form.slug || 'slug-artikel'}</code>{form.slug_locked_at && <span className="slug-locked">Slug permanen</span>}</div>
          {!form.slug_locked_at && <label className="admin-field">Slug URL<input value={form.slug} onChange={(event) => updateForm('slug', makeSlug(event.target.value))} maxLength={140} /></label>}
          <label className="admin-field editor-excerpt">Ringkasan artikel<textarea rows={3} maxLength={360} value={form.excerpt} onChange={(event) => updateForm('excerpt', event.target.value)} placeholder="Tampil di kartu, hasil pencarian, dan preview berbagi."/><small>{form.excerpt.length}/360 karakter</small></label>
          <BlogEditor value={form.content_json} onChange={(content) => updateForm('content_json', content)} onUploadImage={uploadImage} media={media}/>
          <div className="editor-reading-time">{plainText.trim().split(/\s+/).filter(Boolean).length} kata · estimasi {readTimeMinutes(form.content_json)} menit baca</div>
          <section className="editor-history"><div><span className="admin-eyebrow">VERSIONS</span><h2>Riwayat revisi</h2></div><p>Snapshot dibuat saat artikel dijadwalkan atau diterbitkan.</p>
            {revisions.length === 0 ? <div className="admin-empty-inline">Belum ada revisi.</div> : revisions.map((revision) => <div className="editor-revision" key={revision.id}><span>{new Date(revision.created_at).toLocaleString('id-ID')}<small>{revision.snapshot?.status || 'snapshot'}</small></span><button type="button" onClick={() => restoreRevision(revision)}>Pulihkan versi</button></div>)}
          </section>
        </section>
        <aside className="editor-sidebar">
          <section className="editor-sidebar-card"><div className="admin-panel-heading"><h2>Publikasi</h2><span className={`admin-status-pill ${form.status}`}>{form.status}</span></div>
            <p>{form.status === 'published' ? `Tayang ${form.published_at ? new Date(form.published_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : ''}` : form.status === 'scheduled' ? `Jadwal ${form.scheduled_at ? new Date(form.scheduled_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : ''}` : 'Belum diterbitkan'}</p>
            <button type="button" className="admin-primary full-width" disabled={saving} onClick={() => persist('publish')}>{form.status === 'published' ? 'Simpan dan perbarui' : 'Terbitkan sekarang'}</button>
            <label className="admin-field">Jadwalkan · Asia/Jakarta<input type="datetime-local" value={form.scheduledLocal || ''} onChange={(event) => updateForm('scheduledLocal', event.target.value)}/></label>
            <button type="button" className="admin-outline-button full-width" disabled={saving || !form.scheduledLocal} onClick={() => persist('schedule')}>Jadwalkan artikel</button>
            {form.status !== 'draft' && <button type="button" className="admin-text-button" onClick={() => { if (window.confirm('Tarik artikel dari publik dan ubah statusnya menjadi draft?')) persist('draft'); }}>{form.status === 'scheduled' ? 'Batalkan jadwal' : 'Tarik publikasi dan jadikan draft'}</button>}
            {showPublicLink && <><a className="editor-public-url" href={currentPath} target="_blank" rel="noopener noreferrer">{window.location.origin}{currentPath}</a><small className="editor-public-note">Tautan aktif setelah build Vercel selesai.</small></>}
          </section>
          <section className="editor-sidebar-card"><div className="admin-panel-heading"><h2>Cover image</h2></div>
            {selectedMedia ? <div className="editor-cover-preview"><img src={selectedMedia.public_url} alt={selectedMedia.alt_text || ''}/><button type="button" onClick={() => updateForm('cover_media_id', null)}>Hapus cover</button></div> : <p className="admin-empty-inline">Pilih gambar untuk kartu artikel dan social preview.</p>}
            <select value={form.cover_media_id || ''} onChange={(event) => updateForm('cover_media_id', event.target.value || null)} aria-label="Pilih cover image"><option value="">Pilih dari media library</option>{media.map((item) => <option key={item.id} value={item.id}>{item.filename}</option>)}</select>
            <label className="admin-field">Alt text cover<input value={selectedMedia?.alt_text || ''} onChange={async (event) => {
              if (!selectedMedia) return;
              const next = event.target.value;
              const { error: updateError } = await requireSupabase().from('portiter_blog_media_assets').update({ alt_text: next }).eq('id', selectedMedia.id);
              if (!updateError) setMedia((items) => items.map((item) => item.id === selectedMedia.id ? { ...item, alt_text: next } : item));
            }}/></label>
          </section>
          <section className="editor-sidebar-card"><div className="admin-panel-heading"><h2>Organisasi</h2></div>
            <label className="admin-field">Kategori<select multiple value={selectedCategories} onChange={(event) => { editCount.current += 1; setSelectedCategories([...event.target.selectedOptions].map((item) => item.value)); setDirty(true); }} size={Math.min(5, Math.max(2, taxonomy.categories.length))}>{taxonomy.categories.map((item) => <option key={item.id} value={item.id}>{locale === 'id' ? item.name_id : item.name_en}</option>)}</select></label>
            <label className="admin-field">Tag<select multiple value={selectedTags} onChange={(event) => { editCount.current += 1; setSelectedTags([...event.target.selectedOptions].map((item) => item.value)); setDirty(true); }} size={Math.min(5, Math.max(2, taxonomy.tags.length))}>{taxonomy.tags.map((item) => <option key={item.id} value={item.id}>{locale === 'id' ? item.name_id : item.name_en}</option>)}</select></label>
            <label className="admin-check"><input type="checkbox" checked={post.is_featured} onChange={(event) => { editCount.current += 1; setPost((current) => ({ ...current, is_featured: event.target.checked })); setDirty(true); }}/> Featured article</label>
          </section>
          <section className="editor-sidebar-card"><button type="button" className="admin-text-button" onClick={() => setShowSeo((visible) => !visible)}>{showSeo ? '−' : '+'} Search & social metadata</button>
            {showSeo && <><label className="admin-field">SEO title<input maxLength={180} value={form.meta_title} onChange={(event) => updateForm('meta_title', event.target.value)}/></label><label className="admin-field">Meta description<textarea maxLength={320} rows={3} value={form.meta_description} onChange={(event) => updateForm('meta_description', event.target.value)}/><small>{form.meta_description.length}/320 karakter</small></label><p className="seo-preview"><b>{form.meta_title || form.title || 'Judul artikel'}</b><small>akhmdnzr.fun{currentPath}</small><span>{form.meta_description || form.excerpt || 'Deskripsi hasil pencarian akan tampil di sini.'}</span></p></>}
          </section>
        </aside>
      </div>
    </>
  );
}
