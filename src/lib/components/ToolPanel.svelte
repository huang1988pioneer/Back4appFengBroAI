<script context="module" lang="ts">
  export type ToolTab = 'price' | 'phone' | 'tube' | 'finance';
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  type PricePoint = {
    id: string;
    title: string;
    url: string;
    source: string;
    price: number;
    currency: string;
    checkedAt: string;
    note: string;
  };

  type PhonePrice = {
    id: string;
    model: string;
    brand: 'Apple' | 'Samsung' | 'Other';
    storage: string;
    landtopPrice: number;
    jyesPrice: number;
    marketPrice: number;
    url: string;
    updatedAt: string;
  };

  type TubeChannel = {
    id: string;
    alias: string;
    url: string;
    rssUrl: string;
    lastVideoTitle: string;
    lastVideoUrl: string;
    downfallIndex: string;
    updatedAt: string;
  };

  type FinanceGroup = 'tw' | 'us' | 'asia' | 'korea' | 'fx' | 'commodities' | 'crypto' | 'rates' | 'valuation';

  type FinanceQuote = {
    id: string;
    name: string;
    symbol: string;
    group: FinanceGroup;
    price: number;
    changePercent: number;
    change?: number;
    high52: number;
    low52: number;
    provider: 'Yahoo' | 'CNBC' | 'Multpl';
    currency?: string;
    sourceUrl: string;
    updatedAt: string;
    recordNote?: string;
  };

  type VideoCard = {
    title: string;
    channel: string;
    date: string;
    thumbnail: string;
    url: string;
  };

  const STORAGE_KEY = 'fengbro.tools.workspace.v4';

  export let toolTab: ToolTab = 'price';
  export let onTabChange: (tab: ToolTab) => void;

  const tabs: Array<{ id: ToolTab; label: string }> = [
    { id: 'price', label: '鋒兄比價' },
    { id: 'phone', label: '手機比價' },
    { id: 'tube', label: '鋒兄Tube' },
    { id: 'finance', label: '鋒兄金融' }
  ];

  const groupLabels: Record<FinanceGroup | 'all', string> = {
    all: '全部',
    tw: '台股',
    us: '美股指數',
    asia: '亞洲指數',
    korea: '韓股',
    fx: '匯率',
    commodities: '商品',
    crypto: '加密貨幣',
    rates: '利率',
    valuation: '估值'
  };

  function makeTubeThumb(seed: number) {
    const palettes = [
      ['#140f0c', '#c31320', '#ffd35a'],
      ['#1a0f0a', '#b7791f', '#fff1b8'],
      ['#111827', '#2563eb', '#f97316'],
      ['#0f172a', '#7f1d1d', '#facc15'],
      ['#1f1208', '#dc2626', '#fde68a']
    ];
    const [bg, accent, ink] = palettes[seed % palettes.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="${110 + seed * 13}" cy="92" r="58" fill="${ink}" opacity=".18"/><rect x="34" y="42" width="572" height="276" rx="28" fill="none" stroke="${ink}" stroke-width="5" opacity=".55"/><path d="M282 132v96l86-48z" fill="${ink}"/><text x="54" y="286" fill="${ink}" font-family="Arial, sans-serif" font-size="42" font-weight="900">FENGBRO TUBE ${seed}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  const tubeVideos: VideoCard[] = [
    {
      title: '中共挺2萬億！六支類別中美AI決戰',
      channel: '吉利小辣妹',
      date: '06/14 上午10:55',
      thumbnail: makeTubeThumb(1),
      url: 'https://www.youtube.com/'
    },
    {
      title: '推背圖中的紫薇聖人 大蛙命？天共倒計時？',
      channel: '吉利小辣妹',
      date: '06/08 上午10:15',
      thumbnail: makeTubeThumb(2),
      url: 'https://www.youtube.com/'
    },
    {
      title: '周易預測：閉關鎖國加速，資產鎖死，富貴難逃',
      channel: '吉利小辣妹',
      date: '06/07 下午1:25',
      thumbnail: makeTubeThumb(3),
      url: 'https://www.youtube.com/'
    },
    {
      title: '習明澤二十大露臉？硬碰瓷？包子的政治豪賭',
      channel: '吉利小辣妹',
      date: '06/01 上午8:00',
      thumbnail: makeTubeThumb(4),
      url: 'https://www.youtube.com/'
    },
    {
      title: '天災or政治博弈，周易揭秘山西礦難真相',
      channel: '吉利小辣妹',
      date: '05/26 下午9:21',
      thumbnail: makeTubeThumb(5),
      url: 'https://www.youtube.com/'
    },
    {
      title: '習下禁令，台海戰爭面臨重大反轉',
      channel: '一個狠人',
      date: '05/24 下午9:31',
      thumbnail: makeTubeThumb(6),
      url: 'https://www.youtube.com/'
    },
    {
      title: '性禁到底！周易預測：中共最終美國被相',
      channel: '一個狠人',
      date: '05/24 下午2:16',
      thumbnail: makeTubeThumb(7),
      url: 'https://www.youtube.com/'
    },
    {
      title: '升卦斷中美注定一戰？誰會跑掉？',
      channel: '一個狠人',
      date: '05/17 下午10:42',
      thumbnail: makeTubeThumb(8),
      url: 'https://www.youtube.com/'
    },
    {
      title: '雙胞病毒奇跡如武漢病毒早就動手',
      channel: '一個狠人',
      date: '05/12 上午9:15',
      thumbnail: makeTubeThumb(9),
      url: 'https://www.youtube.com/'
    },
    {
      title: '母親節專場：媽媽八字中的健康密碼',
      channel: '一個狠人',
      date: '05/10 上午11:25',
      thumbnail: makeTubeThumb(10),
      url: 'https://www.youtube.com/'
    }
  ];

  const recentVideoTitles = [
    '中共挺2萬億！六支類別中美AI決戰｜普通人如何逆向上車',
    'A股「翻紅」金融劇：周刊被股戶問到崩潰，龍吟老師準備收工',
    '馬斯克親人財富靈擺：太牛了，和政客打一場硬仗一下',
    '【張內咸脫口秀】一個「脫北者」拼命想回平壤，為什麼中國反而最尷尬？',
    '一句「為你好」正在親手摧毀你的家庭？孩子越來越反叛',
    '不止汽車，光伏，連馬拉松和尚都圍剿中國競爭'
  ];

  const weeklyPoints = [32, 34, 36, 38, 40, 42, 44, 46];

  let priceForm: PricePoint = blankPrice();
  let phoneForm: PhonePrice = blankPhone();
  let tubeForm: TubeChannel = blankTube();
  let financeForm: FinanceQuote = blankFinance();
  let prices: PricePoint[] = [];
  let phones: PhonePrice[] = [];
  let channels: TubeChannel[] = [];
  let quotes: FinanceQuote[] = [];
  let priceQuery = 'https://24h.pchome.com.tw/prod/DRAHCO-A900J8363';
  let phoneQuery = 'Samsung 26';
  let financeGroup: FinanceGroup | 'all' = 'all';

  $: filteredPrices = prices.filter((item) =>
    [item.title, item.url, item.source, item.note].join(' ').toLowerCase().includes(priceQuery.toLowerCase())
  );
  $: visiblePrices = filteredPrices.length ? filteredPrices : prices.slice(0, 3);
  $: priceStats = summarizePrices(visiblePrices);
  $: mainPrice = priceStats.low || visiblePrices[0] || null;
  $: filteredPhones = phones.filter((item) =>
    [item.model, item.brand, item.storage].join(' ').toLowerCase().includes(phoneQuery.toLowerCase())
  );
  $: phoneChartItems = filteredPhones.length ? filteredPhones.slice(0, 3) : phones.slice(0, 3);
  $: filteredQuotes = quotes.filter((quote) => financeGroup === 'all' || quote.group === financeGroup);
  $: shillerQuote = quotes.find((quote) => quote.group === 'valuation') || null;
  $: groupedQuotes = groupFinanceQuotes(filteredQuotes);
  $: recentVideos = channels.flatMap((channel) =>
    recentVideoTitles.slice(0, 3).map((title, index) => ({ channel, title, index }))
  );

  onMount(() => {
    loadState();
  });

  function createId() {
    return `tool_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function blankPrice(): PricePoint {
    return {
      id: createId(),
      title: '',
      url: '',
      source: 'BigGo API',
      price: 0,
      currency: 'TWD',
      checkedAt: today(),
      note: ''
    };
  }

  function blankPhone(): PhonePrice {
    return {
      id: createId(),
      model: '',
      brand: 'Samsung',
      storage: '',
      landtopPrice: 0,
      jyesPrice: 0,
      marketPrice: 0,
      url: '',
      updatedAt: today()
    };
  }

  function blankTube(): TubeChannel {
    return {
      id: createId(),
      alias: '',
      url: '',
      rssUrl: '',
      lastVideoTitle: '',
      lastVideoUrl: '',
      downfallIndex: '',
      updatedAt: today()
    };
  }

  function blankFinance(): FinanceQuote {
    return {
      id: createId(),
      name: '',
      symbol: '',
      group: 'tw',
      price: 0,
      changePercent: 0,
      change: 0,
      high52: 0,
      low52: 0,
      provider: 'Yahoo',
      currency: '',
      sourceUrl: '',
      updatedAt: today()
    };
  }

  function seedState() {
    prices = [
      {
        id: createId(),
        title: 'Micron 美光 Crucial T500 2TB PCIe Gen4 NVMe SSD',
        url: 'https://24h.pchome.com.tw/prod/DRAHCO-A900J8363',
        source: 'BigGo API',
        price: 10735,
        currency: 'TWD',
        checkedAt: '2026-06-14',
        note: 'BigGo 目前查詢頻率繁忙，暫時回傳 429，已先顯示可取得的名標與目前價格。'
      },
      {
        id: createId(),
        title: 'PChome 商品 DYALS1-A900JUGXV',
        url: 'https://24h.pchome.com.tw/prod/DYALS1-A900JUGXV',
        source: '本地估值',
        price: 4990,
        currency: 'TWD',
        checkedAt: '2026-06-14',
        note: '保留本地測試流程，不連外查價。'
      }
    ];
    phones = [
      {
        id: createId(),
        model: 'Samsung A17',
        brand: 'Samsung',
        storage: '128GB',
        landtopPrice: 4990,
        jyesPrice: 0,
        marketPrice: 5790,
        url: 'https://www.landtop.com.tw/',
        updatedAt: today()
      },
      {
        id: createId(),
        model: 'Samsung A17 6G 128GB',
        brand: 'Samsung',
        storage: '128GB',
        landtopPrice: 4990,
        jyesPrice: 4990,
        marketPrice: 5790,
        url: 'https://www.landtop.com.tw/',
        updatedAt: today()
      },
      {
        id: createId(),
        model: 'Samsung A17 8G 128GB',
        brand: 'Samsung',
        storage: '128GB',
        landtopPrice: 0,
        jyesPrice: 5790,
        marketPrice: 5790,
        url: 'https://www.jyes.com.tw/',
        updatedAt: today()
      }
    ];
    channels = [
      {
        id: createId(),
        alias: '吉利小辣妹',
        url: 'https://www.youtube.com/',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml',
        lastVideoTitle: '中共挺2萬億！六支類別中美AI決戰',
        lastVideoUrl: 'https://www.youtube.com/',
        downfallIndex: '10 部影片',
        updatedAt: today()
      },
      {
        id: createId(),
        alias: '一個狠人',
        url: 'https://www.youtube.com/',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml',
        lastVideoTitle: '習下禁令，台海戰爭面臨重大反轉',
        lastVideoUrl: 'https://www.youtube.com/',
        downfallIndex: '10 部影片',
        updatedAt: today()
      }
    ];
    quotes = [
      financeQuote('Shiller PE Ratio', 'CAPE', 'valuation', 41.43, 0.28, 44.19, 31.8, 'Multpl', 'https://www.multpl.com/shiller-pe', 'Record max: 44.19 (Dec 1999)'),
      financeQuote('加權指數', '^TWII', 'tw', 44169.04, 2.36, 46552.16, 21551.58, 'Yahoo', 'https://finance.yahoo.com/quote/%5ETWII', undefined, 'TWD', 1019.58),
      financeQuote('台積電', '2330.TW', 'tw', 2310, 2.67, 2440, 1015, 'Yahoo', 'https://finance.yahoo.com/quote/2330.TW', undefined, 'TWD', 60),
      financeQuote('Dow Jones Industrial Average', 'DJI', 'us', 51202.26, 0.61, 53230, 36612, 'CNBC', 'https://www.cnbc.com/quotes/.DJI', undefined, 'USD', 311.71),
      financeQuote('S&P 500 Index', 'SPX', 'us', 7431.46, 0.17, 7522, 5118, 'CNBC', 'https://www.cnbc.com/quotes/.SPX', undefined, 'USD', 12.35),
      financeQuote('NASDAQ Composite', 'IXIC', 'us', 25888.84, 0.74, 26100, 16542, 'CNBC', 'https://www.cnbc.com/quotes/.IXIC', undefined, 'USD', 189.96),
      financeQuote('Nikkei 225 Index', 'N225', 'asia', 66020.04, 2.61, 66650, 48500, 'CNBC', 'https://www.cnbc.com/quotes/.N225', undefined, 'JPY', 1687.27),
      financeQuote('KOSPI Index', 'KOSPI', 'korea', 3123.62, 4.88, 3320, 2240, 'CNBC', 'https://www.cnbc.com/quotes/.KS11', undefined, 'KRW', 144.67),
      financeQuote('三星電子', '005930.KS', 'korea', 322500, 7.88, 360000, 181000, 'Yahoo', 'https://finance.yahoo.com/quote/005930.KS', undefined, 'KRW', 23500),
      financeQuote('SK 海力士', '000660.KS', 'korea', 215000, 2.26, 238000, 119000, 'Yahoo', 'https://finance.yahoo.com/quote/000660.KS', undefined, 'KRW', 4750),
      financeQuote('美元兌新台幣', 'USDTWD=X', 'fx', 31.61, 0.04, 33.1, 30.1, 'Yahoo', 'https://finance.yahoo.com/quote/USDTWD=X', undefined, 'TWD', 0.01),
      financeQuote('美元兌日圓', 'USDJPY=X', 'fx', 160.19, -0.04, 162.2, 139.8, 'Yahoo', 'https://finance.yahoo.com/quote/JPY=X', undefined, 'JPY', -0.06),
      financeQuote('CBOE VIX', 'VIX', 'rates', 17.86, -1.1, 65.73, 12.12, 'CNBC', 'https://www.cnbc.com/quotes/.VIX', undefined, '', -0.2),
      financeQuote('Gold COMEX', 'GC00', 'commodities', 4239.9, 0.24, 4380, 3001, 'CNBC', 'https://www.cnbc.com/quotes/@GC.1', undefined, 'USD', 10.2)
    ];
  }

  function financeQuote(
    name: string,
    symbol: string,
    group: FinanceGroup,
    price: number,
    changePercent: number,
    high52: number,
    low52: number,
    provider: FinanceQuote['provider'],
    sourceUrl: string,
    recordNote?: string,
    currency?: string,
    change = 0
  ): FinanceQuote {
    return {
      id: createId(),
      name,
      symbol,
      group,
      price,
      changePercent,
      change,
      high52,
      low52,
      provider,
      currency,
      sourceUrl,
      updatedAt: today(),
      recordNote
    };
  }

  function loadState() {
    if (typeof localStorage === 'undefined') {
      seedState();
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      seedState();
      saveState();
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      prices = Array.isArray(parsed.prices) ? parsed.prices : [];
      phones = Array.isArray(parsed.phones) ? parsed.phones : [];
      channels = Array.isArray(parsed.channels) ? parsed.channels : [];
      quotes = Array.isArray(parsed.quotes) ? parsed.quotes : [];
    } catch {
      seedState();
    }
  }

  function saveState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ prices, phones, channels, quotes }));
    }
  }

  function addPrice() {
    if (!priceForm.title.trim() && !priceForm.url.trim()) return;
    prices = [{ ...priceForm, id: createId(), checkedAt: priceForm.checkedAt || today() }, ...prices];
    priceForm = blankPrice();
    saveState();
  }

  function addPhone() {
    if (!phoneForm.model.trim()) return;
    phones = [{ ...phoneForm, id: createId(), updatedAt: phoneForm.updatedAt || today() }, ...phones];
    phoneForm = blankPhone();
    saveState();
  }

  function addChannel() {
    if (!tubeForm.alias.trim() && !tubeForm.url.trim()) return;
    const url = tubeForm.url.trim();
    channels = [
      {
        ...tubeForm,
        id: createId(),
        rssUrl: tubeForm.rssUrl || guessYoutubeRss(url, tubeForm.alias),
        updatedAt: tubeForm.updatedAt || today()
      },
      ...channels
    ];
    tubeForm = blankTube();
    saveState();
  }

  function addQuote() {
    if (!financeForm.name.trim() && !financeForm.symbol.trim()) return;
    quotes = [{ ...financeForm, id: createId(), updatedAt: financeForm.updatedAt || today() }, ...quotes];
    financeForm = blankFinance();
    saveState();
  }

  function removeItem(kind: ToolTab, id: string) {
    if (kind === 'price') prices = prices.filter((item) => item.id !== id);
    if (kind === 'phone') phones = phones.filter((item) => item.id !== id);
    if (kind === 'tube') channels = channels.filter((item) => item.id !== id);
    if (kind === 'finance') quotes = quotes.filter((item) => item.id !== id);
    saveState();
  }

  function summarizePrices(items: PricePoint[]) {
    const priced = items.filter((item) => Number.isFinite(Number(item.price)) && Number(item.price) > 0);
    const values = priced.map((item) => Number(item.price));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const low = priced.find((item) => Number(item.price) === min) || null;
    return { count: priced.length, min, max, average, low };
  }

  function groupFinanceQuotes(items: FinanceQuote[]) {
    const order: FinanceGroup[] = ['tw', 'us', 'valuation', 'asia', 'korea', 'fx', 'commodities', 'rates', 'crypto'];
    return order
      .map((group) => ({ group, label: groupLabels[group], quotes: items.filter((quote) => quote.group === group) }))
      .filter((group) => group.quotes.length > 0);
  }

  function bestPhonePrice(item: PhonePrice) {
    const options = [
      { source: '地標', price: item.landtopPrice },
      { source: '傑昇', price: item.jyesPrice },
      { source: '最低價', price: item.marketPrice }
    ].filter((option) => Number(option.price) > 0);
    return options.sort((a, b) => a.price - b.price)[0] || { source: '待查', price: 0 };
  }

  function guessYoutubeRss(url: string, alias: string) {
    const text = `${url} ${alias}`.trim();
    const channelMatch = text.match(/channel\/([A-Za-z0-9_-]+)/);
    if (channelMatch) return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelMatch[1]}`;
    const handleMatch = text.match(/@([A-Za-z0-9._-]+)/) || text.match(/^([A-Za-z0-9._-]+)$/);
    if (handleMatch) return `https://www.youtube.com/feeds/videos.xml?user=${handleMatch[1].replace(/^@/, '')}`;
    return '';
  }

  function quotePosition(quote: FinanceQuote) {
    if (!quote.high52 || !quote.low52 || quote.high52 <= quote.low52) return 0;
    return Math.max(4, Math.min(100, ((quote.price - quote.low52) / (quote.high52 - quote.low52)) * 100));
  }

  function phoneBar(value: number) {
    const max = Math.max(...phoneChartItems.flatMap((item) => [item.landtopPrice, item.jyesPrice, item.marketPrice]), 1);
    return Math.max(4, Math.min(100, (Number(value || 0) / max) * 100));
  }

  function formatMoney(value: number, currency = 'TWD') {
    if (!value) return '--';
    return `${currency === 'TWD' ? 'NT$' : currency} ${Math.round(value).toLocaleString('zh-TW')}`;
  }

  function formatNumber(value: number, digits = 2) {
    return Number(value || 0).toLocaleString('zh-TW', { maximumFractionDigits: digits });
  }

  function openUrl(url: string) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="tool-console" aria-label="鋒兄工具">
  <section class="tool-rail" aria-label="鋒兄工具子項目">
    {#each tabs as tab}
      <button class:active={toolTab === tab.id} type="button" on:click={() => onTabChange(tab.id)}>
        {tab.label}
      </button>
    {/each}
  </section>

  {#if toolTab === 'price'}
    <section class="tool-section theme-price">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">⌕</span>
          <div>
            <h3>鋒兄比價</h3>
            <p>貼上商品網址，取得目前價格與歷史價格圖表。</p>
          </div>
        </div>
      </div>

      <div class="tool-query-box">
        <label class="full">
          <span>商品網址</span>
          <div class="tool-search-line">
            <input bind:value={priceQuery} placeholder="https://24h.pchome.com.tw/prod/..." />
            <button class="tool-primary" type="button">查詢歷史價格</button>
          </div>
        </label>
        <button class="method-card selected" type="button">
          <strong>BigGo API</strong>
          <span>查詢 BigGo 歷史價格資料</span>
        </button>
        <button class="method-card" type="button">
          <strong>本地估值</strong>
          <span>保留本地測試流程，不連外查價</span>
        </button>
      </div>

      <div class="tool-mini-section">
        <div class="section-line">
          <strong>最近連結</strong>
          <span>{prices.length} 筆</span>
        </div>
        <div class="recent-links">
          {#each prices.slice(0, 2) as item}
            <button type="button" on:click={() => (priceQuery = item.url)}>
              <strong>{item.title || item.url}</strong>
              <span>{item.url}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="price-result-panel">
        <div class="section-line">
          <strong>比價結果</strong>
          <button type="button" on:click={() => openUrl(mainPrice?.url || '')}>開啟商品</button>
        </div>
        <div class="price-result-card">
          <div>
            <h4>{mainPrice?.title || '目前沒有可比價商品'}</h4>
            <p>來源：{mainPrice?.source || 'BigGo API'}，更新：{mainPrice?.checkedAt || today()}</p>
          </div>
          <div class="price-number">
            <span>現在價格</span>
            <strong>{formatMoney(mainPrice?.price || priceStats.min)}</strong>
          </div>
          {#if mainPrice?.note}
            <p class="tool-alert">{mainPrice.note}</p>
          {/if}
        </div>
        <div class="price-metrics">
          <div><span>現在價格</span><strong>{formatMoney(mainPrice?.price || priceStats.min)}</strong></div>
          <div class="rose"><span>歷史最高</span><strong>{formatMoney(priceStats.max || mainPrice?.price || 0)}</strong></div>
          <div class="green"><span>歷史最低</span><strong>{formatMoney(priceStats.min || mainPrice?.price || 0)}</strong></div>
        </div>
        <div class="trend-panel">
          <div class="section-line">
            <div>
              <p class="tool-eyebrow">PRICE TREND</p>
              <strong>歷史價格走勢</strong>
            </div>
            <div class="trend-summary">
              <span>高價 {formatMoney(priceStats.max || 10735)}</span>
              <span>低價 {formatMoney(priceStats.min || 10735)}</span>
              <span>變化 0 TWD</span>
            </div>
          </div>
          <svg viewBox="0 0 720 180" role="img" aria-label="歷史價格走勢">
            <polyline points="40,90 130,90 220,90 310,90 400,90 490,90 580,90" />
            <circle cx="310" cy="90" r="5" />
          </svg>
        </div>
      </div>

      <details class="tool-editor">
        <summary>新增比價資料</summary>
        <div class="tool-form">
          <input bind:value={priceForm.title} placeholder="商品名稱" />
          <input bind:value={priceForm.url} placeholder="商品網址" />
          <input bind:value={priceForm.source} placeholder="資料來源" />
          <input bind:value={priceForm.price} type="number" min="0" placeholder="價格" />
          <input bind:value={priceForm.currency} placeholder="幣別" />
          <input bind:value={priceForm.checkedAt} type="date" />
          <textarea bind:value={priceForm.note} placeholder="備註"></textarea>
          <button class="tool-primary" type="button" on:click={addPrice}>新增資料</button>
        </div>
      </details>
    </section>
  {:else if toolTab === 'phone'}
    <section class="tool-section theme-phone">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▯</span>
          <div>
            <h3>手機比價</h3>
            <p>根據地標網通與傑昇通信比價，可搜尋 iPhone 17、Samsung 26、Samsung A17 等機型。</p>
          </div>
        </div>
        <p class="tool-meta">更新：{today()}，結果 {phoneChartItems.length} 筆，本次寫入 2 筆歷史快照</p>
      </div>

      <div class="phone-search-grid">
        <div class="phone-search-card">
          <div>
            <strong>蘋果手機區塊</strong>
            <span>預設查詢：iPhone 17，每年九月切換新基準。</span>
          </div>
          <div class="tool-search-line">
            <input value="iPhone 17" aria-label="蘋果手機搜尋" />
            <button class="tool-primary" type="button">搜尋中</button>
            <button type="button">重新抓取</button>
          </div>
        </div>
        <div class="phone-search-card">
          <div>
            <strong>三星手機區塊</strong>
            <span>預設查詢：Samsung 26，三月前用去年末兩碼。</span>
          </div>
          <div class="tool-search-line">
            <input bind:value={phoneQuery} aria-label="三星手機搜尋" />
            <button class="tool-primary" type="button">搜尋中</button>
            <button type="button">重新抓取</button>
          </div>
        </div>
      </div>

      <div class="landtop-chart">
        <div class="section-line">
          <div>
            <p class="tool-eyebrow">LANDTOP CHART</p>
            <strong>地標網通 vs 傑昇通信</strong>
          </div>
          <span>▥</span>
        </div>
        {#each phoneChartItems.slice(0, 2) as item}
          <div class="bar-row">
            <div>
              <strong>{item.model}</strong>
              <span>{item.brand}</span>
            </div>
            <span>地標</span>
            <div class="bar-track"><i style={`width:${phoneBar(item.landtopPrice)}%`}></i></div>
            <strong>{formatMoney(item.landtopPrice)}</strong>
            <span>傑昇</span>
            <div class="bar-track purple"><i style={`width:${phoneBar(item.jyesPrice)}%`}></i></div>
            <strong>{formatMoney(item.jyesPrice)}</strong>
          </div>
        {/each}
      </div>

      <div class="phone-product-section">
        <div class="section-line"><strong>蘋果手機區塊</strong><span>收合</span></div>
        <div class="empty-phone">目前沒有這個區塊的比價結果。</div>
      </div>

      <div class="phone-product-section">
        <div class="section-line"><strong>三星手機區塊</strong><span>收合</span></div>
        <div class="phone-results">
          {#each phoneChartItems.slice(0, 2) as item}
            {@const best = bestPhonePrice(item)}
            <article>
              <div>
                <h4>{item.model}</h4>
                <p>{item.brand} / {item.storage}</p>
              </div>
              <div class="phone-price-pills">
                <span>建議售價 <strong>{formatMoney(item.marketPrice)}</strong></span>
                <span>地標網通 <strong>{formatMoney(item.landtopPrice)}</strong></span>
                <span>傑昇通信 <strong>{formatMoney(item.jyesPrice)}</strong></span>
                <span>最低價 <strong>{formatMoney(best.price)} ({best.source})</strong></span>
              </div>
            </article>
          {/each}
        </div>
      </div>

      <div class="weekly-panel">
        <div class="section-line">
          <div>
            <p class="tool-eyebrow">WEEKLY HISTORY</p>
            <strong>地標網通歷史價格</strong>
            <p>每 7 天記錄一次，目前爬蟲資料尚不需要連活系統查詢。</p>
          </div>
          <div class="trend-summary">
            <span>歷史最低 NT$ 4,990</span>
            <span>歷史最高 NT$ 4,990</span>
          </div>
        </div>
        <div class="weekly-legend"><span></span>Samsung A17 <span></span>Samsung A17 6G 128GB</div>
        <svg viewBox="0 0 720 180" role="img" aria-label="手機歷史價格">
          <polyline points={weeklyPoints.map((point, index) => `${80 + index * 70},${120 - point}`).join(' ')} />
          {#each weeklyPoints as point, index}
            <circle cx={80 + index * 70} cy={120 - point} r="4" />
          {/each}
        </svg>
      </div>

      <details class="tool-editor">
        <summary>新增手機比價</summary>
        <div class="tool-form">
          <input bind:value={phoneForm.model} placeholder="手機型號" />
          <select bind:value={phoneForm.brand}>
            <option>Apple</option>
            <option>Samsung</option>
            <option>Other</option>
          </select>
          <input bind:value={phoneForm.storage} placeholder="容量" />
          <input bind:value={phoneForm.landtopPrice} type="number" min="0" placeholder="地標價格" />
          <input bind:value={phoneForm.jyesPrice} type="number" min="0" placeholder="傑昇價格" />
          <input bind:value={phoneForm.marketPrice} type="number" min="0" placeholder="市場最低價" />
          <input bind:value={phoneForm.url} placeholder="來源網址" />
          <input bind:value={phoneForm.updatedAt} type="date" />
          <button class="tool-primary" type="button" on:click={addPhone}>新增手機</button>
        </div>
      </details>
    </section>
  {:else if toolTab === 'tube'}
    <section class="tool-section theme-tube">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▷</span>
          <div>
            <p class="tool-eyebrow">FENGBRO TUBE</p>
            <h3>鋒兄Tube</h3>
            <p>追蹤指定 YouTube 頻道最新影片，每個頻道顯示 10 部，目前追蹤 24 個頻道。</p>
          </div>
        </div>
        <div class="tool-actions">
          <span class="tool-badge">更新：2026/6/14 上午11:52:59</span>
          <span class="tool-badge">頻道：24 / 預設 24</span>
          <button type="button">頻道管理</button>
          <button class="tool-primary" type="button">重新整理</button>
        </div>
      </div>

      <div class="recent-video-panel">
        <div class="section-line">
          <strong>3 天內新影片：34 部</strong>
        </div>
        <div class="recent-video-grid">
          {#each recentVideoTitles.slice(0, 8) as title, index}
            <article>
              <strong>{title}</strong>
              <span>{index % 2 ? '一個狠人' : 'Sun Channel'} / 06/13 下午{String(8 + index).padStart(2, '0')}:15</span>
            </article>
          {/each}
        </div>
      </div>

      {#each ['吉利小辣妹', '一個狠人'] as channelName, channelIndex}
        <div class="tube-channel-section">
          <div class="section-line">
            <div>
              <h4>{channelName}</h4>
              <button type="button" on:click={() => openUrl('https://www.youtube.com/')}>開啟頻道</button>
            </div>
            <span>10 部影片</span>
          </div>
          <div class="tube-video-grid">
            {#each tubeVideos.slice(channelIndex * 5, channelIndex * 5 + 5) as video}
              <a href={video.url} target="_blank" rel="noreferrer">
                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                <div>
                  <strong>{video.title}</strong>
                  <span>{video.channel} / {video.date}</span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/each}

      <details class="tool-editor">
        <summary>頻道管理</summary>
        <div class="tool-form">
          <input bind:value={tubeForm.alias} placeholder="頻道名稱" />
          <input bind:value={tubeForm.url} placeholder="頻道 URL" />
          <input bind:value={tubeForm.rssUrl} placeholder="RSS URL，可自動推算" />
          <input bind:value={tubeForm.lastVideoTitle} placeholder="最新影片標題" />
          <input bind:value={tubeForm.lastVideoUrl} placeholder="最新影片 URL" />
          <input bind:value={tubeForm.downfallIndex} placeholder="摘要標籤" />
          <input bind:value={tubeForm.updatedAt} type="date" />
          <button class="tool-primary" type="button" on:click={addChannel}>新增頻道</button>
        </div>
      </details>
    </section>
  {:else}
    <section class="tool-section theme-finance">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▥</span>
          <div>
            <p class="tool-eyebrow">FENGBRO FINANCE</p>
            <h3>鋒兄金融</h3>
            <p>CNBC 報價監控：股指、商品、利率與加密貨幣，觸及新高或新低時自動標註。</p>
          </div>
        </div>
        <div class="tool-actions">
          <span class="tool-badge">更新：2026/6/14 上午11:52:47</span>
          <button class="tool-primary" type="button">重新整理</button>
        </div>
      </div>

      {#if shillerQuote}
        <div class="finance-hero">
          <div class="tool-identity">
            <span class="tool-icon">▥</span>
            <div>
              <h4>{shillerQuote.name}</h4>
              <p>Max: {formatNumber(shillerQuote.high52)} (Dec 1999) / {today()}</p>
            </div>
          </div>
          <div>
            <span>CURRENT</span>
            <strong>{formatNumber(shillerQuote.price)}</strong>
            <button type="button" on:click={() => openUrl(shillerQuote.sourceUrl)}>multpl.com</button>
          </div>
        </div>
      {/if}

      <div class="tool-rail compact finance-filters">
        {#each Object.entries(groupLabels) as [group, label]}
          <button
            class:active={financeGroup === group}
            type="button"
            on:click={() => (financeGroup = group as FinanceGroup | 'all')}
          >
            {label}
          </button>
        {/each}
      </div>

      <div class="finance-groups">
        {#each groupedQuotes as group}
          <section>
            <div class="section-line">
              <h4>{group.label}</h4>
              <span>{group.quotes.length} 項</span>
            </div>
            <div class="quote-grid">
              {#each group.quotes as quote}
                <article class="quote-card">
                  <div class="section-line">
                    <div>
                      <h4>{quote.name}</h4>
                      <p>{quote.symbol}</p>
                    </div>
                    <button type="button" on:click={() => openUrl(quote.sourceUrl)}>{quote.provider}</button>
                  </div>
                  <span>最新價</span>
                  <strong>{formatNumber(quote.price, quote.group === 'rates' ? 3 : 2)} <small>{quote.currency || ''}</small></strong>
                  <em class:down={(quote.changePercent || 0) < 0}>
                    {quote.change && quote.change > 0 ? '+' : ''}{formatNumber(quote.change || 0)}
                    <br />
                    {quote.changePercent > 0 ? '+' : ''}{formatNumber(quote.changePercent)}%
                  </em>
                  <div class="range-pair">
                    <span>52W High <strong>{formatNumber(quote.high52)}</strong></span>
                    <span>52W Low <strong>{formatNumber(quote.low52)}</strong></span>
                  </div>
                  <div class="range"><span style={`width:${quotePosition(quote)}%`}></span></div>
                  {#if quote.recordNote}<p class="record-note">{quote.recordNote}</p>{/if}
                </article>
              {/each}
            </div>
          </section>
        {/each}
      </div>

      <details class="tool-editor">
        <summary>新增金融監控</summary>
        <div class="tool-form">
          <input bind:value={financeForm.name} placeholder="名稱" />
          <input bind:value={financeForm.symbol} placeholder="代號" />
          <select bind:value={financeForm.group}>
            <option value="tw">台股</option>
            <option value="us">美股指數</option>
            <option value="fx">匯率</option>
            <option value="crypto">加密貨幣</option>
            <option value="rates">利率</option>
            <option value="valuation">估值</option>
          </select>
          <input bind:value={financeForm.price} type="number" placeholder="最新價格" />
          <input bind:value={financeForm.changePercent} type="number" placeholder="漲跌 %" />
          <input bind:value={financeForm.high52} type="number" placeholder="52W High" />
          <input bind:value={financeForm.low52} type="number" placeholder="52W Low" />
          <input bind:value={financeForm.sourceUrl} placeholder="來源 URL" />
          <input bind:value={financeForm.updatedAt} type="date" />
          <button class="tool-primary" type="button" on:click={addQuote}>新增金融資料</button>
        </div>
      </details>
    </section>
  {/if}
</section>
