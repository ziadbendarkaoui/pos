import React from 'react';
import { Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onDiscoverClick: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onDiscoverClick,
  onContactClick,
}) => {
  const isRtl = lang === 'ar';

  return (
    <section
      id="accueil"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-[500px] lg:min-h-[560px] flex items-center shrink-0 bg-[#111] overflow-hidden pt-24 pb-12 sm:pb-16"
    >
      {/* Background Image with Dark Contrast as in Sleek Interface */}
      <div
        className="absolute inset-0 opacity-40 bg-center bg-cover pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isRtl
            ? 'bg-gradient-to-l from-[#050505] via-[#050505]/75 to-transparent'
            : 'bg-gradient-to-r from-[#050505] via-[#050505]/75 to-transparent'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        <div className="grid grid-cols-1 gap-8 items-center">
          
          {/* Main Hero Content */}
          <div className="flex flex-col items-start text-left space-y-4">
            
            {/* Sleek rectangular badge */}
            <div className="inline-block bg-[#C81024] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-sm shadow-sm">
              {lang === 'fr' ? 'Préparé à la minute' : 'يحضر في حينه'}
            </div>

            {/* Massive Italic Uppercase Title */}
            <h1 className="text-[2.35rem] sm:text-6xl lg:text-7xl font-black leading-[0.94] max-w-2xl italic uppercase text-white tracking-tight break-words">
              {lang === 'fr' ? (
                <>
                  La pizza qui met{' '}
                  <span className="text-[#C81024] text-[2.85rem] sm:text-7xl lg:text-8xl block not-italic">
                    tout le monde
                  </span>{' '}
                  d’accord.
                </>
              ) : (
                <span className="font-arabic leading-tight not-italic">
                  البيتزا التي تضع{' '}
                  <span className="text-[#C81024] block">الجميع</span>{' '}
                  على وفاق.
                </span>
              )}
            </h1>

            {/* Slogan */}
            <p className="text-lg sm:text-xl font-medium text-[#FFF7E8] opacity-90 max-w-xl">
              {lang === 'fr' ? 'Du bon. Du frais. Du Tasty.' : 'لذيذ. طازج. تيستي.'}
            </p>

            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              {lang === 'fr'
                ? 'Pizzas artisanales, pizzas turques, baguettas dorées, panozzos, tacos et poutines préparés à la minute au Maroc.'
                : 'أشهى المأكولات الإيطالية والستريت فود العصري بالمغرب : بيتزا، بيدة، باغيتا، بانوزو، طاكوس وبوتين.'}
            </p>

            {/* CTA Buttons in Sleek Interface Style */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto">
              <button
                onClick={onDiscoverClick}
                className="w-full sm:w-auto bg-[#FFD800] hover:bg-[#ffe234] text-black px-6 sm:px-8 py-3.5 rounded-full font-black uppercase text-sm tracking-tight transition-all duration-150 active:scale-95 shadow-lg shadow-[#FFD800]/20 cursor-pointer"
              >
                {lang === 'fr' ? 'Découvrir le menu' : 'اكتشف القائمة'}
              </button>

              <button
                onClick={onContactClick}
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3.5 rounded-full font-black uppercase text-sm tracking-tight transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {lang === 'fr' ? 'Nous contacter' : 'تواصل معنا'}
              </button>

            </div>

            {/* Quick Informative Badges */}
            <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-3 pt-6 border-t border-white/10 w-full max-w-xl text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFD800] shrink-0" />
                <span className="text-neutral-300 font-semibold">{lang === 'fr' ? '7j/7 jusqu’à 02h' : 'يومياً حتى 2 ليلاً'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C81024] shrink-0" />
                <span className="text-neutral-300 font-semibold">{lang === 'fr' ? '100% Frais' : 'طازج 100%'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD800] shrink-0" />
                <span className="text-neutral-300 font-semibold">{lang === 'fr' ? 'Pétrie Maison' : 'عجن يومي'}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
