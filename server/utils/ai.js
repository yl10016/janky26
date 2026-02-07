/**
 * OpenRouter API client for generating plain-English portfolio explanations.
 * Uses the OpenAI-compatible chat completions endpoint.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate a plain-English explanation of the portfolio recommendation.
 *
 * @param {Object} params
 * @param {number} params.gamma - Risk aversion coefficient
 * @param {string} params.riskLabel - e.g. "Conservative", "Balanced", "Aggressive"
 * @param {Array} params.portfolio - Array of { ticker, weight }
 * @param {number} params.expectedReturn - Annualized expected return
 * @param {number} params.volatility - Annualized volatility
 * @returns {Promise<string>} Plain-English explanation
 */
export async function generateExplanation({ gamma, riskLabel, portfolio, expectedReturn, volatility }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  const holdingsList = portfolio
    .map(h => `${h.ticker}: ${(h.weight * 100).toFixed(1)}%`)
    .join(', ');

  const systemPrompt = `You are a financial decision support assistant for the app "RiskyFrisky".
You explain portfolio recommendations in plain English.
You do NOT predict prices or give financial advice.
You explain the reasoning behind portfolio construction based on utility theory and risk preferences.
Keep your explanation to 2-3 concise paragraphs. Be conversational and clear.`;

  const userPrompt = `The user completed a risk assessment and their estimated risk aversion coefficient (gamma) is ${gamma.toFixed(2)}, which classifies them as "${riskLabel}".

Based on their risk profile, we optimized a portfolio using mean-variance expected utility (EU = μ − 0.5γσ²) with current market data.

Recommended portfolio: ${holdingsList}
Expected annual return: ${(expectedReturn * 100).toFixed(2)}%
Expected annual volatility: ${(volatility * 100).toFixed(2)}%

Please explain:
1. What their risk profile means in everyday terms
2. Why these specific assets were chosen given their risk preferences
3. The trade-off between risk and return in their portfolio`;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://riskyfrisky.app',
      'X-Title': 'RiskyFrisky',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.choices[0].message.content;
}
