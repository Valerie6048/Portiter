import { useState } from 'react';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineServer } from 'react-icons/hi';
import { FiCoffee, FiTrendingUp } from 'react-icons/fi';
import FilterBar from './FilterBar';
import ProjectCard from './ProjectCard';

const projects = [
  {
    id: 'genai',
    category: 'genai',
    color: 'blue',
    icon: <HiOutlineSparkles />,
    titleKey: 'projectGenAITitle',
    subtitleKey: 'projectGenAISubtitle',
    featuresKey: 'projectGenAIFeatures',
    techs: ['RAG', 'LLM', 'NLP', 'Python'],
    link: '/project/genai',
    isInternal: true,
  },
  {
    id: 'predictive',
    category: 'predictive',
    color: 'purple',
    icon: <HiOutlineChartBar />,
    titleKey: 'projectPredictiveTitle',
    subtitleKey: 'projectPredictiveSubtitle',
    featuresKey: 'projectPredictiveFeatures',
    techs: ['XGBoost', 'Bayesian', 'TimeSeries'],
    link: '/project/predictive',
    isInternal: true,
  },
  {
    id: 'mlops',
    category: 'mlops',
    color: 'green',
    icon: <HiOutlineServer />,
    titleKey: 'projectMLOpsTitle',
    subtitleKey: 'projectMLOpsSubtitle',
    featuresKey: 'projectMLOpsFeatures',
    techs: ['Azure', 'Docker', 'Pipeline'],
    link: '/project/mlops',
    isInternal: true,
  },
  {
    id: 'cafe',
    category: 'genai',
    color: 'blue',
    icon: <FiCoffee />,
    titleKey: 'projectCafeTitle',
    subtitleKey: 'projectCafeSubtitle',
    featuresKey: 'projectCafeFeatures',
    techs: ['TensorFlow', 'NLP', 'GCloud'],
    link: '/project/cafe',
    isInternal: true,
  },
  {
    id: 'crypto',
    category: 'predictive',
    color: 'purple',
    icon: <FiTrendingUp />,
    titleKey: 'projectCryptoTitle',
    subtitleKey: 'projectCryptoSubtitle',
    featuresKey: 'projectCryptoFeatures',
    techs: ['Streamlit', 'yFinance', 'AI'],
    link: '/project/crypto',
    isInternal: true,
  },
];

export default function ProjectGrid() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => p.category === filter);

  return (
    <>
      <FilterBar activeFilter={filter} onFilterChange={setFilter} />
      <div className="project-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.id} {...p} />
        ))}
      </div>
    </>
  );
}
