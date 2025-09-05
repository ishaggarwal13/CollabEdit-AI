'use client';

import {useState} from 'react';
import {useEditorContext} from './editor-provider';
import {Input} from './ui/input';
import {Button} from './ui/button';
import {Search, Loader2} from 'lucide-react';
import {summarizeWebSearchResults} from '@/ai/flows/summarize-web-search-results';
import {Label} from './ui/label';
import {useToast} from '@/hooks/use-toast';
import type {AIPlatform} from '@/app/page';

export function WebSearchPanel({apiKey, platform}: {apiKey: string | null; platform: AIPlatform}) {
  const {editor} = useEditorContext();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleSearch = async () => {
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
      const result = await summarizeWebSearchResults({query, apiKey, platform});

      editor
        .chain()
        .focus()
        .insertContent(`<p><b>Summary for "${query}":</b></p><p>${result.summary}</p>`)
        .run();

      toast({
        title: 'Search complete',
        description: 'Summary inserted into the editor.',
      });
      setQuery('');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: 'Could not fetch or summarize search results.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="web-search-query" className="font-headline text-base">
          Web Search & Summarize
        </Label>
        <p className="text-sm text-muted-foreground">
          Search the web and insert a summary into your document.
        </p>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className="space-y-2"
      >
        <Input
          id="web-search-query"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g., Latest news on Next.js 15"
          disabled={loading || !apiKey}
        />
        <Button type="submit" className="w-full" disabled={loading || !query.trim() || !apiKey}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          Search & Summarize
        </Button>
      </form>
    </div>
  );
}
