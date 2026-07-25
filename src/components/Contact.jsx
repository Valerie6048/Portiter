import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineLocationMarker, HiOutlineMail } from 'react-icons/hi';
import { FiLinkedin, FiGithub } from 'react-icons/fi';

export default function Contact() {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);


  const contacts = [
    {
      icon: <HiOutlineLocationMarker />,
      label: t('contactLocation'),
      href: null,
    },
    {
      icon: <HiOutlineMail />,
      label: t('contactEmail'),
      href: 'mailto:akhmad.nizar021@gmail.com',
    },
    {
      icon: <FiLinkedin />,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/akhmad-nizar-zakaria-8a692b229/',
    },
    {
      icon: <FiGithub />,
      label: 'GitHub',
      href: 'https://github.com/Valerie6048',
    },
  ];

  return (
    <section className="contact-section" id="contact">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t('contactTitle')}
      </motion.h2>
      <motion.p
        className="contact-sub"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {t('contactSubtitle')}
      </motion.p>

      <motion.div
        className="contact-cards"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {contacts.map((c, i) => {
          const isEmail = c.href && c.href.startsWith('mailto:');
          
          if (isEmail) {
            return (
              <div className="contact-email-wrapper" key={i} style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <a href={c.href} className="contact-card" style={{ flex: 1 }}>
                  <div className="contact-icon">{c.icon}</div>
                  <span>{c.label}</span>
                </a>
                <button 
                  className="contact-card" 
                  onClick={() => {
                    navigator.clipboard.writeText('akhmad.nizar021@gmail.com');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ flex: 'none', padding: '0 24px', cursor: 'pointer' }}
                  title="Copy Email"
                >
                  <span>{copied ? (language === 'id' ? 'Tersalin! ✨' : 'Copied! ✨') : (language === 'id' ? 'Salin' : 'Copy')}</span>
                </button>
              </div>
            );
          }

          const Tag = c.href ? 'a' : 'div';
          const linkProps = c.href
            ? { 
                href: c.href, 
                target: c.href.startsWith('http') ? '_blank' : undefined, 
                rel: 'noopener noreferrer'
              }
            : {};
          return (
            <Tag className="contact-card" key={i} {...linkProps}>
              <div className="contact-icon">{c.icon}</div>
              <span>{c.label}</span>
            </Tag>
          );
        })}
      </motion.div>
    </section>
  );
}
