import { DataAdapter } from './base';
import { DatabaseFile, Table, Column } from '@/types';
import * as XLSX from 'xlsx';

export class ExcelAdapter implements DataAdapter {
  format = 'excel';
  name = 'Excel';
  supportsSQL = false;
  supportsSchema = false;

  private workbooks: Map<string, XLSX.WorkBook> = new Map();

  async loadFile(file: File): Promise<DatabaseFile> {
    const fileId = `excel-${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    this.workbooks.set(fileId, workbook);

    const tables: Table[] = [];

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length === 0) return;

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      const columns: Column[] = headers.map((header, index) => ({
        name: header || `column_${index}`,
        type: this.inferType(rows, index),
        nullable: true,
      }));

      tables.push({
        name: sheetName,
        rowCount: rows.length,
        columns,
      });
    });

    return {
      id: fileId,
      name: file.name,
      format: 'excel',
      size: file.size,
      tables,
      createdAt: new Date(),
      supportsSQL: false,
    };
  }

  private inferType(rows: any[][], columnIndex: number): string {
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

  async getTableData(fileId: string, tableName: string, offset: number, limit: number): Promise<any[][]> {
    const workbook = this.workbooks.get(fileId);
    if (!workbook) throw new Error('File not found');

    const worksheet = workbook.Sheets[tableName];
    if (!worksheet) throw new Error('Sheet not found');

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const rows = jsonData.slice(1).slice(offset, offset + limit);

    return rows;
  }

  async getTableCount(fileId: string, tableName: string): Promise<number> {
    const workbook = this.workbooks.get(fileId);
    if (!workbook) throw new Error('File not found');

    const worksheet = workbook.Sheets[tableName];
    if (!worksheet) throw new Error('Sheet not found');

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    return jsonData.length - 1; // Subtract header row
  }

  async exportTable(fileId: string, tableName: string, format: 'csv' | 'json'): Promise<string> {
    const workbook = this.workbooks.get(fileId);
    if (!workbook) throw new Error('File not found');

    const worksheet = workbook.Sheets[tableName];
    if (!worksheet) throw new Error('Sheet not found');

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1);

    if (format === 'csv') {
      const header = headers.join(',');
      const data = rows.map(row => row.map(cell => this.escapeCSV(cell)).join(','));
      return [header, ...data].join('\n');
    } else {
      const jsonRows = rows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      return JSON.stringify(jsonRows, null, 2);
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
    this.workbooks.delete(fileId);
  }
}
