/**
 * Portfolio math: returns computation, covariance matrix, expected utility optimization.
 *
 * Key formula:  EU = μ_p − 0.5 * γ * σ_p²
 *
 * We use a constrained mean-variance approach:
 * 1. Compute analytical unconstrained optimum: w* = (1/γ) * Σ⁻¹ * μ
 * 2. Project onto the simplex (weights ≥ 0, sum to 1)
 * 3. Refine with coordinate descent
 */

const TRADING_DAYS = 252;

/**
 * Compute daily log returns from closing prices.
 * @param {number[]} prices - Array of daily closing prices
 * @returns {number[]} Array of daily log returns (length = prices.length - 1)
 */
export function computeReturns(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  return returns;
}

/**
 * Compute annualized mean return and volatility from daily returns.
 */
export function computeStats(dailyReturns) {
  const n = dailyReturns.length;
  if (n === 0) return { mean: 0, vol: 0 };

  const mean = dailyReturns.reduce((s, r) => s + r, 0) / n;
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1);

  return {
    mean: mean * TRADING_DAYS,           // annualized mean
    vol: Math.sqrt(variance * TRADING_DAYS), // annualized volatility
  };
}

/**
 * Compute the NxN covariance matrix from a matrix of daily returns.
 * Each row of returnsMatrix is an array of daily returns for one asset.
 * @param {number[][]} returnsMatrix - N arrays of daily returns (same length)
 * @returns {number[][]} NxN annualized covariance matrix
 */
export function computeCovarianceMatrix(returnsMatrix) {
  const n = returnsMatrix.length;
  const T = returnsMatrix[0].length;

  // Compute means
  const means = returnsMatrix.map(
    returns => returns.reduce((s, r) => s + r, 0) / T
  );

  // Compute covariance
  const cov = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let t = 0; t < T; t++) {
        sum += (returnsMatrix[i][t] - means[i]) * (returnsMatrix[j][t] - means[j]);
      }
      const val = (sum / (T - 1)) * TRADING_DAYS; // annualize
      cov[i][j] = val;
      cov[j][i] = val;
    }
  }

  return cov;
}

/**
 * Invert a matrix using Gauss-Jordan elimination.
 * Works well for small matrices (N ≤ 20).
 * @param {number[][]} matrix - NxN matrix
 * @returns {number[][]} Inverse matrix
 */
export function invertMatrix(matrix) {
  const n = matrix.length;

  // Augment with identity
  const aug = matrix.map((row, i) => {
    const newRow = [...row];
    for (let j = 0; j < n; j++) {
      newRow.push(i === j ? 1 : 0);
    }
    return newRow;
  });

  // Forward elimination
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxVal = Math.abs(aug[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular matrix — add small regularization and retry
      for (let i = 0; i < n; i++) matrix[i][i] += 1e-8;
      return invertMatrix(matrix);
    }

    // Scale pivot row
    for (let j = 0; j < 2 * n; j++) {
      aug[col][j] /= pivot;
    }

    // Eliminate column
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Extract inverse
  return aug.map(row => row.slice(n));
}

/**
 * Compute portfolio expected return and variance.
 * @param {number[]} weights - Asset weights (sum to 1)
 * @param {number[]} means - Annualized mean returns per asset
 * @param {number[][]} covMatrix - Annualized NxN covariance matrix
 */
export function computePortfolioStats(weights, means, covMatrix) {
  const n = weights.length;

  // μ_p = w' * μ
  let mu = 0;
  for (let i = 0; i < n; i++) mu += weights[i] * means[i];

  // σ_p² = w' * Σ * w
  let variance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }

  return { mu, variance, vol: Math.sqrt(Math.max(0, variance)) };
}

/**
 * Compute expected utility: EU = μ − 0.5 * γ * σ²
 */
export function computeExpectedUtility(mu, variance, gamma) {
  return mu - 0.5 * gamma * variance;
}

/**
 * Project a weight vector onto the simplex (weights ≥ 0, sum to 1).
 * Uses the algorithm from "Efficient Projections onto the L1-Ball" (Duchi et al., 2008).
 */
