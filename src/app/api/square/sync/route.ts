import { getSquareCatalog, getSquareInventory } from '@/lib/square';
import { getStripeProducts, stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

// Helper to parse Stripe metadata stock
function parseMetadataToStockMap(metadata: Record<string, string>): Record<string, Record<string, number>> {
  const stockMap: Record<string, Record<string, number>> = {};
  const reservedKeys = ['category', 'style', 'weight', 'description', 'id', 'type', 'tax_code'];

  for (const [key, value] of Object.entries(metadata)) {
    if (reservedKeys.includes(key.toLowerCase())) continue;

    if (value && value.includes(':')) {
      const color = key.trim();
      const pairs = value.split('-');
      stockMap[color] = {};
      
      pairs.forEach(p => {
        if (!p.includes(':')) return;
        const [size, qtyStr] = p.split(':');
        if (size && qtyStr) {
          const quantity = parseInt(qtyStr, 10);
          if (!isNaN(quantity)) {
            stockMap[color][size.trim()] = quantity;
          }
        }
      });
    }
  }

  return stockMap;
}

// Helper to build updated Stripe metadata value for a color key
function buildMetadataValue(colorStock: Record<string, number>): string {
  return Object.entries(colorStock)
    .map(([size, qty]) => `${size}:${qty}`)
    .join('-');
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dryRun = searchParams.get('dryRun') === 'true';

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  try {
    // 1. Fetch data from Stripe
    const stripeProducts = await getStripeProducts();
    if (stripeProducts.length === 0) {
      return NextResponse.json({ error: 'No products found in Stripe or Stripe is unavailable.' }, { status: 500 });
    }

    // 2. Fetch data from Square
    const squareProducts = await getSquareCatalog();
    if (squareProducts.length === 0) {
      return NextResponse.json({ error: 'No products found in Square Catalog or Square client not initialized.' }, { status: 500 });
    }

    // 3. Fetch all Square variation IDs to batch retrieve inventory
    const squareVariationIds = squareProducts.flatMap(sp => sp.variations.map(v => v.id));
    const squareInventory = await getSquareInventory(squareVariationIds);

    const syncLogs: Array<{
      stripeProductId: string;
      productName: string;
      updates: Array<{
        color: string;
        size: string;
        oldQty: number;
        newQty: number;
      }>;
    }> = [];

    let totalUpdatedCount = 0;

    // 4. Match and Sync
    for (const stripeProduct of stripeProducts) {
      // Find matching Square product by name (case-insensitive)
      const matchedSquareProduct = squareProducts.find(
        sp => sp.name.toLowerCase().trim() === stripeProduct.name.toLowerCase().trim()
      );

      if (!matchedSquareProduct) continue;

      // Retrieve existing Stripe metadata
      const rawStripeProduct = await stripe.products.retrieve(stripeProduct.id);
      const stripeMetadata = { ...rawStripeProduct.metadata };
      const currentStockMap = parseMetadataToStockMap(stripeMetadata);

      const productUpdates: Array<{
        color: string;
        size: string;
        oldQty: number;
        newQty: number;
      }> = [];

      let hasMetadataChanges = false;

      // Loop through Stripe colors and sizes to match with Square variations
      for (const [color, sizes] of Object.entries(currentStockMap)) {
        for (const [size, oldQty] of Object.entries(sizes)) {
          // Look for a Square variation that matches this color/size combo
          // Square variation names are typically "S", "M", or "Black / S", "Red / M"
          const matchedVariation = matchedSquareProduct.variations.find(v => {
            const vNameLower = v.name.toLowerCase();
            const colorLower = color.toLowerCase();
            const sizeLower = size.toLowerCase();

            // Simple checks:
            // - Exact size match (if name is just "S" or "M")
            // - Contains both color and size (if name is "Black / S")
            const isSizeMatch = vNameLower === sizeLower || vNameLower.endsWith(` ${sizeLower}`) || vNameLower.endsWith(`/${sizeLower}`);
            const isColorMatch = vNameLower.includes(colorLower) || matchedSquareProduct.variations.length === 1;

            if (isSizeMatch && isColorMatch) return true;
            if (vNameLower.includes(colorLower) && vNameLower.includes(sizeLower)) return true;
            return false;
          });

          if (matchedVariation) {
            const squareStock = squareInventory[matchedVariation.id] ?? 0;
            if (oldQty !== squareStock) {
              // Queue update
              currentStockMap[color][size] = squareStock;
              productUpdates.push({
                color,
                size,
                oldQty,
                newQty: squareStock,
              });
              hasMetadataChanges = true;
            }
          }
        }
      }

      if (hasMetadataChanges) {
        // Rebuild metadata keys for updated colors
        for (const [color, sizes] of Object.entries(currentStockMap)) {
          stripeMetadata[color] = buildMetadataValue(sizes);
        }

        if (!dryRun) {
          // Update Stripe
          await stripe.products.update(stripeProduct.id, { metadata: stripeMetadata });
        }

        totalUpdatedCount += productUpdates.length;
        syncLogs.push({
          stripeProductId: stripeProduct.id,
          productName: stripeProduct.name,
          updates: productUpdates,
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      totalUpdatedCount,
      syncLogs,
    });
  } catch (error: any) {
    console.error('Error in Square sync endpoint:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
