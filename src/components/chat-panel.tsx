'use client';

import {useState} from 'react';
import {useEditorContext} from './editor-provider';
import {ScrollArea} from './ui/scroll-area';
import {Input} from './ui/input';
import {Button} from './ui/button';
import {Send, User, Bot, Loader2} from 'lucide-react';
import {chatWithAiForRefinement} from '@/ai/flows/chat-with-ai-assistant-for-document-refinement';
import {useToast} from '@/hooks/use-toast';
import type {AIPlatform} from '@/app/page';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function ChatPanel({apiKey, platform}: {apiKey: string | null; platform: AIPlatform}) {
  const {editor} = useEditorContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handleSend = async () => {
    if (!input.trim() || !editor) return;
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: 'Please set your API key to use this feature.',
      });
      return;
    }

    const userMessage: Message = {role: 'user', content: input};
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const documentContent = editor.getHTML();
      const result = await chatWithAiForRefinement({
        documentContent,
        userMessage: input,
        apiKey,
        platform,
      });

      if (result.updatedDocumentContent) {
        editor.commands.setContent(result.updatedDocumentContent);
      }

      const botMessage: Message = {role: 'bot', content: result.aiResponse};
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {role: 'bot', content: 'Sorry, I encountered an error.'};
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-16rem)]">
      <ScrollArea className="flex-1 mb-4 pr-4 -mr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'bot' && (
                <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`rounded-lg p-3 text-sm max-w-[90%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="p-2 rounded-full bg-secondary flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={apiKey ? 'Ask AI to edit or write...' : 'Set API Key to enable chat'}
          disabled={loading || !apiKey}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim() || !apiKey}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