function projectOntoSimplex(weights) {
  const n = weights.length;
  const sorted = [...weights].sort((a, b) => b - a);

  let cumSum = 0;
  let rho = 0;
  for (let j = 0; j < n; j++) {
    cumSum += sorted[j];
    if (sorted[j] - (cumSum - 1) / (j + 1) > 0) {
      rho = j + 1;
    }
  }

  const theta = (sorted.slice(0, rho).reduce((s, v) => s + v, 0) - 1) / rho;
  return weights.map(w => Math.max(0, w - theta));
}

/**
 * Map gamma (risk aversion) to target portfolio volatility.
 * Higher gamma = more risk averse = lower target volatility
 */
function gammaToTargetVolatility(gamma) {
  // gamma < 1.5: aggressive, target 18-22% vol
  // gamma 1.5-2.5: growth, target 13-18% vol  
  // gamma 2.5-3.5: balanced, target 9-13% vol
  // gamma > 3.5: conservative, target 5-9% vol
  if (gamma < 1.5) return 0.20;
  if (gamma < 2.0) return 0.16;
  if (gamma < 2.5) return 0.13;
  if (gamma < 3.0) return 0.11;
  if (gamma < 3.5) return 0.08;
  return 0.06;
}

/**
 * Optimize portfolio to match target risk level with maximum diversification.
 *
 * Strategy: Target a specific volatility based on gamma, then maximize return
 * subject to diversity constraints.
 *
 * @param {number[]} means - Annualized mean returns for each asset
 * @param {number[][]} covMatrix - NxN annualized covariance matrix
 * @param {number} gamma - Risk aversion coefficient
 * @returns {{ weights: number[], mu: number, variance: number, vol: number, eu: number }}
 */
export function optimizePortfolio(means, covMatrix, gamma) {
  const n = means.length;
  const targetVol = gammaToTargetVolatility(gamma);
  
  // Start with equal weights
  let weights = new Array(n).fill(1 / n);
  
  // Diversity and concentration constraints
  const minWeight = 0.04;  // Minimum 4% per position
  const maxWeight = 0.30;  // Maximum 30% in any single asset (reduced to force diversification)
  const minHoldings = Math.min(10, Math.floor(1 / minWeight)); // At least 10 holdings
  
  // Helper function to enforce weight constraints
  function enforceConstraints(w) {
    // Cap at max weight
    for (let i = 0; i < n; i++) {
      if (w[i] > maxWeight) {
        const excess = w[i] - maxWeight;
        w[i] = maxWeight;
        
        // Distribute excess proportionally to assets under the cap
        const underCap = w.map((wgt, idx) => idx).filter(idx => w[idx] < maxWeight);
        if (underCap.length > 0) {
          const totalUnder = underCap.reduce((sum, idx) => sum + w[idx], 0);
          underCap.forEach(idx => {
            const share = w[idx] / totalUnder;
            w[idx] += excess * share;
          });
        }
      }
    }
    
    // Normalize to sum to 1
    const sum = w.reduce((s, wgt) => s + wgt, 0);
    return w.map(wgt => wgt / sum);
  }
  
  // Apply initial constraints
  weights = enforceConstraints(weights);
  
  // Iterative optimization: maximize return while staying near target volatility
  const step = 0.01;
  const volTolerance = 0.02; // Allow ±2% deviation from target vol
  
  for (let iter = 0; iter < 100; iter++) {
    const stats = computePortfolioStats(weights, means, covMatrix);
    const currentVol = stats.vol;
    
    // Score: return - penalty for vol deviation
    const volPenalty = Math.abs(currentVol - targetVol) > volTolerance 
      ? 100 * (Math.abs(currentVol - targetVol) - volTolerance) ** 2 
      : 0;
    let bestScore = stats.mu - volPenalty;
    let improved = false;
    
    // Try all pairwise weight shifts
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (weights[i] < step) continue;
        
        // STRICT enforcement: never exceed maxWeight
        if (weights[j] >= maxWeight - 0.001) continue;
        
        const trial = [...weights];
        trial[i] -= step;
        trial[j] += step;
        
        // Double-check we didn't violate max weight
        if (trial[j] > maxWeight) continue;
        
        // Enforce minimum holdings
        const nonZero = trial.filter(w => w >= minWeight).length;
        if (nonZero < minHoldings && trial[i] < minWeight) continue;
        
        const trialStats = computePortfolioStats(trial, means, covMatrix);
        const trialVolPenalty = Math.abs(trialStats.vol - targetVol) > volTolerance
          ? 100 * (Math.abs(trialStats.vol - targetVol) - volTolerance) ** 2
          : 0;
        const trialScore = trialStats.mu - trialVolPenalty;
        
        if (trialScore > bestScore) {
          weights = trial;
          // Enforce constraints immediately after every change
          weights = enforceConstraints(weights);
          bestScore = trialScore;
          improved = true;
        }
      }
    }
    
    if (!improved) break;
  }
  
  // Final enforcement of constraints
  weights = enforceConstraints(weights);
  
  // Clean up: remove positions below minimum weight
  const numHoldings = weights.filter(w => w >= minWeight).length;
  if (numHoldings >= minHoldings) {
    const filtered = weights.map(w => w >= minWeight ? w : 0);
    const sum = filtered.reduce((s, w) => s + w, 0);
    if (sum > 0) {
      weights = filtered.map(w => w / sum);
      weights = enforceConstraints(weights); // Re-enforce after cleanup
    }
  }

  const stats = computePortfolioStats(weights, means, covMatrix);
  const eu = computeExpectedUtility(stats.mu, stats.variance, gamma);

  return { weights, mu: stats.mu, variance: stats.variance, vol: stats.vol, eu };
}

