'use server';
/**
 * @fileOverview Classifies user-submitted content for the 'Motivational Mondays' campaign.
 *
 * - classifyMotivationalContent - A function that classifies content.
 */

import {ai} from '@/ai/genkit';
import {MotivationalContentInput, MotivationalContentOutput, MotivationalContentInputSchema, MotivationalContentOutputSchema} from "@/lib/schemas";


export async function classifyMotivationalContent(input: MotivationalContentInput): Promise<MotivationalContentOutput> {
  return classifyMotivationalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalMondaysContentClassificationPrompt',
  input: {schema: MotivationalContentInputSchema},
  output: {schema: MotivationalContentOutputSchema},
  prompt: `You are a content moderator for the "Motivational Mondays" campaign.
Your task is to classify user-submitted content based on its type and content.

Analyze the following content and provide a classification based on the following guidelines:

- Category: Determine the most appropriate category for the content (e.g., inspirational, personal growth, community impact).
- Priority: Assign a priority for human review (high, medium, low) based on the likelihood of the content aligning with brand values and guidelines. Content that is potentially sensitive or controversial should be flagged as high priority.
- Flags: Identify any potential issues, such as copyright concerns, inappropriate content, or deviation from brand values.
- Sentiment: Determine the sentiment of the content (positive, negative, neutral).

Content Type: {{{contentType}}}
Content: {{{content}}}

Ensure that the output is a JSON object that follows this schema:
${JSON.stringify(MotivationalContentOutputSchema.shape, null, 2)}`,
});

const classifyMotivationalContentFlow = ai.defineFlow(
  {
    name: 'classifyMotivationalContentFlow',
    inputSchema: MotivationalContentInputSchema,
    outputSchema: MotivationalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
