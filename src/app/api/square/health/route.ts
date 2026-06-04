import { getSquareClient } from '@/lib/square';
import { NextResponse } from 'next/server';
import { Square } from 'square';

export async function GET() {
  const client = getSquareClient();

  if (!client) {
    return NextResponse.json({
      status: 'error',
      message: 'Square client failed to initialize. Please check SQUARE_ACCESS_TOKEN env variable.'
    }, { status: 500 });
  }

  try {
    const response = await client.locations.list();
    const locations = response.locations || [];

    return NextResponse.json({
      status: 'success',
      message: 'Square integration healthy',
      locations: locations.map((loc: Square.Location) => ({
        id: loc.id,
        name: loc.name,
        merchantId: loc.merchantId,
        status: loc.status
      }))
    });
  } catch (error: any) {
    console.error('Square Health Check Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Square API',
      error: error.message || String(error)
    }, { status: 500 });
  }
}
