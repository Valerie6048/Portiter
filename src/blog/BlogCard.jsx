import { Link } from 'react-router-dom';
import { readTimeMinutes, plainTextFromContent } from './content';

export default function BlogCard({ post, locale = 'en', featured = false }) {
  const translation = post.translations?.find((item) => item.locale === locale) || post.translations?.[0];
  if (!translation) return null;
  const href = locale === 'id' ? `/id/blog/${translation.slug}` : `/blog/${translation.slug}`;
  const categories = (post.categories || []).map((category) => locale === 'id' ? category.name_id : category.name_en);
  const fallback = (translation.excerpt || plainTextFromContent(translation.content_json)).slice(0, 150);
  return (
    <article className={`blog-card ${featured ? 'is-featured' : ''}`}>
      {translation.cover?.public_url ? (
        <Link className="blog-card-cover" to={href} tabIndex={-1} aria-hidden="true">
          <img src={translation.cover.public_url} alt={translation.cover.alt_text || ''} loading="lazy" />
        </Link>
      ) : <div className="blog-card-cover blog-cover-placeholder" aria-hidden="true"><span>Writing / Notes</span></div>}
      <div className="blog-card-content">
        <div className="blog-card-meta">
          {categories.slice(0, 2).map((name) => <span className="blog-category-pill" key={name}>{name}</span>)}
          <span>{new Date(translation.published_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span>·</span><span>{readTimeMinutes(translation.content_json)} min</span>
        </div>
        <h2><Link to={href}>{translation.title}</Link></h2>
        <p>{fallback}</p>
        <Link className="blog-read-link" to={href}>{locale === 'id' ? 'Baca artikel' : 'Read article'} <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
