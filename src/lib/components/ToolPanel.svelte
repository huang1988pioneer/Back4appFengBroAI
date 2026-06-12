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

  const STORAGE_KEY = 'fengbro.tools.workspace.v2';

  export let toolTab: ToolTab = 'price';
  export let onTabChange: (tab: ToolTab) => void;

  const tabs: Array<[ToolTab, string]> = [
    ['price', '鋒兄比價'],
    ['phone', '手機比價'],
    ['tube', '鋒兄Tube'],
    ['finance', '鋒兄金融']
  ];

  let priceForm: PricePoint = blankPrice();
  let phoneForm: PhonePrice = blankPhone();
  let tubeForm: TubeChannel = blankTube();
  let financeForm: FinanceQuote = blankFinance();
  let prices: PricePoint[] = [];
  let phones: PhonePrice[] = [];
  let channels: TubeChannel[] = [];
  let quotes: FinanceQuote[] = [];
  let priceQuery = '';
  let phoneQuery = 'Samsung 26';
  let financeGroup: FinanceQuote['group'] | 'all' = 'all';

  $: filteredPrices = prices.filter((item) =>
    [item.title, item.url, item.source, item.note].join(' ').toLowerCase().includes(priceQuery.toLowerCase())
  );
  $: priceStats = summarizePrices(filteredPrices);
  $: filteredPhones = phones.filter((item) =>
    [item.model, item.brand, item.storage].join(' ').toLowerCase().includes(phoneQuery.toLowerCase())
  );
  $: filteredQuotes = quotes.filter((quote) => financeGroup === 'all' || quote.group === financeGroup);

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
      source: '手動輸入',
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
        title: 'KIOXIA Exceria Plus G3 SSD 1TB',
        url: 'https://24h.pchome.com.tw/prod/DRAHGT-A900GOJVX',
        source: 'PChome',
        price: 2090,
        currency: 'TWD',
        checkedAt: '2026-06-04',
        note: '歷史低價紀錄'
      }
    ];
    phones = [
      {
        id: createId(),
        model: 'Samsung Galaxy A56 5G 12G/256G',
        brand: 'Samsung',
        storage: '256G',
        landtopPrice: 13990,
        jyesPrice: 13490,
        marketPrice: 12990,
        url: 'https://www.landtop.com.tw/',
        updatedAt: today()
      },
      {
        id: createId(),
        model: 'iPhone 16 128GB',
        brand: 'Apple',
        storage: '128GB',
        landtopPrice: 27900,
        jyesPrice: 27400,
        marketPrice: 26900,
        url: 'https://www.landtop.com.tw/',
        updatedAt: today()
      }
    ];
    channels = [
      {
        id: createId(),
        alias: 'henren778',
        url: 'https://www.youtube.com/@henren778',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml?user=henren778',
        lastVideoTitle: '鋒兄指數更新',
        lastVideoUrl: 'https://www.youtube.com/@henren778',
        downfallIndex: '00000',
        updatedAt: today()
      }
    ];
    quotes = [
      {
        id: createId(),
        name: '美元兌台幣',
        symbol: 'USDTWD=X',
        group: 'fx',
        price: 32,
        changePercent: 0,
        high52: 33,
        low52: 30,
        sourceUrl: 'https://finance.yahoo.com/quote/USDTWD=X',
        updatedAt: today()
      },
      {
        id: createId(),
        name: '台灣加權指數',
        symbol: '^TWII',
        group: 'tw',
        price: 23000,
        changePercent: 0,
        high52: 25000,
        low52: 19000,
        sourceUrl: 'https://finance.yahoo.com/quote/%5ETWII',
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

  function removeItem(kind: 'price' | 'phone' | 'tube' | 'finance', id: string) {
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
      { source: 'Landtop', price: item.landtopPrice },
      { source: '傑昇', price: item.jyesPrice },
      { source: '市場', price: item.marketPrice }
    ].filter((option) => Number(option.price) > 0);
    return options.sort((a, b) => a.price - b.price)[0] || { source: '未填', price: 0 };
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
    return Math.max(0, Math.min(100, ((quote.price - quote.low52) / (quote.high52 - quote.low52)) * 100));
  }

  function formatMoney(value: number, currency = 'TWD') {
    if (!value) return '--';
    return `${currency} ${Math.round(value).toLocaleString('zh-TW')}`;
  }

  function openUrl(url: string) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="tool-tabs" aria-label="工具子項目">
  {#each tabs as tab}
    <button class:active={toolTab === tab[0]} type="button" on:click={() => onTabChange(tab[0])}>
      {tab[1]}
    </button>
  {/each}
</section>

{#if toolTab === 'price'}
  <section class="tool-panel">
    <div class="tool-title">
      <div>
        <h3>鋒兄比價</h3>
        <p>依照參考專案的商品歷史價格概念，保存商品網址、來源、價格與查價日期，並自動計算低點、高點與均價。</p>
      </div>
      <button class="secondary" type="button" on:click={() => openUrl('https://biggo.com.tw/')}>開啟 BigGo</button>
    </div>

    <div class="tool-form">
      <input bind:value={priceForm.title} placeholder="商品名稱，例如 KIOXIA SSD 1TB" />
      <input bind:value={priceForm.url} placeholder="商品網址" />
      <input bind:value={priceForm.source} placeholder="來源，例如 PChome、momo、BigGo" />
      <input bind:value={priceForm.price} type="number" min="0" placeholder="價格" />
      <input bind:value={priceForm.currency} placeholder="幣別" />
      <input bind:value={priceForm.checkedAt} type="date" />
      <textarea bind:value={priceForm.note} placeholder="備註"></textarea>
      <button class="primary" type="button" on:click={addPrice}>加入價格紀錄</button>
    </div>

    <div class="tool-kpis">
      <div><span>紀錄</span><strong>{priceStats.count}</strong></div>
      <div><span>最低</span><strong>{formatMoney(priceStats.min)}</strong></div>
      <div><span>最高</span><strong>{formatMoney(priceStats.max)}</strong></div>
      <div><span>均價</span><strong>{formatMoney(priceStats.average)}</strong></div>
    </div>

    <input class="tool-search" bind:value={priceQuery} placeholder="搜尋商品、網址、來源或備註" />

    <div class="tool-list">
      {#each filteredPrices as item}
        <article>
          <div>
            <h4>{item.title || item.url}</h4>
            <p>{item.source} / {item.checkedAt} / {formatMoney(item.price, item.currency)}</p>
            {#if item.note}<small>{item.note}</small>{/if}
          </div>
          <div class="tool-actions">
            <button type="button" on:click={() => openUrl(item.url)}>開啟</button>
            <button type="button" on:click={() => removeItem('price', item.id)}>刪除</button>
          </div>
        </article>
      {/each}
    </div>
  </section>
{:else if toolTab === 'phone'}
  <section class="tool-panel">
    <div class="tool-title">
      <div>
        <h3>手機比價</h3>
        <p>參考 Landtop/Jyes 手機比價流程，保存型號、容量與多通路價格，自動標出最低價來源。</p>
      </div>
      <div class="tool-actions">
        <button class="secondary" type="button" on:click={() => openUrl('https://www.landtop.com.tw/')}>Landtop</button>
        <button class="secondary" type="button" on:click={() => openUrl('https://www.jyes.com.tw/')}>傑昇</button>
      </div>
    </div>

    <div class="tool-form">
      <input bind:value={phoneForm.model} placeholder="手機型號" />
      <select bind:value={phoneForm.brand}>
        <option>Apple</option>
        <option>Samsung</option>
        <option>Other</option>
      </select>
      <input bind:value={phoneForm.storage} placeholder="容量，例如 256G" />
      <input bind:value={phoneForm.landtopPrice} type="number" min="0" placeholder="Landtop 價格" />
      <input bind:value={phoneForm.jyesPrice} type="number" min="0" placeholder="傑昇價格" />
      <input bind:value={phoneForm.marketPrice} type="number" min="0" placeholder="其他市場價格" />
      <input bind:value={phoneForm.url} placeholder="來源網址" />
      <input bind:value={phoneForm.updatedAt} type="date" />
      <button class="primary" type="button" on:click={addPhone}>加入手機比價</button>
    </div>

    <input class="tool-search" bind:value={phoneQuery} placeholder="搜尋 Apple、Samsung、型號或容量" />

    <div class="comparison-table">
      <div class="comparison-head">
        <span>型號</span><span>Landtop</span><span>傑昇</span><span>市場</span><span>最低</span><span>操作</span>
      </div>
      {#each filteredPhones as item}
        {@const best = bestPhonePrice(item)}
        <div class="comparison-row">
          <span><strong>{item.model}</strong><small>{item.brand} / {item.storage}</small></span>
          <span>{formatMoney(item.landtopPrice)}</span>
          <span>{formatMoney(item.jyesPrice)}</span>
          <span>{formatMoney(item.marketPrice)}</span>
          <span class="best">{best.source} {formatMoney(best.price)}</span>
          <span class="tool-actions">
            <button type="button" on:click={() => openUrl(item.url)}>開啟</button>
            <button type="button" on:click={() => removeItem('phone', item.id)}>刪除</button>
          </span>
        </div>
      {/each}
    </div>
  </section>
{:else if toolTab === 'tube'}
  <section class="tool-panel">
    <div class="tool-title">
      <div>
        <h3>鋒兄Tube</h3>
        <p>管理 YouTube 頻道、RSS 來源、最新影片與鋒兄指數。可先手動維護，之後接 Back4app 排程同步。</p>
      </div>
      <button class="secondary" type="button" on:click={() => openUrl('https://www.youtube.com/')}>開啟 YouTube</button>
    </div>

    <div class="tool-form">
      <input bind:value={tubeForm.alias} placeholder="頻道別名，例如 henren778" />
      <input bind:value={tubeForm.url} placeholder="頻道 URL" />
      <input bind:value={tubeForm.rssUrl} placeholder="RSS URL，可留空自動推測" />
      <input bind:value={tubeForm.lastVideoTitle} placeholder="最新影片標題" />
      <input bind:value={tubeForm.lastVideoUrl} placeholder="最新影片 URL" />
      <input bind:value={tubeForm.downfallIndex} placeholder="鋒兄指數，例如 00012.34" />
      <input bind:value={tubeForm.updatedAt} type="date" />
      <button class="primary" type="button" on:click={addChannel}>加入頻道</button>
    </div>

    <div class="tool-list">
      {#each channels as item}
        <article>
          <div>
            <h4>{item.alias || item.url}</h4>
            <p>更新：{item.updatedAt} / 鋒兄指數：{item.downfallIndex || '--'}</p>
            <small>{item.lastVideoTitle || '尚未填最新影片'}</small>
          </div>
          <div class="tool-actions">
            <button type="button" on:click={() => openUrl(item.url)}>頻道</button>
            <button type="button" on:click={() => openUrl(item.rssUrl)}>RSS</button>
            <button type="button" on:click={() => openUrl(item.lastVideoUrl)}>影片</button>
            <button type="button" on:click={() => removeItem('tube', item.id)}>刪除</button>
          </div>
        </article>
      {/each}
    </div>
  </section>
{:else}
  <section class="tool-panel">
    <div class="tool-title">
      <div>
        <h3>鋒兄金融</h3>
        <p>參考金融報價面板，保存指數、匯率、利率、加密貨幣與估值資料，並標示 52 週區間位置。</p>
      </div>
      <button class="secondary" type="button" on:click={() => openUrl('https://finance.yahoo.com/')}>Yahoo Finance</button>
    </div>

    <div class="tool-form">
      <input bind:value={financeForm.name} placeholder="名稱，例如 台灣加權指數" />
      <input bind:value={financeForm.symbol} placeholder="代號，例如 ^TWII" />
      <select bind:value={financeForm.group}>
        <option value="tw">台股</option>
        <option value="us">美股</option>
        <option value="fx">匯率</option>
        <option value="crypto">加密貨幣</option>
        <option value="rates">利率</option>
        <option value="valuation">估值</option>
      </select>
      <input bind:value={financeForm.price} type="number" placeholder="目前價格" />
      <input bind:value={financeForm.changePercent} type="number" placeholder="漲跌 %" />
      <input bind:value={financeForm.high52} type="number" placeholder="52 週高" />
      <input bind:value={financeForm.low52} type="number" placeholder="52 週低" />
      <input bind:value={financeForm.sourceUrl} placeholder="來源 URL" />
      <input bind:value={financeForm.updatedAt} type="date" />
      <button class="primary" type="button" on:click={addQuote}>加入金融追蹤</button>
    </div>

    <div class="tool-tabs compact">
      {#each ['all', 'tw', 'us', 'fx', 'crypto', 'rates', 'valuation'] as group}
        <button class:active={financeGroup === group} type="button" on:click={() => (financeGroup = group as FinanceQuote['group'] | 'all')}>
          {group}
        </button>
      {/each}
    </div>

    <div class="tool-list">
      {#each filteredQuotes as quote}
        <article>
          <div>
            <h4>{quote.name || quote.symbol}</h4>
            <p>{quote.symbol} / {quote.group} / {quote.price.toLocaleString('zh-TW')} / {quote.changePercent}%</p>
            <div class="range">
              <span style={`width:${quotePosition(quote)}%`}></span>
            </div>
            <small>52 週低 {quote.low52 || '--'} / 52 週高 {quote.high52 || '--'} / 更新 {quote.updatedAt}</small>
          </div>
          <div class="tool-actions">
            <button type="button" on:click={() => openUrl(quote.sourceUrl)}>來源</button>
            <button type="button" on:click={() => removeItem('finance', quote.id)}>刪除</button>
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}
