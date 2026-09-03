import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">{t('navProjects')}</Link>
        <span className="footer-sep">&middot;</span>
        <Link to="/token-counter">{t('tcTitle')}</Link>
        <span className="footer-sep">&middot;</span>
        <a href="/#contact">{t('navContact')}</a>
      </div>
      <p>
        {t('footerMade')} <span className="heart">♥</span> {t('footerBy')} &middot; &copy; {year} {t('footerRights')}
      </p>
    </footer>
  );
}
