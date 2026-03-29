

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
import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, increment, collection, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import { sendOrderNotification } from '@/ai/flows/send-order-notification';
import { sendCustomerOrderConfirmation } from '@/ai/flows/send-customer-order-confirmation';
import { formatPrice } from '@/lib/utils';
import { OrderNotificationInput } from '@/lib/schemas';
import { getProducts } from '@/lib/products'; 
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import type { UserAccount } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  deliveryMethod: z.enum(['shipping', 'pickup']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  guestCheckout: z.boolean().default(false).optional(),
}).refine(data => {
    if (data.deliveryMethod === 'shipping') {
      return !!data.address && !!data.city && !!data.state && !!data.country && !!data.postalCode;
    }
    return true;
  }, {
    message: "A full shipping address is required for delivery.",
    path: ["address"], 
  });

function CheckoutForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, setShippingAddress } = useCart();
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
      phone: '',
      deliveryMethod: 'shipping',
      address: '',
      city: '',
      state: '',
      country: 'US',
      postalCode: '',
    },
  });

  const deliveryMethod = form.watch('deliveryMethod');
  const watchCountry = form.watch('country');
  const watchState = form.watch('state');
  const watchCity = form.watch('city');

  useEffect(() => {
    if (deliveryMethod === 'shipping') {
      setShippingAddress({
        country: watchCountry || '',
        state: watchState || '',
        city: watchCity || '',
      });
    } else {
      setShippingAddress(null);
    }
  }, [deliveryMethod, watchCountry, watchState, watchCity, setShippingAddress]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements || !firestore) {
      setErrorMessage('A required service is not loaded.');
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
                state: values.state,
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
        
        const orderData = {
          customerName: `${values.firstName} ${values.lastName}`,
          customerEmail: values.email,
          deliveryMethod: values.deliveryMethod,
          orderItems: cartItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.variant?.price ?? item.product.price,
          })),
          total: cartTotal,
          createdAt: serverTimestamp(),
          status: 'new',
          shippingAddress: values.deliveryMethod === 'shipping' ? {
              address: values.address!,
              city: values.city!,
              state: values.state!,
              country: values.country!,
              postalCode: values.postalCode!,
          } : null,
        };

        // Save order to Firestore
        const ordersCollection = collection(firestore, 'orders');
        await addDoc(ordersCollection, orderData);

        // Send order notification email to merchant and customer
        try {
          const notificationPayload: OrderNotificationInput = {
            customerName: `${values.firstName} ${values.lastName}`,
            customerEmail: values.email,
            deliveryMethod: values.deliveryMethod,
            orderItems: cartItems.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.variant?.price ?? item.product.price,
            })),
            total: cartTotal,
          };
          if (values.deliveryMethod === 'shipping') {
            notificationPayload.shippingAddress = {
              address: values.address!,
              city: values.city!,
              state: values.state!,
              country: values.country!,
              postalCode: values.postalCode!,
            }
          }
          sendOrderNotification(notificationPayload);
          sendCustomerOrderConfirmation(notificationPayload);
        } catch (e) {
          console.error("Failed to send order notification emails:", e);
        }

        // Award loyalty points & save address if user is logged in
        if (user && firestore && !values.guestCheckout) {
          const userDocRef = doc(firestore, 'users', user.uid);
          
          const profileData: Partial<UserAccount> = {
            loyaltyPoints: increment(Math.floor(cartTotal)),
            phone: values.phone || undefined,
          };
          
          if (values.deliveryMethod === 'shipping') {
            profileData.address = values.address || undefined;
            profileData.city = values.city || undefined;
            profileData.state = values.state || undefined;
            profileData.postalCode = values.postalCode || undefined;
            profileData.country = values.country || undefined;
          }
          
          const updateData = Object.fromEntries(Object.entries(profileData).filter(([_, v]) => v !== undefined));

          if (Object.keys(updateData).length > 0) {
            try {
              // Use setDoc with merge:true to create or update the document
              await setDoc(userDocRef, updateData, { merge: true });
            } catch (e) {
              console.error("Failed to update user address/loyalty info:", e);
            }
          }
        }
        
        toast({
          title: 'Order Placed!',
          description:
            'Thank you for your purchase. Your order is being processed.',
        });

        clearCart();

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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone <span className="text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
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
                  <FormLabel>Continue as guest (won't earn loyalty points or save address)</FormLabel>
                </div>
              </FormItem>
            )}
          />}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Delivery Method</h3>
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="shipping" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Shipping
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pickup" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        In-Store Pickup
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={cn("space-y-4", deliveryMethod === 'pickup' && 'hidden')}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Payment Details</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-lg p-4 flex items-start gap-4 mb-6">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Please note: Your card will be charged immediately upon placing your order.
            </p>
          </div>
          <div className="p-3 border rounded-md">
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
        </div>

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </form>
    </Form>
  );
}


export default function StripeCheckoutForm() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
