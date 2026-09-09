import { useEffect, useState } from 'react';
import { CATEGORIES, MENU_ITEMS, RESTAURANT_INFO } from './menuData';
import { Category, ContactInfo, MenuItem } from '../types';

const STORAGE_KEY = 'tasty-pizza-site-content-v1';
const CHANGE_EVENT = 'tasty-pizza-content-change';

export interface SiteContent {
  menuItems: MenuItem[];
  categories: Category[];
  restaurantInfo: ContactInfo;
}

export const DEFAULT_SITE_CONTENT: SiteContent = { menuItems: MENU_ITEMS, categories: CATEGORIES, restaurantInfo: RESTAURANT_INFO };

export function readSiteContent(): SiteContent {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(saved) as Partial<SiteContent>;
    return {
      menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : MENU_ITEMS,
      categories: Array.isArray(parsed.categories) ? parsed.categories : CATEGORIES,
      restaurantInfo: { ...RESTAURANT_INFO, ...(parsed.restaurantInfo ?? {}) },
    };
  } catch { return DEFAULT_SITE_CONTENT; }
}

export function saveSiteContent(content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetSiteContent() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => readSiteContent());
  useEffect(() => {
    const refresh = () => setContent(readSiteContent());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(CHANGE_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  return content;
}
