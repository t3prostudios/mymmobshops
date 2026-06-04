import { SquareClient, SquareEnvironment, Square } from 'square';

export const getSquareClient = (): SquareClient | null => {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENVIRONMENT;

  if (!accessToken) {
    return null;
  }

  return new SquareClient({
    token: accessToken,
    environment: env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
};

export interface SquareSyncedProduct {
  id: string; // Square catalog item ID
  name: string;
  description: string;
  variations: Array<{
    id: string; // variation ID
    name: string;
    sku: string;
    price: number; // in dollars
    stockQuantity?: number;
  }>;
}

/**
 * Fetches products from Square Catalog API
 */
export async function getSquareCatalog(): Promise<SquareSyncedProduct[]> {
  const client = getSquareClient();
  if (!client) {
    console.error("Square client is not initialized. SQUARE_ACCESS_TOKEN is missing.");
    return [];
  }

  try {
    const pageableResponse = await client.catalog.list({ types: 'ITEM' });
    const products: SquareSyncedProduct[] = [];

    for await (const item of pageableResponse) {
      if (item.type !== 'ITEM' || !item.itemData) continue;

      const variations = item.itemData.variations || [];
      const productVariations = variations.map((v: any) => {
        const vData = v.itemVariationData;
        const priceMoney = vData?.priceMoney;
        // Price is in minor units (e.g. cents) and can be a bigint
        const price = priceMoney?.amount ? Number(priceMoney.amount) / 100 : 0;

        return {
          id: v.id || '',
          name: vData?.name || '',
          sku: vData?.sku || '',
          price: price,
        };
      });

      products.push({
        id: item.id || '',
        name: item.itemData.name || '',
        description: item.itemData.description || '',
        variations: productVariations,
      });
    }

    return products;
  } catch (error: any) {
    console.error("Error fetching Square catalog:", error);
    return [];
  }
}

/**
 * Fetches stock counts for specific variation IDs
 */
export async function getSquareInventory(variationIds: string[]): Promise<Record<string, number>> {
  const client = getSquareClient();
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!client || !locationId) {
    console.error("Square client or SQUARE_LOCATION_ID not initialized.");
    return {};
  }

  if (variationIds.length === 0) return {};

  try {
    const pageableResponse = await client.inventory.batchGetCounts({
      catalogObjectIds: variationIds,
      locationIds: [locationId],
    });

    const stockMap: Record<string, number> = {};

    for await (const count of pageableResponse) {
      if (count.catalogObjectId && count.quantity) {
        stockMap[count.catalogObjectId] = Number(count.quantity);
      }
    }

    return stockMap;
  } catch (error: any) {
    console.error("Error fetching Square inventory:", error);
    return {};
  }
}
