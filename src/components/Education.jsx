import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineAcademicCap, HiOutlineShieldCheck } from 'react-icons/hi';
import { SiTensorflow } from 'react-icons/si';
import { FiExternalLink, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import certificationsData from '../data/certifications.json';

export default function Education() {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const visibleTrainingCerts = showAll
    ? certificationsData.training
    : certificationsData.training.slice(0, 6);

  return (
    <section className="education-section" id="education">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t('certificationsSectionTitle')}
      </motion.h2>

      <div className="education-main-grid">
        {/* Left Column: University Education */}
        <motion.div
          className="edu-card main-edu-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="edu-card-badge">Education</div>
          <div className="edu-icon">
            <HiOutlineAcademicCap />
          </div>
          <div className="edu-card-content">
            <h3>{t('educationDegree')}</h3>
            <p className="edu-university">{t('educationUniversity')}</p>
            <p className="edu-gpa">{t('educationGPA')}</p>
            <div className="edu-timeline">2020 - 2024</div>
          </div>
        </motion.div>

        {/* Right Column: Professional Certifications (Tier 1) */}
        <div className="pro-certs-container">
          <h3 className="section-subtitle">{t('professionalCerts')}</h3>
          <div className="pro-certs-grid">
            {certificationsData.professional.map((cert, index) => (
              <motion.div
                key={cert.id}
                className="pro-cert-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`pro-cert-icon-wrapper ${cert.issuer.toLowerCase()}`}>
                  {cert.id === 'tf_dev' ? <SiTensorflow /> : <HiOutlineShieldCheck />}
                </div>
                <div className="pro-cert-info">
                  <h4>{cert.title}</h4>
                  <p className="pro-cert-issuer">{cert.issuer}</p>
                  <p className="pro-cert-date">{cert.date}</p>
                </div>
                <div className="pro-cert-actions">
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cert-action verify"
                      title={t('verifyCredential')}
                    >
                      <FiExternalLink /> <span>{t('verifyCredential')}</span>
                    </a>
                  )}
                  {cert.file && (
                    <a
                      href={`/${cert.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cert-action view"
                      title={t('viewCertificate')}
                    >
                      <FiDownload /> <span>{t('viewCertificate')}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Training & Courses (Tier 2) */}
      <div className="training-certs-section">
        <h3 className="section-subtitle">{t('trainingAndCourses')}</h3>
        
        <motion.div 
          className="training-certs-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {visibleTrainingCerts.map((cert) => (
              <motion.div
                key={cert.file}
                className="training-cert-card"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="training-cert-header">
                  <div className="training-cert-dot" />
                  <span className="training-cert-issuer">{cert.issuer}</span>
                  <span className="training-cert-date">{cert.date}</span>
                </div>
                <h4 className="training-cert-title">{cert.title}</h4>
                <div className="training-cert-actions">
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="training-action-link verify"
                      title={t('verifyCredential')}
                    >
                      <FiExternalLink /> <span>{t('verifyCredential')}</span>
                    </a>
                  )}
                  {cert.file && (
                    <a
                      href={`/${cert.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="training-action-link view"
                      title={t('viewCertificate')}
                    >
                      <FiDownload /> <span>{t('viewCertificate')}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Toggle Button */}
        {certificationsData.training.length > 6 && (
          <div className="training-toggle-container">
            <button
              className="btn-toggle-training"
              onClick={() => setShowAll(!showAll)}
              aria-expanded={showAll}
            >
              {showAll ? (
                <>
                  <span>{t('showLess')}</span> <FiChevronUp />
                </>
              ) : (
                <>
                  <span>{t('showAll')}</span> <FiChevronDown />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
