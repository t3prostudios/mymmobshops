'use server';
/**
 * @fileOverview This flow flags potential copyright infringements or other content issues within user submissions.
 *
 * - detectCopyrightAndContentIssues - A function that analyzes user-submitted content for potential copyright and content issues.
 */

import {ai} from '@/ai/genkit';
import {DetectCopyrightAndContentIssuesInput, DetectCopyrightAndContentIssuesOutput, DetectCopyrightAndContentIssuesInputSchema, DetectCopyrightAndContentIssuesOutputSchema} from "@/lib/schemas";

export async function detectCopyrightAndContentIssues(
  input: DetectCopyrightAndContentIssuesInput
): Promise<DetectCopyrightAndContentIssuesOutput> {
  return detectCopyrightAndContentIssuesFlow(input);
}

const detectCopyrightAndContentIssuesPrompt = ai.definePrompt({
  name: 'detectCopyrightAndContentIssuesPrompt',
  input: {schema: DetectCopyrightAndContentIssuesInputSchema},
  output: {schema: DetectCopyrightAndContentIssuesOutputSchema},
  prompt: `You are a content moderation expert responsible for identifying copyright infringements and inappropriate content in user submissions for the "Motivational Mondays" campaign. Analyze the following submission and determine if it contains any copyright issues or inappropriate content.

Submission Text: {{{submissionText}}}
{{#if submissionImage}}
Submission Image: {{media url=submissionImage}}
{{/if}}

Based on your analysis, set the hasCopyrightIssue and hasInappropriateContent fields accordingly. Provide details about any issues found in the issueDetails field. Return a JSON object.
`,
});

const detectCopyrightAndContentIssuesFlow = ai.defineFlow(
  {
    name: 'detectCopyrightAndContentIssuesFlow',
    inputSchema: DetectCopyrightAndContentIssuesInputSchema,
    outputSchema: DetectCopyrightAndContentIssuesOutputSchema,
  },
  async input => {
    const {output} = await detectCopyrightAndContentIssuesPrompt(input);
    return output!;
  }
);
