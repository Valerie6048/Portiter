import { createClient } from '@supabase/supabase-js';
import { ARTICLE_RESPONSE_SCHEMA, AuthFailure, authorizeAdmin, buildArticle, collectSources, makeArticlePrompt, providerJson, validateRequest } from '../server/blog-generator/article.mjs';
import { vertexExpressUrl } from '../server/blog-generator/vertex-express.mjs';

// Search, extract, and generation can take more than a minute together.
export const config = { maxDuration: 150 };

const json = (value, status = 200) => Response.json(value, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

export async function POST(request) {
  const projectUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) return json({ error: 'Supabase belum dikonfigurasi di Vercel.' }, 503);

  const authorization = request.headers.get('authorization') || '';
  const client = createClient(projectUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  try { await authorizeAdmin(client, authorization); }
  catch (error) {
    if (error instanceof AuthFailure) return json({ error: error.message }, error.status);
    console.error('Blog generator admin check failed:', error);
    return json({ error: 'Pemeriksaan admin gagal.' }, 503);
  }

  const tavilyKey = process.env.TAVILY_API_KEY;
  const gcpKey = process.env.GCP_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  if (!tavilyKey || !gcpKey) return json({ error: 'TAVILY_API_KEY atau GCP_API_KEY belum diatur di Vercel.' }, 503);

  let input;
  try {
    const body = await request.text();
    if (body.length > 4096) throw new Error('Input terlalu panjang.');
    input = validateRequest(JSON.parse(body));
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? 'Input JSON tidak valid.' : error.message }, 400);
  }

  try {
    const [categoriesResult, tagsResult] = await Promise.all([
      client.from('portiter_blog_categories').select('id,name_en,name_id'),
      client.from('portiter_blog_tags').select('id,name_en,name_id'),
    ]);
    if (categoriesResult.error || tagsResult.error) throw new Error('Kategori dan tag CMS tidak dapat dibaca.');
    const taxonomy = { categories: categoriesResult.data || [], tags: tagsResult.data || [] };

    const search = await providerJson('https://api.tavily.com/search', {
      method: 'POST', headers: { Authorization: `Bearer ${tavilyKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input.topic, search_depth: 'advanced', max_results: 7, include_answer: false, include_images: false }),
    }, 25000, 'Tavily Search');
    const searchResults = Array.isArray(search.results) ? search.results : [];
    if (searchResults.length < 3) throw new Error('Riset belum menemukan tiga sumber. Coba topik yang lebih spesifik.');
    const extraction = await providerJson('https://api.tavily.com/extract', {
      method: 'POST', headers: { Authorization: `Bearer ${tavilyKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: searchResults.slice(0, 7).map((item) => item.url), extract_depth: 'basic', format: 'markdown' }),
    }, 35000, 'Tavily Extract');
    const sources = collectSources(searchResults, extraction.results);

    const prompt = makeArticlePrompt(input, sources, taxonomy);
    const generation = await providerJson(vertexExpressUrl(geminiModel), {
      method: 'POST', headers: { 'x-goog-api-key': gcpKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: {
        responseMimeType: 'application/json', responseSchema: ARTICLE_RESPONSE_SCHEMA,
        thinkingConfig: { thinkingLevel: 'LOW' }, maxOutputTokens: 12000,
      } }),
    }, 55000, 'Gemini');
    const text = generation?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    let output;
    try { output = JSON.parse(text); }
    catch { throw new Error('Gemini mengembalikan artikel yang tidak valid. Coba lagi.'); }
    return json({ article: buildArticle(output, sources, taxonomy, input.locale) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generator gagal.';
    console.error('Blog generation failed:', message);
    return json({ error: message }, 502);
  }
}
