
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { handleShippingNotification } from './actions';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  trackingNumber: z.string().min(1, 'Tracking number is required.'),
});

function ShippingNotificationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      trackingNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('trackingNumber', values.trackingNumber);

    try {
      const result = await handleShippingNotification(formData);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success!',
          description: `Tracking number sent to ${values.email}.`,
        });
        form.reset();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred.',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trackingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>USPS Tracking Number</FormLabel>
              <FormControl>
                <Input placeholder="9400111202555842673259" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Sending...' : 'Send Notification'}
        </Button>
      </form>
    </Form>
  );
}

export default function AdminShippingPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    // In a real application, this would be a secure authentication check
    if (password === '080808') {
      setAuthenticated(true);
      toast({
        title: 'Access Granted',
        description: 'Welcome to the shipping notification system.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Incorrect password.',
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="container flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-center text-2xl font-bold">Admin Access</h1>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline">Send Shipping Notification</h1>
          <p className="text-muted-foreground mt-2">
            Enter the customer's email and tracking number to send a shipping update.
          </p>
        </div>
        <div className="bg-background p-6 sm:p-8 rounded-xl shadow-lg border">
          <ShippingNotificationForm />
        </div>
      </div>
    </div>
  );
}
