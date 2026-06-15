import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type TubeInput = {
  alias?: string;
  sourceUrl?: string;
  url?: string;
};

const DEFAULT_CHANNELS: TubeInput[] = [
  { alias: '吉利小辣妹', sourceUrl: 'https://www.youtube.com/@jilixiaoshimei/videos' },
  { alias: '一個狠人', sourceUrl: 'https://www.youtube.com/@henren778/videos' },
  { alias: 'Sun Channel', sourceUrl: 'https://www.youtube.com/@SunChannelHK/videos' },
  { alias: '曹操觀察', sourceUrl: 'https://www.youtube.com/@libertas1984/videos' },
  { alias: '馬司庫', sourceUrl: 'https://www.youtube.com/@ma-siku/videos' },
  { alias: '故事人', sourceUrl: 'https://www.youtube.com/@StorytellerHK/videos' }
];

const YOUTUBE_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};
const REQUEST_TIMEOUT_MS = 15000;

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function pick(text: string, pattern: RegExp) {
  return decodeHtml(pattern.exec(text)?.[1] || '');
}

function normalizeSource(input: string) {
  const value = input.trim();
  if (!value) return '';
  if (value.startsWith('@')) return `https://www.youtube.com/${encodeURI(value)}/videos`;
  if (!/^https?:\/\//i.test(value)) return `https://www.youtube.com/@${encodeURIComponent(value)}/videos`;
  const url = new URL(value);
  if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return '';
  return url.toString().replace(/\/$/, '').replace(/\/videos$/i, '/videos');
}

function normalizeChannels(inputs: unknown) {
  const raw = Array.isArray(inputs) ? inputs : DEFAULT_CHANNELS;
  const seen = new Set<string>();
  const channels: Array<{ alias: string; sourceUrl: string }> = [];

  for (const input of raw) {
    const item = typeof input === 'string' ? { sourceUrl: input } : (input || {}) as TubeInput;
    const sourceUrl = normalizeSource(String(item.sourceUrl || item.url || ''));
    if (!sourceUrl || seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);
    channels.push({ alias: String(item.alias || '').trim(), sourceUrl });
  }

  return channels.length ? channels : DEFAULT_CHANNELS.map((item) => ({ alias: item.alias || '', sourceUrl: item.sourceUrl || '' }));
}

function fallbackTitle(sourceUrl: string) {
  try {
    return decodeURIComponent(new URL(sourceUrl).pathname).replace(/^\/@?/, '').replace(/\/videos\/?$/i, '') || sourceUrl;
  } catch {
    return sourceUrl;
  }
}

async function resolveChannelId(sourceUrl: string) {
  const response = await fetch(sourceUrl.replace(/\/videos\/?$/i, ''), {
    headers: YOUTUBE_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`YouTube channel page HTTP ${response.status}`);
  const html = await response.text();
  const channelId =
    pick(html, /"channelId"\s*:\s*"([^"]+)"/) ||
    pick(html, /"externalId"\s*:\s*"([^"]+)"/) ||
    pick(html, /youtube\.com\/channel\/(UC[\w-]+)/);
  if (!channelId) throw new Error('找不到 YouTube channel id');
  const title = pick(html, /<meta property="og:title" content="([^"]+)"/) || pick(html, /<title>(.*?)<\/title>/);
  return { channelId, title: title.replace(/ - YouTube$/i, '') || fallbackTitle(sourceUrl) };
}

function parseFeed(xml: string) {
  const feedTitle = pick(xml, /<title>(.*?)<\/title>/);
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const entry = match[1];
    const videoId = pick(entry, /<yt:videoId>(.*?)<\/yt:videoId>/);
    const title = pick(entry, /<title>(.*?)<\/title>/);
    return {
      videoId,
      title,
      url: pick(entry, /<link[^>]+href="([^"]+)"/) || `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: pick(entry, /<published>(.*?)<\/published>/),
      updatedAt: pick(entry, /<updated>(.*?)<\/updated>/),
      thumbnail: pick(entry, /<media:thumbnail[^>]+url="([^"]+)"/) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  });
  return { feedTitle, videos };
}

async function fetchChannel(channel: { alias: string; sourceUrl: string }) {
  const { channelId, title } = await resolveChannelId(channel.sourceUrl);
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const response = await fetch(feedUrl, {
    headers: YOUTUBE_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`YouTube feed HTTP ${response.status}`);
  const { feedTitle, videos } = parseFeed(await response.text());
  const displayTitle = channel.alias || feedTitle || title || fallbackTitle(channel.sourceUrl);
  return {
    sourceUrl: channel.sourceUrl,
    channelId,
    title: displayTitle,
    videos: videos.slice(0, 10).map((video) => ({ ...video, channelTitle: displayTitle }))
  };
}

async function buildResult(inputs: unknown) {
  const channelInputs = normalizeChannels(inputs);
  const settled = await Promise.allSettled(channelInputs.map(fetchChannel));
  const channels = settled.map((item, index) => {
    if (item.status === 'fulfilled') return item.value;
    const source = channelInputs[index];
    return {
      sourceUrl: source.sourceUrl,
      channelId: '',
      title: source.alias || fallbackTitle(source.sourceUrl),
      videos: [],
      error: item.reason instanceof Error ? item.reason.message : '讀取失敗'
    };
  });

  const now = Date.now();
  const recentVideos = channels
    .flatMap((channel) =>
      channel.videos
        .filter((video) => {
          const time = new Date(video.publishedAt || video.updatedAt).getTime();
          return Number.isFinite(time) && now - time <= 3 * 24 * 60 * 60 * 1000;
        })
        .map((video) => ({ ...video, channelTitle: channel.title, channelId: channel.channelId }))
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    fetchedAt: new Date().toISOString(),
    sourceCount: channelInputs.length,
    defaultSourceCount: DEFAULT_CHANNELS.length,
    channels,
    recentVideos
  };
}

export const GET: RequestHandler = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  return json(await buildResult(DEFAULT_CHANNELS));
};

export const POST: RequestHandler = async ({ request, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  try {
    const body = await request.json();
    return json(await buildResult(body.channels || body.sources || DEFAULT_CHANNELS));
  } catch {
    return json(await buildResult(DEFAULT_CHANNELS));
  }
};
