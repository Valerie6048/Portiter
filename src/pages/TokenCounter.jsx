import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEncoding } from 'js-tiktoken';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FiCpu,
  FiFileText,
  FiHash,
  FiAlignLeft,
  FiClipboard,
  FiTrash2,
  FiCheck,
  FiArrowLeft,
  FiZap,
  FiInfo,
  FiShield,
  FiLayers,
  FiActivity
} from 'react-icons/fi';

// Verified Frontier Models Catalog
const LLM_MODELS = [
  // OpenAI (o-Series & GPT-4o)
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni Flagship)',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'o200k_base',
    contextWindow: 128000,
    vocabSize: '200k (o200k_base)',
    type: 'Multimodal Flagship',
    isReasoning: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'o200k_base',
    contextWindow: 128000,
    vocabSize: '200k (o200k_base)',
    type: 'Fast & Efficient',
    isReasoning: false,
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini (Reasoning)',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'o200k_base',
    contextWindow: 200000,
    vocabSize: '200k (o200k_base)',
    type: 'Reasoning Frontier',
    isReasoning: true,
  },
  {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'o200k_base',
    contextWindow: 200000,
    vocabSize: '200k (o200k_base)',
    type: 'Reasoning Flagship',
    isReasoning: true,
  },
  {
    id: 'o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'o200k_base',
    contextWindow: 128000,
    vocabSize: '200k (o200k_base)',
    type: 'Fast Reasoning',
    isReasoning: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    group: 'OpenAI (GPT-4o & o-Series)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '100k (cl100k_base)',
    type: 'High Intelligence',
    isReasoning: false,
  },

  // Anthropic Claude (3.7 & 3.5 Series)
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
    provider: 'Anthropic',
    group: 'Anthropic Claude (3.7 & 3.5 Series)',
    encoding: 'cl100k_base',
    contextWindow: 200000,
    vocabSize: '~65k (Byte-Level BPE)',
    type: 'Hybrid Reasoning Flagship',
    isReasoning: true,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    group: 'Anthropic Claude (3.7 & 3.5 Series)',
    encoding: 'cl100k_base',
    contextWindow: 200000,
    vocabSize: '~65k (Byte-Level BPE)',
    type: 'Coding & Vision Flagship',
    isReasoning: false,
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    group: 'Anthropic Claude (3.7 & 3.5 Series)',
    encoding: 'cl100k_base',
    contextWindow: 200000,
    vocabSize: '~65k (Byte-Level BPE)',
    type: 'Ultra-Fast Sub-Agent',
    isReasoning: false,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    group: 'Anthropic Claude (3.7 & 3.5 Series)',
    encoding: 'cl100k_base',
    contextWindow: 200000,
    vocabSize: '~65k (Byte-Level BPE)',
    type: 'Complex Analysis',
    isReasoning: false,
  },

  // Google Gemini (2.0 & 1.5 Series)
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash (1M Context)',
    provider: 'Google DeepMind',
    group: 'Google Gemini (2.0 & 1.5 Series)',
    encoding: 'o200k_base',
    contextWindow: 1048576, // 1M tokens
    vocabSize: '256k (SentencePiece)',
    type: '1M Long-Context Flash',
    isReasoning: false,
  },
  {
    id: 'gemini-2-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking (1M Context)',
    provider: 'Google DeepMind',
    group: 'Google Gemini (2.0 & 1.5 Series)',
    encoding: 'o200k_base',
    contextWindow: 1048576, // 1M tokens
    vocabSize: '256k (SentencePiece)',
    type: '1M Reasoning Flash',
    isReasoning: true,
  },
  {
    id: 'gemini-2-pro-exp',
    name: 'Gemini 2.0 Pro Experimental (2M Context)',
    provider: 'Google DeepMind',
    group: 'Google Gemini (2.0 & 1.5 Series)',
    encoding: 'o200k_base',
    contextWindow: 2097152, // 2M tokens
    vocabSize: '256k (SentencePiece)',
    type: '2M Long-Context Pro',
    isReasoning: true,
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro (2M Context)',
    provider: 'Google DeepMind',
    group: 'Google Gemini (2.0 & 1.5 Series)',
    encoding: 'o200k_base',
    contextWindow: 2097152,
    vocabSize: '256k (SentencePiece)',
    type: '2M Long-Context',
    isReasoning: false,
  },

  // DeepSeek (R1 & V3)
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1 (671B Reasoning MoE)',
    provider: 'DeepSeek',
    group: 'DeepSeek (R1 & V3 MoE)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '128k (BPE)',
    type: 'Open Reasoning 671B MoE',
    isReasoning: true,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3 (671B MoE)',
    provider: 'DeepSeek',
    group: 'DeepSeek (R1 & V3 MoE)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '128k (BPE)',
    type: 'General MoE Flagship',
    isReasoning: false,
  },

  // Meta LLaMA (LLaMA 3.3 / 3.2 / 3.1)
  {
    id: 'llama-3-3-70b',
    name: 'LLaMA 3.3 (70B)',
    provider: 'Meta AI',
    group: 'Meta LLaMA (3.3 & Open Frontier)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '128k (Tiktoken BPE)',
    type: 'Open Source 70B',
    isReasoning: false,
  },
  {
    id: 'llama-3-2-vision',
    name: 'LLaMA 3.2 Vision (11B / 90B)',
    provider: 'Meta AI',
    group: 'Meta LLaMA (3.3 & Open Frontier)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '128k (Tiktoken BPE)',
    type: 'Open Multimodal',
    isReasoning: false,
  },
  {
    id: 'llama-3-1-405b',
    name: 'LLaMA 3.1 (405B Flagship)',
    provider: 'Meta AI',
    group: 'Meta LLaMA (3.3 & Open Frontier)',
    encoding: 'cl100k_base',
    contextWindow: 128000,
    vocabSize: '128k (Tiktoken BPE)',
    type: 'Frontier Open 405B',
    isReasoning: false,
  }
];

