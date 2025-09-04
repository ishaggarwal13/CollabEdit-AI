
'use client';

import { Table, ArrowUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WidgetConfig } from '@/app/page';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TableData {
    [key: string]: any;
}

interface DataTableWidgetProps {
  config?: WidgetConfig;
  data: TableData[];
}

const ITEMS_PER_PAGE = 5;


export default function DataTableWidget({ config, data }: DataTableWidgetProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);

    const filteredAndSortedData = useMemo(() => {
        let processedData = [...data];

        if (searchTerm) {
            processedData = processedData.filter(item => 
                Object.values(item).some(value => 
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortConfig.key) {
            processedData.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];

                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processedData;
    }, [data, searchTerm, sortConfig]);

    const headers = useMemo(() => {
        if (config?.dataSource === 'custom' && config.selectedFields && config.selectedFields.length > 0) {
            return config.selectedFields.map(f => f.label);
        }
        if (filteredAndSortedData.length === 0) return [];
        return Object.keys(filteredAndSortedData[0]);
    }, [filteredAndSortedData, config]);

    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }


  return (
    <div className="flex flex-col h-full">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search table..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
            />
        </div>
        <ScrollArea className="flex-grow w-full whitespace-nowrap">
            <UiTable>
                <TableHeader>
                <TableRow>
                    {headers.map(header => (
                        <TableHead key={header} className="whitespace-nowrap">
                            <Button variant="ghost" onClick={() => requestSort(header)} className="p-0 hover:bg-transparent capitalize">
                                {header.replace(/_/g, ' ')}
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                        {headers.map(header => (
                            <TableCell key={header} className="whitespace-nowrap">{String(row[header] ?? '')}</TableCell>
                        ))}
                    </TableRow>
                ))}
                </TableBody>
            </UiTable>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 flex-shrink-0">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}
