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
        <a href="https://tools.akhmdnzr.fun/">{t('navTools')}</a>
        <span className="footer-sep">&middot;</span>
        <a href="/#contact">{t('navContact')}</a>
      </div>
      <p>
        {t('footerMade')} <span className="heart">♥</span> {t('footerBy')} &middot; &copy; {year} {t('footerRights')}
      </p>
      <button type="button" className="footer-privacy" onClick={() => window.dispatchEvent(new Event('portiter:privacy-settings'))}>
        {t('privacySettings')}
      </button>
    </footer>
  );
}
