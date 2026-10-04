import { useAppStore } from '@/stores/useAppStore';
import { ChevronRight, ChevronDown, Database, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFormatIcon } from '@/lib/formatDetection';
import { useState } from 'react';

export function Sidebar() {
  const { files, activeFileId, activeTable, setActiveFile, setActiveTable, removeFile, sidebarOpen } = useAppStore();
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFile = (fileId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.tables.some(table => table.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No files open
          </div>
        ) : (
          <div className="py-2">
            {filteredFiles.map(file => (
              <div key={file.id}>
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent',
                    activeFileId === file.id && 'bg-accent'
                  )}
                  onClick={() => {
                    setActiveFile(file.id);
                    toggleFile(file.id);
                  }}
                >
                  <span className="text-lg">{getFormatIcon(file.format)}</span>
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                  {expandedFiles.has(file.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {expandedFiles.has(file.id) && (
                  <div className="pl-6 pr-2 py-1">
                    {file.tables.map(table => (
                      <div
                        key={table.name}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm text-sm',
                          'hover:bg-accent/50',
                          activeTable?.name === table.name && activeFileId === file.id && 'bg-accent'
                        )}
                        onClick={() => setActiveTable(table)}
                      >
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{table.name}</span>
                        {table.rowCount !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {table.rowCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
