import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';
import mainLogo from '../assets/main_logo.png';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'navExperience', href: '#experience' },
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
          <a href="#" className="header-logo">
            <img src={mainLogo} alt="Logo" className="header-logo-img" />
            <span>Akhmad Nizar Z.</span>
          </a>

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
