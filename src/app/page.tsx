'use client';

import {useState, useEffect} from 'react';
import type {Editor} from '@tiptap/react';
import {EditorProvider} from '@/components/editor-provider';
import TiptapEditor from '@/components/editor';
import ChatSidebar from '@/components/chat-sidebar';
import Header from '@/components/header';

export type AIPlatform = 'gemini' | 'openai';

export default function Home() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [platform, setPlatform] = useState<AIPlatform>('gemini');
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedPlatform = localStorage.getItem('ai_platform') as AIPlatform | null;
    if (storedPlatform) {
      setPlatform(storedPlatform);
      const storedKey = localStorage.getItem(`${storedPlatform}_api_key`);
      if (storedKey) {
        setApiKey(storedKey);
      }
    } else {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, []);

  const handlePlatformChange = (newPlatform: AIPlatform) => {
    setPlatform(newPlatform);
    localStorage.setItem('ai_platform', newPlatform);
    const newKey = localStorage.getItem(`${newPlatform}_api_key`);
    setApiKey(newKey);
  };

  const handleApiKeySave = (key: string) => {
    localStorage.setItem(`${platform}_api_key`, key);
    setApiKey(key);
  };

  return (
    <EditorProvider editor={editor} setEditor={setEditor}>
      <div className="flex flex-col min-h-screen">
        <Header
          platform={platform}
          onPlatformChange={handlePlatformChange}
          apiKey={apiKey}
          onApiKeySave={handleApiKeySave}
        />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 items-start">
          <div className="md:col-span-2 lg:col-span-3 h-full">
            <div className="bg-card rounded-lg shadow-sm border h-full overflow-auto">
              <TiptapEditor />
            </div>
          </div>
          <div className="md:col-span-1 lg:col-span-1 h-full sticky top-4">
            <ChatSidebar apiKey={apiKey} platform={platform} />
          </div>
        </main>
      </div>
    </EditorProvider>
  );
}
