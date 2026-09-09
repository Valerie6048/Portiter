const SITE_ORIGIN = 'https://akhmdnzr.fun';

function setMeta(name, content, attribute = 'name') {
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) element.setAttribute('content', content);
}

export function setPageSeo({ title, description, path = '/', image = '/og_image.jpg' }) {
  const url = `${SITE_ORIGIN}${path}`;
  document.title = title;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  setMeta('description', description);
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:image', `${SITE_ORIGIN}${image}`, 'property');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', `${SITE_ORIGIN}${image}`);
}

export const HOME_SEO = {
  title: 'Akhmad Nizar Z. — Portfolio',
  description: 'Akhmad Nizar Zakaria — Machine Learning Engineer and AI Data Scientist specializing in RAG systems, clinical AI, forecasting, and MLOps.',
  path: '/',
};
