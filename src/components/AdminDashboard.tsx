import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, KeyRound, RotateCcw, Save, Search, Store, UtensilsCrossed } from 'lucide-react';
import { MenuItem } from '../types';
import { changeAdminPassword, DEFAULT_SITE_CONTENT, loadOnlineContent, publishSiteContent, readLegacyContent, SiteContent } from '../data/contentStore';
import { Logo } from './Logo';

export const AdminDashboard: React.FC<{ content: SiteContent; onExit: () => void }> = ({ content, onExit }) => {
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState<'products' | 'restaurant'>('products');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(content.menuItems[0]?.id ?? '');
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [revision, setRevision] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Chargement du contenu en ligne…');
  const [legacy] = useState(readLegacyContent);
  const load = async () => {
    setBusy(true);
    try { const result = await loadOnlineContent(); setDraft(result.content); setRevision(result.revision); setStatus('Contenu en ligne chargé.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Connexion impossible.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const [imageStatus, setImageStatus] = useState('');
  const selected = draft.menuItems.find((item) => item.id === selectedId);
  const filtered = useMemo(() => draft.menuItems.filter((item) => `${item.nameFr} ${item.nameAr}`.toLowerCase().includes(query.toLowerCase())), [draft.menuItems, query]);
  const input = 'min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-[#FFD800]/70';
  const label = 'mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/45';

  const updateProduct = (patch: Partial<MenuItem>) => setDraft((current) => ({ ...current, menuItems: current.menuItems.map((item) => item.id === selectedId ? { ...item, ...patch } : item) }));
  const updateRestaurant = (key: keyof SiteContent['restaurantInfo'], value: string) => setDraft((current) => ({ ...current, restaurantInfo: { ...current.restaurantInfo, [key]: value } }));
  const save = async () => {
    if (busy) return;
    if (revision === null) { setStatus('Chargez d’abord le contenu en ligne.'); return; }
    setBusy(true); setSaved(false); setStatus('Publication des modifications et des photos…');
    try { const result = await publishSiteContent(draft, revision, password); setDraft(result.content); setRevision(result.revision); setSaved(true); setStatus('Publié en ligne : vos modifications sont visibles par tous.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Publication impossible.'); }
    finally { setBusy(false); }
  };
  const updatePassword = async () => {
    if (busy) return;
    setBusy(true); setSaved(false); setStatus('Changement du mot de passe administrateur…');
    try {
      await changeAdminPassword(password, newPassword);
      setPassword(newPassword.trim());
      setNewPassword('');
      setStatus('Mot de passe administrateur modifié. L’ancien mot de passe est annulé.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Changement impossible.');
    } finally { setBusy(false); }
  };
  const reset = () => { if (!busy && window.confirm('Charger les données d’origine dans le formulaire ? Elles seront publiées seulement après Enregistrer.')) { setDraft(structuredClone(DEFAULT_SITE_CONTENT)); setStatus('Données d’origine chargées dans le formulaire. Enregistrez pour les publier.'); } };
  const importImage = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const targetId = selectedId;
    setImageStatus('Optimisation en cours…');
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const optimized = canvas.toDataURL('image/webp', 0.78);
      const approximateBytes = Math.round((optimized.length - optimized.indexOf(',') - 1) * 0.75);
      if (approximateBytes > 1024 * 1024) throw new Error('Photo trop volumineuse.');
      setDraft(current => ({ ...current, menuItems: current.menuItems.map(item => item.id === targetId ? { ...item, image: optimized } : item) }));
      setImageStatus(`Optimisée en WebP · ${width}×${height} px · ${(approximateBytes / 1024).toFixed(0)} Ko`);
    } catch {
      setImageStatus('Impossible de traiter cette image. Utilisez JPG, PNG ou WebP.');
    }
  };

  return <div className="min-h-screen bg-[#070707] text-white font-body">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3"><span className="rounded-lg bg-white px-2 py-1"><Logo className="h-9 w-auto" /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FFD800]">Administration</p><h1 className="text-sm font-black sm:text-lg">Tableau de bord</h1></div></div>
      <div className="flex items-center gap-2"><button onClick={onExit} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold hover:bg-white/10"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Voir le site</span></button><button onClick={save} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#C81024] px-4 text-xs font-black"><Save className="h-4 w-4" />{saved ? 'Enregistré' : 'Enregistrer'}{saved && <Check className="h-4 w-4" />}</button></div>
    </div></header>

    <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6" aria-label="Publication en ligne">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1"><span className={label}>Mot de passe administrateur</span><input type="password" autoComplete="current-password" className={input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nécessaire pour publier" /></label>
          <button disabled={busy} onClick={() => { if (window.confirm('Recharger la version en ligne et remplacer les modifications du formulaire ?')) void load(); }} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-50">Recharger en ligne</button>
          {legacy && <button disabled={busy} onClick={() => { if (window.confirm('Récupérer les anciennes modifications de ce navigateur dans le formulaire ?')) { setDraft(legacy); setStatus('Anciennes modifications récupérées. Enregistrez pour les publier en ligne.'); } }} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm disabled:opacity-50">Récupérer mes anciennes modifications</button>}
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-[#FFD800]">{status}</p>
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1"><span className={label}>Nouveau mot de passe</span><input type="password" autoComplete="new-password" className={input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Exemple : 1234" /></label>
            <button disabled={busy || newPassword.trim().length < 4} onClick={updatePassword} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FFD800]/40 px-4 text-sm font-bold text-[#FFD800] disabled:opacity-50"><KeyRound className="h-4 w-4" />Changer le mot de passe</button>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50">Enregistrer publie les modifications sur le site pour tous les appareils. Le mot de passe par défaut est 1234, puis vous pouvez le changer ici.</p>
      </div>
    </section>
    <main aria-busy={busy} className={`mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[230px_1fr] ${busy || revision === null ? 'pointer-events-none opacity-50' : ''}`} inert={busy || revision === null}>
      <aside className="h-fit rounded-2xl border border-white/10 bg-[#111] p-2 lg:sticky lg:top-24"><div className="grid grid-cols-2 gap-2 lg:grid-cols-1"><button onClick={() => setTab('products')} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold ${tab === 'products' ? 'bg-[#C81024]' : 'text-white/60 hover:bg-white/5'}`}><UtensilsCrossed className="h-5 w-5" />Produits</button><button onClick={() => setTab('restaurant')} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold ${tab === 'restaurant' ? 'bg-[#C81024]' : 'text-white/60 hover:bg-white/5'}`}><Store className="h-5 w-5" />Restaurant</button></div><button onClick={reset} className="mt-3 flex min-h-11 w-full items-center gap-3 border-t border-white/10 px-4 pt-3 text-xs font-bold text-white/45 hover:text-white"><RotateCcw className="h-4 w-4" />Restaurer l’origine</button></aside>

      {tab === 'products' ? <section className="grid min-w-0 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"><div className="border-b border-white/10 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit" className={`${input} pl-10`} /></div><p className="mt-2 text-[11px] text-white/35">{filtered.length} produits</p></div><div className="max-h-[65vh] overflow-y-auto p-2">{filtered.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`mb-1 flex min-h-16 w-full items-center gap-3 rounded-xl p-2 text-left ${selectedId === item.id ? 'bg-[#C81024]/20 ring-1 ring-[#C81024]' : 'hover:bg-white/5'}`}><img src={item.image} alt="" className="h-12 w-12 rounded-lg bg-black object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.nameFr}</span><span className="text-[10px] text-white/40">{item.singlePrice ?? item.prices?.petite ?? 0} DH · {item.categoryId}</span></span><span className={`h-2.5 w-2.5 rounded-full ${item.isAvailable === false ? 'bg-red-500' : 'bg-emerald-400'}`} /></button>)}</div></div>
        {selected && <div className="h-fit rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">Fiche produit</p><h2 className="mt-1 text-2xl font-black">{selected.nameFr}</h2></div><label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={selected.isAvailable !== false} onChange={(e) => updateProduct({ isAvailable: e.target.checked })} className="accent-[#C81024]" />Disponible</label></div>
          <div className="grid gap-4 md:grid-cols-2"><label><span className={label}>Nom français</span><input className={input} value={selected.nameFr} onChange={(e) => updateProduct({ nameFr: e.target.value })} /></label><label dir="rtl"><span className={label}>الاسم بالعربية</span><input className={input} value={selected.nameAr} onChange={(e) => updateProduct({ nameAr: e.target.value })} /></label><label className="md:col-span-2"><span className={label}>Description française</span><textarea rows={3} className={input} value={selected.descriptionFr ?? ''} onChange={(e) => updateProduct({ descriptionFr: e.target.value })} /></label><label dir="rtl" className="md:col-span-2"><span className={label}>الوصف بالعربية</span><textarea rows={3} className={input} value={selected.descriptionAr ?? ''} onChange={(e) => updateProduct({ descriptionAr: e.target.value })} /></label><div className="md:col-span-2"><span className={label}>Photo du produit</span><div className="grid gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 sm:grid-cols-[140px_1fr]"><img src={selected.image} alt={`Aperçu ${selected.nameFr}`} className="h-32 w-full rounded-xl bg-black object-cover" /><div className="flex flex-col justify-center"><label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FFD800] px-4 text-sm font-black text-black hover:bg-[#ffe43c]"><ImagePlus className="h-5 w-5" />Importer et optimiser<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { void importImage(e.target.files?.[0]); e.target.value = ''; }} /></label><p className="mt-2 text-[11px] leading-relaxed text-white/40">JPG, PNG ou WebP. Redimensionnement automatique à 800 px maximum et compression WebP.</p>{imageStatus && <p className="mt-2 text-[11px] font-bold text-emerald-400">{imageStatus}</p>}</div></div><details className="mt-2"><summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-white/35">Modifier le chemin manuellement</summary><input className={`${input} mt-2`} value={selected.image.startsWith('data:') ? '' : selected.image} placeholder="/assets/menu/photo.webp" onChange={(e) => updateProduct({ image: e.target.value })} /></details></div></div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4"><h3 className="mb-3 text-sm font-black">Prix en DH</h3>{selected.prices ? <div className="grid grid-cols-3 gap-3">{(['petite','moyenne','grande'] as const).map((size) => <label key={size}><span className={label}>{size}</span><input type="number" min="0" className={input} value={selected.prices?.[size] ?? 0} onChange={(e) => updateProduct({ prices: { ...selected.prices!, [size]: Number(e.target.value) } })} /></label>)}</div> : <label><span className={label}>Prix unique</span><input type="number" min="0" className={input} value={selected.singlePrice ?? 0} onChange={(e) => updateProduct({ singlePrice: Number(e.target.value) })} /></label>}</div>
        </div>}
      </section> : <section className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6"><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">Informations publiques</p><h2 className="mt-1 text-2xl font-black">Restaurant</h2></div><div className="grid gap-4 md:grid-cols-2">{([
        ['phoneDisplay','Téléphone affiché'],['phone','Téléphone (lien)'],['whatsapp','WhatsApp (indicatif pays)'],['openingHoursFr','Horaires français'],['openingHoursAr','Horaires arabes'],['addressFr','Adresse française'],['addressAr','Adresse arabe'],['instagram','Lien Instagram'],['facebook','Lien Facebook'],['mapsUrl','Lien Google Maps'],
      ] as [keyof SiteContent['restaurantInfo'], string][]).map(([key,text]) => <label key={key} className={key.startsWith('address') || key.endsWith('Url') ? 'md:col-span-2' : ''}><span className={label}>{text}</span><input dir={key.endsWith('Ar') ? 'rtl' : 'ltr'} className={input} value={draft.restaurantInfo[key]} onChange={(e) => updateRestaurant(key, e.target.value)} /></label>)}</div></section>}
    </main>
  </div>;
};
