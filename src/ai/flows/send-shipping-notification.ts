
'use server';
/**
 * @fileOverview A flow for sending shipping notification emails with tracking numbers.
 *
 * - sendShippingNotification - A function that sends an email with a tracking number.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { ShippingNotificationInput, ShippingNotificationInputSchema } from '@/lib/schemas';


export async function sendShippingNotification(input: ShippingNotificationInput): Promise<void> {
  await sendShippingNotificationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendShippingNotificationPrompt',
  input: { schema: ShippingNotificationInputSchema },
  prompt: `
    Generate the raw text for a shipping notification email. Do not add any commentary or analysis. Only output the email content itself, starting with the subject line.

    Subject: Your Minding My Own Business Order Has Shipped!

    Hi there,

    Great news! Your recent order from Minding My Own Business has been shipped.

    You can track your package using the following USPS tracking number:
    {{trackingNumber}}

    Track your package here: https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={{trackingNumber}}

    Thank you for your order!

    - The Minding My Own Business Team

    Warning: If the tracking number is invalid, please go to https://mymmobshop.com/report-issue to ask for the tracking number to be emailed out to you again.
  `,
});

const sendShippingNotificationFlow = ai.defineFlow(
  {
    name: 'sendShippingNotificationFlow',
    inputSchema: ShippingNotificationInputSchema,
  },
  async (input) => {
    const { text: emailBody, } = await emailPrompt(input);
    const subject = "Your Minding My Own Business Order Has Shipped!";
    
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
        console.log('Shipping notification email sent successfully.');
      } catch (error) {
        console.error('Failed to send shipping notification email:', error);
        // Fallback to console logging if email sending fails
        console.log('--- Shipping Notification Email (Fallback) ---');
        console.log(`To: ${input.customerEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(emailBody);
        console.log('-----------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- Shipping Notification Email ---');
      console.log(`To: ${input.customerEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(emailBody);
      console.log('-----------------------------------');
    }
  }
);
