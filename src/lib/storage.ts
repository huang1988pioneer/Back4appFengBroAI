import type { Back4appConfig, ModuleConfig, RecordItem, RepositoryMode } from './types';
import { normalizeRecord, normalizeSeed } from './record';

export const BACK4APP_CONFIG_KEY = 'fengbro.back4app.config';

export const defaultBack4appConfig: Back4appConfig = {
  endpoint: import.meta.env.VITE_BACK4APP_ENDPOINT || 'https://parseapi.back4app.com',
  appId: import.meta.env.VITE_BACK4APP_APP_ID || '',
  masterKey: import.meta.env.VITE_BACK4APP_MASTER_KEY || ''
};

export function isBack4appReady(config: Back4appConfig) {
  return Boolean(config.endpoint && config.appId && config.masterKey);
}

export function loadBack4appConfig(): Back4appConfig {
  if (typeof localStorage === 'undefined') return { ...defaultBack4appConfig };
  try {
    return { ...defaultBack4appConfig, ...JSON.parse(localStorage.getItem(BACK4APP_CONFIG_KEY) || '{}') };
  } catch {
    return { ...defaultBack4appConfig };
  }
}

export function saveBack4appConfig(config: Back4appConfig) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(BACK4APP_CONFIG_KEY, JSON.stringify(config));
  }
}

export function storageKey(module: ModuleConfig) {
  return `fengbro.sveltekit.${module.id}`;
}

function back4appHeaders(config: Back4appConfig) {
  return {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': config.appId,
    'X-Parse-Master-Key': config.masterKey
  };
}

export function back4appUrl(config: Back4appConfig, module: ModuleConfig, id = '') {
  const endpoint = config.endpoint.replace(/\/$/, '');
  return `${endpoint}/classes/${module.className}${id ? `/${id}` : ''}`;
}

function toBack4appObject(module: ModuleConfig, item: RecordItem) {
  const payload: Record<string, string | number | boolean> = {};
  for (const field of module.fields) payload[field.key] = item[field.key];
  return payload;
}

function fromBack4appObject(module: ModuleConfig, item: Record<string, unknown>) {
  const next: RecordItem = { id: String(item.objectId || item.id || '') };
  for (const field of module.fields) {
    if (field.key in item) next[field.key] = item[field.key] as string | number | boolean;
  }
  return normalizeRecord(module, next);
}

export class FengbroRepository {
  constructor(
    private readonly module: ModuleConfig,
    private readonly config: Back4appConfig
  ) {}

  get mode(): RepositoryMode {
    return isBack4appReady(this.config) ? 'back4app' : 'localStorage';
  }

  async list() {
    if (this.mode === 'back4app') return this.listBack4app();
    return this.listLocal();
  }

  async create(item: RecordItem) {
    if (this.mode === 'back4app') {
      const response = await fetch(back4appUrl(this.config, this.module), {
        method: 'POST',
        headers: back4appHeaders(this.config),
        body: JSON.stringify(toBack4appObject(this.module, item))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Back4app 新增失敗');
      return String(data.objectId);
    }

    this.saveLocal([normalizeRecord(this.module, item), ...this.listLocal()]);
    return item.id;
  }

  async update(id: string, item: RecordItem) {
    if (this.mode === 'back4app') {
      const response = await fetch(back4appUrl(this.config, this.module, id), {
        method: 'PUT',
        headers: back4appHeaders(this.config),
        body: JSON.stringify(toBack4appObject(this.module, item))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Back4app 更新失敗');
      return;
    }

    this.saveLocal(this.listLocal().map((record) => (record.id === id ? normalizeRecord(this.module, { ...item, id }) : record)));
  }

  async delete(id: string) {
    if (this.mode === 'back4app') {
      const response = await fetch(back4appUrl(this.config, this.module, id), {
        method: 'DELETE',
        headers: back4appHeaders(this.config)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Back4app 刪除失敗');
      return;
    }

    this.saveLocal(this.listLocal().filter((record) => record.id !== id));
  }

  async replaceLocal(records: RecordItem[]) {
    this.saveLocal(records);
  }

  async testConnection() {
    const response = await fetch(`${back4appUrl(this.config, this.module)}?limit=1`, {
      headers: back4appHeaders(this.config)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Back4app 連線失敗');
  }

  private async listBack4app() {
    const response = await fetch(`${back4appUrl(this.config, this.module)}?limit=1000&order=-updatedAt`, {
      headers: back4appHeaders(this.config)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Back4app 讀取失敗');
    return Array.isArray(data.results)
      ? data.results.map((item: Record<string, unknown>) => fromBack4appObject(this.module, item))
      : [];
  }

  private listLocal() {
    if (typeof localStorage === 'undefined') return normalizeSeed(this.module);
    const saved = localStorage.getItem(storageKey(this.module));
    if (!saved) {
      const seeded = normalizeSeed(this.module);
      this.saveLocal(seeded);
      return seeded;
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveLocal(records: RecordItem[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey(this.module), JSON.stringify(records));
    }
  }
}
