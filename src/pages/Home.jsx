import { Link } from 'react-router-dom';

const steps = [
  {
    num: '1',
    title: 'Assess',
    desc: 'Answer 10 quick lottery-style questions to reveal your risk preferences.',
  },
  {
    num: '2',
    title: 'Analyze',
    desc: 'We estimate your risk aversion coefficient using decision theory.',
  },
  {
    num: '3',
    title: 'Invest',
    desc: 'Get AI-powered portfolio recommendations optimized for your profile.',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#F81894] to-[#99004C] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold tracking-tight mb-4">
            Risky<span className="text-[#FF66B2]">FRISKY</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Personalized financial decision support powered by AI.
            Discover your risk profile and get portfolio recommendations backed by utility theory.
          </p>
          <Link
            to="/assess"
            className="inline-block bg-white text-[#F81894] font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Start Assessment
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(step => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F81894] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What makes this different */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Not a Stock Prediction App
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Most investment tools try to predict the market. We don't.
            Instead, we use <strong>CRRA utility theory</strong> and <strong>mean-variance optimization</strong> to
            find the portfolio that maximizes <em>your</em> expected utility — based on
            your actual risk preferences, not guesses.
          </p>
          <div className="mt-8">
            <Link
              to="/assess"
              className="inline-block bg-[#F81894] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#99004C] transition-colors"
            >
              Discover Your Risk Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
