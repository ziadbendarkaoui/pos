import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timingSafeEqual } from 'node:crypto';
import worker from './index.ts';

// The integration below exercises the handler with deterministic storage doubles.
crypto.subtle.timingSafeEqual = (a, b) => timingSafeEqual(Buffer.from(a), Buffer.from(b));
function fixture() {
  let row = null;
  const photos = new Map();
  const env = {
    ADMIN_PASSWORD: 'test-only-password',
    ASSETS: { fetch: async () => new Response('site') },
    MENU_IMAGES: { put: async (key, value) => photos.set(key, value), get: async key => photos.get(key) ?? null },
    CONTENT_DB: { prepare(sql) { let args = []; return {
      bind(...values) { args = values; return this; },
      async first() { return row; },
      async run() {
        const canWrite = sql.startsWith('INSERT') ? !row : row?.revision === args[2];
        if (canWrite) row = { content: args[0], revision: (row?.revision ?? 0) + 1 };
        return { meta: { changes: canWrite ? 1 : 0 } };
      },
    }; } },
  };
  const call = (path, init = {}) => worker.fetch(new Request(`https://pos.ziadbendarkaoui.workers.dev/api/${path}`, init), env);
  const put = payload => call('content', { method: 'PUT', headers: { Authorization: 'Bearer test-only-password' }, body: JSON.stringify(payload) });
  return { env, call, put };
}
test('public catalogue, authenticated publication, persistence and stale revision protection', async () => {
  const { call, put } = fixture();
  const initial = await (await call('content')).json();
  assert.ok(initial.content.menuItems.length > 20);
  assert.equal(initial.revision, 0);
  const blocked = await call('content', { method: 'PUT', body: JSON.stringify(initial) });
  assert.equal(blocked.status, 401);
  initial.content.menuItems[0].nameFr = 'Pizza test';
  const saved = await put(initial);
  assert.equal(saved.status, 200);
  const latest = await (await call('content')).json();
  assert.equal(latest.content.menuItems[0].nameFr, 'Pizza test');
  assert.equal(latest.revision, 1);
  assert.equal((await put(initial)).status, 409);
  latest.content.menuItems[0].prices = { petite: -5, moyenne: 50, grande: 100 };
  assert.equal((await put(latest)).status, 400);
});
test('origin restrictions, preflight, fail-closed secret and photo validation', async () => {
  const { env, call } = fixture();
  assert.equal((await call('content', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  const preflight = await call('content', { method: 'OPTIONS', headers: { Origin: 'https://ziadbendarkaoui.github.io' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://ziadbendarkaoui.github.io');
  assert.equal((await call('images', { method: 'POST', headers: { Authorization: 'Bearer test-only-password', 'Content-Type': 'image/webp' }, body: 'invalid image' })).status, 400);
  delete env.ADMIN_PASSWORD;
  assert.equal((await call('content', { method: 'PUT' })).status, 503);
});
