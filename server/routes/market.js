import { Router } from 'express';
import { fetchAllPrices } from '../utils/polygon.js';

const router = Router();

// The curated ETF universe
const ASSET_UNIVERSE = [
  'SPY', 'QQQ', 'IWM', 'VTI',   // US Equity
  'EFA', 'EEM',                    // International
  'BND', 'TLT', 'IEF', 'SHY', 'AGG', 'LQD', // Bonds
  'VNQ',                           // Real Estate
  'GLD', 'SLV', 'DBC',           // Commodities
  'XLK', 'XLF', 'XLE', 'XLV',   // Sectors
];

/**
 * GET /api/market
 * Fetches 1 year of daily prices for all assets in the universe.
 * Returns { [ticker]: [{ date, close }, ...] }
 */
router.get('/', async (_req, res) => {
  try {
    const data = await fetchAllPrices(ASSET_UNIVERSE);
    res.json({ tickers: Object.keys(data), data });
  } catch (err) {
    console.error('Market data error:', err);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

export default router;
