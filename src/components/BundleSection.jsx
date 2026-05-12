import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineServer } from 'react-icons/hi';
import { FiArrowRight } from 'react-icons/fi';

export default function BundleSection() {
  const { t } = useLanguage();

  return (
    <div className="bundle-section">
      <motion.div
        className="bundle-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="bundle-icons">
          <div className="bundle-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            <HiOutlineSparkles />
          </div>
          <div className="bundle-icon" style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}>
            <HiOutlineChartBar />
          </div>
          <div className="bundle-icon" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
            <HiOutlineServer />
          </div>
        </div>

        <div className="bundle-info">
          <h3>{t('bundleTitle')}</h3>
          <p>{t('bundleSubtitle')}</p>
        </div>

        <a href="#contact" className="btn-primary" onClick={(e) => {
          e.preventDefault();
          document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          {t('bundleCollab')}
          <FiArrowRight />
        </a>
      </motion.div>
    </div>
  );
}
