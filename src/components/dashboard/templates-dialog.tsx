
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { templates } from '@/lib/templates';
import type { Widget } from '@/app/page';

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (widgets: Omit<Widget, 'id'>[]) => void;
}

export default function TemplatesDialog({ open, onOpenChange, onSelectTemplate }: TemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select a Dashboard Template</DialogTitle>
          <DialogDescription>
            Choose a pre-built template to get started quickly.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.name} className="flex flex-col rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-2">{template.icon} {template.name}</h3>
                <p className="text-sm text-muted-foreground flex-grow">{template.description}</p>
                <div className="mt-4">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Example Widgets:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                        {template.widgetExamples.map((widget, index) => (
                            <li key={index}>{widget}</li>
                        ))}
                    </ul>
                </div>
                <Button 
                    className="mt-4 w-full"
                    onClick={() => onSelectTemplate(template.widgets)}
                >
                    Select
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
