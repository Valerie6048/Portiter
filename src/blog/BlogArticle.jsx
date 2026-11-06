import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import BlogCard from './BlogCard';
import { fetchPublicPosts } from './data';
import { isSupabaseConfigured } from './supabase';
import { readTimeMinutes, renderContentHtml } from './content';
import { HOME_SEO, setPageSeo } from '../utils/seo';

function setAlternateLinks(translations) {
  document.querySelectorAll('link[data-blog-hreflang]').forEach((item) => item.remove());
  const entries = translations.filter((item) => ['en', 'id'].includes(item.locale));
  for (const item of entries) {
    const path = item.locale === 'id' ? `/id/blog/${item.slug}` : `/blog/${item.slug}`;
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = item.locale === 'id' ? 'id' : 'en';
    link.href = `https://www.akhmdnzr.fun${path}`;
    link.dataset.blogHreflang = 'true';
    document.head.appendChild(link);
  }
  if (entries.some((item) => item.locale === 'en')) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = 'x-default';
    link.href = `https://www.akhmdnzr.fun/blog/${entries.find((item) => item.locale === 'en').slug}`;
    link.dataset.blogHreflang = 'true';
    document.head.appendChild(link);
  }
}

export default function BlogArticle({ locale = 'en' }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const routeKey = `${locale}:${slug}`;
  const loading = isSupabaseConfigured && loadedKey !== routeKey;
  const translation = post?.translations?.find((item) => item.locale === locale);
  const alternate = post?.translations?.find((item) => item.locale !== locale);
  const related = useMemo(() => post ? allPosts
    .filter((item) => item.id !== post.id && item.categories.some((category) => post.categories.some((current) => current.id === category.id)))
    .slice(0, 3) : [], [allPosts, post]);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      return () => { active = false; };
    }
    Promise.all([fetchPublicPosts('en'), fetchPublicPosts('id')]).then(([english, indonesian]) => {
      if (!active) return;
      const combined = new Map();
      for (const entry of [...english, ...indonesian]) {
        const existing = combined.get(entry.id);
        combined.set(entry.id, existing ? { ...existing, translations: [...existing.translations, ...entry.translations] } : entry);
      }
      const all = [...combined.values()];
      const match = all.find((item) => item.translations.some((entry) => entry.slug === slug && entry.locale === locale));
      setAllPosts(all);
      setPost(match || null);
      setError('');
      if (match) {
        const item = match.translations.find((entry) => entry.slug === slug && entry.locale === locale);
        setPageSeo({
          title: `${item.meta_title || item.title} — Akhmad Nizar Z.`,
          description: item.meta_description || item.excerpt,
          path: locale === 'id' ? `/id/blog/${item.slug}` : `/blog/${item.slug}`,
          image: item.cover?.public_url || '/og_image.jpg',
          type: 'article',
        });
        setAlternateLinks(match.translations);
      }
    }).catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoadedKey(routeKey));
    return () => {
      active = false;
      document.querySelectorAll('link[data-blog-hreflang]').forEach((item) => item.remove());
      setPageSeo(HOME_SEO);
    };
  }, [locale, slug, routeKey]);

  if (loading) return <main className="blog-site"><BlogHeader locale={locale} /><div className="blog-state">{locale === 'id' ? 'Memuat artikel…' : 'Loading article…'}</div></main>;
  if (error) return <main className="blog-site"><BlogHeader locale={locale} /><div className="blog-state blog-error" role="alert">{locale === 'id' ? 'Artikel belum dapat dimuat. Coba lagi nanti.' : 'Article could not be loaded. Please try again later.'}</div></main>;
  if (!post || !translation) return (
    <main className="blog-site"><BlogHeader locale={locale} />
      <section className="blog-not-found"><span>404</span><h1>{locale === 'id' ? 'Artikel tidak ditemukan' : 'Article not found'}</h1><p>{locale === 'id' ? 'Tautan mungkin sudah berubah atau artikel tidak tersedia.' : 'The link may have changed or the article is unavailable.'}</p><Link className="blog-back-link" to={locale === 'id' ? '/id/blog' : '/blog'}>← {locale === 'id' ? 'Kembali ke blog' : 'Back to blog'}</Link></section>
    </main>
  );

  const body = renderContentHtml(translation.content_json);
  return (
    <div className="blog-site">
      <BlogHeader locale={locale} alternatePath={alternate ? (alternate.locale === 'id' ? `/id/blog/${alternate.slug}` : `/blog/${alternate.slug}`) : undefined} />
      <main className="blog-article-container">
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb"><Link to={locale === 'id' ? '/id/blog' : '/blog'}>Blog</Link><span>/</span><span>{translation.title}</span></nav>
        <article>
          <header className="blog-article-header">
            <div className="blog-article-kicker">{post.categories.map((item) => <span className="blog-category-pill" key={item.id}>{locale === 'id' ? item.name_id : item.name_en}</span>)}</div>
            <h1>{translation.title}</h1>
            <p className="blog-article-excerpt">{translation.excerpt}</p>
            <div className="blog-article-meta"><span>{new Date(translation.published_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span><span>·</span><span>{readTimeMinutes(translation.content_json)} min {locale === 'id' ? 'baca' : 'read'}</span>{alternate && <><span>·</span><button type="button" onClick={() => navigate(alternate.locale === 'id' ? `/id/blog/${alternate.slug}` : `/blog/${alternate.slug}`)}>{alternate.locale === 'id' ? 'Baca dalam Bahasa Indonesia' : 'Read in English'}</button></>}</div>
          </header>
          {translation.cover?.public_url && <figure className="blog-article-cover"><img src={translation.cover.public_url} alt={translation.cover.alt_text || ''} />{translation.cover.alt_text && <figcaption>{translation.cover.alt_text}</figcaption>}</figure>}
          <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: body }} />
          {post.tags.length > 0 && <div className="blog-article-tags">{post.tags.map((tag) => <span key={tag.id}>#{locale === 'id' ? tag.name_id : tag.name_en}</span>)}</div>}
          <footer className="blog-article-footer"><Link to={locale === 'id' ? '/id/blog' : '/blog'}>← {locale === 'id' ? 'Semua tulisan' : 'All articles'}</Link></footer>
        </article>
        {related.length > 0 && <section className="blog-related"><h2>{locale === 'id' ? 'Artikel terkait' : 'Related articles'}</h2><div className="blog-grid">{related.map((item) => <BlogCard key={item.id} post={item} locale={locale} />)}</div></section>}
      </main>
    </div>
  );
}
