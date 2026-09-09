import React, { useState } from 'react';
import { Eye, Sparkles, Flame, Tag } from 'lucide-react';
import { MenuItem, Language } from '../types';

interface ProductCardProps {
  item: MenuItem;
  lang: Language;
  categoryName: string;
  onViewDetails: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  lang,
  categoryName,
  onViewDetails,
}) => {
  const [imgError, setImgError] = useState(false);
  const isRtl = lang === 'ar';

  const isSignature = item.badgeType === 'signature';

  return (
    <div
      id={`product-${item.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`bg-[#1a1a1a] rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-xl ${
        isSignature
          ? 'border-2 border-[#C81024] shadow-2xl'
          : 'border border-white/5 hover:border-white/20'
      }`}
    >
      {/* Product Image Area in Sleek Interface */}
      <div className="h-48 sm:h-52 bg-gray-900 relative overflow-hidden">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.nameFr}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-400 p-4 text-center">
            <Flame className="w-10 h-10 text-[#C81024] mb-2" />
            <span className="font-bold text-white text-base tracking-wide">
              {item.nameFr}
            </span>
          </div>
        )}

        {/* Top Left Badge (Signature / Hot / Veggie) */}
        {(item.badgeFr || item.badgeAr) && (
          <div className="absolute top-4 left-4 z-20">
            <span
              className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow ${
                isSignature
                  ? 'bg-[#C81024] text-white animate-pulse'
                  : 'bg-[#FFD800] text-black font-extrabold'
              }`}
            >
              {lang === 'fr' ? item.badgeFr : item.badgeAr}
            </span>
          </div>
        )}

        {/* Top Right Highlight Price Badge as in Sleek Interface */}
        <span className="absolute top-4 right-4 z-20 bg-[#FFD800] text-black text-xs font-black px-3 py-1 rounded-full shadow">
          {item.singlePrice
            ? `${item.singlePrice} DH`
            : item.prices
            ? `${item.prices.moyenne} DH`
            : ''}
        </span>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-4 z-20">
          <span className="text-[10px] font-bold text-white/70 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Card Content in Sleek Interface */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Titles & Description */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-2 mb-1">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#FFD800] transition-colors">
              {item.nameFr}
            </h3>
            <span className="text-xs opacity-40 italic font-arabic sm:shrink-0">
              {item.nameAr}
            </span>
          </div>

          {/* Short description */}
          {item.descriptionFr && (
            <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mt-1">
              {lang === 'fr' ? item.descriptionFr : item.descriptionAr}
            </p>
          )}
        </div>

        {/* Prices & Formats Section */}
        <div className="pt-2 border-t border-white/5">
          {item.prices ? (
            /* 3 Formats for Pizzas (Petite / Moyenne / Grande) in Sleek Interface */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/40 tracking-wider">
                <span>{lang === 'fr' ? 'Formats' : 'الأحجام'}</span>
                <span>{lang === 'fr' ? 'Prix (DH)' : 'الأسعار'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">
                    {lang === 'fr' ? 'Petite' : 'صغيرة'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {item.prices.petite} <span className="text-[10px] text-[#FFD800]">DH</span>
                  </span>
                </div>
                <div className="bg-[#C81024]/10 border border-[#C81024]/40 rounded-xl p-2">
                  <span className="text-[10px] uppercase font-bold text-[#FFD800] block">
                    {lang === 'fr' ? 'Moyenne' : 'متوسطة'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#FFD800]">
                    {item.prices.moyenne} <span className="text-[10px]">DH</span>
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">
                    {lang === 'fr' ? 'Grande' : 'كبيرة'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {item.prices.grande} <span className="text-[10px] text-[#FFD800]">DH</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Single Price Format Items in Sleek Interface */
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                {lang === 'fr'
                  ? item.formatLabelFr || 'Prix officiel'
                  : item.formatLabelAr || 'السعر الرسمي'}
              </span>
              <span className="text-xl font-black text-[#FFD800] tracking-tight">
                {item.singlePrice} <span className="text-xs text-white">DH</span>
              </span>
            </div>
          )}
        </div>

        {/* View Details Button as in Sleek Interface */}
        <button
          onClick={() => onViewDetails(item)}
          className="w-full py-2.5 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white group-hover:bg-[#C81024] group-hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Eye className="w-3.5 h-3.5 text-[#FFD800] group-hover:text-white" />
          <span>{lang === 'fr' ? 'Détails de la recette' : 'عرض التفاصيل'}</span>
        </button>

      </div>
    </div>
  );
};
