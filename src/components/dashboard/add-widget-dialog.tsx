
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, BarChart, LineChart } from 'lucide-react';
import { useState } from 'react';
import type { Widget, WidgetConfig } from '@/app/page';
import ChartWidgetConfig from './widget-configs/chart-widget-config';
import CardWidgetConfig from './widget-configs/card-widget-config';
import TableWidgetConfig from './widget-configs/table-widget-config';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Layout } from 'react-grid-layout';

export type WidgetType = 'table' | 'finance-card' | 'chart';

export const widgetTypes: {
    type: WidgetType,
    name: string,
    description: string,
    icon: JSX.Element,
    componentName: string,
    defaultLayout: { w: number, h: number }
}[] = [
  {
    type: 'chart',
    name: 'Chart',
    description: 'Candle or line graphs\nfor stock prices.',
    icon: <LineChart className="h-8 w-8 text-primary" />,
    componentName: 'StockChartWidget',
    defaultLayout: { w: 6, h: 4 },
  },
  {
    type: 'finance-card',
    name: 'Finance Card',
    description: 'Watchlist, market gainers,\nperformance data.',
    icon: <BarChart className="h-8 w-8 text-primary" />,
    componentName: 'KeyMetricsWidget',
    defaultLayout: { w: 3, h: 4 },
  },
  {
    type: 'table',
    name: 'Table',
    description: 'Paginated list of stocks\nwith filters.',
    icon: <Table className="h-8 w-8 text-primary" />,
    componentName: 'DataTableWidget',
    defaultLayout: { w: 12, h: 5 },
  },
];


interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widget: Omit<Widget, 'id'>) => void;
  currentLayout: Layout[];
}

export default function AddWidgetDialog({ open, onOpenChange, onAddWidget, currentLayout }: AddWidgetDialogProps) {
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [title, setTitle] = useState('');
  const [config, setConfig] = useState<WidgetConfig>({});

  const handleAddWidget = (widgetType: WidgetType) => {
    const selected = widgetTypes.find(w => w.type === widgetType);
    if (selected) {
        setTitle(selected.name);
        setSelectedWidgetType(widgetType);
        setShowConfig(true);
    }
  };

  const findOpenPosition = (layout: Layout[], widgetWidth: number, widgetHeight: number) => {
    const y = Math.max(0, ...layout.map(l => l.y + l.h));
    return { x: 0, y: y, w: widgetWidth, h: widgetHeight, i: 'new-widget' };
  }

  const handleSaveWidget = () => {
    if (!selectedWidgetType) return;

    const widgetInfo = widgetTypes.find((w) => w.type === selectedWidgetType);
    if (!widgetInfo) return;

    const newLayout = findOpenPosition(currentLayout, widgetInfo.defaultLayout.w, widgetInfo.defaultLayout.h);

    const newWidget: Omit<Widget, 'id'> = {
        componentName: widgetInfo.componentName,
        title: title,
        config: config,
        layout: {
            lg: newLayout
        }
    }

    onAddWidget(newWidget);
    resetState();
  };

  const resetState = () => {
    setShowConfig(false);
    setSelectedWidgetType(null);
    setTitle('');
    setConfig({});
    onOpenChange(false);
  }

  const handleBack = () => {
    setShowConfig(false);
    setSelectedWidgetType(null);
    setTitle('');
    setConfig({});
  }

  const renderConfigForm = () => {
    const commonProps = { config, setConfig };
    switch (selectedWidgetType) {
      case 'chart':
        return <ChartWidgetConfig {...commonProps} />;
      case 'finance-card':
        return <CardWidgetConfig {...commonProps} />;
      case 'table':
        return <TableWidgetConfig {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetState();
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{showConfig ? 'Configure Widget' : 'Add a New Widget'}</DialogTitle>
          <DialogDescription>
            {showConfig
              ? 'Customize your new widget.'
              : 'Select a widget type to add to your dashboard.'}
          </DialogDescription>
        </DialogHeader>

        {showConfig ? (
           <div className="flex-grow min-h-0 overflow-y-auto pr-6 -mr-6">
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="widget-title">Widget Title</Label>
                    <Input id="widget-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for your widget" />
                </div>
                {renderConfigForm()}
            </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3">
            {widgetTypes.map((widget) => (
              <div key={widget.type} className="flex self-stretch">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start justify-start gap-4 p-4 text-left"
                  onClick={() => handleAddWidget(widget.type)}
                >
                  <div className="flex items-center gap-2">
                    {widget.icon}
                    <p className="font-semibold">{widget.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{widget.description}</p>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {showConfig && (
            <div className="flex justify-end gap-2 pt-4 border-t shrink-0">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleSaveWidget}>Add Widget</Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
