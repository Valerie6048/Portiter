import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'navProjects', href: '#projects' },
    { key: 'navSkills', href: '#skills' },
    { key: 'navContact', href: '#contact' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <a href="#" className="header-logo">Portiter</a>

          <nav className="header-nav">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          <div className="header-right">
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
            >
              {mobileOpen ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
          >
            {t(item.key)}
          </a>
        ))}
      </div>
    </>
  );
}
