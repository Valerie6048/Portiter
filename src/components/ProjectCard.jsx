import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowRight, FiInfo } from 'react-icons/fi';

function CardLink({ children, color, link, isInternal }) {
  if (!link) return <span className={`card-link ${color}`} style={{ opacity: 0.5, cursor: 'default' }}>{children}</span>;
  if (isInternal) return <Link to={link} className={`card-link ${color}`}>{children}</Link>;
  return <a href={link} target="_blank" rel="noopener noreferrer" className={`card-link ${color}`}>{children}</a>;
}

export default function ProjectCard({ color, icon, titleKey, subtitleKey, featuresKey, techs, link, isInternal }) {
  const { t } = useLanguage();
  const features = t(featuresKey);

  return (
    <motion.div
      className={`project-card ${color}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={`card-icon ${color}`}>{icon}</div>
      <h3 className="card-title">{t(titleKey)}</h3>
      <p className="card-subtitle">{t(subtitleKey)}</p>

      <div className="card-features">
        {Array.isArray(features) && features.slice(0, 3).map((feat, i) => (
          <div className="card-feature" key={i}>
            <FiInfo className="feature-icon" />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      <div className="card-footer">
        <div className="card-techs">
          {techs.map((tech) => (
            <span className="tech-badge" key={tech}>{tech}</span>
          ))}
        </div>
        <CardLink color={color} link={link} isInternal={isInternal}>
          {t('projectViewDetails')} <FiArrowRight />
        </CardLink>
      </div>
    </motion.div>
  );
}
