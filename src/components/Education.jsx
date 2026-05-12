import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineAcademicCap, HiOutlineBadgeCheck, HiOutlineShieldCheck } from 'react-icons/hi';
import { SiTensorflow } from 'react-icons/si';

export default function Education() {
  const { t } = useLanguage();

  return (
    <section className="education-section">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t('educationTitle')}
      </motion.h2>

      <div className="education-grid">
        <motion.div
          className="edu-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="edu-icon">
            <HiOutlineAcademicCap />
          </div>
          <h3>{t('educationDegree')}</h3>
          <p className="edu-sub">{t('educationUniversity')}</p>
          <p className="edu-detail">{t('educationGPA')}</p>
        </motion.div>

        <motion.div
          className="edu-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 style={{ marginBottom: '20px' }}>{t('certifications')}</h3>
          <div className="cert-list">
            <div className="cert-item">
              <div className="cert-icon microsoft">
                <HiOutlineShieldCheck />
              </div>
              <div className="cert-info">
                <h4>{t('certAzure')}</h4>
                <p>{t('certAzureIssuer')}</p>
              </div>
            </div>
            <div className="cert-item">
              <div className="cert-icon google">
                <SiTensorflow />
              </div>
              <div className="cert-info">
                <h4>{t('certTF')}</h4>
                <p>{t('certTFIssuer')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
