import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { ARTICLE_RESPONSE_SCHEMA, AuthFailure, authorizeAdmin, buildArticle, collectSources, makeArticlePrompt, providerJson, validateRequest } from './article.mjs';
import { vertexExpressUrl } from './vertex-express.mjs';

const allowedOrigins = new Set((Deno.env.get('BLOG_GENERATOR_ALLOWED_ORIGINS') ||
  'https://www.akhmdnzr.fun,http://localhost:5173,http://127.0.0.1:5173').split(',').map((item) => item.trim()).filter(Boolean));

function headersFor(request: Request) {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://www.akhmdnzr.fun',
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

Deno.serve(async (request: Request) => {
  const cors = headersFor(request);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: cors });
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.has(origin)) return Response.json({ error: 'Origin not allowed.' }, { status: 403, headers: cors });

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const tavilyKey = Deno.env.get('TAVILY_API_KEY');
  const gcpKey = Deno.env.get('GCP_API_KEY');
  const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-3.8-flash';
  if (!projectUrl || !anonKey || !tavilyKey || !gcpKey) {
    return Response.json({ error: 'Generator belum dikonfigurasi.' }, { status: 503, headers: cors });
  }

  const authorization = request.headers.get('authorization') || '';
  const client = createClient(projectUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  try { await authorizeAdmin(client, authorization); }
  catch (error) {
    if (error instanceof AuthFailure) return Response.json({ error: error.message }, { status: error.status, headers: cors });
    return Response.json({ error: 'Pemeriksaan admin gagal.' }, { status: 503, headers: cors });
  }

  let input;
  try { input = validateRequest(await request.json()); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Input tidak valid.' }, { status: 400, headers: cors }); }

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
      body: JSON.stringify({ urls: searchResults.slice(0, 7).map((item: { url: string }) => item.url), extract_depth: 'basic', format: 'markdown' }),
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
    const text = generation?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '';
    let output;
    try { output = JSON.parse(text); }
    catch { throw new Error('Gemini mengembalikan artikel yang tidak valid. Coba lagi.'); }
    const article = buildArticle(output, sources, taxonomy, input.locale);
    return Response.json({ article }, { headers: cors });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generator gagal.';
    console.error('Blog generation failed:', message);
    return Response.json({ error: message }, { status: 502, headers: cors });
  }
});
