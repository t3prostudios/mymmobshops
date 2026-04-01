export type Image = {
  id: string;
  description: string;
  url: string;
  hint: string;
  author?: string;
}

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  image: Image;
  size: string;
  hoverVideo?: string;
  weight?: number;
};

export type Stock = {
    size: string;
    color: string;
    quantity: number;
    weight?: number; // Size-specific weight (in oz)
    skuId?: string;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Image[];
  alternateImages?: Image[];
  hoverVideo?: string;
  style: string;
  sizes: string[];
  colors: { name: string, hex: string, logoType: string }[];
  bestseller?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  features?: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: { id: string; author: string; rating: number; title: string; comment: string; date: string; avatarUrl: string }[];
  stock: Stock[];
  category: string;
  weight: number; // Default weight (in oz)
  sizeWeights?: Record<string, number>; // Mapping of Size -> Ounces
  variants?: {
    type: string;
    id: string;
    name: string;
    price: number;
    image: Image;
    hoverVideo?: string;
    weight: number;
  }[];
};

export type CartItem = {
  id: string;
  product: Product & { variant?: ProductVariant | Product['variants'][0] };
  quantity: number;
};

export type FilterOptions = {
  sizes: string[];
  colors: string[];
  styles: string[];
  price: [number, number];
};

export type Category = {
  id: string;
  name: string;
}

export type UserAccount = {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationDate: string;
  loyaltyPoints?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  prizeLabel?: string;
  prizeExpiry?: number;
}

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  deliveryMethod: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  } | null;
  orderItems: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  status: 'new' | 'fulfilled' | 'cancelled';
}

export type Complaint = {
    id: string;
    name: string;
    email: string;
    issue: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    status: 'new' | 'in-progress' | 'resolved' | 'escalated';
    resolvedAt?: {
        seconds: number;
        nanoseconds: number;
    };
}

export type Review = {
    id: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    authorName: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export interface ShippingAddress {
  country: string;
  state: string;
  city: string;
}
