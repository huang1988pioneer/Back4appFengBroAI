<script lang="ts">
  import { onMount } from 'svelte';

  type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'checkbox';

  type Field = {
    key: string;
    label: string;
    type?: FieldType;
    placeholder?: string;
  };

  type RecordItem = {
    id: string;
    [key: string]: string | number | boolean;
  };

  type ModuleConfig = {
    id: string;
    title: string;
    short: string;
    icon: string;
    description: string;
    csvName: string;
    fields: Field[];
    seed?: Omit<RecordItem, 'id'>[];
  };

  type Back4appConfig = {
    endpoint: string;
    appId: string;
    masterKey: string;
  };

  const BACK4APP_CONFIG_KEY = 'fengbro.back4app.config';
  const defaultBack4appConfig: Back4appConfig = {
    endpoint: 'https://parseapi.back4app.com',
    appId: '',
    masterKey: ''
  };

  const modules: ModuleConfig[] = [
    {
      id: 'subscription',
      title: '鋒兄訂閱',
      short: '訂閱',
      icon: '訂',
      description: '續訂、扣款日、帳號與幣別管理。CSV 欄位相容 appwrite-subscription。',
      csvName: 'appwrite-subscription',
      fields: [
        { key: 'name', label: '名稱' },
        { key: 'site', label: '網站', type: 'url' },
        { key: 'price', label: '價格', type: 'number' },
        { key: 'nextdate', label: '下次日期', type: 'date' },
        { key: 'note', label: '備註', type: 'textarea' },
        { key: 'account', label: '帳號' },
        { key: 'currency', label: '幣別', placeholder: 'TWD' },
        { key: 'continue', label: '續訂', type: 'checkbox' }
      ],
      seed: [
        {
          name: 'ChatGPT/PLUS',
          site: 'https://chatgpt.com/#pricing',
          price: 690,
          nextdate: '2026-07-04',
          note: 'outlook\n街口\n中信\nApple Pay',
          account: 'gaokaolevel3iptopscorer',
          currency: 'TWD',
          continue: true
        },
        {
          name: 'Proton Drive Plus 200 GB',
          site: 'https://drive.proton.me',
          price: 5,
          nextdate: '2026-06-15',
          note: '',
          account: 'huang1988pioneer',
          currency: 'USD',
          continue: false
        }
      ]
    },
    {
      id: 'food',
      title: '鋒兄食品（＋商品庫存）',
      short: '食品',
      icon: '食',
      description: '保存期限、數量、價格、店家與照片 URL，支援快速增減庫存。',
      csvName: 'appwrite-food',
      fields: [
        { key: 'name', label: '名稱' },
        { key: 'amount', label: '數量', type: 'number' },
        { key: 'todate', label: '到期日', type: 'date' },
        { key: 'photo', label: '照片', type: 'url' },
        { key: 'price', label: '價格', type: 'number' },
        { key: 'shop', label: '店家' },
        { key: 'photohash', label: '照片 Hash' }
      ],
      seed: [
        {
          name: '【泰山】八寶粥',
          amount: 5,
          todate: '2027-04-14',
          photo: 'https://shoplineimg.com/64587ad406d620007ce10917/6463162e0fa8d10001cc0eb5/800x.jpg?',
          price: 0,
          shop: '',
          photohash: ''
        },
        {
          name: '小北百貨30元購物金',
          amount: 1,
          todate: '2026-06-11',
          photo: '',
          price: 0,
          shop: '',
          photohash: ''
        }
      ]
    },
    {
      id: 'article',
      title: '鋒兄筆記',
      short: '筆記',
      icon: '筆',
      description: '文章、想法、連結與附件欄位，對應 appwrite-article。',
      csvName: 'appwrite-article',
      fields: [
        { key: 'title', label: '標題' },
        { key: 'content', label: '內容', type: 'textarea' },
        { key: 'category', label: '分類' },
        { key: 'newDate', label: '日期', type: 'date' },
        { key: 'url1', label: '連結 1', type: 'url' },
        { key: 'url2', label: '連結 2', type: 'url' },
        { key: 'url3', label: '連結 3', type: 'url' },
        { key: 'file1', label: '檔案 1' },
        { key: 'file1name', label: '檔名 1' },
        { key: 'file1type', label: '類型 1' },
        { key: 'file2', label: '檔案 2' },
        { key: 'file2name', label: '檔名 2' },
        { key: 'file2type', label: '類型 2' },
        { key: 'file3', label: '檔案 3' },
        { key: 'file3name', label: '檔名 3' },
        { key: 'file3type', label: '類型 3' }
      ],
      seed: [
        {
          title: '歷史價格紀錄',
          content: 'KIOXIA 鎧俠 Exceria Plus G3 SSD 1TB 曾經來到 2090 元',
          category: '',
          newDate: '2026-06-04',
          url1: 'https://24h.pchome.com.tw/prod/DRAHGT-A900GOJVX'
        }
      ]
    },
    {
      id: 'commonaccount',
      title: '鋒兄常用',
      short: '常用',
      icon: '常',
      description: '常用帳號與多組站台備註，保留 37 組 site/note 欄位。',
      csvName: 'appwrite-commonaccount',
      fields: [
        { key: 'name', label: '帳號名稱' },
        ...Array.from({ length: 37 }, (_, index) => [
          { key: `site${String(index + 1).padStart(2, '0')}`, label: `站台 ${index + 1}` },
          { key: `note${String(index + 1).padStart(2, '0')}`, label: `備註 ${index + 1}` }
        ]).flat()
      ],
      seed: [
        {
          name: 'goldshoot0720@gmail.com',
          site01: 'Appwrite',
          note01: '',
          site02: 'Cloudflare',
          note02: '',
          site03: 'Vercel',
          note03: ''
        }
      ]
    },
    {
      id: 'bank',
      title: '鋒兄銀行（+電子票證）',
      short: '銀行',
      icon: '銀',
      description: '銀行、電子票證、餘額、金融卡與帳號資訊。',
      csvName: 'appwrite-bank',
      fields: [
        { key: 'name', label: '名稱' },
        { key: 'deposit', label: '餘額', type: 'number' },
        { key: 'site', label: '網站', type: 'url' },
        { key: 'address', label: '地址' },
        { key: 'withdrawals', label: '提款次數', type: 'number' },
        { key: 'transfer', label: '轉帳次數', type: 'number' },
        { key: 'activity', label: '活動', type: 'url' },
        { key: 'card', label: '卡片' },
        { key: 'account', label: '帳號' }
      ],
      seed: [
        {
          name: '台新銀行',
          deposit: 500,
          site: 'https://www.taishinbank.com.tw',
          address: '',
          withdrawals: 5,
          transfer: 5,
          activity: 'https://richart.tw/TSDIB_RichartWeb/ntd-saving-currency',
          card: '台新Richart VISA金融卡 1902',
          account: '末五碼 57295'
        },
        {
          name: 'Supercard超級悠遊卡LOGO線條款',
          deposit: 242,
          site: 'https://www.easycard.com.tw/',
          address: '',
          withdrawals: 0,
          transfer: 0,
          activity: '',
          card: '',
          account: ''
        }
      ]
    },
    {
      id: 'routine',
      title: '鋒兄例行',
      short: '例行',
      icon: '例',
      description: '例行事項、最近日期、連結與照片。',
      csvName: 'appwrite-routine',
      fields: [
        { key: 'name', label: '名稱' },
        { key: 'note', label: '備註', type: 'textarea' },
        { key: 'lastdate1', label: '日期 1', type: 'date' },
        { key: 'lastdate2', label: '日期 2', type: 'date' },
        { key: 'lastdate3', label: '日期 3', type: 'date' },
        { key: 'link', label: '連結', type: 'url' },
        { key: 'photo', label: '照片', type: 'url' }
      ],
      seed: [
        {
          name: '鋒兄牙刷',
          note: '預定每90天更換\n刷樂濃密炭深潔牙刷',
          lastdate1: '2026-05-19',
          lastdate2: '',
          lastdate3: '',
          link: '',
          photo: ''
        }
      ]
    },
    {
      id: 'tools',
      title: '鋒兄工具',
      short: '工具',
      icon: '工',
      description: '工具集合：鋒兄比價、手機比價、鋒兄Tube、鋒兄金融。',
      csvName: 'appwrite-tools',
      fields: [
        { key: 'name', label: '工具名稱' },
        { key: 'type', label: '類型' },
        { key: 'url', label: 'URL', type: 'url' },
        { key: 'query', label: '查詢字串' },
        { key: 'note', label: '備註', type: 'textarea' }
      ],
      seed: [
        { name: '鋒兄比價', type: 'price', url: 'https://24h.pchome.com.tw/', query: 'KIOXIA SSD', note: '' },
        { name: '手機比價', type: 'phone', url: 'https://www.landtop.com.tw/', query: 'Samsung 26', note: '' },
        { name: '鋒兄Tube', type: 'tube', url: 'https://www.youtube.com/', query: 'henren778', note: '' },
        { name: '鋒兄金融', type: 'finance', url: 'https://finance.yahoo.com/', query: 'TWD USD', note: '' }
      ]
    },
    {
      id: 'settings',
      title: '鋒兄設定',
      short: '設定',
      icon: '設',
      description: 'Appwrite 與本機工作台設定。',
      csvName: 'appwrite-settings',
      fields: [
        { key: 'name', label: '設定名稱' },
        { key: 'value', label: '設定值', type: 'textarea' },
        { key: 'note', label: '備註', type: 'textarea' }
      ],
      seed: [
        { name: '儲存模式', value: 'localStorage', note: '先做離線 CRUD，之後可接 Appwrite。' }
      ]
    },
    {
      id: 'about',
      title: '鋒兄關於',
      short: '關於',
      icon: '關',
      description: '專案說明、版本紀錄與重要連結。',
      csvName: 'appwrite-about',
      fields: [
        { key: 'title', label: '標題' },
        { key: 'content', label: '內容', type: 'textarea' },
        { key: 'url', label: 'URL', type: 'url' },
        { key: 'updatedAt', label: '更新日', type: 'date' }
      ],
      seed: [
        {
          title: 'SvelteKit 版鋒兄工作台',
          content: '參考 fengbroaiappwrite，實作 CRUD 與 Appwrite CSV 匯入匯出。',
          url: 'https://github.com/goldshoot0720/fengbroaiappwrite',
          updatedAt: '2026-06-11'
        }
      ]
    }
  ];

  let activeModule = modules[0];
  let records: RecordItem[] = [];
  let form: RecordItem = createBlankRecord(activeModule);
  let editingId = '';
  let query = '';
  let importMessage = '';
  let toolTab = 'price';
  let dbConfig: Back4appConfig = { ...defaultBack4appConfig };
  let dbPanelOpen = false;
  let syncMessage = '';
  let loadingRecords = false;

  $: back4appReady = Boolean(dbConfig.endpoint && dbConfig.appId && dbConfig.masterKey);

  $: filteredRecords = records.filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return activeModule.fields.some((field) => String(item[field.key] ?? '').toLowerCase().includes(needle));
  });

  $: totalAmount = records.reduce((sum, item) => {
    const price = Number(item.price ?? item.deposit ?? 0);
    const amount = Number(item.amount ?? 1);
    return sum + (Number.isFinite(price) ? price : 0) * (Number.isFinite(amount) ? amount : 1);
  }, 0);

  onMount(() => {
    dbConfig = loadBack4appConfig();
    void selectModule(activeModule);
  });

  function storageKey(module: ModuleConfig) {
    return `fengbro.sveltekit.${module.id}`;
  }

  function createId() {
    return `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function createBlankRecord(module: ModuleConfig): RecordItem {
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

  function normalizeSeed(seed: ModuleConfig['seed'] = []): RecordItem[] {
    return seed.map((item) => ({ id: createId(), ...item }));
  }

  function loadBack4appConfig(): Back4appConfig {
    if (typeof localStorage === 'undefined') return { ...defaultBack4appConfig };
    try {
      return { ...defaultBack4appConfig, ...JSON.parse(localStorage.getItem(BACK4APP_CONFIG_KEY) || '{}') };
    } catch {
      return { ...defaultBack4appConfig };
    }
  }

  function saveBack4appConfig() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(BACK4APP_CONFIG_KEY, JSON.stringify(dbConfig));
    }
    syncMessage = back4appReady ? 'Back4app 設定已儲存，接下來會使用資料庫 CRUD。' : 'Back4app 設定未完整，暫時使用 localStorage。';
    void selectModule(activeModule);
  }

  async function testBack4appConnection() {
    if (!back4appReady) {
      syncMessage = '⚠️ 請先填入完整的 Back4app 設定（Endpoint、Application ID、Master Key）';
      return;
    }

    syncMessage = '正在測試連線...';
    try {
      // 嘗試讀取一個 Class（使用當前模組的 Class）
      const response = await fetch(`${back4appUrl(activeModule)}?limit=1`, {
        headers: back4appHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) {
        syncMessage = `❌ 連線失敗：${data.error || data.message || '未知錯誤'}`;
        return;
      }

      syncMessage = `✅ 連線成功！已連接到 Back4app，Class: ${getClassName(activeModule)}`;
    } catch (error) {
      syncMessage = `❌ 連線錯誤：${error instanceof Error ? error.message : '網路錯誤或設定不正確'}`;
    }
  }

  function getClassName(module: ModuleConfig) {
    const map: Record<string, string> = {
      subscription: 'FengbroSubscription',
      food: 'FengbroFood',
      article: 'FengbroArticle',
      commonaccount: 'FengbroCommonAccount',
      image: 'FengbroImage',
      video: 'FengbroVideo',
      music: 'FengbroMusic',
      document: 'FengbroDocument',
      podcast: 'FengbroPodcast',
      bank: 'FengbroBank',
      routine: 'FengbroRoutine',
      tools: 'FengbroTool',
      settings: 'FengbroSetting',
      about: 'FengbroAbout'
    };
    return map[module.id] || `Fengbro${module.id}`;
  }

  function back4appHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': dbConfig.appId,
      'X-Parse-Master-Key': dbConfig.masterKey
    };
  }

  function back4appUrl(module: ModuleConfig, id = '') {
    const endpoint = dbConfig.endpoint.replace(/\/$/, '');
    return `${endpoint}/classes/${getClassName(module)}${id ? `/${id}` : ''}`;
  }

  function fromBack4appObject(module: ModuleConfig, item: Record<string, unknown>): RecordItem {
    const next = createBlankRecord(module);
    next.id = String(item.objectId || item.id || createId());
    for (const field of module.fields) {
      if (field.key in item) next[field.key] = item[field.key] as string | number | boolean;
    }
    return normalizeRecord(module, next);
  }

  function toBack4appObject(module: ModuleConfig, item: RecordItem) {
    const payload: Record<string, string | number | boolean> = {};
    for (const field of module.fields) payload[field.key] = item[field.key];
    return payload;
  }

  async function loadBack4appRecords(module: ModuleConfig) {
    const response = await fetch(`${back4appUrl(module)}?limit=1000&order=-updatedAt`, {
      headers: back4appHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Back4app 讀取失敗');
    return Array.isArray(data.results)
      ? data.results.map((item: Record<string, unknown>) => fromBack4appObject(module, item))
      : [];
  }

  async function createBack4appRecord(module: ModuleConfig, item: RecordItem) {
    const response = await fetch(back4appUrl(module), {
      method: 'POST',
      headers: back4appHeaders(),
      body: JSON.stringify(toBack4appObject(module, item))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Back4app 新增失敗');
    return String(data.objectId);
  }

  async function updateBack4appRecord(module: ModuleConfig, id: string, item: RecordItem) {
    const response = await fetch(back4appUrl(module, id), {
      method: 'PUT',
      headers: back4appHeaders(),
      body: JSON.stringify(toBack4appObject(module, item))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Back4app 更新失敗');
  }

  async function deleteBack4appRecord(module: ModuleConfig, id: string) {
    const response = await fetch(back4appUrl(module, id), {
      method: 'DELETE',
      headers: back4appHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Back4app 刪除失敗');
  }

  function loadLocalRecords(module: ModuleConfig) {
    if (typeof localStorage === 'undefined') return normalizeSeed(module.seed);
    const saved = localStorage.getItem(storageKey(module));
    if (!saved) {
      const seeded = normalizeSeed(module.seed);
      localStorage.setItem(storageKey(module), JSON.stringify(seeded));
      return seeded;
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persist(nextRecords = records) {
    records = [...nextRecords];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey(activeModule), JSON.stringify(records));
    }
  }

  async function selectModule(module: ModuleConfig) {
    activeModule = module;
    loadingRecords = true;
    syncMessage = '';
    if (back4appReady) {
      try {
        records = await loadBack4appRecords(module);
        syncMessage = `Back4app 已連線：${getClassName(module)} / ${records.length} 筆`;
      } catch (error) {
        records = loadLocalRecords(module);
        syncMessage = `${error instanceof Error ? error.message : 'Back4app 讀取失敗'}，已切換 localStorage 備援。`;
      }
    } else {
      records = loadLocalRecords(module);
    }
    loadingRecords = false;
    form = createBlankRecord(module);
    editingId = '';
    query = '';
    importMessage = '';
  }

  async function submitRecord() {
    const cleaned = normalizeRecord(activeModule, form);
    try {
      if (back4appReady) {
        if (editingId) await updateBack4appRecord(activeModule, editingId, cleaned);
        else await createBack4appRecord(activeModule, cleaned);
        await selectModule(activeModule);
      } else if (editingId) {
        persist(records.map((item) => (item.id === editingId ? { ...cleaned, id: editingId } : item)));
      } else {
        persist([{ ...cleaned, id: createId() }, ...records]);
      }
      cancelEdit();
    } catch (error) {
      syncMessage = error instanceof Error ? error.message : '儲存失敗';
    }
  }

  function editRecord(item: RecordItem) {
    form = { ...createBlankRecord(activeModule), ...item };
    editingId = item.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function duplicateRecord(item: RecordItem) {
    const copy: RecordItem = { ...item, id: createId() };
    const primary = getPrimaryValue(copy);
    if (primary) copy[getPrimaryField().key] = `${primary} (複製)`;
    if (back4appReady) {
      try {
        await createBack4appRecord(activeModule, copy);
        await selectModule(activeModule);
      } catch (error) {
        syncMessage = error instanceof Error ? error.message : '複製失敗';
      }
    } else {
      persist([copy, ...records]);
    }
  }

  async function deleteRecord(id: string) {
    const target = records.find((item) => item.id === id);
    const name = target ? getPrimaryValue(target) || '這筆資料' : '這筆資料';
    if (!confirm(`刪除「${name}」？`)) return;
    if (back4appReady) {
      try {
        await deleteBack4appRecord(activeModule, id);
        await selectModule(activeModule);
      } catch (error) {
        syncMessage = error instanceof Error ? error.message : '刪除失敗';
      }
    } else {
      persist(records.filter((item) => item.id !== id));
    }
  }

  function cancelEdit() {
    form = createBlankRecord(activeModule);
    editingId = '';
  }

  function normalizeRecord(module: ModuleConfig, item: RecordItem): RecordItem {
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

  function normalizeDate(value: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  function getPrimaryField() {
    return activeModule.fields.find((field) => ['name', 'title'].includes(field.key)) || activeModule.fields[0];
  }

  function getPrimaryValue(item: RecordItem) {
    return String(item[getPrimaryField().key] ?? '');
  }

  function setField(key: string, value: string | number | boolean) {
    form = { ...form, [key]: value };
  }

  async function adjustAmount(item: RecordItem, delta: number) {
    const updated = { ...item, amount: Math.max(0, Number(item.amount || 0) + delta) };
    if (back4appReady) {
      try {
        await updateBack4appRecord(activeModule, item.id, updated);
        await selectModule(activeModule);
      } catch (error) {
        syncMessage = error instanceof Error ? error.message : '庫存更新失敗';
      }
      return;
    }
    const next = records.map((record) => {
      if (record.id !== item.id) return record;
      return updated;
    });
    persist(next);
  }

  function parseCsv(text: string): string[][] {
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

  function escapeCsv(value: unknown) {
    const text = String(value ?? '');
    if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
    return text;
  }

  function exportCsv() {
    const headers = activeModule.fields.map((field) => field.key);
    const body = records.map((item) => headers.map((header) => escapeCsv(item[header])).join(','));
    const csv = `\uFEFF${headers.join(',')}\n${body.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeModule.csvName}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importCsv(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text.replace(/^\uFEFF/, ''));
    const headers = rows[0]?.map((item) => item.trim()) || [];
    const knownKeys = new Set(activeModule.fields.map((field) => field.key));
    const imported = rows.slice(1).map((row) => {
      const item = createBlankRecord(activeModule);
      headers.forEach((header, index) => {
        if (knownKeys.has(header)) item[header] = row[index] ?? '';
      });
      return normalizeRecord(activeModule, item);
    });

    if (back4appReady) {
      let success = 0;
      for (const item of imported) {
        try {
          await createBack4appRecord(activeModule, item);
          success += 1;
        } catch (error) {
          syncMessage = error instanceof Error ? error.message : 'Back4app 匯入部分失敗';
        }
      }
      await selectModule(activeModule);
      importMessage = `已匯入 Back4app ${success}/${imported.length} 筆：${file.name}`;
    } else {
      persist([...imported, ...records]);
      importMessage = `已匯入 localStorage ${imported.length} 筆：${file.name}`;
    }
    input.value = '';
  }

  async function clearModule() {
    if (!confirm(`清空「${activeModule.title}」全部資料？`)) return;
    if (back4appReady) {
      for (const item of records) {
        try {
          await deleteBack4appRecord(activeModule, item.id);
        } catch (error) {
          syncMessage = error instanceof Error ? error.message : 'Back4app 清空部分失敗';
        }
      }
      await selectModule(activeModule);
      return;
    }
    persist([]);
  }

  async function resetSeed() {
    if (!confirm(`重置「${activeModule.title}」為範例資料？`)) return;
    if (back4appReady) {
      for (const item of normalizeSeed(activeModule.seed)) {
        await createBack4appRecord(activeModule, item);
      }
      await selectModule(activeModule);
      return;
    }
    persist(normalizeSeed(activeModule.seed));
  }

  function daysFromNow(value: unknown) {
    if (!value) return null;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }

  function statusText(item: RecordItem) {
    const dateValue = item.nextdate || item.todate || item.lastdate1 || item.newDate || item.createdAt || item.publishedAt;
    const days = daysFromNow(dateValue);
    if (days === null) return '';
    if (days < 0) return `已過 ${Math.abs(days)} 天`;
    if (days === 0) return '今天';
    return `${days} 天後`;
  }

  function recordSummary(item: RecordItem) {
    const candidates = activeModule.fields
      .filter((field) => !['name', 'title', 'content', 'note'].includes(field.key))
      .slice(0, 4)
      .map((field) => {
        const value = item[field.key];
        return value === '' || value === undefined ? '' : `${field.label}: ${value}`;
      })
      .filter(Boolean);
    return candidates.join(' / ');
  }
