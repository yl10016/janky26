/**
 * Displays a binary lottery choice: two side-by-side options with big click targets.
 */

export default function LotteryCard({ pair, onChoice }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-center text-lg text-gray-600 mb-6">
        Which would you prefer?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A — Safe */}
        <button
          onClick={() => onChoice('A')}
          className="relative px-8 py-14 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F81894] hover:shadow-lg transition-all duration-200 text-center cursor-pointer"
        >
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#FF66B2]/20 text-[#F81894] flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {pair.optionA.label}
          </div>
        </button>

        {/* Option B — Risky */}
        <button
          onClick={() => onChoice('B')}
          className="relative px-8 py-14 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F81894] hover:shadow-lg transition-all duration-200 text-center cursor-pointer"
        >
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#FF66B2]/20 text-[#F81894] flex items-center justify-center font-bold text-sm">
            B
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {pair.optionB.label}
          </div>
        </button>
      </div>
    </div>
  );
}
