import { DataAdapter } from './base';
import { DatabaseFile, Table, Column } from '@/types';
import { tableFromIPC, Table as ArrowTable } from 'apache-arrow';

export class ArrowAdapter implements DataAdapter {
  format = 'arrow';
  name = 'Apache Arrow';
  supportsSQL = false;
  supportsSchema = true;

  protected fileData: Map<string, { table: Table; arrowTable: ArrowTable }> = new Map();

  async loadFile(file: File): Promise<DatabaseFile> {
    const fileId = `arrow-${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const arrowTable = tableFromIPC(uint8Array);

    const columns: Column[] = [];
    for (const field of arrowTable.schema.fields) {
      columns.push({
        name: field.name,
        type: field.type.toString(),
        nullable: field.nullable,
      });
    }

    const tableName = file.name.replace(/\.[^/.]+$/, '');
    const rowCount = arrowTable.numRows;

    const table: Table = {
      name: tableName,
      rowCount,
      columns,
    };

    this.fileData.set(fileId, { table, arrowTable });

    return {
      id: fileId,
      name: file.name,
      format: 'arrow',
      size: file.size,
      tables: [table],
      createdAt: new Date(),
      supportsSQL: false,
    };
  }

  async getTableData(fileId: string, _tableName: string, offset: number, limit: number): Promise<any[][]> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');

    const rows: any[][] = [];
    const end = Math.min(offset + limit, data.arrowTable.numRows);

    for (let i = offset; i < end; i++) {
      const row: any[] = [];
      for (let j = 0; j < data.arrowTable.numCols; j++) {
        row.push(data.arrowTable.getChildAt(j)!.get(i));
      }
      rows.push(row);
    }

    return rows;
  }

  async getTableCount(fileId: string, _tableName: string): Promise<number> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');
    return data.arrowTable.numRows;
  }

  async exportTable(fileId: string, _tableName: string, format: 'csv' | 'json'): Promise<string> {
    const data = this.fileData.get(fileId);
    if (!data) throw new Error('File not found');

    const headers = data.table.columns.map(col => col.name);
    const rows: any[][] = [];

    for (let i = 0; i < data.arrowTable.numRows; i++) {
      const row: any[] = [];
      for (let j = 0; j < data.arrowTable.numCols; j++) {
        row.push(data.arrowTable.getChildAt(j)!.get(i));
      }
      rows.push(row);
    }

    if (format === 'csv') {
      const header = headers.join(',');
      const dataRows = rows.map(row => row.map(cell => this.escapeCSV(cell)).join(','));
      return [header, ...dataRows].join('\n');
    } else {
      const jsonData = rows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, i) => {
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

export class FeatherAdapter extends ArrowAdapter {
  format = 'feather';
  name = 'Feather';

  async loadFile(file: File): Promise<DatabaseFile> {
    const fileId = `feather-${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const arrowTable = tableFromIPC(uint8Array);

    const columns: Column[] = [];
    for (const field of arrowTable.schema.fields) {
      columns.push({
        name: field.name,
        type: field.type.toString(),
        nullable: field.nullable,
      });
    }

    const tableName = file.name.replace(/\.[^/.]+$/, '');
    const rowCount = arrowTable.numRows;

    const table: Table = {
      name: tableName,
      rowCount,
      columns,
    };

    this.fileData.set(fileId, { table, arrowTable });

    return {
      id: fileId,
      name: file.name,
      format: 'feather',
      size: file.size,
      tables: [table],
      createdAt: new Date(),
      supportsSQL: false,
    };
  }
}
