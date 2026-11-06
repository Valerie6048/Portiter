export function validDeployHook(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'api.vercel.com'
      && url.pathname.startsWith('/v1/integrations/deploy/') && !url.username && !url.password;
  } catch { return false; }
}

export async function syncBlogDeploy(client, hookUrl, fetcher = fetch) {
  if (!validDeployHook(hookUrl)) throw new Error('VERCEL_DEPLOY_HOOK_URL belum valid di Vercel.');
  const { data: jobs, error: claimError } = await client.from('portiter_blog_deploy_jobs')
    .update({ status: 'processing', claimed_at: new Date().toISOString() })
    .eq('status', 'queued').select('id');
  if (claimError) throw new Error(`Antrean build tidak dapat dibaca: ${claimError.message}`);
  if (!jobs?.length) return { deployment: 'idle', jobs: 0 };

  const ids = jobs.map((job) => job.id);
  try {
    const response = await fetcher(hookUrl, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Deploy Hook gagal (HTTP ${response.status}).`);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Deploy Hook tidak merespons.';
    await client.from('portiter_blog_deploy_jobs').update({
      status: 'failed', processed_at: new Date().toISOString(), error_message: message.slice(0, 500),
    }).in('id', ids);
    throw new Error(message, { cause });
  }
  const { error } = await client.from('portiter_blog_deploy_jobs').update({
    status: 'triggered', processed_at: new Date().toISOString(), error_message: null,
  }).in('id', ids);
  if (error) throw new Error(`Build sudah dipicu, tetapi status antrean gagal diperbarui: ${error.message}`);
  return { deployment: 'triggered', jobs: ids.length };
}
