import { useCallback, useState } from 'react';
import { Upload, FileText, Database, FileSpreadsheet, X } from 'lucide-react';
import { useFileImport } from '@/hooks/useFileImport';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileLoaded?: () => void;
}

export function UploadModal({ isOpen, onClose, onFileLoaded }: UploadModalProps) {
  const { importFiles, loading, error } = useFileImport();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await importFiles(files);
      onFileLoaded?.();
      onClose();
    }
  }, [importFiles, onFileLoaded, onClose]);

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
      onClose();
    }
  }, [importFiles, onFileLoaded, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Upload File</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              loading && 'opacity-50 pointer-events-none'
            )}
          >
            <div className="flex justify-center gap-4 mb-6">
              <Database className="h-12 w-12 text-muted-foreground" />
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-semibold mb-2">Drop your database or data file here</h3>
            <p className="text-muted-foreground mb-6">
              Supports SQLite, DuckDB, CSV, TSV, JSON, JSONL, Excel, Parquet, Arrow, and Feather files
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Browse files</span>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".db,.sqlite,.sqlite3,.duckdb,.csv,.tsv,.xlsx,.xls,.json,.jsonl,.ndjson,.parquet,.arrow,.feather"
              />
            </label>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Sample datasets */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Or try a sample dataset</p>
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
                    onClose();
                  } catch (err) {
                    console.error('Failed to load sample DB:', err);
                    alert('Failed to load sample database. Please try again or use a different sample.');
                  }
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample DB
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
                  onClose();
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample CSV
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
                  onClose();
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample JSON
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
                  onClose();
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample JSONL
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
                    onClose();
                  } catch (err) {
                    console.error('Failed to load sample Arrow:', err);
                    alert('Failed to load sample Arrow file. Please drag and drop the file instead.');
                  }
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample Arrow
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
                    onClose();
                  } catch (err) {
                    console.error('Failed to load sample Feather:', err);
                    alert('Failed to load sample Feather file. Please drag and drop the file instead.');
                  }
                }}
                className="text-sm text-primary hover:underline"
              >
                Load sample Feather
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
