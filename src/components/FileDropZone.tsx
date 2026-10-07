import { useCallback, useState } from 'react';
import { Upload, FileText, Database, FileSpreadsheet, Shield } from 'lucide-react';
import { useFileImport } from '@/hooks/useFileImport';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileLoaded?: () => void;
}

export function FileDropZone({ onFileLoaded }: FileDropZoneProps) {
  const { importFiles, loading, error } = useFileImport();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await importFiles(files);
      onFileLoaded?.();
    }
  }, [importFiles, onFileLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await importFiles(files);
      onFileLoaded?.();
    }
  }, [importFiles, onFileLoaded]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'w-full max-w-2xl border border-dashed rounded-lg px-6 py-10 sm:px-12 sm:py-14 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="flex justify-center gap-3 mb-6">
          <Database className="h-7 w-7 text-muted-foreground" />
          <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-medium tracking-tight mb-3">Explore your data</h2>
        <p className="text-muted-foreground mb-6">
          Drop a file here to get started. SQLite, CSV, JSON, Excel, Arrow, and more.
        </p>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          <span>Browse files</span>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".db,.sqlite,.sqlite3,.csv,.tsv,.xlsx,.xls,.json,.jsonl,.ndjson,.arrow,.feather"
          />
        </label>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Try a sample</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={async () => {
                try {
                  const basePath = import.meta.env.BASE_URL || '/';
                  const response = await fetch(`${basePath}sample-data/sample.db`);
                  if (!response.ok) throw new Error('Failed to load sample database');
                  const arrayBuffer = await response.arrayBuffer();
                  const file = new File([arrayBuffer], 'sample.db', { type: 'application/x-sqlite3' });
                  await importFiles([file]);
                  onFileLoaded?.();
                } catch (err) {
                  console.error('Failed to load sample DB:', err);
                  alert('Failed to load sample database. Please try again or use a different sample.');
                }
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              SQLite
            </button>
            <button
              onClick={async () => {
                const sampleCSV = `id,name,email,age,city
1,John Doe,john@example.com,30,New York
2,Jane Smith,jane@example.com,25,Los Angeles
3,Bob Johnson,bob@example.com,35,Chicago
4,Alice Williams,alice@example.com,28,Houston
5,Charlie Brown,charlie@example.com,32,Phoenix`;
                const blob = new Blob([sampleCSV], { type: 'text/csv' });
                const file = new File([blob], 'sample_data.csv', { type: 'text/csv' });
                await importFiles([file]);
                onFileLoaded?.();
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              CSV
            </button>
            <button
              onClick={async () => {
                const sampleJSON = [
                  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, city: 'New York' },
                  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, city: 'Los Angeles' },
                  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, city: 'Chicago' },
                ];
                const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
                const file = new File([blob], 'sample_data.json', { type: 'application/json' });
                await importFiles([file]);
                onFileLoaded?.();
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              JSON
            </button>
            <button
              onClick={async () => {
                const sampleJSONL = `{"id":1,"name":"John Doe","email":"john@example.com","age":30,"city":"New York"}
{"id":2,"name":"Jane Smith","email":"jane@example.com","age":25,"city":"Los Angeles"}
{"id":3,"name":"Bob Johnson","email":"bob@example.com","age":35,"city":"Chicago"}`;
                const blob = new Blob([sampleJSONL], { type: 'application/jsonl' });
                const file = new File([blob], 'sample_data.jsonl', { type: 'application/jsonl' });
                await importFiles([file]);
                onFileLoaded?.();
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              JSONL
            </button>
            <button
              onClick={async () => {
                try {
                  const basePath = import.meta.env.BASE_URL || '/';
                  const response = await fetch(`${basePath}sample-data/sample.arrow`);
                  if (!response.ok) throw new Error('Failed to load sample Arrow file');
                  const arrayBuffer = await response.arrayBuffer();
                  const file = new File([arrayBuffer], 'sample.arrow', { type: 'application/octet-stream' });
                  await importFiles([file]);
                  onFileLoaded?.();
                } catch (err) {
                  console.error('Failed to load sample Arrow:', err);
                  alert('Failed to load sample Arrow file. Please drag and drop the file instead.');
                }
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              Arrow
            </button>
            <button
              onClick={async () => {
                try {
                  const basePath = import.meta.env.BASE_URL || '/';
                  const response = await fetch(`${basePath}sample-data/sample.feather`);
                  if (!response.ok) throw new Error('Failed to load sample Feather file');
                  const arrayBuffer = await response.arrayBuffer();
                  const file = new File([arrayBuffer], 'sample.feather', { type: 'application/octet-stream' });
                  await importFiles([file]);
                  onFileLoaded?.();
                } catch (err) {
                  console.error('Failed to load sample Feather:', err);
                  alert('Failed to load sample Feather file. Please drag and drop the file instead.');
                }
              }}
              className="text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
            >
              Feather
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Files stay in your browser</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>No uploads. No account needed.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
