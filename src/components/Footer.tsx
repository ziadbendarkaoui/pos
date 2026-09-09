import React from 'react';
import { ArrowUp } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

interface FooterProps {
  lang: Language;
  onScrollTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onScrollTop }) => {
  const isRtl = lang === 'ar';

  return (
    <footer
      className="bg-[#050505] text-white border-t border-white/10 pt-8 pb-24 sm:pb-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="inline-flex rounded-lg bg-white px-3 py-2 shadow-sm">
              <Logo className="h-12 w-auto max-w-[220px]" />
            </div>
            <p className="text-sm font-black text-[#FFD800] uppercase tracking-wide">
              {lang === 'fr' ? '« Du bon. Du frais. Du Tasty. »' : '« لذيذ. طازج. تيستي. »'}
            </p>
          </div>

          <button
            onClick={onScrollTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#FFD800]" />
            <span>{lang === 'fr' ? 'Haut de page' : 'للأعلى'}</span>
          </button>
        </div>

        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-widest text-white/40">
          <p>© {new Date().getFullYear()} Tasty Pizza. All rights reserved.</p>
          <div className="flex items-center gap-4"><a href="#admin" className="hover:text-white">Administration</a><span className="text-[#FFD800]">Maroc</span></div>
        </div>
      </div>
    </footer>
  );
};
