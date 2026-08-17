"use client";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_L = 44;
const PAD_B = 24;

export interface CashFlowSeries {
  months: string[];
  income: number[];
  withdrawals: number[];
  pending: number[];
}

export default function CashFlowChart({ data }: { data: CashFlowSeries }) {
  const { months } = data;
  const max = Math.max(1, ...data.income, ...data.withdrawals, ...data.pending);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  function toPoints(values: number[]) {
    const stepX = (WIDTH - PAD_L) / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = PAD_L + i * stepX;
        const y = HEIGHT - PAD_B - (v / max) * (HEIGHT - PAD_B - 10);
        return `${x},${y}`;
      })
      .join(" ");
  }

  const series = [
    { key: "income", label: "Income", color: "#1ea43b", values: data.income },
    { key: "withdrawals", label: "Withdrawals", color: "#2f6fed", values: data.withdrawals },
    { key: "pending", label: "Pending", color: "#e09408", values: data.pending },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-[#6f7786]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-[220px]">
        {gridValues.map((g) => {
          const y = HEIGHT - PAD_B - (g / max) * (HEIGHT - PAD_B - 10);
          return (
            <g key={g}>
              <line x1={PAD_L} x2={WIDTH} y1={y} y2={y} stroke="#F1F2F4" strokeWidth={1} />
              <text x={0} y={y + 4} fontSize={9} fill="#9CA3AF">
                {g >= 1 ? `₦${g}M` : `₦0`}
              </text>
            </g>
          );
        })}

        {series.map((s) => (
          <polyline
            key={s.key}
            points={toPoints(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {series.map((s) =>
          s.values.map((v, i) => {
            const stepX = (WIDTH - PAD_L) / Math.max(1, s.values.length - 1);
            const x = PAD_L + i * stepX;
            const y = HEIGHT - PAD_B - (v / max) * (HEIGHT - PAD_B - 10);
            return <circle key={`${s.key}-${i}`} cx={x} cy={y} r={3} fill={s.color} />;
          }),
        )}

        {months.map((m, i) => {
          const stepX = (WIDTH - PAD_L) / Math.max(1, months.length - 1);
          const x = PAD_L + i * stepX;
          return (
            <text key={m} x={x} y={HEIGHT - 4} fontSize={10} fill="#9CA3AF" textAnchor="middle">
              {m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
