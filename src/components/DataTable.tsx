import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { adapterRegistry } from '@/adapters';
import { ChevronLeft, ChevronRight, Download, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';
import { cn } from '@/lib/utils';

export function DataTable() {
  const { files, activeFileId, activeTable, pagination, setPagination, sort, setSort, filter, setFilter } = useAppStore();
  const [data, setData] = useState<any[][]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const loadData = async () => {
    if (!activeFileId || !activeTable) return;

    setLoading(true);
    try {
      const activeFile = files.find(f => f.id === activeFileId);
      if (!activeFile) return;

      const adapter = adapterRegistry.getAdapter(activeFile.format);
      if (!adapter) return;

      const [rows, count] = await Promise.all([
        adapter.getTableData(activeFileId, activeTable.name, pagination.pageIndex * pagination.pageSize, pagination.pageSize),
        adapter.getTableCount(activeFileId, activeTable.name),
      ]);

      setData(rows);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when table or pagination changes
  useMemo(() => {
    loadData();
  }, [activeFileId, activeTable, pagination]);

  const filteredData = useMemo(() => {
    if (!filter.column || !filter.value) return data;

    const columnIndex = activeTable?.columns.findIndex(c => c.name === filter.column);
    if (columnIndex === -1 || columnIndex === undefined) return data;

    const searchLower = filter.value.toLowerCase();
    return data.filter(row => {
      const cell = row[columnIndex];
      return String(cell).toLowerCase().includes(searchLower);
    });
  }, [data, filter, activeTable]);

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return filteredData;

    const columnIndex = activeTable?.columns.findIndex(c => c.name === sort.column);
    if (columnIndex === -1 || columnIndex === undefined) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[columnIndex];
      const bVal = b[columnIndex];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sort, activeTable]);

  const handleSort = (columnName: string) => {
    if (sort.column === columnName) {
      if (sort.direction === 'asc') {
        setSort({ column: columnName, direction: 'desc' });
      } else if (sort.direction === 'desc') {
        setSort({ column: null, direction: null });
      } else {
        setSort({ column: columnName, direction: 'asc' });
      }
    } else {
      setSort({ column: columnName, direction: 'asc' });
    }
  };

  const handleExport = async () => {
    if (!activeFileId || !activeTable) return;

    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    const adapter = adapterRegistry.getAdapter(activeFile.format);
    if (!adapter || !adapter.exportTable) return;

    try {
      const content = await adapter.exportTable(activeFileId, activeTable.name, exportFormat);
      const blob = new Blob([content], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTable.name}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  if (!activeTable) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No table selected</p>
          <p className="text-sm">Select a table from the sidebar to view its data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={filter.value}
            onChange={(e) => setFilter({ ...filter, value: e.target.value })}
            className="pl-8"
          />
        </div>

        <select
          value={filter.column || ''}
          onChange={(e) => setFilter({ ...filter, column: e.target.value || null })}
          className="h-10 px-3 py-2 text-sm border border-input rounded-md bg-background"
        >
          <option value="">All columns</option>
          {activeTable.columns.map(col => (
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>

        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
          className="h-10 px-3 py-2 text-sm border border-input rounded-md bg-background"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>

        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size={32} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr>
                {activeTable.columns.map(column => (
                  <th
                    key={column.name}
                    className={cn(
                      'px-4 py-2 text-left font-medium cursor-pointer hover:bg-accent',
                      'select-none whitespace-nowrap'
                    )}
                    onClick={() => handleSort(column.name)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.name}</span>
                      <span className="text-xs text-muted-foreground">({column.type})</span>
                      {sort.column === column.name && (
                        sort.direction === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border hover:bg-accent/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">
                      {cell === null || cell === undefined ? (
                        <span className="text-muted-foreground italic">NULL</span>
                      ) : typeof cell === 'object' ? (
                        <span className="text-xs">{JSON.stringify(cell)}</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {sortedData.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-border p-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} of {totalCount} rows
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
            disabled={pagination.pageIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {pagination.pageIndex + 1} of {totalPages || 1}
          </span>

          <Button
            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
            disabled={pagination.pageIndex >= totalPages - 1}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            value={pagination.pageSize}
            onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
            className="h-8 px-2 text-sm border border-input rounded-md bg-background"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>
    </div>
  );
}
