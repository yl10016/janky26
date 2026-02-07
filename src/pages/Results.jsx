import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UtilityCurve from '../components/UtilityCurve.jsx';
import { getRiskLabel } from '../utils/constants.js';

export default function Results() {
  const navigate = useNavigate();
  const [gamma, setGamma] = useState(null);
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    const storedGamma = localStorage.getItem('riskyfrisky_gamma');
    const storedConf = localStorage.getItem('riskyfrisky_confidence');

    if (!storedGamma) {
      navigate('/assess');
      return;
    }

    setGamma(JSON.parse(storedGamma));
    setConfidence(storedConf ? JSON.parse(storedConf) : null);
  }, [navigate]);

  if (gamma === null) return null;

  const risk = getRiskLabel(gamma);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Risk Profile</h1>
      <p className="text-gray-500 mb-8">
        Based on your choices, we've estimated your risk aversion using CRRA utility theory.
      </p>

      {/* Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Gamma */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Risk Aversion (γ)</div>
          <div className="text-5xl font-extrabold text-[#F81894]">{gamma.toFixed(2)}</div>
          {confidence && (
            <div className="text-xs text-gray-400 mt-2">
              95% CI: [{confidence[0].toFixed(1)}, {confidence[1].toFixed(1)}]
            </div>
          )}
        </div>

        {/* Risk label */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Risk Profile</div>
          <div className="text-3xl font-bold" style={{ color: risk.color }}>
            {risk.label}
          </div>
        </div>

        {/* What it means */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">What This Means</div>
          <div className="text-sm text-gray-600 leading-relaxed">
            {gamma < 1.5 && 'You accept significant risk for higher returns. You\'re comfortable with volatility in exchange for growth potential.'}
            {gamma >= 1.5 && gamma < 2.5 && 'You lean toward growth but want some downside protection. You tolerate moderate swings.'}
            {gamma >= 2.5 && gamma < 3.0 && 'You prefer a balanced approach — some growth potential with reasonable downside protection.'}
            {gamma >= 3.0 && gamma < 3.5 && 'You prioritize stability. You prefer steady returns over potential gains.'}
            {gamma >= 3.5 && 'You strongly prefer safety. You want minimal volatility even if it means lower returns.'}
          </div>
        </div>
      </div>

      {/* Utility curve */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-12">
        <UtilityCurve gamma={gamma} />
      </div>

      {/* Explanation of the math */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-12">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">The Math Behind Your Score</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          We used a <strong>Constant Relative Risk Aversion (CRRA)</strong> utility function:
        </p>
        <div className="bg-white rounded-lg p-4 font-mono text-sm text-gray-700 mb-3">
          U(x) = x<sup>(1−γ)</sup> / (1−γ)
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your choices were analyzed using a <strong>logistic choice model</strong> with
          maximum likelihood estimation. The curve above shows how your utility
          increases with wealth — the more curved it is, the more you value
          certainty over potential gains.
        </p>
      </div>

      <div className="text-center">
        <Link
          to="/portfolio"
          className="inline-block bg-[#F81894] text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-[#99004C] hover:shadow-xl transition-all duration-200"
        >
          View Portfolio Recommendations
        </Link>
      </div>
    </div>
  );
}
