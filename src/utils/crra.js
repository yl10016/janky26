/**
 * Constant Relative Risk Aversion (CRRA) utility functions.
 *
 * U(x) = x^(1−γ) / (1−γ)   for γ ≠ 1
 * U(x) = ln(x)              for γ = 1
 *
 * γ (gamma) is the coefficient of relative risk aversion:
 *   γ < 1  → risk-seeking
 *   γ = 1  → risk-neutral (log utility)
 *   γ > 1  → risk-averse (higher = more averse)
 */

/**
 * Compute CRRA utility of a monetary outcome.
 * @param {number} x - Monetary outcome (must be > 0)
 * @param {number} gamma - Risk aversion coefficient
 * @returns {number} Utility value
 */
export function utility(x, gamma) {
  if (x <= 0) return -Infinity;
  if (Math.abs(gamma - 1) < 1e-6) return Math.log(x);
  return Math.pow(x, 1 - gamma) / (1 - gamma);
}

/**
 * Compute expected utility of a lottery.
 * A lottery is an array of { value, prob } outcomes.
 * @param {{ value: number, prob: number }[]} outcomes
 * @param {number} gamma
 * @returns {number} Expected utility
 */
export function expectedUtility(outcomes, gamma) {
  return outcomes.reduce((sum, o) => {
    // Handle zero outcomes: assign a very small value to avoid -Infinity
    const val = o.value > 0 ? o.value : 0.01;
    return sum + o.prob * utility(val, gamma);
  }, 0);
}

/**
 * Generate utility curve data points for plotting.
 * Returns array of { x, u } for x from xMin to xMax.
 * @param {number} gamma
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} steps
 */
export function utilityCurveData(gamma, xMin = 0.1, xMax = 50, steps = 200) {
  const data = [];
  const stepSize = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * stepSize;
    data.push({ x: parseFloat(x.toFixed(2)), u: utility(x, gamma) });
  }
  return data;
}
