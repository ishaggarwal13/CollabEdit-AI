'use client';

import {BotMessageSquare, KeyRound} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';
import {Button} from './ui/button';
import {Label} from './ui/label';
import {Input} from './ui/input';
import {useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type {AIPlatform} from '@/app/page';

interface HeaderProps {
  platform: AIPlatform;
  onPlatformChange: (platform: AIPlatform) => void;
  apiKey: string | null;
  onApiKeySave: (apiKey: string) => void;
}

export default function Header({
  platform,
  onPlatformChange,
  apiKey,
  onApiKeySave,
}: HeaderProps) {
  const [keyInput, setKeyInput] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const {toast} = useToast();

  const handleSave = () => {
    if (keyInput.trim()) {
      onApiKeySave(keyInput.trim());
      setKeyInput('');
      setPopoverOpen(false);
      toast({
        title: 'API Key Saved',
        description: `Your ${platform.toUpperCase()} API key has been saved.`,
      });
    }
  };

  const platformDisplayNames: Record<AIPlatform, string> = {
    gemini: 'Gemini',
    openai: 'OpenAI',
  };

  return (
    <header className="p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BotMessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">CollabEdit AI</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={platform} onValueChange={value => onPlatformChange(value as AIPlatform)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant={apiKey ? 'outline' : 'default'} size="sm">
                <KeyRound className="w-4 h-4 mr-2" />
                {apiKey ? 'API Key Set' : 'Set API Key'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none font-headline">
                    {platformDisplayNames[platform]} API Key
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can get a key from{' '}
                    {platform === 'gemini' ? 'Google AI Studio' : 'OpenAI Platform'}.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    placeholder={`Enter your ${platformDisplayNames[platform]} API key`}
                    type="password"
                  />
                </div>
                <Button onClick={handleSave} disabled={!keyInput.trim()}>
                  Save Key
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
