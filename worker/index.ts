import { CATEGORIES, MENU_ITEMS, RESTAURANT_INFO } from '../src/data/menuData';
import type { SiteContent, ContactInfo } from '../src/types';

const defaults = { menuItems: MENU_ITEMS, categories: CATEGORIES, restaurantInfo: RESTAURANT_INFO };
const allowedOrigins = ['https://ziadbendarkaoui.github.io', 'https://pos.ziadbendarkaoui.workers.dev'];
const initialAdminPassword = '1234';

function validContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== 'object') return false;
  const c = value as SiteContent;
  const text = (v: unknown) => typeof v === 'string' && v.length <= 10000;
  const price = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100000;
  if (!Array.isArray(c.categories) || !c.categories.length || c.categories.length > 50 ||
      !c.categories.every(x => x && text(x.id) && text(x.nameFr) && text(x.nameAr) && text(x.iconName))) return false;
  const ids = new Set(c.categories.map(x => x.id));
  if (ids.size !== c.categories.length || !Array.isArray(c.menuItems) || !c.menuItems.length || c.menuItems.length > 500) return false;
  if (new Set(c.menuItems.map(x => x?.id)).size !== c.menuItems.length) return false;
  if (!c.menuItems.every(x => x && text(x.id) && text(x.nameFr) && text(x.nameAr) && ids.has(x.categoryId) &&
    text(x.image) && (/^(https:\/\/|\/?assets\/|\/api\/images\/)/.test(x.image)) &&
    (x.descriptionFr === undefined || text(x.descriptionFr)) && (x.descriptionAr === undefined || text(x.descriptionAr)) &&
    (x.isAvailable === undefined || typeof x.isAvailable === 'boolean') &&
    (x.prices ? (['petite','moyenne','grande'] as const).every(s => price(x.prices?.[s])) : price(x.singlePrice)))) return false;
  return !!c.restaurantInfo && (Object.keys(RESTAURANT_INFO) as (keyof ContactInfo)[]).every(k => text(c.restaurantInfo[k])) &&
    (['instagram','facebook','mapsUrl'] as const).every(k => /^https:\/\//.test(c.restaurantInfo[k]));
}

async function boundedBody(request: Request, max: number) {
  if (Number(request.headers.get('Content-Length')) > max) throw new Error('too-large');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); throw new Error('too-large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function sha256Hex(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function getAdminPasswordHash(env: Env) {
  const row = await env.CONTENT_DB.prepare('SELECT value FROM admin_settings WHERE key = ?').bind('password_hash').first<{ value: string }>();
  if (row?.value) return row.value;
  const hash = await sha256Hex(initialAdminPassword);
  await env.CONTENT_DB.prepare('INSERT OR IGNORE INTO admin_settings (key, value, updated_at) VALUES (?, ?, ?)').bind('password_hash', hash, new Date().toISOString()).run();
  return hash;
}

async function verifyAdminPassword(env: Env, password: string) {
  const [provided, expected] = await Promise.all([sha256Hex(password), getAdminPasswordHash(env)]);
  return crypto.subtle.timingSafeEqual(new TextEncoder().encode(provided), new TextEncoder().encode(expected));
}

function validAdminPassword(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 4 && value.length <= 128;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    const origin = request.headers.get('Origin');
    const allowed = !origin || origin === url.origin || allowedOrigins.includes(origin);
    const headers: Record<string,string> = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && allowed) headers['Access-Control-Allow-Origin'] = origin;
    const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
    if (!allowed) return json({ error: 'Origine non autorisée.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers,
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    try {
      if (request.method === 'GET' && url.pathname.startsWith('/api/images/')) {
        const id = url.pathname.slice('/api/images/'.length);
        if (!/^[a-f0-9-]{36}\.webp$/.test(id)) return json({ error: 'Photo introuvable.' }, 404);
        const image = await env.MENU_IMAGES.get(id, 'stream');
        if (!image) return json({ error: 'Photo introuvable.' }, 404);
        return new Response(image, { headers: { ...headers, 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } });
      }
      if (url.pathname !== '/api/content' && url.pathname !== '/api/images' && url.pathname !== '/api/admin/password') return json({ error: 'Introuvable.' }, 404);
      if (request.method === 'GET' && url.pathname === '/api/content') {
        const row = await env.CONTENT_DB.prepare('SELECT content, revision FROM site_content WHERE id = 1').first<{content: string; revision: number}>();
        const content: SiteContent = row ? JSON.parse(row.content) : structuredClone(defaults);
        content.menuItems = content.menuItems.map(item => ({ ...item, image: new URL(item.image, url.origin).href }));
        return json({ content, revision: row?.revision ?? 0 });
      }
      const password = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
      if (!await verifyAdminPassword(env, password)) return json({ error: 'Mot de passe incorrect.' }, 401);
      if (request.method === 'POST' && url.pathname === '/api/admin/password') {
        const bytes = await boundedBody(request, 8 * 1024);
        let payload: { newPassword?: unknown };
        try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'JSON invalide.' }, 400); }
        if (!validAdminPassword(payload.newPassword)) return json({ error: 'Le nouveau mot de passe doit contenir au moins 4 caractères.' }, 400);
        await env.CONTENT_DB.prepare('UPDATE admin_settings SET value = ?, updated_at = ? WHERE key = ?').bind(await sha256Hex(payload.newPassword.trim()), new Date().toISOString(), 'password_hash').run();
        return json({ ok: true });
      }
      if (request.method === 'POST' && url.pathname === '/api/images') {
        if (request.headers.get('Content-Type') !== 'image/webp') return json({ error: 'Photo WebP requise.' }, 415);
        const bytes = await boundedBody(request, 1024 * 1024);
        const signature = new TextDecoder().decode(bytes.slice(0, 12));
        if (!signature.startsWith('RIFF') || signature.slice(8) !== 'WEBP') return json({ error: 'Photo WebP invalide.' }, 400);
        const id = `${crypto.randomUUID()}.webp`;
        await env.MENU_IMAGES.put(id, bytes);
        return json({ url: `${url.origin}/api/images/${id}` }, 201);
      }
      if (request.method !== 'PUT' || url.pathname !== '/api/content') return json({ error: 'Méthode non autorisée.' }, 405);
      const bytes = await boundedBody(request, 512 * 1024);
      let payload: { content: unknown; revision: number };
      try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'JSON invalide.' }, 400); }
      if (!payload || !Number.isSafeInteger(payload.revision) || payload.revision < 0 || !validContent(payload.content)) return json({ error: 'Contenu invalide : vérifiez les prix, les photos et les liens.' }, 400);
      const content = JSON.stringify(payload.content);
      const updated = new Date().toISOString();
      const result = payload.revision === 0
        ? await env.CONTENT_DB.prepare('INSERT OR IGNORE INTO site_content (id, content, revision, updated_at) VALUES (1, ?, 1, ?)').bind(content, updated).run()
        : await env.CONTENT_DB.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updated_at = ? WHERE id = 1 AND revision = ?').bind(content, updated, payload.revision).run();
      if (result.meta.changes !== 1) return json({ error: 'Le contenu a changé sur un autre appareil. Rechargez la version en ligne avant de publier.' }, 409);
      return json({ content: payload.content, revision: payload.revision + 1 });
    } catch (error) {
      if (error instanceof Error && error.message === 'too-large') return json({ error: 'Fichier trop volumineux.' }, 413);
      console.error(JSON.stringify({ message: 'Content API failed', path: url.pathname }));
      return json({ error: 'Synchronisation indisponible. Vos modifications ne sont pas publiées.' }, 503);
    }
  },
} satisfies ExportedHandler<Env>;
