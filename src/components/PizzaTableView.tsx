import React from 'react';
import { Sparkles, Info, Eye } from 'lucide-react';
import { MenuItem, Language } from '../types';

interface PizzaTableViewProps {
  pizzas: MenuItem[];
  lang: Language;
  onViewDetails: (item: MenuItem) => void;
}

export const PizzaTableView: React.FC<PizzaTableViewProps> = ({
  pizzas,
  lang,
  onViewDetails,
}) => {
  const isRtl = lang === 'ar';

  return (
    <div className="w-full bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header of the table card in Sleek Interface */}
      <div className="p-5 bg-white/[0.02] border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 bg-[#C81024] rounded-full inline-block" />
            <span>{lang === 'fr' ? 'Tableau Comparatif des Formats' : 'جدول مقارنة أحجام البيتزا'}</span>
          </h3>
          <p className="text-xs text-white/50 mt-1">
            {lang === 'fr'
              ? 'Consultez les 12 recettes artisanales et leurs tarifs officiels selon le diamètre'
              : 'استعرض وصفات البيتزا الـ 12 وأسعارها الرسمية حسب الحجم'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black text-[#FFD800] bg-[#FFD800]/10 px-3.5 py-1.5 rounded-full border border-[#FFD800]/20 uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" />
          <span>{lang === 'fr' ? 'Tarifs fermes en DH' : 'الأسعار بالدرهم'}</span>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-black/40 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/50">
              <th className="py-4 px-5 sm:px-6">
                {lang === 'fr' ? 'Recette & Ingrédients' : 'الوصفة والمكونات'}
              </th>
              <th className="py-4 px-3 text-center">
                <span className="text-white/40 block text-[9px]">Format</span>
                <span className="text-white">{lang === 'fr' ? 'Petite' : 'صغيرة'}</span>
              </th>
              <th className="py-4 px-3 text-center bg-[#C81024]/10 border-x border-white/5">
                <span className="text-[#FFD800] block text-[9px]">Populaire</span>
                <span className="text-white font-bold">{lang === 'fr' ? 'Moyenne' : 'متوسطة'}</span>
              </th>
              <th className="py-4 px-3 text-center">
                <span className="text-white/40 block text-[9px]">Format</span>
                <span className="text-white">{lang === 'fr' ? 'Grande' : 'كبيرة'}</span>
              </th>
              <th className="py-4 px-5 text-center">
                {lang === 'fr' ? 'Détails' : 'تفاصيل'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {pizzas.map((pizza, idx) => {
              const isTasty = pizza.id === 'pizza-tasty';
              return (
                <tr
                  key={pizza.id}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    isTasty ? 'bg-[#C81024]/10' : idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                  }`}
                >
                  {/* Pizza Name & Arabic translation */}
                  <td className="py-4 px-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 hidden sm:block">
                        <img
                          src={pizza.image}
                          alt={pizza.nameFr}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base uppercase tracking-tight">
                            {pizza.nameFr}
                          </span>
                          {pizza.badgeFr && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C81024] text-white">
                              {pizza.badgeFr}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-arabic opacity-40 italic mt-0.5">
                          {pizza.nameAr}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Petite Price */}
                  <td className="py-4 px-3 text-center">
                    <span className="font-black text-base text-white">
                      {pizza.prices?.petite}{' '}
                      <span className="text-xs text-[#FFD800]">DH</span>
                    </span>
                  </td>

                  {/* Moyenne Price (highlighted) */}
                  <td className="py-4 px-3 text-center bg-[#C81024]/10 border-x border-white/5 font-extrabold">
                    <span className="font-black text-lg text-[#FFD800]">
                      {pizza.prices?.moyenne}{' '}
                      <span className="text-xs text-white">DH</span>
                    </span>
                  </td>

                  {/* Grande Price */}
                  <td className="py-4 px-3 text-center">
                    <span className="font-black text-base text-white">
                      {pizza.prices?.grande}{' '}
                      <span className="text-xs text-[#FFD800]">DH</span>
                    </span>
                  </td>

                  {/* Action Link to view details */}
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => onViewDetails(pizza)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#C81024] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      title="Voir les détails"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FFD800]" />
                      <span className="hidden md:inline">
                        {lang === 'fr' ? 'Détails' : 'تفاصيل'}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Note */}
      <div className="p-4 bg-black/40 border-t border-white/5 text-center text-xs text-white/40">
        <span>
          {lang === 'fr'
            ? 'ℹ️ Pâte pétrie chaque matin et garnie avec de la mozzarella 100% pur lait fondant.'
            : 'ℹ️ عجين طازج وموزاريلا صافية مطاطية تحضر يومياً.'}
        </span>
      </div>
    </div>
  );
};
