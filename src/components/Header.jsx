import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';
import mainLogo from '../assets/main_logo.png';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'navExperience', href: '#experience', type: 'anchor' },
    { key: 'navProjects', href: '#projects', type: 'anchor' },
    { key: 'navSkills', href: '#skills', type: 'anchor' },
    { key: 'navTokenCounter', path: '/token-counter', type: 'route', badge: 'AI Tool' },
    { key: 'navContact', href: '#contact', type: 'anchor' },
  ];

  const handleItemClick = (e, item) => {
    setMobileOpen(false);

    if (item.type === 'route') {
      // Direct route navigation handled by Link or navigate
      return;
    }

    if (item.type === 'anchor') {
      e.preventDefault();
      if (location.pathname === '/') {
        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/${item.href}`);
        setTimeout(() => {
          document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <img src={mainLogo} alt="Logo" className="header-logo-img" />
            <span>Akhmad Nizar Z.</span>
          </Link>

          <nav className="header-nav">
            {navItems.map((item) => {
              if (item.type === 'route') {
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`nav-link-route ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="nav-route-text">{t(item.key)}</span>
                    {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
                  </Link>
                );
              }

              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                >
                  {t(item.key)}
                </a>
              );
            })}
          </nav>

          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <div className="lang-toggle">
              <button
                className={language === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                className={language === 'id' ? 'active' : ''}
                onClick={() => setLanguage('id')}
              >
                ID
              </button>
            </div>

            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation" className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          if (item.type === 'route') {
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{t(item.key)}</span>
                {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
              </Link>
            );
          }

          return (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => handleItemClick(e, item)}
            >
              {t(item.key)}
            </a>
          );
        })}
      </div>
    </>
  );
}
