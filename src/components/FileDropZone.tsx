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
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'w-full max-w-2xl border-2 border-dashed rounded-lg p-12 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="flex justify-center gap-4 mb-6">
          <Database className="h-12 w-12 text-muted-foreground" />
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold mb-2">Drop your database or data file here</h2>
        <p className="text-muted-foreground mb-6">
          Supports SQLite, CSV, TSV, JSON, JSONL, and Excel files
        </p>

        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          <span>Browse files</span>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".db,.sqlite,.sqlite3,.csv,.tsv,.xlsx,.xls,.json,.jsonl,.ndjson"
          />
        </label>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try a sample dataset</p>
          <button
            onClick={async () => {
              // Create a sample CSV in memory
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
            className="text-sm text-primary hover:underline"
          >
            Load sample CSV data
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-border space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your files are processed locally in your browser</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>No data is uploaded to any server</span>
          </div>
        </div>
      </div>
    </div>
  );
}
