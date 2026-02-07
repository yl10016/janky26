/**
 * Predefined lottery pairs for the risk assessment.
 *
 * Each pair has a numerically verified "indifference gamma" — the γ value at
 * which a CRRA agent is indifferent between option A and option B.
 *
 * All outcomes are strictly positive (no $0) to avoid CRRA singularities.
 * Pairs span γ from 0.8 to 4.4 for the target range of [1, 4].
 *
 * Option A is always the "safer" choice, Option B is the "riskier" choice.
 */
export const LOTTERY_PAIRS = [
  {
    id: 1,
    optionA: { outcomes: [{ value: 10, prob: 1.0 }], label: '$10 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.65 }, { value: 2, prob: 0.35 }], label: '65% chance of $20, 35% chance of $2' },
    indifferenceGamma: 0.8,
  },
  {
    id: 2,
    optionA: { outcomes: [{ value: 12, prob: 1.0 }], label: '$12 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.65 }, { value: 3, prob: 0.35 }], label: '65% chance of $25, 35% chance of $3' },
    indifferenceGamma: 0.98,
  },
  {
    id: 3,
    optionA: { outcomes: [{ value: 16, prob: 1.0 }], label: '$16 for sure' },
    optionB: { outcomes: [{ value: 30, prob: 0.55 }, { value: 8, prob: 0.45 }], label: '55% chance of $30, 45% chance of $8' },
    indifferenceGamma: 1.16,
  },
  {
    id: 4,
    optionA: { outcomes: [{ value: 14, prob: 1.0 }], label: '$14 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.7 }, { value: 5, prob: 0.30 }], label: '70% chance of $25, 30% chance of $5' },
    indifferenceGamma: 1.34,
  },
  {
    id: 5,
    optionA: { outcomes: [{ value: 16, prob: 1.0 }], label: '$16 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.8 }, { value: 5, prob: 0.20 }], label: '80% chance of $25, 20% chance of $5' },
    indifferenceGamma: 1.52,
  },
  {
    id: 6,
    optionA: { outcomes: [{ value: 16, prob: 1.0 }], label: '$16 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.7 }, { value: 8, prob: 0.30 }], label: '70% chance of $25, 30% chance of $8' },
    indifferenceGamma: 1.7,
  },
  {
    id: 7,
    optionA: { outcomes: [{ value: 18, prob: 1.0 }], label: '$18 for sure' },
    optionB: { outcomes: [{ value: 30, prob: 0.65 }, { value: 10, prob: 0.35 }], label: '65% chance of $30, 35% chance of $10' },
    indifferenceGamma: 1.87,
  },
  {
    id: 8,
    optionA: { outcomes: [{ value: 21, prob: 1.0 }], label: '$21 for sure' },
    optionB: { outcomes: [{ value: 30, prob: 0.85 }, { value: 8, prob: 0.15 }], label: '85% chance of $30, 15% chance of $8' },
    indifferenceGamma: 2.06,
  },
  {
    id: 9,
    optionA: { outcomes: [{ value: 16, prob: 1.0 }], label: '$16 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.65 }, { value: 10, prob: 0.35 }], label: '65% chance of $25, 35% chance of $10' },
    indifferenceGamma: 2.23,
  },
  {
    id: 10,
    optionA: { outcomes: [{ value: 11, prob: 1.0 }], label: '$11 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.5 }, { value: 8, prob: 0.50 }], label: '50% chance of $20, 50% chance of $8' },
    indifferenceGamma: 2.42,
  },
  {
    id: 11,
    optionA: { outcomes: [{ value: 23, prob: 1.0 }], label: '$23 for sure' },
    optionB: { outcomes: [{ value: 35, prob: 0.9 }, { value: 8, prob: 0.10 }], label: '90% chance of $35, 10% chance of $8' },
    indifferenceGamma: 2.6,
  },
  {
    id: 12,
    optionA: { outcomes: [{ value: 16, prob: 1.0 }], label: '$16 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.8 }, { value: 10, prob: 0.20 }], label: '80% chance of $20, 20% chance of $10' },
    indifferenceGamma: 2.79,
  },
  {
    id: 13,
    optionA: { outcomes: [{ value: 14, prob: 1.0 }], label: '$14 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.65 }, { value: 10, prob: 0.35 }], label: '65% chance of $20, 35% chance of $10' },
    indifferenceGamma: 2.96,
  },
  {
    id: 14,
    optionA: { outcomes: [{ value: 15, prob: 1.0 }], label: '$15 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.75 }, { value: 10, prob: 0.25 }], label: '75% chance of $20, 25% chance of $10' },
    indifferenceGamma: 3.14,
  },
  {
    id: 15,
    optionA: { outcomes: [{ value: 23, prob: 1.0 }], label: '$23 for sure' },
    optionB: { outcomes: [{ value: 40, prob: 0.7 }, { value: 15, prob: 0.30 }], label: '70% chance of $40, 30% chance of $15' },
    indifferenceGamma: 3.31,
  },
  {
    id: 16,
    optionA: { outcomes: [{ value: 17, prob: 1.0 }], label: '$17 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.9 }, { value: 8, prob: 0.10 }], label: '90% chance of $25, 10% chance of $8' },
    indifferenceGamma: 3.5,
  },
  {
    id: 17,
    optionA: { outcomes: [{ value: 14, prob: 1.0 }], label: '$14 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.85 }, { value: 8, prob: 0.15 }], label: '85% chance of $20, 15% chance of $8' },
    indifferenceGamma: 3.68,
  },
  {
    id: 18,
    optionA: { outcomes: [{ value: 15, prob: 1.0 }], label: '$15 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.9 }, { value: 8, prob: 0.10 }], label: '90% chance of $20, 10% chance of $8' },
    indifferenceGamma: 3.86,
  },
  {
    id: 19,
    optionA: { outcomes: [{ value: 19, prob: 1.0 }], label: '$19 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.65 }, { value: 15, prob: 0.35 }], label: '65% chance of $25, 35% chance of $15' },
    indifferenceGamma: 4.04,
  },
  {
    id: 20,
    optionA: { outcomes: [{ value: 18, prob: 1.0 }], label: '$18 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.55 }, { value: 15, prob: 0.45 }], label: '55% chance of $25, 45% chance of $15' },
    indifferenceGamma: 4.22,
  },
  {
    id: 21,
    optionA: { outcomes: [{ value: 13, prob: 1.0 }], label: '$13 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.65 }, { value: 10, prob: 0.35 }], label: '65% chance of $20, 35% chance of $10' },
    indifferenceGamma: 4.37,
  },
];

/**
 * Risk label thresholds for γ ∈ [1, 4].
 */
export const RISK_LABELS = [
  { max: 1.5, label: 'Aggressive', color: '#ef4444' },
  { max: 2.5, label: 'Moderately Aggressive', color: '#f97316' },
  { max: 3.0, label: 'Balanced', color: '#eab308' },
  { max: 3.5, label: 'Conservative', color: '#22c55e' },
  { max: Infinity, label: 'Very Conservative', color: '#3b82f6' },
];

export function getRiskLabel(gamma) {
  for (const level of RISK_LABELS) {
    if (gamma < level.max) return level;
  }
  return RISK_LABELS[RISK_LABELS.length - 1];
}

/**
 * Number of questions in the assessment.
 */
export const NUM_QUESTIONS = 10;
