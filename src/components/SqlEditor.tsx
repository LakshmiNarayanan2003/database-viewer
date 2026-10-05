import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { adapterRegistry } from '@/adapters';
import { Play, Code, History, BookOpen } from 'lucide-react';
import { Button } from './Button';

export function SqlEditor() {
  const { activeFileId } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const activeFile = useAppStore(state => state.files.find(f => f.id === activeFileId));

  const executeQuery = useCallback(async () => {
    if (!activeFileId || !query.trim()) return;

    const adapter = adapterRegistry.getAdapter(activeFile?.format || 'sqlite');
    if (!adapter || !adapter.supportsSQL || !adapter.executeQuery) {
      setError('SQL queries are not supported for this file format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      const result = await adapter.executeQuery(activeFileId, query);
      const endTime = performance.now();

      setColumns(result.columns);
      setResults(result.rows);
      setExecutionTime(endTime - startTime);

      // Add to history if not duplicate
      setQueryHistory(prev => {
        if (!prev.includes(query)) {
          return [query, ...prev].slice(0, 20);
        }
        return prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
      setResults(null);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, [activeFileId, activeFile?.format, query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  }, [executeQuery]);

  if (!activeFile || !activeFile.supportsSQL) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">SQL not supported</p>
          <p className="text-sm">SQL queries are only available for SQLite files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Editor toolbar */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={executeQuery}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run Query
          </Button>
          <span className="text-xs text-muted-foreground">
            (Ctrl/Cmd + Enter)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Query input */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here..."
            className="flex-1 p-4 font-mono text-sm bg-background border-none resize-none focus:outline-none"
            spellCheck={false}
          />

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Query history sidebar */}
        {showHistory && (
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border font-medium text-sm">
              Query History
            </div>
            <div className="flex-1 overflow-auto p-2">
              {queryHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No queries yet
                </p>
              ) : (
                queryHistory.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(q)}
                    className="w-full text-left p-2 text-sm font-mono hover:bg-accent rounded mb-1 truncate"
                  >
                    {q}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results !== null && (
        <div className="border-t border-border flex flex-col max-h-1/2">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">Results</span>
              <span className="text-muted-foreground">
                {results.length} rows
              </span>
              <span className="text-muted-foreground">
                ({executionTime.toFixed(2)}ms)
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b border-border">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-accent/50">
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="px-4 py-2 whitespace-nowrap">
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
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">Quick Reference</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• SELECT * FROM table_name</p>
          <p>• SELECT col1, col2 FROM table_name WHERE condition</p>
          <p>• SELECT * FROM table_name ORDER BY col LIMIT 10</p>
          <p>• SELECT COUNT(*) FROM table_name</p>
        </div>
      </div>
    </div>
  );
}
