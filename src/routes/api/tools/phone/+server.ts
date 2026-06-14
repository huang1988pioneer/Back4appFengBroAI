import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';

type CompareProduct = {
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

const LANDTOP_SOURCES = [
  'https://www.landtop.com.tw/brands?brand=samsung',
  'https://www.landtop.com.tw/brands?brand=apple',
  'https://www.landtop.com.tw/products/apple-iphone-17',
  'https://www.landtop.com.tw/products/samsung-s26-ceab4a58-8c4f-4b86-9fbc-9bc3211457a9'
];

const JYES_URL = 'https://www.jyes.com.tw/product.php';

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripTags(value: string) {
  return normalizeSpace(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  );
}

function parsePrice(value: string | undefined | null) {
  const raw = String(value || '').replace(/[^\d]/g, '');
  return raw ? Number(raw) : null;
}

function createProductId(brand: string, name: string) {
  return `${brand}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function normalizeName(value: string) {
  return normalizeSpace(value.replace(/\b(\d{3,4})G\b/gi, '$1GB').replace(/[()/]/g, ' ')).toLowerCase();
}

function matchesQuery(product: CompareProduct, query: string) {
  const tokens = normalizeName(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const haystack = normalizeName(`${product.brand} ${product.name}`);
  return tokens.every((token) => haystack.includes(token));
}

async function fetchText(url: string, refresh: boolean, referer?: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,text/plain,*/*',
      'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
      ...(referer ? { referer } : {})
    },
    cache: refresh ? 'no-store' : 'force-cache'
  });
  if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
  return response.text();
}

function parseLandtopProducts(html: string, sourceUrl: string) {
  const products = new Map<string, CompareProduct>();
  const brand = sourceUrl.includes('apple') ? 'apple' : 'samsung';
  const directProductName =
    stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '')
      .replace(/\s*-\s*地標網通.*$/i, '')
      .replace(/\s*-\s*LANDTOP.*$/i, '') || '';

  if (/iphone|samsung|apple/i.test(directProductName)) {
    const suggestedPrice =
      parsePrice(html.match(/text-strikethrough[^>]*>([\s\S]*?)<\/div>/i)?.[1]) ||
      parsePrice(html.match(/建議售價[\s\S]{0,120}?([\d,]+)/)?.[1]);
    const landtopPrice =
      parsePrice(html.match(/discount-price[^>]*>([\s\S]*?)<\/div>/i)?.[1]) ||
      parsePrice(html.match(/地標(?:優惠)?價[\s\S]{0,120}?([\d,]+)/)?.[1]);
    const item = {
      id: createProductId(brand, directProductName),
      brand,
      name: directProductName,
      suggestedPrice,
      landtopPrice,
      landtopPriceLabel: landtopPrice == null ? '未取得' : `NT$ ${landtopPrice.toLocaleString('zh-TW')}`,
      sourceUrl
    };
    products.set(item.id, item);
  }

  const cardPattern =
    /<a[^>]+href="(\/products\/[^"]+)"[\s\S]{0,1800}?(?:<h3[^>]*>|<div class="product-name[^"]*">|<img[^>]+alt=")([\s\S]*?)(?:<\/h3>|<\/div>|")/gi;
  for (const match of html.matchAll(cardPattern)) {
    const name = stripTags(match[2]);
    if (!/^(iPhone|Apple|Samsung)/i.test(name)) continue;
    const chunk = html.slice(match.index || 0, (match.index || 0) + 2400);
    const suggestedPrice = parsePrice(chunk.match(/建議售價[\s\S]{0,120}?(\$?\s*[\d,]+)/i)?.[1]);
    const landtopPrice = parsePrice(chunk.match(/地標(?:優惠)?價[\s\S]{0,120}?(\$?\s*[\d,]+)/i)?.[1]);
    const id = createProductId(brand, name);
    products.set(id, {
      id,
      brand,
      name,
      suggestedPrice,
      landtopPrice,
      landtopPriceLabel: landtopPrice == null ? '未取得' : `NT$ ${landtopPrice.toLocaleString('zh-TW')}`,
      sourceUrl: new URL(match[1], 'https://www.landtop.com.tw').toString()
    });
  }

  return Array.from(products.values());
}

function parseJyesProducts(text: string) {
  const products = new Map<string, CompareProduct>();
  const rowPattern = /^([^\t\n]+?)(?:\n[^\t\n]+)*\n?\t([^\t\n]+)\t([^\t\n]+)\t([^\t\n]+)\t[^\t\n]+$/gm;
  for (const match of text.matchAll(rowPattern)) {
    const name = normalizeSpace(match[1])
      .replace(/^三星/i, 'Samsung')
      .replace(/^蘋果/i, 'Apple')
      .replace(/\b(\d{3,4})G\b/gi, '$1GB');
    const brand = /iphone|apple/i.test(name) ? 'apple' : /samsung/i.test(name) ? 'samsung' : '';
    if (!brand) continue;
    const jyesPrice = parsePrice(match[4]);
    const id = `jyes-${createProductId(brand, name)}`;
    products.set(id, {
      id,
      brand,
      name,
      suggestedPrice: parsePrice(match[2]),
      jyesPrice,
      jyesPriceLabel: jyesPrice == null ? '未取得' : `NT$ ${jyesPrice.toLocaleString('zh-TW')}`,
      jyesUrl: `https://www.jyes.com.tw/product/${encodeURIComponent(name.replace(/\s+/g, '-'))}`
    });
  }
  return Array.from(products.values());
}

