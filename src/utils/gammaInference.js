/**
 * Maximum Likelihood Estimation (MLE) for the risk aversion coefficient γ.
 *
 * Uses a logistic choice model:
 *   P(choose A | γ) = 1 / (1 + exp(-λ * (EU_A(γ) - EU_B(γ))))
 *
 * Where:
 *   EU_A(γ) = expected utility of option A under CRRA with parameter γ
 *   EU_B(γ) = expected utility of option B under CRRA with parameter γ
 *   λ = sensitivity parameter (higher = more deterministic choices)
 *
 * We do a grid search over γ ∈ [1.0, 4.0] to find the MLE estimate.
 */

import { expectedUtility } from './crra.js';

// Sensitivity parameter for the logistic choice model.
// λ = 8 gives reasonable noise tolerance for human choices.
const LAMBDA = 8;

/**
 * Compute log-likelihood of the observed choices for a given γ.
 *
 * @param {Array} choices - Array of { pair, choice } where:
 *   pair = lottery pair object (with optionA, optionB)
 *   choice = 'A' or 'B'
 * @param {number} gamma - Candidate γ value
 * @returns {number} Log-likelihood
 */
function logLikelihood(choices, gamma) {
  let ll = 0;

  for (const { pair, choice } of choices) {
    const euA = expectedUtility(pair.optionA.outcomes, gamma);
    const euB = expectedUtility(pair.optionB.outcomes, gamma);

    // P(choose A) = sigmoid(λ * (EU_A - EU_B))
    const diff = LAMBDA * (euA - euB);

    // Numerically stable log-sigmoid
    if (choice === 'A') {
      // log P(A) = log sigmoid(diff) = -log(1 + exp(-diff))
      ll += diff > 0 ? -Math.log(1 + Math.exp(-diff)) : diff - Math.log(1 + Math.exp(diff));
    } else {
      // log P(B) = log(1 - sigmoid(diff)) = log sigmoid(-diff) = -log(1 + exp(diff))
      ll += -diff > 0 ? -Math.log(1 + Math.exp(diff)) : -diff - Math.log(1 + Math.exp(-diff));
    }
  }

  return ll;
}

/**
 * Infer the risk aversion coefficient γ from observed lottery choices using MLE.
 *
 * @param {Array} choices - Array of { pair, choice }
 * @returns {{ gamma: number, confidence: [number, number], logLikelihood: number }}
 */
export function inferGamma(choices) {
  if (choices.length === 0) {
    return { gamma: 2.5, confidence: [1.0, 4.0], logLikelihood: 0 };
  }

  const GAMMA_MIN = 1.0;
  const GAMMA_MAX = 4.0;
  const STEP = 0.02;

  let bestGamma = 3.0;
  let bestLL = -Infinity;

  // Grid search
  for (let g = GAMMA_MIN; g <= GAMMA_MAX; g += STEP) {
    const ll = logLikelihood(choices, g);
    if (ll > bestLL) {
      bestLL = ll;
      bestGamma = g;
    }
  }

  // Compute 95% confidence interval: LL > maxLL - 1.92
  const threshold = bestLL - 1.92;
  let ciLo = GAMMA_MIN;
  let ciHi = GAMMA_MAX;

  for (let g = GAMMA_MIN; g <= GAMMA_MAX; g += STEP) {
    if (logLikelihood(choices, g) >= threshold) {
      ciLo = g;
      break;
    }
  }
  for (let g = GAMMA_MAX; g >= GAMMA_MIN; g -= STEP) {
    if (logLikelihood(choices, g) >= threshold) {
      ciHi = g;
      break;
    }
  }

  return {
    gamma: parseFloat(bestGamma.toFixed(2)),
    confidence: [parseFloat(ciLo.toFixed(2)), parseFloat(ciHi.toFixed(2))],
    logLikelihood: bestLL,
  };
}
