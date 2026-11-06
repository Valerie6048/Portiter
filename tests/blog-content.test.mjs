import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSlug, plainTextFromContent, readTimeMinutes, renderContentHtml, safeContentUrl, safeJsonLd } from '../src/blog/content.js';
import { fetchAllRows } from '../src/blog/pagination.js';
import { normalizeSupabaseProjectUrl } from '../src/blog/supabase-url.js';

test('renders text and captions as escaped HTML', () => {
  const html = renderContentHtml({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: '<script>alert("x")</script>' }] },
      { type: 'image', attrs: { src: '/cover.webp', alt: 'cover', caption: '<img src=x onerror=alert(1)>' } },
    ],
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('drops unsafe link and image schemes', () => {
  const html = renderContentHtml({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'unsafe', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] },
      { type: 'image', attrs: { src: 'data:image/svg+xml,<svg onload=alert(1)>', alt: 'bad' } },
    ],
  });
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /onload/i);
  assert.doesNotMatch(html, /<img/);
});

test('allows only recognized YouTube video embeds', () => {
  const valid = renderContentHtml({ type: 'youtube', attrs: { src: 'https://youtu.be/dQw4w9WgXcQ' } });
  const invalid = renderContentHtml({ type: 'youtube', attrs: { src: 'https://example.com/embed/dQw4w9WgXcQ' } });
  assert.match(valid, /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
  assert.equal(invalid, '');
});

test('normalizes slugs and estimates reading time', () => {
  assert.equal(makeSlug('  AI, Data & Café!  '), 'ai-data-cafe');
  const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: Array(221).fill('word').join(' ') }] }] };
  assert.equal(plainTextFromContent(content).split(' ').length, 221);
  assert.equal(readTimeMinutes(content), 2);
});

test('escapes JSON-LD script delimiters', () => {
  assert.equal(safeJsonLd({ headline: '</script><script>' }), '{"headline":"\\u003c/script\\u003e\\u003cscript\\u003e"}');
  assert.equal(safeContentUrl('//evil.example'), '');
});

test('renders syntax highlighting without interpreting code as HTML', () => {
  const html = renderContentHtml({ type: 'codeBlock', attrs: { language: 'javascript' }, content: [{ type: 'text', text: 'const answer = "<script>";' }] });
  assert.match(html, /hljs-keyword/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test('paginates CMS reads beyond the default API row cap', async () => {
  const expected = Array.from({ length: 1001 }, (_, id) => ({ id }));
  const actual = await fetchAllRows(() => ({ range: async (from, to) => ({ data: expected.slice(from, to + 1), error: null }) }), 'rows');
  assert.deepEqual(actual, expected);
});

test('uses the project origin when a REST endpoint is pasted as Supabase URL', () => {
  assert.equal(normalizeSupabaseProjectUrl('https://example.supabase.co/rest/v1/'), 'https://example.supabase.co');
  assert.equal(normalizeSupabaseProjectUrl('https://example.supabase.co/'), 'https://example.supabase.co');
  assert.equal(normalizeSupabaseProjectUrl('https://example.supabase.co/dashboard/project'), '');
});
