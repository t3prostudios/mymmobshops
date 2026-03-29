import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { productId, metadata } = await req.json();

    if (!productId || !metadata || !stripe) {
      return NextResponse.json({ error: 'Missing parameters or Stripe key' }, { status: 400 });
    }

    // Update product metadata in Stripe
    // We only send stock-related metadata as weights are now handled in data.ts
    const formattedMetadata: Record<string, string> = {};
    for (const key in metadata) {
        // Ensure we only pass string values to Stripe
        formattedMetadata[key] = String(metadata[key]);
    }

    await stripe.products.update(productId, {
      metadata: formattedMetadata,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating Stripe metadata:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating product metadata' },
      { status: 500 }
    );
  }
}
