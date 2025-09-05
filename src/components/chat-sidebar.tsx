'use client';

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {ChatPanel} from './chat-panel';
import {WebSearchPanel} from './web-search-panel';
import {AgentPanel} from './agent-panel';
import type {AIPlatform} from '@/app/page';

export default function ChatSidebar({
  apiKey,
  platform,
}: {
  apiKey: string | null;
  platform: AIPlatform;
}) {
  return (
    <Card className="h-full flex flex-col shadow-sm border">
      <CardHeader>
        <CardTitle className="font-headline text-xl">AI Assistant</CardTitle>
        <CardDescription>Chat, search, or run agent tasks.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="chat" className="h-full m-0">
              <ChatPanel apiKey={apiKey} platform={platform} />
            </TabsContent>
            <TabsContent value="search" className="h-full m-0">
              <WebSearchPanel apiKey={apiKey} platform={platform} />
            </TabsContent>
            <TabsContent value="agent" className="h-full m-0">
              <AgentPanel apiKey={apiKey} platform={platform} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
