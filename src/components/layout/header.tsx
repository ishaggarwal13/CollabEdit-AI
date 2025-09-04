

'use client';

import { AreaChart, MoreHorizontal, Download, Upload, Trash2, Plus, LayoutGrid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '../theme-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface HeaderProps {
  widgetCount: number;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  onAddWidget: () => void;
  onOpenTemplates: () => void;
  onOpenApiConfig: () => void;
}

export default function Header({ widgetCount, onExport, onImport, onClear, onAddWidget, onOpenTemplates, onOpenApiConfig }: HeaderProps) {
  const hasWidgets = widgetCount > 0;
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex w-full flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <AreaChart className="h-5 w-5 text-primary-foreground" />
           </div>
           <div>
            <a href="#" className="font-semibold text-lg">
                FinDash
            </a>
             <div className="hidden sm:block">
                {hasWidgets ? (
                <p className="text-xs text-muted-foreground">
                    {widgetCount} active widget{widgetCount > 1 ? 's' : ''} <span className="text-green-500">●</span> Real-time data
                </p>
                ) : (
                    <p className="text-xs text-muted-foreground">Build your custom dashboard from any API</p>
                )}
            </div>
           </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {hasWidgets && (
            <>
              <Button size="sm" onClick={onAddWidget} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Widget</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenTemplates}>
                <LayoutGrid className="mr-0 sm:mr-2 h-4 w-4" />
                 <span className="hidden sm:inline">Templates</span>
              </Button>
            </>
          )}
           <Button variant="outline" size="icon" onClick={onOpenApiConfig}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">API Configuration</span>
            </Button>

          {hasWidgets && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Dashboard (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Dashboard (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onClear} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Dashboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
