import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineDownload, HiOutlineMail } from 'react-icons/hi';
import { FiArrowUpRight } from 'react-icons/fi';
import avatarProfile from '../assets/avatar_profile.jpeg';
import certificationsData from '../data/certifications.json';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <motion.div
        className="hero-avatar-wrapper"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="hero-avatar">
          <img src={avatarProfile} alt="Akhmad Nizar Zakaria" />
          <div className="avatar-glow"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <span className="status-pill">
          <span className="status-dot" />
          {t('heroStatusAvailable')}
        </span>
        <h1 className="hero-name">
          <span className="gradient-text">Akhmad Nizar</span>
          <br />
          Zakaria
        </h1>
      </motion.div>

      <motion.p
        className="hero-role"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        {t('heroRole')}
      </motion.p>

      <motion.p
        className="hero-desc"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      >
        {t('heroValueProp')}
      </motion.p>

      <motion.div
        className="hero-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.38, ease: 'easeOut' }}
      >
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
      </motion.div>

      <motion.div
        className="hero-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
      >
        <a href="/cv_new.pdf" download className="btn-primary">
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
      </motion.div>
    </section>
  );
}
