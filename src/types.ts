export type Language = 'fr' | 'ar';

export type CategoryId =
  | 'pizzas'
  | 'pizza-turque'
  | 'baguetta'
  | 'panozzo'
  | 'piadina'
  | 'tacos'
  | 'pasticcio'
  | 'wraps'
  | 'box'
  | 'poutines'
  | 'boissons'
  | 'supplements'
  | 'informations';

export interface Category {
  id: CategoryId;
  nameFr: string;
  nameAr: string;
  iconName: string;
  count?: number;
}

export interface PizzaSizes {
  petite: number;
  moyenne: number;
  grande: number;
}

export interface MenuItem {
  id: string;
  categoryId: CategoryId;
  nameFr: string;
  nameAr: string;
  descriptionFr?: string;
  descriptionAr?: string;
  prices?: PizzaSizes; // for pizzas
  singlePrice?: number; // for single format items
  formatLabelFr?: string;
  formatLabelAr?: string;
  badgeFr?: string;
  badgeAr?: string;
  badgeType?: 'signature' | 'popular' | 'hot' | 'veggie';
  image: string;
  isAvailable?: boolean;
}

export interface PizzaSupplement {
  nameFr: string;
  nameAr: string;
  prices?: {
    petite: number;
    moyenne: number;
    grande: number;
  };
  singlePrice?: number;
}

export interface ComboDeal {
  id: string;
  titleFr: string;
  titleAr: string;
  priceSupplement: number;
  descriptionFr: string;
  descriptionAr: string;
  includedItemsFr: string[];
  includedItemsAr: string[];
}

export type SelectedSize = 'petite' | 'moyenne' | 'grande';

export interface SelectedSupplement {
  nameFr: string;
  nameAr: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  nameFr: string;
  nameAr: string;
  image: string;
  size?: SelectedSize;
  supplements: SelectedSupplement[];
  comboId?: string;
  comboTitleFr?: string;
  comboTitleAr?: string;
  quantity: number;
  unitPrice: number;
}

export interface ContactInfo {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  addressFr: string;
  addressAr: string;
  openingHoursFr: string;
  openingHoursAr: string;
  instagram: string;
  facebook: string;
  mapsUrl: string;
}
