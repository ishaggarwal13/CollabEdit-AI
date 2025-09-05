'use server';

/**
 * @fileOverview An AI agent flow for creating a PowerPoint presentation from search results.
 *
 * - createPowerpointPresentationFromAgentTasking - A function that handles the presentation creation process.
 * - CreatePowerpointPresentationInput - The input type for the createPowerpointPresentationFromAgentTasking function.
 * - CreatePowerpointPresentationOutput - The return type for the createPowerpointPresentationFromAgentTasking function.
 */

import {ai, configureGenkit} from '@/ai/configure-genkit';
import {z} from 'genkit';
import {searchContent} from '@/services/search-content';
import type {AIPlatform} from '@/app/page';

const CreatePowerpointPresentationInputSchema = z.object({
  query: z.string().describe('The query to use for creating the powerpoint presentation.'),
  apiKey: z.string().describe('The API key for the selected AI platform.'),
  platform: z.string().describe('The AI platform to use (e.g., gemini, openai).') as z.ZodType<AIPlatform>,
});
export type CreatePowerpointPresentationInput = z.infer<
  typeof CreatePowerpointPresentationInputSchema
>;

const CreatePowerpointPresentationOutputSchema = z.object({
  presentation: z
    .string()
    .describe('The generated powerpoint presentation in markdown format.'),
});
export type CreatePowerpointPresentationOutput = z.infer<
  typeof CreatePowerpointPresentationOutputSchema
>;

export async function createPowerpointPresentationFromAgentTasking(
  input: CreatePowerpointPresentationInput
): Promise<CreatePowerpointPresentationOutput> {
  return createPowerpointPresentationFlow(input);
}

const createPowerpointPresentationPrompt = ai.definePrompt({
  name: 'createPowerpointPresentationPrompt',
  input: {
    schema: z.object({
      query: CreatePowerpointPresentationInputSchema.shape.query,
      searchResults: z.string(),
    }),
  },
  output: {schema: CreatePowerpointPresentationOutputSchema},
  prompt: `You are an AI agent that is responsible for creating powerpoint
  presentations in markdown format, given a search query.

  The markdown format should follow the guidelines for a powerpoint presentation,
  and include titles, bullet points, and any other relevant information from the
  search results.

  Create a powerpoint presentation using the following information:
  Search Query: {{{query}}}
  Search Results: {{{searchResults}}}

  Powerpoint Presentation:`,
});

const createPowerpointPresentationFlow = ai.defineFlow(
  {
    name: 'createPowerpointPresentationFlow',
    inputSchema: CreatePowerpointPresentationInputSchema,
    outputSchema: CreatePowerpointPresentationOutputSchema,
  },
  async input => {
    await configureGenkit(input.platform, input.apiKey);
    const searchResults = await searchContent(input.query);
    const {output} = await createPowerpointPresentationPrompt({
      query: input.query,
      searchResults,
    });
    return output!;
  }
);
