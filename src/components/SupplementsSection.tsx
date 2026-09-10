import React from 'react';
import { PlusCircle, Info, Sparkles } from 'lucide-react';
import { Language, PizzaSupplement } from '../types';

interface SupplementsSectionProps {
  lang: Language;
  supplements: PizzaSupplement[];
}

export const SupplementsSection: React.FC<SupplementsSectionProps> = ({ lang, supplements }) => {
  const isRtl = lang === 'ar';

  return (
    <div id="supplements" className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FFD800] uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Personnalisation Gourmande' : 'تخصيص الوجبة'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase text-white tracking-wide">
            {lang === 'fr' ? 'Suppléments pour Pizzas' : 'إضافات البيتزا'}
          </h2>
        </div>

        {/* Informative Label Notice */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-xs text-neutral-300">
          <Info className="w-3.5 h-3.5 text-[#FFD800]" />
          <span>
            {lang === 'fr'
              ? 'Tarifs informatifs – à demander lors de votre visite ou appel'
              : 'أسعار إعلامية – تطلب عند زيارتكم أو اتصالكم'}
          </span>
        </div>
      </div>

      {/* Supplements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {supplements.map((sup, idx) => (
          <div
            key={idx}
            className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between shadow-lg group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-full bg-[#C81024]/20 flex items-center justify-center text-[#FFD800]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase font-bold text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full">
                  {lang === 'fr' ? 'Option' : 'اختياري'}
                </span>
              </div>

              <h4 className="text-base font-bold uppercase text-white tracking-tight group-hover:text-[#FFD800] transition-colors">
                {sup.nameFr}
              </h4>
              <p className="text-xs font-arabic opacity-40 italic mt-0.5">
                {sup.nameAr}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              {sup.prices ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 text-[11px] uppercase font-bold">
                      {lang === 'fr' ? 'Petite :' : 'صغيرة :'}
                    </span>
                    <span className="font-black text-white text-xs">
                      +{sup.prices.petite} <span className="text-[#FFD800]">DH</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-[#C81024]/10 border border-[#C81024]/20 px-2.5 py-1 rounded-xl">
                    <span className="text-[#FFD800] text-[11px] uppercase font-bold">
                      {lang === 'fr' ? 'Moyenne :' : 'متوسطة :'}
                    </span>
                    <span className="font-black text-[#FFD800] text-sm">
                      +{sup.prices.moyenne} DH
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 text-[11px] uppercase font-bold">
                      {lang === 'fr' ? 'Grande :' : 'كبيرة :'}
                    </span>
                    <span className="font-black text-white text-xs">
                      +{sup.prices.grande} <span className="text-[#FFD800]">DH</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                    {lang === 'fr' ? 'Tarif unique :' : 'سعر موحد :'}
                  </span>
                  <span className="font-black text-xl text-[#FFD800]">
                    +{sup.singlePrice} <span className="text-xs text-white">DH</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
