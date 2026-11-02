import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectDetails } from '../src/data/projectDetails.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://www.akhmdnzr.fun';
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const projects = Object.entries(projectDetails.en);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Missing ${label} in built index.html`);
  return html.replace(pattern, replacement);
}

function renderProject(id, project) {
  const url = `${origin}/project/${id}`;
  const title = `${project.title} — Akhmad Nizar Z.`;
  const description = `${project.subtitle} — ${project.title}. Portfolio project by Akhmad Nizar Zakaria.`;
  const fallback = `<div id="root"><main class="seo-fallback"><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.subtitle)}</p><p>${escapeHtml(project.usecase.content)}</p><a href="/">Back to portfolio</a></main></div>`;

  let html = template;
  html = replaceRequired(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(description)}" />`, 'description');
  html = replaceRequired(html, /<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${url}" />`, 'canonical');
  html = replaceRequired(html, /<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`, 'og:description');
  html = replaceRequired(html, /<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${url}" />`, 'og:url');
  html = replaceRequired(html, /<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`, 'twitter:description');
  html = replaceRequired(html, /<div id="root">[\s\S]*?<\/div>/, fallback, 'root fallback');
  return html;
}

for (const [id, project] of projects) {
  const folder = path.join(dist, 'project', id);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), renderProject(id, project));
}

const urls = ['/', ...projects.map(([id]) => `/project/${id}`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${origin}${url}</loc>\n  </url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(root, 'public', 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
