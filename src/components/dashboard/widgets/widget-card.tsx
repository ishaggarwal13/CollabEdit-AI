
import type { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GripVertical, RefreshCw, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WidgetCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onRemove: () => void;
  onConfigure: () => void;
  isLoading: boolean;
  error?: string | null;
  lastUpdated: string | null;
  hasData: boolean;
}

export function WidgetCard({ 
    title,
    icon,
    children, 
    className, 
    onRefresh,
    isRefreshing,
    onRemove,
    onConfigure,
    isLoading,
    error,
    lastUpdated,
    hasData
}: WidgetCardProps) {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col h-full items-center justify-center">
            <div className="space-y-4 w-full p-4">
                <Skeleton className="h-[60%] w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                 <Skeleton className="h-8 w-full" />
            </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="text-destructive mb-2">
                <AlertTriangle className="mx-auto h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Error Loading Data
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {error}
            </p>
             <Button onClick={onRefresh} className="mt-4" size="sm">
                Try Again
            </Button>
        </div>
       )
    }

    if (!hasData) {
         return (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                <p>No data available. <br/> Please check widget configuration or API provider.</p>
            </div>
        )
    }

    return children;
  }


  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="widget-drag-handle cursor-move">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              {icon}
              {title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onConfigure}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onRefresh}>Refresh</DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                 Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">{renderContent()}</CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{lastUpdated ? `Last updated: ${lastUpdated}` : '...'}</span>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefreshing || isLoading} className="h-6 w-6">
            <RefreshCw className={cn('h-4 w-4', (isRefreshing || isLoading) && 'animate-spin')} />
        </Button>
      </CardFooter>
    </Card>
  );
}
