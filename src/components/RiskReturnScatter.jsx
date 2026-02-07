import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Scatter plot showing template portfolios on a risk-return plane,
 * with the user's optimal portfolio highlighted.
 */
export default function RiskReturnScatter({ optimal, templates }) {
  const optimalPoint = [{
    x: parseFloat((optimal.volatility * 100).toFixed(2)),
    y: parseFloat((optimal.expectedReturn * 100).toFixed(2)),
    name: 'Your Portfolio',
  }];

  const templatePoints = templates.map(t => ({
    x: parseFloat((t.volatility * 100).toFixed(2)),
    y: parseFloat((t.expectedReturn * 100).toFixed(2)),
    name: t.name,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold">{data.name}</p>
          <p>Return: {data.y}%</p>
          <p>Volatility: {data.x}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Risk vs. Return</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            name="Volatility"
            label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Return"
            label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', offset: 10 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" />
          <Scatter
            name="Template Portfolios"
            data={templatePoints}
            fill="#FF66B2"
            fillOpacity={0.7}
            r={6}
          />
          <Scatter
            name="Your Optimal"
            data={optimalPoint}
            fill="#F81894"
            stroke="#99004C"
            strokeWidth={2}
            r={10}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
