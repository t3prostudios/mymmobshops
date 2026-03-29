
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { pathname, amount } = await req.json();
  
  try {
    if (pathname.endsWith('/connection-token')) {
      const token = await stripe.terminal.connectionTokens.create();
      return NextResponse.json({ secret: token.secret });
    }

    if (pathname.endsWith('/payment-intent')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card_present'],
        capture_method: 'manual',
      });
      return NextResponse.json({ client_secret: paymentIntent.client_secret });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  } catch (error: any) {
    console.error('Stripe Terminal API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred with the Stripe Terminal API.' },
      { status: 500 }
    );
  }
}

