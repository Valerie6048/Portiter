import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { projectDetails } from '../data/projectDetails';
import { FiArrowLeft, FiExternalLink, FiTarget, FiTool, FiAward, FiCpu, FiChevronRight } from 'react-icons/fi';
import { setPageSeo, HOME_SEO } from '../utils/seo';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const project = projectDetails[language]?.[projectId] || projectDetails.en?.[projectId];

  useEffect(() => {
    if (project) {
      setPageSeo({
        title: `${project.title} — Akhmad Nizar Z.`,
        description: `${project.subtitle} — ${project.title}. Portfolio project by Akhmad Nizar Zakaria.`,
        path: `/project/${projectId}`,
      });
    }
    return () => {
      setPageSeo(HOME_SEO);
    };
  }, [project, projectId]);

  if (!project) {
    return (
      <div className="detail-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FiArrowLeft /> Back
          </button>
          <h1>Project not found</h1>
        </div>
      </div>
    );
  }

  const accentVar =
    project.color === 'blue'
      ? 'var(--accent-blue)'
      : project.color === 'purple'
        ? 'var(--accent-purple)'
        : 'var(--accent-green)';

  const accentDimVar =
    project.color === 'blue'
      ? 'var(--accent-blue-dim)'
      : project.color === 'purple'
        ? 'var(--accent-purple-dim)'
        : 'var(--accent-green-dim)';

  const categoryLabel =
    project.color === 'blue'
      ? 'Generative AI'
      : project.color === 'purple'
        ? 'Predictive / Analytics'
        : 'Infrastructure';

  return (
    <div className="detail-page">
      <div className="detail-header-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            <FiArrowLeft /> <span>Akhmad Nizar Z.</span>
          </button>
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="github-link-btn">
              <FiExternalLink /> GitHub
            </a>
          )}
        </div>
      </div>

      <div className="container detail-container">
        {/* Breadcrumbs */}
        <motion.nav
          className="breadcrumbs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
        >
          <Link to="/" className="breadcrumb-link">Home</Link>
          <FiChevronRight className="breadcrumb-sep" />
          <a href="/#projects" className="breadcrumb-link">Projects</a>
          <FiChevronRight className="breadcrumb-sep" />
          <span className="breadcrumb-current">{project.title}</span>
        </motion.nav>

        {/* Hero */}
        <motion.div className="detail-hero" {...fadeUp}>
          <div className="detail-badge" style={{ background: accentDimVar, color: accentVar }}>
            {categoryLabel}
          </div>
          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-subtitle">{project.subtitle}</p>
        </motion.div>

        {/* Project Visual Banner Placeholder */}
        <motion.div 
          className={`detail-visual-banner ${project.color}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="banner-glow" />
          <div className="banner-pattern">
            {project.color === 'blue' && (
              <svg width="100%" height="100%" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="400" cy="150" r="100" stroke="var(--accent-blue)" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
                <circle cx="400" cy="150" r="60" stroke="var(--accent-blue)" strokeWidth="3" opacity="0.5" />
                <path d="M 200 150 L 340 150 M 460 150 L 600 150" stroke="var(--accent-blue)" strokeWidth="2" opacity="0.4" />
                <path d="M 400 50 L 400 90 M 400 210 L 400 250" stroke="var(--accent-blue)" strokeWidth="2" opacity="0.4" />
                <circle cx="200" cy="150" r="6" fill="var(--accent-blue)" />
                <circle cx="600" cy="150" r="6" fill="var(--accent-blue)" />
                <text x="400" y="155" fill="var(--accent-blue)" fontSize="13" fontWeight="700" letterSpacing="4" textAnchor="middle">AI / RAG PIPELINE</text>
              </svg>
            )}
            {project.color === 'purple' && (
              <svg width="100%" height="100%" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 150 220 Q 250 80 350 160 T 550 100 T 700 180" stroke="var(--accent-purple)" strokeWidth="4" opacity="0.7" />
                <path d="M 150 250 Q 250 120 350 200 T 550 140 T 700 220" stroke="var(--accent-purple)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                <circle cx="350" cy="160" r="6" fill="var(--accent-purple)" />
                <circle cx="550" cy="100" r="6" fill="var(--accent-purple)" />
                <text x="400" y="50" fill="var(--accent-purple)" fontSize="13" fontWeight="700" letterSpacing="4" textAnchor="middle">FORECASTING & OPTIMIZATION</text>
              </svg>
            )}
            {project.color === 'green' && (
              <svg width="100%" height="100%" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="250" y="80" width="100" height="140" rx="8" stroke="var(--accent-green)" strokeWidth="2" opacity="0.5" />
                <rect x="450" y="80" width="100" height="140" rx="8" stroke="var(--accent-green)" strokeWidth="2" opacity="0.5" />
                <path d="M 350 150 H 450" stroke="var(--accent-green)" strokeWidth="3" strokeDasharray="6 6" opacity="0.8" />
                <circle cx="350" cy="150" r="5" fill="var(--accent-green)" />
                <circle cx="450" cy="150" r="5" fill="var(--accent-green)" />
                <text x="400" y="260" fill="var(--accent-green)" fontSize="13" fontWeight="700" letterSpacing="4" textAnchor="middle">MLOPS / DATA INFRASTRUCTURE</text>
              </svg>
            )}
          </div>
          <div className="banner-overlay">
            <span>Visual Concept Placeholder</span>
          </div>
        </motion.div>

        {/* Use Case */}
        <motion.section className="detail-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: accentDimVar, color: accentVar }}>
              <FiTarget />
            </div>
            <h2>{project.usecase.title}</h2>
          </div>
          <p className="section-text">{project.usecase.content}</p>
        </motion.section>

        {/* Approach */}
        <motion.section className="detail-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: accentDimVar, color: accentVar }}>
              <FiTool />
            </div>
            <h2>{project.approach.title}</h2>
          </div>
          <div className="approach-grid">
            {project.approach.items.map((item, i) => (
              <div className="approach-card" key={i}>
                <div className="approach-number" style={{ color: accentVar }}>{String(i + 1).padStart(2, '0')}</div>
                <h3>{item.heading}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Results */}
        <motion.section className="detail-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: accentDimVar, color: accentVar }}>
              <FiAward />
            </div>
            <h2>{project.results.title}</h2>
          </div>
          <div className="results-list">
            {project.results.items.map((item, i) => (
              <div className="result-item" key={i}>
                <div className="result-dot" style={{ background: accentVar }} />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section className="detail-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: accentDimVar, color: accentVar }}>
              <FiCpu />
            </div>
            <h2>{project.techStack.title}</h2>
          </div>
          <div className="tech-tags-detail">
            {project.techStack.items.map((item) => (
              <span className="tech-tag-detail" key={item} style={{ borderColor: accentVar }}>
                {item}
              </span>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div className="detail-cta" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }}>
          <button className="btn-ghost" onClick={() => navigate('/')}>
            <FiArrowLeft /> {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
          </button>
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <FiExternalLink /> {language === 'id' ? 'Lihat di GitHub' : 'View on GitHub'}
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}
