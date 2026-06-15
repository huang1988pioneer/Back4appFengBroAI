import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';
const REQUEST_TIMEOUT_MS = 15000;

type PricePoint = {
  date: string;
  price: number | null;
  currency: string;
};

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function pickNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['Price', 'price', 'P', 'M', 'salePrice']) {
      const nested: number | null = pickNumber(record[key]);
      if (nested != null) return nested;
    }
  }
  return null;
}

function extractProductCode(url: string) {
  const parsed = new URL(url);
  if (parsed.hostname.includes('momoshop.com.tw')) return parsed.searchParams.get('i_code') || 'product';
  return parsed.pathname.split('/').filter(Boolean).at(-1) || 'product';
}

function getStoreLabel(url: string) {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes('pchome')) return 'PChome';
  if (host.includes('momo')) return 'momo';
  return host;
}

async function fetchWithBrowserHeaders(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/json,text/html,text/plain,*/*',
      'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
      ...(init.headers || {})
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
  return response;
}

async function resolvePchome(url: string) {
  const code = extractProductCode(url);
  const fields = 'Id,Name,Nick,Price,Url';
  const endpoint = `https://ecapi-cdn.pchome.com.tw/ecshop/prodapi/v2/prod/button&id=${encodeURIComponent(
    code
  )}&fields=${fields}`;
  const payload = await fetchWithBrowserHeaders(endpoint, { headers: { referer: 'https://24h.pchome.com.tw/' } }).then((r) =>
    r.json()
  );
  const record =
    Array.isArray(payload) ? payload[0] : payload && typeof payload === 'object' ? Object.values(payload)[0] : null;
  const item = (record || {}) as Record<string, unknown>;
  return {
    title: normalizeSpace(String(item.Name || item.Nick || `${getStoreLabel(url)} 商品 ${code}`)),
    currentPrice: pickNumber(item.Price),
    code
  };
}

async function resolveSourceMeta(url: string) {
  if (new URL(url).hostname.includes('pchome.com.tw')) return resolvePchome(url);

  const html = await fetchWithBrowserHeaders(url).then((r) => r.text());
  const title =
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] ||
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ||
    `${getStoreLabel(url)} 商品 ${extractProductCode(url)}`;
  const price =
    html.match(/<meta\s+property="product:price:amount"\s+content="([^"]+)"/i)?.[1] ||
    html.match(/"price"\s*:\s*"?([\d,]+)"?/i)?.[1] ||
    '';
  return {
    title: normalizeSpace(title.replace(/<[^>]+>/g, '')),
    currentPrice: pickNumber(price),
    code: extractProductCode(url)
  };
}

function parseBigGoCandidates(html: string) {
  const decoded = html.replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '"');
  const pattern =
    /"history_id":"([^"]+)"[\s\S]{0,1200}?"title":"([^"]+)"[\s\S]{0,1200}?"purl":"(https?:\/\/[^"]+)"[\s\S]{0,1200}?"price":(\d+|null)/g;
  return [...decoded.matchAll(pattern)].map((match) => ({
    historyId: match[1],
    title: normalizeSpace(match[2]),
    url: normalizeSpace(match[3]),
    price: match[4] === 'null' ? null : Number(match[4])
  }));
}

function toDateString(timestampMs: number) {
  return new Date(timestampMs).toISOString().slice(0, 10);
}

async function fetchBigGoHistory(sourceUrl: string, title: string, currentPrice: number | null, days: number) {
  const query = title || extractProductCode(sourceUrl);
  const searchUrl = `https://biggo.com.tw/s/${encodeURIComponent(query)}/`;
  const searchHtml = await fetchWithBrowserHeaders(searchUrl, { headers: { referer: 'https://biggo.com.tw/' } }).then((r) =>
    r.text()
  );
  const candidates = parseBigGoCandidates(searchHtml);
  const match =
    candidates.find((item) => item.url.includes(extractProductCode(sourceUrl))) ||
    candidates.find((item) => currentPrice != null && item.price === currentPrice) ||
    candidates[0];

  if (!match?.historyId) return { matchedTitle: '', matchedUrl: '', history: [] as PricePoint[] };

  const historyPayload = await fetchWithBrowserHeaders('https://biggo.com.tw/api/v1/spa/product/history', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      referer: searchUrl,
      region: 'tw'
    },
    body: JSON.stringify({ history_id: match.historyId, days })
  }).then((r) => r.json());

  const rawHistory = Array.isArray(historyPayload.price_history) ? historyPayload.price_history : [];
  const history = rawHistory.map((point: { x: number; y: number }) => ({
    date: toDateString(point.x),
    price: Number.isFinite(point.y) ? point.y : null,
    currency: 'TWD'
  }));
  return { matchedTitle: match.title, matchedUrl: match.url, history };
}

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get('url') || '';
  const source = url.searchParams.get('source') || 'biggo-api';
  const days = Number(url.searchParams.get('days') || '3650');

  if (!targetUrl) return json({ error: 'missing url' }, { status: 400 });

  try {
    const meta = await resolveSourceMeta(targetUrl);
    let history: PricePoint[] = [];
    let matchedTitle = '';
    let matchedUrl = '';
    let notice = '';

    if (source === 'biggo-api') {
      try {
        const biggo = await fetchBigGoHistory(targetUrl, meta.title, meta.currentPrice, Number.isFinite(days) ? days : 3650);
        history = biggo.history;
        matchedTitle = biggo.matchedTitle;
        matchedUrl = biggo.matchedUrl;
      } catch (error) {
        notice = error instanceof Error ? `BigGo 即時歷史價格暫時不可用：${error.message}` : 'BigGo 即時歷史價格暫時不可用';
      }
    }

    if (!history.length && meta.currentPrice != null) {
      history = [{ date: toDateString(Date.now()), price: meta.currentPrice, currency: 'TWD' }];
    }

    return json({
      url: targetUrl,
      title: meta.title,
      source: source === 'biggo-api' ? 'PChome / BigGo API' : '商品頁即時解析',
      currency: 'TWD',
      currentPrice: meta.currentPrice,
      history,
      matchedTitle,
      matchedUrl,
      notice,
      resolvedAt: new Date().toISOString()
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'price resolve failed' }, { status: 500 });
  }
};
