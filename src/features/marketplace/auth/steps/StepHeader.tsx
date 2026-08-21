export default function StepHeader({
  step,
  totalSteps,
  title,
  subtitle,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1 mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium ${
                i + 1 <= step
                  ? "border-[#1295f1] text-[#1295f1]"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-10 h-px mx-1 ${
                  i + 1 < step ? "bg-[#1295f1]" : "bg-gray-300"
                }`}
                style={{ borderTop: "1px dashed", borderColor: i + 1 < step ? "#1295f1" : "#d1d5db" }}
              />
            )}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