const SAMPLE_TEXT_EN = `Retrieval-Augmented Generation (RAG) is an AI architecture that enhances the capabilities of Large Language Models (LLMs) by retrieving relevant facts from an external knowledge base before generating a response.

By providing models with verifiable reference material, RAG reduces hallucinations, ensures up-to-date domain knowledge, and improves citation transparency for enterprise healthcare and analytics systems.`;

const SAMPLE_TEXT_ID = `Retrieval-Augmented Generation (RAG) adalah arsitektur AI yang meningkatkan kapabilitas Large Language Model (LLM) dengan mengambil fakta relevan dari basis pengetahuan eksternal sebelum menghasilkan respons.

Dengan menyediakan materi referensi yang dapat diverifikasi, RAG mengurangi halusinasi, memastikan pengetahuan domain selalu terkini, dan meningkatkan transparansi sitasi pada sistem healthcare dan analitik.`;

export default function TokenCounter() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('gpt-4o');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const selectedModel = useMemo(() => {
    return LLM_MODELS.find((m) => m.id === selectedModelId) || LLM_MODELS[0];
  }, [selectedModelId]);

  // Cached tokenizer instances based on selected model encoding
  const tokenizer = useMemo(() => {
    try {
      return getEncoding(selectedModel.encoding);
    } catch (err) {
      console.error('Error loading tokenizer:', err);
      return null;
    }
  }, [selectedModel.encoding]);

  // Group models for select dropdown
  const modelGroups = useMemo(() => {
    const groups = {};
    LLM_MODELS.forEach((m) => {
      if (!groups[m.group]) groups[m.group] = [];
      groups[m.group].push(m);
    });
    return groups;
  }, []);

  // Dynamic SEO meta tags update
  useEffect(() => {
    const originalTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    document.title = language === 'id' 
      ? 'AI Token Counter — Penghitung Token GPT-4o, Claude 3.7, Gemini 2.0, DeepSeek | Akhmad Nizar Z.'
      : 'AI Token Counter — Free Online Token Calculator for GPT-4o, Claude 3.7, Gemini 2.0 | Akhmad Nizar Z.';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        language === 'id'
          ? 'Hitung token prompt untuk OpenAI GPT-4o, o3-mini, o1, Claude 3.7 Sonnet, DeepSeek-R1, dan Gemini 2.0 secara instan dan privat di browser.'
          : 'Free, instant token counter for OpenAI GPT-4o, o3-mini, o1, Claude 3.7 Sonnet, DeepSeek-R1, and Gemini 2.0. 100% computed client-side.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, [language]);

  // Calculate statistics
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const characters = text.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;

    let tokens = 0;
    if (text && tokenizer) {
      try {
        const encoded = tokenizer.encode(text);
        tokens = encoded.length;
      } catch (err) {
        console.error('Encoding error:', err);
        // Fallback approximation: 1 token ≈ 4 chars
        tokens = Math.ceil(characters / 4);
      }
    }

    return { tokens, characters, words, lines };
  }, [text, tokenizer]);

  // Context window percentage against selected model's true limit
  const contextPercentage = useMemo(() => {
    const maxContext = selectedModel.contextWindow;
    return Math.min(100, (stats.tokens / maxContext) * 100).toFixed(3);
  }, [stats.tokens, selectedModel.contextWindow]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.warn('Clipboard access denied, focusing textarea:', err);
      textareaRef.current?.focus();
    }
  };

  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  const handleLoadSample = () => {
    setText(language === 'id' ? SAMPLE_TEXT_ID : SAMPLE_TEXT_EN);
  };

  const handleCopyStats = async () => {
    const summary = `Model: ${selectedModel.name} | Tokens: ${stats.tokens.toLocaleString()} | Words: ${stats.words.toLocaleString()} | Characters: ${stats.characters.toLocaleString()} | Lines: ${stats.lines}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy stats failed:', err);
    }
  };

  return (
    <div className="token-counter-page">
      <Header />

      <main className="tc-main">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <div className="tc-breadcrumb">
            <Link to="/" className="tc-breadcrumb-link">
              <FiArrowLeft /> {t('tcBackToHome')}
            </Link>
            <span className="tc-breadcrumb-sep">/</span>
            <span className="tc-breadcrumb-current">AI Token Counter</span>
          </div>

          {/* Hero Header */}
          <motion.div 
            className="tc-hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="tc-badge">
              <FiZap className="tc-badge-icon" />
              <span>{t('tcBadge')}</span>
            </div>
            <h1 className="tc-title">{t('tcTitle')}</h1>
            <p className="tc-subtitle">{t('tcSubtitle')}</p>
          </motion.div>

          {/* Real-time Stats Grid */}
          <motion.div 
            className="tc-stats-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="tc-stat-card tc-stat-highlight">
              <div className="tc-stat-icon tc-icon-tokens">
                <FiZap />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">{t('tcTokens')}</span>
                <span className="tc-stat-value">{stats.tokens.toLocaleString()}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon">
                <FiAlignLeft />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">{t('tcWords')}</span>
                <span className="tc-stat-value">{stats.words.toLocaleString()}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon">
                <FiFileText />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">{t('tcCharacters')}</span>
                <span className="tc-stat-value">{stats.characters.toLocaleString()}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon">
                <FiHash />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">{t('tcLines')}</span>
                <span className="tc-stat-value">{stats.lines.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Active Model Info & Meta Specs Bar */}
          <motion.div 
            className="tc-model-specs-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tc-specs-item">
              <span className="tc-specs-label">{t('tcModelProvider')}:</span>
              <strong className="tc-specs-val">{selectedModel.provider}</strong>
            </div>
            <div className="tc-specs-item">
              <span className="tc-specs-label">{t('tcModelContext')}:</span>
              <strong className="tc-specs-val">{selectedModel.contextWindow.toLocaleString()} tokens</strong>
            </div>
            <div className="tc-specs-item">
              <span className="tc-specs-label">{t('tcModelVocab')}:</span>
              <strong className="tc-specs-val">{selectedModel.vocabSize}</strong>
            </div>
            {selectedModel.isReasoning && (
              <div className="tc-specs-badge-reasoning">
                <FiActivity /> <span>{t('tcReasoningBadge')}</span>
              </div>
            )}
          </motion.div>

          {/* Context Window Indicator Bar */}
          {stats.tokens > 0 && (
            <motion.div 
              className="tc-context-bar-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tc-context-label">
                <span>{t('tcContextUsage')} ({selectedModel.name}):</span>
                <strong>{contextPercentage}% ({stats.tokens.toLocaleString()} / {selectedModel.contextWindow.toLocaleString()} tokens)</strong>
              </div>
              <div className="tc-context-track">
                <div 
                  className="tc-context-fill" 
                  style={{ width: `${Math.max(0.5, Math.min(100, Number(contextPercentage)))}%` }} 
                />
              </div>
            </motion.div>
          )}

          {/* Main Input Card */}
          <motion.div 
            className="tc-editor-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Toolbar */}
            <div className="tc-toolbar">
              <div className="tc-encoding-selector">
                <label htmlFor="model-select">
                  <FiLayers style={{ marginRight: 4 }} /> {t('tcSelectModel')}:
                </label>
                <select
                  id="model-select"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="tc-select"
                >
                  {Object.entries(modelGroups).map(([groupName, models]) => (
                    <optgroup key={groupName} label={groupName}>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow >= 1000000 ? `${m.contextWindow / 1000000}M` : `${m.contextWindow / 1000}k`})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="tc-actions">
                <button 
                  type="button" 
                  className="tc-btn tc-btn-secondary" 
                  onClick={handleLoadSample}
                  title="Load sample AI prompt"
                >
                  <FiCpu /> {t('tcSample')}
                </button>
                <button 
                  type="button" 
                  className="tc-btn tc-btn-secondary" 
                  onClick={handlePaste}
                  title="Paste from clipboard"
                >
                  <FiClipboard /> {t('tcPaste')}
                </button>
                <button 
                  type="button" 
                  className="tc-btn tc-btn-secondary" 
                  onClick={handleCopyStats}
                  disabled={!text}
                  title="Copy token statistics"
                >
                  {copied ? <FiCheck color="var(--accent-green)" /> : <FiFileText />} 
                  {copied ? t('tcCopied') : t('tcCopyStats')}
                </button>
                <button 
                  type="button" 
                  className="tc-btn tc-btn-danger" 
                  onClick={handleClear}
                  disabled={!text}
                  title="Clear text"
                >
                  <FiTrash2 /> {t('tcClear')}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="tc-textarea-wrapper">
              <textarea
                ref={textareaRef}
                className="tc-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('tcInputPlaceholder')}
                rows={12}
                spellCheck="false"
              />
            </div>

            {/* Privacy notice banner */}
            <div className="tc-privacy-badge">
              <FiShield className="tc-privacy-icon" />
              <span>{t('tcPrivacyNotice')}</span>
            </div>
          </motion.div>

          {/* Educational SEO & Information Section */}
          <motion.section 
            className="tc-info-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="tc-info-header">
              <FiInfo className="tc-info-icon" />
              <h2>{t('tcInfoTitle')}</h2>
            </div>

            <div className="tc-info-grid">
              <div className="tc-info-card">
                <h3>{t('tcInfoWhatIsToken')}</h3>
                <p>{t('tcInfoWhatIsTokenDesc')}</p>
              </div>

              <div className="tc-info-card">
                <h3>{t('tcInfoWhyMatters')}</h3>
                <p>{t('tcInfoWhyMattersDesc')}</p>
              </div>
            </div>

            {/* Portfolio Link CTA */}
            <div className="tc-cta-box">
              <div className="tc-cta-content">
                <h3>Akhmad Nizar Zakaria</h3>
                <p>
                  {language === 'id'
                    ? 'Machine Learning Engineer & AI Data Scientist yang berspesialisasi dalam arsitektur RAG, LLM optimization, dan MLOps.'
                    : 'Machine Learning Engineer & AI Data Scientist specializing in RAG architectures, LLM optimization, and MLOps.'}
                </p>
              </div>
              <div className="tc-cta-actions">
                <Link to="/" className="btn-primary">
                  {t('tcExploreProjects')}
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
