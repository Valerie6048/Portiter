import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAdminPost } from '../blog/data';
import { plainTextFromContent, readTimeMinutes, renderContentHtml } from '../blog/content';

export default function AdminPreview() {
  const { postId, locale = 'en' } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { fetchAdminPost(postId).then(setPost).catch((loadError) => setError(loadError.message)); }, [postId]);
  const translation = post?.translations.find((item) => item.locale === locale);
  if (error) return <div className="admin-loading" role="alert">{error}</div>;
  if (!translation) return <div className="admin-loading">Menyiapkan preview…</div>;
  return <main className="admin-preview-shell"><div className="preview-banner"><span>PREVIEW · hanya terlihat oleh admin</span><Link to={`/admin/posts/${postId}`}>← Kembali ke editor</Link></div><article className="blog-article-container preview-article"><header className="blog-article-header"><div className="blog-article-kicker"><span className="admin-status-pill">{translation.status}</span></div><h1>{translation.title || 'Judul artikel'}</h1><p className="blog-article-excerpt">{translation.excerpt || plainTextFromContent(translation.content_json).slice(0, 180)}</p><div className="blog-article-meta"><span>Preview</span><span>·</span><span>{readTimeMinutes(translation.content_json)} min baca</span></div></header>{translation.cover?.public_url && <figure className="blog-article-cover"><img src={translation.cover.public_url} alt={translation.cover.alt_text || ''}/></figure>}<div className="blog-article-body" dangerouslySetInnerHTML={{ __html: renderContentHtml(translation.content_json) }}/></article></main>;
}
