export default function ExplanationCard({ explanation, loading }) {
  return (
    <div className="bg-gradient-to-br from-[#F81894]/5 to-white border border-[#FF66B2]/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#F81894] flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700">AI Explanation</h3>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="h-4 bg-gray-200 rounded w-full mt-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ) : explanation ? (
        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
          {explanation}
        </div>
      ) : (
        <p className="text-gray-400 italic">Explanation will appear here...</p>
      )}
    </div>
  );
}
