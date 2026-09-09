import React from 'react';
import { Plus } from 'lucide-react';
import { Language, MenuItem } from '../types';

interface CompactProductCardProps {
  item: MenuItem;
  lang: Language;
  onSelect: (item: MenuItem) => void;
}

const getStartingPrice = (item: MenuItem) =>
  item.prices ? Math.min(...Object.values(item.prices)) : item.singlePrice ?? 0;

export const CompactProductCard: React.FC<CompactProductCardProps> = ({ item, lang, onSelect }) => {
  const name = lang === 'fr' ? item.nameFr : item.nameAr;
  const description = lang === 'fr' ? item.descriptionFr : item.descriptionAr;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex min-h-[132px] w-full items-stretch overflow-hidden rounded-2xl border border-white/10 bg-[#151515] text-start shadow-lg transition hover:-translate-y-0.5 hover:border-[#FFD800]/40 hover:bg-[#191919] focus:outline-none focus:ring-2 focus:ring-[#FFD800]"
      aria-label={`${name}, ${getStartingPrice(item)} DH`}
    >
      <span className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <span>
          {(item.badgeFr || item.badgeAr) && (
            <span className="mb-1.5 inline-block text-[9px] font-black uppercase tracking-widest text-[#FFD800]">
              {lang === 'fr' ? item.badgeFr : item.badgeAr}
            </span>
          )}
          <span className="block text-base font-black leading-tight text-white sm:text-lg">{name}</span>
          {description && (
            <span className="mt-1.5 line-clamp-2 block text-[11px] leading-relaxed text-white/50 sm:text-xs">
              {description}
            </span>
          )}
        </span>
        <span className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-black text-[#FFD800]">
            {item.prices && (lang === 'fr' ? 'Dès ' : 'ابتداءً من ')}{getStartingPrice(item)} DH
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C81024] text-white transition group-hover:bg-[#FFD800] group-hover:text-black">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="relative w-[116px] shrink-0 overflow-hidden bg-neutral-900 sm:w-[145px]">
        <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </span>
    </button>
  );
};
