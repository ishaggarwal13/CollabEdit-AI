'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {Button} from './ui/button';
import {ScrollArea} from './ui/scroll-area';
import {useEffect, useState} from 'react';
import {applyAiTransformation} from '@/ai/flows/apply-ai-powered-text-transformations';
import {Loader2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import type {AIPlatform} from '@/app/page';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  transformationType: 'shorten' | 'lengthen' | 'convert to table';
  onConfirm: (newText: string) => void;
  apiKey: string | null;
  platform: AIPlatform;
}

export function PreviewModal({
  open,
  onOpenChange,
  originalText,
  transformationType,
  onConfirm,
  apiKey,
  platform,
}: PreviewModalProps) {
  const [transformedText, setTransformedText] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (open && originalText) {
      if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: 'Please set your API key to use this feature.',
        });
        onOpenChange(false);
        return;
      }
      setLoading(true);
      setTransformedText('');
      applyAiTransformation({
        selectedText: originalText,
        transformationType: transformationType,
        apiKey,
        platform,
      })
        .then(result => {
          setTransformedText(result.transformedText);
        })
        .catch(error => {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Transformation failed',
            description: 'Could not apply the AI transformation.',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, originalText, transformationType, apiKey, platform, onOpenChange, toast]);

  const handleConfirm = () => {
    onConfirm(transformedText);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Edit Preview</DialogTitle>
          <DialogDescription>Review the changes suggested by the AI.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 font-headline">Original</h3>
            <ScrollArea className="h-72 rounded-md border p-4 bg-muted/50">
              <pre className="text-sm whitespace-pre-wrap font-body">{originalText}</pre>
            </ScrollArea>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 font-headline">AI Suggestion</h3>
            <ScrollArea className="h-72 rounded-md border p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-body">{transformedText}</pre>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !transformedText}>
            Confirm & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
