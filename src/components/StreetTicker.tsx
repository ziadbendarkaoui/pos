import React from 'react';
import { Star, Flame, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface StreetTickerProps {
  lang: Language;
}

export const StreetTicker: React.FC<StreetTickerProps> = ({ lang }) => {
  const itemsFr = [
    'DU BON • DU FRAIS • DU TASTY',
    'PIZZAS AU FEU DE BOIS',
    'PRÉPARÉ À LA MINUTE',
    'RECETTES MAISON',
    'FROMAGE MOZZARELLA EXTRA FONDANT',
    'BAGUETTAS & PANOZZOS CHAUDS',
    'TACOS GOURMANDS & PASTICCIOS',
    'CONTACT & INFOS : 06 29 90 80 01',
  ];

  const itemsAr = [
    'لذيذ • طازج • تيستي',
    'بيتزا ستريت فود أصلية',
    'تحضير طازج في حينه',
    'جبن موزاريلا إكسترا ذائب',
    'باغيتا وبانوزو على الأصول',
    'طاكوس وباستيتشيو محمر',
    'استفسارات : 06 29 90 80 01',
  ];

  const items = lang === 'fr' ? itemsFr : itemsAr;

  return (
    <div className="w-full bg-[#C81024] text-white py-2.5 overflow-hidden border-y border-[#FFD800]/40 shadow-inner select-none">
      <div className="flex w-max animate-[marquee_25s_linear_infinite] items-center gap-8">
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-4 text-xs sm:text-sm font-display font-black tracking-widest uppercase">
            <span>{text}</span>
            {idx % 2 === 0 ? (
              <Star className="w-3.5 h-3.5 fill-[#FFD800] text-[#FFD800]" />
            ) : (
              <Flame className="w-3.5 h-3.5 fill-[#FFD800] text-[#FFD800]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
