import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineDownload, HiOutlineMail } from 'react-icons/hi';
import { FiArrowUpRight } from 'react-icons/fi';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
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
        className="hero-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
      >
        <a href="/cv.pdf" download className="btn-primary">
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
