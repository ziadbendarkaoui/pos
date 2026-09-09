import React, { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { CartItem, Language, MenuItem, SelectedSize, SelectedSupplement } from '../types';
import { COMBO_DEALS, PIZZA_SUPPLEMENTS } from '../data/menuData';

interface ProductModalProps { item: MenuItem | null; onClose: () => void; onAddToCart: (item: CartItem) => void; lang: Language; }

const sizeLabels: Record<SelectedSize, { fr: string; ar: string }> = {
  petite: { fr: 'Petite', ar: 'صغيرة' }, moyenne: { fr: 'Moyenne', ar: 'متوسطة' }, grande: { fr: 'Grande', ar: 'كبيرة' },
};

export const ProductModal: React.FC<ProductModalProps> = ({ item, onClose, onAddToCart, lang }) => {
  const [size, setSize] = useState<SelectedSize>();
  const [supplements, setSupplements] = useState<SelectedSupplement[]>([]);
  const [comboId, setComboId] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { setSize(undefined); setSupplements([]); setComboId(undefined); setQuantity(1); }, [item]);
  useEffect(() => {
    if (!item) return;
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [item, onClose]);

  const selectedCombo = COMBO_DEALS.find((combo) => combo.id === comboId);
  const basePrice = item ? (item.prices ? (size ? item.prices[size] : 0) : item.singlePrice ?? 0) : 0;
  const unitPrice = basePrice + supplements.reduce((sum, supplement) => sum + supplement.price, 0) + (selectedCombo?.priceSupplement ?? 0);
  const availableSupplements = useMemo(() => {
    if (!item || item.categoryId !== 'pizzas' || !size) return [];
    return PIZZA_SUPPLEMENTS.map((supplement) => ({ nameFr: supplement.nameFr, nameAr: supplement.nameAr, price: supplement.prices ? supplement.prices[size] : supplement.singlePrice ?? 0 }));
  }, [item, size]);
  if (!item) return null;

  const canAdd = !item.prices || Boolean(size);
  const toggleSupplement = (supplement: SelectedSupplement) => setSupplements((current) => current.some((entry) => entry.nameFr === supplement.nameFr) ? current.filter((entry) => entry.nameFr !== supplement.nameFr) : [...current, supplement]);
  const addToCart = () => {
    if (!canAdd) return;
    const optionKey = supplements.map((entry) => entry.nameFr).sort().join('|');
    onAddToCart({ cartId: `${item.id}-${size ?? 'standard'}-${optionKey}-${comboId ?? 'sans-formule'}`, productId: item.id, nameFr: item.nameFr, nameAr: item.nameAr, image: item.image, size, supplements, comboId, comboTitleFr: selectedCombo?.titleFr, comboTitleAr: selectedCombo?.titleAr, quantity, unitPrice });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center overflow-y-auto bg-black/80 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} onClick={(event) => event.stopPropagation()} className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#141414] shadow-2xl sm:rounded-3xl">
        <button type="button" onClick={onClose} className="absolute end-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white" aria-label={lang === 'fr' ? 'Fermer' : 'إغلاق'}><X className="h-5 w-5" /></button>
        <div className="relative h-48 bg-black sm:h-64"><img src={item.image} alt={lang === 'fr' ? item.nameFr : item.nameAr} className="h-full w-full object-cover opacity-85" /><div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" /></div>
        <div className="space-y-5 p-5 sm:p-7">
          <div><h3 className="text-2xl font-black text-white">{lang === 'fr' ? item.nameFr : item.nameAr}</h3><p className="mt-2 text-xs leading-relaxed text-white/50">{lang === 'fr' ? item.descriptionFr : item.descriptionAr}</p></div>
          {item.prices ? <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-widest text-white/60">{lang === 'fr' ? 'Choisissez une taille *' : 'اختر الحجم *'}</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(item.prices) as SelectedSize[]).map((value) => <button type="button" key={value} onClick={() => { setSize(value); setSupplements([]); }} className={`min-h-14 rounded-xl border p-2 text-center ${size === value ? 'border-[#FFD800] bg-[#C81024] text-white' : 'border-white/10 bg-white/5 text-white/70'}`}><span className="block text-[10px] font-bold uppercase">{sizeLabels[value][lang]}</span><span className="text-base font-black sm:text-lg">{item.prices![value]} DH</span></button>)}</div></fieldset> : <div className="flex items-center justify-between rounded-xl bg-white/5 p-4"><span className="text-xs font-bold text-white/60">{lang === 'fr' ? item.formatLabelFr || 'Prix' : item.formatLabelAr || 'السعر'}</span><span className="text-xl font-black text-[#FFD800]">{item.singlePrice} DH</span></div>}
          {availableSupplements.length > 0 && <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-widest text-white/60">{lang === 'fr' ? 'Suppléments' : 'إضافات'}</legend><div className="grid gap-2 sm:grid-cols-2">{availableSupplements.map((supplement) => { const selected = supplements.some((entry) => entry.nameFr === supplement.nameFr); return <button type="button" key={supplement.nameFr} onClick={() => toggleSupplement(supplement)} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-start text-xs ${selected ? 'border-[#FFD800] bg-[#FFD800]/10 text-white' : 'border-white/10 bg-white/5 text-white/65'}`}><span className="flex items-center gap-2">{selected && <Check className="h-4 w-4 text-[#FFD800]" />}{lang === 'fr' ? supplement.nameFr : supplement.nameAr}</span><strong>+{supplement.price} DH</strong></button>; })}</div></fieldset>}
          {item.categoryId !== 'boissons' && <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-widest text-white/60">{lang === 'fr' ? 'Ajouter une formule' : 'إضافة عرض'}</legend><div className="space-y-2"><button type="button" onClick={() => setComboId(undefined)} className={`min-h-11 w-full rounded-xl border px-3 text-start text-xs ${!comboId ? 'border-[#FFD800] bg-[#FFD800]/10' : 'border-white/10 bg-white/5'}`}>{lang === 'fr' ? 'Sans formule' : 'بدون عرض'}</button>{COMBO_DEALS.map((combo) => <button type="button" key={combo.id} onClick={() => setComboId(combo.id)} className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-start text-xs ${comboId === combo.id ? 'border-[#FFD800] bg-[#FFD800]/10' : 'border-white/10 bg-white/5'}`}><span>{lang === 'fr' ? combo.titleFr : combo.titleAr}</span><strong className="shrink-0 text-[#FFD800]">+{combo.priceSupplement} DH</strong></button>)}</div></fieldset>}
          <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center gap-3 border-t border-white/10 bg-[#101010]/95 p-4 backdrop-blur sm:-mx-7 sm:-mb-7"><div className="flex shrink-0 items-center rounded-full border border-white/10 bg-black/40"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-11 w-10 items-center justify-center" aria-label="-1"><Minus className="h-4 w-4" /></button><span className="w-7 text-center text-sm font-black">{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="flex h-11 w-10 items-center justify-center" aria-label="+1"><Plus className="h-4 w-4" /></button></div><button type="button" disabled={!canAdd} onClick={addToCart} className="flex min-h-12 flex-1 items-center justify-between gap-2 rounded-xl bg-[#C81024] px-4 text-sm font-black text-white disabled:opacity-40"><span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" />{lang === 'fr' ? 'Ajouter' : 'إضافة'}</span><span>{unitPrice * quantity} DH</span></button></div>
        </div>
      </div>
    </div>
  );
};
