import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LotteryCard from '../components/LotteryCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { selectNextLottery, updateRange } from '../utils/lotteryEngine.js';
import { inferGamma } from '../utils/gammaInference.js';
import { NUM_QUESTIONS } from '../utils/constants.js';

export default function Assessment() {
  const navigate = useNavigate();

  // Adaptive search state: range [lo, hi] and midpoint estimate
  const [range, setRange] = useState({ lo: 1.0, hi: 4.0, estimate: 2.5 });
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [choices, setChoices] = useState([]);
  const [questionNum, setQuestionNum] = useState(1);

  // Current lottery pair
  const currentPair = selectNextLottery(range.estimate, answeredIds);

  const handleChoice = useCallback((choice) => {
    if (!currentPair) return;

    // Record the choice
    const newChoices = [...choices, { pair: currentPair, choice }];
    setChoices(newChoices);

    // Update answered set
    const newAnswered = new Set(answeredIds);
    newAnswered.add(currentPair.id);
    setAnsweredIds(newAnswered);

    // Update gamma range
    const newRange = updateRange(range.lo, range.hi, currentPair.indifferenceGamma, choice);
    setRange(newRange);

    const newQuestionNum = questionNum + 1;
    setQuestionNum(newQuestionNum);

    // Check if done
    if (newQuestionNum > NUM_QUESTIONS) {
      // Run MLE inference
      const result = inferGamma(newChoices);

      // Save to localStorage
      localStorage.setItem('riskyfrisky_gamma', JSON.stringify(result.gamma));
      localStorage.setItem('riskyfrisky_confidence', JSON.stringify(result.confidence));
      localStorage.setItem('riskyfrisky_choices', JSON.stringify(newChoices.map(c => ({
        pairId: c.pair.id,
        choice: c.choice,
      }))));

      navigate('/results');
    }
  }, [currentPair, choices, answeredIds, range, questionNum, navigate]);

  if (!currentPair) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">No more questions available. Calculating results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Risk Assessment</h1>
        <p className="text-gray-500 mb-6">
          Choose the option you'd prefer in each scenario. There are no right or wrong answers.
        </p>
        <ProgressBar current={questionNum} total={NUM_QUESTIONS} />
      </div>

      <div className="mt-12">
        <LotteryCard pair={currentPair} onChoice={handleChoice} />
      </div>
    </div>
  );
}
