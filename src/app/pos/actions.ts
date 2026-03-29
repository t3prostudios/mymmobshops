
'use server';

import { z } from 'zod';
import { sendShippingNotification } from '@/ai/flows/send-shipping-notification';
import { 
  ShippingNotificationInput, 
  ShippingNotificationInputSchema,
  ComplaintEscalationInput, 
  ComplaintEscalationInputSchema,
  SendPosEmailInput,
  SendPosEmailInputSchema
} from '@/lib/schemas';
import { sendComplaintEscalation } from '@/ai/flows/send-complaint-escalation';
import { sendComplaintConfirmation } from '@/ai/flows/send-complaint-confirmation';
import { sendPosEmail } from '@/ai/flows/send-pos-email';


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

export async function handleEscalateComplaint(complaint: ComplaintEscalationInput) {
  const parsed = ComplaintEscalationInputSchema.safeParse(complaint);
  if (!parsed.success) {
    return { error: 'Invalid complaint data.' };
  }

  try {
    // These can run in parallel to notify admin and customer
    await Promise.all([
      sendComplaintEscalation(parsed.data),
      sendComplaintConfirmation({ name: parsed.data.name, email: parsed.data.email })
    ]);

    return { error: null };
  } catch (error) {
    console.error('Failed to escalate complaint:', error);
    return { error: 'An error occurred while sending the escalation emails.' };
  }
}

export async function handleSendPosEmail(formData: FormData) {
  const rawFormData = {
    customerEmail: formData.get('customerEmail'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const parsed = SendPosEmailInputSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { error: 'Invalid form data.' };
  }

  try {
    await sendPosEmail(parsed.data);
    return { error: null };
  } catch (error) {
    console.error('Failed to send customer email:', error);
    return { error: 'An error occurred while sending the email.' };
  }
}
