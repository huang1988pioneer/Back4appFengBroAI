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

  type FinanceQuote = {
    id: string;
    name: string;
    symbol: string;
    group: 'tw' | 'us' | 'fx' | 'crypto' | 'rates' | 'valuation';
    price: number;
    changePercent: number;
    high52: number;
    low52: number;
    sourceUrl: string;
    updatedAt: string;
  };

  const STORAGE_KEY = 'fengbro.tools.workspace.v3';

  export let toolTab: ToolTab = 'price';
  export let onTabChange: (tab: ToolTab) => void;

  const tabs: Array<{ id: ToolTab; label: string }> = [
    { id: 'price', label: '鋒兄比價' },
    { id: 'phone', label: '手機比價' },
    { id: 'tube', label: '鋒兄Tube' },
    { id: 'finance', label: '鋒兄金融' }
  ];

  const sampleVideos = [
    '【張內咸脫口秀】一個「脫北者」拼命想回平壤，為什麼中國反而最尷尬？',
    '一句「為你好」正在親手摧毀你的家庭？孩子越來越反叛',
    '【看懂朝鮮】一個視頻了解朝鮮政治：金正恩如何清算父親？',
    '領袖的冷啟動手冊：從篩選到滲洗，建立硬核團隊的流水線',
    '不止汽車，光伏，連馬拉和尚都圍剿中國競爭',
    '高考女生一句話引發全網男女大戰：性同意年齡到底該不該提高'
  ];

  const groupLabels: Record<FinanceQuote['group'] | 'all', string> = {
    all: '全部',
    tw: '台股',
    us: '美股指數',
    fx: '匯率',
    crypto: '加密貨幣',
    rates: '利率',
    valuation: '估值'
  };

  let priceForm: PricePoint = blankPrice();
  let phoneForm: PhonePrice = blankPhone();
  let tubeForm: TubeChannel = blankTube();
  let financeForm: FinanceQuote = blankFinance();
  let prices: PricePoint[] = [];
  let phones: PhonePrice[] = [];
  let channels: TubeChannel[] = [];
  let quotes: FinanceQuote[] = [];
  let priceQuery = 'https://24h.pchome.com.tw/prod/DRAHCO-A900J8363';
  let phoneQuery = 'Samsung';
  let financeGroup: FinanceQuote['group'] | 'all' = 'all';

  $: filteredPrices = prices.filter((item) =>
    [item.title, item.url, item.source, item.note].join(' ').toLowerCase().includes(priceQuery.toLowerCase())
  );
  $: visiblePrices = filteredPrices.length ? filteredPrices : prices.slice(0, 3);
  $: priceStats = summarizePrices(visiblePrices);
  $: filteredPhones = phones.filter((item) =>
    [item.model, item.brand, item.storage].join(' ').toLowerCase().includes(phoneQuery.toLowerCase())
  );
  $: phoneChartItems = filteredPhones.length ? filteredPhones.slice(0, 4) : phones.slice(0, 4);
  $: filteredQuotes = quotes.filter((quote) => financeGroup === 'all' || quote.group === financeGroup);
  $: shillerQuote = quotes.find((quote) => quote.group === 'valuation') || null;
  $: recentVideos = channels.flatMap((channel) =>
    sampleVideos.slice(0, 2).map((title, index) => ({ channel, title, index }))
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
      high52: 0,
      low52: 0,
      sourceUrl: '',
      updatedAt: today()
    };
  }

  function seedState() {
    prices = [
      {
        id: createId(),
        title: 'PChome 商品 DRAHCO-A900J8363',
        url: 'https://24h.pchome.com.tw/prod/DRAHCO-A900J8363',
        source: 'BigGo API',
        price: 12199,
        currency: 'TWD',
        checkedAt: '2026-06-13',
        note: '來源商品頁回傳 429，已改用 PChome 商品 API 取得標題與目前價格，再繼續嘗試 BigGo 比對。'
      },
      {
        id: createId(),
        title: 'PChome 商品 DYALS1-A900JUGXV',
        url: 'https://24h.pchome.com.tw/prod/DYALS1-A900JUGXV',
        source: '本地估值',
        price: 4990,
        currency: 'TWD',
        checkedAt: '2026-06-13',
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
        alias: '張內咸脫口秀',
        url: 'https://www.youtube.com/@henren778',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml?user=henren778',
        lastVideoTitle: '【張內咸脫口秀】一個「脫北者」拼命想回平壤',
        lastVideoUrl: 'https://www.youtube.com/@henren778',
        downfallIndex: '10 部影片',
        updatedAt: today()
      },
      {
        id: createId(),
        alias: 'Sun Channel',
        url: 'https://www.youtube.com/',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml',
        lastVideoTitle: '一句「為你好」正在親手摧毀你的家庭？',
        lastVideoUrl: 'https://www.youtube.com/',
        downfallIndex: '10 部影片',
        updatedAt: today()
      }
    ];
    quotes = [
      {
        id: createId(),
        name: 'Shiller PE Ratio',
        symbol: 'MULTPL',
        group: 'valuation',
        price: 41.43,
        changePercent: 0,
        high52: 44.19,
        low52: 31.8,
        sourceUrl: 'https://www.multpl.com/shiller-pe',
        updatedAt: today()
      },
      {
        id: createId(),
        name: '加權指數',
        symbol: '^TWII',
        group: 'tw',
        price: 44169.04,
        changePercent: 2.36,
        high52: 46552.16,
        low52: 21551.58,
        sourceUrl: 'https://finance.yahoo.com/quote/%5ETWII',
        updatedAt: today()
      },
      {
        id: createId(),
        name: '台積電',
        symbol: '2330.TW',
        group: 'tw',
        price: 2310,
        changePercent: 2.67,
        high52: 2440,
        low52: 1015,
        sourceUrl: 'https://finance.yahoo.com/quote/2330.TW',
        updatedAt: today()
      },
      {
        id: createId(),
        name: 'S&P 500 Index',
        symbol: '^GSPC',
        group: 'us',
        price: 6038.81,
        changePercent: 0.44,
        high52: 6147.43,
        low52: 4835.04,
        sourceUrl: 'https://finance.yahoo.com/quote/%5EGSPC',
        updatedAt: today()
      }
    ];
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

  function formatNumber(value: number) {
    return Number(value || 0).toLocaleString('zh-TW', { maximumFractionDigits: 2 });
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
            <p class="tool-eyebrow">FENGBRO PRICE</p>
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

      <div class="tool-result-card">
        <div>
          <p class="tool-eyebrow">比價結果</p>
          <h4>{priceStats.low?.title || '目前沒有可比價商品'}</h4>
          <p>來源：{priceStats.low?.source || 'BigGo API'}，更新：{priceStats.low?.checkedAt || today()}</p>
        </div>
        <div class="price-number">
          <span>現在價格</span>
          <strong>{formatMoney(priceStats.low?.price || priceStats.min)}</strong>
        </div>
        {#if priceStats.low?.note}
          <p class="tool-alert">{priceStats.low.note}</p>
        {/if}
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
        <p class="tool-meta">更新：{today()}，結果 {phoneChartItems.length} 筆</p>
      </div>

      <div class="phone-search-grid">
        <div class="phone-search-card">
          <div>
            <strong>蘋果手機區塊</strong>
            <span>預設查詢：iPhone 17，每年九月切換新基準。</span>
          </div>
          <div class="tool-search-line">
            <input value="iPhone 17" aria-label="蘋果手機搜尋" />
            <button class="tool-primary" type="button">搜尋蘋果</button>
          </div>
        </div>
        <div class="phone-search-card">
          <div>
            <strong>三星手機區塊</strong>
            <span>預設查詢：Samsung 26，三月前用去年末兩碼。</span>
          </div>
          <div class="tool-search-line">
            <input bind:value={phoneQuery} aria-label="三星手機搜尋" />
            <button class="tool-primary" type="button">搜尋三星</button>
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
        {#each phoneChartItems as item}
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

      <div class="phone-results">
        {#each phoneChartItems as item}
          {@const best = bestPhonePrice(item)}
          <article>
            <div>
              <h4>{item.model}</h4>
              <p>{item.brand} / {item.storage} / 更新 {item.updatedAt}</p>
            </div>
            <div>
              <span>目前最低</span>
              <strong>{best.source} {formatMoney(best.price)}</strong>
            </div>
            <button type="button" on:click={() => openUrl(item.url)}>開啟來源</button>
            <button type="button" on:click={() => removeItem('phone', item.id)}>刪除</button>
          </article>
        {/each}
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
            <p>追蹤指定 YouTube 頻道最新影片，每個頻道顯示 10 部，目前追蹤 {channels.length} 個頻道。</p>
          </div>
        </div>
        <div class="tool-actions">
          <span class="tool-badge">更新：{today()}</span>
          <button class="tool-primary" type="button">重新整理</button>
        </div>
      </div>

      <div class="recent-video-panel">
        <div class="section-line">
          <strong>3 天內新影片：{recentVideos.length} 部</strong>
        </div>
        <div class="recent-video-grid">
          {#each recentVideos.slice(0, 8) as video}
            <article>
              <strong>{video.title}</strong>
              <span>{video.channel.alias} / {video.channel.updatedAt}</span>
            </article>
          {/each}
        </div>
      </div>

      <div class="channel-grid">
        {#each channels as item}
          <article class="channel-card">
            <div>
              <h4>{item.alias || item.url}</h4>
              <button type="button" on:click={() => openUrl(item.url)}>開啟頻道</button>
            </div>
            <div class="video-strip">
              <span>{item.lastVideoTitle || '目前尚未記錄最新影片'}</span>
              <span>{item.downfallIndex || '10 部影片'}</span>
            </div>
            <div class="tool-actions">
              <button type="button" on:click={() => openUrl(item.rssUrl)}>RSS</button>
              <button type="button" on:click={() => openUrl(item.lastVideoUrl)}>影片</button>
              <button type="button" on:click={() => removeItem('tube', item.id)}>刪除</button>
            </div>
          </article>
        {/each}
      </div>

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
        <button class="tool-primary" type="button">重新整理</button>
      </div>

      <div class="finance-hero">
        <div class="tool-identity">
          <span class="tool-icon">▥</span>
          <div>
            <h4>{shillerQuote?.name || 'Shiller PE Ratio'}</h4>
            <p>Max: {formatNumber(shillerQuote?.high52 || 44.19)} / {today()}</p>
          </div>
        </div>
        <div>
          <span>CURRENT</span>
          <strong>{formatNumber(shillerQuote?.price || 41.43)}</strong>
          <button type="button" on:click={() => openUrl(shillerQuote?.sourceUrl || 'https://www.multpl.com/shiller-pe')}>
            multpl.com
          </button>
        </div>
      </div>

      <div class="tool-rail compact">
        {#each Object.entries(groupLabels) as [group, label]}
          <button
            class:active={financeGroup === group}
            type="button"
            on:click={() => (financeGroup = group as FinanceQuote['group'] | 'all')}
          >
            {label}
          </button>
        {/each}
      </div>

      <div class="quote-grid">
        {#each filteredQuotes as quote}
          <article class="quote-card">
            <div class="section-line">
              <div>
                <h4>{quote.name || quote.symbol}</h4>
                <p>{quote.symbol}</p>
              </div>
              <button type="button" on:click={() => openUrl(quote.sourceUrl)}>來源</button>
            </div>
            <span>最新價</span>
            <strong>{formatNumber(quote.price)} <small>{quote.group === 'tw' ? 'TWD' : ''}</small></strong>
            <em class:down={quote.changePercent < 0}>{quote.changePercent > 0 ? '+' : ''}{quote.changePercent}%</em>
            <div class="range-pair">
              <span>52W High <strong>{formatNumber(quote.high52)}</strong></span>
              <span>52W Low <strong>{formatNumber(quote.low52)}</strong></span>
            </div>
            <div class="range"><span style={`width:${quotePosition(quote)}%`}></span></div>
            <button type="button" on:click={() => removeItem('finance', quote.id)}>刪除</button>
          </article>
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
