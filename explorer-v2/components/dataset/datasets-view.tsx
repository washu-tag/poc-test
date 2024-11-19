import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UIBlock } from '../block';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { DatasetSkeleton } from './dataset-skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { EditableSection } from './editable-section';
import { Step } from '@/lib/types';

export const DatasetsView = ({
  block,
  handleVersionChange,
  currentVersionIndex,
  datasetsLength,
  datasetsLoading,
}: {
  block: UIBlock;
  // eslint-disable-next-line no-unused-vars
  handleVersionChange: (type: 'next' | 'prev') => void;
  currentVersionIndex: number;
  datasetsLength: number;
  datasetsLoading: boolean;
}) => {
  /*
   * NOTE: if there are no datasets, or if
   * the datasets are being fetched, then
   * we mark it as the current version.
   */
  const isLatestVersion = datasetsLength > 0 ? currentVersionIndex === datasetsLength - 1 : true;
  return (
    <>
      <div className="p-2 flex flex-col justify-between items-end">
        <div className="flex flex-row gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
                onClick={() => {
                  handleVersionChange('next');
                }}
                disabled={isLatestVersion || block.status === 'streaming'}
              >
                <ChevronLeft size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View next</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="p-2 h-fit dark:hover:bg-zinc-700 !pointer-events-auto"
                onClick={() => {
                  handleVersionChange('prev');
                }}
                disabled={currentVersionIndex === 0 || block.status === 'streaming'}
              >
                <ChevronRight size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View previous</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="prose dark:prose-invert dark:bg-muted bg-background h-full overflow-y-auto px-4 py-8 md:p-8 pb-40 items-center max-w-full">
        <div className="flex flex-row">
          {datasetsLoading ? <DatasetSkeleton /> : <DatasetView dataset={block} />}
        </div>
      </div>
    </>
  );
};

const DatasetView = ({ dataset }: { dataset: UIBlock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      'subject',
      'study',
      'seriesdescription',
      'patientage',
      'patientsex',
      'manufacturer',
      'findings_en',
    ]),
  );

  const {
    datasetId,
    createdAt,
    query,
    databaseQuery,
    maxDistance,
    resultLimit,
    resultsCount,
    results,
  } = dataset;

  // Get all possible columns from the ImageRow type
  const allColumns = useMemo(() => {
    if (!results?.length) return [];
    return Object.keys(results[0]);
  }, [results]);

  // Filter results based on search term
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim() || !results) return results;
    return results.filter((row) =>
      Object.entries(row).some(([_key, value]) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [results, searchTerm]);

  return (
    <div className="relative px-4 space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Dataset</CardTitle>
              <CardDescription>
                {createdAt ? `Created ${format(new Date(createdAt), 'PPP')}` : 'Streaming'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {dataset.status === 'streaming' ? (
                <Loader className="animate-spin" />
              ) : (
                <Badge variant="secondary">
                  {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium mb-1">Prompt Query</h4>
              <EditableSection
                textInput={query}
                inputType="text"
                maxDistance={maxDistance}
                resultLimit={resultLimit}
                step={Step.BuildQuery}
                datasetId={datasetId}
              >
                <p className="text-sm text-slate-600 py-2 px-3 bg-slate-50 rounded-md">
                  {query || 'No query entered'}
                </p>
              </EditableSection>
            </div>
            <div>
              <h4 className="font-medium mb-1">Generated Query</h4>
              <EditableSection
                textInput={databaseQuery}
                inputType="textarea"
                maxDistance={maxDistance}
                resultLimit={resultLimit}
                step={Step.ParseQuery}
                datasetId={datasetId}
              >
                <pre className="text-sm text-slate-600 bg-white p-3 rounded border overflow-x-auto">
                  {databaseQuery || <Loader className="animate-spin" />}
                </pre>
              </EditableSection>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      checked={visibleColumns.has(column)}
                      onCheckedChange={(checked) => {
                        const newColumns = new Set(visibleColumns);
                        if (checked) {
                          newColumns.add(column);
                        } else {
                          newColumns.delete(column);
                        }
                        setVisibleColumns(newColumns);
                      }}
                    >
                      {column}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] border rounded-md">
            <div className="w-full">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    {Array.from(visibleColumns).map((header) => (
                      <th key={header} className="p-3 text-left font-medium text-sm text-slate-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResults?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-slate-50">
                      {Array.from(visibleColumns).map((column) => (
                        <td key={`${rowIndex}-${column}`} className="p-3 text-sm">
                          {formatCellValue(row[column as keyof typeof row])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to format cell values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (value instanceof Date) return format(value, 'PPP');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