const BOND_TICKERS = ['BND', 'TLT', 'IEF', 'SHY', 'AGG', 'LQD', "bndx","scho","mbb","igib","scmb",
    "vteb","emlc","ebnd","pff","hylb",
    "qlta","jnk","vclt","govt","tipz"];
const EQUITY_TICKERS = ['SPY', 'QQQ', 'IWM', 'VTI', 'EFA', 'EEM', 'XLK', 'XLF', 'XLE', 'XLV', "voo","schx","vb","schg","vug","vtv",
    "vea","acwi","iemg","iefa",
    "dia","xlre","iyw","ihf","xly"];
const ALT_TICKERS = ['VNQ', 'GLD', 'SLV', 'DBC', "dbmf","ffut","qai",
    "alty","espo","esgu","tan",
    "bug","gdx","vde","lit","bjk"];

/**
 * Compute asset class breakdown (bonds / equity / alts) from holdings.
 * @param {{ ticker: string, weight: number }[]} holdings
 * @returns {{ bonds: number, equity: number, alts: number }}
 */
export function computeAssetClassBreakdown(holdings) {
  let bonds = 0, equity = 0, alts = 0;
  for (const { ticker, weight } of holdings) {
    if (BOND_TICKERS.includes(ticker)) bonds += weight;
    else if (EQUITY_TICKERS.includes(ticker)) equity += weight;
    else if (ALT_TICKERS.includes(ticker)) alts += weight;
  }
  return { bonds, equity, alts };
}

/**
 * Generate template portfolios for comparison / efficient frontier display.
 * Returns an array of { name, weights } objects.
 */
export function generateTemplatePortfolios(numAssets, assetNames) {
  const templates = [];

  // Equal weight
  const eqWeight = new Array(numAssets).fill(1 / numAssets);
  templates.push({ name: 'Equal Weight', weights: eqWeight });

  // Find indices by asset class
  const bondTickers = BOND_TICKERS;
  const equityTickers = EQUITY_TICKERS;
  const altTickers = ALT_TICKERS;

  const bondIdx = assetNames.map((name, i) => bondTickers.includes(name) ? i : -1).filter(i => i >= 0);
  const equityIdx = assetNames.map((name, i) => equityTickers.includes(name) ? i : -1).filter(i => i >= 0);
  const altIdx = assetNames.map((name, i) => altTickers.includes(name) ? i : -1).filter(i => i >= 0);

  // Conservative: 70% bonds, 20% equity, 10% alts
  const conservative = new Array(numAssets).fill(0);
  bondIdx.forEach(i => conservative[i] = 0.70 / bondIdx.length);
  equityIdx.forEach(i => conservative[i] = 0.20 / equityIdx.length);
  altIdx.forEach(i => conservative[i] = 0.10 / altIdx.length);
  templates.push({ name: 'Conservative', weights: conservative });

  // Balanced: 40% bonds, 50% equity, 10% alts
  const balanced = new Array(numAssets).fill(0);
  bondIdx.forEach(i => balanced[i] = 0.40 / bondIdx.length);
  equityIdx.forEach(i => balanced[i] = 0.50 / equityIdx.length);
  altIdx.forEach(i => balanced[i] = 0.10 / altIdx.length);
  templates.push({ name: 'Balanced', weights: balanced });

  // Aggressive: 10% bonds, 80% equity, 10% alts
  const aggressive = new Array(numAssets).fill(0);
  bondIdx.forEach(i => aggressive[i] = 0.10 / bondIdx.length);
  equityIdx.forEach(i => aggressive[i] = 0.80 / equityIdx.length);
  altIdx.forEach(i => aggressive[i] = 0.10 / altIdx.length);
  templates.push({ name: 'Aggressive', weights: aggressive });

  // All equity
  const allEquity = new Array(numAssets).fill(0);
  equityIdx.forEach(i => allEquity[i] = 1.0 / equityIdx.length);
  templates.push({ name: 'All Equity', weights: allEquity });

  // All bonds
  const allBonds = new Array(numAssets).fill(0);
  bondIdx.forEach(i => allBonds[i] = 1.0 / bondIdx.length);
  templates.push({ name: 'All Bonds', weights: allBonds });

  return templates;
}

