import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Header
    navExperience: 'Experience',
    navProjects: 'Projects',
    navSkills: 'Skills',
    navContact: 'Contact',

    // Hero
    heroRole: 'Machine Learning Engineer & AI Data Scientist',
    heroValueProp:
      'Specialist in end-to-end AI solutions, RAG systems, and large-scale forecasting across healthcare and marketing analytics domains.',
    heroDownloadCV: 'Download CV',
    heroContactMe: 'Contact Me',
    heroStatsProjects: 'Projects',
    heroStatsCerts: 'Certificates & Courses',
    heroStatsGPA: 'GPA',

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

    // Experience
    experienceTitle: 'Professional Experience',
    experienceRole: 'Machine Learning Engineer',
    experienceCompany: 'Devdat',
    experienceLocation: 'Jakarta, Indonesia (Remote)',
    experiencePeriod: 'May 2024 - Present',
    experienceSummary: 'As a Machine Learning Engineer and AI Data Scientist, I specialize in developing end-to-end AI solutions, from advanced RAG systems to high-precision forecasting models. I focus on optimizing large-scale data pipelines and implementing production-grade Generative AI applications within the healthcare and marketing analytics domains.',
    experienceCategoryGenAI: 'Generative AI & Clinical Intelligence',
    experienceCategoryPredictive: 'Predictive Modeling & Marketing Science',
    experienceCategoryMLOps: 'MLOps & Analytics Infrastructure',
    experienceGenAIHighlights: [
      'Developed an automated system to extract data from Clinical Research Forms (eCRF) into structured JSON formats optimized for HTML rendering.',
      'Architected a Clinical Trial Matching System (CTMS) for oncology utilizing Retrieval-Augmented Generation (RAG) and SLM/LLM reasoning to optimize patient-trial alignment.',
      'Built a context-aware recommendation engine for Adverse Events (CTCAE) using RAG and LLMs to provide precise clinical reasoning.',
      'Conducted modality support assessments (Text, Image, Audio, Video) for various frontier models like Gemini, GPT, and Claude to ensure platform compatibility.'
    ],
    experiencePredictiveHighlights: [
      'Engineered business-grade time-series forecasting models with integrated output guardrails and probabilistic ranges (P10, P50, P90) to ensure realistic business outputs.',
      'Optimized forecasting accuracy for high-seasonality periods, specifically addressing Ramadhan impacts through hyperparameter tuning and seasonality adjustments.',
      'Developed machine learning models for marketing budget allocation using regression and Bayesian optimization to maximize cross-channel performance.'
    ],
    experienceMLOpsHighlights: [
      'Built an internal cost calculation engine to estimate token, video, and storage costs for Azure AI services, providing granular usage transparency.',
      'Implemented video content analysis and creative deduplication using Azure Video Indexer and Computer Vision APIs to optimize engagement insights.'
    ],

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
    educationBadge: 'Education',
    certifications: 'Certifications',
    certificationsSectionTitle: 'Education & Certifications',
    professionalCerts: 'Professional Certifications',
    trainingAndCourses: 'Training & Courses',
    issued: 'Issued',
    expires: 'Expires',
    verifyCredential: 'Verify Credential',
    viewCertificate: 'View Certificate',
    showAll: 'Show All',
    showLess: 'Show Less',
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

    // Hero Status
    heroStatusAvailable: 'Available for AI/ML Roles',

    // AI Token Counter & Multi-Page
    navTokenCounter: 'Token Counter',
    tcBadge: 'Free AI Utility',
    tcTitle: 'AI Token Counter',
    tcSubtitle: 'Instant, private token estimates for current OpenAI, Claude, Gemini, and DeepSeek models. OpenAI counts use the o200k_base tokenizer; other providers are browser-side estimates.',
    tcInputLabel: 'Text or prompt to count',
    tcInputPlaceholder: 'Paste or type your text/prompt here to estimate tokens in real time...',
    tcTokens: 'Total Tokens',
    tcCharacters: 'Characters',
    tcWords: 'Words',
    tcLines: 'Lines',
    tcPaste: 'Paste',
    tcClear: 'Clear',
    tcSample: 'Sample Prompt',
    tcCopyStats: 'Copy Stats',
    tcCopied: 'Copied!',
    tcSelectModel: 'Target Model',
    tcModelProvider: 'Provider',
    tcModelContext: 'Max Context',
    tcModelVocab: 'Vocab / Encoding',
    tcReasoningBadge: 'Reasoning Model',
    tcEstimateBadge: 'Browser Estimate',
    tcContextUsage: 'Context Window Usage',
    tcPrivacyNotice: '100% Client-Side: Your text is processed locally in your browser and never sent to any server.',
    tcInfoTitle: 'Current LLM Tokenization',
    tcInfoWhatIsToken: 'What is a Token?',
    tcInfoWhatIsTokenDesc: 'Tokens are the building blocks processed by Large Language Models. This tool uses the OpenAI o200k_base tokenizer directly and provides estimates for providers whose official tokenizers are not bundled in the browser.',
    tcInfoWhyMatters: 'Context Windows & Reasoning Tokens',
    tcInfoWhyMattersDesc: 'Context limits and billing depend on the exact provider model and request structure. Use this result as a planning estimate; system prompts, tools, images, and provider-specific formatting can change the final count.',
    tcBackToHome: 'Back to Portfolio',
    tcExploreProjects: 'View AI Projects',
  },

  id: {
    // Header
    navExperience: 'Pengalaman',
    navProjects: 'Proyek',
    navSkills: 'Keahlian',
    navContact: 'Kontak',

    // Hero
    heroRole: 'Machine Learning Engineer & AI Data Scientist',
    heroValueProp:
      'Spesialis dalam solusi AI end-to-end, sistem RAG, dan forecasting skala besar pada domain healthcare serta marketing analytics.',
    heroDownloadCV: 'Unduh CV',
    heroContactMe: 'Hubungi Saya',
    heroStatsProjects: 'Proyek',
    heroStatsCerts: 'Sertifikat & Kursus',
    heroStatsGPA: 'IPK',

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

    // Experience
    experienceTitle: 'Pengalaman Kerja',
    experienceRole: 'Machine Learning Engineer',
    experienceCompany: 'Devdat',
    experienceLocation: 'Jakarta, Indonesia (Remote)',
    experiencePeriod: 'Mei 2024 - Sekarang',
    experienceSummary: 'Sebagai Machine Learning Engineer dan AI Data Scientist, saya berspesialisasi dalam mengembangkan solusi AI end-to-end, mulai dari sistem RAG canggih hingga model forecasting dengan presisi tinggi. Saya fokus pada optimalisasi pipeline data skala besar dan penerapan aplikasi Generative AI siap-produksi pada domain healthcare serta marketing analytics.',
    experienceCategoryGenAI: 'Generative AI & Kecerdasan Klinis',
    experienceCategoryPredictive: 'Pemodelan Prediktif & Marketing Science',
    experienceCategoryMLOps: 'Infrastruktur MLOps & Analitik',
    experienceGenAIHighlights: [
      'Mengembangkan sistem otomatis untuk mengekstrak data dari Clinical Research Forms (eCRF) menjadi format JSON terstruktur yang dioptimalkan untuk rendering HTML.',
      'Merancang arsitektur Clinical Trial Matching System (CTMS) untuk onkologi menggunakan Retrieval-Augmented Generation (RAG) dan penalaran SLM/LLM untuk mengoptimalkan pencocokan pasien-uji klinis.',
      'Membangun mesin rekomendasi context-aware untuk Adverse Events (CTCAE) menggunakan RAG dan LLM untuk memberikan penalaran klinis yang tepat.',
      'Melakukan asesmen dukungan modalitas (Teks, Gambar, Audio, Video) untuk berbagai model frontier seperti Gemini, GPT, dan Claude untuk memastikan kompatibilitas platform.'
    ],
    experiencePredictiveHighlights: [
      'Membangun model forecasting time-series tingkat bisnis dengan guardrail output terintegrasi dan rentang probabilistik (P10, P50, P90) untuk memastikan output bisnis yang realistis.',
      'Mengoptimalkan akurasi forecasting untuk periode musiman tinggi, khususnya mengatasi dampak Ramadhan melalui tuning hyperparameter dan penyesuaian musim.',
      'Mengembangkan model machine learning untuk alokasi anggaran pemasaran menggunakan regresi dan optimasi Bayesian untuk memaksimalkan performa lintas saluran.'
    ],
    experienceMLOpsHighlights: [
      'Membangun mesin penghitung biaya internal untuk mengestimasi biaya token, video, dan penyimpanan untuk layanan Azure AI, memberikan transparansi penggunaan yang mendetail.',
      'Mengimplementasikan analisis konten video dan deduplikasi kreatif menggunakan Azure Video Indexer dan Computer Vision API untuk mengoptimalkan insight interaksi.'
    ],

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
    educationBadge: 'Pendidikan',
    certifications: 'Sertifikasi',
    certificationsSectionTitle: 'Pendidikan & Sertifikasi',
    professionalCerts: 'Sertifikasi Profesional',
    trainingAndCourses: 'Pelatihan & Kursus',
    issued: 'Diperoleh',
    expires: 'Berlaku hingga',
    verifyCredential: 'Verifikasi Kredensial',
    viewCertificate: 'Lihat Sertifikat',
    showAll: 'Tampilkan Semua',
    showLess: 'Tampilkan Lebih Sedikit',
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

    // Hero Status
    heroStatusAvailable: 'Tersedia untuk Peran AI/ML',

    // AI Token Counter & Multi-Page
    navTokenCounter: 'Token Counter',
    tcBadge: 'Utilitas AI Gratis',
    tcTitle: 'AI Token Counter',
    tcSubtitle: 'Estimasi token instan dan privat untuk model OpenAI, Claude, Gemini, dan DeepSeek terbaru. Tokenizer o200k_base digunakan untuk OpenAI; provider lain dihitung sebagai estimasi di browser.',
    tcInputLabel: 'Teks atau prompt yang dihitung',
    tcInputPlaceholder: 'Tempel atau ketik teks/prompt Anda untuk mengestimasi token secara langsung...',
    tcTokens: 'Total Token',
    tcCharacters: 'Karakter',
    tcWords: 'Kata',
    tcLines: 'Baris',
    tcPaste: 'Tempel',
    tcClear: 'Bersihkan',
    tcSample: 'Contoh Teks',
    tcCopyStats: 'Salin Statistik',
    tcCopied: 'Tersalin!',
    tcSelectModel: 'Pilih Model Target',
    tcModelProvider: 'Penyedia',
    tcModelContext: 'Kapasitas Context',
    tcModelVocab: 'Kamus / Encoding',
    tcReasoningBadge: 'Model Penalaran (Reasoning)',
    tcEstimateBadge: 'Estimasi Browser',
    tcContextUsage: 'Penggunaan Context Window',
    tcPrivacyNotice: '100% Sisi Klien: Teks Anda diproses secara lokal di browser dan tidak pernah dikirim ke server mana pun.',
    tcInfoTitle: 'Tokenisasi Model AI Terkini',
    tcInfoWhatIsToken: 'Apa itu Token?',
    tcInfoWhatIsTokenDesc: 'Token adalah unit dasar pemrosesan teks pada Large Language Model. Tool ini memakai tokenizer OpenAI o200k_base secara langsung dan memberikan estimasi untuk provider yang tokenizernya tidak tersedia di browser.',
    tcInfoWhyMatters: 'Context Window & Reasoning Tokens',
    tcInfoWhyMattersDesc: 'Batas context dan biaya bergantung pada model serta struktur request provider. Gunakan hasil ini sebagai estimasi perencanaan; system prompt, tools, gambar, dan format khusus provider dapat mengubah jumlah akhir.',
    tcBackToHome: 'Kembali ke Portofolio',
    tcExploreProjects: 'Lihat Proyek AI',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  // Sync HTML lang attribute with selected language for SEO
  useEffect(() => {
    document.documentElement.lang = language === 'id' ? 'id' : 'en';
  }, [language]);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
