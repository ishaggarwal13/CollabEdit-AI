'use server';

/**
 * @fileOverview Applies AI-powered transformations to selected text.
 *
 * - applyAiTransformation - A function that transforms the selected text based on the given transformation type.
 * - ApplyAiTransformationInput - The input type for the applyAiTransformation function.
 * - ApplyAiTransformationOutput - The return type for the applyAiTransformation function.
 */

import {ai, configureGenkit} from '@/ai/configure-genkit';
import {z} from 'genkit';
import type {AIPlatform} from '@/app/page';

const ApplyAiTransformationInputSchema = z.object({
  selectedText: z.string().describe('The text selected by the user in the editor.'),
  transformationType: z
    .string()
    .describe(
      'The type of transformation to apply, such as shorten, lengthen, convert to table, etc.'
    ),
  apiKey: z.string().describe('The API key for the selected AI platform.'),
  platform: z.string().describe('The AI platform to use (e.g., gemini, openai).') as z.ZodType<AIPlatform>,
});
export type ApplyAiTransformationInput = z.infer<typeof ApplyAiTransformationInputSchema>;

const ApplyAiTransformationOutputSchema = z.object({
  transformedText: z.string().describe('The text after applying the AI transformation.'),
});
export type ApplyAiTransformationOutput = z.infer<typeof ApplyAiTransformationOutputSchema>;

export async function applyAiTransformation(
  input: ApplyAiTransformationInput
): Promise<ApplyAiTransformationOutput> {
  return applyAiTransformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'applyAiTransformationPrompt',
  input: {schema: ApplyAiTransformationInputSchema},
  output: {schema: ApplyAiTransformationOutputSchema},
  prompt: `You are a writing assistant. The user has selected the following text:

  {{{selectedText}}}

  The user wants to apply the following transformation: {{transformationType}}.
  Apply this transformation to the text and return the transformed text.
  Make sure to maintain the original intent and meaning of the text.
  If the transformation type is "convert to table", then return the output in markdown table format.
  `,
});

const applyAiTransformationFlow = ai.defineFlow(
  {
    name: 'applyAiTransformationFlow',
    inputSchema: ApplyAiTransformationInputSchema,
    outputSchema: ApplyAiTransformationOutputSchema,
  },
  async input => {
    await configureGenkit(input.platform, input.apiKey);
    const {output} = await prompt(input);
    return output!;
  }
);
