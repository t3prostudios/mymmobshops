import { config } from 'dotenv';
config();

import '@/ai/flows/motivational-mondays-content-classification.ts';
import '@/ai/flows/copyright-and-content-issue-detection.ts';
import '@/ai/flows/send-order-notification.ts';
import '@/ai/flows/send-shipping-notification.ts';
import '@/ai/flows/send-complaint-escalation.ts';
import '@/ai/flows/send-complaint-confirmation.ts';
import '@/ai/flows/send-new-product-notification.ts';
import '@/ai/flows/send-customer-order-confirmation.ts';
import '@/ai/flows/send-cart-reminder.ts';
import '@/ai/flows/send-pos-email.ts';
