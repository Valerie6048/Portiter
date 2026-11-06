import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { isAnalyticsDisabled, setAnalyticsDisabled } from '../utils/analytics';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [analyticsDisabled, setDisabled] = useState(isAnalyticsDisabled);

  const toggleAnalytics = () => {
    const next = !analyticsDisabled;
    setAnalyticsDisabled(next);
    setDisabled(next);
  };

  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">{t('navProjects')}</Link>
        <span className="footer-sep">&middot;</span>
        <Link to="/blog">{t('navBlog')}</Link>
        <span className="footer-sep">&middot;</span>
        <a href="https://tools.akhmdnzr.fun/">{t('navTools')}</a>
        <span className="footer-sep">&middot;</span>
        <a href="/#contact">{t('navContact')}</a>
      </div>
      <p>
        {t('footerMade')} <span className="heart">♥</span> {t('footerBy')} &middot; &copy; {year} {t('footerRights')}
      </p>
      <button type="button" className="footer-privacy" onClick={toggleAnalytics}>
        {analyticsDisabled ? t('enableAnalytics') : t('disableAnalytics')}
      </button>
      <p className="footer-analytics-notice">
        {t('analyticsNotice')}{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          {t('googlePrivacyPolicy')}
        </a>
      </p>
    </footer>
  );
}
