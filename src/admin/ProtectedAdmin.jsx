import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';

export default function ProtectedAdmin() {
  const { user, isAdmin, loading, error } = useAdminAuth();
  if (loading) return <div className="admin-loading">Memuat sesi admin…</div>;
  if (error) return <div className="admin-loading" role="alert">{error}</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div className="admin-loading"><p>Akun ini tidak terdaftar sebagai admin blog.</p><a href="/">Kembali ke Portiter</a></div>;
  return <Outlet />;
}
