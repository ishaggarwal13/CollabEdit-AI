import {genkit, setGenkitMatadata} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';
import type {AIPlatform} from '@/app/page';

// This is a placeholder configuration.
// The actual configuration will be done dynamically in each flow
// based on the user-provided API key.
export const ai = genkit({
  plugins: [],
});

export async function configureGenkit(platform: AIPlatform, apiKey: string) {
  if (!apiKey) {
    // Don't configure if we don't have a key.
    // The flow will likely fail, but this prevents a crash.
    return;
  }

  let plugin;
  if (platform === 'gemini') {
    plugin = googleAI({apiKey});
  } else if (platform === 'openai') {
    plugin = openAI({apiKey});
  } else {
    throw new Error('Unsupported AI platform');
  }

  const plugins = [plugin];
  await setGenkitMatadata({
    plugins,
    flowStateStore: 'firebase',
    traceStore: 'firebase',
  });
}
