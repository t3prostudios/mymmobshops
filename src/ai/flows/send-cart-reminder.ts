'use server';
/**
 * @fileOverview A flow for sending a cart reminder email to a customer.
 *
 * - sendCartReminder - A function that sends a reminder email about items in their cart and an expiring prize.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { CartReminderInput, CartReminderInputSchema } from '@/lib/schemas';

export async function sendCartReminder(input: CartReminderInput): Promise<void> {
  await sendCartReminderFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendCartReminderPrompt',
  input: { schema: CartReminderInputSchema },
  prompt: `
    Subject: Don't miss out on your prize!

    Hi {{{customerName}}},

    You're so close! You have items in your cart and an exclusive prize waiting for you: **{{{prizeLabel}}}**.

    Here's what's in your cart:
    {{#each cartItems}}
    - {{name}} (x{{quantity}})
    {{/each}}

    Your prize expires in less than 24 hours. Complete your purchase now to use your discount!

    - The Minding My Own Business Team
  `,
});

const sendCartReminderFlow = ai.defineFlow(
  {
    name: 'sendCartReminderFlow',
    inputSchema: CartReminderInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = "Don't miss out on your prize!";
    
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
        to: input.customerEmail,
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Cart reminder email sent successfully.');
      } catch (error) {
        console.error('Failed to send cart reminder email:', error);
        console.log('--- Cart Reminder Email (Fallback) ---');
        console.log(`To: ${input.customerEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(emailBody);
        console.log('-----------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- Cart Reminder Email ---');
      console.log(`To: ${input.customerEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(emailBody);
      console.log('---------------------------');
    }
  }
);
