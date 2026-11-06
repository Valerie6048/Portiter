import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import { AdminAuthProvider } from './admin/AuthContext';
import AdminLogin from './admin/AdminLogin';
import ProtectedAdmin from './admin/ProtectedAdmin';
import AdminLayout from './admin/AdminLayout';

const BlogIndex = lazy(() => import('./blog/BlogIndex'));
const BlogArticle = lazy(() => import('./blog/BlogArticle'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminPosts = lazy(() => import('./admin/AdminPosts'));
const AdminPostEditor = lazy(() => import('./admin/AdminPostEditor'));
const AdminGenerate = lazy(() => import('./admin/AdminGenerate'));
const AdminMedia = lazy(() => import('./admin/AdminMedia'));
const AdminTaxonomy = lazy(() => import('./admin/AdminTaxonomy'));
const AdminPreview = lazy(() => import('./admin/AdminPreview'));

function PublicFooter() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/blog') || pathname.startsWith('/id/blog')) return null;
  return <Footer />;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="page-loader" aria-label="Memuat halaman" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/blog" element={<BlogIndex locale="en" />} />
            <Route path="/blog/:slug" element={<BlogArticle locale="en" />} />
            <Route path="/id/blog" element={<BlogIndex locale="id" />} />
            <Route path="/id/blog/:slug" element={<BlogArticle locale="id" />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="posts/generate" element={<AdminGenerate />} />
                <Route path="posts/:postId" element={<AdminPostEditor />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="taxonomy" element={<AdminTaxonomy />} />
                <Route path="preview/:postId/:locale" element={<AdminPreview />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <PublicFooter />
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
