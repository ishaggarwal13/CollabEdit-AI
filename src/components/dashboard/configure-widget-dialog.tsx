
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import type { Widget, WidgetConfig } from '@/app/page';
import ChartWidgetConfig from './widget-configs/chart-widget-config';
import CardWidgetConfig from './widget-configs/card-widget-config';
import TableWidgetConfig from './widget-configs/table-widget-config';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConfigureWidgetDialogProps {
  widget: Widget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (widget: Widget) => void;
}

export default function ConfigureWidgetDialog({
  widget,
  open,
  onOpenChange,
  onSave,
}: ConfigureWidgetDialogProps) {
  const [title, setTitle] = useState(widget.title);
  const [config, setConfig] = useState<WidgetConfig>(widget.config || {});

  useEffect(() => {
    if (open) {
      setTitle(widget.title);
      setConfig(widget.config || {});
    }
  }, [widget, open]);

  const handleSave = () => {
    onSave({
      ...widget,
      title,
      config,
    });
  };

  const getWidgetType = () => {
    if (widget.componentName === 'StockChartWidget') return 'chart';
    if (widget.componentName === 'KeyMetricsWidget') return 'finance-card';
    if (widget.componentName === 'DataTableWidget') return 'table';
    return null;
  }

  const renderConfigForm = () => {
    const commonProps = { config, setConfig };
    switch (getWidgetType()) {
      case 'chart':
        return <ChartWidgetConfig {...commonProps} />;
      case 'finance-card':
        return <CardWidgetConfig {...commonProps} />;
      case 'table':
        return <TableWidgetConfig {...commonProps} />;
      default:
        return <p className="text-sm text-muted-foreground">This widget is not configurable.</p>;
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle>Configure: {widget.title}</SheetTitle>
          <SheetDescription>
            Update the settings for your widget.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow min-h-0">
            <div className="space-y-4 p-1">
                <div>
                    <Label htmlFor="widget-title">Widget Title</Label>
                    <Input
                    id="widget-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your widget"
                    />
                </div>
                {renderConfigForm()}
            </div>
        </ScrollArea>
        <SheetFooter className="shrink-0 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
