export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F81894] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
