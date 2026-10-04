import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { detectFileFormat } from '@/lib/formatDetection';
import { adapterRegistry } from '@/adapters';

export function useFileImport() {
  const { addFile } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const format = detectFileFormat(file.name);

      if (format === 'unknown') {
        throw new Error('Unsupported file format');
      }

      const adapter = adapterRegistry.getAdapter(format);
      if (!adapter) {
        throw new Error(`No adapter available for format: ${format}`);
      }

      const databaseFile = await adapter.loadFile(file);
      addFile(databaseFile);

      return databaseFile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import file';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const results = await Promise.allSettled(fileArray.map(importFile));

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed };
  };

  return { importFile, importFiles, loading, error };
}
