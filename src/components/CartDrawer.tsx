import React, { useEffect } from 'react';
import { Minus, Phone, PhoneCall, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Language } from '../types';
import { useSiteContent } from '../data/contentStore';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  lang: Language;
  onClose: () => void;
  onChangeQuantity: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
  onClear: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, items, lang, onClose, onChangeQuantity, onRemove, onClear }) => {
  const { restaurantInfo: RESTAURANT_INFO } = useSiteContent();
  const isRtl = lang === 'ar';
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={(event) => event.stopPropagation()}
        className={`absolute inset-y-0 w-full max-w-md bg-[#101010] shadow-2xl ${isRtl ? 'left-0' : 'right-0'} flex flex-col`}
        aria-label={lang === 'fr' ? 'Panier' : 'السلة'}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C81024] text-[#FFD800]"><ShoppingBag className="h-5 w-5" /></span>
            <div><h2 className="font-black uppercase text-white">{lang === 'fr' ? 'Mon récapitulatif' : 'ملخص طلبي'}</h2><p className="text-[11px] text-white/45">{items.length} {lang === 'fr' ? 'produit(s)' : 'منتج'}</p></div>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white" aria-label={lang === 'fr' ? 'Fermer' : 'إغلاق'}><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/45"><ShoppingBag className="mb-4 h-12 w-12 text-white/20" /><p className="font-bold">{lang === 'fr' ? 'Votre panier est vide' : 'سلتك فارغة'}</p></div>
          ) : items.map((item) => (
            <article key={item.cartId} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <div className="flex gap-3">
                <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-black text-white">{lang === 'fr' ? item.nameFr : item.nameAr}</h3><button type="button" onClick={() => onRemove(item.cartId)} className="p-1 text-white/35 hover:text-red-400" aria-label={lang === 'fr' ? 'Supprimer' : 'حذف'}><Trash2 className="h-4 w-4" /></button></div>
                  {item.size && <p className="mt-0.5 text-[10px] uppercase text-[#FFD800]">{item.size}</p>}
                  {item.supplements.length > 0 && <p className="mt-1 line-clamp-2 text-[10px] text-white/45">+ {item.supplements.map(s => lang === 'fr' ? s.nameFr : s.nameAr).join(', ')}</p>}
                  {item.comboId && <p className="mt-1 text-[10px] text-white/45">+ {lang === 'fr' ? item.comboTitleFr : item.comboTitleAr}</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-white/10 bg-black/30">
                  <button type="button" onClick={() => onChangeQuantity(item.cartId, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center" aria-label="-1"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                  <button type="button" onClick={() => onChangeQuantity(item.cartId, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center" aria-label="+1"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <span className="font-black text-[#FFD800]">{item.unitPrice * item.quantity} DH</span>
              </div>
            </article>
          ))}
        </div>

        <div className="border-t border-white/10 bg-[#090909] p-4 pb-20 sm:pb-5">
          {items.length > 0 && <><div className="mb-3 flex items-center justify-between"><button type="button" onClick={onClear} className="text-[10px] font-bold uppercase text-white/40 underline">{lang === 'fr' ? 'Vider' : 'إفراغ'}</button><p className="text-xl font-black text-white">{total} <span className="text-sm text-[#FFD800]">DH</span></p></div><p className="mb-3 text-[10px] leading-relaxed text-white/45">{lang === 'fr' ? 'Récapitulatif indicatif à lire pendant votre appel. Aucune commande n’est envoyée automatiquement.' : 'ملخص إرشادي لقراءته أثناء المكالمة. لا يتم إرسال أي طلب تلقائياً.'}</p></>}
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${RESTAURANT_INFO.phone}`} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFD800] px-2 text-xs font-black text-black"><Phone className="h-4 w-4" />{lang === 'fr' ? 'Appeler' : 'اتصال'}</a>
            <a href={`https://wa.me/${RESTAURANT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-2 text-xs font-black text-white"><PhoneCall className="h-4 w-4" />WhatsApp</a>
          </div>
        </div>
      </aside>
    </div>
  );
};
