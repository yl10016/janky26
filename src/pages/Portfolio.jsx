import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioPie from '../components/PortfolioPie.jsx';
import RiskReturnScatter from '../components/RiskReturnScatter.jsx';
import ExplanationCard from '../components/ExplanationCard.jsx';
import { getRiskLabel } from '../utils/constants.js';

export default function Portfolio() {
  const navigate = useNavigate();
  const [gamma, setGamma] = useState(null);
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [explainLoading, setExplainLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedGamma = localStorage.getItem('riskyfrisky_gamma');
    if (!storedGamma) {
      navigate('/assess');
      return;
    }

    const g = JSON.parse(storedGamma);
    setGamma(g);

    // Fetch optimized portfolio
    fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gamma: g }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Optimization failed');
        return res.json();
      })
      .then(data => {
        setResult(data);
        setLoading(false);

        // Now fetch AI explanation
        const riskInfo = getRiskLabel(g);
        setExplainLoading(true);
        return fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gamma: g,
            riskLabel: riskInfo.label,
            portfolio: data.portfolio,
            expectedReturn: data.expectedReturn,
            volatility: data.volatility,
          }),
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Explanation failed');
        return res.json();
      })
      .then(data => {
        setExplanation(data.explanation);
        setExplainLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setExplainLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#F81894] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-lg">Fetching market data and optimizing your portfolio...</p>
        <p className="text-gray-400 text-sm mt-2">This may take a moment on the first load.</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-red-500">{error}</p>
          <p className="text-gray-500 mt-4 text-sm">
            Make sure the server is running and your POLYGON_API_KEY is set in .env
          </p>
        </div>
      </div>
    );
  }

  if (!result || !gamma) return null;

  const risk = getRiskLabel(gamma);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Optimal Portfolio</h1>
      <p className="text-gray-500 mb-8">
        Optimized using mean-variance expected utility with γ = {gamma.toFixed(2)}
      </p>

      {/* Highlight card */}
      <div className="bg-gradient-to-r from-[#F81894] to-[#99004C] rounded-2xl p-6 text-white mb-10 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Best for you based on your risk profile</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-white/70 text-sm">Expected Return</div>
            <div className="text-2xl font-bold">{(result.expectedReturn * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-white/70 text-sm">Volatility</div>
            <div className="text-2xl font-bold">{(result.volatility * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-white/70 text-sm">Expected Utility</div>
            <div className="text-2xl font-bold">{result.expectedUtility.toFixed(4)}</div>
          </div>
        </div>
      </div>

      {/* Asset class breakdown */}
      {result.assetClassBreakdown && (
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Equity', value: result.assetClassBreakdown.equity, color: '#F81894' },
            { label: 'Bonds', value: result.assetClassBreakdown.bonds, color: '#6366f1' },
            { label: 'Alternatives', value: result.assetClassBreakdown.alts, color: '#f59e0b' },
          ].map(cls => (
            <div key={cls.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">{cls.label}</div>
              <div className="text-3xl font-bold" style={{ color: cls.color }}>
                {(cls.value * 100).toFixed(1)}%
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cls.value * 100}%`, backgroundColor: cls.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <PortfolioPie portfolio={result.portfolio} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <RiskReturnScatter
            optimal={{ expectedReturn: result.expectedReturn, volatility: result.volatility }}
            templates={result.templates}
          />
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Holdings</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-sm font-medium text-gray-500">Ticker</th>
              <th className="py-2 text-sm font-medium text-gray-500">Asset</th>
              <th className="py-2 text-sm font-medium text-gray-500 text-right">Weight</th>
              <th className="py-2 text-sm font-medium text-gray-500 text-right">Allocation</th>
            </tr>
          </thead>
          <tbody>
            {result.portfolio.map(h => (
              <tr key={h.ticker} className="border-b border-gray-100">
                <td className="py-3 font-semibold text-gray-800">{h.ticker}</td>
                <td className="py-3 text-gray-600 text-sm">{h.name}</td>
                <td className="py-3 text-right text-gray-600">
                  {(h.weight * 100).toFixed(1)}%
                </td>
                <td className="py-3 text-right">
                  <div className="inline-block h-2 rounded-full bg-[#F81894]" style={{ width: `${Math.max(h.weight * 200, 4)}px` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Template comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Compared to Standard Portfolios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 font-medium text-gray-500">Portfolio</th>
                <th className="py-2 font-medium text-gray-500 text-right">Return</th>
                <th className="py-2 font-medium text-gray-500 text-right">Volatility</th>
                <th className="py-2 font-medium text-gray-500 text-right">Expected Utility</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-[#F81894]/5">
                <td className="py-2 font-semibold text-[#F81894]">Your Optimal</td>
                <td className="py-2 text-right">{(result.expectedReturn * 100).toFixed(2)}%</td>
                <td className="py-2 text-right">{(result.volatility * 100).toFixed(2)}%</td>
                <td className="py-2 text-right font-semibold">{result.expectedUtility.toFixed(4)}</td>
              </tr>
              {result.templates.map(t => (
                <tr key={t.name} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{t.name}</td>
                  <td className="py-2 text-right text-gray-600">{(t.expectedReturn * 100).toFixed(2)}%</td>
                  <td className="py-2 text-right text-gray-600">{(t.volatility * 100).toFixed(2)}%</td>
                  <td className="py-2 text-right text-gray-600">{t.expectedUtility.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI explanation */}
      <ExplanationCard explanation={explanation} loading={explainLoading} />
    </div>
  );
}
