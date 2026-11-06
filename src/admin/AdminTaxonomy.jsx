import { useEffect, useState } from 'react';
import { fetchAdminTaxonomy } from '../blog/data';
import { makeSlug } from '../blog/content';
import { requireSupabase } from '../blog/supabase';

function TermForm({ kind, onSaved }) {
  const [nameEn, setNameEn] = useState('');
  const [nameId, setNameId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const table = kind === 'category' ? 'portiter_blog_categories' : 'portiter_blog_tags';
    const { error: insertError } = await requireSupabase().from(table).insert({ name_en: nameEn.trim(), name_id: nameId.trim(), slug_en: makeSlug(nameEn), slug_id: makeSlug(nameId) });
    if (insertError) setError(insertError.message);
    else { setNameEn(''); setNameId(''); onSaved(); }
    setBusy(false);
  };
  return <form className="taxonomy-create-form" onSubmit={submit}><input required value={nameEn} onChange={(event) => setNameEn(event.target.value)} placeholder="Name in English"/><input required value={nameId} onChange={(event) => setNameId(event.target.value)} placeholder="Nama Bahasa Indonesia"/><button className="admin-primary" disabled={busy}>{busy ? 'Menyimpan…' : `Tambah ${kind === 'category' ? 'kategori' : 'tag'}`}</button>{error && <span className="admin-error">{error}</span>}</form>;
}

export default function AdminTaxonomy() {
  const [terms, setTerms] = useState({ categories: [], tags: [] });
  const [error, setError] = useState('');
  const refresh = () => fetchAdminTaxonomy().then(setTerms).catch((loadError) => setError(loadError.message));
  useEffect(() => { refresh(); }, []);
  const remove = async (table, id, label) => {
    if (!window.confirm(`Hapus ${label}? Artikel yang memakai istilah ini akan tetap tersimpan.`)) return;
    const { error: deleteError } = await requireSupabase().from(table).delete().eq('id', id);
    if (deleteError) setError(deleteError.message);
    else refresh();
  };
  const edit = async (table, term) => {
    const nameEn = window.prompt('Nama dalam Bahasa Inggris', term.name_en);
    if (nameEn === null) return;
    const nameId = window.prompt('Nama dalam Bahasa Indonesia', term.name_id);
    if (nameId === null) return;
    if (!nameEn.trim() || !nameId.trim()) { setError('Nama kategori atau tag tidak boleh kosong.'); return; }
    const { error: updateError } = await requireSupabase().from(table).update({
      name_en: nameEn.trim(), name_id: nameId.trim(), slug_en: makeSlug(nameEn), slug_id: makeSlug(nameId),
    }).eq('id', term.id);
    if (updateError) setError(updateError.message);
    else refresh();
  };
  return <>
    <div className="admin-page-title"><div><span className="admin-eyebrow">TAXONOMY</span><h1>Kategori & tag</h1><p>Kelola pengelompokan artikel untuk kedua bahasa.</p></div></div>
    {error && <div className="admin-banner-error" role="alert">{error}</div>}
    <div className="taxonomy-grid">{[['categories', 'Kategori', 'portiter_blog_categories', 'Dipakai untuk pengelompokan utama artikel.'], ['tags', 'Tags', 'portiter_blog_tags', 'Topik spesifik untuk pencarian dan navigasi.']].map(([key, title, table, description]) => <section className="admin-panel taxonomy-panel" key={key}><div className="admin-panel-heading"><div><span className="admin-eyebrow">{key.toUpperCase()}</span><h2>{title}</h2></div><span className="admin-count-pill">{terms[key].length}</span></div><p>{description}</p><div className="taxonomy-terms">{terms[key].map((term) => <div className="taxonomy-term" key={term.id}><span><b>{term.name_en}</b><small>{term.name_id}</small></span><button type="button" aria-label={`Edit ${term.name_en}`} onClick={() => edit(table, term)}>Edit</button><button type="button" aria-label={`Hapus ${term.name_en}`} onClick={() => remove(table, term.id, term.name_en)}>×</button></div>)}</div><TermForm kind={key === 'categories' ? 'category' : 'tag'} onSaved={refresh}/></section>)}</div>
  </>;
}
