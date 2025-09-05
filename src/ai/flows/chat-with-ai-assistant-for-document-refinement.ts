'use server';

/**
 * @fileOverview Implements a Genkit flow for chatting with an AI assistant to refine document content.
 *
 * - chatWithAiForRefinement - A function that initiates the chat and document refinement process.
 * - ChatWithAiForRefinementInput - The input type for the chatWithAiForRefinement function.
 * - ChatWithAiForRefinementOutput - The return type for the chatWithAiForRefinement function.
 */

import {ai, configureGenkit} from '@/ai/configure-genkit';
import {z} from 'genkit';
import type {AIPlatform} from '@/app/page';

const ChatWithAiForRefinementInputSchema = z.object({
  documentContent: z.string().describe('The current content of the document.'),
  userMessage: z.string().describe('The user message to the AI assistant.'),
  apiKey: z.string().describe('The API key for the selected AI platform.'),
  platform: z.string().describe('The AI platform to use (e.g., gemini, openai).') as z.ZodType<AIPlatform>,
});
export type ChatWithAiForRefinementInput = z.infer<typeof ChatWithAiForRefinementInputSchema>;

const ChatWithAiForRefinementOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant\'s response to the user message.'),
  updatedDocumentContent: z.string().describe('The updated content of the document after AI edits.'),
});
export type ChatWithAiForRefinementOutput = z.infer<typeof ChatWithAiForRefinementOutputSchema>;

export async function chatWithAiForRefinement(
  input: ChatWithAiForRefinementInput
): Promise<ChatWithAiForRefinementOutput> {
  return chatWithAiForRefinementFlow(input);
}

const chatWithAiForRefinementPrompt = ai.definePrompt({
  name: 'chatWithAiForRefinementPrompt',
  input: {schema: ChatWithAiForRefinementInputSchema},
  output: {schema: ChatWithAiForRefinementOutputSchema},
  prompt: `You are a collaborative writing assistant. The user is currently writing a document and is asking you for assistance.  Use the document content and the user's message to generate an appropriate response and make edits to the document as requested.  If the user asks you to edit the document, return the edited content in the updatedDocumentContent field. If the user is just chatting, respond in the aiResponse field.

Document Content: {{{documentContent}}}

User Message: {{{userMessage}}}

AI Response:`,
});

const chatWithAiForRefinementFlow = ai.defineFlow(
  {
    name: 'chatWithAiForRefinementFlow',
    inputSchema: ChatWithAiForRefinementInputSchema,
    outputSchema: ChatWithAiForRefinementOutputSchema,
  },
  async input => {
    await configureGenkit(input.platform, input.apiKey);
    const {output} = await chatWithAiForRefinementPrompt(input);
    return output!;
  }
);
