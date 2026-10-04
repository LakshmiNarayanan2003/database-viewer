import { DataAdapter } from './base';
import { DatabaseFile, Table, Column } from '@/types';
import Papa from 'papaparse';

export class CSVAdapter implements DataAdapter {
  format = 'csv';
  name = 'CSV';
  supportsSQL = false;
  supportsSchema = false;

  protected fileData: Map<string, { headers: string[]; rows: any[][] }> = new Map();

  async loadFile(file: File): Promise<DatabaseFile> {
    return new Promise((resolve, reject) => {
      const fileId = `csv-${Date.now()}-${file.name}`;

      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as any[][];

          this.fileData.set(fileId, { headers, rows });

          const columns: Column[] = headers.map((header, index) => ({
            name: header || `column_${index}`,
            type: this.inferType(rows, index),
            nullable: true,
          }));

          const table: Table = {
            name: file.name.replace(/\.[^/.]+$/, ''),
            rowCount: rows.length,
            columns,
          };

          resolve({
            id: fileId,
            name: file.name,
            format: 'csv',
            size: file.size,
            tables: [table],
            createdAt: new Date(),
          });
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        },
      });
    });
  }

  protected inferType(rows: any[][], columnIndex: number): string {
    const sample = rows.slice(0, 100).map(row => row[columnIndex]).filter(v => v !== null && v !== undefined);

    if (sample.length === 0) return 'TEXT';

    const allNumbers = sample.every(v => typeof v === 'number' && !isNaN(v));
    if (allNumbers) return 'REAL';

    const allIntegers = sample.every(v => Number.isInteger(v));
    if (allIntegers) return 'INTEGER';

    const allBooleans = sample.every(v => typeof v === 'boolean');
    if (allBooleans) return 'BOOLEAN';

    return 'TEXT';
  }

  async getTableData(fileId: string, _tableName: string, offset: number, limit: number): Promise<any[][]> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');

    return data.rows.slice(offset, offset + limit);
  }

  async getTableCount(fileId: string, _tableName: string): Promise<number> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');
    return data.rows.length;
  }

  async exportTable(fileId: string, _tableName: string, format: 'csv' | 'json'): Promise<string> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');

    if (format === 'csv') {
      const header = data.headers.join(',');
      const rows = data.rows.map(row => row.map(cell => this.escapeCSV(cell)).join(','));
      return [header, ...rows].join('\n');
    } else {
      const jsonData = data.rows.map(row => {
        const obj: Record<string, any> = {};
        data.headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      return JSON.stringify(jsonData, null, 2);
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
    this.fileData.delete(fileId);
  }
}

export class TSVAdapter extends CSVAdapter {
  format = 'tsv';
  name = 'TSV';

  async loadFile(file: File): Promise<DatabaseFile> {
    return new Promise((resolve, reject) => {
      const fileId = `tsv-${Date.now()}-${file.name}`;

      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: '\t',
        complete: (results) => {
          if (results.data.length === 0) {
            reject(new Error('TSV file is empty'));
            return;
          }

          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as any[][];

          this.fileData.set(fileId, { headers, rows });

          const columns: Column[] = headers.map((header, index) => ({
            name: header || `column_${index}`,
            type: this.inferType(rows, index),
            nullable: true,
          }));

          const table: Table = {
            name: file.name.replace(/\.[^/.]+$/, ''),
            rowCount: rows.length,
            columns,
          };

          resolve({
            id: fileId,
            name: file.name,
            format: 'tsv',
            size: file.size,
            tables: [table],
            createdAt: new Date(),
          });
        },
        error: (error) => {
          reject(new Error(`Failed to parse TSV: ${error.message}`));
        },
      });
    });
  }
}
