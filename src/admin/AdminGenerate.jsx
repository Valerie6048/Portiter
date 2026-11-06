import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requireSupabase } from '../blog/supabase';
import { useAdminAuth } from './AuthContext';
import { createGeneratedDraft } from './generated-draft';

export default function AdminGenerate() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [topic, setTopic] = useState('');
  const [locale, setLocale] = useState('id');
  const [article, setArticle] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const generationBusy = useRef(false);
  const saveBusy = useRef(false);

  const saveDraft = async (draft) => {
    if (saveBusy.current) return;
    saveBusy.current = true;
    setSaving(true);
    setError('');
    try {
      const postId = await createGeneratedDraft(requireSupabase(), user.id, draft);
      navigate(`/admin/posts/${postId}?locale=${draft.locale}`, { replace: true });
    } catch (saveError) {
      setError(`Artikel sudah dibuat, tetapi draft gagal disimpan: ${saveError.message}`);
    } finally { saveBusy.current = false; setSaving(false); }
  };

  const generate = async (event) => {
    event.preventDefault();
    if (generationBusy.current || saveBusy.current || article) return;
    generationBusy.current = true;
    setGenerating(true);
    setError('');
    try {
      const client = requireSupabase();
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error('Sesi admin berakhir. Silakan login lagi.');
      const response = await fetch('/api/blog-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ topic: topic.trim(), locale }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `Generator gagal (HTTP ${response.status}).`);
      if (!data?.article?.content_json || data.article.locale !== locale) throw new Error('Respons generator tidak lengkap.');
      setArticle(data.article);
      await saveDraft(data.article);
    } catch (generationError) { setError(generationError.message); }
    finally { generationBusy.current = false; setGenerating(false); }
  };

  return <>
    <div className="admin-page-title"><div><span className="admin-eyebrow">CONTENT STUDIO</span><h1>Generate artikel</h1><p>Masukkan topik. Tavily menyiapkan sumber dan Gemini menulis draft untuk direview.</p></div><Link className="admin-outline-button" to="/admin/posts">← Semua artikel</Link></div>
    {error && <div className="admin-banner-error" role="alert">{error}</div>}
    <form className="admin-panel generator-form" onSubmit={generate}>
      <label className="admin-field">Topik artikel<textarea rows={4} minLength={8} maxLength={300} required value={topic} disabled={generating || saving || Boolean(article)} onChange={(event) => setTopic(event.target.value)} placeholder="Contoh: Cara mengevaluasi chatbot RAG untuk layanan pelanggan"/><small>{topic.length}/300 karakter</small></label>
      <label className="admin-field">Bahasa<select value={locale} disabled={generating || saving || Boolean(article)} onChange={(event) => setLocale(event.target.value)}><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></label>
      <p>Target 800–1.200 kata. Ringkasan, SEO, kategori, tag, dan tautan sumber disiapkan otomatis. Cover dapat dipilih saat review.</p>
      {!article && <button type="submit" className="admin-primary" disabled={generating || saving || topic.trim().length < 8}>{generating ? 'Meneliti dan menulis artikel…' : 'Buat artikel'}</button>}
      {article && <div className="generator-result" role="status"><strong>Artikel berhasil dibuat: {article.title}</strong><span>{article.sources?.length || 0} sumber digunakan. {saving ? 'Menyimpan draft…' : 'Hasil tetap tersedia di halaman ini jika penyimpanan gagal.'}</span><div className="generator-actions"><button type="button" className="admin-primary" disabled={saving} onClick={() => saveDraft(article)}>{saving ? 'Menyimpan…' : 'Coba simpan draft'}</button><button type="button" className="admin-outline-button" disabled={saving} onClick={() => { if (window.confirm('Buang hasil ini dan mulai lagi?')) { setArticle(null); setError(''); } }}>Mulai lagi</button></div></div>}
    </form>
  </>;
}
