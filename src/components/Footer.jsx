import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        {t('footerMade')} <span className="heart">♥</span> {t('footerBy')} &middot; &copy; {year} {t('footerRights')}
      </p>
    </footer>
  );
}
