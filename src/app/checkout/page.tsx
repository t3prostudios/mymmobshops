
'use client';

import StripeCheckoutForm from '@/components/checkout/stripe-checkout-form';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Info } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, subtotal, shippingCost } = useCart();

  if (cartCount === 0) {
    return (
      <div className="container text-center py-20">
        <h1 className="text-3xl font-headline">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">
          You can't check out with an empty cart. Let's find something for you!
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline tracking-tight">Checkout</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="lg:order-last">
          <h2 className="text-2xl font-headline mb-4">Order Summary</h2>
          <div className="bg-secondary p-6 rounded-lg">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const image = item.product.images[0];
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                      {image && (
                        <Image
                          src={image.url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.name}</p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t my-4"></div>
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <p>Subtotal</p>
                <p>{formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <p>Shipping</p>
                <p>{shippingCost === null ? 'Calculated at next step' : (shippingCost > 0 ? formatPrice(shippingCost) : 'Free')}</p>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{formatPrice(cartTotal)}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-headline mb-4">Shipping & Payment</h2>
           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-lg p-4 flex items-start gap-4 mb-6">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Please note: Your card will be charged immediately upon placing your order.
            </p>
          </div>
          <StripeCheckoutForm />
        </div>
      </div>
    </div>
  );
}
