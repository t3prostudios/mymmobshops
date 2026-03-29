'use server';
/**
 * @fileOverview A flow for sending a complaint confirmation email to a customer.
 *
 * - sendComplaintConfirmation - A function that sends a confirmation email.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { ComplaintConfirmationInput, ComplaintConfirmationInputSchema } from '@/lib/schemas';

export async function sendComplaintConfirmation(input: ComplaintConfirmationInput): Promise<void> {
  await sendComplaintConfirmationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendComplaintConfirmationPrompt',
  input: { schema: ComplaintConfirmationInputSchema },
  prompt: `
    Subject: We've received your complaint and are looking into it

    Hi {{{name}}},

    Thank you for reaching out to us. We have received your complaint and have escalated it for immediate review.

    Our team is looking into the issue, and we will get back to you as soon as possible. We appreciate your patience.

    Sincerely,
    The Minding My Own Business Team
  `,
});

const sendComplaintConfirmationFlow = ai.defineFlow(
  {
    name: 'sendComplaintConfirmationFlow',
    inputSchema: ComplaintConfirmationInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = "We've received your complaint and are looking into it";
    
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
        to: input.email, // Send to customer
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Complaint confirmation email sent successfully.');
      } catch (error) {
        console.error('Failed to send complaint confirmation email:', error);
        // Fallback to console logging if email sending fails
        console.log('--- Complaint Confirmation Email (Fallback) ---');
        console.log(emailBody);
        console.log('---------------------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- Complaint Confirmation Email ---');
      console.log(`To: ${input.email}`);
      console.log(emailBody);
      console.log('------------------------------------');
    }
  }
);
