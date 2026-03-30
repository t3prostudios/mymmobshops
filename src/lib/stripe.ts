
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
    'baby blue': '#ADD8E6',
    'red': '#FF0000',
    'black': '#000000',
    'white': '#FFFFFF',
    'khaki': '#F0E68C', 
    'blue': '#2563eb',
    'yellow': '#facc15',
    'light wash': '#a5d8ff',
    'ivory': '#fffff0',
    'olive green': '#556b2f',
    'green': '#008000',
    'charcoal': '#36454F',
    'pink': '#FFC0CB',
    'natural': '#F5F5DC',
    'brown': '#8B4513'
};

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
            // Robust weight lookup: check exact match, then uppercase match
            let weight = defaultWeight;
            if (sizeWeights) {
                // Find weight by normalized size key
                const normalizedSize = size.toUpperCase();
                const weightKey = Object.keys(sizeWeights).find(k => k.toUpperCase() === normalizedSize);
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
      const defaultWeight = local?.weight || 8;
      
      const stock = parseMetadataToStock(product.metadata, defaultWeight, local?.sizeWeights);
      
      const sizes = Array.from(new Set(stock.map(s => s.size)));
      const colorNames = Array.from(new Set(stock.map(s => s.color)));
      const colors = colorNames.map(name => ({
        name,
        hex: colorHexMap[name.toLowerCase()] || '#000000'
      }));

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
        reviewCount: local?.reviewCount || 0
      } as Product;
    }).filter((p): p is Product => p !== null);

  } catch (error: any) {
    console.error("STRIPE API ERROR:", error.message);
    return [];
  }
}
