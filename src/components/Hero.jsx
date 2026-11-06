import { useLanguage } from '../context/LanguageContext';
import { HiOutlineDownload, HiOutlineMail } from 'react-icons/hi';
import { FiArrowUpRight } from 'react-icons/fi';
import avatarProfile from '../assets/avatar_profile.jpeg';
import certificationsData from '../data/certifications.json';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="hero-avatar-wrapper">
        <div className="hero-avatar">
          <img src={avatarProfile} alt="Akhmad Nizar Zakaria" />
          <div className="avatar-glow"></div>
        </div>
      </div>

      <div>
        <span className="status-pill">
          <span className="status-dot" />
          {t('heroStatusAvailable')}
        </span>
        <h1 className="hero-name">
          Akhmad Nizar
          <br />
          Zakaria
        </h1>
      </div>

      <p className="hero-role">
        {t('heroRole')}
      </p>

      <p className="hero-desc">
        {t('heroValueProp')}
      </p>

      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-num">5+</span>
          <span className="stat-label">{t('heroStatsProjects')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{(certificationsData.professional?.length || 0) + (certificationsData.training?.length || 0)}</span>
          <span className="stat-label">{t('heroStatsCerts')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">3.73</span>
          <span className="stat-label">{t('heroStatsGPA')}</span>
        </div>
      </div>

      <div className="hero-buttons">
        <a href="/AkhmadNizarZakaria_AIMLEngineer.pdf" download className="btn-primary" data-analytics-event="cv_download" data-analytics-location="hero">
          <HiOutlineDownload size={18} />
          {t('heroDownloadCV')}
          <FiArrowUpRight size={16} />
        </a>
        <a href="#contact" className="btn-ghost" onClick={(e) => {
          e.preventDefault();
          document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <HiOutlineMail size={18} />
          {t('heroContactMe')}
          <FiArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
