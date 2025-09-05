import {ModelDefinition} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';
import type {AIPlatform} from '@/app/page';

const GEMINI_PRO = 'googleai/gemini-pro';
const OPENAI_GPT4 = 'openai/gpt-4';

const geminiModel = googleAI.model(GEMINI_PRO);

export async function getModel(platform: AIPlatform): Promise<ModelDefinition> {
  switch (platform) {
    case 'gemini':
      return geminiModel;
    case 'openai':
      return openAI.gpt4;
    default:
      throw new Error('Unsupported AI platform');
  }
}