/**
 * Full pipeline: from raw price data to optimized portfolio.
 */
export function runOptimization(marketData, tickers, gamma) {
  const { summary, covariance } = marketData;

  // Filter tickers to only those that exist in both summary and covariance data
  const validTickers = tickers.filter(ticker => 
    summary[ticker] && covariance.tickers.includes(ticker)
  );
  
  if (validTickers.length < 2) {
    throw new Error('Not enough valid ticker data for optimization');
  }

  const meanReturns = validTickers.map(ticker => summary[ticker].mean);

  // Extract the covariance submatrix for the valid tickers
  const tickerIndices = validTickers.map(ticker => 
    covariance.tickers.indexOf(ticker)
  );
  
  const covMatrix = tickerIndices.map(i => 
    tickerIndices.map(j => covariance.matrix[i][j])
  );
  
  // Optimize
  const optimal = optimizePortfolio(meanReturns, covMatrix, gamma);
  
  // ... rest of the function
  const templates = generateTemplatePortfolios(validTickers.length, validTickers);
  const templateResults = templates.map(t => {
    const stats = computePortfolioStats(t.weights, meanReturns, covMatrix);
    const eu = computeExpectedUtility(stats.mu, stats.variance, gamma);
    return { name: t.name, weights: t.weights, ...stats, eu };
  });

  // Asset name mapping
  const assetNames = {
    'SPY': 'S&P 500 ETF', 'QQQ': 'Nasdaq 100 ETF', 'IWM': 'Russell 2000 ETF',
    'VTI': 'Total Stock Market ETF', 'VOO': 'Vanguard S&P 500 ETF',
    'BND': 'Total Bond Market ETF', 'AGG': 'Core Bond ETF', 
    'TLT': 'Long-Term Treasury ETF', 'IEF': 'Intermediate Treasury ETF',
    'SHY': 'Short-Term Treasury ETF', 'LQD': 'Investment Grade Corp Bonds',
    'GLD': 'Gold ETF', 'SLV': 'Silver ETF', 'DBC': 'Commodities ETF',
    'VNQ': 'Real Estate ETF', 'EFA': 'Developed Markets ETF',
    'EEM': 'Emerging Markets ETF', 'XLK': 'Technology Sector ETF',
    'XLF': 'Financial Sector ETF', 'XLE': 'Energy Sector ETF',
    'XLV': 'Healthcare Sector ETF'
  };
  
  const portfolio = validTickers.map((ticker, i) => ({
    ticker,
    name: assetNames[ticker] || ticker.replace('.CSV', ''),
    weight: optimal.weights[i],
  })).filter(p => p.weight > 0.001)
    .sort((a, b) => b.weight - a.weight);

  const assetClassBreakdown = computeAssetClassBreakdown(portfolio);

  return {
    portfolio,
    assetClassBreakdown,
    expectedReturn: optimal.mu,
    volatility: optimal.vol,
    expectedUtility: optimal.eu,
    templates: templateResults.map(t => ({
      name: t.name,
      expectedReturn: t.mu,
      volatility: t.vol,
      expectedUtility: t.eu,
      holdings: validTickers.map((ticker, i) => ({
        ticker,
        weight: t.weights[i],
      })).filter(p => p.weight > 0.001),
    })),
    tickers: validTickers,
  };
}
