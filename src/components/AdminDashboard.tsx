import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, KeyRound, Plus, RotateCcw, Save, Search, Store, Tags, Trash2, UtensilsCrossed } from 'lucide-react';
import { ComboDeal, MenuItem, PizzaSupplement, SelectedSize } from '../types';
import { changeAdminPassword, DEFAULT_SITE_CONTENT, loadOnlineContent, publishSiteContent, readLegacyContent, SiteContent } from '../data/contentStore';
import { Logo } from './Logo';

type Tab = 'products' | 'combos' | 'supplements' | 'restaurant' | 'security';
const sizes: SelectedSize[] = ['petite', 'moyenne', 'grande'];
const badgeOptions = ['', 'popular', 'signature', 'hot', 'veggie', 'promo'] as const;
const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || crypto.randomUUID();
const toLines = (items: string[]) => items.join('\n');
const fromLines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

async function decodeImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    return { width: bitmap.width, height: bitmap.height, draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => { ctx.drawImage(bitmap, 0, 0, width, height); bitmap.close(); } };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('decode')); image.src = url; });
      return { width: image.naturalWidth, height: image.naturalHeight, draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => ctx.drawImage(image, 0, 0, width, height) };
    } finally { URL.revokeObjectURL(url); }
  }
}

