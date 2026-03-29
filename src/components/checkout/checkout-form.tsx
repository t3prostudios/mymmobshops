
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  guestCheckout: z.boolean().default(false).optional(),
});

export default function CheckoutForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { cartItems, updateQuantity, cartTotal } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not loaded.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setErrorMessage('Card details are not complete.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(cartTotal * 100) }),
      });

      const { clientSecret, error: intentError } = await res.json();

      if (intentError) {
        setErrorMessage(intentError);
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${values.firstName} ${values.lastName}`,
              email: values.email,
              address: {
                line1: values.address,
                city: values.city,
                country: values.country,
                postal_code: values.postalCode,
              },
            },
          },
        }
      );

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Award loyalty points
        if (user && firestore && !values.guestCheckout) {
          const pointsEarned = Math.floor(cartTotal);
          const userDocRef = doc(firestore, 'users', user.uid);
          try {
            await updateDoc(userDocRef, {
              loyaltyPoints: increment(pointsEarned)
            });
          } catch (e) {
            console.error("Failed to update loyalty points:", e);
          }
        }

        toast({
          title: 'Order Placed!',
          description:
            'Thank you for your purchase. Your order is being processed.',
        });

        cartItems.forEach((item) => updateQuantity(item.id, 0));

        router.push('/');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An unexpected error occurred.');
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {user && <FormField
            control={form.control}
            name="guestCheckout"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Continue as guest (won't earn loyalty points)</FormLabel>
                </div>
              </FormItem>
            )}
          />}
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Payment Details</h3>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                },
                invalid: {
                  color: 'hsl(var(--destructive))',
                },
              },
            }}
          />
        </div>

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </form>
    </Form>
  );
}