function mergeProducts(landtop: CompareProduct[], jyes: CompareProduct[]) {
  const jyesByName = new Map(jyes.map((item) => [normalizeName(item.name), item]));
  const merged = landtop.map((item) => {
    const jyesMatch = jyesByName.get(normalizeName(item.name));
    const landtopPrice = typeof item.landtopPrice === 'number' ? item.landtopPrice : null;
    const jyesPrice = typeof jyesMatch?.jyesPrice === 'number' ? jyesMatch.jyesPrice : null;
    const bestPrice = [landtopPrice, jyesPrice].filter((value): value is number => typeof value === 'number').sort((a, b) => a - b)[0] || null;
    return {
      ...item,
      jyesPrice,
      jyesPriceLabel: jyesMatch?.jyesPriceLabel || '未取得',
      jyesUrl: jyesMatch?.jyesUrl || null,
      bestPrice,
      bestSourceLabel: bestPrice == null ? null : bestPrice === landtopPrice ? '地標網通' : '傑昇通信'
    };
  });
  const known = new Set(merged.map((item) => normalizeName(item.name)));
  return [
    ...merged,
    ...jyes
      .filter((item) => !known.has(normalizeName(item.name)))
      .map((item) => ({
        ...item,
        landtopPrice: null,
        landtopPriceLabel: '未取得',
        bestPrice: item.jyesPrice ?? null,
        bestSourceLabel: item.jyesPrice ? '傑昇通信' : null
      }))
  ];
}

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('query') || '';
  const refresh = url.searchParams.get('refresh') === '1';
  const warnings: string[] = [];

  try {
    const landtopGroups = await Promise.allSettled(
      LANDTOP_SOURCES.map(async (sourceUrl) => parseLandtopProducts(await fetchText(sourceUrl, refresh, 'https://www.landtop.com.tw/'), sourceUrl))
    );
    const landtop = landtopGroups.flatMap((item, index) => {
      if (item.status === 'fulfilled') return item.value;
      warnings.push(`地標網通來源 ${index + 1} 讀取失敗：${item.reason instanceof Error ? item.reason.message : 'unknown'}`);
      return [];
    });

    let jyes: CompareProduct[] = [];
    try {
      jyes = parseJyesProducts(await fetchText(JYES_URL, refresh, 'https://www.jyes.com.tw/'));
    } catch (error) {
      warnings.push(`傑昇通信讀取失敗：${error instanceof Error ? error.message : 'unknown'}`);
    }

    const products = mergeProducts(landtop, jyes)
      .filter((item) => matchesQuery(item, query))
      .sort((a, b) => (a.bestPrice ?? a.landtopPrice ?? a.jyesPrice ?? Number.MAX_SAFE_INTEGER) - (b.bestPrice ?? b.landtopPrice ?? b.jyesPrice ?? Number.MAX_SAFE_INTEGER));

    return json({
      source: '地標網通 / 傑昇通信',
      query,
      total: products.length,
      fetchedAt: new Date().toISOString(),
      products,
      warnings,
      sourceUrls: [...LANDTOP_SOURCES, 'https://www.jyes.com.tw/product.php'],
      historyAvailable: false
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'phone compare failed' }, { status: 500 });
  }
};
