'use client';

import {useState} from 'react';
import {useEditorContext} from './editor-provider';
import {Input} from './ui/input';
import {Button} from './ui/button';
import {Presentation, Loader2} from 'lucide-react';
import {createPowerpointPresentationFromAgentTasking} from '@/ai/flows/create-powerpoint-presentation-from-agent-tasking';
import {Label} from './ui/label';
import {useToast} from '@/hooks/use-toast';
import type {AIPlatform} from '@/app/page';

export function AgentPanel({apiKey, platform}: {apiKey: string | null; platform: AIPlatform}) {
  const {editor} = useEditorContext();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleCreatePresentation = async () => {
    if (!query.trim() || !editor) return;
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: 'Please set your API key to use this feature.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createPowerpointPresentationFromAgentTasking({
        query,
        apiKey,
        platform,
      });

      const presentationContent = `<h2>Presentation on: ${query}</h2><hr>${result.presentation.replace(/---/g, '<hr>')}`;
      editor
        .chain()
        .focus()
        .insertContent(presentationContent, {
          parseOptions: {
            preserveWhitespace: 'full',
          },
        })
        .run();

      toast({
        title: 'Task complete',
        description: 'Presentation inserted into the editor.',
      });
      setQuery('');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Task failed',
        description: 'Could not create the presentation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="agent-task-query" className="font-headline text-base">
          Agent Tasking
        </Label>
        <p className="text-sm text-muted-foreground">Give the AI agent a task to perform.</p>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleCreatePresentation();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="agent-task-query">Create a presentation about:</Label>
          <Input
            id="agent-task-query"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g., The benefits of AI in writing"
            disabled={loading || !apiKey}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !query.trim() || !apiKey}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Presentation className="w-4 h-4 mr-2" />
          )}
          Create Presentation
        </Button>
      </form>
    </div>
  );
}
