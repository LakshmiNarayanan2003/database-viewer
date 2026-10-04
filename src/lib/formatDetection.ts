import { FileFormat } from '@/types';

export function detectFileFormat(filename: string, fileSignature?: ArrayBuffer): FileFormat {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Check file signature if available
  if (fileSignature) {
    const view = new Uint8Array(fileSignature);
    const header = Array.from(view.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');

    // SQLite signature: "SQLite format 3\0"
    if (header.startsWith('53 51 4c 69 74 65 20 66 6f 72 6d 61 74 20 33')) {
      return 'sqlite';
    }

    // Excel signature (XLSX is a ZIP file)
    if (header.startsWith('50 4b 03 04') && ext === 'xlsx') {
      return 'excel';
    }

    // DuckDB signature
    if (header.startsWith('44 55 43 4b')) {
      return 'duckdb';
    }

    // Parquet signature
    if (header.startsWith('50 41 52 31')) {
      return 'parquet';
    }
  }

  // Fallback to extension-based detection
  const formatMap: Record<string, FileFormat> = {
    'db': 'sqlite',
    'sqlite': 'sqlite',
    'sqlite3': 'sqlite',
    'duckdb': 'duckdb',
    'csv': 'csv',
    'tsv': 'tsv',
    'xlsx': 'excel',
    'xls': 'excel',
    'json': 'json',
    'jsonl': 'jsonl',
    'ndjson': 'jsonl',
    'parquet': 'parquet',
    'arrow': 'arrow',
    'feather': 'feather',
    'ods': 'ods',
    'sql': 'sql',
    'mdb': 'access',
    'accdb': 'access',
  };

  return formatMap[ext] || 'unknown';
}

export function getFormatIcon(format: FileFormat): string {
  const iconMap: Record<FileFormat, string> = {
    'sqlite': '🗄️',
    'duckdb': '🦆',
    'csv': '📊',
    'tsv': '📊',
    'excel': '📈',
    'json': '📝',
    'jsonl': '📝',
    'parquet': '📦',
    'arrow': '➡️',
    'feather': '🪶',
    'ods': '📊',
    'sql': '💾',
    'access': '🔐',
    'unknown': '❓',
  };
  return iconMap[format] || '❓';
}
