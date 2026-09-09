import React, { useEffect, useRef } from 'react';
import { Award, Box, CupSoda, Disc, Flame, Info, Layers, Pizza, PlusCircle, Sandwich, Search, Soup, Sparkles, Utensils, X } from 'lucide-react';
import { Category, CategoryId, Language } from '../types';

type CatalogueSectionId = CategoryId | 'popular';
interface CategoryNavProps { categories: Category[]; activeCategory: CatalogueSectionId; onSelectCategory: (id: CatalogueSectionId) => void; searchQuery: string; onSearchChange: (query: string) => void; lang: Language; totalResultsCount?: number; }

const iconMap: Record<string, React.ReactNode> = {
  Pizza: <Pizza className="h-4 w-4" />, Flame: <Flame className="h-4 w-4" />, Sandwich: <Sandwich className="h-4 w-4" />, Utensils: <Utensils className="h-4 w-4" />, Disc: <Disc className="h-4 w-4" />, Layers: <Layers className="h-4 w-4" />, Box: <Box className="h-4 w-4" />, Sparkles: <Sparkles className="h-4 w-4" />, Soup: <Soup className="h-4 w-4" />, CupSoda: <CupSoda className="h-4 w-4" />, PlusCircle: <PlusCircle className="h-4 w-4" />, Info: <Info className="h-4 w-4" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onSelectCategory, searchQuery, onSearchChange, lang, totalResultsCount }) => {
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>(`[data-category="${activeCategory}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory]);

  const entries = [{ id: 'popular' as const, nameFr: 'Populaires', nameAr: 'الأكثر طلباً', iconName: 'Award' }, ...categories];
  return <div className="sticky top-20 z-40 w-full border-y border-white/10 bg-[#090909]/95 shadow-xl backdrop-blur" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-1.5 sm:px-6">
      <div className="relative w-full max-w-[285px] sm:max-w-xs"><Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" /><input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder={lang === 'fr' ? 'Rechercher…' : 'بحث…'} className="h-9 w-full rounded-full border border-white/10 bg-white/5 ps-8 pe-8 text-xs text-white outline-none focus:border-[#FFD800]" />{searchQuery && <button type="button" onClick={() => onSearchChange('')} className="absolute end-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white/50" aria-label={lang === 'fr' ? 'Effacer' : 'مسح'}><X className="h-3.5 w-3.5" /></button>}</div>
      {searchQuery && <span className="hidden shrink-0 rounded-full bg-[#FFD800]/10 px-3 py-1 text-xs font-bold text-[#FFD800] sm:block">{totalResultsCount ?? 0}</span>}
    </div>
    <nav ref={navRef} className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-2 sm:px-6" aria-label={lang === 'fr' ? 'Catégories du menu' : 'فئات القائمة'}>{entries.map((entry) => { const active = activeCategory === entry.id && !searchQuery; return <button type="button" data-category={entry.id} key={entry.id} onClick={() => onSelectCategory(entry.id)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-black transition ${active ? 'border-[#FFD800] bg-[#C81024] text-white shadow' : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'}`} aria-current={active ? 'true' : undefined}><span className={active ? 'text-[#FFD800]' : ''}>{entry.iconName === 'Award' ? <Award className="h-4 w-4" /> : iconMap[entry.iconName]}</span>{lang === 'fr' ? entry.nameFr : entry.nameAr}</button>; })}</nav>
  </div>;
};
