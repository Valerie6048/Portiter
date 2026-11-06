import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAdmin, buildArticle, collectSources, providerJson, validateRequest } from '../supabase/functions/blog-generate/article.mjs';
import { slugCandidate, createGeneratedDraft } from '../src/admin/generated-draft.js';
import { renderContentHtml } from '../src/blog/content.js';
import { vertexExpressUrl } from '../supabase/functions/blog-generate/vertex-express.mjs';

const results = Array.from({ length: 4 }, (_, index) => ({
  url: `https://source${index + 1}.example/research`, title: `Research ${index + 1}`,
}));
const extracts = results.map((result) => ({ url: result.url, raw_content: 'Verified research content. '.repeat(15) }));
const taxonomy = { categories: [{ id: 'cat-1' }], tags: [{ id: 'tag-1' }] };
const blocks = Array.from({ length: 10 }, (_, index) => ({
  type: index === 0 ? 'heading' : 'paragraph',
  text: index === 0 ? 'Research overview' : 'A researched sentence with original explanation. '.repeat(20),
  source_ids: index === 0 ? [] : [(index % 3) + 1],
}));
const output = {
  title: 'A useful article about research', excerpt: 'A concise summary of the article and its main findings.',
  meta_title: 'A useful research article', meta_description: 'An explanation of the research findings and their practical implications.',
  category_ids: ['cat-1'], tag_ids: ['tag-1'], blocks,
};

test('validates topic and language before provider calls', () => {
  assert.deepEqual(validateRequest({ topic: '  Evaluating   RAG systems ', locale: 'id' }), { topic: 'Evaluating RAG systems', locale: 'id' });
  assert.throws(() => validateRequest({ topic: 'short', locale: 'id' }), /Topik/);
  assert.throws(() => validateRequest({ topic: 'Evaluating RAG systems', locale: 'fr' }), /bahasa/);
});

test('denies missing, expired, and non-admin user credentials', async () => {
  const expired = { auth: { getUser: async () => ({ data: null, error: new Error('Expired') }) } };
  const nonAdmin = { auth: { getUser: async () => ({ data: { user: { id: 'visitor' } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) };
  await assert.rejects(authorizeAdmin(expired, ''), (error) => error.status === 401);
  await assert.rejects(authorizeAdmin(expired, 'Bearer expired'), (error) => error.status === 401);
  await assert.rejects(authorizeAdmin(nonAdmin, 'Bearer valid'), (error) => error.status === 403);
});

test('handles provider HTTP and malformed response failures', async () => {
  await assert.rejects(providerJson('https://api.example', {}, 1000, 'Tavily', async () => ({ ok: false, status: 429 })), /HTTP 429/);
  await assert.rejects(providerJson('https://api.example', {}, 1000, 'Gemini', async () => ({ ok: true, json: async () => { throw new Error('bad json'); } })), /tidak valid/);
});

test('uses the Gemini 3.8 Flash Vertex AI express mode endpoint', () => {
  assert.equal(vertexExpressUrl(), 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent');
  assert.throws(() => vertexExpressUrl('../other-model'), /tidak valid/);
});

test('requires three readable HTTPS Tavily sources', () => {
  assert.equal(collectSources(results, extracts).length, 4);
  assert.throws(() => collectSources(results, extracts.slice(0, 2)), /tiga sumber/);
  assert.throws(() => collectSources([{ url: 'http://unsafe.example', title: 'Unsafe' }, ...results.slice(0, 2)], extracts), /tiga sumber/);
});

test('builds one-language editable article with source links and metadata', () => {
  const article = buildArticle(output, collectSources(results, extracts), taxonomy, 'id');
  assert.equal(article.locale, 'id');
  assert.equal(article.slug, 'a-useful-article-about-research');
  assert.deepEqual(article.category_ids, ['cat-1']);
  assert.equal(article.sources.length, 3);
  assert.match(JSON.stringify(article.content_json), /https:\/\/source1\.example\/research/);
  assert.match(JSON.stringify(article.content_json), /Sumber/);
  assert.ok(article.content_json.content.every((node) => node.type !== 'html'));
  const html = renderContentHtml(article.content_json);
  assert.match(html, /href="https:\/\/source1\.example\/research"/);
  assert.match(html, /<h2>Sumber<\/h2>/);
  assert.match(renderContentHtml(buildArticle(output, collectSources(results, extracts), taxonomy, 'en').content_json), /<h2>Sources<\/h2>/);
});

test('rejects invalid model output, unknown citations, and unknown taxonomy', () => {
  const sources = collectSources(results, extracts);
  assert.throws(() => buildArticle({ ...output, blocks: [] }, sources, taxonomy, 'en'), /Struktur/);
  assert.throws(() => buildArticle({ ...output, blocks: blocks.map((block, index) => index === 1 ? { ...block, source_ids: [99] } : block) }, sources, taxonomy, 'en'), /tidak dikenal/);
  assert.throws(() => buildArticle({ ...output, tag_ids: ['invented'] }, sources, taxonomy, 'en'), /tidak dikenal/);
  assert.throws(() => buildArticle({ ...output, blocks: blocks.map((block, index) => index === 1 ? { ...block, source_ids: [] } : block) }, sources, taxonomy, 'en'), /tanpa sumber/);
});

test('deduplicates slugs within the database length limit', () => {
  assert.equal(slugCandidate('research', 1), 'research');
  assert.equal(slugCandidate('research', 2), 'research-2');
  assert.equal(slugCandidate('a'.repeat(140), 12).length, 140);
});

test('saves generated locale as draft and leaves partner locale blank', async () => {
  const inserted = {};
  const baseSlug = 'a-useful-article-about-research';
  const client = { from(table) {
    if (table === 'portiter_blog_translations') return {
      select: () => ({ eq: () => ({ ilike: (_column, candidate) => ({ limit: async () => ({ data: candidate === baseSlug ? [{ id: 'existing' }] : [], error: null }) }) }) }),
      insert: async (rows) => { inserted.translations = rows; return { error: null }; },
    };
    if (table === 'portiter_blog_posts') return {
      insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'post-1' }, error: null }) }) }),
    };
    return { insert: async (rows) => { inserted[table] = rows; return { error: null }; } };
  } };
  const article = buildArticle(output, collectSources(results, extracts), taxonomy, 'id');
  assert.equal(await createGeneratedDraft(client, 'owner-1', article), 'post-1');
  assert.equal(inserted.translations[0].locale, 'id');
  assert.equal(inserted.translations[0].status, 'draft');
  assert.equal(inserted.translations[0].slug, `${baseSlug}-2`);
  assert.equal(inserted.translations[1].locale, 'en');
  assert.equal(inserted.translations[1].title, undefined);
  assert.deepEqual(inserted.portiter_blog_post_categories, [{ post_id: 'post-1', category_id: 'cat-1' }]);
});
