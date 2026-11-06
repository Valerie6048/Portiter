import { createClient } from '@supabase/supabase-js';
import { AuthFailure, authorizeAdmin } from '../server/blog-generator/article.mjs';
import { syncBlogDeploy } from '../server/blog-deploy.mjs';

export async function POST(request) {
  const projectUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) return Response.json({ error: 'Supabase belum dikonfigurasi di Vercel.' }, { status: 503 });

  const authorization = request.headers.get('authorization') || '';
  const client = createClient(projectUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  try { await authorizeAdmin(client, authorization); }
  catch (error) {
    if (error instanceof AuthFailure) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: 'Pemeriksaan admin gagal.' }, { status: 503 });
  }

  try {
    const result = await syncBlogDeploy(client, process.env.VERCEL_DEPLOY_HOOK_URL);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Build website gagal dipicu.';
    console.error('Blog deploy failed:', message);
    return Response.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
