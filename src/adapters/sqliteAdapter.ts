import { DataAdapter } from './base';
import { DatabaseFile, Table, Column, QueryResult } from '@/types';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;

async function initSQL(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `/sql-wasm.wasm`,
    });
  }
  return SQL;
}

export class SQLiteAdapter implements DataAdapter {
  format = 'sqlite';
  name = 'SQLite';
  supportsSQL = true;
  supportsSchema = true;

  private databases: Map<string, Database> = new Map();

  async loadFile(file: any): Promise<DatabaseFile> {
    const SQL = await initSQL();
    const arrayBuffer = await file.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(arrayBuffer));

    const fileId = `sqlite-${Date.now()}-${file.name}`;
    this.databases.set(fileId, db);

    const tables = await this.extractTables(db);

    return {
      id: fileId,
      name: file.name,
      format: 'sqlite',
      size: file.size,
      tables,
      createdAt: new Date(),
    };
  }

  private async extractTables(db: Database): Promise<Table[]> {
    const tables: Table[] = [];

    const tableNames = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    if (tableNames.length > 0) {
      for (const row of tableNames[0].values) {
        const tableName = row[0] as string;
        const columns = await this.extractColumns(db, tableName);
        const rowCount = await this.getRowCount(db, tableName);

        tables.push({
          name: tableName,
          rowCount,
          columns,
        });
      }
    }

    return tables;
  }

  private async extractColumns(db: Database, tableName: string): Promise<Column[]> {
    const columns: Column[] = [];
    const pragma = db.exec(`PRAGMA table_info(${tableName})`);

    if (pragma.length > 0) {
      for (const row of pragma[0].values) {
        const [, name, type, notnull, dflt_value, pk] = row;
        columns.push({
          name: name as string,
          type: (type as string) || 'ANY',
          nullable: notnull === 0,
          primaryKey: pk === 1,
          defaultValue: dflt_value,
        });
      }
    }

    return columns;
  }

  private async getRowCount(db: Database, tableName: string): Promise<number> {
    try {
      const result = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0] as number;
      }
    } catch (e) {
      console.error(`Error getting row count for ${tableName}:`, e);
    }
    return 0;
  }

  async getTableData(fileId: string, tableName: string, offset: number, limit: number): Promise<any[][]> {
    const db = this.databases.get(fileId);
    if (!db) throw new Error('Database not found');

    const result = db.exec(
      `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`
    );

    if (result.length > 0) {
      return result[0].values;
    }

    return [];
  }

  async getTableCount(fileId: string, tableName: string): Promise<number> {
    const db = this.databases.get(fileId);
    if (!db) throw new Error('Database not found');
    return this.getRowCount(db, tableName);
  }

  async executeQuery(fileId: string, query: string): Promise<QueryResult> {
    const db = this.databases.get(fileId);
    if (!db) throw new Error('Database not found');

    const startTime = performance.now();

    try {
      const result = db.exec(query);
      const endTime = performance.now();

      if (result.length > 0) {
        const columns = result[0].columns;
        const rows = result[0].values;

        return {
          columns,
          rows,
          rowCount: rows.length,
          executionTime: endTime - startTime,
        };
      }

      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: endTime - startTime,
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error}`);
    }
  }

  async exportTable(fileId: string, tableName: string, format: 'csv' | 'json'): Promise<string> {
    const db = this.databases.get(fileId);
    if (!db) throw new Error('Database not found');

    const result = db.exec(`SELECT * FROM ${tableName}`);
    if (result.length === 0) return '';

    const columns = result[0].columns;
    const rows = result[0].values;

    if (format === 'csv') {
      const header = columns.join(',');
      const data = rows.map((row: any[]) => row.map((cell: any) => this.escapeCSV(cell)).join(','));
      return [header, ...data].join('\n');
    } else {
      const data = rows.map((row: any[]) => {
        const obj: Record<string, any> = {};
        columns.forEach((col: any, i: number) => {
          obj[col] = row[i];
        });
        return obj;
      });
      return JSON.stringify(data, null, 2);
    }
  }

  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  close(fileId: string): void {
    const db = this.databases.get(fileId);
    if (db) {
      db.close();
      this.databases.delete(fileId);
    }
  }
}
