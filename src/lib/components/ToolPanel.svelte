<script context="module" lang="ts">
  export type ToolTab = 'price' | 'phone' | 'tube' | 'finance';
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  type FinanceGroup = 'tw' | 'us' | 'asia' | 'korea' | 'fx' | 'commodities' | 'crypto' | 'rates' | 'valuation';

  type PriceResult = {
    title: string;
    url: string;
    source: string;
    currency: string;
    currentPrice: number | null;
    notice?: string;
    matchedTitle?: string;
    matchedUrl?: string;
    resolvedAt: string;
    history: Array<{ date: string; price: number | null; currency?: string }>;
  };

  type MobileProduct = {
    id: string;
    brand: string;
    name: string;
    suggestedPrice?: number | null;
    landtopPrice?: number | null;
    landtopPriceLabel?: string | null;
    sourceUrl?: string | null;
    jyesPrice?: number | null;
    jyesPriceLabel?: string | null;
    jyesUrl?: string | null;
    bestPrice?: number | null;
    bestSourceLabel?: string | null;
  };

  type MobileResult = {
    source: string;
    query: string;
    total: number;
    fetchedAt: string;
    products: MobileProduct[];
    warnings?: string[];
  };

  type TubeVideo = {
    videoId: string;
    title: string;
    url: string;
    publishedAt: string;
    updatedAt: string;
    thumbnail: string;
    channelTitle?: string;
  };

  type TubeChannel = {
    sourceUrl: string;
    channelId: string;
    title: string;
    videos: TubeVideo[];
    error?: string;
  };

  type TubeResult = {
    fetchedAt: string;
    sourceCount: number;
    defaultSourceCount: number;
    channels: TubeChannel[];
    recentVideos: TubeVideo[];
  };

  type FinanceQuote = {
    id: string;
    name: string;
    displayName?: string;
    symbol: string;
    sourceUrl: string;
    group: FinanceGroup;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string;
    high52: number | null;
    low52: number | null;
    lastUpdated: string;
    provider: 'Yahoo' | 'Multpl' | string;
    recordTag?: 'new-high' | 'new-low' | null;
    recordNote?: string;
    error?: string;
  };

  type FinanceResult = {
    fetchedAt: string;
    source: string;
    quotes: FinanceQuote[];
    financeAlerts: Array<{ id: string; message: string; sourceUrl: string }>;
    shillerPe: {
      current: number | null;
      recordHigh: number;
      recordHighDate: string;
      isRecordHigh: boolean;
    };
  };

  export let toolTab: ToolTab = 'price';
  export let onTabChange: (tab: ToolTab) => void;

  const tabs: Array<{ id: ToolTab; label: string }> = [
    { id: 'price', label: '鋒兄比價' },
    { id: 'phone', label: '手機比價' },
    { id: 'tube', label: '鋒兄Tube' },
    { id: 'finance', label: '鋒兄金融' }
  ];

  const groupLabels: Record<FinanceGroup, string> = {
    tw: '台股',
    us: '美股指數',
    asia: '亞洲指數',
    korea: '韓股',
    fx: '匯率',
    commodities: '商品',
    crypto: '加密貨幣',
    rates: '利率與波動',
    valuation: '估值'
  };

  const defaultChannels = [
    { alias: '吉利小辣妹', sourceUrl: 'https://www.youtube.com/@jilixiaoshimei/videos' },
    { alias: '一個狠人', sourceUrl: 'https://www.youtube.com/@henren778/videos' },
    { alias: 'Sun Channel', sourceUrl: 'https://www.youtube.com/@SunChannelHK/videos' },
    { alias: '曹操觀察', sourceUrl: 'https://www.youtube.com/@libertas1984/videos' }
  ];

  const recentPriceLinks = [
    'https://24h.pchome.com.tw/prod/DRAHGT-A900GOJVX',
    'https://24h.pchome.com.tw/prod/DRAHCO-A900J8363'
  ];

  let priceUrl = recentPriceLinks[0];
  let priceResult: PriceResult | null = null;
  let priceLoading = false;
  let priceError = '';

  let mobileQuery = 'Samsung';
  let mobileResult: MobileResult | null = null;
  let mobileLoading = false;
  let mobileError = '';
  let phoneLoadedOnce = false;

  let tubeChannels = [...defaultChannels];
  let tubeAliasDraft = '';
  let tubeUrlDraft = '';
  let tubeResult: TubeResult | null = null;
  let tubeLoading = false;
  let tubeError = '';
  let tubeLoadedOnce = false;

  let financeResult: FinanceResult | null = null;
  let financeLoading = false;
  let financeError = '';
  let financeLoadedOnce = false;

  $: priceSummary = summarizeHistory(priceResult);
  $: phoneChartItems = (mobileResult?.products || []).slice(0, 3);
  $: groupedQuotes = groupFinanceQuotes(financeResult?.quotes || []);
  $: shillerQuote = financeResult?.quotes.find((quote) => quote.group === 'valuation') || null;

  onMount(() => {
    void runPriceCompare();
    void loadPhone(false, mobileQuery);
  });

  $: if (toolTab === 'tube' && !tubeLoadedOnce && !tubeLoading) {
    void loadTube();
  }

  $: if (toolTab === 'finance' && !financeLoadedOnce && !financeLoading) {
    void loadFinance();
  }

  function selectTab(tab: ToolTab) {
    onTabChange(tab);
    if (tab === 'phone' && !phoneLoadedOnce) void loadPhone(false, mobileQuery);
    if (tab === 'tube' && !tubeLoadedOnce) void loadTube();
    if (tab === 'finance' && !financeLoadedOnce) void loadFinance();
  }

  async function readJson<T>(response: Response): Promise<T> {
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || `HTTP ${response.status}`);
    return result as T;
  }

  async function runPriceCompare() {
    if (!priceUrl.trim()) {
      priceError = '請輸入商品網址';
      return;
    }
    priceLoading = true;
    priceError = '';
    try {
      priceResult = await readJson<PriceResult>(
        await fetch(`/api/tools/price?url=${encodeURIComponent(priceUrl.trim())}&source=biggo-api&t=${Date.now()}`)
      );
    } catch (error) {
      priceError = error instanceof Error ? error.message : '鋒兄比價讀取失敗';
    } finally {
      priceLoading = false;
    }
  }

  async function loadPhone(refresh = false, queryOverride = mobileQuery) {
    phoneLoadedOnce = true;
    mobileLoading = true;
    mobileError = '';
    try {
      mobileResult = await readJson<MobileResult>(
        await fetch(`/api/tools/phone?query=${encodeURIComponent(queryOverride)}${refresh ? '&refresh=1' : ''}&t=${Date.now()}`)
      );
    } catch (error) {
      mobileError = error instanceof Error ? error.message : '手機比價讀取失敗';
    } finally {
      mobileLoading = false;
    }
  }

  async function loadTube() {
    tubeLoadedOnce = true;
    tubeLoading = true;
    tubeError = '';
    try {
      tubeResult = await readJson<TubeResult>(
        await fetch('/api/tools/tube', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channels: tubeChannels })
        })
      );
    } catch (error) {
      tubeError = error instanceof Error ? error.message : '鋒兄Tube 讀取失敗';
    } finally {
      tubeLoading = false;
    }
  }

  async function loadFinance() {
    financeLoadedOnce = true;
    financeLoading = true;
    financeError = '';
    try {
      financeResult = await readJson<FinanceResult>(await fetch(`/api/tools/finance?t=${Date.now()}`));
    } catch (error) {
      financeError = error instanceof Error ? error.message : '鋒兄金融讀取失敗';
    } finally {
      financeLoading = false;
    }
  }

  function addTubeChannel() {
    const sourceUrl = normalizeYoutubeSource(tubeUrlDraft);
    if (!sourceUrl) {
      tubeError = '請輸入 YouTube 頻道網址或 @handle';
      return;
    }
    tubeChannels = [...tubeChannels.filter((channel) => channel.sourceUrl !== sourceUrl), { alias: tubeAliasDraft.trim(), sourceUrl }];
    tubeAliasDraft = '';
    tubeUrlDraft = '';
    tubeResult = null;
    tubeLoadedOnce = false;
  }

  function normalizeYoutubeSource(value: string) {
    const input = value.trim();
    if (!input) return '';
    if (input.startsWith('@')) return `https://www.youtube.com/${encodeURI(input)}/videos`;
    if (/^https?:\/\//i.test(input)) return input.replace(/\/$/, '').replace(/\/videos$/i, '/videos');
    return `https://www.youtube.com/@${encodeURIComponent(input)}/videos`;
  }

  function summarizeHistory(result: PriceResult | null) {
    const values = (result?.history || []).map((item) => item.price).filter((value): value is number => typeof value === 'number');
    if (!values.length) return { current: result?.currentPrice ?? null, high: null, low: null, count: 0 };
    return {
      current: result?.currentPrice ?? values.at(-1) ?? null,
      high: Math.max(...values),
      low: Math.min(...values),
      count: values.length
    };
  }

  function groupFinanceQuotes(items: FinanceQuote[]) {
    const order: FinanceGroup[] = ['valuation', 'tw', 'us', 'asia', 'korea', 'fx', 'commodities', 'rates', 'crypto'];
    return order
      .map((group) => ({ group, label: groupLabels[group], quotes: items.filter((quote) => quote.group === group) }))
      .filter((group) => group.quotes.length > 0);
  }

  function bestPhonePrice(item: MobileProduct) {
    const options = [
      { source: '地標', price: item.landtopPrice },
      { source: '傑昇', price: item.jyesPrice },
      { source: item.bestSourceLabel || '最低價', price: item.bestPrice }
    ].filter((option) => typeof option.price === 'number');
    return options.sort((a, b) => Number(a.price) - Number(b.price))[0] || { source: '待查', price: null };
  }

  function phoneBar(value: number | null | undefined) {
    const max = Math.max(...phoneChartItems.flatMap((item) => [item.landtopPrice || 0, item.jyesPrice || 0, item.suggestedPrice || 0]), 1);
    return Math.max(4, Math.min(100, (Number(value || 0) / max) * 100));
  }

  function quotePosition(quote: FinanceQuote) {
    if (!quote.high52 || !quote.low52 || quote.high52 <= quote.low52 || quote.price == null) return 0;
    return Math.max(4, Math.min(100, ((quote.price - quote.low52) / (quote.high52 - quote.low52)) * 100));
  }

  function trendPoints(result: PriceResult | null) {
    const values = (result?.history || []).map((item) => item.price).filter((value): value is number => typeof value === 'number').slice(-12);
    if (!values.length) return '40,90 680,90';
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values
      .map((value, index) => {
        const x = 40 + (index * 640) / Math.max(1, values.length - 1);
        const ratio = max === min ? 0.5 : (value - min) / (max - min);
        const y = 150 - ratio * 110;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  function formatMoney(value: number | null | undefined, currency = 'TWD') {
    if (typeof value !== 'number') return '--';
    return `${currency === 'TWD' ? 'NT$' : currency} ${Math.round(value).toLocaleString('zh-TW')}`;
  }

  function formatNumber(value: number | null | undefined, digits = 2) {
    return typeof value === 'number' ? value.toLocaleString('zh-TW', { maximumFractionDigits: digits }) : '--';
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return '--';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-TW');
  }

  function openUrl(url: string | null | undefined) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<section class="tool-console" aria-label="鋒兄工具">
  <section class="tool-rail" aria-label="鋒兄工具分頁">
    {#each tabs as tab}
      <button class:active={toolTab === tab.id} type="button" on:click={() => selectTab(tab.id)}>{tab.label}</button>
    {/each}
  </section>

  {#if toolTab === 'price'}
    <section class="tool-section theme-price">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">⌕</span>
          <div>
            <h3>鋒兄比價</h3>
            <p>貼上 PChome 或 momo 商品網址，即時解析商品頁並嘗試串 BigGo 歷史價格。</p>
          </div>
        </div>
        <div class="tool-actions">
          <span class="tool-badge">{priceResult ? `更新：${formatDate(priceResult.resolvedAt)}` : '即時 API'}</span>
          <button class="tool-primary" type="button" disabled={priceLoading} on:click={runPriceCompare}>
            {priceLoading ? '查詢中...' : '查詢歷史價格'}
          </button>
        </div>
      </div>

      <div class="tool-query-box">
        <label class="full">
          <span>商品網址</span>
          <div class="tool-search-line">
            <input bind:value={priceUrl} placeholder="https://24h.pchome.com.tw/prod/..." />
            <button class="tool-primary" type="button" disabled={priceLoading} on:click={runPriceCompare}>
              {priceLoading ? '查詢中...' : '查詢'}
            </button>
          </div>
        </label>
        <button class="method-card selected" type="button"><strong>BigGo API</strong><span>即時查商品與歷史價格</span></button>
        <button class="method-card" type="button"><strong>PChome API</strong><span>BigGo 被限流時仍可回傳目前價格</span></button>
      </div>

      {#if priceError}<div class="tool-alert">{priceError}</div>{/if}

      <div class="tool-mini-section">
        <div class="section-line"><strong>最近連結</strong><span>{recentPriceLinks.length} 筆</span></div>
        <div class="recent-links">
          {#each recentPriceLinks as link}
            <button type="button" on:click={() => (priceUrl = link)}><strong>{link.split('/').at(-1)}</strong><span>{link}</span></button>
          {/each}
        </div>
      </div>

      <div class="price-result-panel">
        <div class="section-line">
          <strong>比價結果</strong>
          <button type="button" on:click={() => openUrl(priceResult?.matchedUrl || priceResult?.url)}>開啟商品</button>
        </div>
        <div class="price-result-card">
          <div>
            <h4>{priceResult?.title || (priceLoading ? '正在讀取即時資料...' : '尚未取得商品資料')}</h4>
            <p>來源：{priceResult?.source || '即時 API'}，更新：{formatDate(priceResult?.resolvedAt)}</p>
            {#if priceResult?.matchedTitle}<p>BigGo 配對：{priceResult.matchedTitle}</p>{/if}
          </div>
          <div class="price-number"><span>現在價格</span><strong>{formatMoney(priceSummary.current, priceResult?.currency || 'TWD')}</strong></div>
          {#if priceResult?.notice}<p class="tool-alert">{priceResult.notice}</p>{/if}
        </div>
        <div class="price-metrics">
          <div><span>現在價格</span><strong>{formatMoney(priceSummary.current, priceResult?.currency || 'TWD')}</strong></div>
          <div class="rose"><span>歷史最高</span><strong>{formatMoney(priceSummary.high, priceResult?.currency || 'TWD')}</strong></div>
          <div class="green"><span>歷史最低</span><strong>{formatMoney(priceSummary.low, priceResult?.currency || 'TWD')}</strong></div>
        </div>
        <div class="trend-panel">
          <div class="section-line">
            <div><p class="tool-eyebrow">PRICE TREND</p><strong>歷史價格趨勢</strong></div>
            <div class="trend-summary"><span>{priceSummary.count} 筆</span><span>即時來源</span></div>
          </div>
          <svg viewBox="0 0 720 180" role="img" aria-label="歷史價格趨勢"><polyline points={trendPoints(priceResult)} /></svg>
        </div>
      </div>
    </section>
  {:else if toolTab === 'phone'}
    <section class="tool-section theme-phone">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▯</span>
          <div>
            <h3>手機比價</h3>
            <p>即時抓地標網通與傑昇通信，合併同型號手機價格。</p>
          </div>
        </div>
        <p class="tool-meta">更新：{formatDate(mobileResult?.fetchedAt)}，結果 {mobileResult?.total || 0} 筆</p>
      </div>

      <div class="phone-search-grid">
        {#each ['iPhone 17', 'Samsung'] as keyword}
          <div class="phone-search-card">
            <div><strong>{keyword} 區塊</strong><span>即時查詢手機價格資料。</span></div>
            <div class="tool-search-line">
              <input value={keyword === 'Samsung A17' ? mobileQuery : keyword} on:input={(event) => (mobileQuery = event.currentTarget.value)} aria-label={`${keyword} 搜尋`} />
              <button class="tool-primary" type="button" disabled={mobileLoading} on:click={() => loadPhone(false, keyword === 'Samsung A17' ? mobileQuery : keyword)}>搜尋</button>
              <button type="button" disabled={mobileLoading} on:click={() => loadPhone(true, keyword === 'Samsung A17' ? mobileQuery : keyword)}>重新抓取</button>
            </div>
          </div>
        {/each}
      </div>

      {#if mobileError}<div class="tool-alert">{mobileError}</div>{/if}
      {#each mobileResult?.warnings || [] as warning}<div class="tool-alert">{warning}</div>{/each}

      <div class="landtop-chart">
        <div class="section-line"><div><p class="tool-eyebrow">LANDTOP CHART</p><strong>地標網通 vs 傑昇通信</strong></div><span>{phoneChartItems.length} 筆</span></div>
        {#each phoneChartItems as item}
          <div class="bar-row">
            <div><strong>{item.name}</strong><span>{item.brand}</span></div>
            <span>地標</span><div class="bar-track"><i style={`width:${phoneBar(item.landtopPrice)}%`}></i></div><strong>{formatMoney(item.landtopPrice)}</strong>
            <span>傑昇</span><div class="bar-track purple"><i style={`width:${phoneBar(item.jyesPrice)}%`}></i></div><strong>{formatMoney(item.jyesPrice)}</strong>
          </div>
        {/each}
        {#if mobileLoading}<div class="empty-phone">正在讀取手機價格...</div>{/if}
      </div>

      <div class="phone-product-section">
        <div class="section-line"><strong>手機比價結果</strong><span>{mobileResult?.products.length || 0} 筆</span></div>
        <div class="phone-results">
          {#each (mobileResult?.products || []).slice(0, 20) as item}
            {@const best = bestPhonePrice(item)}
            <article>
              <div><h4>{item.name}</h4><p>{item.brand}</p></div>
              <div class="phone-price-pills">
                <span>建議售價 <strong>{formatMoney(item.suggestedPrice)}</strong></span>
                <span>地標網通 <strong>{item.landtopPriceLabel || formatMoney(item.landtopPrice)}</strong></span>
                <span>傑昇通信 <strong>{item.jyesPriceLabel || formatMoney(item.jyesPrice)}</strong></span>
                <span>最低價 <strong>{formatMoney(best.price)} ({best.source})</strong></span>
              </div>
            </article>
          {/each}
          {#if !mobileLoading && !(mobileResult?.products || []).length}<div class="empty-phone">目前沒有符合關鍵字的即時結果。</div>{/if}
        </div>
      </div>
    </section>
  {:else if toolTab === 'tube'}
    <section class="tool-section theme-tube">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▷</span>
          <div><p class="tool-eyebrow">FENGBRO TUBE</p><h3>鋒兄Tube</h3><p>即時讀取 YouTube RSS feed，整理三天內新影片與每個頻道最新影片。</p></div>
        </div>
        <div class="tool-actions">
          <span class="tool-badge">更新：{formatDate(tubeResult?.fetchedAt)}</span>
          <span class="tool-badge">頻道：{tubeResult?.sourceCount || tubeChannels.length}</span>
          <button class="tool-primary" type="button" disabled={tubeLoading} on:click={loadTube}>{tubeLoading ? '讀取中...' : '重新整理'}</button>
        </div>
      </div>

      <div class="tool-query-box">
        <input bind:value={tubeAliasDraft} placeholder="頻道別名" />
        <input bind:value={tubeUrlDraft} placeholder="@handle 或 YouTube 頻道網址" />
        <button class="tool-primary" type="button" on:click={addTubeChannel}>加入頻道</button>
        <button type="button" on:click={() => ((tubeChannels = [...defaultChannels]), (tubeLoadedOnce = false), (tubeResult = null))}>還原預設</button>
      </div>

      {#if tubeError}<div class="tool-alert">{tubeError}</div>{/if}
      {#if tubeLoading}<div class="empty-phone">正在讀取 YouTube feed...</div>{/if}

      <div class="recent-video-panel">
        <div class="section-line"><strong>3 天內新影片：{tubeResult?.recentVideos.length || 0} 部</strong></div>
        <div class="recent-video-grid">
          {#each (tubeResult?.recentVideos || []).slice(0, 8) as video}
            <article><strong>{video.title}</strong><span>{video.channelTitle} / {formatDate(video.publishedAt)}</span></article>
          {/each}
          {#if !tubeLoading && !(tubeResult?.recentVideos || []).length}<article><strong>目前沒有三天內新影片</strong><span>可按重新整理更新。</span></article>{/if}
        </div>
      </div>

      {#each (tubeResult?.channels || []).slice(0, 6) as channel}
        <div class="tube-channel-section">
          <div class="section-line">
            <div><h4>{channel.title}</h4><button type="button" on:click={() => openUrl(channel.sourceUrl)}>開啟頻道</button></div>
            <span>{channel.videos.length} 部影片</span>
          </div>
          {#if channel.error}<div class="tool-alert">{channel.error}</div>{/if}
          <div class="tube-video-grid">
            {#each channel.videos.slice(0, 10) as video}
              <a href={video.url} target="_blank" rel="noreferrer"><img src={video.thumbnail} alt={video.title} loading="lazy" /><div><strong>{video.title}</strong><span>{formatDate(video.publishedAt)}</span></div></a>
            {/each}
          </div>
        </div>
      {/each}
    </section>
  {:else}
    <section class="tool-section theme-finance">
      <div class="tool-hero">
        <div class="tool-identity">
          <span class="tool-icon">▥</span>
          <div><p class="tool-eyebrow">FENGBRO FINANCE</p><h3>鋒兄金融</h3><p>即時讀取 Yahoo Finance 與 Multpl，整理台股、美股、匯率、商品與 Shiller PE。</p></div>
        </div>
        <div class="tool-actions"><span class="tool-badge">更新：{formatDate(financeResult?.fetchedAt)}</span><button class="tool-primary" type="button" disabled={financeLoading} on:click={loadFinance}>{financeLoading ? '讀取中...' : '重新整理'}</button></div>
      </div>

      {#if financeError}<div class="tool-alert">{financeError}</div>{/if}
      {#each financeResult?.financeAlerts || [] as alert}<div class="tool-alert">{alert.message}</div>{/each}
      {#if financeLoading}<div class="empty-phone">正在讀取即時金融報價...</div>{/if}

      {#if shillerQuote}
        <div class="finance-hero">
          <div class="tool-identity"><span class="tool-icon">▥</span><div><h4>{shillerQuote.name}</h4><p>Max: {formatNumber(shillerQuote.high52)} ({financeResult?.shillerPe.recordHighDate}) / {formatDate(shillerQuote.lastUpdated)}</p></div></div>
          <div><span>CURRENT</span><strong>{formatNumber(shillerQuote.price)}</strong><button type="button" on:click={() => openUrl(shillerQuote.sourceUrl)}>multpl.com</button></div>
        </div>
      {/if}

      <div class="finance-groups">
        {#each groupedQuotes as group}
          <section>
            <div class="section-line"><h4>{group.label}</h4><span>{group.quotes.length} 項</span></div>
            <div class="quote-grid">
              {#each group.quotes as quote}
                <article class="quote-card">
                  <div class="section-line"><div><h4>{quote.name}</h4><p>{quote.symbol}</p></div><button type="button" on:click={() => openUrl(quote.sourceUrl)}>{quote.provider}</button></div>
                  <span>最新價</span>
                  <strong>{formatNumber(quote.price, quote.group === 'rates' ? 3 : 2)} <small>{quote.currency || ''}</small></strong>
                  <em class:down={(quote.changePercent || 0) < 0}>{quote.change && quote.change > 0 ? '+' : ''}{formatNumber(quote.change)}<br />{quote.changePercent && quote.changePercent > 0 ? '+' : ''}{formatNumber(quote.changePercent)}%</em>
                  <div class="range-pair"><span>52W High <strong>{formatNumber(quote.high52)}</strong></span><span>52W Low <strong>{formatNumber(quote.low52)}</strong></span></div>
                  <div class="range"><span style={`width:${quotePosition(quote)}%`}></span></div>
                  {#if quote.recordNote}<p class="record-note">{quote.recordNote}</p>{/if}
                  {#if quote.error}<p class="tool-alert">{quote.error}</p>{/if}
                </article>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    </section>
  {/if}
</section>
