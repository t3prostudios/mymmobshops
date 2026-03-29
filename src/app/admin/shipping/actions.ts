'use server';

import { z } from 'zod';
import { sendShippingNotification } from '@/ai/flows/send-shipping-notification';
import { ShippingNotificationInput, ShippingNotificationInputSchema } from '@/lib/schemas';

const formSchema = z.object({
  email: z.string().email(),
  trackingNumber: z.string(),
});

export async function handleShippingNotification(formData: FormData) {
  const rawFormData = {
    email: formData.get('email'),
    trackingNumber: formData.get('trackingNumber'),
  };

  const parsed = formSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { error: 'Invalid form data.' };
  }

  try {
    const shippingInput: ShippingNotificationInput = {
      customerEmail: parsed.data.email,
      trackingNumber: parsed.data.trackingNumber,
    };
    // Ensure the data matches the Zod schema before sending
    ShippingNotificationInputSchema.parse(shippingInput);
    
    await sendShippingNotification(shippingInput);
    return { error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return { error: 'Invalid data format for shipping notification.' };
    }
    console.error('Failed to send shipping notification:', error);
    return { error: 'An error occurred while sending the notification.' };
  }
}