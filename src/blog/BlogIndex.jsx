import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import BlogCard from './BlogCard';
import { fetchPublicPosts } from './data';
import { isSupabaseConfigured } from './supabase';
import { setPageSeo } from '../utils/seo';

const PAGE_SIZE = 9;

export default function BlogIndex({ locale = 'en' }) {
  const id = locale === 'id';
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [loadedLocale, setLoadedLocale] = useState('');
  const loading = isSupabaseConfigured && loadedLocale !== locale;
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPageSeo({
      title: id ? 'Blog — Akhmad Nizar Z.' : 'Blog — Akhmad Nizar Z.',
      description: id ? 'Catatan tentang AI, machine learning, dan membangun sistem data.' : 'Notes on AI, machine learning, and building data systems.',
      path: id ? '/id/blog' : '/blog',
    });
    if (!isSupabaseConfigured) {
      return () => { active = false; };
    }
    fetchPublicPosts(locale).then((items) => {
      if (active) { setPosts(items); setError(''); }
    })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoadedLocale(locale));
    return () => { active = false; };
  }, [locale, id]);

  const categories = useMemo(() => {
    const map = new Map();
    posts.flatMap((post) => post.categories || []).forEach((item) => map.set(item.id, item));
    return [...map.values()];
  }, [posts]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return posts.filter((post) => {
      const translation = post.translations.find((item) => item.locale === locale);
      if (!translation) return false;
      const matchesCategory = category === 'all' || post.categories.some((item) => item.id === category);
      const searchable = `${translation.title} ${translation.excerpt} ${(post.tags || []).map((tag) => locale === 'id' ? tag.name_id : tag.name_en).join(' ')}`.toLocaleLowerCase(locale);
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [posts, query, category, locale]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="blog-site">
      <BlogHeader locale={locale} />
      <main className="blog-container blog-index">
        <div className="blog-page-intro">
          <span className="blog-eyebrow">{id ? 'IDEAS, CATATAN, DAN EKSPERIMEN' : 'IDEAS, NOTES, AND EXPERIMENTS'}</span>
          <h1>{id ? 'Tulisan & Catatan' : 'Writing & Notes'}</h1>
          <p>{id ? 'Catatan praktis seputar AI, machine learning, dan sistem data yang dibangun untuk dunia nyata.' : 'Practical notes on AI, machine learning, and data systems built for the real world.'}</p>
        </div>

        <div className="blog-controls">
          <label className="blog-search"><span className="sr-only">{id ? 'Cari artikel' : 'Search articles'}</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={id ? 'Cari artikel…' : 'Search articles…'} /></label>
          <label className="blog-category-select"><span className="sr-only">{id ? 'Filter kategori' : 'Filter category'}</span>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
              <option value="all">{id ? 'Semua kategori' : 'All categories'}</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{id ? item.name_id : item.name_en}</option>)}
            </select>
          </label>
        </div>

        {loading && <p className="blog-state">{id ? 'Memuat tulisan…' : 'Loading articles…'}</p>}
        {error && <div className="blog-state blog-error" role="alert">{id ? 'Tulisan belum dapat dimuat.' : 'Articles could not be loaded.'}</div>}
        {!loading && !error && visible.length > 0 && (
          <div className="blog-grid">{visible.map((post, index) => <BlogCard key={post.id} post={post} locale={locale} featured={page === 1 && index === 0 && Boolean(post.is_featured)} />)}</div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="blog-empty"><div className="blog-empty-mark">✳</div><h2>{isSupabaseConfigured ? (id ? 'Belum ada tulisan di sini' : 'No stories here yet') : 'Blog CMS belum dikonfigurasi'}</h2><p>{isSupabaseConfigured ? (id ? 'Coba ubah pencarian atau filter, atau kembali lagi nanti.' : 'Try another search or filter, or check back later.') : <><span>Tambahkan konfigurasi Supabase untuk mulai menerbitkan artikel. Admin tersedia di </span><Link to="/admin/login">/admin/login</Link>.</>}</p></div>
        )}
        {pages > 1 && <nav className="blog-pagination" aria-label={id ? 'Halaman artikel' : 'Article pages'}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{id ? 'Sebelumnya' : 'Previous'}</button>
          <span>{page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>{id ? 'Berikutnya' : 'Next'}</button>
        </nav>}
      </main>
    </div>
  );
}
