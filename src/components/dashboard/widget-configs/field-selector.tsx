
'use client'

import { useEffect, useState, useMemo, useCallback } from "react";
import { getAndFlattenApiData } from "@/lib/actions";
import type { SelectedField } from "@/app/page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type FlattenedData = {
    path: string;
    type: string;
    value: string;
};

interface FieldSelectorProps {
    endpointUrl: string;
    selectedFields: SelectedField[];
    setSelectedFields: (fields: SelectedField[]) => void;
    allowMultiple?: boolean;
    showArrayFilter?: boolean;
    filter?: 'arrays';
}

export default function FieldSelector({ endpointUrl, selectedFields, setSelectedFields, allowMultiple = true, showArrayFilter = false, filter }: FieldSelectorProps) {
    const [availableFields, setAvailableFields] = useState<FlattenedData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showArraysOnly, setShowArraysOnly] = useState(filter === 'arrays');
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        if (!endpointUrl) {
            setAvailableFields([]);
            setIsLoading(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAndFlattenApiData(endpointUrl);
            if (result.success && result.flattenedData) {
                setAvailableFields(result.flattenedData);
            } else {
                setError(result.error || 'Failed to fetch or parse data.');
                setAvailableFields([]);
                toast({
                    title: 'API Error',
                    description: result.error || 'Could not fetch data from the provided endpoint.',
                    variant: 'destructive'
                });
            }
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            setAvailableFields([]);
                toast({
                title: 'Fetch Error',
                description: e.message || 'An unknown error occurred while fetching data.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [endpointUrl, toast]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 500);

        return () => {
            clearTimeout(handler);
        };

    }, [fetchData]);
    
    const isSelected = (path: string) => selectedFields.some(f => f.path === path);

    const handleFieldSelect = (field: FlattenedData) => {
        if (isSelected(field.path)) return;

        const newField: SelectedField = {
            path: field.path,
            label: field.path.split('.').pop() || field.path,
            isArray: field.type === 'array',
        };

        if (allowMultiple) {
            setSelectedFields([...selectedFields, newField]);
        } else {
            setSelectedFields([newField]);
        }
    };

    const handleFieldRemove = (path: string) => {
        setSelectedFields(selectedFields.filter(f => f.path !== path));
    };

    const handleLabelChange = (path: string, newLabel: string) => {
        setSelectedFields(selectedFields.map(f => f.path === path ? { ...f, label: newLabel } : f));
    }

    const filteredAvailableFields = useMemo(() => {
        return availableFields.filter(field => {
            const searchMatch = field.path.toLowerCase().includes(search.toLowerCase());
            const typeMatch = !showArraysOnly || field.type === 'array';
            return searchMatch && typeMatch;
        });
    }, [availableFields, search, showArraysOnly]);

    return (
        <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Field Selection</h3>
            {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Fetching fields from API...</div>}
            {error && <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Error: {error}</div>}
            
            {!isLoading && !error && availableFields.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                     {/* Available Fields */}
                    <div className="space-y-2">
                        <Label>Available Fields</Label>
                        <Input 
                            placeholder="Search for fields..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                         {showArrayFilter && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="show-arrays-only" 
                                    checked={showArraysOnly} 
                                    onCheckedChange={(checked) => setShowArraysOnly(Boolean(checked))}
                                />
                                <Label htmlFor="show-arrays-only" className="text-sm font-normal">Show arrays only</Label>
                            </div>
                        )}
                        <ScrollArea className="h-48 rounded-md border p-2">
                            {filteredAvailableFields.length > 0 ? (
                                filteredAvailableFields.map(field => (
                                    <div key={field.path} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                                        <div className="truncate text-sm">
                                            <p className="font-mono text-xs" title={field.path}>{field.path}</p>
                                            <p className="text-muted-foreground text-xs">{field.type}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleFieldSelect(field)} disabled={isSelected(field.path)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-muted-foreground">No fields match your search.</p>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Selected Fields */}
                    <div className="space-y-2">
                        <Label>Selected Fields</Label>
                         <ScrollArea className="h-48 rounded-md border p-2">
                             {selectedFields.length > 0 ? (
                                selectedFields.map(field => (
                                    <div key={field.path} className="space-y-1 p-2 rounded-md hover:bg-muted">
                                        <div className="flex items-center justify-between">
                                            <p className="font-mono text-xs truncate" title={field.path}>{field.path}</p>
                                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleFieldRemove(field.path)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="Display Label"
                                            value={field.label}
                                            onChange={(e) => handleLabelChange(field.path, e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                ))
                             ) : (
                                 <p className="p-4 text-center text-sm text-muted-foreground">
                                    {allowMultiple ? 'Select fields from the left.' : 'Select a field from the left.'}
                                </p>
                             )}
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    );
}
