import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminPosts } from '../blog/data';
import { requireSupabase } from '../blog/supabase';
import { exportBlogBackup, importBlogBackup } from './backup';
import { requestBlogDeploy } from './blog-deploy';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyJob, setBusyJob] = useState('');
  const [backupBusy, setBackupBusy] = useState(false);
  const backupInput = useRef(null);
  const refresh = () => {
    Promise.all([
      fetchAdminPosts(),
      requireSupabase().from('portiter_blog_deploy_jobs').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([items, jobResult]) => {
      if (jobResult.error) throw jobResult.error;
      setPosts(items);
      setJobs(jobResult.data || []);
    }).catch((loadError) => setError(loadError.message));
  };
  useEffect(refresh, []);

  const counts = {
    published: posts.filter((post) => !post.archived_at && !post.trashed_at && post.translations.some((item) => item.status === 'published' && new Date(item.published_at) <= new Date())).length,
    draft: posts.filter((post) => !post.archived_at && !post.trashed_at && post.translations.some((item) => item.status === 'draft')).length,
    scheduled: posts.filter((post) => !post.archived_at && !post.trashed_at && post.translations.some((item) => item.status === 'scheduled')).length,
    archived: posts.filter((post) => post.archived_at).length,
    trash: posts.filter((post) => post.trashed_at).length,
  };

  const retryJob = async (id) => {
    setBusyJob(id);
    const { error: updateError } = await requireSupabase().from('portiter_blog_deploy_jobs').update({ status: 'queued', error_message: null, processed_at: null, claimed_at: null }).eq('id', id);
    if (updateError) setError(updateError.message);
    else {
      try { await requestBlogDeploy(); }
      catch (deployError) { setError(deployError.message); }
    }
    setBusyJob('');
    refresh();
  };

  const syncWebsite = async () => {
    setBusyJob('sync');
    setError('');
    setNotice('');
    try {
      const result = await requestBlogDeploy();
      setNotice(result.deployment === 'triggered' ? 'Build website dipicu. Tunggu deployment Vercel selesai sebelum membuka tautan publik.' : 'Tidak ada perubahan publik yang menunggu build.');
    } catch (deployError) { setError(deployError.message); }
    finally { setBusyJob(''); refresh(); }
  };

  const exportBackup = async () => {
    setBackupBusy(true);
    setError('');
    try {
      const backup = await exportBlogBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `portiter-blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (backupError) { setError(backupError.message); }
    finally { setBackupBusy(false); }
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !window.confirm('Pulihkan data dari backup? Data dengan ID yang sama akan diperbarui, data lainnya tetap ada.')) return;
    setBackupBusy(true);
    setError('');
    try {
      const count = await importBlogBackup(file);
      setError(`Pemulihan selesai: ${count} baris diproses. Jika gambar memakai bucket baru, pulihkan Storage secara terpisah.`);
      refresh();
    } catch (backupError) { setError(backupError.message); }
    finally { setBackupBusy(false); }
  };

  return (
    <>
      <section className="admin-welcome"><div><span className="admin-eyebrow">EDITORIAL WORKSPACE</span><h1>Selamat datang kembali.</h1><p>Semua yang kamu butuhkan untuk menyusun, menerbitkan, dan mengelola tulisan.</p></div><div className="admin-welcome-actions"><button className="admin-outline-button" type="button" disabled={backupBusy} onClick={exportBackup}>Ekspor backup</button><button className="admin-outline-button" type="button" disabled={backupBusy} onClick={() => backupInput.current?.click()}>Pulihkan backup</button><input ref={backupInput} type="file" accept="application/json,.json" hidden onChange={importBackup}/><Link className="admin-primary admin-new-post" to="/admin/posts/new">＋ Buat artikel</Link></div></section>
      {error && <div className="admin-banner-error" role="alert">{error}</div>}
      {notice && <div className="admin-banner-success" role="status">{notice}</div>}
      <section className="admin-stat-grid" aria-label="Ringkasan artikel">
        {[['Published', counts.published, '↗', 'teal'], ['Draft', counts.draft, '◷', 'gold'], ['Scheduled', counts.scheduled, '◷', 'blue'], ['Archived', counts.archived, '▤', 'violet'], ['Trash', counts.trash, '⌫', 'red']].map(([label, count, icon, color]) => <Link key={label} to={`/admin/posts?status=${String(label).toLowerCase()}`} className="admin-stat-card"><span className={`admin-stat-icon ${color}`}>{icon}</span><span className="admin-stat-label">{label}</span><strong>{count}</strong><span className="admin-stat-foot">{label === 'Trash' ? 'Siap dipulihkan' : 'Versi EN & ID'}</span></Link>)}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">CONTENT</span><h2>Artikel terbaru</h2></div><Link to="/admin/posts">Semua artikel ↗</Link></div>
          {posts.slice(0, 5).map((post) => <Link className="admin-recent-post" key={post.id} to={`/admin/posts/${post.id}`}><span className="admin-recent-title">{post.translations.find((item) => item.locale === 'en')?.title || post.translations.find((item) => item.locale === 'id')?.title || 'Untitled article'}<small>{post.translations.map((item) => item.locale.toUpperCase()).join(' · ')}</small></span><span className={`admin-status-dot ${post.trashed_at ? 'red' : post.archived_at ? 'muted' : post.translations.some((item) => item.status === 'published') ? 'green' : 'gold'}`}>{post.trashed_at ? 'Trash' : post.archived_at ? 'Archived' : post.translations.some((item) => item.status === 'published') ? 'Published' : 'Draft'}</span></Link>)}
          {posts.length === 0 && <p className="admin-empty-inline">Belum ada artikel. Buat draft pertamamu.</p>}
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">SITE SYNC</span><h2>Build website</h2></div><button type="button" className="admin-outline-button" disabled={Boolean(busyJob)} onClick={syncWebsite}>{busyJob === 'sync' ? 'Memicu build…' : 'Sinkronkan website'}</button></div>
          <p className="admin-sync-note">Artikel yang diterbitkan memicu build Vercel. Tautan publik tersedia setelah build selesai; gunakan tombol sinkronisasi jika job masih queued.</p>
          {jobs.map((job) => <div className="admin-job-row" key={job.id}><span><b>{job.status}</b><small>{new Date(job.created_at).toLocaleString('id-ID')}</small>{job.error_message && <small className="admin-error">{job.error_message}</small>}</span>{job.status === 'failed' && <button type="button" disabled={busyJob === job.id} onClick={() => retryJob(job.id)}>{busyJob === job.id ? '…' : 'Coba lagi'}</button>}</div>)}
          {jobs.length === 0 && <p className="admin-empty-inline">Belum ada perubahan publik.</p>}
          <a className="admin-deploy-help" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Status build lengkap tersedia di Vercel ↗</a>
        </section>
      </div>
    </>
  );
}
