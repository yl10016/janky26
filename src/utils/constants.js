/**
 * Predefined lottery pairs for the risk assessment.
 *
 * Each pair has an "indifference gamma" — the γ value at which a rational CRRA
 * agent is indifferent between option A and option B.
 *
 * Pairs are designed to span γ from 0.3 to 8.0, enabling binary-search-style
 * adaptive question selection.
 *
 * Option A is always the "safer" choice, Option B is the "riskier" choice.
 */
export const LOTTERY_PAIRS = [
  {
    id: 1,
    optionA: { outcomes: [{ value: 5, prob: 1.0 }], label: '$5 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.5 }, { value: 0, prob: 0.5 }], label: '50% chance of $20, 50% chance of nothing' },
    indifferenceGamma: 0.4,
  },
  {
    id: 2,
    optionA: { outcomes: [{ value: 8, prob: 1.0 }], label: '$8 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.5 }, { value: 0, prob: 0.5 }], label: '50% chance of $20, 50% chance of nothing' },
    indifferenceGamma: 0.8,
  },
  {
    id: 3,
    optionA: { outcomes: [{ value: 10, prob: 1.0 }], label: '$10 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.5 }, { value: 0, prob: 0.5 }], label: '50% chance of $25, 50% chance of nothing' },
    indifferenceGamma: 1.2,
  },
  {
    id: 4,
    optionA: { outcomes: [{ value: 10, prob: 1.0 }], label: '$10 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.6 }, { value: 0, prob: 0.4 }], label: '60% chance of $20, 40% chance of nothing' },
    indifferenceGamma: 1.5,
  },
  {
    id: 5,
    optionA: { outcomes: [{ value: 15, prob: 1.0 }], label: '$15 for sure' },
    optionB: { outcomes: [{ value: 30, prob: 0.6 }, { value: 0, prob: 0.4 }], label: '60% chance of $30, 40% chance of nothing' },
    indifferenceGamma: 1.8,
  },
  {
    id: 6,
    optionA: { outcomes: [{ value: 12, prob: 1.0 }], label: '$12 for sure' },
    optionB: { outcomes: [{ value: 20, prob: 0.7 }, { value: 0, prob: 0.3 }], label: '70% chance of $20, 30% chance of nothing' },
    indifferenceGamma: 2.0,
  },
  {
    id: 7,
    optionA: { outcomes: [{ value: 15, prob: 1.0 }], label: '$15 for sure' },
    optionB: { outcomes: [{ value: 25, prob: 0.7 }, { value: 2, prob: 0.3 }], label: '70% chance of $25, 30% chance of $2' },
    indifferenceGamma: 2.3,
  },
  {
    id: 8,
    optionA: { outcomes: [{ value: 20, prob: 1.0 }], label: '$20 for sure' },
    optionB: { outcomes: [{ value: 40, prob: 0.6 }, { value: 2, prob: 0.4 }], label: '60% chance of $40, 40% chance of $2' },
    indifferenceGamma: 2.5,
  },
  {
    id: 9,
    optionA: { outcomes: [{ value: 18, prob: 1.0 }], label: '$18 for sure' },
    optionB: { outcomes: [{ value: 30, prob: 0.7 }, { value: 3, prob: 0.3 }], label: '70% chance of $30, 30% chance of $3' },
    indifferenceGamma: 2.8,
  },
  {
    id: 10,
    optionA: { outcomes: [{ value: 20, prob: 1.0 }], label: '$20 for sure' },
    optionB: { outcomes: [{ value: 35, prob: 0.65 }, { value: 3, prob: 0.35 }], label: '65% chance of $35, 35% chance of $3' },
    indifferenceGamma: 3.0,
  },
  {
    id: 11,
    optionA: { outcomes: [{ value: 25, prob: 1.0 }], label: '$25 for sure' },
    optionB: { outcomes: [{ value: 40, prob: 0.7 }, { value: 5, prob: 0.3 }], label: '70% chance of $40, 30% chance of $5' },
    indifferenceGamma: 3.3,
  },
  {
    id: 12,
    optionA: { outcomes: [{ value: 22, prob: 1.0 }], label: '$22 for sure' },
    optionB: { outcomes: [{ value: 35, prob: 0.7 }, { value: 5, prob: 0.3 }], label: '70% chance of $35, 30% chance of $5' },
    indifferenceGamma: 3.6,
  },
  {
    id: 13,
    optionA: { outcomes: [{ value: 25, prob: 1.0 }], label: '$25 for sure' },
    optionB: { outcomes: [{ value: 35, prob: 0.75 }, { value: 5, prob: 0.25 }], label: '75% chance of $35, 25% chance of $5' },
    indifferenceGamma: 3.8,
  },
  {
    id: 14,
    optionA: { outcomes: [{ value: 30, prob: 1.0 }], label: '$30 for sure' },
    optionB: { outcomes: [{ value: 45, prob: 0.75 }, { value: 5, prob: 0.25 }], label: '75% chance of $45, 25% chance of $5' },
    indifferenceGamma: 4.0,
  },
  {
    id: 15,
    optionA: { outcomes: [{ value: 28, prob: 1.0 }], label: '$28 for sure' },
    optionB: { outcomes: [{ value: 40, prob: 0.75 }, { value: 5, prob: 0.25 }], label: '75% chance of $40, 25% chance of $5' },
    indifferenceGamma: 4.3,
  },
  {
    id: 16,
    optionA: { outcomes: [{ value: 30, prob: 1.0 }], label: '$30 for sure' },
    optionB: { outcomes: [{ value: 40, prob: 0.8 }, { value: 5, prob: 0.2 }], label: '80% chance of $40, 20% chance of $5' },
    indifferenceGamma: 4.5,
  },
  {
    id: 17,
    optionA: { outcomes: [{ value: 30, prob: 1.0 }], label: '$30 for sure' },
    optionB: { outcomes: [{ value: 38, prob: 0.85 }, { value: 5, prob: 0.15 }], label: '85% chance of $38, 15% chance of $5' },
    indifferenceGamma: 5.0,
  },
  {
    id: 18,
    optionA: { outcomes: [{ value: 35, prob: 1.0 }], label: '$35 for sure' },
    optionB: { outcomes: [{ value: 45, prob: 0.8 }, { value: 10, prob: 0.2 }], label: '80% chance of $45, 20% chance of $10' },
    indifferenceGamma: 5.5,
  },
  {
    id: 19,
    optionA: { outcomes: [{ value: 40, prob: 1.0 }], label: '$40 for sure' },
    optionB: { outcomes: [{ value: 50, prob: 0.85 }, { value: 10, prob: 0.15 }], label: '85% chance of $50, 15% chance of $10' },
    indifferenceGamma: 6.0,
  },
  {
    id: 20,
    optionA: { outcomes: [{ value: 40, prob: 1.0 }], label: '$40 for sure' },
    optionB: { outcomes: [{ value: 48, prob: 0.85 }, { value: 10, prob: 0.15 }], label: '85% chance of $48, 15% chance of $10' },
    indifferenceGamma: 6.5,
  },
  {
    id: 21,
    optionA: { outcomes: [{ value: 45, prob: 1.0 }], label: '$45 for sure' },
    optionB: { outcomes: [{ value: 55, prob: 0.85 }, { value: 15, prob: 0.15 }], label: '85% chance of $55, 15% chance of $15' },
    indifferenceGamma: 7.0,
  },
  {
    id: 22,
    optionA: { outcomes: [{ value: 45, prob: 1.0 }], label: '$45 for sure' },
    optionB: { outcomes: [{ value: 52, prob: 0.9 }, { value: 10, prob: 0.1 }], label: '90% chance of $52, 10% chance of $10' },
    indifferenceGamma: 7.5,
  },
  {
    id: 23,
    optionA: { outcomes: [{ value: 48, prob: 1.0 }], label: '$48 for sure' },
    optionB: { outcomes: [{ value: 55, prob: 0.9 }, { value: 15, prob: 0.1 }], label: '90% chance of $55, 10% chance of $15' },
    indifferenceGamma: 8.0,
  },
];

/**
 * Risk label thresholds.
 */
export const RISK_LABELS = [
  { max: 1.0, label: 'Aggressive', color: '#ef4444' },
  { max: 3.0, label: 'Moderately Aggressive', color: '#f97316' },
  { max: 5.0, label: 'Balanced', color: '#eab308' },
  { max: 7.0, label: 'Conservative', color: '#22c55e' },
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
