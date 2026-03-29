import { z } from 'zod';

// Schema for shipping notifications
export const ShippingNotificationInputSchema = z.object({
  customerEmail: z.string().email().describe("The email address of the customer."),
  trackingNumber: z.string().describe("The USPS tracking number for the order."),
});
export type ShippingNotificationInput = z.infer<typeof ShippingNotificationInputSchema>;

// Schema for order notifications
export const OrderNotificationInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  deliveryMethod: z.string().describe('The chosen delivery method, either Shipping or Pickup.'),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }).optional(),
  orderItems: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).describe('An array of items in the order.'),
  total: z.number().describe('The total amount of the order.'),
});
export type OrderNotificationInput = z.infer<typeof OrderNotificationInputSchema>;


// Schemas for Motivational Mondays
export const MotivationalContentInputSchema = z.object({
  content: z.string().describe('The user-submitted content (story, image description, or video description).'),
  contentType: z.enum(['story', 'image', 'video']).describe('The type of the submitted content.'),
});
export type MotivationalContentInput = z.infer<typeof MotivationalContentInputSchema>;

export const MotivationalContentOutputSchema = z.object({
  classification: z.object({
    category: z.string().describe('The primary category of the content (e.g., inspirational, personal growth, community impact).'),
    priority: z.enum(['high', 'medium', 'low']).describe('The priority for human review (high, medium, low).'),
    flags: z.array(z.string()).describe('Any potential issues flagged (e.g., copyright concerns, inappropriate content).'),
    sentiment: z.string().describe('The sentiment of the content (positive, negative, neutral).'),
  }),
});
export type MotivationalContentOutput = z.infer<typeof MotivationalContentOutputSchema>;

export const DetectCopyrightAndContentIssuesInputSchema = z.object({
  submissionText: z
    .string()
    .describe('The text content of the user submission.'),
  submissionImage: z
    .string()
    .optional()
    .describe(
      "An optional photo or video associated with the submission, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type DetectCopyrightAndContentIssuesInput = z.infer<
  typeof DetectCopyrightAndContentIssuesInputSchema
>;

export const DetectCopyrightAndContentIssuesOutputSchema = z.object({
  hasCopyrightIssue: z
    .boolean()
    .describe('Whether the submission contains potential copyright issues.'),
  hasInappropriateContent: z
    .boolean()
    .describe('Whether the submission contains inappropriate content.'),
  issueDetails: z
    .string()
    .describe('Details about the copyright or content issues found.'),
});

export type DetectCopyrightAndContentIssuesOutput = z.infer<
  typeof DetectCopyrightAndContentIssuesOutputSchema
>;

// Schema for Complaint Escalation
export const ComplaintEscalationInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  issue: z.string(),
  createdAt: z.string(), // Will be a string representation
});
export type ComplaintEscalationInput = z.infer<typeof ComplaintEscalationInputSchema>;


// Schema for Complaint Confirmation to Customer
export const ComplaintConfirmationInputSchema = z.object({
  name: z.string().describe("The name of the customer who submitted the complaint."),
  email: z.string().email().describe("The email address of the customer."),
});
export type ComplaintConfirmationInput = z.infer<typeof ComplaintConfirmationInputSchema>;

// Schema for New Product Notification
export const NewProductNotificationInputSchema = z.object({
  productName: z.string().describe("The name of the new product."),
  productId: z.string().describe("The ID of the new product."),
});
export type NewProductNotificationInput = z.infer<typeof NewProductNotificationInputSchema>;


// Schema for Cart Reminder
export const CartReminderInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  cartItems: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })).describe('An array of items in the cart.'),
  prizeLabel: z.string().describe('The label of the prize the user won, e.g., "15% Off $75+".'),
});
export type CartReminderInput = z.infer<typeof CartReminderInputSchema>;

// Schema for sending a custom email from POS
export const SendPosEmailInputSchema = z.object({
  customerEmail: z.string().email().describe("The recipient's email address."),
  subject: z.string().describe('The subject of the email.'),
  message: z.string().describe('The body of the email.'),
});
export type SendPosEmailInput = z.infer<typeof SendPosEmailInputSchema>;
