import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  SiPython, SiCplusplus, SiC, SiJavascript,
  SiScikitlearn, SiTensorflow, SiOpencv, SiPytorch,
  SiDocker, SiGit, SiStreamlit, SiFastapi,
  SiGooglecloud,
} from 'react-icons/si';
import { TbSql } from 'react-icons/tb';
import { VscAzure } from 'react-icons/vsc';
import { HiOutlineCube } from 'react-icons/hi';

const iconMap = {
  // Languages
  'Python': SiPython,
  'C++': SiCplusplus,
  'C': SiC,
  'SQL': TbSql,
  'JavaScript': SiJavascript,
  // Frameworks
  'Scikit-learn': SiScikitlearn,
  'TensorFlow': SiTensorflow,
  'OpenCV': SiOpencv,
  'PyTorch': SiPytorch,
  'XGBoost': HiOutlineCube,
  'CatBoost': HiOutlineCube,
  // Tools
  'Azure ML Platform': VscAzure,
  'Azure AI Foundry': VscAzure,
  'BigQuery': SiGooglecloud,
  'Streamlit': SiStreamlit,
  'Docker': SiDocker,
  'Git': SiGit,
  'FastAPI': SiFastapi,
};

const skillsData = {
  languages: ['Python', 'C++', 'C', 'SQL', 'JavaScript'],
  frameworks: ['Scikit-learn', 'TensorFlow', 'OpenCV', 'XGBoost', 'CatBoost', 'PyTorch'],
  tools: ['Azure ML Platform', 'Azure AI Foundry', 'BigQuery', 'Streamlit', 'Docker', 'Git', 'FastAPI'],
};

export default function SkillsSection() {
  const { t } = useLanguage();

  const groups = [
    { key: 'languages', label: 'skillsLanguages', items: skillsData.languages },
    { key: 'frameworks', label: 'skillsFrameworks', items: skillsData.frameworks },
    { key: 'tools', label: 'skillsTools', items: skillsData.tools },
  ];

  return (
    <section className="skills-section" id="skills">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t('skillsTitle')}
      </motion.h2>

      <div className="skills-grid">
        {groups.map((group, idx) => (
          <motion.div
            key={group.key}
            className="skill-group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <h3>{t(group.label)}</h3>
            <div className="skill-tags">
              {group.items.map((item) => {
                const Icon = iconMap[item];
                return (
                  <span className="skill-tag" key={item}>
                    {Icon && <Icon className="skill-tag-icon" />}
                    {item}
                  </span>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
