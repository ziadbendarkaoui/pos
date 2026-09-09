import React, { useState, useEffect } from 'react';
import { Phone, Menu as MenuIcon, X, Globe, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { useSiteContent } from '../data/contentStore';
import { Logo } from './Logo';

interface HeaderProps {
  lang: Language;
  onToggleLang: (newLang: Language) => void;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onNavigateSection,
  activeSection,
}) => {
  const { restaurantInfo: RESTAURANT_INFO } = useSiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'accueil', labelFr: 'Accueil', labelAr: 'الرئيسية' },
    { id: 'catalogue', labelFr: 'Menu', labelAr: 'القائمة' },
    { id: 'informations', labelFr: 'Informations', labelAr: 'معلومات' },
    { id: 'contact', labelFr: 'Nous trouver', labelAr: 'موقعنا' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  const isRtl = lang === 'ar';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'h-20 bg-[#050505]/95 backdrop-blur-md shadow-xl border-b border-white/10'
          : 'h-20 bg-[#050505] border-b border-white/10'
      } flex items-center`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNavClick('accueil')}
            className="flex items-center text-left focus:outline-none rounded-lg transition-transform hover:scale-105 cursor-pointer"
            aria-label="Tasty Pizza Accueil"
          >
            <span className="rounded-md bg-white px-2 py-1 shadow-sm">
              <Logo className="h-8 w-auto sm:h-11" />
            </span>
          </button>

          {/* Desktop Navigation - Sleek Interface Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium uppercase tracking-wider opacity-90">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors duration-150 cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#C81024] font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {lang === 'fr' ? link.labelFr : link.labelAr}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop Right Actions - Sleek Interface Theme */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 text-xs font-bold border border-white/20 px-3 py-1 rounded-full bg-white/5">
            <button
              onClick={() => onToggleLang('fr')}
              className={`transition-colors cursor-pointer ${
                lang === 'fr' ? 'text-[#C81024]' : 'text-white/70 hover:text-white'
              }`}
              title="Passer en Français"
            >
              FR
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={() => onToggleLang('ar')}
              className={`transition-colors font-arabic cursor-pointer ${
                lang === 'ar' ? 'text-[#C81024]' : 'text-white/70 hover:text-white'
              }`}
              title="التبديل إلى العربية"
            >
              العربية
            </button>
          </div>

          {/* Direct Call Phone */}
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="text-sm font-bold text-white hover:text-[#FFD800] transition-colors tracking-tight flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-[#FFD800]" />
            <span>{RESTAURANT_INFO.phoneDisplay}</span>
          </a>

          {/* Contact Button */}
          <button
            onClick={() => handleNavClick('contact')}
            className="bg-[#C81024] hover:bg-[#A00B1A] text-white px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-tight transition-all duration-200 cursor-pointer shadow-md shadow-[#C81024]/30 active:scale-95"
          >
            {lang === 'fr' ? 'Nous contacter' : 'اتصل بنا'}
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Language Pill */}
          <button
            onClick={() => onToggleLang(lang === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white border border-white/10"
            aria-label="Changer de langue"
          >
            <Globe className="w-3.5 h-3.5 text-[#FFD800]" />
            <span>{lang === 'fr' ? 'العربية' : 'FR'}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 focus:outline-none"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-b border-white/15 px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <span className="rounded-md bg-white px-2 py-1">
              <Logo className="h-9 w-auto" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD800]">
              Street Food Maroc
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-semibold text-left transition-all ${
                  activeSection === link.id
                    ? 'bg-[#C81024] text-white font-bold'
                    : 'text-neutral-200 hover:bg-white/10'
                }`}
              >
                <span>{lang === 'fr' ? link.labelFr : link.labelAr}</span>
                <span className="text-xs text-[#FFD800] opacity-80">→</span>
              </button>
            ))}

            <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-[#FFD800] text-[#050505] font-bold text-base shadow-md"
              >
                <Phone className="w-5 h-5" />
                <span>{lang === 'fr' ? 'Appeler :' : 'اتصل بنا :'} {RESTAURANT_INFO.phoneDisplay}</span>
              </a>

              <button
                onClick={() => handleNavClick('contact')}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#C81024] text-white font-bold text-base shadow-md"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{lang === 'fr' ? 'Nous contacter' : 'تواصل معنا'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
