
'use server';

import { getProducts as getStripeProducts, getFilterOptions as getStripeFilterOptions } from '@/lib/products';
import type { Product, FilterOptions } from '@/types';

/**
 * Server Action to fetch products safely without exposing STRIPE_SECRET_KEY to the client.
 */
export async function fetchProductsAction(options?: { category?: string; sort?: 'best-selling' | 'newest' }) {
  try {
    return await getStripeProducts(options);
  } catch (error) {
    console.error("Error in fetchProductsAction:", error);
    return [];
  }
}

/**
 * Server Action to fetch filter options (price ranges, etc) based on live Stripe data.
 */
export async function fetchFilterOptionsAction() {
  try {
    return await getStripeFilterOptions();
  } catch (error) {
    console.error("Error in fetchFilterOptionsAction:", error);
    return {
      sizes: [],
      colors: [],
      styles: [],
      priceRange: [0, 300] as [number, number],
    };
  }
}
