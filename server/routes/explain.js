import { Router } from 'express';
import { generateExplanation } from '../utils/ai.js';

const router = Router();

/**
 * POST /api/explain
 * Body: { gamma, riskLabel, portfolio, expectedReturn, volatility }
 * Returns { explanation: string }
 */
router.post('/', async (req, res) => {
  try {
    const { gamma, riskLabel, portfolio, expectedReturn, volatility } = req.body;

    if (!gamma || !riskLabel || !portfolio) {
      return res.status(400).json({ error: 'Missing required fields: gamma, riskLabel, portfolio' });
    }

    const explanation = await generateExplanation({
      gamma,
      riskLabel,
      portfolio,
      expectedReturn,
      volatility,
    });

    res.json({ explanation });
  } catch (err) {
    console.error('Explanation error:', err);
    res.status(500).json({ error: 'Failed to generate explanation: ' + err.message });
  }
});

export default router;
