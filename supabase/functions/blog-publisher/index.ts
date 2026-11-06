import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.akhmdnzr.fun',
  'Access-Control-Allow-Headers': 'content-type, x-blog-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  const expectedSecret = Deno.env.get('BLOG_CRON_SECRET');
  if (!expectedSecret || request.headers.get('x-blog-cron-secret') !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const deployHookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL');
  if (!projectUrl || !serviceRoleKey || !deployHookUrl) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or VERCEL_DEPLOY_HOOK_URL.');
    return Response.json({ error: 'Publisher is not configured.' }, { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(projectUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: publishedCount, error: scheduleError } = await supabase.rpc('publish_due_blog_translations');
  if (scheduleError) {
    console.error('Scheduled publication failed:', scheduleError.message);
    return Response.json({ error: 'Scheduled publication failed.' }, { status: 500, headers: corsHeaders });
  }

  const { data: jobs, error: claimError } = await supabase.rpc('claim_blog_deploy_jobs');
  if (claimError) {
    console.error('Could not claim deployment jobs:', claimError.message);
    return Response.json({ error: 'Could not claim deployment jobs.' }, { status: 500, headers: corsHeaders });
  }
  if (!jobs?.length) {
    return Response.json({ published: publishedCount || 0, deployment: 'idle' }, { headers: corsHeaders });
  }

  const ids = jobs.map((job: { id: string }) => job.id);
  try {
    const response = await fetch(deployHookUrl, { method: 'POST', redirect: 'manual' });
    if (!response.ok) throw new Error(`Vercel Deploy Hook returned HTTP ${response.status}`);
    const { error: updateError } = await supabase.from('portiter_blog_deploy_jobs')
      .update({ status: 'triggered', processed_at: new Date().toISOString(), error_message: null })
      .in('id', ids);
    if (updateError) throw updateError;
    return Response.json({ published: publishedCount || 0, deployment: 'triggered', jobs: ids.length }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown deployment trigger error.';
    const { error: updateError } = await supabase.from('portiter_blog_deploy_jobs')
      .update({ status: 'failed', processed_at: new Date().toISOString(), error_message: message.slice(0, 500) })
      .in('id', ids);
    if (updateError) console.error('Could not mark deployment jobs as failed:', updateError.message);
    console.error('Vercel deployment trigger failed:', message);
    return Response.json({ error: message }, { status: 502, headers: corsHeaders });
  }
});
