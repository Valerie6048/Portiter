import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';

for (const [name, grammar] of Object.entries({ bash, css, html, javascript, json, python, sql, typescript, yaml })) hljs.registerLanguage(name, grammar);
hljs.registerAliases(['js'], { languageName: 'javascript' });
hljs.registerAliases(['ts'], { languageName: 'typescript' });

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export function safeContentUrl(value, { image = false } = {}) {
  const raw = String(value || '').trim();
  if (!raw || raw.startsWith('//')) return '';
  try {
    const url = new URL(raw, 'https://www.akhmdnzr.fun');
    if (image) return ['https:', 'http:'].includes(url.protocol) ? raw : '';
    if (['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) return raw;
    if (raw.startsWith('/') || raw.startsWith('#')) return raw;
  } catch {
    return raw.startsWith('/') || raw.startsWith('#') ? raw : '';
  }
  return '';
}

function renderMarks(text, marks = []) {
  return marks.reduce((value, mark) => {
    if (mark.type === 'bold') return `<strong>${value}</strong>`;
    if (mark.type === 'italic') return `<em>${value}</em>`;
    if (mark.type === 'strike') return `<s>${value}</s>`;
    if (mark.type === 'underline') return `<u>${value}</u>`;
    if (mark.type === 'code') return `<code>${value}</code>`;
    if (mark.type === 'link') {
      const href = safeContentUrl(mark.attrs?.href);
      if (!href) return value;
      const external = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${value}</a>`;
    }
    return value;
  }, escapeHtml(text));
}

function youtubeId(value) {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || '';
    }
  } catch { return ''; }
  return '';
}

function renderNode(node) {
  if (!node || typeof node !== 'object') return '';
  const children = Array.isArray(node.content) ? node.content.map(renderNode).join('') : '';
  switch (node.type) {
    case 'doc': return children;
    case 'text': return renderMarks(node.text, node.marks);
    case 'paragraph': return `<p>${children || '<br />'}</p>`;
    case 'heading': {
      const level = Math.min(4, Math.max(2, Number(node.attrs?.level) || 2));
      return `<h${level}>${children}</h${level}>`;
    }
    case 'bulletList': return `<ul>${children}</ul>`;
    case 'orderedList': return `<ol>${children}</ol>`;
    case 'listItem': return `<li>${children}</li>`;
    case 'blockquote': return `<blockquote>${children}</blockquote>`;
    case 'horizontalRule': return '<hr />';
    case 'hardBreak': return '<br />';
    case 'codeBlock': {
      const language = String(node.attrs?.language || '').replace(/[^a-z0-9_+-]/gi, '');
      const code = (node.content || []).map((part) => part.text || '').join('');
      const highlighted = hljs.getLanguage(language) ? hljs.highlight(code, { language, ignoreIllegals: true }).value : escapeHtml(code);
      return `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${highlighted}</code></pre>`;
    }
    case 'image': {
      const src = safeContentUrl(node.attrs?.src, { image: true });
      if (!src) return '';
      const alt = escapeHtml(node.attrs?.alt || '');
      const caption = String(node.attrs?.caption || '').trim();
      return `<figure><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
    }
    case 'youtube': {
      const id = youtubeId(node.attrs?.src || node.attrs?.url || '');
      if (!/^[\w-]{11}$/.test(id)) return '';
      return `<div class="blog-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Embedded YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
    }
    default: return children;
  }
}

export function renderContentHtml(content) {
  if (!content || typeof content !== 'object') return '';
  return renderNode(content);
}

export function plainTextFromContent(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text || '';
  return (node.content || []).map(plainTextFromContent).filter(Boolean).join(' ');
}

export function readTimeMinutes(content) {
  const words = plainTextFromContent(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function makeSlug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140)
    .replace(/-+$/g, '');
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}
