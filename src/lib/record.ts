import type { ModuleConfig, RecordItem } from './types';

export function createId() {
  return `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlankRecord(module: ModuleConfig): RecordItem {
  const next: RecordItem = { id: createId() };
  for (const field of module.fields) {
    if (field.type === 'number') next[field.key] = 0;
    else if (field.type === 'checkbox') next[field.key] = false;
    else next[field.key] = '';
  }
  if (module.id === 'subscription') {
    next.currency = 'TWD';
    next.continue = true;
  }
  return next;
}

export function normalizeDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function normalizeRecord(module: ModuleConfig, item: RecordItem): RecordItem {
  const next: RecordItem = { id: item.id || createId() };
  for (const field of module.fields) {
    const value = item[field.key];
    if (field.type === 'number') next[field.key] = Number(value) || 0;
    else if (field.type === 'checkbox') next[field.key] = value === true || value === 'true';
    else if (field.type === 'date') next[field.key] = normalizeDate(String(value ?? ''));
    else next[field.key] = String(value ?? '');
  }
  return next;
}

export function normalizeSeed(module: ModuleConfig): RecordItem[] {
  return (module.seed || []).map((item) => normalizeRecord(module, { id: createId(), ...item }));
}

export function primaryField(module: ModuleConfig) {
  return module.fields.find((field) => ['name', 'title'].includes(field.key)) || module.fields[0];
}

export function primaryValue(module: ModuleConfig, item: RecordItem) {
  return String(item[primaryField(module).key] ?? '');
}

export function recordSummary(module: ModuleConfig, item: RecordItem) {
  return module.fields
    .filter((field) => !['name', 'title', 'content', 'note'].includes(field.key))
    .slice(0, 4)
    .map((field) => {
      const value = item[field.key];
      return value === '' || value === undefined ? '' : `${field.label}: ${value}`;
    })
    .filter(Boolean)
    .join(' / ');
}

export function daysFromNow(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function statusText(item: RecordItem) {
  const dateValue = item.nextdate || item.todate || item.lastdate1 || item.newDate || item.createdAt || item.publishedAt;
  const days = daysFromNow(dateValue);
  if (days === null) return '';
  if (days < 0) return `已過 ${Math.abs(days)} 天`;
  if (days === 0) return '今天';
  return `${days} 天後`;
}

export function sortRecords(module: ModuleConfig, records: RecordItem[]) {
  const dateRules: Record<string, { key: string; order: 'asc' | 'desc' }> = {
    subscription: { key: 'nextdate', order: 'asc' },
    food: { key: 'todate', order: 'asc' },
    routine: { key: 'lastdate1', order: 'desc' },
    article: { key: 'newDate', order: 'desc' },
    about: { key: 'updatedAt', order: 'desc' }
  };

  const rule = dateRules[module.id];
  if (!rule) return records;

  return [...records].sort((a, b) => {
    const dateA = new Date(String(a[rule.key] ?? '')).getTime();
    const dateB = new Date(String(b[rule.key] ?? '')).getTime();
    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 1;
    if (Number.isNaN(dateB)) return -1;
    return rule.order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
