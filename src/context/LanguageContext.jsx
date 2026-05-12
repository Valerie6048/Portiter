import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Header
    navProjects: 'Projects',
    navSkills: 'Skills',
    navContact: 'Contact',

    // Hero
    heroRole: 'Machine Learning Engineer & AI Data Scientist',
    heroValueProp:
      'Specialist in end-to-end AI solutions, RAG systems, and large-scale forecasting across healthcare and marketing analytics domains.',
    heroDownloadCV: 'Download CV',
    heroContactMe: 'Contact Me',

    // Filter
    filterAll: 'All Projects',
    filterGenAI: 'Generative AI',
    filterPredictive: 'Predictive',
    filterMLOps: 'MLOps',
    filterDownloadCV: 'Download CV',
    filterGitHub: 'GitHub',

    // Project Cards
    projectGenAITitle: 'Generative AI',
    projectGenAISubtitle: 'Clinical Trial Matching & RAG Systems',
    projectGenAIFeatures: [
      'Clinical Trial Matching System (CTMS) architecture using RAG',
      'eCRF extraction to structured JSON format',
      'Adverse Events recommendation engine',
      'NLP pipeline for clinical data processing',
    ],

    projectPredictiveTitle: 'Predictive Modeling',
    projectPredictiveSubtitle: 'Forecasting & Optimization',
    projectPredictiveFeatures: [
      'Time-series forecasting with P10, P50, P90 guardrails',
      'Ramadhan season optimization modeling',
      'Marketing budget allocation via Bayesian optimization',
      'Multi-horizon demand planning system',
    ],

    projectMLOpsTitle: 'Infrastructure & MLOps',
    projectMLOpsSubtitle: 'Cloud AI & Data Pipelines',
    projectMLOpsFeatures: [
      'Azure AI cost calculation engine',
      'Video content analysis using Azure Video Indexer',
      'Production data pipeline implementation',
      'Automated ML model deployment workflows',
    ],

    projectViewDetails: 'View Details',

    // Bundle
    bundleTitle: 'End-to-End AI Engineer',
    bundleSubtitle: 'From Raw Data to Deployed ML Systems',
    bundleCollab: "Let's Collaborate",

    // Skills
    skillsTitle: 'Technical Arsenal',
    skillsLanguages: 'Languages',
    skillsFrameworks: 'Frameworks & Libraries',
    skillsTools: 'Tools & Platforms',

    // Education
    educationTitle: 'Education & Validation',
    educationDegree: 'Bachelor of Computer Engineering',
    educationUniversity: 'Universitas Brawijaya',
    educationGPA: 'GPA 3.73 / 4.0',
    certifications: 'Certifications',
    certAzure: 'Azure Machine Learning Associate',
    certAzureIssuer: 'Microsoft',
    certTF: 'TensorFlow Developer Certificate',
    certTFIssuer: 'Google',

    // Contact
    contactTitle: 'Get In Touch',
    contactSubtitle: "Let's build something amazing together",
    contactLocation: 'Malang, Indonesia',
    contactEmail: 'akhmad.nizar021@gmail.com',

    // Footer
    footerMade: 'Built with',
    footerBy: 'by Akhmad Nizar Zakaria',
    footerRights: 'All rights reserved.',

    // Additional Projects
    projectCafeTitle: 'Cafe Recommendation',
    projectCafeSubtitle: 'ML-Based Recommendation System',
    projectCafeFeatures: [
      'Content-based filtering for cafe recommendations in Malang',
      'Natural language search for descriptive queries',
      'Mobile app integration with cloud backend',
    ],
    projectCryptoTitle: 'Crypto Analysis Dashboard',
    projectCryptoSubtitle: 'Financial Data Visualization',
    projectCryptoFeatures: [
      'Real-time stock and crypto market charts via Streamlit',
      'AI agent for chart analysis and market insights',
      'Sentiment analysis for selected assets',
    ],
  },

  id: {
    // Header
    navProjects: 'Proyek',
    navSkills: 'Keahlian',
    navContact: 'Kontak',

    // Hero
    heroRole: 'Machine Learning Engineer & AI Data Scientist',
    heroValueProp:
      'Spesialis dalam solusi AI end-to-end, sistem RAG, dan forecasting skala besar pada domain healthcare serta marketing analytics.',
    heroDownloadCV: 'Unduh CV',
    heroContactMe: 'Hubungi Saya',

    // Filter
    filterAll: 'Semua Proyek',
    filterGenAI: 'Generative AI',
    filterPredictive: 'Prediktif',
    filterMLOps: 'MLOps',
    filterDownloadCV: 'Unduh CV',
    filterGitHub: 'GitHub',

    // Project Cards
    projectGenAITitle: 'Generative AI',
    projectGenAISubtitle: 'Clinical Trial Matching & Sistem RAG',
    projectGenAIFeatures: [
      'Arsitektur Clinical Trial Matching System (CTMS) menggunakan RAG',
      'Ekstraksi eCRF ke format JSON terstruktur',
      'Mesin rekomendasi Adverse Events',
      'Pipeline NLP untuk pemrosesan data klinis',
    ],

    projectPredictiveTitle: 'Pemodelan Prediktif',
    projectPredictiveSubtitle: 'Forecasting & Optimasi',
    projectPredictiveFeatures: [
      'Forecasting time-series dengan guardrail P10, P50, P90',
      'Pemodelan optimasi musim Ramadhan',
      'Alokasi budget marketing via optimasi Bayesian',
      'Sistem perencanaan permintaan multi-horizon',
    ],

    projectMLOpsTitle: 'Infrastruktur & MLOps',
    projectMLOpsSubtitle: 'Cloud AI & Pipeline Data',
    projectMLOpsFeatures: [
      'Mesin kalkulasi biaya Azure AI',
      'Analisis konten video menggunakan Azure Video Indexer',
      'Implementasi data pipeline produksi',
      'Alur kerja deployment model ML otomatis',
    ],

    projectViewDetails: 'Lihat Detail',

    // Bundle
    bundleTitle: 'End-to-End AI Engineer',
    bundleSubtitle: 'Dari Data Mentah hingga Sistem ML yang Siap Produksi',
    bundleCollab: 'Mari Berkolaborasi',

    // Skills
    skillsTitle: 'Arsenal Teknis',
    skillsLanguages: 'Bahasa Pemrograman',
    skillsFrameworks: 'Framework & Library',
    skillsTools: 'Tools & Platform',

    // Education
    educationTitle: 'Pendidikan & Validasi',
    educationDegree: 'Sarjana Teknik Komputer',
    educationUniversity: 'Universitas Brawijaya',
    educationGPA: 'IPK 3.73 / 4.0',
    certifications: 'Sertifikasi',
    certAzure: 'Azure Machine Learning Associate',
    certAzureIssuer: 'Microsoft',
    certTF: 'TensorFlow Developer Certificate',
    certTFIssuer: 'Google',

    // Contact
    contactTitle: 'Hubungi Saya',
    contactSubtitle: 'Mari bangun sesuatu yang luar biasa bersama',
    contactLocation: 'Malang, Indonesia',
    contactEmail: 'akhmad.nizar021@gmail.com',

    // Footer
    footerMade: 'Dibuat dengan',
    footerBy: 'oleh Akhmad Nizar Zakaria',
    footerRights: 'Hak cipta dilindungi.',

    // Additional Projects
    projectCafeTitle: 'Rekomendasi Kafe',
    projectCafeSubtitle: 'Sistem Rekomendasi Berbasis ML',
    projectCafeFeatures: [
      'Content-based filtering untuk rekomendasi kafe di Malang',
      'Pencarian natural language untuk query deskriptif',
      'Integrasi aplikasi mobile dengan backend cloud',
    ],
    projectCryptoTitle: 'Dashboard Analisis Kripto',
    projectCryptoSubtitle: 'Visualisasi Data Finansial',
    projectCryptoFeatures: [
      'Chart pasar saham dan kripto real-time via Streamlit',
      'Agen AI untuk analisis chart dan insight pasar',
      'Analisis sentimen untuk aset terpilih',
    ],
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'id' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
