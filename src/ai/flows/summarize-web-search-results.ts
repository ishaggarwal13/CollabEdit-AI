'use server';
/**
 * @fileOverview A flow that summarizes web search results and inserts them into the editor.
 *
 * - summarizeWebSearchResults - A function that handles the summarization of web search results.
 * - SummarizeWebSearchResultsInput - The input type for the summarizeWebSearchResults function.
 * - SummarizeWebSearchResultsOutput - The return type for the summarizeWebSearchResults function.
 */

import {ai, configureGenkit} from '@/ai/configure-genkit';
import {z} from 'genkit';
import {searchWeb} from '@/services/search-web';
import type {AIPlatform} from '@/app/page';

const SummarizeWebSearchResultsInputSchema = z.object({
  query: z.string().describe('The search query to use for web search.'),
  apiKey: z.string().describe('The API key for the selected AI platform.'),
  platform: z.string().describe('The AI platform to use (e.g., gemini, openai).') as z.ZodType<AIPlatform>,
});
export type SummarizeWebSearchResultsInput = z.infer<typeof SummarizeWebSearchResultsInputSchema>;

const SummarizeWebSearchResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the web search results.'),
});
export type SummarizeWebSearchResultsOutput = z.infer<typeof SummarizeWebSearchResultsOutputSchema>;

export async function summarizeWebSearchResults(
  input: SummarizeWebSearchResultsInput
): Promise<SummarizeWebSearchResultsOutput> {
  return summarizeWebSearchResultsFlow(input);
}

const summarizeWebSearchResultsPrompt = ai.definePrompt({
  name: 'summarizeWebSearchResultsPrompt',
  input: {
    schema: z.object({
      query: SummarizeWebSearchResultsInputSchema.shape.query,
      searchResults: z.string(),
    }),
  },
  output: {schema: SummarizeWebSearchResultsOutputSchema},
  prompt: `You are an expert summarizer of web search results.

  Summarize the following web search results:

  {{{searchResults}}}`,
});

const summarizeWebSearchResultsFlow = ai.defineFlow(
  {
    name: 'summarizeWebSearchResultsFlow',
    inputSchema: SummarizeWebSearchResultsInputSchema,
    outputSchema: SummarizeWebSearchResultsOutputSchema,
  },
  async input => {
    await configureGenkit(input.platform, input.apiKey);
    const searchResults = await searchWeb(input.query);
    const {output} = await summarizeWebSearchResultsPrompt({
      query: input.query,
      searchResults,
    });
    return output!;
  }
);
