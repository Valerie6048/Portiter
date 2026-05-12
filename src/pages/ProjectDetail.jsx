import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { projectDetails } from '../data/projectDetails';
import { FiArrowLeft, FiExternalLink, FiTarget, FiTool, FiAward, FiCpu, FiChevronRight } from 'react-icons/fi';

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
            <FiArrowLeft /> <span>Portiter</span>
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
          <span className="breadcrumb-link" onClick={() => {
            navigate('/');
            setTimeout(() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }} style={{ cursor: 'pointer' }}>
            Projects
          </span>
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
