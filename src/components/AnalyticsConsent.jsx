import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getAnalyticsConsent, setAnalyticsConsent, startAnalytics } from '../utils/analytics';

export default function AnalyticsConsent() {
  const { language } = useLanguage();
  const route = useLocation();
  const [choice, setChoice] = useState(getAnalyticsConsent);
  const [open, setOpen] = useState(choice === null);

  useEffect(() => {
    if (choice === 'granted') startAnalytics();
  }, [choice]);

  useEffect(() => {
    const openSettings = () => setOpen(true);
    window.addEventListener('portiter:privacy-settings', openSettings);
    return () => window.removeEventListener('portiter:privacy-settings', openSettings);
  }, []);

  const isIndonesian = language === 'id';
  if (!open) {
    return route.pathname === '/' ? null : (
      <button type="button" className="analytics-settings-trigger" onClick={() => setOpen(true)}>
        {isIndonesian ? 'Pengaturan privasi' : 'Privacy settings'}
      </button>
    );
  }

  const save = (value) => {
    setAnalyticsConsent(value);
    setChoice(value);
    setOpen(false);
  };

  return (
    <aside className="analytics-consent" aria-label={isIndonesian ? 'Pilihan analitik' : 'Analytics choice'}>
      <div>
        <h2>{isIndonesian ? 'Bantu saya memahami kunjungan portfolio' : 'Help me understand portfolio visits'}</h2>
        <p>
          {isIndonesian
            ? 'Dengan persetujuanmu, Google Analytics mencatat halaman yang dibuka, sumber kunjungan, serta klik kontak, profil, dan unduhan CV. Layanan ini dapat memakai cookie. Analitik tidak aktif sebelum kamu setuju. Pilihanmu bisa diubah kapan saja lewat Pengaturan privasi di footer.'
            : 'With your permission, Google Analytics measures pages visited, traffic sources, and contact, profile, and CV download clicks. It may use cookies. Analytics stays off until you agree. You can change your choice anytime through Privacy settings in the footer.'}
        </p>
        <p className="analytics-consent-provider">
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            {isIndonesian ? 'Kebijakan privasi Google' : 'Google Privacy Policy'}
          </a>
        </p>
      </div>
      <div className="analytics-consent-actions">
        <button type="button" className="analytics-consent-reject" onClick={() => save('denied')}>
          {isIndonesian ? 'Tolak' : 'Decline'}
        </button>
        <button type="button" className="analytics-consent-accept" onClick={() => save('granted')}>
          {isIndonesian ? 'Setuju' : 'Accept'}
        </button>
      </div>
    </aside>
  );
}
