import { Router } from 'express';
import { fetchAllPrices } from '../utils/polygon.js';
import { runOptimization } from '../utils/portfolio.js';

const router = Router();

const ASSET_UNIVERSE = [
  'SPY', 'QQQ', 'IWM', 'VTI',
  'EFA', 'EEM',
  'BND', 'TLT', 'IEF', 'SHY', 'AGG', 'LQD',
  'VNQ',
  'GLD', 'SLV', 'DBC',
  'XLK', 'XLF', 'XLE', 'XLV',
];

/**
 * POST /api/optimize
 * Body: { gamma: number }
 * Returns optimized portfolio, expected return, volatility, EU, and template comparisons.
 */
router.post('/', async (req, res) => {
  try {
    const { gamma } = req.body;
    if (typeof gamma !== 'number' || gamma <= 0) {
      return res.status(400).json({ error: 'gamma must be a positive number' });
    }

    // Fetch market data (cached after first call)
    const priceData = await fetchAllPrices(ASSET_UNIVERSE);

    // Run optimization
    const result = runOptimization(priceData, ASSET_UNIVERSE, gamma);

    res.json(result);
  } catch (err) {
    console.error('Optimization error:', err);
    res.status(500).json({ error: 'Portfolio optimization failed: ' + err.message });
  }
});

export default router;
