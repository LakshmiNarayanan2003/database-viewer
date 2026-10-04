export type FileFormat =
  | 'sqlite'
  | 'duckdb'
  | 'csv'
  | 'tsv'
  | 'excel'
  | 'json'
  | 'jsonl'
  | 'parquet'
  | 'arrow'
  | 'feather'
  | 'ods'
  | 'sql'
  | 'access'
  | 'unknown';

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
  defaultValue?: any;
}

export interface Table {
  name: string;
  rowCount?: number;
  columns: Column[];
}

export interface DatabaseFile {
  id: string;
  name: string;
  format: FileFormat;
  size: number;
  tables: Table[];
  createdAt: Date;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface FilterState {
  column: string | null;
  value: string;
}
