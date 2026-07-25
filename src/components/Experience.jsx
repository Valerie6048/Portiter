import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineServer, HiOutlineLocationMarker, HiOutlineCalendar } from 'react-icons/hi';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import devdatLogo from '../assets/devdat_logo.png';

export default function Experience() {
  const { t } = useLanguage();
  const [expandedSection, setExpandedSection] = useState('genai');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'genai',
      titleKey: 'experienceCategoryGenAI',
      icon: <HiOutlineSparkles />,
      color: 'blue',
      highlightsKey: 'experienceGenAIHighlights',
    },
    {
      id: 'predictive',
      titleKey: 'experienceCategoryPredictive',
      icon: <HiOutlineChartBar />,
      color: 'purple',
      highlightsKey: 'experiencePredictiveHighlights',
    },
    {
      id: 'mlops',
      titleKey: 'experienceCategoryMLOps',
      icon: <HiOutlineServer />,
      color: 'green',
      highlightsKey: 'experienceMLOpsHighlights',
    },
  ];

  return (
    <section className="experience-section" id="experience">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t('experienceTitle')}
      </motion.h2>

      <div className="experience-container">
        <motion.div
          className="experience-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Company Header */}
          <div className="exp-card-header">
            <div className="exp-company-logo">
              <img src={devdatLogo} alt="Devdat" />
            </div>
            <div className="exp-company-info">
              <span className="exp-company-name">{t('experienceCompany')}</span>
              <h3 className="exp-role">{t('experienceRole')}</h3>
              
              <div className="exp-meta">
                <span className="exp-meta-item">
                  <HiOutlineLocationMarker />
                  {t('experienceLocation')}
                </span>
                <span className="exp-meta-item">
                  <HiOutlineCalendar />
                  {t('experiencePeriod')}
                </span>
              </div>
            </div>
          </div>

          {/* Overview summary */}
          <p className="exp-summary">{t('experienceSummary')}</p>

          {/* Accordion / Details sections */}
          <div className="exp-details-accordion">
            {sections.map((sect) => {
              const isOpen = expandedSection === sect.id;
              const highlights = t(sect.highlightsKey) || [];

              return (
                <div key={sect.id} className={`exp-acc-item ${sect.color} ${isOpen ? 'open' : ''}`}>
                  <button 
                    className="exp-acc-trigger" 
                    onClick={() => toggleSection(sect.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="exp-acc-title-wrapper">
                      <div className={`exp-acc-icon ${sect.color}`}>
                        {sect.icon}
                      </div>
                      <span className="exp-acc-title">{t(sect.titleKey)}</span>
                    </div>
                    {isOpen ? <FiChevronUp className="exp-acc-chevron" /> : <FiChevronDown className="exp-acc-chevron" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        key="content"
                        className="exp-acc-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <ul className="exp-highlights-list">
                          {Array.isArray(highlights) && highlights.map((hl, idx) => (
                            <li key={idx} className="exp-highlight-item">
                              <span className="exp-bullet" />
                              <p>{hl}</p>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