</script>

<svelte:head>
  <meta
    name="description"
    content="鋒兄 AI Appwrite SvelteKit CRUD workspace with CSV import and export."
  />
</svelte:head>

<main class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">鋒</div>
      <div>
        <h1>鋒兄工作台</h1>
        <p>SvelteKit CRUD</p>
      </div>
    </div>

    <nav aria-label="模組">
      {#each modules as module}
        <button
          class:active={module.id === activeModule.id}
          class="nav-item"
          type="button"
          on:click={() => selectModule(module)}
        >
          <span>{module.icon}</span>
          <strong>{module.short}</strong>
        </button>
      {/each}
    </nav>
  </aside>

  <section class="workspace">
    <header class="topbar">
      <div>
        <p class="crumb">參考 fengbroaiappwrite / Appwrite CSV</p>
        <h2>{activeModule.title}</h2>
        <p>{activeModule.description}</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button" on:click={() => (dbPanelOpen = !dbPanelOpen)}>
          {back4appReady ? 'Back4app 已啟用' : '設定 Back4app'}
        </button>
        <label class="file-button">
          匯入 CSV
          <input type="file" accept=".csv,text/csv" on:change={importCsv} />
        </label>
        <button class="secondary" type="button" on:click={exportCsv}>匯出 CSV</button>
      </div>
    </header>

    {#if dbPanelOpen}
      <section class="db-panel">
        <div class="section-title">
          <div>
            <h3>Back4app 資料庫</h3>
            <p>使用 Parse REST API。Class 會依模組自動使用，例如 {getClassName(activeModule)}。</p>
          </div>
          <span class:ready={back4appReady}>{back4appReady ? '資料庫模式' : '本機備援模式'}</span>
        </div>
        <div class="db-grid">
          <label>
            <span>Parse Endpoint</span>
            <input bind:value={dbConfig.endpoint} placeholder="https://parseapi.back4app.com" />
          </label>
          <label>
            <span>Application ID</span>
            <input bind:value={dbConfig.appId} placeholder="Back4app Application ID" />
          </label>
          <label>
            <span>Master Key</span>
            <input bind:value={dbConfig.masterKey} type="password" placeholder="Back4app Master Key" />
          </label>
        </div>
        <div class="form-actions">
          <button class="primary" type="button" on:click={saveBack4appConfig}>儲存並重新連線</button>
          <button class="secondary" type="button" on:click={testBack4appConnection}>測試連線</button>
          <button
            class="ghost"
            type="button"
            on:click={() => {
              dbConfig = { ...defaultBack4appConfig };
              saveBack4appConfig();
            }}
          >
            改用 localStorage
          </button>
        </div>
      </section>
    {/if}

    <section class="stats-row" aria-label="統計">
      <div>
        <span>資料筆數</span>
        <strong>{records.length}</strong>
      </div>
      <div>
        <span>欄位數</span>
        <strong>{activeModule.fields.length}</strong>
      </div>
      <div>
        <span>金額合計</span>
        <strong>{Math.round(totalAmount).toLocaleString('zh-TW')}</strong>
      </div>
      <div>
        <span>資料來源</span>
        <strong>{back4appReady ? 'Back4app' : 'localStorage'}</strong>
      </div>
      <div>
        <span>CSV 名稱</span>
        <strong>{activeModule.csvName}</strong>
      </div>
    </section>

    {#if syncMessage}
      <p class="notice">{syncMessage}</p>
    {/if}

    {#if loadingRecords}
      <p class="notice">讀取資料中...</p>
    {/if}

    {#if activeModule.id === 'tools'}
      <section class="tool-tabs" aria-label="工具子項目">
        {#each [
          ['price', '鋒兄比價'],
          ['phone', '手機比價'],
          ['tube', '鋒兄Tube'],
          ['finance', '鋒兄金融']
        ] as tab}
          <button class:active={toolTab === tab[0]} type="button" on:click={() => (toolTab = tab[0])}>
            {tab[1]}
          </button>
        {/each}
      </section>
      <section class="tool-panel">
        {#if toolTab === 'price'}
          <h3>鋒兄比價</h3>
          <p>貼上商品網址或關鍵字，先存成工具紀錄；之後可接 BigGo、PChome 或 Appwrite Functions。</p>
        {:else if toolTab === 'phone'}
          <h3>手機比價</h3>
          <p>預設支援 Landtop / 手機型號查詢紀錄，可管理 Apple、Samsung 與通路價格線索。</p>
        {:else if toolTab === 'tube'}
          <h3>鋒兄Tube</h3>
          <p>保存頻道 URL、查詢字串與備註，方便之後接 YouTube RSS 或 Appwrite 排程抓取。</p>
        {:else}
          <h3>鋒兄金融</h3>
          <p>保存股票、匯率、利率與加密貨幣查詢設定，後續可串 Yahoo Finance 或自建 API。</p>
        {/if}
      </section>
    {/if}

    <section class="editor">
      <div class="section-title">
        <div>
          <h3>{editingId ? '編輯資料' : '新增資料'}</h3>
          <p>{editingId ? '修改後按儲存更新目前資料。' : '填入欄位後新增到目前模組。'}</p>
        </div>
        {#if editingId}
          <button class="ghost" type="button" on:click={cancelEdit}>取消編輯</button>
        {/if}
      </div>

      <form class="form-grid" on:submit|preventDefault={submitRecord}>
        {#each activeModule.fields as field}
          <label class:wide={field.type === 'textarea'}>
            <span>{field.label}</span>
            {#if field.type === 'textarea'}
              <textarea
                rows="4"
                placeholder={field.placeholder || field.label}
                value={String(form[field.key] ?? '')}
                on:input={(event) => setField(field.key, (event.currentTarget as HTMLTextAreaElement).value)}
              ></textarea>
            {:else if field.type === 'checkbox'}
              <span class="switch-row">
                <input
                  type="checkbox"
                  checked={form[field.key] === true || form[field.key] === 'true'}
                  on:change={(event) => setField(field.key, (event.currentTarget as HTMLInputElement).checked)}
                />
                <em>{form[field.key] === true || form[field.key] === 'true' ? '是' : '否'}</em>
              </span>
            {:else}
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder || field.label}
                value={String(form[field.key] ?? '')}
                on:input={(event) => setField(field.key, (event.currentTarget as HTMLInputElement).value)}
              />
            {/if}
          </label>
        {/each}

        <div class="form-actions">
          <button class="primary" type="submit">{editingId ? '儲存修改' : '新增資料'}</button>
          <button class="secondary" type="button" on:click={cancelEdit}>清空表單</button>
        </div>
      </form>
    </section>

    <section class="list-head">
      <div class="search">
        <input bind:value={query} placeholder={`搜尋 ${activeModule.short}`} />
      </div>
      <div class="compact-actions">
        <button class="ghost" type="button" on:click={resetSeed}>載入範例</button>
        <button class="danger" type="button" on:click={clearModule}>清空</button>
      </div>
    </section>

    {#if importMessage}
      <p class="notice">{importMessage}</p>
    {/if}

    <section class="records" aria-label="資料列表">
      {#if filteredRecords.length === 0}
        <div class="empty">
          <strong>目前沒有資料</strong>
          <span>可以新增一筆，或匯入你現有的 Appwrite CSV。</span>
        </div>
      {:else}
        {#each filteredRecords as item}
          <article class="record-card">
            <div class="record-main">
              <div class="avatar">{activeModule.icon}</div>
              <div>
                <h3>{getPrimaryValue(item) || '未命名'}</h3>
                <p>{recordSummary(item)}</p>
                {#if item.note || item.content}
                  <pre>{item.note || item.content}</pre>
                {/if}
              </div>
            </div>

            <div class="record-side">
              {#if statusText(item)}
                <span class="status">{statusText(item)}</span>
              {/if}
              {#if activeModule.id === 'food'}
                <div class="stock">
                  <button type="button" on:click={() => adjustAmount(item, -1)}>-</button>
                  <strong>{item.amount}</strong>
                  <button type="button" on:click={() => adjustAmount(item, 1)}>+</button>
                </div>
              {/if}
              <div class="row-actions">
                <button type="button" on:click={() => editRecord(item)}>編輯</button>
                <button type="button" on:click={() => duplicateRecord(item)}>複製</button>
                <button type="button" on:click={() => deleteRecord(item.id)}>刪除</button>
              </div>
            </div>
          </article>
        {/each}
      {/if}
    </section>
  </section>
</main>

<style>
  .app-shell {
    display: grid;
    grid-template-columns: 17rem minmax(0, 1fr);
    min-height: 100vh;
  }

  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: auto;
    border-right: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.86);
    padding: 1.25rem;
    backdrop-filter: blur(16px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
  }

  .brand-mark,
  .avatar {
    display: grid;
    place-items: center;
    width: 2.7rem;
    height: 2.7rem;
    border-radius: 0.65rem;
    background: #0f766e;
    color: white;
    font-weight: 900;
  }

  .brand h1,
  .brand p,
  h2,
  h3,
  p {
    margin: 0;
  }

  .brand h1 {
    font-size: 1rem;
  }

  .brand p,
  .crumb,
  .topbar p,
  .section-title p,
  .record-card p,
  .empty span,
  .tool-panel p {
    color: var(--muted);
  }

  nav {
    display: grid;
    gap: 0.35rem;
  }

  .nav-item {
    display: grid;
    grid-template-columns: 2rem 1fr;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 0.65rem;
    background: transparent;
    padding: 0.55rem;
    text-align: left;
    color: #334155;
  }

  .nav-item span {
    display: grid;
    place-items: center;
    height: 2rem;
    border-radius: 0.5rem;
    background: #e2e8f0;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .nav-item.active {
    border-color: rgba(15, 118, 110, 0.22);
    background: rgba(15, 118, 110, 0.08);
    color: #0f766e;
  }

  .nav-item.active span {
    background: #0f766e;
    color: white;
  }

  .workspace {
    min-width: 0;
    padding: 1.5rem;
  }

  .topbar,
  .section-title,
  .list-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .topbar {
    margin-bottom: 1rem;
  }

  .topbar h2 {
    margin: 0.2rem 0 0.35rem;
    font-size: clamp(1.75rem, 3vw, 2.7rem);
    letter-spacing: 0;
  }

  .actions,
  .compact-actions,
  .form-actions,
  .row-actions,
  .tool-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  button,
  .file-button {
    border: 1px solid var(--line);
    border-radius: 0.55rem;
    background: white;
    color: var(--text);
    padding: 0.6rem 0.8rem;
    font-weight: 750;
    line-height: 1;
  }

  .primary,
  .file-button {
    border-color: #0f766e;
    background: #0f766e;
    color: white;
  }

  .secondary {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .ghost {
    background: transparent;
  }

  .danger {
    border-color: #fecaca;
    background: #fef2f2;
    color: var(--danger);
  }

  .file-button {
    position: relative;
    overflow: hidden;
  }

  .file-button input {
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stats-row div,
  .db-panel,
  .editor,
  .tool-panel,
  .record-card,
  .empty {
    border: 1px solid var(--line);
    border-radius: 0.8rem;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 44px rgba(15, 23, 42, 0.05);
  }

  .stats-row div {
    padding: 1rem;
  }

  .stats-row span {
    display: block;
    color: var(--muted);
    font-size: 0.82rem;
  }

  .stats-row strong {
    display: block;
    margin-top: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.25rem;
    white-space: nowrap;
  }

  .tool-tabs {
    margin: 0 0 0.75rem;
  }

  .tool-tabs button.active {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  .tool-panel {
    margin-bottom: 1rem;
    padding: 1rem;
  }

  .db-panel {
    margin-bottom: 1rem;
    padding: 1rem;
  }

  .db-panel .section-title span {
    align-self: flex-start;
    border-radius: 999px;
    background: #f1f5f9;
    color: #475569;
    padding: 0.4rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 800;
  }

  .db-panel .section-title span.ready {
    background: #ecfdf5;
    color: #047857;
  }

  .db-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 0.8rem;
    margin: 1rem 0;
  }

  .editor {
    padding: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 1rem;
  }

  label {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  label span {
    color: #475569;
    font-size: 0.82rem;
    font-weight: 750;
  }

  label.wide {
    grid-column: span 2;
  }

  input,
  textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #cbd5e1;
    border-radius: 0.55rem;
    background: white;
    padding: 0.7rem 0.75rem;
    color: var(--text);
    outline: none;
  }

  textarea {
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  }

  .switch-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.7rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.55rem;
    background: white;
    padding: 0 0.75rem;
  }

  .switch-row input {
    width: 1rem;
  }

  .switch-row em {
    font-style: normal;
  }

  .form-actions {
    grid-column: 1 / -1;
  }

  .list-head {
    margin: 1rem 0 0.75rem;
  }

  .search {
    width: min(32rem, 100%);
  }

  .notice {
    margin-bottom: 0.75rem;
    border: 1px solid #bbf7d0;
    border-radius: 0.65rem;
    background: #f0fdf4;
    color: #166534;
    padding: 0.75rem;
  }

  .records {
    display: grid;
    gap: 0.75rem;
  }

  .record-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    padding: 1rem;
  }

  .record-main {
    display: flex;
    gap: 0.85rem;
    min-width: 0;
  }

  .record-main h3 {
    overflow-wrap: anywhere;
    font-size: 1.05rem;
  }

  .record-main p {
    margin-top: 0.25rem;
    overflow-wrap: anywhere;
    font-size: 0.9rem;
  }

  pre {
    margin: 0.55rem 0 0;
    max-width: 64rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: #475569;
    font-family: inherit;
    font-size: 0.88rem;
  }

  .record-side {
    display: grid;
    align-content: start;
    justify-items: end;
    gap: 0.65rem;
  }

  .status {
    border-radius: 999px;
    background: #ecfdf5;
    color: #047857;
    padding: 0.3rem 0.55rem;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .stock {
    display: grid;
    grid-template-columns: 2rem 2.5rem 2rem;
    align-items: center;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 0.55rem;
    background: white;
  }

  .stock button {
    border: 0;
    border-radius: 0;
    padding: 0.55rem 0;
  }

  .stock strong {
    text-align: center;
  }

  .row-actions button {
    padding: 0.5rem 0.6rem;
    font-size: 0.82rem;
  }

  .row-actions button:last-child {
    color: var(--danger);
  }

  .empty {
    display: grid;
    gap: 0.3rem;
    place-items: center;
    min-height: 12rem;
    padding: 2rem;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .app-shell {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      height: auto;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }

    nav {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .nav-item {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }

    .form-grid,
    .db-grid,
    .stats-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .workspace,
    .sidebar {
      padding: 1rem;
    }

    nav,
    .form-grid,
    .db-grid,
    .stats-row {
      grid-template-columns: 1fr;
    }

    .topbar,
    .section-title,
    .list-head,
    .record-card {
      grid-template-columns: 1fr;
      flex-direction: column;
    }

    label.wide {
      grid-column: auto;
    }

    .record-side {
      justify-items: start;
    }
  }
</style>
