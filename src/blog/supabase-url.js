export function normalizeSupabaseProjectUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/\/+$/, '');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return '';
    if (path && !['/rest/v1', '/auth/v1', '/storage/v1'].includes(path)) return '';
    return url.origin;
  } catch {
    return '';
  }
}
