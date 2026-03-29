
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  issue: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
});

export default function ReportIssuePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      issue: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            title: 'Error',
            description: 'Could not connect to the database. Please try again later.',
            variant: 'destructive',
        });
        return;
    }
    setIsSubmitting(true);
    try {
      const complaintsCollection = collection(firestore, 'complaints');
      await addDoc(complaintsCollection, {
        ...values,
        createdAt: serverTimestamp(),
        status: 'new',
      });

      toast({
        title: 'Issue Reported',
        description: "Thank you for your feedback. We'll look into it shortly.",
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast({
        title: 'Submission Failed',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 md:py-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-headline tracking-tight">Report an Issue</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We're sorry you're experiencing a problem. Please let us know what's wrong, and we'll get back to you as soon as possible.
        </p>
      </div>
      <div className="bg-background p-6 sm:p-8 rounded-xl shadow-lg border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the Issue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide as much detail as possible..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
