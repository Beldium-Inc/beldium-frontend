export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb- mt-10">
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
