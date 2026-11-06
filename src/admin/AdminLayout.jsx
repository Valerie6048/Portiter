import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';

export default function AdminLayout() {
  const { signOut, user } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.pathname.includes('/posts/') ? 'Editor artikel'
    : location.pathname.includes('/media') ? 'Media library'
      : location.pathname.includes('/taxonomy') ? 'Kategori & tag' : 'Dashboard';
  const logout = async () => { await signOut(); navigate('/admin/login'); };
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="admin-brand"><span className="admin-brand-mark">P</span><span>PORTITER<small>STUDIO</small></span></NavLink>
        <span className="admin-nav-caption">WORKSPACE</span>
        <nav className="admin-nav" aria-label="Navigasi admin">
          <NavLink end to="/admin">⌂ <span>Overview</span></NavLink>
          <NavLink to="/admin/posts">▤ <span>Articles</span></NavLink>
          <NavLink to="/admin/media">▧ <span>Media library</span></NavLink>
          <NavLink to="/admin/taxonomy">◇ <span>Categories & tags</span></NavLink>
          <NavLink to="/blog" target="_blank">↗ <span>View blog</span></NavLink>
        </nav>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">{user?.email?.slice(0, 1).toUpperCase() || 'A'}</span><span className="admin-user-email">{user?.email || 'Blog admin'}</span><button type="button" onClick={logout} aria-label="Keluar">⇥</button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span>Portiter Blog</span><b>/</b><strong>{title}</strong></div><button type="button" className="admin-view-site" onClick={() => window.open('/blog', '_blank', 'noopener,noreferrer')}>Lihat blog ↗</button></header>
        <div className="admin-page"><Outlet /></div>
      </main>
    </div>
  );
}
