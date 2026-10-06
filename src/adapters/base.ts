import { DatabaseFile, QueryResult } from '@/types';

export interface DataAdapter {
  format: string;
  name: string;
  supportsSQL: boolean;
  supportsSchema: boolean;
  loadFile(file: File): Promise<DatabaseFile>;
  getTableData(fileId: string, tableName: string, offset: number, limit: number): Promise<any[][]>;
  getTableCount(fileId: string, tableName: string): Promise<number>;
  executeQuery?(fileId: string, query: string): Promise<QueryResult>;
  exportTable?(fileId: string, tableName: string, format: 'csv' | 'json'): Promise<string>;
  close?(fileId: string): void;
}
