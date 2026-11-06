import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../api/blog-generate.mjs';

test('Vercel generator rejects a request without an admin session before calling providers', async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'public-anon-key';
  try {
    const response = await POST(new Request('https://portiter.example/api/blog-generate', {
      method: 'POST', body: JSON.stringify({ topic: 'A valid article topic', locale: 'id' }),
    }));
    assert.equal(response.status, 401);
    assert.match((await response.json()).error, /Login admin/);
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = previousKey;
  }
});
