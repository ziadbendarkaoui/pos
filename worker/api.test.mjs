import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timingSafeEqual } from 'node:crypto';
import worker from './index.ts';

// The integration below exercises the handler with deterministic storage doubles.
crypto.subtle.timingSafeEqual = (a, b) => timingSafeEqual(Buffer.from(a), Buffer.from(b));
function fixture() {
  let row = null;
  let passwordHash = null;
  const photos = new Map();
  const env = {
    ASSETS: { fetch: async () => new Response('site') },
    MENU_IMAGES: { put: async (key, value) => photos.set(key, value), get: async key => photos.get(key) ?? null },
    CONTENT_DB: { prepare(sql) { let args = []; return {
      bind(...values) { args = values; return this; },
      async first() {
        if (sql.includes('admin_settings')) return passwordHash ? { value: passwordHash } : null;
        return row;
      },
      async run() {
        if (sql.startsWith('INSERT OR IGNORE INTO admin_settings')) {
          if (!passwordHash) passwordHash = args[1];
          return { meta: { changes: passwordHash === args[1] ? 1 : 0 } };
        }
        if (sql.startsWith('UPDATE admin_settings')) {
          passwordHash = args[0];
          return { meta: { changes: 1 } };
        }
        const canWrite = sql.startsWith('INSERT') ? !row : row?.revision === args[2];
        if (canWrite) row = { content: args[0], revision: (row?.revision ?? 0) + 1 };
        return { meta: { changes: canWrite ? 1 : 0 } };
      },
    }; } },
  };
  const call = (path, init = {}) => worker.fetch(new Request(`https://pos.ziadbendarkaoui.workers.dev/api/${path}`, init), env);
  const put = (payload, password = '1234') => call('content', { method: 'PUT', headers: { Authorization: `Bearer ${password}` }, body: JSON.stringify(payload) });
  return { env, call, put };
}
test('public catalogue, authenticated publication, password change and stale revision protection', async () => {
  const { call, put } = fixture();
  const initial = await (await call('content')).json();
  assert.ok(initial.content.menuItems.length > 20);
  assert.equal(initial.revision, 0);
  const blocked = await call('content', { method: 'PUT', body: JSON.stringify(initial) });
  assert.equal(blocked.status, 401);
  initial.content.menuItems[0].nameFr = 'Pizza test';
  const saved = await put(initial);
  assert.equal(saved.status, 200);
  assert.equal((await call('admin/password', { method: 'POST', headers: { Authorization: 'Bearer 1234', 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: '5678' }) })).status, 200);
  assert.equal((await put({ ...initial, revision: 1 })).status, 401);
  const latest = await (await call('content')).json();
  assert.equal(latest.content.menuItems[0].nameFr, 'Pizza test');
  assert.equal(latest.revision, 1);
  assert.equal((await put(initial, '5678')).status, 409);
  latest.content.menuItems[0].prices = { petite: -5, moyenne: 50, grande: 100 };
  assert.equal((await put(latest, '5678')).status, 400);
});
test('origin restrictions, preflight, password validation and photo validation', async () => {
  const { call } = fixture();
  assert.equal((await call('content', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  const preflight = await call('content', { method: 'OPTIONS', headers: { Origin: 'https://ziadbendarkaoui.github.io' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://ziadbendarkaoui.github.io');
  assert.equal((await call('images', { method: 'POST', headers: { Authorization: 'Bearer 1234', 'Content-Type': 'image/webp' }, body: 'invalid image' })).status, 400);
  assert.equal((await call('admin/password', { method: 'POST', headers: { Authorization: 'Bearer 1234', 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: '12' }) })).status, 400);
});
