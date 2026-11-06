import { Link } from 'react-router-dom';
import mainLogo from '../assets/main_logo.png';

export default function BlogHeader({ locale = 'en', alternatePath }) {
  const id = locale === 'id';
  const home = id ? '/id/blog' : '/blog';
  const switchPath = alternatePath || (id ? '/blog' : '/id/blog');
  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <Link to="/" className="blog-brand">
          <img src={mainLogo} alt="" />
          <span>Akhmad Nizar Z.</span>
        </Link>
        <nav aria-label={id ? 'Navigasi blog' : 'Blog navigation'}>
          <Link to="/">{id ? 'Portofolio' : 'Portfolio'}</Link>
          <Link className="active" to={home}>Blog</Link>
          <Link to={switchPath} className="blog-language">{id ? 'EN' : 'ID'}</Link>
        </nav>
      </div>
    </header>
  );
}
