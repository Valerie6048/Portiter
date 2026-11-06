import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import mainLogo from '../assets/main_logo.png';

export default function BlogHeader({ locale = 'en', alternatePath }) {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const id = locale === 'id';
  const home = id ? '/id/blog' : '/blog';
  const switchPath = alternatePath || (id ? '/blog' : '/id/blog');

  useEffect(() => { setLanguage(locale); }, [locale, setLanguage]);

  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <Link to="/" className="blog-brand">
          <img src={mainLogo} alt="" />
          <span>Akhmad Nizar Z.</span>
        </Link>
        <nav className="blog-header-nav" aria-label={id ? 'Navigasi blog' : 'Blog navigation'}>
          <Link to="/">{id ? 'Portofolio' : 'Portfolio'}</Link>
          <Link className="active" to={home}>Blog</Link>
        </nav>
        <div className="blog-header-controls">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? (id ? 'Aktifkan mode terang' : 'Switch to light mode') : (id ? 'Aktifkan mode gelap' : 'Switch to dark mode')}
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <div className="lang-toggle" role="group" aria-label={id ? 'Bahasa' : 'Language'}>
            <button type="button" className={!id ? 'active' : ''} aria-pressed={!id} onClick={() => id && navigate(switchPath)}>EN</button>
            <button type="button" className={id ? 'active' : ''} aria-pressed={id} onClick={() => !id && navigate(switchPath)}>ID</button>
          </div>
        </div>
      </div>
    </header>
  );
}
