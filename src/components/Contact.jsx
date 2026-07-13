import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineLocationMarker, HiOutlineMail } from 'react-icons/hi';
import { FiLinkedin, FiGithub } from 'react-icons/fi';

export default function Contact() {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('akhmad.nizar021@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          const Tag = c.href ? 'a' : 'div';
          const onClick = isEmail ? handleEmailClick : undefined;
          const linkProps = c.href
            ? { 
                href: c.href, 
                target: c.href.startsWith('http') ? '_blank' : undefined, 
                rel: 'noopener noreferrer',
                onClick
              }
            : {};
          return (
            <Tag className="contact-card" key={i} {...linkProps}>
              <div className="contact-icon">{c.icon}</div>
              <span>{isEmail && copied ? (language === 'id' ? 'Tersalin!' : 'Copied!') : c.label}</span>
            </Tag>
          );
        })}
      </motion.div>
    </section>
  );
}
