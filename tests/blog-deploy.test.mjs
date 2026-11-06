import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../api/blog-deploy.mjs';
import { syncBlogDeploy, validDeployHook } from '../server/blog-deploy.mjs';

const hook = 'https://api.vercel.com/v1/integrations/deploy/project/token';

function fakeClient() {
  const updates = [];
  return { updates, from() {
    return { update(values) {
      updates.push(values);
      return {
        eq: () => ({ select: async () => ({ data: [{ id: 'job-1' }], error: null }) }),
        in: async () => ({ error: null }),
      };
    } };
  } };
}

test('deploy hook must be an HTTPS Vercel hook', () => {
  assert.equal(validDeployHook(hook), true);
  assert.equal(validDeployHook('https://example.com/v1/integrations/deploy/project/token'), false);
  assert.equal(validDeployHook('http://api.vercel.com/v1/integrations/deploy/project/token'), false);
});

test('sync claims queued jobs and marks them triggered after hook accepts the build', async () => {
  const client = fakeClient();
  const result = await syncBlogDeploy(client, hook, async (url, options) => {
    assert.equal(url, hook);
    assert.equal(options.method, 'POST');
    return { ok: true };
  });
  assert.deepEqual(result, { deployment: 'triggered', jobs: 1 });
  assert.deepEqual(client.updates.map((row) => row.status), ['processing', 'triggered']);
});

test('sync marks a failed deploy hook for retry', async () => {
  const client = fakeClient();
  await assert.rejects(syncBlogDeploy(client, hook, async () => ({ ok: false, status: 503 })), /HTTP 503/);
  assert.deepEqual(client.updates.map((row) => row.status), ['processing', 'failed']);
});

test('blog deploy endpoint requires an admin session', async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'public-anon-key';
  try {
    const response = await POST(new Request('https://portiter.example/api/blog-deploy', { method: 'POST' }));
    assert.equal(response.status, 401);
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = previousKey;
  }
});
