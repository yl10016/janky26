import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#F81894', '#99004C', '#FF66B2', '#6366f1', '#8b5cf6',
  '#06b6d4', '#14b8a6', '#22c55e', '#eab308', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#10b981',
];

export default function PortfolioPie({ portfolio }) {
  const data = portfolio.map(h => ({
    name: h.ticker,
    value: parseFloat((h.weight * 100).toFixed(1)),
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `${val}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
