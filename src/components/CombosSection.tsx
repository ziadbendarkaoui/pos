import React from 'react';
import { Sparkles, UtensilsCrossed, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COMBO_DEALS } from '../data/menuData';
import { Language } from '../types';

interface CombosSectionProps {
  lang: Language;
}

export const CombosSection: React.FC<CombosSectionProps> = ({ lang }) => {
  const isRtl = lang === 'ar';

  return (
    <div id="informations" className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD800]/10 border border-[#FFD800]/30 text-[#FFD800] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'fr' ? 'Formules Repas Complètes' : 'عروض الوجبات المتكاملة'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase text-white tracking-wide">
          {lang === 'fr' ? 'Nos Formules Menu' : 'عروض المنيو الكامل'}
        </h2>
        <p className="text-sm text-neutral-400">
          {lang === 'fr'
            ? 'Complétez votre plat avec une boisson fraîche et des frites croustillantes pour seulement quelques dirhams de plus.'
            : 'أضف مشروباً منعشاً وبطاطس مقلية مقرمشة إلى وجبتك المفضلة بسعر رمزي موفر.'}
        </p>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {COMBO_DEALS.map((deal) => (
          <div
            key={deal.id}
            className="relative bg-[#1a1a1a] rounded-3xl p-7 sm:p-8 border border-white/5 hover:border-white/20 transition-all shadow-xl overflow-hidden flex flex-col justify-between group"
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#C81024] text-white text-[10px] font-black uppercase tracking-wider">
                {lang === 'fr' ? 'Formule Tasty' : 'عرض تيستي'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#FFD800]">
                +{deal.priceSupplement} <span className="text-xs text-white">DH</span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight group-hover:text-[#FFD800] transition-colors">
                {lang === 'fr' ? deal.titleFr : deal.titleAr}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {lang === 'fr' ? deal.descriptionFr : deal.descriptionAr}
              </p>

              {/* Items included list */}
              <div className="pt-3 space-y-2">
                {(lang === 'fr' ? deal.includedItemsFr : deal.includedItemsAr).map((itemText, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#FFD800] shrink-0" />
                    <span>{itemText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Informative Notice */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFD800] shrink-0" />
              <span>
                {lang === 'fr'
                  ? 'Information menu : formule disponible directement en restaurant.'
                  : 'معلومة : العرض متاح مباشرة داخل المطعم أو بالطلب الحضوري.'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Explicit instruction constraint banner */}
      <div className="max-w-2xl mx-auto text-center p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-400">
        <span>
          {lang === 'fr'
            ? 'ℹ️ Ces formules sont présentées à titre de catalogue informatif. Aucune commande en ligne n’est effectuée via ce site.'
            : 'ℹ️ هذه العروض معروضة للإرشاد فقط ولا تتيح الشراء أو الطلب المباشر عبر الموقع.'}
        </span>
      </div>
    </div>
  );
};