export const AdminDashboard: React.FC<{ content: SiteContent; adminPassword: string; onPasswordChanged: (password: string) => void; onExit: () => void }> = ({ content, adminPassword, onPasswordChanged, onExit }) => {
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState<Tab>('products');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(content.menuItems[0]?.id ?? '');
  const [comboId, setComboId] = useState(content.comboDeals[0]?.id ?? '');
  const [supplementId, setSupplementId] = useState(content.pizzaSupplements[0]?.id ?? '');
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(adminPassword);
  const [newPassword, setNewPassword] = useState('');
  const [revision, setRevision] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Chargement du contenu en ligne…');
  const [imageStatus, setImageStatus] = useState('');
  const [legacy] = useState(readLegacyContent);

  const input = 'min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-[#FFD800]/70';
  const label = 'mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/45';
  const selected = draft.menuItems.find(item => item.id === selectedId);
  const selectedCombo = draft.comboDeals.find(combo => combo.id === comboId);
  const selectedSupplement = draft.pizzaSupplements.find(supplement => supplement.id === supplementId);
  const filtered = useMemo(() => draft.menuItems.filter(item => `${item.nameFr} ${item.nameAr}`.toLowerCase().includes(query.toLowerCase())), [draft.menuItems, query]);

  const load = async () => {
    setBusy(true);
    try {
      const result = await loadOnlineContent();
      setDraft(result.content);
      setRevision(result.revision);
      setSelectedId(result.content.menuItems[0]?.id ?? '');
      setComboId(result.content.comboDeals[0]?.id ?? '');
      setSupplementId(result.content.pizzaSupplements[0]?.id ?? '');
      setStatus('Contenu en ligne chargé.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Connexion impossible.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);

  const updateProduct = (patch: Partial<MenuItem>) => setDraft(current => ({ ...current, menuItems: current.menuItems.map(item => item.id === selectedId ? { ...item, ...patch } : item) }));
  const updateCombo = (patch: Partial<ComboDeal>) => setDraft(current => ({ ...current, comboDeals: current.comboDeals.map(combo => combo.id === comboId ? { ...combo, ...patch } : combo) }));
  const updateSupplement = (patch: Partial<PizzaSupplement>) => setDraft(current => ({ ...current, pizzaSupplements: current.pizzaSupplements.map(supplement => supplement.id === supplementId ? { ...supplement, ...patch } : supplement) }));
  const updateRestaurant = (key: keyof SiteContent['restaurantInfo'], value: string) => setDraft(current => ({ ...current, restaurantInfo: { ...current.restaurantInfo, [key]: value } }));

  const save = async () => {
    if (busy) return;
    if (revision === null) { setStatus('Chargez d’abord le contenu en ligne.'); return; }
    setBusy(true); setSaved(false); setStatus('Publication des modifications et des photos…');
    try {
      const result = await publishSiteContent(draft, revision, adminPassword);
      setDraft(result.content); setRevision(result.revision); setSaved(true); setStatus('Publié en ligne : vos modifications sont visibles par tous.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Publication impossible.'); }
    finally { setBusy(false); }
  };

  const updatePassword = async () => {
    if (busy) return;
    setBusy(true); setSaved(false); setStatus('Changement du mot de passe administrateur…');
    try {
      await changeAdminPassword(currentPassword, newPassword);
      const next = newPassword.trim();
      setCurrentPassword(next); onPasswordChanged(next); setNewPassword('');
      setStatus('Mot de passe administrateur modifié. L’ancien mot de passe est annulé.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Changement impossible.'); }
    finally { setBusy(false); }
  };

  const reset = () => { if (!busy && window.confirm('Charger les données d’origine dans le formulaire ? Elles seront publiées seulement après Enregistrer.')) { setDraft(structuredClone(DEFAULT_SITE_CONTENT)); setStatus('Données d’origine chargées dans le formulaire. Enregistrez pour les publier.'); } };
  const addProduct = () => { const item: MenuItem = { id: `produit-${Date.now()}`, categoryId: 'pizzas', nameFr: 'Nouveau produit', nameAr: 'منتج جديد', descriptionFr: '', descriptionAr: '', singlePrice: 0, image: '/assets/menu/pizza-margarita.webp', isAvailable: true }; setDraft(current => ({ ...current, menuItems: [item, ...current.menuItems] })); setSelectedId(item.id); setTab('products'); };
  const deleteProduct = () => { if (selected && window.confirm(`Supprimer ${selected.nameFr} ?`)) setDraft(current => { const next = current.menuItems.filter(item => item.id !== selected.id); setSelectedId(next[0]?.id ?? ''); return { ...current, menuItems: next }; }); };
  const addCombo = () => { const combo: ComboDeal = { id: `formule-${Date.now()}`, titleFr: 'Nouvelle formule', titleAr: 'عرض جديد', priceSupplement: 0, descriptionFr: '', descriptionAr: '', includedItemsFr: ['Boisson', 'Frites'], includedItemsAr: ['مشروب', 'بطاطس'] }; setDraft(current => ({ ...current, comboDeals: [combo, ...current.comboDeals] })); setComboId(combo.id); setTab('combos'); };
  const deleteCombo = () => { if (selectedCombo && window.confirm(`Supprimer ${selectedCombo.titleFr} ?`)) setDraft(current => { const next = current.comboDeals.filter(combo => combo.id !== selectedCombo.id); setComboId(next[0]?.id ?? ''); return { ...current, comboDeals: next }; }); };
  const addSupplement = () => { const supplement: PizzaSupplement = { id: `supplement-${Date.now()}`, nameFr: 'Nouveau supplément', nameAr: 'إضافة جديدة', singlePrice: 0 }; setDraft(current => ({ ...current, pizzaSupplements: [supplement, ...current.pizzaSupplements] })); setSupplementId(supplement.id); setTab('supplements'); };
  const deleteSupplement = () => { if (selectedSupplement && window.confirm(`Supprimer ${selectedSupplement.nameFr} ?`)) setDraft(current => { const next = current.pizzaSupplements.filter(supplement => supplement.id !== selectedSupplement.id); setSupplementId(next[0]?.id ?? ''); return { ...current, pizzaSupplements: next }; }); };

  const importImage = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const targetId = selectedId;
    setImageStatus('Optimisation en cours…');
    try {
      const decoded = await decodeImage(file);
      const scale = Math.min(1, 800 / Math.max(decoded.width, decoded.height));
      const width = Math.max(1, Math.round(decoded.width * scale));
      const height = Math.max(1, Math.round(decoded.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      decoded.draw(ctx, width, height);
      let quality = 0.82;
      let optimized = canvas.toDataURL('image/webp', quality);
      let approximateBytes = Math.round((optimized.length - optimized.indexOf(',') - 1) * 0.75);
      while (approximateBytes > 1024 * 1024 && quality > 0.45) {
        quality -= 0.08;
        optimized = canvas.toDataURL('image/webp', quality);
        approximateBytes = Math.round((optimized.length - optimized.indexOf(',') - 1) * 0.75);
      }
      if (approximateBytes > 1024 * 1024) throw new Error('size');
      setDraft(current => ({ ...current, menuItems: current.menuItems.map(item => item.id === targetId ? { ...item, image: optimized } : item) }));
      setImageStatus(`Optimisée en WebP · ${width}×${height} px · ${(approximateBytes / 1024).toFixed(0)} Ko`);
    } catch {
      setImageStatus('Impossible de lire cette image avec ce navigateur. Essayez JPG, PNG ou WebP.');
    }
  };

  return <div className="min-h-screen bg-[#070707] text-white font-body">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><span className="rounded-lg bg-white px-2 py-1"><Logo className="h-9 w-auto" /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FFD800]">Administration</p><h1 className="text-sm font-black sm:text-lg">Tableau de bord</h1></div></div><div className="flex items-center gap-2"><button onClick={onExit} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold hover:bg-white/10"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Voir le site</span></button><button onClick={save} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#C81024] px-4 text-xs font-black"><Save className="h-4 w-4" />{saved ? 'Enregistré' : 'Enregistrer'}{saved && <Check className="h-4 w-4" />}</button></div></div></header>
    <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6"><div className="rounded-2xl border border-white/10 bg-[#111] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p role="status" aria-live="polite" className="text-sm text-[#FFD800]">{status}</p><p className="mt-1 text-xs text-white/50">Session admin active. Enregistrer publie les modifications sur tous les appareils.</p></div><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => { if (window.confirm('Recharger la version en ligne et remplacer les modifications du formulaire ?')) void load(); }} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-50">Recharger en ligne</button>{legacy && <button disabled={busy} onClick={() => { if (window.confirm('Récupérer les anciennes modifications de ce navigateur dans le formulaire ?')) { setDraft({ ...DEFAULT_SITE_CONTENT, ...legacy, comboDeals: legacy.comboDeals ?? DEFAULT_SITE_CONTENT.comboDeals, pizzaSupplements: legacy.pizzaSupplements ?? DEFAULT_SITE_CONTENT.pizzaSupplements }); setStatus('Anciennes modifications récupérées. Enregistrez pour les publier en ligne.'); } }} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-50">Récupérer mes anciennes modifications</button>}</div></div></div></section>
    <main aria-busy={busy} className={`mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[230px_1fr] ${busy || revision === null ? 'pointer-events-none opacity-50' : ''}`} inert={busy || revision === null}>
      <aside className="h-fit rounded-2xl border border-white/10 bg-[#111] p-2 lg:sticky lg:top-24"><div className="grid grid-cols-2 gap-2 lg:grid-cols-1">{([{ id: 'products', text: 'Produits', icon: <UtensilsCrossed className="h-5 w-5" /> }, { id: 'combos', text: 'Formules', icon: <Tags className="h-5 w-5" /> }, { id: 'supplements', text: 'Suppléments', icon: <Plus className="h-5 w-5" /> }, { id: 'restaurant', text: 'Restaurant', icon: <Store className="h-5 w-5" /> }, { id: 'security', text: 'Sécurité', icon: <KeyRound className="h-5 w-5" /> }] as { id: Tab; text: string; icon: React.ReactNode }[]).map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold ${tab === item.id ? 'bg-[#C81024]' : 'text-white/60 hover:bg-white/5'}`}>{item.icon}{item.text}</button>)}</div><button onClick={reset} className="mt-3 flex min-h-11 w-full items-center gap-3 border-t border-white/10 px-4 pt-3 text-xs font-bold text-white/45 hover:text-white"><RotateCcw className="h-4 w-4" />Restaurer l’origine</button></aside>
      {tab === 'products' && <section className="grid min-w-0 gap-5 xl:grid-cols-[360px_1fr]"><div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><button onClick={addProduct} className="mb-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFD800] px-3 text-sm font-black text-black"><Plus className="h-4 w-4" />Ajouter produit</button><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit" className={`${input} pl-10`} /></div><p className="mt-2 text-[11px] text-white/35">{filtered.length} produits</p></div><div className="max-h-[65vh] overflow-y-auto p-2">{filtered.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`mb-1 flex min-h-16 w-full items-center gap-3 rounded-xl p-2 text-left ${selectedId === item.id ? 'bg-[#C81024]/20 ring-1 ring-[#C81024]' : 'hover:bg-white/5'}`}><img src={item.image} alt="" className="h-12 w-12 rounded-lg bg-black object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.nameFr}</span><span className="text-[10px] text-white/40">{item.promoPrice ?? item.singlePrice ?? item.prices?.petite ?? 0} DH · {item.categoryId}</span></span><span className={`h-2.5 w-2.5 rounded-full ${item.isAvailable === false ? 'bg-red-500' : 'bg-emerald-400'}`} /></button>)}</div></div>{selected && <ProductEditor selected={selected} draft={draft} label={label} input={input} imageStatus={imageStatus} onDelete={deleteProduct} onPatch={updateProduct} onImage={importImage} />}</section>}
      {tab === 'combos' && <section className="grid min-w-0 gap-5 xl:grid-cols-[330px_1fr]"><ListPanel title="Formules" items={draft.comboDeals.map(combo => ({ id: combo.id, text: combo.titleFr, sub: `+${combo.priceSupplement} DH` }))} selectedId={comboId} onSelect={setComboId} onAdd={addCombo} addText="Ajouter formule" />{selectedCombo && <ComboEditor combo={selectedCombo} label={label} input={input} onDelete={deleteCombo} onPatch={updateCombo} />}</section>}
      {tab === 'supplements' && <section className="grid min-w-0 gap-5 xl:grid-cols-[330px_1fr]"><ListPanel title="Suppléments" items={draft.pizzaSupplements.map(supplement => ({ id: supplement.id, text: supplement.nameFr, sub: supplement.prices ? 'Prix par taille' : `+${supplement.singlePrice ?? 0} DH` }))} selectedId={supplementId} onSelect={setSupplementId} onAdd={addSupplement} addText="Ajouter supplément" />{selectedSupplement && <SupplementEditor supplement={selectedSupplement} label={label} input={input} onDelete={deleteSupplement} onPatch={updateSupplement} />}</section>}
      {tab === 'restaurant' && <RestaurantEditor draft={draft} label={label} input={input} onUpdate={updateRestaurant} />}
      {tab === 'security' && <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">Sécurité</p><h2 className="mt-1 text-2xl font-black">Mot de passe dashboard</h2></div><div className="grid gap-4 md:grid-cols-2"><label><span className={label}>Mot de passe actuel</span><input type="password" autoComplete="current-password" className={input} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label><label><span className={label}>Nouveau mot de passe</span><input type="password" autoComplete="new-password" className={input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="4 caractères minimum" /></label></div><button disabled={busy || newPassword.trim().length < 4} onClick={updatePassword} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FFD800]/40 px-4 text-sm font-bold text-[#FFD800] disabled:opacity-50"><KeyRound className="h-4 w-4" />Changer le mot de passe</button></section>}
    </main>
  </div>;
};

const ListPanel: React.FC<{ title: string; items: { id: string; text: string; sub: string }[]; selectedId: string; addText: string; onSelect: (id: string) => void; onAdd: () => void }> = ({ title, items, selectedId, addText, onSelect, onAdd }) => <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><button onClick={onAdd} className="mb-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFD800] px-3 text-sm font-black text-black"><Plus className="h-4 w-4" />{addText}</button><p className="text-[11px] font-black uppercase tracking-widest text-white/35">{title} · {items.length}</p></div><div className="max-h-[65vh] overflow-y-auto p-2">{items.map(item => <button key={item.id} onClick={() => onSelect(item.id)} className={`mb-1 flex min-h-14 w-full flex-col justify-center rounded-xl p-3 text-left ${selectedId === item.id ? 'bg-[#C81024]/20 ring-1 ring-[#C81024]' : 'hover:bg-white/5'}`}><span className="truncate text-sm font-bold">{item.text}</span><span className="text-[10px] text-white/40">{item.sub}</span></button>)}</div></div>;
const EditorHeader: React.FC<{ kicker: string; title: string; onDelete: () => void }> = ({ kicker, title, onDelete }) => <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">{kicker}</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div><button onClick={onDelete} className="flex min-h-11 items-center gap-2 rounded-xl border border-red-400/30 px-3 text-xs font-bold text-red-300"><Trash2 className="h-4 w-4" />Supprimer</button></div>;

const ProductEditor: React.FC<{ selected: MenuItem; draft: SiteContent; label: string; input: string; imageStatus: string; onDelete: () => void; onPatch: (patch: Partial<MenuItem>) => void; onImage: (file?: File) => void }> = ({ selected, draft, label, input, imageStatus, onDelete, onPatch, onImage }) => <div className="h-fit rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><EditorHeader kicker="Fiche produit" title={selected.nameFr} onDelete={onDelete} /><div className="grid gap-4 md:grid-cols-2"><label><span className={label}>Nom français</span><input className={input} value={selected.nameFr} onChange={e => onPatch({ nameFr: e.target.value })} /></label><label dir="rtl"><span className={label}>الاسم بالعربية</span><input className={input} value={selected.nameAr} onChange={e => onPatch({ nameAr: e.target.value })} /></label><label><span className={label}>Catégorie</span><select className={input} value={selected.categoryId} onChange={e => onPatch({ categoryId: e.target.value as MenuItem['categoryId'] })}>{draft.categories.filter(c => c.id !== 'supplements' && c.id !== 'informations').map(c => <option key={c.id} value={c.id}>{c.nameFr}</option>)}</select></label><label><span className={label}>Badge</span><select className={input} value={selected.badgeType ?? ''} onChange={e => onPatch({ badgeType: e.target.value ? e.target.value as MenuItem['badgeType'] : undefined, badgeFr: e.target.value === 'promo' ? 'Promo' : selected.badgeFr, badgeAr: e.target.value === 'promo' ? 'عرض' : selected.badgeAr })}>{badgeOptions.map(value => <option key={value} value={value}>{value || 'Aucun'}</option>)}</select></label><label><span className={label}>Libellé badge FR</span><input className={input} value={selected.badgeFr ?? ''} onChange={e => onPatch({ badgeFr: e.target.value })} /></label><label dir="rtl"><span className={label}>Libellé badge AR</span><input className={input} value={selected.badgeAr ?? ''} onChange={e => onPatch({ badgeAr: e.target.value })} /></label><label className="md:col-span-2"><span className={label}>Description française</span><textarea rows={3} className={input} value={selected.descriptionFr ?? ''} onChange={e => onPatch({ descriptionFr: e.target.value })} /></label><label dir="rtl" className="md:col-span-2"><span className={label}>الوصف بالعربية</span><textarea rows={3} className={input} value={selected.descriptionAr ?? ''} onChange={e => onPatch({ descriptionAr: e.target.value })} /></label><label className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={selected.isAvailable !== false} onChange={e => onPatch({ isAvailable: e.target.checked })} className="accent-[#C81024]" />Disponible</label><label className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={Boolean(selected.prices)} onChange={e => onPatch(e.target.checked ? { prices: { petite: selected.singlePrice ?? 0, moyenne: selected.singlePrice ?? 0, grande: selected.singlePrice ?? 0 }, singlePrice: undefined } : { singlePrice: selected.prices?.moyenne ?? 0, prices: undefined })} className="accent-[#C81024]" />Prix par taille</label></div><div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-2"><h3 className="md:col-span-2 text-sm font-black">Prix en DH</h3>{selected.prices ? sizes.map(size => <label key={size}><span className={label}>{size}</span><input type="number" min="0" className={input} value={selected.prices?.[size] ?? 0} onChange={e => onPatch({ prices: { ...selected.prices!, [size]: Number(e.target.value) } })} /></label>) : <label><span className={label}>Prix unique</span><input type="number" min="0" className={input} value={selected.singlePrice ?? 0} onChange={e => onPatch({ singlePrice: Number(e.target.value) })} /></label>}<label><span className={label}>Ancien prix barré</span><input type="number" min="0" className={input} value={selected.originalPrice ?? ''} onChange={e => onPatch({ originalPrice: e.target.value ? Number(e.target.value) : undefined })} /></label><label><span className={label}>Prix promo</span><input type="number" min="0" className={input} value={selected.promoPrice ?? ''} onChange={e => onPatch({ promoPrice: e.target.value ? Number(e.target.value) : undefined, badgeType: e.target.value ? 'promo' : selected.badgeType })} /></label></div><div className="mt-5"><span className={label}>Photo du produit</span><div className="grid gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 sm:grid-cols-[140px_1fr]"><img src={selected.image} alt={`Aperçu ${selected.nameFr}`} className="h-32 w-full rounded-xl bg-black object-cover" /><div className="flex flex-col justify-center"><label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD800] px-4 text-sm font-black text-black hover:bg-[#ffe43c]"><ImagePlus className="h-5 w-5" />Importer et optimiser<input type="file" accept="image/*" className="sr-only" onChange={e => { void onImage(e.target.files?.[0]); e.target.value = ''; }} /></label><p className="mt-2 text-[11px] leading-relaxed text-white/40">Tous les fichiers image lisibles par le navigateur sont acceptés. Ils sont optimisés en WebP à 800 px maximum.</p>{imageStatus && <p className="mt-2 text-[11px] font-bold text-emerald-400">{imageStatus}</p>}</div></div><label className="mt-3 block"><span className={label}>Lien d’image ou chemin local</span><input className={input} value={selected.image.startsWith('data:') ? '' : selected.image} placeholder="https://exemple.com/photo.jpg ou /assets/menu/photo.webp" onChange={e => onPatch({ image: e.target.value })} /></label><p className="mt-2 text-[11px] text-white/40">Un lien https est affiché directement. Pour optimiser et stocker l’image sur le site, utilisez plutôt “Importer et optimiser”.</p></div></div>;

const ComboEditor: React.FC<{ combo: ComboDeal; label: string; input: string; onDelete: () => void; onPatch: (patch: Partial<ComboDeal>) => void }> = ({ combo, label, input, onDelete, onPatch }) => <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><EditorHeader kicker="Formule menu" title={combo.titleFr} onDelete={onDelete} /><div className="grid gap-4 md:grid-cols-2"><label><span className={label}>Titre FR</span><input className={input} value={combo.titleFr} onChange={e => onPatch({ titleFr: e.target.value })} /></label><label dir="rtl"><span className={label}>Titre AR</span><input className={input} value={combo.titleAr} onChange={e => onPatch({ titleAr: e.target.value })} /></label><label><span className={label}>Supplément DH</span><input type="number" min="0" className={input} value={combo.priceSupplement} onChange={e => onPatch({ priceSupplement: Number(e.target.value) })} /></label><label><span className={label}>Identifiant</span><input className={input} value={combo.id} onChange={e => onPatch({ id: slug(e.target.value) })} /></label><label className="md:col-span-2"><span className={label}>Description FR</span><textarea rows={3} className={input} value={combo.descriptionFr} onChange={e => onPatch({ descriptionFr: e.target.value })} /></label><label dir="rtl" className="md:col-span-2"><span className={label}>Description AR</span><textarea rows={3} className={input} value={combo.descriptionAr} onChange={e => onPatch({ descriptionAr: e.target.value })} /></label><label><span className={label}>Éléments inclus FR, un par ligne</span><textarea rows={5} className={input} value={toLines(combo.includedItemsFr)} onChange={e => onPatch({ includedItemsFr: fromLines(e.target.value) })} /></label><label dir="rtl"><span className={label}>العناصر بالعربية</span><textarea rows={5} className={input} value={toLines(combo.includedItemsAr)} onChange={e => onPatch({ includedItemsAr: fromLines(e.target.value) })} /></label></div></div>;
const SupplementEditor: React.FC<{ supplement: PizzaSupplement; label: string; input: string; onDelete: () => void; onPatch: (patch: Partial<PizzaSupplement>) => void }> = ({ supplement, label, input, onDelete, onPatch }) => <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><EditorHeader kicker="Supplément pizza" title={supplement.nameFr} onDelete={onDelete} /><div className="grid gap-4 md:grid-cols-2"><label><span className={label}>Nom FR</span><input className={input} value={supplement.nameFr} onChange={e => onPatch({ nameFr: e.target.value })} /></label><label dir="rtl"><span className={label}>Nom AR</span><input className={input} value={supplement.nameAr} onChange={e => onPatch({ nameAr: e.target.value })} /></label><label><span className={label}>Identifiant</span><input className={input} value={supplement.id} onChange={e => onPatch({ id: slug(e.target.value) })} /></label><label className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={Boolean(supplement.prices)} onChange={e => onPatch(e.target.checked ? { prices: { petite: supplement.singlePrice ?? 0, moyenne: supplement.singlePrice ?? 0, grande: supplement.singlePrice ?? 0 }, singlePrice: undefined } : { singlePrice: supplement.prices?.moyenne ?? 0, prices: undefined })} className="accent-[#C81024]" />Prix par taille</label>{supplement.prices ? sizes.map(size => <label key={size}><span className={label}>{size}</span><input type="number" min="0" className={input} value={supplement.prices?.[size] ?? 0} onChange={e => onPatch({ prices: { ...supplement.prices!, [size]: Number(e.target.value) } })} /></label>) : <label><span className={label}>Prix unique</span><input type="number" min="0" className={input} value={supplement.singlePrice ?? 0} onChange={e => onPatch({ singlePrice: Number(e.target.value) })} /></label>}</div></div>;
const RestaurantEditor: React.FC<{ draft: SiteContent; label: string; input: string; onUpdate: (key: keyof SiteContent['restaurantInfo'], value: string) => void }> = ({ draft, label, input, onUpdate }) => <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">Informations publiques</p><h2 className="mt-1 text-2xl font-black">Restaurant</h2></div><div className="grid gap-4 md:grid-cols-2">{([['phoneDisplay','Téléphone affiché'],['phone','Téléphone (lien)'],['whatsapp','WhatsApp (indicatif pays)'],['openingHoursFr','Horaires français'],['openingHoursAr','Horaires arabes'],['addressFr','Adresse française'],['addressAr','Adresse arabe'],['instagram','Lien Instagram'],['facebook','Lien Facebook'],['mapsUrl','Lien Google Maps']] as [keyof SiteContent['restaurantInfo'], string][]).map(([key,text]) => <label key={key} className={key.startsWith('address') || key.endsWith('Url') ? 'md:col-span-2' : ''}><span className={label}>{text}</span><input dir={key.endsWith('Ar') ? 'rtl' : 'ltr'} className={input} value={draft.restaurantInfo[key]} onChange={e => onUpdate(key, e.target.value)} /></label>)}</div></section>;
