/**
 * Polygon.io API client for fetching historical price data.
 * Uses in-memory cache with 1-hour TTL to respect free tier rate limits (5 calls/min).
 */

const POLYGON_BASE = 'https://api.polygon.io';

// In-memory cache: { key: { data, timestamp } }
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch daily closing prices for a ticker over the past year.
 * Returns array of { date, close } objects sorted by date ascending.
 */
export async function fetchHistoricalPrices(ticker) {
  const cacheKey = `prices:${ticker}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) throw new Error('POLYGON_API_KEY not set');

  // 1 year of daily bars
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const url = `${POLYGON_BASE}/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=5000&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polygon API error for ${ticker}: ${res.status} ${text}`);
  }

  const json = await res.json();
  const results = (json.results || []).map(bar => ({
    date: new Date(bar.t).toISOString().split('T')[0],
    close: bar.c,
  }));

  setCache(cacheKey, results);
  return results;
}

/**
 * Fetch prices for all tickers, with rate-limit-friendly sequential fetching.
 * Free tier: 5 calls/min, so we add a 300ms delay between calls.
 */
export async function fetchAllPrices(tickers) {
  const cacheKey = 'allPrices';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const allData = {};
  for (const ticker of tickers) {
    try {
      allData[ticker] = await fetchHistoricalPrices(ticker);
      // Rate limit: wait 300ms between calls
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.warn(`Failed to fetch ${ticker}: ${err.message}`);
      // Skip tickers that fail — don't block the whole request
    }
  }

  setCache(cacheKey, allData);
  return allData;
}
