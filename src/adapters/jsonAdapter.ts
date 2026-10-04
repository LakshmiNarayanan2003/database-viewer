import { DataAdapter } from './base';
import { DatabaseFile, Table, Column } from '@/types';

export class JSONAdapter implements DataAdapter {
  format = 'json';
  name = 'JSON';
  supportsSQL = false;
  supportsSchema = false;

  protected fileData: Map<string, { headers: string[]; rows: any[][] }> = new Map();

  async loadFile(file: File): Promise<DatabaseFile> {
    const fileId = `json-${Date.now()}-${file.name}`;
    const text = await file.text();

    let data: any[];
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON file');
    }

    if (!Array.isArray(data)) {
      // If it's a single object, wrap it in an array
      data = [data];
    }

    if (data.length === 0) {
      throw new Error('JSON file is empty');
    }

    // Collect all possible keys from all objects
    const keySet = new Set<string>();
    data.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => keySet.add(key));
      }
    });

    const headers = Array.from(keySet);
    const rows = data.map(obj => headers.map(header => obj?.[header]));

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

    return {
      id: fileId,
      name: file.name,
      format: 'json',
      size: file.size,
      tables: [table],
      createdAt: new Date(),
    };
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

    const allObjects = sample.every(v => typeof v === 'object' && v !== null);
    if (allObjects) return 'JSON';

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
    const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  close(fileId: string): void {
    this.fileData.delete(fileId);
  }
}

export class JSONLAdapter extends JSONAdapter {
  format = 'jsonl';
  name = 'JSON Lines';

  async loadFile(file: File): Promise<DatabaseFile> {
    const fileId = `jsonl-${Date.now()}-${file.name}`;
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('JSONL file is empty');
    }

    const data: any[] = [];
    const keySet = new Set<string>();

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        data.push(obj);
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => keySet.add(key));
        }
      } catch (e) {
        console.warn('Failed to parse line:', line);
      }
    }

    if (data.length === 0) {
      throw new Error('No valid JSON objects found');
    }

    const headers = Array.from(keySet);
    const rows = data.map(obj => headers.map(header => obj?.[header]));

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

    return {
      id: fileId,
      name: file.name,
      format: 'jsonl',
      size: file.size,
      tables: [table],
      createdAt: new Date(),
    };
  }
}
