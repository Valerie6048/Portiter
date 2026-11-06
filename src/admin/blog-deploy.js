import { requireSupabase } from '../blog/supabase';

export async function requestBlogDeploy() {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Sesi admin berakhir. Silakan login lagi.');
  const response = await fetch('/api/blog-deploy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `Build website gagal dipicu (HTTP ${response.status}).`);
  return payload;
}
