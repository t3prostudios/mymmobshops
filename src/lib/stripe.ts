
import Stripe from 'stripe';
import { allProducts as localProducts } from '@/lib/data';
import type { Product, Stock } from '@/types';

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
};

const colorHexMap: { [key: string]: string } = {
    'grey': '#808080',
    'gray': '#808080',
    'carbon grey': '#333333',
    'carbon gray': '#333333',
    'baby blue': '#ADD8E6',
    'red': '#FF0000',
    'black': '#000000',
    'white': '#FFFFFF',
    'khaki': '#F0E68C', 
    'blue': '#2563eb',
    'yellow': '#facc15',
    'light yellow': '#FFFFE0',
    'orange': '#FFA500',
    'purple': '#800080',
    'teal': '#008080',
    'team royal': '#002366',
    'turquoise': '#40E0D0',
    'ukari red': '#990000',
    'light wash': '#a5d8ff',
    'ivory': '#fffff0',
    'olive green': '#556b2f',
    'army green': '#4B5320',
    'forest green': '#228B22',
    'green': '#008000',
    'light pink': '#FFB6C1',
    'pink': '#FFC0CB',
    'charcoal': '#36454F',
    'natural': '#F5F5DC',
    'brown': '#8B4513'
};

/**
 * Normalizes size strings for better matching between Stripe and local data.
 * E.g., converts "3XL" to "3X" if that's what's in data.ts.
 */
function normalizeSize(s: string): string {
  const upper = s.trim().toUpperCase();
  // If it's a number followed by XL (e.g. 3XL), normalize to 3X
  if (/^\d+XL$/.test(upper)) {
    return upper.replace('XL', 'X');
  }
  return upper;
}

/**
 * STRICT PARSER: Only reads the Compact Metadata Format.
 * Format: ColorKey -> "Size:Qty-Size:Qty"
 */
function parseMetadataToStock(metadata: Record<string, string>, defaultWeight: number = 8, sizeWeights?: Record<string, number>): Stock[] {
  const stock: Stock[] = [];
  const reservedKeys = ['category', 'style', 'weight', 'description', 'id', 'type', 'tax_code'];

  for (const [key, value] of Object.entries(metadata)) {
    if (reservedKeys.includes(key.toLowerCase())) continue;

    if (value && value.includes(':')) {
      const color = key.trim();
      const pairs = value.split('-');
      
      pairs.forEach(p => {
        if (!p.includes(':')) return;
        
        const parts = p.split(':');
        const size = parts[0]?.trim();
        const qtyStr = parts[1]?.trim();
        
        if (size && qtyStr) {
          const quantity = parseInt(qtyStr, 10);
          if (!isNaN(quantity)) {
            let weight = defaultWeight;
            if (sizeWeights) {
                const searchSize = normalizeSize(size);
                const weightKey = Object.keys(sizeWeights).find(k => normalizeSize(k) === searchSize);
                weight = weightKey ? sizeWeights[weightKey] : defaultWeight;
            }

            stock.push({
              color,
              size,
              quantity,
              weight
            });
          }
        }
      });
    }
  }

  return stock;
}

export async function getStripeProducts(): Promise<Product[]> {
  const stripe = getStripeClient();
  if (!stripe) {
    console.error("CRITICAL: STRIPE_SECRET_KEY is missing. Stripe connection unavailable.");
    return []; 
  }

  try {
    const productsRes = await stripe.products.list({ 
      active: true, 
      limit: 100 
    });

    const pricesRes = await stripe.prices.list({ 
      active: true, 
      limit: 100 
    });

    return productsRes.data.map(product => {
      const priceObj = pricesRes.data.find(p => p.product === product.id);
      if (!priceObj) return null;

      const local = localProducts.find(p => p.id === product.id);
      
      const stripeWeight = product.metadata.weight ? parseFloat(product.metadata.weight) : null;
      const defaultWeight = stripeWeight || local?.weight || 8;
      
      const stock = parseMetadataToStock(product.metadata, defaultWeight, local?.sizeWeights);
      
      const sizes = Array.from(new Set(stock.map(s => s.size)));
      const colorNames = Array.from(new Set(stock.map(s => s.color)));
      
      const colors = colorNames.map(name => {
        const isBW = name.toLowerCase().includes('b&w logo');
        const logoType = isBW ? 'B&W Logo' : 'Color Logo';
        const baseColorName = name.split('(')[0].trim().toLowerCase();
        
        return {
          name,
          hex: colorHexMap[baseColorName] || '#000000',
          logoType
        };
      });

      return {
        id: product.id,
        name: product.name,
        description: product.description || local?.description || '',
        price: priceObj.unit_amount ? priceObj.unit_amount / 100 : 0,
        images: product.images.map((url, i) => ({ id: `img-${i}`, url, description: product.name, hint: '' })),
        category: product.metadata.category || local?.category || 'uncategorized',
        style: product.metadata.style || local?.style || 'default',
        stock,
        sizes: sizes.length ? sizes : (local?.sizes || []),
        colors: colors.length ? colors : (local?.colors || []),
        weight: defaultWeight,
        sizeWeights: local?.sizeWeights,
        features: local?.features || [],
        rating: local?.rating || 5,
        reviewCount: local?.reviewCount || 0,
        isNew: product.created > (Date.now() / 1000) - (30 * 24 * 60 * 60)
      } as Product;
    }).filter((p): p is Product => p !== null);

  } catch (error: any) {
    console.error("STRIPE API ERROR:", error.message);
    return [];
  }
}
