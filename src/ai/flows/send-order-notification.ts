
'use server';
/**
 * @fileOverview A flow for sending order confirmation emails.
 *
 * - sendOrderNotification - A function that sends an email with order details.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { OrderNotificationInput, OrderNotificationInputSchema } from '@/lib/schemas';


export async function sendOrderNotification(input: OrderNotificationInput): Promise<void> {
  await sendOrderNotificationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendOrderNotificationPrompt',
  input: { schema: OrderNotificationInputSchema },
  prompt: `
    Subject: New Order Confirmation for Minding My Own Business

    You have received a new order.

    Delivery Method: {{{deliveryMethod}}}

    Customer Details:
    Name: {{{customerName}}}
    Email: {{{customerEmail}}}

    {{#if shippingAddress}}
    Shipping Address:
    {{{shippingAddress.address}}}
    {{{shippingAddress.city}}}, {{{shippingAddress.state}}} {{{shippingAddress.postalCode}}}
    {{{shippingAddress.country}}}
    {{/if}}

    Order Details:
    {{#each orderItems}}
    - {{name}} (x{{quantity}}): \${{price}}
    {{/each}}

    Total: \${{total}}
  `,
});

const sendOrderNotificationFlow = ai.defineFlow(
  {
    name: 'sendOrderNotificationFlow',
    inputSchema: OrderNotificationInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = "New Order Confirmation for Minding My Own Business";
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'shopmmob@gmail.com',
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Order notification email sent successfully.');
      } catch (error) {
        console.error('Failed to send order notification email:', error);
        // Fallback to console logging if email sending fails
        console.log('--- New Order Email (Fallback) ---');
        console.log(emailBody);
        console.log('---------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- New Order Email ---');
      console.log(emailBody);
      console.log('-----------------------');
    }
  }
);
