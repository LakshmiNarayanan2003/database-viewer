import { DataAdapter } from './base';
import { SQLiteAdapter } from './sqliteAdapter';
import { CSVAdapter, TSVAdapter } from './csvAdapter';
import { JSONAdapter, JSONLAdapter } from './jsonAdapter';
import { ExcelAdapter } from './excelAdapter';
import { FileFormat } from '@/types';

export class AdapterRegistry {
  private adapters: Map<FileFormat, DataAdapter> = new Map();

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters() {
    const sqliteAdapter = new SQLiteAdapter();
    const csvAdapter = new CSVAdapter();
    const tsvAdapter = new TSVAdapter();
    const jsonAdapter = new JSONAdapter();
    const jsonlAdapter = new JSONLAdapter();
    const excelAdapter = new ExcelAdapter();

    this.adapters.set('sqlite', sqliteAdapter);
    this.adapters.set('csv', csvAdapter);
    this.adapters.set('tsv', tsvAdapter);
    this.adapters.set('json', jsonAdapter);
    this.adapters.set('jsonl', jsonlAdapter);
    this.adapters.set('excel', excelAdapter);
  }

  getAdapter(format: FileFormat): DataAdapter | null {
    return this.adapters.get(format) || null;
  }

  getSupportedFormats(): FileFormat[] {
    return Array.from(this.adapters.keys());
  }

  isFormatSupported(format: FileFormat): boolean {
    return this.adapters.has(format);
  }
}

export const adapterRegistry = new AdapterRegistry();
