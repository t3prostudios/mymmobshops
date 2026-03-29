'use server';
/**
 * @fileOverview A flow for sending complaint escalation emails.
 *
 * - sendComplaintEscalation - A function that sends an email with complaint details.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { ComplaintEscalationInput, ComplaintEscalationInputSchema } from '@/lib/schemas';

export async function sendComplaintEscalation(input: ComplaintEscalationInput): Promise<void> {
  await sendComplaintEscalationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendComplaintEscalationPrompt',
  input: { schema: ComplaintEscalationInputSchema },
  prompt: `
    Subject: Complaint Escalation - Minding My Own Business

    A customer complaint has been escalated for your review.

    Customer Details:
    Name: {{{name}}}
    Email: {{{email}}}
    Date of Complaint: {{{createdAt}}}

    Issue Description:
    {{{issue}}}

    Please investigate this matter promptly.
  `,
});

const sendComplaintEscalationFlow = ai.defineFlow(
  {
    name: 'sendComplaintEscalationFlow',
    inputSchema: ComplaintEscalationInputSchema,
  },
  async (input) => {
    const { text: emailBody } = await emailPrompt(input);
    const subject = "Complaint Escalation - Minding My Own Business";
    
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
        console.log('Complaint escalation email sent successfully.');
      } catch (error) {
        console.error('Failed to send complaint escalation email:', error);
        // Fallback to console logging if email sending fails
        console.log('--- Complaint Escalation Email (Fallback) ---');
        console.log(emailBody);
        console.log('-------------------------------------------');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- Complaint Escalation Email ---');
      console.log(emailBody);
      console.log('---------------------------------');
    }
  }
);
