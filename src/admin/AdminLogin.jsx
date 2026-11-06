import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';
import { isSupabaseConfigured } from '../blog/supabase';

export default function AdminLogin() {
  const { user, isAdmin, loading, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try { await signIn(email, password); navigate('/admin'); }
    catch (signInError) { setError(signInError.message || 'Login gagal. Periksa email dan password.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submit}>
        <Link className="admin-back-link" to="/">← Kembali ke Portiter</Link>
        <span className="admin-eyebrow">Portiter · Blog CMS</span>
        <h1>Masuk ke admin</h1>
        <p>Kelola artikel, terjemahan, dan media dari satu tempat.</p>
        {!isSupabaseConfigured && <div className="admin-notice" role="status">CMS memerlukan konfigurasi Supabase. Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada environment lokal.</div>}
        <label className="admin-field">Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="admin-field">Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary" disabled={busy || !isSupabaseConfigured}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
        <small>Pendaftaran publik dinonaktifkan. Gunakan akun admin yang dibuat di Supabase.</small>
      </form>
    </main>
  );
}
