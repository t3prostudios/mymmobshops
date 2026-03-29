import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Updates Stripe Product Metadata to adjust stock.
 * Operates on the "Compact Format": ColorKey -> "Size:Qty-Size:Qty"
 */
export async function POST(req: NextRequest) {
  try {
    const { updates, operation } = await req.json();

    if (!Array.isArray(updates) || !operation || !stripe) {
      return NextResponse.json({ error: 'Invalid request body or Stripe unavailable' }, { status: 400 });
    }

    for (const update of updates) {
      const product = await stripe.products.retrieve(update.productId);
      const metadata = { ...product.metadata };
      
      // We look for the color key in metadata
      const colorKey = update.color;
      const sizeTarget = update.size;
      const currentVal = metadata[colorKey];

      if (currentVal && currentVal.includes(':')) {
        // Handle Compact Format: "S:10-M:5"
        const pairs = currentVal.split('-').map(p => {
          const [size, qty] = p.split(':');
          if (size === sizeTarget) {
            const currentQty = parseInt(qty, 10);
            const newQty = operation === 'decrement' 
              ? Math.max(0, currentQty - update.quantity) 
              : update.quantity;
            return `${size}:${newQty}`;
          }
          return p;
        });
        metadata[colorKey] = pairs.join('-');
      } else {
        // Handle Standard Format: "Color-Size" key
        const standardKey = `${update.color}-${update.size}`;
        if (metadata[standardKey]) {
          const currentQty = parseInt(metadata[standardKey], 10);
          metadata[standardKey] = operation === 'decrement' 
            ? String(Math.max(0, currentQty - update.quantity)) 
            : String(update.quantity);
        }
      }

      await stripe.products.update(update.productId, { metadata });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating Stripe metadata inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating inventory' },
      { status: 500 }
    );
  }
}
