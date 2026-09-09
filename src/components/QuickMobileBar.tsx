import React from 'react';
import { Phone, PhoneCall, Utensils } from 'lucide-react';
import { Language } from '../types';
import { useSiteContent } from '../data/contentStore';

interface QuickMobileBarProps {
  lang: Language;
  onNavigateSection: (sectionId: string) => void;
}

export const QuickMobileBar: React.FC<QuickMobileBarProps> = ({
  lang,
  onNavigateSection,
}) => {
  const { restaurantInfo: RESTAURANT_INFO } = useSiteContent();
  const isRtl = lang === 'ar';

  const whatsappUrl = `https://wa.me/${RESTAURANT_INFO.whatsapp}`;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-lg border-t border-white/15 px-3 py-2.5 sm:hidden shadow-2xl"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="grid grid-cols-[0.85fr_1.3fr_0.85fr] gap-1.5 items-center">
        {/* Call Button */}
        <a
          href={`tel:${RESTAURANT_INFO.phone}`}
          className="flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl bg-[#FFD800] text-[#050505] font-extrabold text-[10px] min-[380px]:text-xs tracking-tight whitespace-nowrap shadow active:scale-95"
        >
          <Phone className="w-3.5 h-3.5 fill-black" />
          <span>{lang === 'fr' ? 'Appeler' : 'اتصال'}</span>
        </a>

        {/* WhatsApp call button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl bg-[#25D366] text-white font-extrabold text-[9px] min-[380px]:text-[11px] tracking-tight whitespace-nowrap shadow active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{lang === 'fr' ? 'Appel WhatsApp' : 'اتصال واتساب'}</span>
        </a>

        {/* Menu Jump Button */}
        <button
          onClick={() => onNavigateSection('catalogue')}
          className="flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl bg-[#C81024] text-white font-extrabold text-[10px] min-[380px]:text-xs tracking-tight whitespace-nowrap shadow active:scale-95 cursor-pointer"
        >
          <Utensils className="w-3.5 h-3.5 text-[#FFD800]" />
          <span>{lang === 'fr' ? 'Menu' : 'القائمة'}</span>
        </button>
      </div>
    </div>
  );
};
