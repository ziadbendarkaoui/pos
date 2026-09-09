import React from 'react';
import {
  MapPin,
  Clock,
  Instagram,
  Facebook,
  MessageCircleWarning,
} from 'lucide-react';
import { Language } from '../types';
import { useSiteContent } from '../data/contentStore';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const { restaurantInfo: RESTAURANT_INFO } = useSiteContent();
  const isRtl = lang === 'ar';

  const complaintUrl = `https://wa.me/212663195291?text=${encodeURIComponent(
    lang === 'fr' ? 'Bonjour, je souhaite déposer une réclamation concernant Tasty Pizza.' : 'السلام عليكم، أود تقديم شكوى بخصوص Tasty Pizza.'
  )}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent('Tasty Pizza Settat')}&output=embed`;

  return (
    <section id="contact" className="py-12 sm:py-20 relative bg-[#080808] overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C81024]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFD800]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C81024]/20 border border-[#C81024]/40 text-[#FFD800] text-[10px] font-black uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Point de Vente & Échange' : 'موقعنا والتواصل'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tight">
            {lang === 'fr' ? 'Nous Trouver & Nous Contacter' : 'موقعنا والتواصل معنا'}
          </h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            {lang === 'fr'
              ? 'Une question sur notre carte, nos ingrédients ou nos formats ? Venez nous voir ou contactez notre équipe en un clic.'
              : 'هل لديك استفسار حول المنيو أو المكونات أو الأحجام؟ تفضل بزيارتنا أو تواصل مع فريقنا مباشرة.'}
          </p>
        </div>

        {/* Main contact actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Voir Instagram */}
          <a
            href={RESTAURANT_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest border border-white/10 shadow transition-transform active:scale-98"
          >
            <Instagram className="w-4 h-4 text-[#FFD800]" />
            <span>{lang === 'fr' ? 'Voir Instagram' : 'زيارة إنستغرام'}</span>
          </a>

          {/* Voir Facebook */}
          <a
            href={RESTAURANT_INFO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-white font-bold text-xs uppercase tracking-widest border border-[#1877F2]/40 shadow transition-transform active:scale-98"
          >
            <Facebook className="w-4 h-4 text-[#1877F2]" />
            <span>{lang === 'fr' ? 'Voir Facebook' : 'زيارة فيسبوك'}</span>
          </a>

          {/* Réclamation WhatsApp */}
          <a
            href={complaintUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-white font-bold text-xs uppercase tracking-widest border border-[#25D366]/40 shadow transition-transform active:scale-98"
          >
            <MessageCircleWarning className="w-4 h-4 text-[#25D366]" />
            <span>{lang === 'fr' ? 'Réclamation WhatsApp' : 'شكوى عبر واتساب'}</span>
          </a>
        </div>

        {/* Detailed Grid: Practical Info + Maps + QR Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Practical Info Card */}
          <div className="lg:col-span-5 bg-[#141414] rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-6">
              {/* Opening Hours */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFD800] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {lang === 'fr' ? 'Horaires d’ouverture' : 'أوقات العمل'}
                  </p>
                  <p className="text-base font-bold text-white">
                    {lang === 'fr' ? RESTAURANT_INFO.openingHoursFr : RESTAURANT_INFO.openingHoursAr}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {lang === 'fr' ? '● Ouvert 7j/7' : '● مفتوح طيلة أيام الأسبوع'}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-[#C81024] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {lang === 'fr' ? 'Adresse' : 'العنوان'}
                  </p>
                  <p className="text-xs font-semibold text-white/80">
                    {lang === 'fr' ? RESTAURANT_INFO.addressFr : RESTAURANT_INFO.addressAr}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Google Maps Location Preview */}
          <div className="lg:col-span-7 bg-[#141414] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
            {/* Top Bar of Map Container */}
            <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C81024]" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {lang === 'fr' ? 'Emplacement Google Maps' : 'موقع المطعم على الخريطة'}
                </span>
              </div>

            </div>

            {/* Map Area */}
            <div className="relative flex-1 min-h-[340px] sm:min-h-[400px] bg-neutral-950 overflow-hidden">
              <iframe
                src={mapsEmbedUrl}
                title={lang === 'fr' ? 'Carte Google Maps de Tasty Pizza Settat' : 'خريطة موقع مطعم تايستي بيتزا سطات'}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />

              {/* Overlay button in map */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20">
                <a
                  href={RESTAURANT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C81024] hover:bg-[#A00B1A] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#FFD800]" />
                  <span>{lang === 'fr' ? 'Ouvrir dans Google Maps' : 'فتح في Google Maps'}</span>
                </a>
              </div>
            </div>

            {/* Bottom info strip */}
            <div className="p-3 bg-black/60 border-t border-white/10 text-center text-xs text-neutral-400">
              <span>
                {lang === 'fr'
                  ? 'Pour commander au comptoir ou vous renseigner, retrouvez-nous aux heures d’ouverture.'
                  : 'للطلب مباشرة عند الكاونتر أو الاستفسار، نرحب بكم خلال أوقات العمل الرسمية.'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
