
import type { Product, Category } from "@/types";
import { getStripeProducts } from '@/lib/stripe';

let categories: Category[] = [
  { id: 'tops', name: 'Tops' },
  { id: 'bottoms', name: 'Bottoms' },
  { id: 'hats', name: 'Hats' },
  { id: 'bundles', name: 'Bundles' },
  { id: 'men', name: 'Men' },
  { id: 'adults', name: 'Adults' },
  { id: 'new-arrivals', name: 'New Arrivals' },
];

export async function getProducts(options?: { limit?: number, category?: string, sort?: 'best-selling' | 'newest' }): Promise<Product[]> {
  let products = await getStripeProducts();

  if (options?.category) {
    products = products.filter(p => p.category === options.category);
  }

  if (options?.sort === 'best-selling') {
    products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (options?.sort === 'newest') {
    products.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0)).reverse();
  }

  if (options?.limit) {
    return products.slice(0, options.limit);
  }
  
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getStripeProducts();
  const product = products.find(p => p.id === id);
  if (product) return product;

  // Check variants
  for (const p of products) {
    if (p.variants) {
      const variant = p.variants.find(v => v.id === id);
      if (variant) {
        return {
          ...p,
          id: variant.id,
          name: variant.name,
          price: variant.price,
          images: [variant.image],
          hoverVideo: variant.hoverVideo
        };
      }
    }
  }

  return undefined;
}

export async function getBestsellers(): Promise<Product[]> {
  const products = await getStripeProducts();
  return products
    .filter(p => p.rating && p.rating > 4.6)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

export function getCategories(): Category[] {
  return categories;
}

export async function getFilterOptions(): Promise<{
  sizes: string[];
  colors: string[];
  styles: string[];
  priceRange: [number, number];
}> {
  const products = await getStripeProducts();
  const prices = products.map(p => p.price).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 300;
  
  return {
    sizes: [...new Set(products.flatMap(p => p.sizes))],
    colors: [...new Set(products.flatMap(p => p.colors.map(c => c.name)))],
    styles: [...new Set(products.map(p => p.category))],
    priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)],
  };
}
