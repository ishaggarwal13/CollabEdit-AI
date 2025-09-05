'use client';

import type {Editor} from '@tiptap/react';
import {useState, useEffect} from 'react';
import {Button} from './ui/button';
import {Minimize2, Maximize2, Table} from 'lucide-react';
import {PreviewModal} from './preview-modal';
import type {AIPlatform} from '@/app/page';

type TransformationType = 'shorten' | 'lengthen' | 'convert to table';

export default function FloatingToolbar({editor}: {editor: Editor}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [transformation, setTransformation] = useState<TransformationType | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [platform, setPlatform] = useState<AIPlatform>('gemini');

  useEffect(() => {
    const storedPlatform = (localStorage.getItem('ai_platform') as AIPlatform) || 'gemini';
    setPlatform(storedPlatform);
    const storedKey = localStorage.getItem(`${storedPlatform}_api_key`);
    if (storedKey) {
      setApiKey(storedKey);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai_platform' && e.newValue) {
        const newPlatform = e.newValue as AIPlatform;
        setPlatform(newPlatform);
        setApiKey(localStorage.getItem(`${newPlatform}_api_key`));
      } else if (e.key === `${platform}_api_key`) {
        setApiKey(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [platform]);

  const handleAction = (transformationType: TransformationType) => {
    const {from, to} = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    setSelectedText(text);
    setTransformation(transformationType);
    setModalOpen(true);
  };

  const onConfirm = (newText: string) => {
    const {from, to} = editor.state.selection;
    editor
      .chain()
      .focus()
      .deleteRange({from, to})
      .insertContent(newText, {
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })
      .run();
  };

  return (
    <div className="flex gap-1 bg-card p-1 rounded-lg border shadow-xl">
      <Button variant="ghost" size="sm" onClick={() => handleAction('shorten')}>
        <Minimize2 className="w-4 h-4 mr-1" /> Shorten
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleAction('lengthen')}>
        <Maximize2 className="w-4 h-4 mr-1" /> Lengthen
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleAction('convert to table')}>
        <Table className="w-4 h-4 mr-1" /> To Table
      </Button>

      {transformation && (
        <PreviewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          originalText={selectedText}
          transformationType={transformation}
          onConfirm={onConfirm}
          apiKey={apiKey}
          platform={platform}
        />
      )}
    </div>
  );
}
