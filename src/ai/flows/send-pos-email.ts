'use server';
/**
 * @fileOverview A flow for sending a custom email to a customer from the POS.
 *
 * - sendPosEmail - A function that sends a custom email.
 */

import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { SendPosEmailInput, SendPosEmailInputSchema } from '@/lib/schemas';

export async function sendPosEmail(input: SendPosEmailInput): Promise<void> {
  await sendPosEmailFlow(input);
}

const sendPosEmailFlow = ai.defineFlow(
  {
    name: 'sendPosEmailFlow',
    inputSchema: SendPosEmailInputSchema,
  },
  async (input) => {
    const emailBody = input.message;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: 'shopmmob@gmail.com',
        to: input.customerEmail,
        subject: input.subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('POS email sent successfully.');
      } catch (error) {
        console.error('Failed to send POS email:', error);
        throw new Error('Failed to send email via nodemailer.');
      }
    } else {
      console.log("Email credentials not found. Logging email to console instead.");
      console.log('--- POS Customer Email ---');
      console.log(`To: ${input.customerEmail}`);
      console.log(`Subject: ${input.subject}`);
      console.log(emailBody);
      console.log('----------------------');
    }
  }
);
