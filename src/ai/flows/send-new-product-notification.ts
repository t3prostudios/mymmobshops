'use server';
/**
 * @fileOverview A flow for sending a notification when a new product is detected.
 *
 * - sendNewProductNotification - A function that sends an email notification.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { NewProductNotificationInput, NewProductNotificationInputSchema } from '@/lib/schemas';

export async function sendNewProductNotification(input: NewProductNotificationInput): Promise<void> {
  await sendNewProductNotificationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendNewProductNotificationPrompt',
  input: { schema: NewProductNotificationInputSchema },
  prompt: `
    Subject: New Product Detected: {{{productName}}}

    A new product has been detected on the website.

    Product Name: {{{productName}}}
    Product ID: {{{productId}}}

    Please remember to:
    1. Beautify the product image.
    2. Add an AI-powered on-hover video.

    This will enhance the customer experience.

    - The MMOB Dev Team
  `,
});

const sendNewProductNotificationFlow = ai.defineFlow(
  {
    name: 'sendNewProductNotificationFlow',
    inputSchema: NewProductNotificationInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = `New Product Detected: ${input.productName}`;
    
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
        to: 'techmmob@gmail.com',
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('New product notification email sent successfully.');
      } catch (error) {
        console.error('Failed to send new product notification email:', error);
        console.log('--- New Product Notification Email (Fallback) ---');
        console.log(emailBody);
        console.log('---------------------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- New Product Notification Email ---');
      console.log(`To: techmmob@gmail.com`);
      console.log(emailBody);
      console.log('------------------------------------');
    }
  }
);
