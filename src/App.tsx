import React, { useEffect, useMemo, useState } from 'react';
import { Award, Clock, Flame, ShoppingBag, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { CompactProductCard } from './components/CompactProductCard';
import { SupplementsSection } from './components/SupplementsSection';
import { CombosSection } from './components/CombosSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { QuickMobileBar } from './components/QuickMobileBar';
import { CartItem, CategoryId, Language, MenuItem } from './types';
import { useSiteContent } from './data/contentStore';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

type CatalogueSectionId = CategoryId | 'popular';
const CART_STORAGE_KEY = 'tasty-pizza-cart-v2';

export default function App() {
  const content = useSiteContent();
  const [adminMode, setAdminMode] = useState(() => window.location.hash === '#admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [lang, setLang] = useState<Language>('fr');
  const [activeCategory, setActiveCategory] = useState<CatalogueSectionId>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('accueil');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]') as CartItem[]; } catch { return []; }
  });

  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }, [lang]);
  useEffect(() => { const sync = () => { const enabled = window.location.hash === '#admin'; setAdminMode(enabled); if (!enabled) setAdminPassword(''); }; window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
  useEffect(() => { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (searchQuery) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveCategory(visible.target.getAttribute('data-catalogue-section') as CatalogueSectionId);
    }, { rootMargin: '-190px 0px -55% 0px', threshold: [0.05, 0.25, 0.5] });
    document.querySelectorAll('[data-catalogue-section]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [searchQuery]);

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const matchesSearch = (item: MenuItem) => !normalizedSearch || [item.nameFr, item.nameAr, item.descriptionFr, item.descriptionAr].some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
  const availableItems = content.menuItems.filter((item) => item.isAvailable !== false);
  const matchedProducts = useMemo(() => availableItems.filter(matchesSearch), [normalizedSearch, content.menuItems]);
  const popularProducts = availableItems.filter((item) => item.badgeType === 'popular' || item.badgeType === 'signature' || item.badgeType === 'promo').filter(matchesSearch);
  const visibleCategories = content.categories.filter((category) => category.id !== 'supplements' && category.id !== 'informations').map((category) => ({ category, items: availableItems.filter((item) => item.categoryId === category.id).filter(matchesSearch) })).filter(({ items }) => items.length > 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const targetId = sectionId === 'catalogue' || sectionId === 'produits' ? 'catalogue-section' : sectionId;
    if (sectionId === 'accueil') window.scrollTo({ top: 0, behavior: 'smooth' }); else document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };
  const selectCategory = (id: CatalogueSectionId) => {
    setSearchQuery(''); setActiveCategory(id);
    document.getElementById(`menu-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const addToCart = (newItem: CartItem) => {
    setCart((current) => { const existing = current.find((item) => item.cartId === newItem.cartId); return existing ? current.map((item) => item.cartId === newItem.cartId ? { ...item, quantity: item.quantity + newItem.quantity } : item) : [...current, newItem]; });
    setCartOpen(true);
  };

  const Feature = ({ icon, titleFr, titleAr, textFr, textAr }: { icon: React.ReactNode; titleFr: string; titleAr: string; textFr: string; textAr: string }) => <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#141414] p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C81024]/20 text-[#FFD800]">{icon}</span><div><h3 className="text-xs font-black uppercase text-white">{lang === 'fr' ? titleFr : titleAr}</h3><p className="mt-1 text-[11px] text-white/40">{lang === 'fr' ? textFr : textAr}</p></div></div>;
  const ProductGrid = ({ items }: { items: MenuItem[] }) => <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{items.map((item) => <CompactProductCard key={item.id} item={item} lang={lang} onSelect={setSelectedProduct} />)}</div>;
  const PopularCarousel = ({ items }: { items: MenuItem[] }) => <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pe-4">{items.map((item) => <div key={item.id} className="w-[86vw] max-w-[390px] shrink-0 snap-start sm:w-[370px] lg:w-[430px] lg:max-w-[430px]"><CompactProductCard item={item} lang={lang} onSelect={setSelectedProduct} /></div>)}</div>;

  if (adminMode && !adminPassword) return <AdminLogin onSuccess={setAdminPassword} onExit={() => { window.location.hash = ''; setAdminMode(false); }} />;
  if (adminMode) return <AdminDashboard content={content} adminPassword={adminPassword} onPasswordChanged={setAdminPassword} onExit={() => { setAdminPassword(''); window.location.hash = ''; setAdminMode(false); }} />;

  return <div className={`min-h-screen bg-[#050505] text-white ${lang === 'ar' ? 'font-arabic' : 'font-body'}`}>
    <Header lang={lang} onToggleLang={setLang} onNavigateSection={navigate} activeSection={activeSection} />
    <main>
      <Hero lang={lang} onDiscoverClick={() => navigate('catalogue')} onContactClick={() => navigate('contact')} />
      <section className="border-b border-white/5 bg-[#0d0d0d] py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}><div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4"><Feature icon={<Flame className="h-5 w-5" />} titleFr="Pâte artisanale" titleAr="عجينة طازجة" textFr="Pétrie chaque matin" textAr="تعجن كل صباح" /><Feature icon={<Sparkles className="h-5 w-5" />} titleFr="100% Mozzarella" titleAr="موزاريلا صافية" textFr="Fondante et généreuse" textAr="غنية ولذيذة" /><Feature icon={<Award className="h-5 w-5" />} titleFr="Produits de choix" titleAr="مكونات مختارة" textFr="Frais et sélectionnés" textAr="طازجة ومختارة" /><Feature icon={<Clock className="h-5 w-5" />} titleFr="Préparé minute" titleAr="تحضير فوري" textFr="Chaud et croustillant" textAr="ساخن ومقرمش" /></div></section>

      <section id="catalogue-section" className="relative py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="mx-auto mb-6 max-w-7xl px-4"><span className="text-[10px] font-black uppercase tracking-widest text-[#FFD800]">{lang === 'fr' ? 'Notre carte' : 'قائمتنا'}</span><h2 className="mt-1 text-3xl font-black uppercase sm:text-4xl">{lang === 'fr' ? 'Choisissez votre Tasty' : 'اختر وجبتك'}</h2></div>
        <CategoryNav categories={content.categories} activeCategory={activeCategory} onSelectCategory={selectCategory} searchQuery={searchQuery} onSearchChange={setSearchQuery} lang={lang} totalResultsCount={matchedProducts.length} />
        <div id="produits" className="mx-auto max-w-7xl space-y-12 px-4 pt-8 sm:px-6 lg:px-8">
          {popularProducts.length > 0 && <section id="menu-section-popular" data-catalogue-section="popular" className="scroll-mt-48"><div className="mb-4 flex items-center justify-between gap-3"><span className="flex items-center gap-3"><Award className="h-6 w-6 text-[#FFD800]" /><h3 className="text-2xl font-black">{lang === 'fr' ? 'Populaires' : 'الأكثر طلباً'}</h3></span><span className="text-[10px] font-bold uppercase tracking-widest text-white/35">{lang === 'fr' ? 'Glissez pour découvrir →' : 'اسحب للمزيد ←'}</span></div><PopularCarousel items={popularProducts} /></section>}
          {visibleCategories.map(({ category, items }) => <section key={category.id} id={`menu-section-${category.id}`} data-catalogue-section={category.id} className="scroll-mt-48"><div className="mb-4 flex items-end justify-between border-b border-white/10 pb-3"><h3 className="text-2xl font-black">{lang === 'fr' ? category.nameFr : category.nameAr}</h3><span className="text-xs text-white/35">{items.length}</span></div><ProductGrid items={items} /></section>)}
          {!searchQuery && <><section id="menu-section-supplements" data-catalogue-section="supplements" className="scroll-mt-48"><SupplementsSection lang={lang} supplements={content.pizzaSupplements} /></section><section id="menu-section-informations" data-catalogue-section="informations" className="scroll-mt-48"><CombosSection lang={lang} deals={content.comboDeals} /></section></>}
          {searchQuery && matchedProducts.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-white/50">{lang === 'fr' ? 'Aucun produit trouvé.' : 'لم يتم العثور على أي منتج.'}</div>}
        </div>
      </section>
      <ContactSection lang={lang} />
    </main>
    <Footer lang={lang} onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    <ProductModal item={selectedProduct} comboDeals={content.comboDeals} pizzaSupplements={content.pizzaSupplements} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} lang={lang} />
    <button type="button" onClick={() => setCartOpen(true)} className="fixed bottom-20 end-4 z-50 flex min-h-12 items-center gap-2 rounded-full bg-[#FFD800] px-4 font-black text-black shadow-2xl sm:bottom-6 sm:end-6" aria-label={lang === 'fr' ? 'Ouvrir le panier' : 'فتح السلة'}><ShoppingBag className="h-5 w-5" /><span>{lang === 'fr' ? 'Panier' : 'السلة'}</span>{cartCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C81024] px-1 text-xs text-white">{cartCount}</span>}</button>
    <CartDrawer open={cartOpen} items={cart} lang={lang} onClose={() => setCartOpen(false)} onChangeQuantity={(cartId, quantity) => setCart((current) => quantity <= 0 ? current.filter((item) => item.cartId !== cartId) : current.map((item) => item.cartId === cartId ? { ...item, quantity } : item))} onRemove={(cartId) => setCart((current) => current.filter((item) => item.cartId !== cartId))} onClear={() => setCart([])} />
    <QuickMobileBar lang={lang} onNavigateSection={navigate} />
  </div>;
}
