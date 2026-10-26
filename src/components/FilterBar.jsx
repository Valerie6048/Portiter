import { useLanguage } from '../context/LanguageContext';
import { FiArrowUpRight } from 'react-icons/fi';

export default function FilterBar({ activeFilter, onFilterChange }) {
  const { t } = useLanguage();

  const filters = [
    { key: 'all', label: 'filterAll' },
    { key: 'genai', label: 'filterGenAI' },
    { key: 'predictive', label: 'filterPredictive' },
    { key: 'mlops', label: 'filterMLOps' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-pills">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            {t(f.label)}
          </button>
        ))}
      </div>

      <div className="filter-actions">
        <a href="/AkhmadNizarZakaria_AIMLEngineer.pdf" download className="btn-ghost" data-analytics-event="cv_download" data-analytics-location="project_filter" style={{ fontSize: '0.82rem', padding: '8px 20px' }}>
          {t('filterDownloadCV')}
          <FiArrowUpRight size={14} />
        </a>
        <a
          href="https://github.com/Valerie6048"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          data-analytics-event="profile_click"
          data-analytics-platform="github"
          data-analytics-location="project_filter"
          style={{ fontSize: '0.82rem', padding: '8px 20px' }}
        >
          {t('filterGitHub')}
          <FiArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
