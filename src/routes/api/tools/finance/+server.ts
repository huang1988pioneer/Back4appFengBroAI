import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type FinanceGroup = 'tw' | 'us' | 'asia' | 'korea' | 'fx' | 'commodities' | 'crypto' | 'rates' | 'valuation';

type Instrument = {
  id: string;
  name: string;
  symbol: string;
  group: FinanceGroup;
  sourceUrl: string;
  currencyHint?: string;
  threshold?: number;
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';
const YAHOO_CHART_ENDPOINT = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SHILLER_PE_URL = 'https://www.multpl.com/shiller-pe';
const SHILLER_PE_RECORD_HIGH = 44.19;
const SHILLER_PE_RECORD_DATE = 'Dec 1999';

const INSTRUMENTS: Instrument[] = [
  { id: 'taiex', name: '加權指數', symbol: '^TWII', group: 'tw', sourceUrl: 'https://finance.yahoo.com/quote/%5ETWII', currencyHint: 'TWD' },
  { id: 'tsmc', name: '台積電', symbol: '2330.TW', group: 'tw', sourceUrl: 'https://finance.yahoo.com/quote/2330.TW', currencyHint: 'TWD' },
  { id: 'dow', name: 'Dow Jones Industrial Average', symbol: '^DJI', group: 'us', sourceUrl: 'https://finance.yahoo.com/quote/%5EDJI', currencyHint: 'USD' },
  { id: 'sp500', name: 'S&P 500 Index', symbol: '^GSPC', group: 'us', sourceUrl: 'https://finance.yahoo.com/quote/%5EGSPC', currencyHint: 'USD' },
  { id: 'nasdaq', name: 'NASDAQ Composite', symbol: '^IXIC', group: 'us', sourceUrl: 'https://finance.yahoo.com/quote/%5EIXIC', currencyHint: 'USD' },
  { id: 'vix', name: 'CBOE VIX', symbol: '^VIX', group: 'rates', sourceUrl: 'https://finance.yahoo.com/quote/%5EVIX' },
  { id: 'nikkei', name: 'Nikkei 225 Index', symbol: '^N225', group: 'asia', sourceUrl: 'https://finance.yahoo.com/quote/%5EN225', currencyHint: 'JPY' },
  { id: 'kospi', name: 'KOSPI Index', symbol: '^KS11', group: 'korea', sourceUrl: 'https://finance.yahoo.com/quote/%5EKS11', currencyHint: 'KRW' },
  { id: 'samsung-electronics', name: '三星電子', symbol: '005930.KS', group: 'korea', sourceUrl: 'https://finance.yahoo.com/quote/005930.KS', currencyHint: 'KRW' },
  { id: 'sk-hynix', name: 'SK 海力士', symbol: '000660.KS', group: 'korea', sourceUrl: 'https://finance.yahoo.com/quote/000660.KS', currencyHint: 'KRW' },
  { id: 'usd-twd', name: '美元兌新台幣', symbol: 'USDTWD=X', group: 'fx', sourceUrl: 'https://finance.yahoo.com/quote/USDTWD=X', currencyHint: 'TWD' },
  { id: 'usd-jpy', name: '美元兌日圓', symbol: 'USDJPY=X', group: 'fx', sourceUrl: 'https://finance.yahoo.com/quote/USDJPY=X', currencyHint: 'JPY' },
  { id: 'gold', name: 'Gold Futures', symbol: 'GC=F', group: 'commodities', sourceUrl: 'https://finance.yahoo.com/quote/GC=F', currencyHint: 'USD' },
  { id: 'brent', name: 'Brent Crude Oil', symbol: 'BZ=F', group: 'commodities', sourceUrl: 'https://finance.yahoo.com/quote/BZ=F', currencyHint: 'USD' },
  { id: 'bitcoin', name: 'Bitcoin USD', symbol: 'BTC-USD', group: 'crypto', sourceUrl: 'https://finance.yahoo.com/quote/BTC-USD', currencyHint: 'USD' },
  { id: 'ether', name: 'Ether USD', symbol: 'ETH-USD', group: 'crypto', sourceUrl: 'https://finance.yahoo.com/quote/ETH-USD', currencyHint: 'USD' }
];

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replace(/[$,%\s,]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumberList(value: unknown) {
  return Array.isArray(value) ? value.map(asNumber).filter((item): item is number => item != null) : [];
}

function pickText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function recordTag(price: number | null, high52: number | null, low52: number | null) {
  if (price != null && high52 != null && price >= high52) return 'new-high';
  if (price != null && low52 != null && price <= low52) return 'new-low';
  return null;
}

async function fetchYahoo(instrument: Instrument) {
  const params = new URLSearchParams({ range: '1y', interval: '1d', lang: 'zh-TW', region: 'TW' });
  const response = await fetch(`${YAHOO_CHART_ENDPOINT}/${encodeURIComponent(instrument.symbol)}?${params.toString()}`, {
    headers: {
      accept: 'application/json,text/plain,*/*',
      'user-agent': USER_AGENT
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Yahoo Finance ${response.status}`);
  const payload = await response.json();
  const chart = payload?.chart?.result?.[0];
  if (!chart) throw new Error('No Yahoo Finance chart data');

  const meta = (chart.meta || {}) as Record<string, unknown>;
  const quote = (chart.indicators?.quote?.[0] || {}) as Record<string, unknown>;
  const closes = toNumberList(quote.close);
  const highs = toNumberList(quote.high);
  const lows = toNumberList(quote.low);
  const price = asNumber(meta.regularMarketPrice) ?? closes.at(-1) ?? null;
  const previous = closes.length > 1 ? closes[closes.length - 2] : null;
  const change = price != null && previous != null ? price - previous : null;
  const changePercent = change != null && previous ? (change / previous) * 100 : null;
  const high52 = highs.length ? Math.max(...highs) : null;
  const low52 = lows.length ? Math.min(...lows) : null;
  const marketTime = asNumber(meta.regularMarketTime);

  return {
    ...instrument,
    displayName: pickText(meta, ['shortName', 'longName']) || instrument.name,
    price,
    change,
    changePercent,
    currency: pickText(meta, ['currency']) || instrument.currencyHint || '',
    high52,
    low52,
    lastUpdated: marketTime ? new Date(marketTime * 1000).toISOString() : new Date().toISOString(),
    provider: 'Yahoo',
    recordTag: recordTag(price, high52, low52),
    isThresholdAlert: typeof price === 'number' && typeof instrument.threshold === 'number' && price > instrument.threshold
  };
}

function textOnly(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstNumber(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match?.[1] ? asNumber(match[1]) : null;
}

async function fetchShillerPe() {
  const response = await fetch(SHILLER_PE_URL, {
    headers: { accept: 'text/html,text/plain,*/*', 'user-agent': USER_AGENT },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Multpl ${response.status}`);
  const text = textOnly(await response.text());
  const price =
    firstNumber(text, /Current\s+Shiller\s+PE\s+Ratio(?:\s+is)?\s*:?\s*([0-9]+(?:\.[0-9]+)?)/i) ??
    firstNumber(text, /\bShiller\s+PE\s+Ratio\s+([0-9]+(?:\.[0-9]+)?)/i);
  if (price == null) throw new Error('No Shiller PE data');

  return {
    id: 'shiller-pe',
    name: 'Shiller PE Ratio',
    displayName: 'Shiller PE Ratio',
    symbol: 'CAPE',
    group: 'valuation' as FinanceGroup,
    sourceUrl: SHILLER_PE_URL,
    price,
    change: null,
    changePercent: null,
    currency: '',
    high52: SHILLER_PE_RECORD_HIGH,
    low52: firstNumber(text, /Min:\s*([0-9]+(?:\.[0-9]+)?)/i),
    lastUpdated: new Date().toISOString(),
    provider: 'Multpl',
    recordTag: price > SHILLER_PE_RECORD_HIGH ? 'new-high' : null,
    recordNote: `Historical max ${SHILLER_PE_RECORD_HIGH} (${SHILLER_PE_RECORD_DATE})`,
    isThresholdAlert: price > 45
  };
}

export const GET: RequestHandler = async () => {
  const settled = await Promise.allSettled([...INSTRUMENTS.map(fetchYahoo), fetchShillerPe()]);
  const quotes = settled.map((item, index) => {
    if (item.status === 'fulfilled') return item.value;
    const fallback = index < INSTRUMENTS.length ? INSTRUMENTS[index] : {
      id: 'shiller-pe',
      name: 'Shiller PE Ratio',
      symbol: 'CAPE',
      group: 'valuation' as FinanceGroup,
      sourceUrl: SHILLER_PE_URL
    };
    return {
      ...fallback,
      displayName: fallback.name,
      price: null,
      change: null,
      changePercent: null,
      currency: fallback.currencyHint || '',
      high52: null,
      low52: null,
      lastUpdated: '',
      provider: fallback.id === 'shiller-pe' ? 'Multpl' : 'Yahoo',
      recordTag: null,
      error: item.reason instanceof Error ? item.reason.message : 'load failed'
    };
  });

  const financeAlerts = quotes
    .filter((quote) => 'isThresholdAlert' in quote && quote.isThresholdAlert)
    .map((quote) => ({
      id: quote.id,
      message: `${quote.name} 觸及警戒值：${quote.price ?? '-'}`,
      sourceUrl: quote.sourceUrl
    }));
  const shillerQuote = quotes.find((quote) => quote.id === 'shiller-pe');

  return json({
    fetchedAt: new Date().toISOString(),
    source: 'Yahoo Finance / Multpl',
    quotes,
    financeAlerts,
    shillerPe: {
      current: shillerQuote?.price ?? null,
      recordHigh: SHILLER_PE_RECORD_HIGH,
      recordHighDate: SHILLER_PE_RECORD_DATE,
      isRecordHigh: shillerQuote?.recordTag === 'new-high'
    }
  });
};
