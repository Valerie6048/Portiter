import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicPosts } from './data';
import { isSupabaseConfigured } from './supabase';
import BlogCard from './BlogCard';

export default function HomeBlogHighlights() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    fetchPublicPosts(language).then((items) => active && setPosts(items.slice(0, 3))).catch(() => {});
    return () => { active = false; };
  }, [language]);
  if (!isSupabaseConfigured) return null;
  const id = language === 'id';
  return (
    <section className="home-blog-section" id="blog">
      <div className="home-blog-heading"><div><span className="blog-eyebrow">{id ? 'DARI MEJA KERJA' : 'FROM THE DESK'}</span><h2>{id ? 'Tulisan terbaru' : 'Latest writing'}</h2></div><Link to={id ? '/id/blog' : '/blog'}>{id ? 'Lihat semua tulisan ↗' : 'Explore all writing ↗'}</Link></div>
      {posts.length > 0 && <div className="blog-grid">{posts.map((post) => <BlogCard key={post.id} post={post} locale={language} />)}</div>}
      {posts.length === 0 && <p className="home-blog-empty">{id ? 'Tulisan yang diterbitkan akan muncul di sini.' : 'Published articles will appear here.'}</p>}
    </section>
  );
}
