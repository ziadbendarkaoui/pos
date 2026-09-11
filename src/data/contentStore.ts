import { useEffect, useState } from 'react';
import { CATEGORIES, COMBO_DEALS, MENU_ITEMS, PIZZA_SUPPLEMENTS, RESTAURANT_INFO } from './menuData';
import type { SiteContent } from '../types';
export type { SiteContent } from '../types';

const STORAGE_KEY = 'tasty-pizza-site-content-v1';
const CHANGE_EVENT = 'tasty-pizza-content-change';
const CACHE_KEY = 'tasty-pizza-published-content-v2';
export const API_ORIGIN = typeof location !== 'undefined' && location.hostname === 'ziadbendarkaoui.github.io'
  ? 'https://pos.ziadbendarkaoui.workers.dev' : '';
let published: SiteContent | undefined;
let loading: Promise<ContentSnapshot> | undefined;
export interface ContentSnapshot { content: SiteContent; revision: number }

export const DEFAULT_SITE_CONTENT: SiteContent = { menuItems: MENU_ITEMS, categories: CATEGORIES, comboDeals: COMBO_DEALS, pizzaSupplements: PIZZA_SUPPLEMENTS, restaurantInfo: RESTAURANT_INFO };

export function readSiteContent(): SiteContent {
  if (published) return published;
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (!saved) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(saved) as Partial<SiteContent>;
    return {
      menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : MENU_ITEMS,
      categories: Array.isArray(parsed.categories) ? parsed.categories : CATEGORIES,
      comboDeals: Array.isArray(parsed.comboDeals) ? parsed.comboDeals : COMBO_DEALS,
      pizzaSupplements: Array.isArray(parsed.pizzaSupplements) ? parsed.pizzaSupplements : PIZZA_SUPPLEMENTS,
      restaurantInfo: { ...RESTAURANT_INFO, ...(parsed.restaurantInfo ?? {}) },
    };
  } catch { return DEFAULT_SITE_CONTENT; }
}

export function saveSiteContent(content: SiteContent) {
  published = content;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(content)); } catch { /* Published data remains in memory if storage is full. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readLegacyContent(): SiteContent | null {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : null; } catch { return null; }
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${API_ORIGIN}/api/${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('La synchronisation en ligne n’est pas disponible sur cette adresse.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Publication impossible. Réessayez.');
  return data;
}

async function imageDataUrlToWebpBlob(dataUrl: string) {
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Image illisible.')); image.src = dataUrl; });
  const scale = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Optimisation image impossible.');
  context.drawImage(image, 0, 0, width, height);
  let quality = 0.82;
  let blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
  while (blob && blob.size > 1024 * 1024 && quality > 0.45) {
    quality -= 0.08;
    blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
  }
  if (!blob || blob.type !== 'image/webp') throw new Error('Photo WebP invalide.');
  if (blob.size > 1024 * 1024) throw new Error('Photo trop volumineuse après optimisation.');
  return blob;
}

export function loadOnlineContent(): Promise<ContentSnapshot> {
  if (!loading) loading = api('content').then((data: ContentSnapshot) => {
    if (!data.content || !Array.isArray(data.content.menuItems) || !Array.isArray(data.content.categories) || !Array.isArray(data.content.comboDeals) || !Array.isArray(data.content.pizzaSupplements) || !data.content.restaurantInfo || !Number.isSafeInteger(data.revision)) throw new Error('Réponse du serveur invalide.');
    saveSiteContent(data.content);
    return data;
  }).finally(() => { loading = undefined; });
  return loading;
}

export async function publishSiteContent(content: SiteContent, revision: number, password: string): Promise<ContentSnapshot> {
  if (!password) throw new Error('Saisissez le mot de passe administrateur.');
  const prepared = structuredClone(content);
  for (const item of prepared.menuItems) {
    if (!item.image.startsWith('data:')) continue;
    const blob = await imageDataUrlToWebpBlob(item.image);
    const uploaded = await api('images', { method: 'POST', headers: { 'Content-Type': 'image/webp', Authorization: `Bearer ${password}` }, body: blob });
    item.image = uploaded.url;
  }
  const result = await api('content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` }, body: JSON.stringify({ content: prepared, revision }) });
  saveSiteContent(result.content);
  return result;
}

export async function loginAdmin(password: string) {
  if (!password) throw new Error('Saisissez le mot de passe administrateur.');
  await api('admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
    body: JSON.stringify({}),
  });
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  if (!currentPassword) throw new Error('Saisissez le mot de passe actuel.');
  if (newPassword.trim().length < 4) throw new Error('Le nouveau mot de passe doit contenir au moins 4 caractères.');
  await api('admin/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentPassword}` },
    body: JSON.stringify({ newPassword: newPassword.trim() }),
  });
}

export function resetSiteContent() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CACHE_KEY);
  published = undefined;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => readSiteContent());
  useEffect(() => {
    const refresh = () => setContent(readSiteContent());
    const sync = () => { if (document.visibilityState !== 'hidden') void loadOnlineContent().catch(() => {}); };
    sync();
    const timer = window.setInterval(sync, 30000);
    window.addEventListener('focus', sync);
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', sync); window.removeEventListener(CHANGE_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  return content;
}
