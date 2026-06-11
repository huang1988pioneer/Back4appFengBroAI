import type { ModuleConfig, RecordItem } from './types';
import { createBlankRecord, normalizeRecord } from './record';

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

export function recordsFromCsv(module: ModuleConfig, text: string): RecordItem[] {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''));
  const headers = rows[0]?.map((item) => item.trim()) || [];
  const knownKeys = new Set(module.fields.map((field) => field.key));

  return rows.slice(1).map((row) => {
    const item = createBlankRecord(module);
    headers.forEach((header, index) => {
      if (knownKeys.has(header)) item[header] = row[index] ?? '';
    });
    return normalizeRecord(module, item);
  });
}

export function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function recordsToCsv(module: ModuleConfig, records: RecordItem[]) {
  const headers = module.fields.map((field) => field.key);
  const body = records.map((item) => headers.map((header) => escapeCsv(item[header])).join(','));
  return `\uFEFF${headers.join(',')}\n${body.join('\n')}`;
}

export function csvFilename(module: ModuleConfig, date = new Date()) {
  return `${module.csvName}-${date.toISOString().slice(0, 10).replaceAll('-', '')}.csv`;
}
