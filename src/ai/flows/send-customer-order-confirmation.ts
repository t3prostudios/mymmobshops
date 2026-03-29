'use server';
/**
 * @fileOverview A flow for sending order confirmation emails to customers.
 *
 * - sendCustomerOrderConfirmation - A function that sends an email with order details to the customer.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { OrderNotificationInput, OrderNotificationInputSchema } from '@/lib/schemas';


export async function sendCustomerOrderConfirmation(input: OrderNotificationInput): Promise<void> {
  await sendCustomerOrderConfirmationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendCustomerOrderConfirmationPrompt',
  input: { schema: OrderNotificationInputSchema },
  prompt: `
    Subject: Your Minding My Own Business Order Confirmation

    Hi {{{customerName}}},

    Thank you for your order! We've received it and are getting it ready for you.

    Delivery Method: {{{deliveryMethod}}}

    {{#if shippingAddress}}
    Shipping To:
    {{{shippingAddress.address}}}
    {{{shippingAddress.city}}}, {{{shippingAddress.state}}} {{{shippingAddress.postalCode}}}
    {{{shippingAddress.country}}}
    {{/if}}

    Order Summary:
    {{#each orderItems}}
    - {{name}} (x{{quantity}}): \${{price}}
    {{/each}}

    Total: \${{total}}

    We'll notify you again once your order has shipped.

    - The Minding My Own Business Team
  `,
});

const sendCustomerOrderConfirmationFlow = ai.defineFlow(
  {
    name: 'sendCustomerOrderConfirmationFlow',
    inputSchema: OrderNotificationInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = "Your Minding My Own Business Order Confirmation";
    
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
        to: input.customerEmail, // Send to customer
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Customer order confirmation email sent successfully.');
      } catch (error) {
        console.error('Failed to send customer order confirmation email:', error);
        // Fallback to console logging if email sending fails
        console.log('--- Customer Order Confirmation Email (Fallback) ---');
        console.log(emailBody);
        console.log('----------------------------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- Customer Order Confirmation Email ---');
      console.log(`To: ${input.customerEmail}`);
      console.log(emailBody);
      console.log('-----------------------------------------');
    }
  }
);
