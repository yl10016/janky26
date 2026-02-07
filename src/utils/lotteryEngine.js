/**
 * Adaptive lottery question selection engine.
 *
 * Uses binary-search-style selection: pick the lottery pair whose
 * indifference γ is closest to the current estimate, maximally
 * narrowing the uncertainty range with each question.
 */

import { LOTTERY_PAIRS } from './constants.js';

/**
 * Select the next lottery pair based on the current gamma estimate.
 *
 * Strategy:
 * - Maintain a credible range [lo, hi] for γ
 * - Pick the unanswered pair whose indifference γ is closest to the midpoint
 * - This binary-search approach maximally narrows the range each step
 *
 * @param {number} gammaEstimate - Current midpoint estimate of γ
 * @param {Set<number>} answeredIds - IDs of already-answered lottery pairs
 * @returns {Object|null} Next lottery pair, or null if none available
 */
export function selectNextLottery(gammaEstimate, answeredIds) {
  const available = LOTTERY_PAIRS.filter(p => !answeredIds.has(p.id));
  if (available.length === 0) return null;

  // Find the pair whose indifference point is closest to current estimate
  let best = available[0];
  let bestDist = Math.abs(best.indifferenceGamma - gammaEstimate);

  for (const pair of available) {
    const dist = Math.abs(pair.indifferenceGamma - gammaEstimate);
    if (dist < bestDist) {
      best = pair;
      bestDist = dist;
    }
  }

  return best;
}

/**
 * Update the gamma estimate range based on a choice.
 *
 * If user chose the safe option (A), γ > indifference point → increase estimate.
 * If user chose the risky option (B), γ < indifference point → decrease estimate.
 *
 * @param {number} lo - Current lower bound of γ range
 * @param {number} hi - Current upper bound of γ range
 * @param {number} indifferenceGamma - The indifference γ of the chosen pair
 * @param {'A'|'B'} choice - Which option the user chose
 * @returns {{ lo: number, hi: number, estimate: number }}
 */
export function updateRange(lo, hi, indifferenceGamma, choice) {
  let newLo = lo;
  let newHi = hi;

  if (choice === 'A') {
    // Chose safe → γ is above the indifference point
    newLo = Math.max(lo, indifferenceGamma);
  } else {
    // Chose risky → γ is below the indifference point
    newHi = Math.min(hi, indifferenceGamma);
  }

  // Prevent degenerate ranges
  if (newLo >= newHi) {
    newLo = Math.max(0.1, newLo - 0.2);
    newHi = newLo + 0.4;
  }

  const estimate = (newLo + newHi) / 2;
  return { lo: newLo, hi: newHi, estimate };
}
