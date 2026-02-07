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
 * Optimize portfolio using constrained mean-variance approach.
 *
 * 1. Compute unconstrained analytical solution: w* = (1/γ) * Σ⁻¹ * μ
 * 2. Project onto simplex (no shorting, weights sum to 1)
 * 3. Refine with coordinate descent on EU
 *
 * @param {number[]} means - Annualized mean returns for each asset
 * @param {number[][]} covMatrix - NxN annualized covariance matrix
 * @param {number} gamma - Risk aversion coefficient
 * @returns {{ weights: number[], mu: number, variance: number, vol: number, eu: number }}
 */
export function optimizePortfolio(means, covMatrix, gamma) {
  const n = means.length;

  // Step 1: Analytical unconstrained solution w* = (1/γ) * Σ⁻¹ * μ
  const covInv = invertMatrix(covMatrix.map(row => [...row]));
  const wUnconstrained = new Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += covInv[i][j] * means[j];
    }
    wUnconstrained[i] = sum / gamma;
  }

  // Step 2: Project onto simplex
  let weights = projectOntoSimplex(wUnconstrained);

  // Step 3: Coordinate descent refinement (20 iterations)
  const step = 0.02;
  for (let iter = 0; iter < 20; iter++) {
    const { mu, variance } = computePortfolioStats(weights, means, covMatrix);
    let bestEU = computeExpectedUtility(mu, variance, gamma);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (weights[i] < step) continue; // can't reduce below 0

        // Try shifting weight from asset i to asset j
        const trial = [...weights];
        trial[i] -= step;
        trial[j] += step;

        const trialStats = computePortfolioStats(trial, means, covMatrix);
        const trialEU = computeExpectedUtility(trialStats.mu, trialStats.variance, gamma);

        if (trialEU > bestEU) {
          weights = trial;
          bestEU = trialEU;
        }
      }
    }
  }

  const stats = computePortfolioStats(weights, means, covMatrix);
  const eu = computeExpectedUtility(stats.mu, stats.variance, gamma);

  return { weights, mu: stats.mu, variance: stats.variance, vol: stats.vol, eu };
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
  const bondTickers = ['BND', 'TLT', 'IEF', 'SHY', 'AGG', 'LQD'];
  const equityTickers = ['SPY', 'QQQ', 'IWM', 'VTI', 'EFA', 'EEM', 'XLK', 'XLF', 'XLE', 'XLV'];
  const altTickers = ['VNQ', 'GLD', 'SLV', 'DBC'];

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
export function runOptimization(priceData, tickers, gamma) {
  // Compute returns for each ticker
  const allReturns = [];
  const validTickers = [];
  const meanReturns = [];

  for (const ticker of tickers) {
    const prices = priceData[ticker];
    if (!prices || prices.length < 30) continue; // need enough data

    const closePrices = prices.map(p => p.close);
    const returns = computeReturns(closePrices);
    const stats = computeStats(returns);

    allReturns.push(returns);
    validTickers.push(ticker);
    meanReturns.push(stats.mean);
  }

  if (validTickers.length < 2) {
    throw new Error('Not enough valid ticker data for optimization');
  }

  // Align return lengths (some assets might have different trading days)
  const minLen = Math.min(...allReturns.map(r => r.length));
  const alignedReturns = allReturns.map(r => r.slice(r.length - minLen));

  // Compute covariance matrix
  const covMatrix = computeCovarianceMatrix(alignedReturns);

  // Optimize
  const optimal = optimizePortfolio(meanReturns, covMatrix, gamma);

  // Generate templates for comparison
  const templates = generateTemplatePortfolios(validTickers.length, validTickers);
  const templateResults = templates.map(t => {
    const stats = computePortfolioStats(t.weights, meanReturns, covMatrix);
    const eu = computeExpectedUtility(stats.mu, stats.variance, gamma);
    return { name: t.name, weights: t.weights, ...stats, eu };
  });

  // Build portfolio with ticker names
  const portfolio = validTickers.map((ticker, i) => ({
    ticker,
    weight: optimal.weights[i],
  })).filter(p => p.weight > 0.001) // filter out negligible allocations
    .sort((a, b) => b.weight - a.weight);

  return {
    portfolio,
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
