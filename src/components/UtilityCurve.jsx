import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { utilityCurveData } from '../utils/crra.js';

/**
 * Plots the CRRA utility curve for the user's γ,
 * with reference curves for comparison.
 */

const REFERENCE_GAMMAS = [
  { gamma: 0.5, label: 'Aggressive (γ=0.5)', color: '#ef4444' },
  { gamma: 3.0, label: 'Balanced (γ=3)', color: '#eab308' },
  { gamma: 7.0, label: 'Conservative (γ=7)', color: '#3b82f6' },
];

export default function UtilityCurve({ gamma }) {
  // Generate data for user's curve + references
  const userCurve = utilityCurveData(gamma, 0.5, 50, 100);

  // Normalize: find the utility range for the user's γ and scale all curves to [0, 1]
  // This makes different γ values visually comparable
  const normalize = (data) => {
    const uMin = data[0].u;
    const uMax = data[data.length - 1].u;
    const range = uMax - uMin || 1;
    return data.map(d => ({ ...d, u: (d.u - uMin) / range }));
  };

  const normalizedUser = normalize(userCurve);

  // Merge all into a single dataset keyed by x
  const merged = normalizedUser.map((point, i) => {
    const row = { x: point.x, you: point.u };
    for (const ref of REFERENCE_GAMMAS) {
      const refData = normalize(utilityCurveData(ref.gamma, 0.5, 50, 100));
      row[ref.label] = refData[i]?.u ?? 0;
    }
    return row;
  });

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Utility Curve</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={merged} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            label={{ value: 'Wealth ($)', position: 'insideBottom', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Utility (normalized)', angle: -90, position: 'insideLeft', offset: 10 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(val) => val.toFixed(3)}
            labelFormatter={(val) => `$${val}`}
          />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="you"
            name={`You (γ=${gamma.toFixed(1)})`}
            stroke="#F81894"
            strokeWidth={3}
            dot={false}
          />
          {REFERENCE_GAMMAS.map(ref => (
            <Line
              key={ref.label}
              type="monotone"
              dataKey={ref.label}
              stroke={ref.color}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.6}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Higher curvature = more risk averse. Your curve shows how much additional utility you gain from extra wealth.
      </p>
    </div>
  );
}
